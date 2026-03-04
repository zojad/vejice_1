#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const INCLUDE_DIRS = ["src", "proxy", "scripts"];
const INCLUDE_FILES = ["webpack.config.js", "package.json"];
const INCLUDE_EXTENSIONS = new Set([".js", ".html", ".css", ".xml", ".json", ".md"]);
const MAX_LINE_LENGTH = 5000;

const suspiciousMojibake = /(Ã.|Â.|â€|â€“|â€”|â€œ|â€|â€™|â€¦|�)/u;

function walk(dirPath, out = []) {
  if (!fs.existsSync(dirPath)) return out;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === "docs") {
        continue;
      }
      walk(fullPath, out);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (INCLUDE_EXTENSIONS.has(ext)) {
      out.push(fullPath);
    }
  }
  return out;
}

function toRel(p) {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}

function checkFile(filePath) {
  if (path.resolve(filePath) === path.resolve(__filename)) {
    return [];
  }
  const content = fs.readFileSync(filePath, "utf8");
  const findings = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length > MAX_LINE_LENGTH) {
      findings.push({
        type: "line-too-long",
        line: i + 1,
        detail: `length=${line.length} (max=${MAX_LINE_LENGTH})`,
      });
    }
    if (suspiciousMojibake.test(line)) {
      findings.push({
        type: "suspected-mojibake",
        line: i + 1,
        detail: line.slice(0, 140),
      });
    }
  }
  return findings;
}

function main() {
  const files = [];
  for (const dir of INCLUDE_DIRS) {
    walk(path.join(ROOT, dir), files);
  }
  for (const file of INCLUDE_FILES) {
    const fullPath = path.join(ROOT, file);
    if (fs.existsSync(fullPath)) files.push(fullPath);
  }

  const allFindings = [];
  for (const filePath of files) {
    const fileFindings = checkFile(filePath);
    for (const finding of fileFindings) {
      allFindings.push({ file: toRel(filePath), ...finding });
    }
  }

  if (!allFindings.length) {
    console.log("Encoding check passed.");
    process.exit(0);
  }

  console.error("Encoding check failed:");
  for (const finding of allFindings) {
    console.error(
      `- ${finding.file}:${finding.line} [${finding.type}] ${finding.detail}`
    );
  }
  process.exit(1);
}

main();
