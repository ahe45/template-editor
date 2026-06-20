# Changelog

## 1.0.1

- Fixed the packaged runtime layout so the editor uses the same four-column toolbar, tag panel, canvas, and page-properties arrangement as the ExamList editor.
- Added scoped form-control resets to reduce interference from host application global `button`, `input`, and `select` styles.
- Added a browser regression test for runtime layout placement and host CSS isolation.

## 1.0.0

- Promoted the portable editor package to the first stable GitHub-installable release.
- Added public image upload adapter support for `editor.insertImage(file)`, `editor.uploadImage(file)`, and toolbar file input insertion.
- Added TypeScript declarations for upload adapter requests and uploaded image results.
- Extended the Playwright browser scenario to verify adapter-backed image upload from both the public API and toolbar file input.
- Updated README and integration/API docs for the `v1.0.0` install path and stable adapter contract.

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
