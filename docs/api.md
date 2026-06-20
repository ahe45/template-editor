# API

## Data Tag Format Types

- `dateFormatType`
- `timeFormatType`
- `getDataTagDefinitionKey(definitionOrKey)`
- `getDataTagFormatType(definitionOrKey)`
- `isDataTagFormatSupported(definitionOrKey)`

Supported date keys:

- `candidate.examDate`
- `candidate.birthDate`

Supported time keys:

- `candidate.examStartTime`
- `candidate.examEndTime`

Definitions with `type: "date"` or `type: "time"` are also supported.

## Data Tag Sample Validation

- `getDataTagSampleValueConstraint(definitionOrKey)`
- `getDataTagSampleValueError(definitionOrKey, value)`
- `normalizeDataTagSampleValue(definitionOrKey, value)`
- `buildDataTagSampleValueErrors(tagDefinitions, sampleValues)`
- `hasDataTagSampleValueErrors(errors)`

Sample value constraints are intentionally narrower than display formatting:

- `candidate.examDate`: validates `yyyy-mm-dd` when a value exists.
- `candidate.examStartTime`: validates `hh:mm` when a value exists.
- `candidate.examEndTime`: validates `hh:mm` when a value exists.
- `candidate.birthDate`: supports display formatting, but has no sample-value validation rule in this package version.

## Data Tag Value Formatting

- `formatDataTagValue(formatType, value, formatValue)`
- `formatDataTagSampleValue(definitionOrKey, value, formatValue, explicitFormatType)`

Date tokens:

- `YYYY`
- `YY`
- `MM`
- `M`
- `DD`
- `D`
- `ddd`
- `dddd`

Time tokens:

- `HH`
- `H`
- `hh`
- `h`
- `mm`
- `A`

If `formatValue` is empty, the original value is returned. If the source value is not canonical for the requested type, the original value is returned.

## Data Tag Format Options

- `getDataTagFormatOptions(formatType)`
- `getDataTagFormatTokenGuides(formatType)`
- `isDataTagFormatValid(formatType, formatValue)`
- `normalizeDataTagFormat(formatType, formatValue)`
- `getDataTagFormatInputError(formatType, formatValue)`
- `renderDataTagFormatPreview(formatType, formatValue)`

Custom format strings must contain at least one supported token and may not contain unsafe characters such as `<`, `>`, quotes, backticks, backslashes, or newlines.

## Data Tag Definitions

- `normalizeDataTagDefinition(definition)`
- `flattenDataTagDefinitions(dataTags)`
- `findDataTagDefinitionByKey(dataTags, tagKey)`

`flattenDataTagDefinitions()` accepts either an array of definitions or a catalog shape with `groups[].tags`.

## Data Tag Sample Payloads

- `buildDefaultDataTagSampleValues(tagDefinitions)`
- `buildDefaultDataTagEmptyValueData(tagDefinitions)`
- `normalizeDataTagSampleValues(tagDefinitions, sampleValues)`
- `normalizeDataTagEmptyValueData(tagDefinitions, emptyValueData)`
- `loadDataTagSampleValues(tagDefinitions, sourceValues)`
- `loadDataTagEmptyValueData(tagDefinitions, sourceValues)`
- `saveDataTagSampleValues(tagDefinitions, sampleValues)`
- `saveDataTagEmptyValueData(tagDefinitions, emptyValueData)`
- `applyDataTagSampleValuesToDefinitions(tagDefinitions, sampleValues)`
- `createDataTagSampleValuesPayload(tagDefinitions, sampleValues)`
- `createDataTagEmptyValueDataPayload(tagDefinitions, emptyValueData)`
- `createDataTagSettingsPayload(tagDefinitions, values)`
- `areDataTagSampleValuesEqual(tagDefinitions, leftValues, rightValues)`
- `areDataTagEmptyValueDataEqual(tagDefinitions, leftValues, rightValues)`

The save/load helpers use `window.localStorage` only when a browser `window` is available. Importing the package in Node.js does not require DOM globals.

## Runtime

- `mountTemplateEditor(options)`
- `getTemplateEditorRuntime()`
- `createTemplateEditorState(overrides)`
- `createTemplatePreviewState(overrides)`
- `normalizeTemplateTagDefinition(definition)`
- `normalizeTemplateTagDefinitions(definitions)`

`mountTemplateEditor()` creates the editor UI inside `options.root` or `options.container`.

```js
const editor = mountTemplateEditor({
  root: document.getElementById("editor"),
  template,
  dataTags,
  adapters: {
    saveTemplate: async ({ template }) => template,
    previewPdf: async ({ template, html, sampleData }) => ({ html, pageCount: 1 }),
    uploadImage: async ({ file }) => ({ url: `/uploads/${file.name}`, alt: file.name }),
    buildApiUrl: (path) => path,
  },
});
```

Minimum returned API:

- `getValue()`
- `setValue(nextValue, options)`
- `getHtml()`
- `setHtml(html, options)`
- `sync()`
- `preview(context)`
- `save(context)`
- `focus()`
- `destroy()`

Additional editing helpers:

- `insertHtml(html)`
- `insertTag(tag)`
- `insertImage(file, context)`
- `insertImageFile(file, context)`
- `insertImageSource(source, caption)`
- `insertUploadedImage(uploadResult, context)`
- `uploadImage(file, context)`
- `undo()`
- `redo()`

When `adapters.uploadImage` is provided, `insertImage(file)` and the toolbar image file input call that adapter and insert the returned image URL. Without `uploadImage`, file insertion falls back to the bundled runtime's local data URL behavior.

`uploadImage` may return a URL string or an object with one of `url`, `src`, `href`, `source`, `path`, `filePath`, or `key`. Optional `alt`, `caption`, `title`, `name`, `width`, and `height` fields are used when generating the inserted image markup.

## CSS

Import the editor styles once in the browser bundle:

```js
import "examlist-template-editor/styles.css";
```

The generated CSS is scoped under `.examlist-template-editor`.
