import test from "node:test";
import assert from "node:assert/strict";
import {buildImagePrompt} from "../app/lib/imagePrompt.js";
const cloud={
 visualBrief:"A blue sky over the sea with a developing natural cumulus cloud above a sunlit coast.",
 scene:{subject:"developing cumulus cloud",setting:"coast and sea",objects:["sea","cloud","sky"],avoid:["volcanic eruption","ash plume"]}
};
test("dynamic image prompt reflects the ANSWER rather than a topic preset",()=>{
 const prompt=buildImagePrompt(cloud,{mode:"create"},false);
 assert.match(prompt,/coast and sea/);
 assert.match(prompt,/volcanic eruption/);
 assert.doesNotMatch(prompt,/sunlight warms the ground|amber streamlines|cauliflower-shaped cumulus/i);
 assert.doesNotMatch(prompt,/LOCKED TRUTH|VISUAL EDIT CONTRACT|mustShow|criticalErrors|JSON/i);
 assert.match(prompt,/No text/i);
});
test("physical subject and setting are mandatory before any image prompt",()=>{
 assert.throws(()=>buildImagePrompt({visualBrief:cloud.visualBrief},{}),/ANSWER_FIRST_SCENE_REQUIRED/);
 assert.throws(()=>buildImagePrompt({...cloud,scene:{subject:"cloud",setting:"sky",objects:[]}},{}),/ANSWER_FIRST_OBJECTS_REQUIRED/);
});
test("rejects internal instructions embedded in the scene description",()=>{
 assert.throws(()=>buildImagePrompt({...cloud,visualBrief:"LOCKED TRUTH: clouds rise"},{}),/unsafe visual brief/i);
});
test("volcano and meteorology cannot be conflated by a hardcoded guard",()=>{
 const volcano={visualBrief:"An active volcanic cone releasing an ash plume under a dark sky.",scene:{subject:"volcanic eruption",setting:"volcanic mountain",objects:["lava","ash plume"],avoid:["cumulus weather diagram"]}};
 const prompt=buildImagePrompt(volcano);
 assert.match(prompt,/volcanic eruption/);
 assert.match(prompt,/ash plume/);
 assert.doesNotMatch(prompt,/no eruption, smoke column|sunlight warms the ground/i);
});
