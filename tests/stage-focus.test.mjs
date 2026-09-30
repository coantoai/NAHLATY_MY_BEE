import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {acceptedStageFocus,cameraFrame,imagePointAt,mergeStageFocus,missingStageIndices,normalizeTextContent,resolveStageFocus,selectStagesForLocalization,stageFocusDiagnostics} from '../app/lib/stageFocus.js';
import {cloudFixture} from '../app/lib/cloudFixture.js';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

test('missing or invalid image regions never create a camera target',()=>{
 const steps=[{},{}];
 assert.deepEqual(acceptedStageFocus([],steps),[]);
 assert.deepEqual(acceptedStageFocus([{index:0,visible:false,x:.4,y:.6},{index:1,visible:true,x:2,y:.2}],steps),[]);
 assert.deepEqual(acceptedStageFocus([{index:0,visible:true,x:.4,y:.6}],steps),[{index:0,x:.4,y:.6,visible:true}]);
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

test('partial review results still locate every missing stage and preserve reviewed coordinates',()=>{
 const steps=[{title:'one'},{title:'two'},{title:'three'}];
 const reviewed=[{index:0,visible:true,x:.2,y:.3}];
 const missing=missingStageIndices(reviewed,steps);
 assert.deepEqual(missing,[1,2]);
 const merged=mergeStageFocus(reviewed,[{index:1,visible:true,x:.6,y:.4},{index:2,visible:true,x:.8,y:.7}],steps);
 assert.deepEqual(merged.map(x=>x.index),[0,1,2]);
 assert.equal(merged[0].x,.2);
 assert.deepEqual(missingStageIndices(merged,steps),[]);
});

test('provider text blocks are normalized before JSON parsing',()=>{
 assert.equal(normalizeTextContent('plain response'),'plain response');
 assert.equal(normalizeTextContent([{type:'text',text:'{"stageFocus":['},{type:'text',text:'{"index":0}]}' }]),'{"stageFocus":[{"index":0}]}');
 assert.equal(normalizeTextContent([{type:'image',image_url:'ignored'},{type:'text',text:'ok'}]),'ok');
});

test('stage focus diagnostics distinguish absent targets from complete coverage',()=>{
 const steps=[{title:'one'},{title:'two'}];
 assert.deepEqual(stageFocusDiagnostics([],steps),{status:'no-targets',expected:2,located:0,missing:[0,1]});
 assert.deepEqual(stageFocusDiagnostics([{index:0,visible:true,x:.2,y:.3}],steps),{status:'partial',expected:2,located:1,missing:[1]});
 assert.deepEqual(stageFocusDiagnostics([{index:0,visible:true,x:.2,y:.3},{index:1,visible:true,x:.8,y:.7}],steps),{status:'complete',expected:2,located:2,missing:[]});
});

test('resolved focus combines both image reviews and keeps their evidence source',()=>{
 const steps=[{title:'one'},{title:'two'}];
 const resolved=resolveStageFocus(
  [{index:0,visible:true,x:.2,y:.3,source:'visual-review'}],
  [{index:1,visible:true,x:.8,y:.7,source:'image-locator'}],
  steps
 );
 assert.deepEqual(resolved.regions.map(region=>region.source),['visual-review','image-locator']);
 assert.equal(resolved.diagnostics.status,'complete');
});

test('localization requests retain original stage indices when only gaps are retried',()=>{
 const steps=[{title:'one'},{title:'two'},{title:'three'},{title:'four'}];
 assert.deepEqual(selectStagesForLocalization(steps,[1,3]),[
  {index:1,title:'two',text:''},
  {index:3,title:'four',text:''}
 ]);
});

test('image target coordinates and locator outcomes are persisted and restored together',()=>{
 const page=readFileSync(new URL('../app/living-engine/page.js',import.meta.url),'utf8');
 const route=readFileSync(new URL('../app/api/generate-visual/route.js',import.meta.url),'utf8');
 assert.match(route,/stageFocusDiagnostics:focusDiagnostics/);
 assert.match(page,/imageStageFocusDiagnostics=ip\?\.stageFocusDiagnostics/);
 assert.match(page,/stageFocusDiagnostics:imageStageFocusDiagnostics/);
 assert.match(page,/setStageFocusDiagnostics\(last\.stageFocusDiagnostics/);
});

test('a user can ground an unresolved stage by tapping the visible image region',()=>{
 const steps=[{title:'one'}];
 const point=imagePointAt(160,80,{left:100,top:20,width:200,height:120});
 assert.deepEqual(point,{x:.3,y:.5});
 assert.deepEqual(acceptedStageFocus([{index:0,...point,visible:true,source:'user-selected'}],steps),[
  {index:0,x:.3,y:.5,visible:true,source:'user-selected'}
 ]);
 assert.equal(imagePointAt(0,0,{left:0,top:0,width:0,height:0}),null);
});

test('mobile notes below the image remain in normal flow without negative overlap',()=>{
 const page=readFileSync(new URL('../app/living-engine/page.js',import.meta.url),'utf8');
 assert.doesNotMatch(page,/margin:\"-6px 4px 12px\"/);
 assert.match(page,/margin:\"8px 4px 12px\",lineHeight:1\.5/);
});
