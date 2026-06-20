# Integration Guide

## Install

```bash
npm install github:ahe45/template-editor#v1.0.0
```

For a private repository, prefer SSH in local development:

```bash
npm install git+ssh://git@github.com/ahe45/template-editor.git#v1.0.0
```

CI servers need a GitHub token or SSH deploy key that can read the repository.

## Core-Only Integration

```js
import {
  createDataTagSettingsPayload,
  formatDataTagSampleValue,
  getDataTagSampleValueError,
} from "examlist-template-editor";

const definitions = [
  { key: "candidate.examDate", label: "Exam date", type: "date", example: "2026-11-28" },
  { key: "candidate.examStartTime", label: "Start time", type: "time", example: "09:00" },
];

const errors = {
  examDate: getDataTagSampleValueError("candidate.examDate", "2026.11.28"),
};

const text = formatDataTagSampleValue(
  "candidate.examDate",
  "2026-11-28",
  "YYYY.MM.DD (dddd)",
);

const payload = createDataTagSettingsPayload(definitions, {
  sampleData: { "candidate.examDate": "2026-11-28" },
  emptyValueData: { "candidate.examDate": "Exam date" },
});
```

## Browser Editor Integration

```js
import { mountTemplateEditor } from "examlist-template-editor";
import "examlist-template-editor/styles.css";

const editor = mountTemplateEditor({
  root: document.getElementById("editor"),
  template,
  dataTags,
  adapters: {
    saveTemplate: async ({ template }) => {
      await saveTemplateToYourApi(template);
      return template;
    },
    previewPdf: async ({ template, sampleData }) => {
      return previewTemplateWithYourApi(template, sampleData);
    },
    uploadImage: async ({ file }) => {
      const uploaded = await uploadImageToYourApi(file);
      return {
        url: uploaded.url,
        alt: file.name,
        width: uploaded.width,
        height: uploaded.height,
      };
    },
    buildApiUrl: (path) => new URL(path, location.origin).href,
  },
  onChange: (nextTemplate) => {
    updateLocalState(nextTemplate);
  },
  onDirtyChange: (isDirty) => {
    setUnsavedIndicator(isDirty);
  },
});
```

Call `editor.destroy()` before removing the container from the page.

## Template Shape

The runtime reads and writes document HTML at the first matching location:

- `template.layout.pages[].settings.documentHtml`
- `template.documentHtml`
- `template.html`
- `template.settings.documentHtml`

If `selectedPageId` is supplied, that page is updated. Otherwise the first page is updated.

## Adapter Rules

- The package does not call `fetch("/api/...")`.
- Consumer projects own save, preview, auth, routing, and upload behavior.
- Generated barcode/QR preview URLs should be supplied with `buildApiUrl()` or a preview adapter.
- `previewPdf` is optional. Without it, `editor.preview()` returns local rendered HTML.
- `uploadImage` is optional. Without it, image file insertion uses local data URLs.

## Data Tags

Load project-specific data tags before mounting the editor and pass them through `dataTags`.

```js
const dataTags = await loadDataTagsFromYourApi();

const editor = mountTemplateEditor({
  root,
  template,
  dataTags,
});
```

This keeps data loading, authentication, caching, and error handling in the consumer project.

## Read-Only Mode

```js
const editor = mountTemplateEditor({
  root,
  html: "<p>Read-only body</p>",
  permissions: {
    canManageTemplates: false,
  },
});
```

You can later toggle:

```js
editor.setReadOnly(false);
```

## Browser and Bundler

Supported target:

- browser runtime with DOM APIs
- Vite/Webpack-style CSS import
- Node.js import for core APIs and type checking

`mountTemplateEditor()` must not be called in Node.js or server rendering code.
