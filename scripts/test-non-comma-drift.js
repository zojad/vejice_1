#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const https = require("https");
const axios = require("axios");
require("dotenv").config();
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

function parseArgs(argv) {
  const args = {
    input: "",
    url: process.env.VEJICE_API_URL || "https://127.0.0.1:4001/api/postavi_vejice",
    apiKey: process.env.VEJICE_API_KEY || "",
    timeoutMs: 15000,
    attempts: 2,
    concurrency: 4,
    max: 0,
    out: "",
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" || arg === "-i") args.input = argv[++i] || "";
    else if (arg === "--url") args.url = argv[++i] || args.url;
    else if (arg === "--api-key") args.apiKey = argv[++i] || "";
    else if (arg === "--timeout") args.timeoutMs = Number(argv[++i] || args.timeoutMs);
    else if (arg === "--attempts") args.attempts = Number(argv[++i] || args.attempts);
    else if (arg === "--concurrency") args.concurrency = Number(argv[++i] || args.concurrency);
    else if (arg === "--max") args.max = Number(argv[++i] || 0);
    else if (arg === "--out") args.out = argv[++i] || "";
    else if (arg === "--help" || arg === "-h") args.help = true;
  }
  return args;
}

function printHelp() {
  console.log(`
Batch-test Vejice API for non-comma drift.

Usage:
  node scripts/test-non-comma-drift.js --input sentences.txt [options]

Options:
  -i, --input <path>        Input file (txt/json/jsonl)
      --url <url>           API endpoint (default: VEJICE_API_URL or local proxy)
      --api-key <key>       Optional API key (X-API-KEY header)
      --timeout <ms>        Request timeout (default: 15000)
      --attempts <n>        Attempts per sentence (default: 2)
      --concurrency <n>     Parallel requests (default: 4)
      --max <n>             Max sentences from input (default: all)
      --out <path>          Save full JSON report
      --help                Show help

Input file formats:
  .txt   => one sentence per line
  .json  => array of strings OR { sentences: [...] }
  .jsonl => one JSON object/string per line
`);
}

function normalizeInputSentences(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const raw = fs.readFileSync(inputPath, "utf8");
  let values = [];

  if (ext === ".json") {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) values = parsed;
    else if (parsed && Array.isArray(parsed.sentences)) values = parsed.sentences;
  } else if (ext === ".jsonl") {
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    values = lines.map((line) => {
      try {
        const parsed = JSON.parse(line);
        if (typeof parsed === "string") return parsed;
        if (parsed && typeof parsed.text === "string") return parsed.text;
        if (parsed && typeof parsed.sentence === "string") return parsed.sentence;
        return "";
      } catch (_err) {
        return line;
      }
    });
  } else {
    values = raw.split(/\r?\n/);
  }

  return [...new Set(values.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean))];
}

function pickCorrectedText(fallback, payload = {}) {
  const targetFromTokens = tokensToSentenceText(
    Array.isArray(payload.target_tokens)
      ? payload.target_tokens
      : Array.isArray(payload.target)
        ? payload.target
        : Array.isArray(payload.targetTokens)
          ? payload.targetTokens
          : []
  );
  const correctionArray = Array.isArray(payload.corrections) ? payload.corrections : [];
  const applyCorrections = Array.isArray(payload.apply_corrections) ? payload.apply_corrections : [];
  const firstApplyCorrection = applyCorrections[0];
  const candidates = [
    payload.popravljeno_besedilo,
    payload.corrected_text,
    payload.target_text,
    targetFromTokens,
    payload.popravki && Array.isArray(payload.popravki) ? payload.popravki[0]?.predlog : undefined,
    correctionArray[0]?.suggested_text,
    firstApplyCorrection && typeof firstApplyCorrection === "object"
      ? firstApplyCorrection.suggested_text
      : undefined,
  ];
  const chosen = candidates
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .find((v) => Boolean(v));
  return chosen || fallback;
}

