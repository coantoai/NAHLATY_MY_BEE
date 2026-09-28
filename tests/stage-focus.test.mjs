import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {acceptedStageFocus,sceneStageFocus} from '../app/lib/stageFocus.js';

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

test('cloud lab composes distinct grounded camera targets and never applies to another topic',()=>{
 const steps=[{title:'الهواء الدافئ يرتفع'},{title:'الهواء يبرد'},{title:'يتكثف بخار الماء إلى قطرات'},{title:'تنمو السحابة الركامية'}];
 const focus=sceneStageFocus([],steps,'كيف تتكوّن السحب الركامية؟');
 assert.deepEqual(focus.map(x=>x.effect),['updraft','cooling','droplets','tower']);
 assert.deepEqual(sceneStageFocus([],steps,'كيف يعمل القلب؟'),[]);
 assert.equal(sceneStageFocus([{index:2,visible:true,x:.2,y:.3}],steps,'السحب')[0].x,.2);
});
