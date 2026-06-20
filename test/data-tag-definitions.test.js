import test from "node:test";
import assert from "node:assert/strict";

import {
  findDataTagDefinitionByKey,
  flattenDataTagDefinitions,
  normalizeDataTagDefinition,
} from "../src/core/index.js";

test("data tag definitions normalize keys, labels, tokens, and examples", () => {
  assert.deepEqual(normalizeDataTagDefinition({ dataKey: "candidate.name", label: "", example: null }), {
    dataKey: "candidate.name",
    example: "",
    key: "candidate.name",
    label: "candidate.name",
    token: "candidate.name",
    type: "string",
  });
  assert.equal(normalizeDataTagDefinition({}), null);
});

test("data tag definitions flatten grouped and flat catalogs", () => {
  const grouped = flattenDataTagDefinitions({
    groups: [
      {
        tags: [
          { key: "candidate.name", label: "이름" },
          { token: "candidate.examDate", label: "시험날짜", type: "date" },
        ],
      },
    ],
  });

  const flat = flattenDataTagDefinitions([
    { key: "candidate.name", label: "이름" },
  ]);

  assert.equal(grouped.length, 2);
  assert.equal(grouped[1].key, "candidate.examDate");
  assert.equal(flat.length, 1);
});

test("data tag definitions find by canonical key", () => {
  const catalog = {
    tags: [
      { key: "candidate.name", label: "이름" },
      { dataKey: "candidate.examDate", label: "시험날짜", type: "date" },
    ],
  };

  assert.equal(findDataTagDefinitionByKey(catalog, "candidate.examDate").label, "시험날짜");
  assert.equal(findDataTagDefinitionByKey(catalog, ""), null);
  assert.equal(findDataTagDefinitionByKey(catalog, "missing"), null);
});