function tokensToSentenceText(tokens = []) {
  if (!Array.isArray(tokens) || !tokens.length) return "";
  return tokens
    .map((token) => {
      if (typeof token === "string") return token;
      if (!token || typeof token !== "object") return "";
      const base =
        token.token ??
        token.text ??
        token.form ??
        token.value ??
        token.surface ??
        token.word ??
        "";
      if (typeof base !== "string" || !base.length) return "";
      const trailing =
        token.whitespace ??
        token.trailing_ws ??
        token.trailingWhitespace ??
        token.after ??
        token.space ??
        "";
      if (typeof trailing === "string" && trailing.length && !/\s$/.test(base) && !base.endsWith(trailing)) {
        return `${base}${trailing}`;
      }
      return base;
    })
    .join("");
}

function unprotectText(text) {
  if (typeof text !== "string") return "";
  return text.replace(/\uE000/g, ".");
}

function normalizeForComparison(text) {
  if (typeof text !== "string") return "";
  let normalized = text;
  try {
    normalized = normalized.normalize("NFKD");
  } catch (_err) {
    // ignore
  }
  return normalized
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\uFFFD/g, "")
    .replace(/\u00EF\u00BF\u00BD/g, "")
    .replace(/\s+/g, "")
    .replace(/,/g, "")
    .replace(/[()]/g, "");
}

function onlyCommasChangedByAppRule(original, corrected) {
  return normalizeForComparison(original) === normalizeForComparison(corrected);
}

function onlyCommasChangedStrict(original, corrected) {
  const stripCommas = (value) => (typeof value === "string" ? value.replace(/,/g, "") : "");
  return stripCommas(original) === stripCommas(corrected);
}

function buildRequestData(sentence) {
  return {
    vhodna_poved: sentence,
    hkratne_napovedi: true,
    ne_označi_imen: false,
    prepričanost_modela: 0.08,
  };
}

function makeAxiosConfig(args) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (args.apiKey) headers["X-API-KEY"] = args.apiKey;

  const config = {
    headers,
    timeout: Math.max(1000, Number(args.timeoutMs) || 15000),
    validateStatus: () => true,
  };
  if (/^https:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//i.test(args.url || "")) {
    config.httpsAgent = new https.Agent({ rejectUnauthorized: false });
  }
  return config;
}

async function requestCorrection(sentence, args, axiosConfig) {
  const attempts = Math.max(1, Number(args.attempts) || 1);
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await axios.post(args.url, buildRequestData(sentence), axiosConfig);
      if (response.status >= 200 && response.status < 300) {
        const payload = response.data && typeof response.data === "object" ? response.data : {};
        const correctedText = unprotectText(pickCorrectedText(sentence, payload));
        return {
          ok: true,
          status: response.status,
          payload,
          correctedText,
          attempt,
        };
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      lastError = err;
    }
  }
  return {
    ok: false,
    status: null,
    error: String(lastError?.message || lastError || "unknown-error"),
  };
}

async function runWithConcurrency(items, concurrency, worker) {
  const safeConcurrency = Math.max(1, Math.min(concurrency, items.length || 1));
  const out = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: safeConcurrency }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      out[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return out;
}

function classifyResult(original, corrected) {
  const changed = corrected !== original;
  const commaOnlyApp = onlyCommasChangedByAppRule(original, corrected);
  const commaOnlyStrict = onlyCommasChangedStrict(original, corrected);
  return {
    changed,
    commaOnlyApp,
    commaOnlyStrict,
    nonCommaDriftByAppRule: changed && !commaOnlyApp,
    nonCommaDriftStrict: changed && !commaOnlyStrict,
  };
}

