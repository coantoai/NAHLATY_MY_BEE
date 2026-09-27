import test from 'node:test';
import assert from 'node:assert/strict';
import { buildImagePrompt } from '../app/lib/imagePrompt.js';

test('image prompt uses the physical scene brief without exposing truth-gate instructions', () => {
 const prompt=buildImagePrompt({visualBrief:'Warm moist air rises, cools, and forms a towering cumulus cloud.'},{mode:'create'},false);
 assert.match(prompt,/Warm moist air rises/);
 assert.doesNotMatch(prompt,/LOCKED TRUTH|VISUAL EDIT CONTRACT|mustShow|criticalErrors|JSON/i);
 assert.match(prompt,/no text/i);
});

test('image prompt rejects a brief contaminated with internal instructions', () => {
 assert.throws(()=>buildImagePrompt({visualBrief:'LOCKED TRUTH: clouds rise'},{mode:'create'},false),/unsafe visual brief/i);
});


test('cloud scenes specify meteorology to avoid a volcanic plume interpretation', () => {
 const prompt=buildImagePrompt({topic:'السحب الركامية',visualBrief:'Warm moist air rises and forms towering cloud towers.'});
 assert.match(prompt,/broad diffuse low cloud base/);
 assert.match(prompt,/no eruption, smoke column, ash, fire, explosion/);
 const unrelated=buildImagePrompt({topic:'volcano',visualBrief:'A volcano erupts under the night sky.'});
 assert.doesNotMatch(unrelated,/no eruption, smoke column/);
});
