"use strict";

/**
 * Small shared logging helper.
 *
 * Automation runs unattended, so output has to do two jobs: be readable in a
 * terminal, and be greppable in an Actions log. Every line is prefixed with a
 * fixed emoji marker so a failing step is obvious when scrolling a job log.
 */

const LEVELS = { info: "ℹ️", warn: "⚠️", error: "❌", ok: "✅", skip: "⏭️" };

function emit(level, args) {
  const marker = LEVELS[level] ?? "ℹ️";
  const stream = level === "error" ? console.error : console.log;
  stream(marker, ...args);
}

module.exports = {
  info: (...args) => emit("info", args),
  warn: (...args) => emit("warn", args),
  error: (...args) => emit("error", args),
  ok: (...args) => emit("ok", args),
  skip: (...args) => emit("skip", args),
};