export type DataTagFormatType = "date" | "time";

export interface DataTagDefinition {
  key?: string;
  dataKey?: string;
  token?: string;
  label?: string;
  type?: string;
  example?: unknown;
  [key: string]: unknown;
}

export interface DataTagGroup {
  id?: string;
  label?: string;
  tags?: DataTagDefinition[];
  [key: string]: unknown;
}

export interface DataTagCatalog {
  groups?: DataTagGroup[];
  tags?: DataTagDefinition[];
  [key: string]: unknown;
}

export interface TemplateEditorPageSettings {
  documentHtml?: string;
  [key: string]: unknown;
}

export interface TemplateEditorPage {
  id?: string;
  settings?: TemplateEditorPageSettings;
  [key: string]: unknown;
}

export interface TemplateEditorLayoutPayload {
  pages?: TemplateEditorPage[];
  [key: string]: unknown;
}

export interface TemplateLayoutPayload {
  layout?: TemplateEditorLayoutPayload;
  documentHtml?: string;
  html?: string;
  settings?: TemplateEditorPageSettings;
  [key: string]: unknown;
}

export type TemplateEditorValue = TemplateLayoutPayload | string;

export interface PreviewPdfRequest {
  editor: MountedTemplateEditor | null;
  html: string;
  sampleData: Record<string, unknown>;
  template: TemplateEditorValue;
}

export interface PreviewPdfResult {
  html?: string;
  pdfUrl?: string;
  pageCount?: number;
  candidateCount?: number;
  warnings?: string[];
  [key: string]: unknown;
}

export interface SaveTemplateRequest {
  editor: MountedTemplateEditor | null;
  html: string;
  template: TemplateEditorValue;
  [key: string]: unknown;
}

export interface UploadImageRequest {
  editor: MountedTemplateEditor | null;
  file: File;
  html: string;
  template: TemplateEditorValue;
  [key: string]: unknown;
}

