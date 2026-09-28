import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {acceptedStageFocus,cameraFrame} from '../app/lib/stageFocus.js';
import {cloudFixture} from '../app/lib/cloudFixture.js';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

test('missing or invalid image regions never create a camera target',()=>{
 const steps=[{},{}];
 assert.deepEqual(acceptedStageFocus([],steps),[]);
 assert.deepEqual(acceptedStageFocus([{index:0,visible:false,x:.4,y:.6},{index:1,visible:true,x:2,y:.2}],steps),[]);
 assert.deepEqual(acceptedStageFocus([{index:0,visible:true,x:.4,y:.6}],steps),[{index:0,x:.4,y:.6}]);
});

test('cloud fixture targets are tied to one documented 2048 by 1280 image',()=>{
 const jpg=readFileSync(new URL('../public/lab/clouds-stage-focus-2k.jpg',import.meta.url));
 assert.equal(createHash('sha256').update(jpg).digest('hex'),cloudFixture.imageSha256);
 const sof=jpg.indexOf(Buffer.from([0xff,0xc0]));
 assert.ok(sof>0,'baseline JPEG must contain a frame header');
 assert.equal(jpg.readUInt16BE(sof+5),cloudFixture.height);
 assert.equal(jpg.readUInt16BE(sof+7),cloudFixture.width);
 assert.equal(cloudFixture.width,2048);
 assert.equal(cloudFixture.height,1280);
 assert.deepEqual(acceptedStageFocus(cloudFixture.stageFocus,cloudFixture.steps).map(x=>x.effect),['updraft','cooling','droplets','tower']);
 assert.equal(cloudFixture.stageFocus[1].source,'designed-layer');
});

test('camera transforms image coordinates while keeping the viewport covered',()=>{
 const left=cameraFrame({x:.1,y:.8},1.7),right=cameraFrame({x:.9,y:.2},1.7);
 assert.notEqual(left.tx,right.tx);
 for(const frame of [left,right]){
  assert.ok(frame.tx<=0&&frame.tx>=1-frame.scale);
  assert.ok(frame.ty<=0&&frame.ty>=1-frame.scale);
 }
 assert.deepEqual(cameraFrame(null),{scale:1,tx:0,ty:0});
});
