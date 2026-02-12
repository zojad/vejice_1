#!/usr/bin/env node
/* eslint-disable no-console */
const { spawn } = require("child_process");

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const args = ["webpack", "serve", "--mode", "development"];

let sawAddrInUse = false;

const child = spawn(command, args, {
  stdio: ["inherit", "pipe", "pipe"],
  env: process.env,
});

function handleChunk(chunk, target) {
  const text = chunk.toString();
  target.write(text);
  if (text.includes("EADDRINUSE") && text.includes("4001")) {
    sawAddrInUse = true;
  }
}

child.stdout.on("data", (chunk) => handleChunk(chunk, process.stdout));
child.stderr.on("data", (chunk) => handleChunk(chunk, process.stderr));

child.on("error", (err) => {
  console.error("[dev-server] Failed to start:", err.message);
  process.exit(1);
});

child.on("close", (code) => {
  if (sawAddrInUse) {
    console.log("[dev-server] Port 4001 already in use. Reusing existing dev server.");
    process.exit(0);
  }
  process.exit(code || 0);
});