export interface UploadedImageResult {
  url?: string;
  src?: string;
  href?: string;
  source?: string;
  path?: string;
  filePath?: string;
  key?: string;
  alt?: string;
  caption?: string;
  title?: string;
  name?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export interface TemplateEditorAdapterMap {
  buildApiUrl?: (path: string) => string;
  resolveAssetUrl?: (path: string) => string;
  saveTemplate?: (context: SaveTemplateRequest) => Promise<TemplateEditorValue | void> | TemplateEditorValue | void;
  previewPdf?: (context: PreviewPdfRequest) => Promise<PreviewPdfResult> | PreviewPdfResult;
  uploadImage?: (context: UploadImageRequest) => Promise<UploadedImageResult | string | void> | UploadedImageResult | string | void;
}

export interface TemplateEditorPermissions {
  canManageTemplates?: boolean;
  [key: string]: unknown;
}

export interface MountTemplateEditorOptions {
  root?: Element | string | null;
  container?: Element | string | null;
  document?: Document;
  html?: string;
  initialHtml?: string;
  template?: TemplateEditorValue;
  selectedPageId?: string;
  dataTags?: DataTagDefinition[] | DataTagCatalog;
  tags?: DataTagDefinition[];
  adapters?: TemplateEditorAdapterMap;
  permissions?: TemplateEditorPermissions;
  readOnly?: boolean;
  idPrefix?: string;
  clearRootOnDestroy?: boolean;
  buildApiUrl?: (path: string) => string;
  resolveAssetUrl?: (path: string) => string;
  previewData?: Record<string, unknown>;
  previewPhotoPath?: string;
  getPreviewData?: () => Record<string, unknown>;
  getPreviewDate?: () => string;
  getGeneratedObjectValue?: (record: Record<string, unknown>) => string;
  generatedObjectSourceKey?: string;
  onChange?: (
    nextTemplate: TemplateEditorValue,
    context: {
      editor: MountedTemplateEditor | null;
      html: string;
      runtime: unknown;
    },
  ) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSetHtml?: (html: string, runtime: unknown, context: { notify: boolean; resetHistory: boolean }) => void;
  onUploadError?: (error: unknown, context: { editor: MountedTemplateEditor | null; file: File }) => void;
  [key: string]: unknown;
}

export interface MountedTemplateEditor {
  applyCommand: (...args: unknown[]) => unknown;
  destroy: () => void;
  focus: () => void;
  getHtml: () => string;
  getRuntime: () => unknown;
  getValue: () => TemplateEditorValue;
  insertHtml: (html: string) => unknown;
  insertImage: (file: File, context?: Record<string, unknown>) => Promise<boolean>;
  insertImageFile: (file: File, context?: Record<string, unknown>) => Promise<boolean>;
  insertImageSource: (...args: unknown[]) => unknown;
  insertUploadedImage: (uploadResult: UploadedImageResult | string, context?: { file?: File; [key: string]: unknown }) => boolean;
  insertTag: (tag: string) => unknown;
  isDirty: () => boolean;
  preview: (context?: Record<string, unknown>) => Promise<PreviewPdfResult>;
  redo: () => unknown;
  render: (data?: Record<string, unknown>, html?: string) => string;
  renderInto: (target: Element | string, data?: Record<string, unknown>, html?: string) => string;
  save: (context?: Record<string, unknown>) => Promise<TemplateEditorValue | void>;
  setHtml: (html: string, options?: { notify?: boolean; resetHistory?: boolean }) => unknown;
  setReadOnly: (isReadOnly: boolean) => void;
  setValue: (
    nextValue: TemplateEditorValue,
    options?: {
      html?: string;
      markClean?: boolean;
      notify?: boolean;
      resetHistory?: boolean;
      selectedPageId?: string;
    },
  ) => void;
  sync: () => TemplateEditorValue;
  undo: () => unknown;
  uploadImage: (file: File, context?: Record<string, unknown>) => Promise<boolean>;
}

export interface DataTagSampleValueConstraint {
  errorMessage: string;
  formatLabel: string;
  inputMode: string;
  maxLength: number;
  placeholder: string;
  type: DataTagFormatType;
}

export interface DataTagFormatOption {
  label: string;
  preview: string;
  value: string;
}

export interface DataTagFormatTokenGuide {
  description: string;
  example: string;
  token: string;
}

export const dateFormatType: "date";
export const timeFormatType: "time";
export const dataTagSampleValuesEventName: "examlist:data-tag-sample-values-change";
export const dataTagSettingsEventName: "examlist:data-tag-settings-change";

export function getTemplateEditorRuntime(): unknown;
export function createTemplateEditorState(overrides?: Record<string, unknown>): Record<string, unknown>;
export function createTemplatePreviewState(overrides?: Record<string, unknown>): Record<string, unknown>;
export function normalizeTemplateTagDefinition(definition?: DataTagDefinition): Readonly<DataTagDefinition> | null;
export function normalizeTemplateTagDefinitions(definitions?: DataTagDefinition[]): readonly Readonly<DataTagDefinition>[];
export function mountTemplateEditor(options?: MountTemplateEditorOptions): MountedTemplateEditor;

export function getDataTagDefinitionKey(definitionOrKey?: DataTagDefinition | string): string;
export function getDataTagFormatType(definitionOrKey?: DataTagDefinition | string): DataTagFormatType | "";
export function isDataTagFormatSupported(definitionOrKey?: DataTagDefinition | string): boolean;

export function getDataTagSampleValueConstraint(definitionOrKey?: DataTagDefinition | string): Readonly<DataTagSampleValueConstraint> | null;
export function getDataTagSampleValueError(definitionOrKey?: DataTagDefinition | string, value?: unknown): string;
export function normalizeDataTagSampleValue(definitionOrKey?: DataTagDefinition | string, value?: unknown): string;
export function buildDataTagSampleValueErrors(tagDefinitions?: DataTagDefinition[], sampleValues?: Record<string, unknown>): Record<string, string>;
export function hasDataTagSampleValueErrors(errors?: Record<string, unknown>): boolean;
export function formatDataTagValue(formatType?: string, value?: unknown, formatValue?: string): string;
export function formatDataTagSampleValue(
  definitionOrKey?: DataTagDefinition | string,
  value?: unknown,
  formatValue?: string,
  explicitFormatType?: string,
): string;

export function normalizeDataTagDefinition(definition?: DataTagDefinition): DataTagDefinition | null;
export function flattenDataTagDefinitions(dataTags?: DataTagCatalog | DataTagDefinition[]): DataTagDefinition[];
export function findDataTagDefinitionByKey(dataTags?: DataTagCatalog | DataTagDefinition[], tagKey?: string): DataTagDefinition | null;
export const findDataTagFormatDefinitionByKey: typeof findDataTagDefinitionByKey;

export function getDataTagFormatOptions(formatType?: string): readonly Readonly<DataTagFormatOption>[];
export function getDataTagFormatTokenGuides(formatType?: string): readonly Readonly<DataTagFormatTokenGuide>[];
export function isDataTagFormatValid(formatType?: string, formatValue?: string): boolean;
export function normalizeDataTagFormat(formatType?: string, formatValue?: string): string;
export function getDataTagFormatInputError(formatType?: string, formatValue?: string): string;
export function renderDataTagFormatPreview(formatType?: string, formatValue?: string): string;

export function buildDefaultDataTagSampleValues(tagDefinitions?: DataTagDefinition[]): Record<string, string>;
export function buildDefaultDataTagEmptyValueData(tagDefinitions?: DataTagDefinition[]): Record<string, string>;
export function normalizeDataTagSampleValues(tagDefinitions?: DataTagDefinition[], sampleValues?: Record<string, unknown>): Record<string, string>;
export function normalizeDataTagEmptyValueData(tagDefinitions?: DataTagDefinition[], emptyValueData?: Record<string, unknown>): Record<string, string>;
export function loadDataTagSampleValues(tagDefinitions?: DataTagDefinition[], sourceValues?: Record<string, unknown> | null): Record<string, string>;
export function loadDataTagEmptyValueData(tagDefinitions?: DataTagDefinition[], sourceValues?: Record<string, unknown> | null): Record<string, string>;
export function saveDataTagSampleValues(tagDefinitions?: DataTagDefinition[], sampleValues?: Record<string, unknown>): Record<string, string>;
export function saveDataTagEmptyValueData(tagDefinitions?: DataTagDefinition[], emptyValueData?: Record<string, unknown>): Record<string, string>;
export function applyDataTagSampleValuesToDefinitions(tagDefinitions?: DataTagDefinition[], sampleValues?: Record<string, unknown>): DataTagDefinition[];
export function createDataTagSampleValuesPayload(tagDefinitions?: DataTagDefinition[], sampleValues?: Record<string, unknown>): Record<string, string>;
export function createDataTagEmptyValueDataPayload(tagDefinitions?: DataTagDefinition[], emptyValueData?: Record<string, unknown>): Record<string, string>;
export function createDataTagSettingsPayload(
  tagDefinitions?: DataTagDefinition[],
  values?: {
    emptyValueData?: Record<string, unknown>;
    sampleData?: Record<string, unknown>;
  },
): {
  emptyValueData: Record<string, string>;
  sampleData: Record<string, string>;
};
export function areDataTagSampleValuesEqual(
  tagDefinitions?: DataTagDefinition[],
  leftValues?: Record<string, unknown>,
  rightValues?: Record<string, unknown>,
): boolean;
export function areDataTagEmptyValueDataEqual(
  tagDefinitions?: DataTagDefinition[],
  leftValues?: Record<string, unknown>,
  rightValues?: Record<string, unknown>,
): boolean;
