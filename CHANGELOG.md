# Changelog

## 0.7.1

- Fixed standalone GitHub Actions builds by reusing committed runtime/CSS artifacts when the ExamList source tree is not available.

## 0.7.0

- Added browser `mountTemplateEditor()` API.
- Added bundled runtime generated from `client/template-editor-runtime`.
- Added scoped CSS export at `examlist-template-editor/styles.css`.
- Added runtime adapter boundary for save, preview, and asset URL behavior.
- Added Playwright browser scenario covering multiple instances, value sync, preview, save, read-only mode, CSS scoping, and destroy cleanup.
- Added TypeScript declarations for runtime options and mounted editor API.

## 0.1.0

- Added portable data tag core modules.
- Added ESM package entry points for `examlist-template-editor` and `examlist-template-editor/core`.
- Added type declarations for public API.
- Added independent unit tests and consumer install verification.
