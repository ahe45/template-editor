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

## Deferred Files

The following groups are intentionally deferred:

- DOM editor and toolbar modules.
- `client/template-editor-runtime/**`.
- template editor CSS.
- server preview/layout renderer.
- ExamList API clients and route integration.

See the root project `plan.md` for the full staged extraction plan.
