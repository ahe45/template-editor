# Migration Notes

Source repository: `ExamList`

Source baseline commit: `132412d`

Initial extraction date: `2026-06-20`

## v0.1.0 Files

| Library file | Source file | Local changes |
| --- | --- | --- |
| `src/core/data-tag-format-types.js` | `client/features/template-editor/data-tag-format-types.js` | Added `getDataTagDefinitionKey()` export for shared core use. |
| `src/core/data-tag-value-formatting.js` | `client/features/template-editor/data-tag-value-formatting.js` | Import path updated to package-local module. Uses exported `getDataTagDefinitionKey()`. |
| `src/core/data-tag-format-options.js` | `client/features/template-editor/data-tag-format-options.js` | Removed dependency on app-specific `data-tags-definitions.js`; uses lightweight package-local definition helpers. |
| `src/core/data-tag-samples.js` | `client/features/template-editor/data-tag-samples.js` | Import path updated. Event dispatch checks `CustomEvent` before constructing it so Node-like test environments do not throw when a fake `window` exists. |
| `src/core/data-tag-definitions.js` | New package-local file | Provides minimal catalog flattening and key lookup without ExamList UI dependencies. |

## v0.7.0 Files

| Library file | Source file | Local changes |
| --- | --- | --- |
| `src/runtime/template-editor-runtime.bundle.js` | `client/template-editor-runtime/client/**` in manifest order | Generated bundle. `table-interaction.js` gets explicit local declarations for variables that were implicit globals in classic-script mode, so the bundle can run as ESM strict-mode code. |
| `src/runtime/index.js` | New package-local wrapper around `ExamListTemplateEditorRuntime.createTemplateEditor()` | Adds `mountTemplateEditor()`, template value get/set helpers, adapter mapping, read-only mode, dirty tracking, preview/save helpers, and stronger `destroy()` cleanup for transient overlays. |
| `src/styles/template-editor.css` | `client/template-editor-runtime/client/template-editor-runtime/template-editor-runtime.css`, `styles/features/template-editor.css`, and imported `styles/features/template-editor/**` | Generated scoped CSS under `.examlist-template-editor`. |
| `test/browser/mount-template-editor.spec.js` | New package-local browser scenario | Verifies multi-instance mount, value sync, table/image insertion, preview/save, read-only toggling, CSS scope, and runtime cleanup in Chromium. |

## Deferred Files

The following groups are intentionally deferred:

- server preview/layout renderer.
- ExamList API clients and route integration.
- ExamList route, permission, busy overlay, and toast integration.
- XLSX import, PDF worker, and operational management screens.

See the root project `plan.md` for the full staged extraction plan.
