import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("build includes development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  const workerSource = await readFile(workerUrl, "utf8");
  assert.match(workerSource, /"codex-preview":\s*"development"/);
});
