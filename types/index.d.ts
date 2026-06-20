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
