import test from "node:test";
import assert from "node:assert/strict";

test("package root exports public data tag core API without browser globals", async () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;

  try {
    delete globalThis.window;
    delete globalThis.document;

    const api = await import("../src/index.js");

    assert.equal(typeof api.formatDataTagSampleValue, "function");
    assert.equal(typeof api.getDataTagSampleValueError, "function");
    assert.equal(typeof api.getDataTagFormatOptions, "function");
    assert.equal(api.formatDataTagSampleValue("candidate.examDate", "2026-11-28", "YYYY.MM.DD"), "2026.11.28");
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }

    if (previousDocument === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = previousDocument;
    }
  }
});

test("core subpath exports the same core API", async () => {
  const api = await import("../src/core/index.js");

  assert.equal(api.renderDataTagFormatPreview("time", "A h:mm"), "오전 8:40");
});
