import bundledTemplateEditorRuntime from "./template-editor-runtime.bundle.js";

let mountedInstanceCounter = 0;

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function escapeHtmlAttribute(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

function getFirstNonEmptyString(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();

    if (text) {
      return text;
    }
  }

  return "";
}

function normalizeImageDimension(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return null;
  }

  return Math.round(numberValue);
}

function getUploadedImageSource(uploadResult, runtimeOptions) {
  if (typeof uploadResult === "string") {
    return uploadResult.trim();
  }

  if (!isObject(uploadResult)) {
    return "";
  }

  const directSource = getFirstNonEmptyString(
    uploadResult.url,
    uploadResult.src,
    uploadResult.href,
    uploadResult.source,
  );

  if (directSource) {
    return directSource;
  }

  const pathSource = getFirstNonEmptyString(uploadResult.path, uploadResult.filePath, uploadResult.key);

  if (!pathSource) {
    return "";
  }

  const resolvedSource =
    typeof runtimeOptions.buildApiUrl === "function" ? String(runtimeOptions.buildApiUrl(pathSource) || "").trim() : "";

  return resolvedSource || pathSource;
}

function buildUploadedImageMarkup(uploadResult, file, runtimeOptions) {
  const source = getUploadedImageSource(uploadResult, runtimeOptions);

  if (!source) {
    return "";
  }

  const caption =
    typeof uploadResult === "string"
      ? getFirstNonEmptyString(file?.name, "image")
      : getFirstNonEmptyString(uploadResult.alt, uploadResult.caption, uploadResult.title, uploadResult.name, file?.name, "image");
  const width = isObject(uploadResult) ? normalizeImageDimension(uploadResult.width) : null;
  const height = isObject(uploadResult) ? normalizeImageDimension(uploadResult.height) : null;
  const sizeAttributes = [
    width ? ` width="${width}"` : "",
    height ? ` height="${height}"` : "",
  ].join("");

  return `<img src="${escapeHtmlAttribute(source)}" alt="${escapeHtmlAttribute(caption)}" title="${escapeHtmlAttribute(caption)}"${sizeAttributes} />`;
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

function applyRuntimeLayoutClasses(rootElement, options = {}) {
  const shellElement = rootElement.querySelector(".template-editor-runtime-shell");

  if (!shellElement) {
    return;
  }

  const isResponsiveLayout = options.layoutMode === "responsive" || options.responsiveLayout === true;

  shellElement.classList.add("examlist-template-editor-body");
  shellElement.classList.toggle("is-responsive-layout", isResponsiveLayout);
  rootElement.dataset.examlistTemplateEditorLayout = isResponsiveLayout ? "responsive" : "desktop";
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
  let readOnlyState = options.readOnly === true || options.permissions?.canManageTemplates === false;
  const dirtyState = { isDirty: false };
  const disposers = [];

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

  applyRuntimeLayoutClasses(rootElement, options);
  applyReadOnlyMode(rootElement, readOnlyState);

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

  function insertUploadedImage(uploadResult, context = {}) {
    if (readOnlyState) {
      return false;
    }

    const markup = buildUploadedImageMarkup(uploadResult, context.file, runtimeOptions);

    if (!markup) {
      return false;
    }

    return runtimeApi.insertHtml(markup) !== false;
  }

  async function insertImage(file, context = {}) {
    if (!file || readOnlyState) {
      return false;
    }

    if (typeof adapters.uploadImage !== "function") {
      runtimeApi.insertImage(file);
      return true;
    }

    const uploadResult = await adapters.uploadImage({
      ...context,
      editor: editorApi,
      file,
      html: getHtml(),
      template: getValue(),
    });

    return insertUploadedImage(uploadResult, { ...context, file });
  }

  function focus() {
    rootElement.querySelector("[data-template-editor-runtime-surface]")?.focus();
  }

  function setReadOnly(nextReadOnly) {
    readOnlyState = Boolean(nextReadOnly);
    applyReadOnlyMode(rootElement, readOnlyState);
  }

  if (typeof adapters.uploadImage === "function") {
    const handleUploadInputChange = (event) => {
      const target = event.target;

      if (
        !target ||
        String(target.tagName || "").toUpperCase() !== "INPUT" ||
        target.type !== "file" ||
        !target.classList?.contains("upload-file-input")
      ) {
        return;
      }

      const file = target.files?.[0] || null;

      if (!file) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      insertImage(file, { source: "toolbar" }).catch((error) => {
        options.onUploadError?.(error, {
          editor: editorApi,
          file,
        });

        const CustomEventConstructor = rootElement.ownerDocument?.defaultView?.CustomEvent;

        if (typeof CustomEventConstructor === "function") {
          rootElement.dispatchEvent(
            new CustomEventConstructor("examlist-template-editor:image-upload-error", {
              bubbles: true,
              detail: { error, file },
            }),
          );
        }
      });

      target.value = "";
    };

    rootElement.addEventListener("change", handleUploadInputChange, true);
    disposers.push(() => rootElement.removeEventListener("change", handleUploadInputChange, true));
  }

  function destroy() {
    disposers.splice(0).forEach((dispose) => dispose());
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
    insertImage,
    insertImageFile: insertImage,
    insertImageSource: runtimeApi.insertImageSource,
    insertUploadedImage,
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
    uploadImage: insertImage,
  });

  return editorApi;
}
