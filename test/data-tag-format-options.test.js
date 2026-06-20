import test from "node:test";
import assert from "node:assert/strict";

import {
  findDataTagDefinitionByKey,
  getDataTagFormatInputError,
  getDataTagFormatOptions,
  getDataTagFormatTokenGuides,
  isDataTagFormatValid,
  normalizeDataTagFormat,
  renderDataTagFormatPreview,
} from "../src/core/index.js";

test("format options expose date and time presets and token guides", () => {
  assert.ok(getDataTagFormatOptions("date").length >= 18);
  assert.ok(getDataTagFormatOptions("time").length >= 12);
  assert.ok(getDataTagFormatTokenGuides("date").some((item) => item.token === "YYYY"));
  assert.ok(getDataTagFormatTokenGuides("time").some((item) => item.token === "A"));
  assert.deepEqual(getDataTagFormatOptions("unknown"), []);
});

test("format input validation rejects unsafe patterns", () => {
  assert.equal(getDataTagFormatInputError("date", "YYYY.MM.DD (dddd)"), "");
  assert.equal(isDataTagFormatValid("date", "YYYY.MM.DD"), true);
  assert.equal(normalizeDataTagFormat("date", " YYYY.MM.DD "), "YYYY.MM.DD");
  assert.match(getDataTagFormatInputError("date", "YYYY.QQ.DD"), /지원하지 않는 토큰/);
  assert.match(getDataTagFormatInputError("date", "YYYY.MM.DD|default:x"), /사용할 수 없는 문자/);
  assert.match(getDataTagFormatInputError("date", "plain text"), /하나 이상의 토큰/);
  assert.match(getDataTagFormatInputError("unknown", "YYYY"), /지원하지 않는 데이터 형식/);
  assert.match(getDataTagFormatInputError("date", "Y".repeat(61)), /60자/);
});

test("format preview renders canonical date and time previews", () => {
  assert.equal(renderDataTagFormatPreview("date", "YYYY.MM.DD (dddd)"), "2026.03.28 (토요일)");
  assert.equal(renderDataTagFormatPreview("date", ""), "2026-03-28");
  assert.equal(renderDataTagFormatPreview("time", "A h:mm"), "오전 8:40");
  assert.equal(renderDataTagFormatPreview("time", ""), "08:40");
  assert.equal(renderDataTagFormatPreview("date", "YYYY.QQ.DD"), "");
});

test("format definition lookup works with portable grouped catalogs", () => {
  const catalog = {
    groups: [
      {
        tags: [
          { key: "candidate.examDate", label: "시험날짜", type: "date" },
        ],
      },
    ],
  };

  assert.equal(findDataTagDefinitionByKey(catalog, "candidate.examDate").label, "시험날짜");
  assert.equal(findDataTagDefinitionByKey(catalog, "candidate.name"), null);
});
