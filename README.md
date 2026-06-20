# examlist-template-editor

Portable template editor utilities extracted from ExamList.

This first package version exposes the data tag core used by the ExamList template editor. It is intentionally small: it does not include the DOM editor, toolbar, PDF preview API client, or app state integration yet.

## Install From GitHub

Public repository:

```bash
npm install github:<user>/examlist-template-editor#v0.1.0
```

Private repository over SSH:

```bash
npm install git+ssh://git@github.com/<user>/examlist-template-editor.git#v0.1.0
```

Use immutable tags for application projects. Do not depend on a moving branch for production.

## Usage

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

## Current Scope

Included in `v0.1.0`:

- date/time data tag type detection
- data tag sample value validation
- date/time token formatting
- data tag format presets and validation
- data tag sample/empty value payload helpers
- lightweight data tag definition flattening
- type declarations
- independent unit tests
- local consumer install verification

Not included yet:

- contenteditable document editor
- toolbar UI
- image/table/barcode/QR editing UI
- candidate block UI
- CSS entry
- PDF preview renderer
- ExamList API client

## Validation

Run all checks from this package folder:

```bash
npm run verify
```

This runs:

- `node --test`
- `npm pack --dry-run`
- local consumer install and import verification

## Source Tracking

See [docs/migration.md](docs/migration.md) for the ExamList source files used for this package version and any intentional local changes.
