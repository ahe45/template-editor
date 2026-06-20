# examlist-template-editor

ExamList 양식 편집기를 다른 Node.js/브라우저 프로젝트에서도 사용할 수 있도록 분리한 패키지입니다.

이 패키지는 다음 기능을 제공합니다.

- Node.js와 브라우저에서 모두 사용할 수 있는 데이터 태그 core 유틸리티
- 브라우저 DOM 컨테이너에 양식 편집기 UI를 생성하는 `mountTemplateEditor()` 런타임
- `examlist-template-editor/styles.css` 경로로 제공되는 scoped CSS
- 저장, PDF 미리보기, asset URL 처리, 이미지 업로드를 외부 프로젝트 API에 연결하기 위한 adapter hook

## GitHub에서 설치

```bash
npm install github:ahe45/template-editor#v1.0.0
```

운영 프로젝트에서는 움직이는 branch가 아니라 고정 tag를 사용하는 것을 권장합니다.

## 다른 프로젝트 전달용 문구

다른 프로젝트에 양식 편집기 적용을 요청할 때 아래 내용을 그대로 전달하면 됩니다.

```text
아래 템플릿 편집기 패키지를 설치해서 적용해줘.

npm install github:ahe45/template-editor#v1.0.0

사용 방식은 아래와 같아.

import { mountTemplateEditor } from "examlist-template-editor";
import "examlist-template-editor/styles.css";

저장, PDF 미리보기, 이미지 업로드, 데이터 태그 로드는 현재 프로젝트의 API에 맞게 adapter로 연결해줘.
```

최소 연결 예시는 아래와 같습니다.

```js
const editor = mountTemplateEditor({
  root: document.getElementById("editor"),
  template,
  dataTags,
  adapters: {
    saveTemplate: async ({ template }) => {
      // 현재 프로젝트의 저장 API에 연결합니다.
      return template;
    },
    previewPdf: async ({ template, sampleData }) => {
      // 현재 프로젝트의 PDF 미리보기 API에 연결합니다.
      return { html: "", pageCount: 1, warnings: [] };
    },
    uploadImage: async ({ file }) => {
      // 현재 프로젝트의 이미지 업로드 API에 연결합니다.
      return { url: "", alt: file.name };
    },
  },
});
```

## Core 기능 사용

데이터 태그 값 포맷팅이나 샘플 값 검증처럼 DOM이 필요 없는 기능은 Node.js와 브라우저 양쪽에서 사용할 수 있습니다.

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

## 브라우저 편집기 사용

브라우저에서 전체 편집기 UI를 사용하려면 CSS를 import하고 `mountTemplateEditor()`를 호출합니다.

```js
import { mountTemplateEditor } from "examlist-template-editor";
import "examlist-template-editor/styles.css";

const editor = mountTemplateEditor({
  root: document.getElementById("editor"),
  template,
  dataTags,
  adapters: {
    saveTemplate: async ({ template }) => template,
    previewPdf: async ({ template, sampleData }) => ({
      html: "",
      pageCount: 1,
      warnings: [],
    }),
    uploadImage: async ({ file }) => ({
      url: await uploadFileToYourServer(file),
      alt: file.name,
    }),
    buildApiUrl: (path) => path,
  },
  onChange: (nextTemplate) => {
    console.log(nextTemplate);
  },
});

await editor.save();
editor.destroy();
```

`mountTemplateEditor()`는 브라우저 DOM이 필요합니다. 패키지 root와 core API는 Node.js에서도 import할 수 있지만, 편집기 UI mount는 브라우저에서만 호출해야 합니다.

## Adapter 경계

이 패키지는 ExamList 애플리케이션 API를 직접 호출하지 않습니다. 저장, 미리보기, 업로드 같은 프로젝트별 동작은 사용하는 프로젝트에서 adapter로 주입해야 합니다.

`v1.0.0`에서 지원하는 adapter는 다음과 같습니다.

- `saveTemplate({ template, html, editor })`
- `previewPdf({ template, html, sampleData, editor })`
- `uploadImage({ file, template, html, editor })`
- `buildApiUrl(path)`
- `resolveAssetUrl(path)`

`previewPdf`를 제공하지 않으면 `editor.preview()`는 로컬에서 렌더링한 HTML을 반환합니다.

`uploadImage`를 제공하지 않으면 이미지 파일 삽입은 bundled runtime의 로컬 data URL 방식으로 동작합니다.

## 현재 포함 범위

`v1.0.0`에 포함된 기능은 다음과 같습니다.

- 데이터 태그 core 유틸리티
- `client/template-editor-runtime`에서 생성한 브라우저 runtime bundle
- toolbar, tag panel, document surface, page properties panel
- 표, 이미지, barcode, QR 삽입 runtime API
- template 객체의 `documentHtml` 읽기/쓰기 helper
- `editor.insertImage(file)`과 toolbar file input을 위한 이미지 업로드 adapter 지원
- scoped CSS export
- TypeScript 선언 파일
- Node unit test, TypeScript API test, browser scenario test, pack check, consumer install verification

의도적으로 포함하지 않은 애플리케이션 전용 기능은 다음과 같습니다.

- ExamList route/navigation 연동
- ExamList API client
- PDF 생성 worker/server renderer
- 계정, 학교, 권한 관리 화면
- XLSX import와 운영 데이터 관리 화면

위 기능은 각 프로젝트에서 직접 구현하거나 adapter로 연결해야 합니다.

## 검증

패키지 폴더에서 전체 검증을 실행할 수 있습니다.

```bash
npm run verify
```

이 명령은 다음 검증을 실행합니다.

- runtime/CSS build
- `node --test`
- TypeScript public API check
- Playwright Chromium browser scenario
- `npm pack --dry-run`
- local consumer install and import verification

## 원본 소스 추적

이 패키지를 만들 때 사용한 ExamList 원본 소스 파일과 의도적으로 변경한 내용은 [docs/migration.md](docs/migration.md)에 정리되어 있습니다.
