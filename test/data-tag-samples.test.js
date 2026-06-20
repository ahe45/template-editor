import test from "node:test";
import assert from "node:assert/strict";

import {
  applyDataTagSampleValuesToDefinitions,
  areDataTagEmptyValueDataEqual,
  areDataTagSampleValuesEqual,
  buildDefaultDataTagEmptyValueData,
  buildDefaultDataTagSampleValues,
  createDataTagSettingsPayload,
  loadDataTagEmptyValueData,
  loadDataTagSampleValues,
  normalizeDataTagEmptyValueData,
  normalizeDataTagSampleValues,
  saveDataTagEmptyValueData,
  saveDataTagSampleValues,
} from "../src/core/index.js";

const definitions = [
  { example: "홍길동", key: "candidate.name", label: "이름" },
  { example: "101호", key: "candidate.roomName", label: "고사실명" },
  { example: "사진", key: "candidate.photo", label: "수험생 사진" },
  { example: "2026-11-28", key: "candidate.examDate", label: "시험날짜", type: "date" },
  { example: "09:00", key: "candidate.examStartTime", label: "시작시간", type: "time" },
];

test("sample and empty value defaults preserve editable blanks", () => {
  assert.deepEqual(buildDefaultDataTagSampleValues(definitions), {
    "candidate.examDate": "2026-11-28",
    "candidate.examStartTime": "09:00",
    "candidate.name": "홍길동",
    "candidate.photo": "사진",
    "candidate.roomName": "101호",
  });
  assert.deepEqual(buildDefaultDataTagEmptyValueData(definitions), {
    "candidate.examDate": "시험날짜",
    "candidate.examStartTime": "시작시간",
    "candidate.name": "이름",
    "candidate.photo": "사진",
    "candidate.roomName": "고사실명",
  });
  assert.equal(normalizeDataTagSampleValues(definitions, { "candidate.name": "" })["candidate.name"], "");
  assert.equal(normalizeDataTagEmptyValueData(definitions, { "candidate.roomName": "빈 고사실" })["candidate.roomName"], "빈 고사실");
});

test("sample value normalization trims constrained date and time values", () => {
  const normalized = normalizeDataTagSampleValues(definitions, {
    "candidate.examDate": " 2026-11-28 ",
    "candidate.examStartTime": " 09:00 ",
    "candidate.name": " 홍길동 ",
  });

  assert.equal(normalized["candidate.examDate"], "2026-11-28");
  assert.equal(normalized["candidate.examStartTime"], "09:00");
  assert.equal(normalized["candidate.name"], " 홍길동 ");
});

test("data tag settings payload contains sample and empty value data", () => {
  const payload = createDataTagSettingsPayload(definitions, {
    emptyValueData: { "candidate.name": "빈 이름" },
    sampleData: { "candidate.name": "김철수" },
  });

  assert.equal(payload.sampleData["candidate.name"], "김철수");
  assert.equal(payload.emptyValueData["candidate.name"], "빈 이름");
});

test("sample values can be applied back to tag definitions", () => {
  const applied = applyDataTagSampleValuesToDefinitions(definitions, {
    "candidate.name": "김철수",
  });

  assert.equal(applied.find((definition) => definition.key === "candidate.name").example, "김철수");
  assert.equal(definitions.find((definition) => definition.key === "candidate.name").example, "홍길동");
});

test("sample and empty value equality compares normalized data", () => {
  assert.equal(areDataTagSampleValuesEqual(definitions, { "candidate.name": "홍길동" }, {}), true);
  assert.equal(areDataTagSampleValuesEqual(definitions, { "candidate.name": "김철수" }, {}), false);
  assert.equal(areDataTagEmptyValueDataEqual(definitions, { "candidate.name": "이름" }, {}), true);
  assert.equal(areDataTagEmptyValueDataEqual(definitions, { "candidate.name": "빈 이름" }, {}), false);
});

test("load and save helpers are safe without browser globals", () => {
  const previousWindow = globalThis.window;
  const previousCustomEvent = globalThis.CustomEvent;

  try {
    delete globalThis.window;
    delete globalThis.CustomEvent;

    assert.equal(loadDataTagSampleValues(definitions)["candidate.name"], "홍길동");
    assert.equal(loadDataTagEmptyValueData(definitions)["candidate.name"], "이름");
    assert.equal(saveDataTagSampleValues(definitions, { "candidate.name": "김철수" })["candidate.name"], "김철수");
    assert.equal(saveDataTagEmptyValueData(definitions, { "candidate.name": "빈 이름" })["candidate.name"], "빈 이름");
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }

    if (previousCustomEvent === undefined) {
      delete globalThis.CustomEvent;
    } else {
      globalThis.CustomEvent = previousCustomEvent;
    }
  }
});