function topExamples(items, predicate, limit = 15) {
  return items.filter(predicate).slice(0, limit).map((item) => ({
    index: item.index,
    sentence: item.sentence,
    corrected: item.corrected,
    status: item.status,
    attempt: item.attempt,
  }));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  if (!args.input) {
    console.error("Missing --input. Use --help for usage.");
    process.exit(1);
  }
  const inputPath = path.resolve(process.cwd(), args.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }
  const allSentences = normalizeInputSentences(inputPath);
  const max = Number(args.max) > 0 ? Number(args.max) : allSentences.length;
  const sentences = allSentences.slice(0, max);
  if (!sentences.length) {
    console.error("No usable sentences found.");
    process.exit(1);
  }
  if (!args.url) {
    console.error("Missing API URL. Pass --url or set VEJICE_API_URL.");
    process.exit(1);
  }

  const axiosConfig = makeAxiosConfig(args);
  const startedAt = Date.now();
  console.log(`Testing ${sentences.length} sentences`);
  console.log(`Endpoint: ${args.url}`);
  console.log(`Concurrency: ${args.concurrency} | Attempts: ${args.attempts}`);

  let done = 0;
  const rawResults = await runWithConcurrency(
    sentences,
    Math.max(1, Number(args.concurrency) || 4),
    async (sentence, index) => {
      const api = await requestCorrection(sentence, args, axiosConfig);
      done++;
      if (done % 25 === 0 || done === sentences.length) {
        console.log(`Progress: ${done}/${sentences.length}`);
      }
      if (!api.ok) {
        return {
          index,
          sentence,
          ok: false,
          status: api.status,
          error: api.error,
        };
      }
      const corrected = api.correctedText;
      const cls = classifyResult(sentence, corrected);
      return {
        index,
        sentence,
        corrected,
        ok: true,
        status: api.status,
        attempt: api.attempt,
        ...cls,
      };
    }
  );

  const successes = rawResults.filter((r) => r.ok);
  const failures = rawResults.filter((r) => !r.ok);
  const changed = successes.filter((r) => r.changed);
  const unchanged = successes.filter((r) => !r.changed);
  const nonCommaDriftApp = successes.filter((r) => r.nonCommaDriftByAppRule);
  const nonCommaDriftStrict = successes.filter((r) => r.nonCommaDriftStrict);
  const commaOnlyApp = successes.filter((r) => r.changed && r.commaOnlyApp);
  const commaOnlyStrict = successes.filter((r) => r.changed && r.commaOnlyStrict);

  const durationMs = Date.now() - startedAt;
  const pct = (n, d) => (d > 0 ? ((n * 100) / d).toFixed(2) : "0.00");
  const summary = {
    timestamp: new Date().toISOString(),
    endpoint: args.url,
    inputFile: inputPath,
    totalRequested: sentences.length,
    ok: successes.length,
    failed: failures.length,
    changed: changed.length,
    unchanged: unchanged.length,
    commaOnlyAppRule: commaOnlyApp.length,
    nonCommaDriftByAppRule: nonCommaDriftApp.length,
    commaOnlyStrict: commaOnlyStrict.length,
    nonCommaDriftStrict: nonCommaDriftStrict.length,
    percentages: {
      nonCommaDriftByAppRule_over_changed: Number(pct(nonCommaDriftApp.length, changed.length)),
      nonCommaDriftStrict_over_changed: Number(pct(nonCommaDriftStrict.length, changed.length)),
      failures_over_total: Number(pct(failures.length, sentences.length)),
    },
    durationMs,
  };

  console.log("\n=== SUMMARY ===");
  console.log(summary);

  const examples = {
    nonCommaDriftByAppRule: topExamples(rawResults, (r) => r.ok && r.nonCommaDriftByAppRule),
    nonCommaDriftStrict: topExamples(rawResults, (r) => r.ok && r.nonCommaDriftStrict),
    failures: failures.slice(0, 20),
  };

  if (examples.nonCommaDriftByAppRule.length) {
    console.log("\nExamples (app-rule non-comma drift):");
    for (const ex of examples.nonCommaDriftByAppRule.slice(0, 5)) {
      console.log(`- [${ex.index}] ${ex.sentence}`);
      console.log(`  -> ${ex.corrected}`);
    }
  }

  if (args.out) {
    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(
      outPath,
      JSON.stringify(
        {
          summary,
          examples,
          results: rawResults,
        },
        null,
        2
      ),
      "utf8"
    );
    console.log(`\nSaved report: ${outPath}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
