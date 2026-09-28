import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {acceptedStageFocus} from '../app/lib/stageFocus.js';

test('only visible and bounded image-localized stages move the camera',()=>{
 const steps=[{title:'ground'},{title:'cloud'}];
 assert.deepEqual(acceptedStageFocus([
  {index:0,x:.4,y:.7,visible:true},
  {index:1,x:.8,y:.2,visible:false},
  {index:1,x:2,y:.2,visible:true},
  {index:0,x:.5,y:.5,visible:true}
 ],steps),[{index:0,x:.4,y:.7}]);
 assert.deepEqual(acceptedStageFocus(null,steps),[]);
});
