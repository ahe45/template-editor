import test from "node:test";
import assert from "node:assert/strict";

import {
  dateFormatType,
  getDataTagDefinitionKey,
  getDataTagFormatType,
  isDataTagFormatSupported,
  timeFormatType,
} from "../src/core/index.js";

test("data tag format type resolves known date and time keys", () => {
  assert.equal(dateFormatType, "date");
  assert.equal(timeFormatType, "time");
  assert.equal(getDataTagFormatType("candidate.examDate"), "date");
  assert.equal(getDataTagFormatType("candidate.birthDate"), "date");
  assert.equal(getDataTagFormatType("candidate.examStartTime"), "time");
  assert.equal(getDataTagFormatType("candidate.examEndTime"), "time");
  assert.equal(getDataTagFormatType("candidate.name"), "");
});

test("data tag format type resolves definition type and key aliases", () => {
  assert.equal(getDataTagDefinitionKey({ dataKey: "candidate.examDate" }), "candidate.examDate");
  assert.equal(getDataTagDefinitionKey({ token: "candidate.examStartTime" }), "candidate.examStartTime");
  assert.equal(getDataTagFormatType({ key: "custom.date", type: "DATE" }), "date");
  assert.equal(getDataTagFormatType({ key: "custom.time", type: "time" }), "time");
  assert.equal(isDataTagFormatSupported({ key: "candidate.name", type: "string" }), false);
});
