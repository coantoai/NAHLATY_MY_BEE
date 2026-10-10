import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Issue #6 E2E marker remains visible and machine-detectable",async()=>{
 const layout=await readFile(new URL("../app/layout.js",import.meta.url),"utf8");
 const styles=await readFile(new URL("../app/globals.css",import.meta.url),"utf8");

 assert.match(layout,/data-e2e-smoke="issue-6"/);
 assert.match(layout,/E2E · #6/);
 assert.match(styles,/\.e2eSmokeBadge\{/);
});
