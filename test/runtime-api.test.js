import test from "node:test";
import assert from "node:assert/strict";

import {
  createTemplateEditorState,
  getTemplateEditorRuntime,
  mountTemplateEditor,
  normalizeTemplateTagDefinition,
} from "../src/runtime/index.js";

test("runtime subpath imports without browser globals", () => {
  assert.equal(typeof getTemplateEditorRuntime().createTemplateEditor, "function");
  assert.equal(typeof createTemplateEditorState, "function");
  assert.equal(createTemplateEditorState().historyEntries.length, 0);
});

test("runtime tag definitions normalize labels and editor tokens", () => {
  const definition = normalizeTemplateTagDefinition({ key: "candidate.name", label: "이름" });

  assert.equal(definition.dataKey, "candidate.name");
  assert.equal(definition.editorToken, "#이름");
});

test("mountTemplateEditor fails clearly outside the browser", () => {
  assert.throws(
    () => mountTemplateEditor({ root: null }),
    /requires a browser Document|valid root\/container/,
  );
});
