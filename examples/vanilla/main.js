import { mountTemplateEditor } from "../../src/index.js";

const template = {
  layout: {
    pages: [
      {
        id: "page-1",
        settings: {
          documentHtml: "<p>수험생 이름: </p>",
        },
      },
    ],
  },
};

const dataTags = [
  { dataKey: "candidate.name", label: "이름", token: "@{이름}" },
  { dataKey: "candidate.examDate", label: "시험일", token: "@{시험일}", type: "date" },
];

window.templateEditor = mountTemplateEditor({
  root: document.getElementById("editor"),
  template,
  dataTags,
  adapters: {
    buildApiUrl: () => "",
    saveTemplate: async ({ template: nextTemplate }) => nextTemplate,
  },
  onChange: (nextTemplate) => {
    console.log("template changed", nextTemplate);
  },
});
