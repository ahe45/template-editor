import {
  formatDataTagSampleValue,
  mountTemplateEditor,
  type DataTagDefinition,
  type MountedTemplateEditor,
  type TemplateLayoutPayload,
} from "examlist-template-editor";
import { renderDataTagFormatPreview } from "examlist-template-editor/core";
import { getTemplateEditorRuntime } from "examlist-template-editor/runtime";

const formatted: string = formatDataTagSampleValue("candidate.examDate", "2026-11-28", "YYYY.MM.DD");
const preview: string = renderDataTagFormatPreview("time", "A h:mm");
const runtime: unknown = getTemplateEditorRuntime();

const dataTags: DataTagDefinition[] = [
  { dataKey: "candidate.name", label: "이름", token: "@{이름}" },
];
const template: TemplateLayoutPayload = {
  layout: {
    pages: [
      {
        id: "page-1",
        settings: {
          documentHtml: "<p>본문</p>",
        },
      },
    ],
  },
};

const editor: MountedTemplateEditor = mountTemplateEditor({
  root: document.createElement("div"),
  template,
  dataTags,
  adapters: {
    saveTemplate: async ({ template: nextTemplate }) => nextTemplate,
    previewPdf: async ({ html }) => ({ html, pageCount: 1, warnings: [] }),
  },
  onChange(nextTemplate, context) {
    const changedTemplate: string | TemplateLayoutPayload = nextTemplate;
    const html: string = context.html;
    void changedTemplate;
    void html;
  },
});

editor.setValue(template, { markClean: true });
editor.setReadOnly(true);
editor.destroy();

void formatted;
void preview;
void runtime;
