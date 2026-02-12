#!/usr/bin/env node
/* eslint-disable no-console */
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const PORT = Number(process.env.VEJICE_PROXY_PORT || process.env.PORT || 5051);
const TARGET_URL =
  process.env.VEJICE_PROXY_TARGET_URL || "https://gpu-proc1.cjvt.si/popravljalnik-api/postavi_vejice";
const TIMEOUT = Number(process.env.VEJICE_PROXY_TIMEOUT_MS || 15000);
const BODY_LIMIT_BYTES = Number(process.env.VEJICE_PROXY_BODY_LIMIT_BYTES || 256 * 1024);
const API_KEY = process.env.VEJICE_PROXY_TARGET_API_KEY || process.env.VEJICE_API_KEY || "";
const allowedOriginsRaw = process.env.VEJICE_PROXY_ALLOWED_ORIGINS || "*";
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

function isOriginAllowed(originHeader) {
  if (ALLOW_ALL_ORIGINS) return true;
  if (!originHeader) return true;
  return allowedOrigins.some((allowed) => allowed.toLowerCase() === originHeader.toLowerCase());
}

function applyCors(res, originHeader) {
  const allowedOrigin = resolveOrigin(originHeader);
  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "false");
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

async function forwardRequest(body) {
  if (!API_KEY) {
    const error = new Error("Vejice proxy API key is not configured");
    error.status = 500;
    throw error;
  }
  const upstream = await axios.post(TARGET_URL, body, {
    timeout: TIMEOUT,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
    validateStatus: () => true,
  });
  return upstream;
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

  if (req.method === "POST" && req.url === "/api/postavi_vejice") {
    try {
      const body = await readRequestBody(req);
      const upstream = await forwardRequest(body);
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
      console.error("[vejice-api-proxy]", err.message, err.response?.data || "");
      const status = err.status || (err.response && err.response.status) || 500;
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Vejice upstream unavailable" }));
    }
    return;
  }

  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "Not found" }));
}

function createServer() {
  const keyPath = process.env.VEJICE_PROXY_SSL_KEY_PATH;
  const certPath = process.env.VEJICE_PROXY_SSL_CERT_PATH;
  if (keyPath && certPath) {
    try {
      const key = fs.readFileSync(path.resolve(keyPath));
      const cert = fs.readFileSync(path.resolve(certPath));
      return https.createServer({ key, cert }, handler);
    } catch (err) {
      console.warn("[vejice-api-proxy] Failed to load TLS certs, falling back to HTTP", err.message);
      return http.createServer(handler);
    }
  }
  return http.createServer(handler);
}

const server = createServer();
server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.log(`[vejice-api-proxy] Port ${PORT} already in use. Reusing existing proxy.`);
    process.exit(0);
  }
  console.error("[vejice-api-proxy] Server error:", err.message);
  process.exit(1);
});
server.listen(PORT, () => {
  console.log(`[vejice-api-proxy] Listening on port ${PORT}`);
  console.log(`[vejice-api-proxy] Forwarding to configured upstream`);
  if (!ALLOW_ALL_ORIGINS) {
    console.log(`[vejice-api-proxy] Allowed origins: ${allowedOrigins.join(", ")}`);
  }
});
