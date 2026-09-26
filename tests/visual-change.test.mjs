import test from "node:test";
import assert from "node:assert/strict";
import {visualChangePlan} from "../app/lib/visualChange.js";
import {readFileSync} from "node:fs";

test("a ceiling fan must be replaced, not preserved, when user asks for a pedestal fan",()=>{
 const plan=visualChangePlan(
  "حوّل المروحة السقفية الموجودة أمامي إلى مروحة عمودية على الأرض، افتح المحرك وأظهر تفاصيله",
  "كيف تعمل المروحة السقفية؟",true);
 assert.equal(plan.mode,"replace");
 assert.equal(plan.pedestalConversion,true);
 assert.equal(plan.changeRequired,true);
 assert.ok(plan.required.some(x=>x.includes("floor pedestal fan")));
 assert.ok(plan.forbidden.includes("ceiling-mounted fan"));
 assert.match(plan.continuity,/NOT a geometry lock/);
});

test("a follow-up about airflow changes the explanation but keeps the fan",()=>{
 const plan=visualChangePlan("كيف يتحرك الهواء حول الشفرات لتبريد الغرفة؟","كيف تعمل المروحة السقفية؟",true);
 assert.equal(plan.mode,"explain");
 assert.ok(plan.required.some(x=>x.includes("not merely")));
});
test("a cutaway has a visibly different visual contract",()=>{
 const plan=visualChangePlan("افتح المحرك واعرض التفاصيل الداخلية","مروحة",true);
 assert.equal(plan.mode,"explore");
 assert.ok(plan.required.some(x=>x.includes("cutaway")));
});
test("an initial question has no replacement precondition",()=>{
 const plan=visualChangePlan("كيف يعمل القلب؟","",false);
 assert.equal(plan.mode,"create");
 assert.equal(plan.changeRequired,false);
});

test("living journey stores full turns in IndexedDB, not transient-only state",()=>{
 const journal=readFileSync(new URL("../app/lib/livingHistory.js",import.meta.url),"utf8");
 const page=readFileSync(new URL("../app/living-engine/page.js",import.meta.url),"utf8");
 assert.match(journal,/indexedDB\.open/);
 assert.match(journal,/createObjectStore\("turns"/);
 assert.match(journal,/createObjectStore\("worlds"/);
 assert.match(page,/await persist\(world,pending\)/);
 assert.match(page,/await persist\(world,done\)/);
 assert.match(page,/await persist\(world,failed\)/);
 assert.match(page,/listTurns\(saved\[0\]\.id\)/);
});
test("visual result must pass a change-fulfilment review before it is shown",()=>{
 const route=readFileSync(new URL("../app/api/generate-visual/route.js",import.meta.url),"utf8");
 assert.match(route,/verdict\.changeFulfilled!==true/);
 assert.match(route,/changePlan\.continuity/);
 assert.match(route,/change-not-fulfilled/);
});
