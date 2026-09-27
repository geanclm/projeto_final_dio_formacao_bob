/**
 * DIO Explorer — Execution Logger Hook
 *
 * Triggered by Bob's PostToolUse event on write_file and apply_diff tools.
 * Logs DIO slash command executions to dio_explorer/logs/execucoes.log
 *
 * Registered in: .bob/settings.json
 * Event: PostToolUse — matcher: ^(write_file|apply_diff|search_and_replace|insert_content)$
 */

import fs from "node:fs";
import path from "node:path";

// Read Bob event payload from stdin
let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let payload;
try {
  payload = JSON.parse(raw);
} catch {
  // Non-JSON input — ignore silently
  process.exit(0);
}

const { tool_name, tool_input, cwd } = payload ?? {};

// Only log if a DIO-related file is being written
const filePath = String(tool_input?.path ?? "");
const isDioFile =
  filePath.includes("dio_explorer") ||
  filePath.includes(".bob/commands/trilha") ||
  filePath.includes(".bob/commands/desafio") ||
  filePath.includes(".bob/commands/certificado");

if (!isDioFile) {
  process.exit(0);
}

// Build log entry
const timestamp = new Date().toISOString();
const entry = `[${timestamp}] tool=${tool_name} file=${filePath}\n`;

// Ensure logs directory exists
const logsDir = path.join(cwd ?? process.cwd(), "dio_explorer", "logs");
try {
  fs.mkdirSync(logsDir, { recursive: true });
  fs.appendFileSync(path.join(logsDir, "execucoes.log"), entry, "utf-8");
} catch {
  // Fail silently — logging must never break the main flow
}

process.exit(0);
