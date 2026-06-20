import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDataTagSampleValueErrors,
  formatDataTagSampleValue,
  formatDataTagValue,
  getDataTagSampleValueConstraint,
  getDataTagSampleValueError,
  hasDataTagSampleValueErrors,
  normalizeDataTagSampleValue,
} from "../src/core/index.js";

test("exam date sample values are canonical yyyy-mm-dd values", () => {
  assert.equal(getDataTagSampleValueError("candidate.examDate", "2026-11-28"), "");
  assert.match(getDataTagSampleValueError("candidate.examDate", "2026.11.28"), /yyyy-mm-dd/);
  assert.match(getDataTagSampleValueError("candidate.examDate", "2026-02-30"), /yyyy-mm-dd/);
  assert.match(getDataTagSampleValueError("candidate.examDate", "0999-12-31"), /yyyy-mm-dd/);
  assert.equal(getDataTagSampleValueError("candidate.examDate", ""), "");
});

test("exam time sample values are canonical hh:mm values", () => {
  assert.equal(getDataTagSampleValueError("candidate.examStartTime", "09:00"), "");
  assert.equal(getDataTagSampleValueError("candidate.examEndTime", "23:59"), "");
  assert.match(getDataTagSampleValueError("candidate.examStartTime", "9:00"), /hh:mm/);
  assert.match(getDataTagSampleValueError("candidate.examStartTime", "24:00"), /hh:mm/);
  assert.match(getDataTagSampleValueError("candidate.examEndTime", "11:60"), /hh:mm/);
});

test("birth date supports display formatting but not sample validation constraints", () => {
  assert.equal(getDataTagSampleValueConstraint("candidate.birthDate"), null);
  assert.equal(getDataTagSampleValueError("candidate.birthDate", "2006.01.02"), "");
  assert.equal(formatDataTagSampleValue("candidate.birthDate", "2006-01-02", "YY.MM.DD"), "06.01.02");
});

test("date and time format tokens are replaced from canonical values", () => {
  assert.equal(formatDataTagSampleValue("candidate.examDate", "2026-11-28", "YYYY.MM.DD (ddd)"), "2026.11.28 (토)");
  assert.equal(formatDataTagSampleValue("candidate.examDate", "2026-11-28", "YYYY년 M월 D일 dddd"), "2026년 11월 28일 토요일");
  assert.equal(formatDataTagSampleValue("candidate.examStartTime", "09:00", "A h:mm"), "오전 9:00");
  assert.equal(formatDataTagSampleValue("candidate.examEndTime", "13:05", "A hh시 mm분"), "오후 01시 05분");
});

test("formatting returns original values when format or canonical source is invalid", () => {
  assert.equal(formatDataTagValue("date", "2026-11-28", ""), "2026-11-28");
  assert.equal(formatDataTagValue("time", "09:00", ""), "09:00");
  assert.equal(formatDataTagValue("date", "2026.11.28", "YYYY.MM.DD"), "2026.11.28");
  assert.equal(formatDataTagValue("time", "9:00", "HH:mm"), "9:00");
  assert.equal(formatDataTagValue("unknown", "abc", "YYYY"), "abc");
});

test("sample values are trimmed only when a constraint applies", () => {
  assert.equal(normalizeDataTagSampleValue("candidate.examDate", " 2026-11-28 "), "2026-11-28");
  assert.equal(normalizeDataTagSampleValue("candidate.name", " 홍길동 "), " 홍길동 ");
});

test("sample value error maps only include non-empty invalid values", () => {
  const errors = buildDataTagSampleValueErrors(
    [
      { key: "candidate.examDate", type: "date" },
      { key: "candidate.examStartTime", type: "time" },
      { key: "candidate.name", type: "string" },
    ],
    {
      "candidate.examDate": "2026.11.28",
      "candidate.examStartTime": "",
      "candidate.name": "",
    },
  );

  assert.deepEqual(Object.keys(errors), ["candidate.examDate"]);
  assert.equal(hasDataTagSampleValueErrors(errors), true);
  assert.equal(hasDataTagSampleValueErrors({}), false);
});

test("sample value constraints are frozen value objects", () => {
  const constraint = getDataTagSampleValueConstraint("candidate.examDate");

  assert.equal(Object.isFrozen(constraint), true);
  assert.equal(constraint.placeholder, "2026-11-28");
});
