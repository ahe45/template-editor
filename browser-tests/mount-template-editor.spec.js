import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
]);

function getSafeFilePath(requestUrl) {
  const url = new URL(requestUrl, "http://127.0.0.1");
  const decodedPath = decodeURIComponent(url.pathname);
  const relativePath = normalize(decodedPath.replace(/^\/+/, ""));
  const filePath = resolve(packageRoot, relativePath || "index.html");

  if (filePath !== packageRoot && !filePath.startsWith(`${packageRoot}${sep}`)) {
    return null;
  }

  return filePath;
}

async function startStaticServer() {
  const server = createServer((request, response) => {
    const filePath = getSafeFilePath(request.url || "/");

    if (!filePath || !existsSync(filePath)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes.get(extname(filePath)) || "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  });

  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));

  return {
    close: () => new Promise((resolveClose) => server.close(resolveClose)),
    url: `http://127.0.0.1:${server.address().port}`,
  };
}

test.describe("mountTemplateEditor browser integration", () => {
  let server;

  test.beforeAll(async () => {
    server = await startStaticServer();
  });

  test.afterAll(async () => {
    await server.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
      const targetIds = new WeakMap();
      const listenerIds = new WeakMap();
      const activeListeners = new Set();
      const activeListenerDetails = new Map();
      let nextTargetId = 0;
      let nextListenerId = 0;

      function getTargetId(target) {
        if (!targetIds.has(target)) {
          targetIds.set(target, ++nextTargetId);
        }

        return targetIds.get(target);
      }

      function getListenerId(listener) {
        if (!listenerIds.has(listener)) {
          listenerIds.set(listener, ++nextListenerId);
        }

        return listenerIds.get(listener);
      }

      function getCaptureFlag(options) {
        return typeof options === "boolean" ? options : Boolean(options?.capture);
      }

      function getKey(target, type, listener, options) {
        return `${getTargetId(target)}:${type}:${getListenerId(listener)}:${getCaptureFlag(options)}`;
      }

      function getTargetLabel(target) {
        if (target === window) {
          return "window";
        }

        if (target === document) {
          return "document";
        }

        if (target instanceof Element) {
          const root = target.closest?.(".examlist-template-editor");
          return root
            ? `editor:${root.id || root.dataset.examlistTemplateEditorInstance || "unknown"}:${target.tagName.toLowerCase()}`
            : `element:${target.id || target.tagName.toLowerCase()}`;
        }

        return Object.prototype.toString.call(target);
      }

      EventTarget.prototype.addEventListener = function addTrackedEventListener(type, listener, options) {
        if (typeof listener === "function" || (listener && typeof listener.handleEvent === "function")) {
          const key = getKey(this, type, listener, options);
          activeListeners.add(key);
          activeListenerDetails.set(key, {
            capture: getCaptureFlag(options),
            targetRef: this,
            type,
          });
        }

        return originalAddEventListener.call(this, type, listener, options);
      };

      EventTarget.prototype.removeEventListener = function removeTrackedEventListener(type, listener, options) {
        if (typeof listener === "function" || (listener && typeof listener.handleEvent === "function")) {
          const key = getKey(this, type, listener, options);
          activeListeners.delete(key);
          activeListenerDetails.delete(key);
        }

        return originalRemoveEventListener.call(this, type, listener, options);
      };

      window.__templateEditorListenerTracker = {
        activeCount: () => activeListeners.size,
        activeDetails: () =>
          Array.from(activeListenerDetails.values()).map((detail) => ({
            capture: detail.capture,
            connected:
              detail.targetRef instanceof Node
                ? detail.targetRef.isConnected
                : detail.targetRef === window || detail.targetRef === document,
            target: getTargetLabel(detail.targetRef),
            type: detail.type,
          })),
        restore: () => {
          EventTarget.prototype.addEventListener = originalAddEventListener;
          EventTarget.prototype.removeEventListener = originalRemoveEventListener;
        },
      };
    });
  });

  test("mounts multiple editors, adapts template values, previews, saves, and cleans up", async ({ page }) => {
    const browserMessages = [];
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) {
        browserMessages.push(`${message.type()}: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      browserMessages.push(`pageerror: ${error.stack || error.message}`);
    });
    page.on("requestfailed", (request) => {
      browserMessages.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ""}`);
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        browserMessages.push(`response: ${response.status()} ${response.url()}`);
      }
    });

    await page.goto(`${server.url}/browser-tests/pages/mount.html`);
    try {
      await page.waitForFunction(() => window.__templateEditorReady === true, null, { timeout: 10_000 });
    } catch (error) {
      throw new Error(`${error.message}\nBrowser messages:\n${browserMessages.join("\n") || "(none)"}`);
    }

    await expect(page.locator("#editorA .editor-toolbar")).toBeVisible();
    await expect(page.locator("#editorA [data-template-editor-runtime-surface]")).toContainText("첫 번째");
    await expect(page.locator("#editorB [data-template-editor-runtime-surface]")).toContainText("두 번째");

    const duplicateIds = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll(".examlist-template-editor [id]"), (element) => element.id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicateIds).toEqual([]);

    const interactionResult = await page.evaluate(async () => {
      window.editorA.setValue(
        {
          layout: {
            pages: [
              {
                id: "page-1",
                settings: {
                  documentHtml: "<p>변경된 본문</p>",
                },
              },
            ],
          },
        },
        { notify: true },
      );
      window.editorA.insertHtml("<table><tbody><tr><td>셀</td></tr></tbody></table>");
      window.editorA.insertHtml('<img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="샘플" />');

      const preview = await window.editorA.preview({ name: "김철수", examineeNo: "A100" });
      const saved = await window.editorA.save({ reason: "browser-test" });

      return {
        changeEvents: window.changeEvents,
        dirtyAfterSave: window.editorA.isDirty(),
        html: window.editorA.getHtml(),
        previewHtml: preview.html,
        saved,
        value: window.editorA.getValue(),
      };
    });

    expect(interactionResult.html).toContain("변경된 본문");
    expect(interactionResult.html).toContain("<table");
    expect(interactionResult.html).toContain("<img");
    expect(interactionResult.value.layout.pages[0].settings.documentHtml).toContain("변경된 본문");
    expect(interactionResult.previewHtml).toContain("변경된 본문");
    expect(interactionResult.saved.layout.pages[0].settings.documentHtml).toContain("변경된 본문");
    expect(interactionResult.changeEvents.length).toBeGreaterThanOrEqual(1);
    expect(interactionResult.dirtyAfterSave).toBe(false);

    const readOnlyState = await page.evaluate(() => {
      const surface = document.querySelector("#editorReadOnly [data-template-editor-runtime-surface]");
      const button = document.querySelector("#editorReadOnly button");
      window.editorReadOnly.setReadOnly(false);
      const unlocked = {
        buttonDisabled: button.disabled,
        contenteditable: surface.getAttribute("contenteditable"),
      };
      window.editorReadOnly.setReadOnly(true);

      return {
        buttonDisabled: button.disabled,
        contenteditable: surface.getAttribute("contenteditable"),
        unlocked,
      };
    });

    expect(readOnlyState.contenteditable).toBe("false");
    expect(readOnlyState.buttonDisabled).toBe(true);
    expect(readOnlyState.unlocked.contenteditable).toBe("true");
    expect(readOnlyState.unlocked.buttonDisabled).toBe(false);

    const cssScope = await page.evaluate(() => {
      const outsideButton = document.getElementById("outsideButton");
      const style = getComputedStyle(outsideButton);

      return {
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
      };
    });
    expect(cssScope.backgroundColor).toBe("rgb(1, 2, 3)");
    expect(cssScope.borderRadius).toBe("0px");

    const cleanup = await page.evaluate(() => {
      const beforeDestroy = window.__templateEditorListenerTracker.activeCount();
      window.editorA.destroy();
      window.editorB.destroy();
      window.editorReadOnly.destroy();
      const details = window.__templateEditorListenerTracker.activeDetails();
      const runtimeLeaks = details.filter((detail) => {
        if (detail.target.startsWith("editor:") && detail.connected) {
          return true;
        }

        if (detail.target === "document") {
          return !["__playwright_global_listeners_check__"].includes(detail.type);
        }

        if (detail.target === "window") {
          return ![
            "__playwright_global_listeners_check__",
            "auxclick",
            "click",
            "contextmenu",
            "dblclick",
            "mousedown",
            "mousemove",
            "mouseup",
            "pointerdown",
            "pointerup",
            "touchcancel",
            "touchend",
            "touchstart",
          ].includes(detail.type);
        }

        return false;
      });
      window.__templateEditorListenerTracker.restore();

      return { beforeDestroy, details, runtimeLeaks };
    });

    expect(cleanup.beforeDestroy).toBeGreaterThan(0);
    expect(cleanup.runtimeLeaks, JSON.stringify(cleanup.details, null, 2)).toEqual([]);
  });
});
