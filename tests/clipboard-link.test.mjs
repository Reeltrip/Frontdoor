import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let readClipboardLink;

before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: "custom",
    logLevel: "silent",
  });
  ({ readClipboardLink } = await server.ssrLoadModule(
    "/src/features/source/lib/readClipboardLink.ts",
  ));
});

after(async () => {
  await server.close();
});

test("읽기 권한이 없거나 확인할 수 없으면 클립보드를 읽지 않아요", async (t) => {
  const readText = t.mock.fn();
  const browser = { clipboard: { readText } };
  t.mock.method(globalThis, "navigator", () => browser, { getter: true });

  const options = { requireGrantedPermission: true };
  assert.equal(await readClipboardLink(options), null);
  for (const state of ["prompt", "denied"]) {
    browser.permissions = { query: async () => ({ state }) };
    assert.equal(await readClipboardLink(options), null);
  }
  browser.permissions = {
    query: async () => { throw new TypeError("Unsupported permission"); },
  };
  assert.equal(await readClipboardLink(options), null);
  assert.equal(readText.mock.callCount(), 0);
});

test("읽기 권한이 있으면 빈 내용은 건너뛰고 유효한 링크를 가져와요", async (t) => {
  let clipboardText = " ";
  const browser = {
    permissions: { query: async () => ({ state: "granted" }) },
    clipboard: { readText: async () => clipboardText },
  };
  t.mock.method(globalThis, "navigator", () => browser, { getter: true });

  const options = { requireGrantedPermission: true };
  assert.equal(await readClipboardLink(options), null);
  clipboardText = "  https://example.com/trip  ";
  assert.equal(await readClipboardLink(options), "https://example.com/trip");
});

test("사용자가 클립보드 읽기를 직접 요청하면 권한 사전 확인 없이 읽어요", async (t) => {
  const browser = { clipboard: { readText: async () => "https://example.com" } };
  t.mock.method(globalThis, "navigator", () => browser, { getter: true });

  assert.equal(await readClipboardLink(), "https://example.com");
});
