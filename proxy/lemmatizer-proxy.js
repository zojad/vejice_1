#!/usr/bin/env node
/* eslint-disable no-console */
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const PORT = Number(process.env.LEMMAS_PROXY_PORT || process.env.PORT || 5050);
const TARGET_URL =
  process.env.LEMMAS_PROXY_TARGET_URL || process.env.VEJICE_LEMMAS_URL || "";
const TIMEOUT = Number(process.env.LEMMAS_PROXY_TIMEOUT_MS || 10000);
const BODY_LIMIT_BYTES = Number(process.env.LEMMAS_PROXY_BODY_LIMIT_BYTES || 256 * 1024);
const API_KEY = process.env.LEMMAS_PROXY_TARGET_API_KEY || process.env.VEJICE_API_KEY || "";
const SHARED_TOKEN = (process.env.LEMMAS_PROXY_SHARED_TOKEN || "").trim();
const SHARED_TOKEN_HEADER = process.env.LEMMAS_PROXY_SHARED_TOKEN_HEADER || "x-lemmas-token";
const allowedOriginsRaw = process.env.LEMMAS_PROXY_ALLOWED_ORIGINS || "*";
const allowedOrigins = allowedOriginsRaw
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const ALLOW_ALL_ORIGINS = allowedOrigins.includes("*");

function resolveOrigin(originHeader) {
  if (ALLOW_ALL_ORIGINS) return "*";
  if (!originHeader) return allowedOrigins[0] || "";
  const found = allowedOrigins.find((allowed) => allowed.toLowerCase() === originHeader.toLowerCase());
  return found || "";
}

function applyCors(res, originHeader) {
  const allowedOrigin = resolveOrigin(originHeader);
  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    `Content-Type, Authorization, X-Requested-With, ${SHARED_TOKEN_HEADER}`
  );
  res.setHeader("Access-Control-Allow-Credentials", "false");
}

function isOriginAllowed(originHeader) {
  if (ALLOW_ALL_ORIGINS) return true;
  if (!originHeader) return true;
  return allowedOrigins.some((allowed) => allowed.toLowerCase() === originHeader.toLowerCase());
}

function isAuthorized(req) {
  if (!SHARED_TOKEN) return true;
  const headerValue = req.headers[SHARED_TOKEN_HEADER] || req.headers[SHARED_TOKEN_HEADER.toLowerCase()];
  return typeof headerValue === "string" && headerValue === SHARED_TOKEN;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > BODY_LIMIT_BYTES) {
        reject(new Error("Request entity too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error("Invalid JSON payload"));
      }
    });
    req.on("error", (err) => reject(err));
  });
}

async function forwardLemmaRequest(body) {
  if (!TARGET_URL) {
    const error = new Error("Upstream URL not configured");
    error.status = 500;
    throw error;
  }
  const payload = {
    lang: body.lang || "sl",
    text: body.text || body.source_text || body.vhodna_poved || "",
    ...(body.options ? { options: body.options } : {}),
  };
  if (!payload.text) {
    const error = new Error("Missing text property in payload");
    error.status = 400;
    throw error;
  }
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (API_KEY) {
    headers[process.env.LEMMAS_PROXY_TARGET_API_KEY_HEADER || "X-API-KEY"] = API_KEY;
  }
  const response = await axios.post(TARGET_URL, payload, {
    timeout: TIMEOUT,
    headers,
    validateStatus: () => true,
  });
  return response;
}

async function handler(req, res) {
  const requestOrigin = req.headers.origin || req.headers.Origin;
  applyCors(res, requestOrigin);
  if (!isOriginAllowed(requestOrigin)) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Origin not allowed" }));
    return;
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Content-Length": "0" });
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.method === "POST" && req.url === "/lemmas") {
    if (!isAuthorized(req)) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    try {
      const body = await readRequestBody(req);
      const upstream = await forwardLemmaRequest(body);
      const headers = upstream.headers || {};
      Object.keys(headers).forEach((key) => {
        const lower = key.toLowerCase();
        if (["content-type", "cache-control"].includes(lower)) {
          res.setHeader(key, headers[key]);
        }
      });
      res.statusCode = upstream.status || 200;
      const data = upstream.data;
      if (typeof data === "object") {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      } else {
        res.end(data);
      }
    } catch (err) {
      const status = err.status || (err.response && err.response.status) || 500;
      const message = err.message || "Proxy error";
      console.error("[lemmatizer-proxy]", message, err.response?.data || "");
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Lemmatizer upstream unavailable" }));
    }
    return;
  }

  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "Not found" }));
}

function createServer() {
  const keyPath = process.env.LEMMAS_PROXY_SSL_KEY_PATH;
  const certPath = process.env.LEMMAS_PROXY_SSL_CERT_PATH;
  if (keyPath && certPath) {
    try {
      const key = fs.readFileSync(path.resolve(keyPath));
      const cert = fs.readFileSync(path.resolve(certPath));
      return https.createServer({ key, cert }, handler);
    } catch (err) {
      console.warn("[lemmatizer-proxy] Failed to load TLS certs, falling back to HTTP", err.message);
      return http.createServer(handler);
    }
  }
  return http.createServer(handler);
}

const server = createServer();
server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.log(`[lemmatizer-proxy] Port ${PORT} already in use. Reusing existing proxy.`);
    process.exit(0);
  }
  console.error("[lemmatizer-proxy] Server error:", err.message);
  process.exit(1);
});
server.listen(PORT, () => {
  console.log(`[lemmatizer-proxy] Listening on port ${PORT}`);
  console.log(`[lemmatizer-proxy] Forwarding to ${TARGET_URL}`);
  if (!ALLOW_ALL_ORIGINS) {
    console.log(`[lemmatizer-proxy] Allowed origins: ${allowedOrigins.join(", ")}`);
  }
});
