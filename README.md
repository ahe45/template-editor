# examlist-template-editor

Portable ExamList template editor package.

This package exposes:

- data tag core utilities that work in Node.js and browsers
- a browser `mountTemplateEditor()` runtime that renders the editor UI into a container
- scoped CSS at `examlist-template-editor/styles.css`

## Install From GitHub

```bash
npm install github:ahe45/template-editor#v0.7.1
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

`text` is `2026.11.28 (토)`. `errorMessage` is `hh:mm 형식으로 입력하세요.`.

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

Supported adapters in `v0.7.0`:

- `saveTemplate({ template, html, editor })`
- `previewPdf({ template, html, sampleData, editor })`
- `buildApiUrl(path)`
- `resolveAssetUrl(path)`

If `previewPdf` is not provided, `editor.preview()` returns local rendered HTML.

## Current Scope

Included in `v0.7.1`:

- all `v0.1.0` data tag core utilities
- bundled browser runtime from `client/template-editor-runtime`
- toolbar, tag panel, document surface, page properties panel
- table/image/barcode/QR insertion runtime exposed through the editor API
- template object `documentHtml` get/set helpers
- scoped CSS export
- TypeScript declarations
- Node unit tests, browser scenario test, pack check, consumer install verification

Still app-specific and intentionally not included:

- ExamList route/navigation integration
- ExamList API clients
- PDF generation worker/server renderer
- account, school, permission management screens
- XLSX import and operational data management screens

## Validation

Run all checks from this package folder:

```bash
npm run verify
```

This runs:

- runtime/CSS build
- `node --test`
- Playwright Chromium browser scenario
- `npm pack --dry-run`
- local consumer install and import verification

## Source Tracking

See [docs/migration.md](docs/migration.md) for the ExamList source files used for this package version and intentional local changes.
