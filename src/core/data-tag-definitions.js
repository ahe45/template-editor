import { getDataTagDefinitionKey } from "./data-tag-format-types.js";

function getDefinitionLabel(definition = {}) {
  const key = getDataTagDefinitionKey(definition);
  const label = String(definition?.label || "").trim();

  return label || key;
}

export function normalizeDataTagDefinition(definition = {}) {
  const key = getDataTagDefinitionKey(definition);

  if (!key) {
    return null;
  }

  return {
    ...definition,
    dataKey: String(definition?.dataKey || key).trim(),
    example: String(definition?.example ?? ""),
    key,
    label: getDefinitionLabel({ ...definition, key }),
    token: String(definition?.token || key).trim(),
    type: String(definition?.type || "string").trim() || "string",
  };
}

export function flattenDataTagDefinitions(dataTags = []) {
  const sourceDefinitions = Array.isArray(dataTags)
    ? dataTags
    : Array.isArray(dataTags?.groups)
      ? dataTags.groups.flatMap((group) => Array.isArray(group?.tags) ? group.tags : [])
      : Array.isArray(dataTags?.tags)
        ? dataTags.tags
        : [];

  return sourceDefinitions
    .map((definition) => normalizeDataTagDefinition(definition))
    .filter(Boolean);
}

export function findDataTagDefinitionByKey(dataTags, tagKey = "") {
  const normalizedKey = String(tagKey || "").trim();

  if (!normalizedKey) {
    return null;
  }

  return flattenDataTagDefinitions(dataTags).find((definition) => getDataTagDefinitionKey(definition) === normalizedKey) || null;
}
