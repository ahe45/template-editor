# Integration Guide

## Install

```bash
npm install github:<user>/examlist-template-editor#v0.1.0
```

For a private repository, prefer SSH in local development:

```bash
npm install git+ssh://git@github.com/<user>/examlist-template-editor.git#v0.1.0
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
  { key: "candidate.examDate", label: "시험날짜", type: "date", example: "2026-11-28" },
  { key: "candidate.examStartTime", label: "시작시간", type: "time", example: "09:00" },
];

const errors = {
  examDate: getDataTagSampleValueError("candidate.examDate", "2026.11.28"),
};

const text = formatDataTagSampleValue(
  "candidate.examDate",
  "2026-11-28",
  "YYYY년 M월 D일 dddd",
);

const payload = createDataTagSettingsPayload(definitions, {
  sampleData: { "candidate.examDate": "2026-11-28" },
  emptyValueData: { "candidate.examDate": "시험날짜" },
});
```

## Full Editor Integration

The full DOM editor is intentionally not included in `v0.1.0`. It will be added in later versions after root-scoped DOM queries, CSS scoping, adapter boundaries, and browser scenario tests are in place.

Consumers should start with the core package and keep their own editor UI until the `mountTemplateEditor()` API is released.
