import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = mkdtempSync(path.join(tmpdir(), "examlist-template-editor-consumer-"));
const nodeCommand = process.execPath;
const npmExecPath = process.env.npm_execpath || "";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: tempRoot,
    encoding: "utf8",
    stdio: "pipe",
    ...options,
  });

  if (result.status !== 0) {
    const detail = [
      `Command failed: ${command} ${args.join(" ")}`,
      result.error?.message,
      result.stdout,
      result.stderr,
    ].filter(Boolean).join("\n");

    throw new Error(detail);
  }

  return result;
}

function runNpm(args) {
  if (npmExecPath) {
    return run(nodeCommand, [npmExecPath, ...args]);
  }

  return run(process.platform === "win32" ? "npm.cmd" : "npm", args, {
    shell: process.platform === "win32",
  });
}

try {
  runNpm(["init", "-y"]);
  runNpm(["install", packageRoot, "--no-audit", "--no-fund"]);

  writeFileSync(
    path.join(tempRoot, "consumer-check.mjs"),
    `
      import {
        formatDataTagSampleValue,
        getDataTagSampleValueError,
      } from "examlist-template-editor";
      import { renderDataTagFormatPreview } from "examlist-template-editor/core";

      const formatted = formatDataTagSampleValue("candidate.examDate", "2026-11-28", "YYYY.MM.DD (ddd)");
      const error = getDataTagSampleValueError("candidate.examStartTime", "9:00");
      const preview = renderDataTagFormatPreview("time", "A h:mm");

      if (formatted !== "2026.11.28 (토)") {
        throw new Error("Unexpected formatted value: " + formatted);
      }

      if (!/hh:mm/.test(error)) {
        throw new Error("Expected time validation error: " + error);
      }

      if (preview !== "오전 8:40") {
        throw new Error("Unexpected preview value: " + preview);
      }
    `,
    "utf8",
  );

  run(nodeCommand, ["consumer-check.mjs"]);
  console.log(`Consumer install verification passed in ${tempRoot}`);
} finally {
  const resolvedTempRoot = path.resolve(tempRoot);
  const resolvedOsTemp = path.resolve(tmpdir());

  if (resolvedTempRoot.startsWith(resolvedOsTemp)) {
    rmSync(resolvedTempRoot, { force: true, recursive: true });
  }
}
