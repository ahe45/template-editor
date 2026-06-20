import bundledTemplateEditorRuntime from "./template-editor-runtime.bundle.js";

let mountedInstanceCounter = 0;

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cloneTemplateValue(value) {
  if (!isObject(value)) {
    return value;
  }

  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function normalizeDataTags(dataTags) {
  if (Array.isArray(dataTags)) {
    return dataTags;
  }

  if (Array.isArray(dataTags?.tags)) {
    return dataTags.tags;
  }

  if (Array.isArray(dataTags?.definitions)) {
    return dataTags.definitions;
  }

  if (Array.isArray(dataTags?.groups)) {
    return dataTags.groups.flatMap((group) => (Array.isArray(group?.tags) ? group.tags : []));
  }

  return [];
}

function getTemplatePages(template) {
  return Array.isArray(template?.layout?.pages) ? template.layout.pages : [];
}

function getTemplatePage(template, pageId = "") {
  const pages = getTemplatePages(template);

  if (pages.length === 0) {
    return null;
  }

  const normalizedPageId = String(pageId || "").trim();

  return (normalizedPageId ? pages.find((page) => String(page?.id || "") === normalizedPageId) : null) || pages[0];
}

function getTemplateDocumentHtml(template, pageId = "") {
  if (typeof template === "string") {
    return template;
  }

  if (!isObject(template)) {
    return "";
  }

  const selectedPage = getTemplatePage(template, pageId);
  const pageHtml = selectedPage?.settings?.documentHtml;

  if (typeof pageHtml === "string") {
    return pageHtml;
  }

  if (typeof template.documentHtml === "string") {
    return template.documentHtml;
  }

  if (typeof template.html === "string") {
    return template.html;
  }

  if (typeof template.settings?.documentHtml === "string") {
    return template.settings.documentHtml;
  }

  return "";
}

function setTemplateDocumentHtml(template, html, pageId = "") {
  if (typeof template === "string" || !isObject(template)) {
    return String(html || "");
  }

  const nextTemplate = cloneTemplateValue(template);
  const selectedPage = getTemplatePage(nextTemplate, pageId);

  if (selectedPage) {
    selectedPage.settings = isObject(selectedPage.settings) ? selectedPage.settings : {};
    selectedPage.settings.documentHtml = String(html || "");
    return nextTemplate;
  }

  if (isObject(nextTemplate.settings)) {
    nextTemplate.settings.documentHtml = String(html || "");
    return nextTemplate;
  }

  nextTemplate.documentHtml = String(html || "");
  return nextTemplate;
}

function resolveInitialHtml(options) {
  if (typeof options.html === "string") {
    return options.html;
  }

  if (typeof options.initialHtml === "string") {
    return options.initialHtml;
  }

  return getTemplateDocumentHtml(options.template, options.selectedPageId);
}

function resolveRootElement(root, documentRef) {
  if (typeof root === "string") {
    return documentRef.querySelector(root);
  }

  return root?.nodeType === 1 ? root : null;
}

function assertBrowserDocument(documentRef) {
  if (!documentRef?.createElement) {
    throw new Error("mountTemplateEditor() requires a browser Document. Use core APIs in non-browser environments.");
  }
}

function setDirtyState(state, nextDirty, callback) {
  if (state.isDirty === nextDirty) {
    return;
  }

  state.isDirty = nextDirty;
  callback?.(nextDirty);
}

function applyReadOnlyMode(rootElement, isReadOnly) {
  rootElement.classList.toggle("is-read-only", isReadOnly);
  rootElement.dataset.examlistTemplateEditorReadonly = isReadOnly ? "true" : "false";

  const surfaceElement = rootElement.querySelector("[data-template-editor-runtime-surface]");
  surfaceElement?.setAttribute("contenteditable", isReadOnly ? "false" : "true");
  surfaceElement?.setAttribute("aria-readonly", isReadOnly ? "true" : "false");

  rootElement.querySelectorAll("button, input, select, textarea").forEach((controlElement) => {
    controlElement.disabled = isReadOnly;
    controlElement.setAttribute("aria-disabled", isReadOnly ? "true" : "false");
  });
}

function removeTransientRuntimeNodes(rootElement) {
  rootElement
    .querySelectorAll(
      [
        ".template-editor-image-selection",
        ".template-editor-table-selection",
        "[data-template-double-border-overlay]",
        "[data-template-table-object-move-handle]",
        "[data-template-table-object-handle]",
      ].join(", "),
    )
    .forEach((element) => element.remove());

  rootElement
    .querySelectorAll(
      [
        ".is-active-cell",
        ".is-selected-cell",
        ".is-selected-table-object",
        ".is-image-moving",
        ".is-image-resizing",
        ".is-table-column-hover",
        ".is-table-row-hover",
        ".is-table-resizing",
      ].join(", "),
    )
    .forEach((element) => {
      element.classList.remove(
        "is-active-cell",
        "is-selected-cell",
        "is-selected-table-object",
        "is-image-moving",
        "is-image-resizing",
        "is-table-column-hover",
        "is-table-row-hover",
        "is-table-resizing",
      );
    });
}

function normalizeRuntimeOptions(options, instanceId, onRuntimeChange) {
  const documentRef = options.document || globalThis.document;
  const rootElement = resolveRootElement(options.root || options.container, documentRef);

  assertBrowserDocument(documentRef);

  if (!rootElement) {
    throw new Error("mountTemplateEditor() requires a valid root/container element.");
  }

  rootElement.classList.add("examlist-template-editor");
  rootElement.dataset.examlistTemplateEditorInstance = String(instanceId);

  const adapters = isObject(options.adapters) ? options.adapters : {};
  const resolveAssetUrl =
    typeof adapters.resolveAssetUrl === "function"
      ? adapters.resolveAssetUrl
      : typeof options.resolveAssetUrl === "function"
        ? options.resolveAssetUrl
        : null;
  const buildApiUrl =
    typeof adapters.buildApiUrl === "function"
      ? adapters.buildApiUrl
      : typeof resolveAssetUrl === "function"
        ? resolveAssetUrl
        : typeof options.buildApiUrl === "function"
          ? options.buildApiUrl
          : () => "";

  return {
    ...options,
    buildApiUrl,
    document: documentRef,
    idPrefix: String(options.idPrefix || `examlistTemplateEditor${instanceId}`),
    initialHtml: resolveInitialHtml(options),
    onChange: onRuntimeChange,
    root: rootElement,
    tags: normalizeDataTags(options.dataTags || options.tags),
  };
}

export function getTemplateEditorRuntime() {
  return bundledTemplateEditorRuntime;
}

export const createTemplateEditorState = bundledTemplateEditorRuntime.createTemplateEditorState;
export const createTemplatePreviewState = bundledTemplateEditorRuntime.createTemplatePreviewState;
export const normalizeTemplateTagDefinition = bundledTemplateEditorRuntime.normalizeTemplateTagDefinition;
export const normalizeTemplateTagDefinitions = bundledTemplateEditorRuntime.normalizeTemplateTagDefinitions;

export function mountTemplateEditor(options = {}) {
  const instanceId = ++mountedInstanceCounter;
  const adapters = isObject(options.adapters) ? options.adapters : {};
  let currentTemplate = options.template ?? options.html ?? options.initialHtml ?? "";
  let editorApi = null;
  let baselineHtml = resolveInitialHtml(options);
  const dirtyState = { isDirty: false };

  const handleRuntimeChange = (html, runtimeApi) => {
    const nextHtml = String(html || "");
    setDirtyState(dirtyState, nextHtml !== baselineHtml, options.onDirtyChange);
    currentTemplate = setTemplateDocumentHtml(currentTemplate, nextHtml, options.selectedPageId);
    options.onChange?.(currentTemplate, {
      editor: editorApi,
      html: nextHtml,
      runtime: runtimeApi,
    });
  };

  const runtimeOptions = normalizeRuntimeOptions(options, instanceId, handleRuntimeChange);
  const rootElement = runtimeOptions.root;
  const runtimeApi = bundledTemplateEditorRuntime.createTemplateEditor(runtimeOptions);
  const isReadOnly = options.readOnly === true || options.permissions?.canManageTemplates === false;

  applyReadOnlyMode(rootElement, isReadOnly);

  function getHtml() {
    return runtimeApi.getHtml();
  }

  function getValue() {
    return setTemplateDocumentHtml(currentTemplate, getHtml(), options.selectedPageId);
  }

  function setValue(nextValue, setOptions = {}) {
    currentTemplate = nextValue;
    const nextHtml = typeof setOptions.html === "string"
      ? setOptions.html
      : getTemplateDocumentHtml(nextValue, setOptions.selectedPageId || options.selectedPageId);

    runtimeApi.setHtml(nextHtml, {
      notify: setOptions.notify === true,
      resetHistory: setOptions.resetHistory !== false,
    });

    if (setOptions.markClean === true) {
      baselineHtml = runtimeApi.getHtml();
      setDirtyState(dirtyState, false, options.onDirtyChange);
    }
  }

  function sync() {
    runtimeApi.sync();
    return getValue();
  }

  async function preview(context = {}) {
    const html = getHtml();
    const template = getValue();
    const sampleData = isObject(context.sampleData) ? context.sampleData : context;

    if (typeof adapters.previewPdf === "function") {
      return adapters.previewPdf({
        editor: editorApi,
        html,
        sampleData,
        template,
      });
    }

    return {
      html: runtimeApi.render(sampleData, html),
      pageCount: 1,
      warnings: [],
    };
  }

  async function save(context = {}) {
    const html = getHtml();
    const template = getValue();
    const savedTemplate =
      typeof adapters.saveTemplate === "function"
        ? await adapters.saveTemplate({
            ...context,
            editor: editorApi,
            html,
            template,
          })
        : template;

    if (savedTemplate && (isObject(savedTemplate) || typeof savedTemplate === "string")) {
      currentTemplate = savedTemplate;
    }

    baselineHtml = html;
    setDirtyState(dirtyState, false, options.onDirtyChange);
    return savedTemplate ?? template;
  }

  function focus() {
    rootElement.querySelector("[data-template-editor-runtime-surface]")?.focus();
  }

  function setReadOnly(nextReadOnly) {
    applyReadOnlyMode(rootElement, Boolean(nextReadOnly));
  }

  function destroy() {
    runtimeApi.destroy();
    removeTransientRuntimeNodes(rootElement);
    rootElement.classList.remove("is-read-only");
    delete rootElement.dataset.examlistTemplateEditorReadonly;

    if (options.clearRootOnDestroy === true) {
      rootElement.replaceChildren();
      rootElement.classList.remove("examlist-template-editor", "template-editor-runtime");
      delete rootElement.dataset.examlistTemplateEditorInstance;
    }
  }

  editorApi = Object.freeze({
    applyCommand: runtimeApi.applyCommand,
    destroy,
    focus,
    getHtml,
    getRuntime: () => runtimeApi,
    getValue,
    insertHtml: runtimeApi.insertHtml,
    insertImage: runtimeApi.insertImage,
    insertImageSource: runtimeApi.insertImageSource,
    insertTag: runtimeApi.insertTag,
    isDirty: () => dirtyState.isDirty,
    preview,
    redo: runtimeApi.redo,
    render: runtimeApi.render,
    renderInto: runtimeApi.renderInto,
    save,
    setHtml: runtimeApi.setHtml,
    setReadOnly,
    setValue,
    sync,
    undo: runtimeApi.undo,
  });

  return editorApi;
}
