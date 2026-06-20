# examlist-template-editor

Portable ExamList template editor package.

This package exposes:

- data-tag core utilities that work in Node.js and browsers
- a browser `mountTemplateEditor()` runtime that renders the editor UI into a container
- scoped CSS at `examlist-template-editor/styles.css`
- adapter hooks for save, PDF preview, asset URL resolution, and image upload

## Install From GitHub

```bash
npm install github:ahe45/template-editor#v1.0.0
```

Use immutable tags for application projects. Do not depend on a moving branch for production.

## Core Usage

```js
import {
  formatDataTagSampleValue,
  getDataTagSampleValueError,
} from "examlist-template-editor";

const text = formatDataTagSampleValue(
  "candidate.examDate",
  "2026-11-28",
  "YYYY.MM.DD (ddd)",
);

const errorMessage = getDataTagSampleValueError(
  "candidate.examStartTime",
  "9:00",
);
```

## Browser Editor Usage

```js
import { mountTemplateEditor } from "examlist-template-editor";
import "examlist-template-editor/styles.css";

const editor = mountTemplateEditor({
  root: document.getElementById("editor"),
  template,
  dataTags,
  adapters: {
    saveTemplate: async ({ template }) => template,
    previewPdf: async ({ template, sampleData }) => ({
      html: "",
      pageCount: 1,
      warnings: [],
    }),
    uploadImage: async ({ file }) => ({
      url: await uploadFileToYourServer(file),
      alt: file.name,
    }),
    buildApiUrl: (path) => path,
  },
  onChange: (nextTemplate) => {
    console.log(nextTemplate);
  },
});

await editor.save();
editor.destroy();
```

`mountTemplateEditor()` requires a browser DOM. The package root can still be imported in Node.js, but the runtime can only be mounted in a browser.

## Adapter Boundary

The package does not call ExamList application APIs directly. Consumer projects provide app-specific behavior through adapters.

Supported adapters in `v1.0.0`:

- `saveTemplate({ template, html, editor })`
- `previewPdf({ template, html, sampleData, editor })`
- `uploadImage({ file, template, html, editor })`
- `buildApiUrl(path)`
- `resolveAssetUrl(path)`

If `previewPdf` is not provided, `editor.preview()` returns local rendered HTML.
If `uploadImage` is not provided, image file insertion falls back to the bundled runtime's local data URL behavior.

## Current Scope

Included in `v1.0.0`:

- data-tag core utilities
- bundled browser runtime from `client/template-editor-runtime`
- toolbar, tag panel, document surface, page properties panel
- table/image/barcode/QR insertion runtime exposed through the editor API
- template object `documentHtml` get/set helpers
- image upload adapter support for `editor.insertImage(file)` and toolbar file input
- scoped CSS export
- TypeScript declarations
- Node unit tests, TypeScript API tests, browser scenario test, pack check, and consumer install verification

Still app-specific and intentionally not included:

- ExamList route/navigation integration
- ExamList API clients
- PDF generation worker/server renderer
- account, school, and permission management screens
- XLSX import and operational data management screens

## Validation

Run all checks from this package folder:

```bash
npm run verify
```

This runs:

- runtime/CSS build
- `node --test`
- TypeScript public API checks
- Playwright Chromium browser scenario
- `npm pack --dry-run`
- local consumer install and import verification

## Source Tracking

See [docs/migration.md](docs/migration.md) for the ExamList source files used for this package version and intentional local changes.
