"""Browser regression checks. Requires Playwright and Chromium; run against a dev/preview URL."""
import argparse, json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:3019');parser.add_argument('--output',default='/tmp/nahlaty-heart-qa');args=parser.parse_args()
out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
checks=[]
def passed(name):checks.append(name);print('PASS',name,flush=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad'])
 context=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='no-preference')
 fixture={'title':'Runtime regression','visual':'concept','presentation':{'auto3d':'manual','challengeStyle':'direct'},'sceneGraph':{'world':{'dimension':'2d'},'nodes':[{'id':'one','label':'One','x':30,'y':40},{'id':'two','label':'Two','x':70,'y':50}],'edges':[]},'steps':[{'title':'Existing scene','text':'Generic runtime','runtime':{'focusNodeIds':['one'],'visibleNodeIds':['one','two']}}]}
 saved=json.dumps({'content':'regression fixture','audience':'عام','result':fixture,'active':0})
 context.add_init_script('if(!localStorage.getItem("mybee:last-session"))localStorage.setItem("mybee:last-session",'+json.dumps(saved)+')')
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(args.url+'/lab/premium-heart-vector')
 page.wait_for_selector('[data-native-node-id]',timeout=15000)
 assert page.locator('#heart-root image').count()==0
 assert page.locator('#heart-root path').count()==639
 passed('native vector loads automatically; no raster')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 passed('desktop has no horizontal overflow')
 ids=['heart.exterior','heart.upperVessels','heart.sideVessels','heart.lowerVessels']
 for concept in ids:
  part=page.locator('[data-native-node-id="'+concept+'"]').first
  part.dispatch_event('click')
  page.wait_for_function('(id)=>document.querySelector(`button.graphNode[data-node-id="${id}"]`).classList.contains("selectedNode")',arg=concept)
  assert part.get_attribute('aria-pressed')=='true'
 passed('all four visible parts select through existing runtime')
 part=page.locator('[data-native-node-id="heart.upperVessels"]').first
 part.focus();page.keyboard.press('Enter')
 assert page.locator('button.graphNode[data-node-id="heart.upperVessels"]').evaluate('(e)=>e.classList.contains("selectedNode")')
 passed('keyboard selects actual SVG geometry')
 page.get_by_role('button',name='إعادة المشهد',exact=True).click(force=True)
 label=page.locator('button.graphNode[data-node-id="heart.sideVessels"]')
 geometry=page.locator('[data-native-node-id="heart.sideVessels"]')
 before=geometry.bounding_box();box=label.bounding_box();other=page.locator('[data-native-node-id="heart.upperVessels"]').bounding_box()
 page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);page.mouse.down();page.mouse.move(box['x']+box['width']/2+55,box['y']+box['height']/2+20,steps=8);page.mouse.up()
 after=geometry.bounding_box();other_after=page.locator('[data-native-node-id="heart.upperVessels"]').bounding_box()
 assert abs((after['x']-before['x'])-55)<4,(before,after)
 assert abs((after['y']-before['y'])-20)<4,(before,after)
 assert abs(other_after['x']-other['x'])<1
 passed('drag moves actual part in screen coordinates and preserves other parts')
 page.get_by_role('button',name='إعادة المشهد',exact=True).click(force=True)
 restored=geometry.bounding_box();assert abs(restored['x']-before['x'])<1
 passed('runtime reset restores geometry')
 page.get_by_role('button',name='إخفاء التسميات',exact=True).click()
 assert label.evaluate('(e)=>getComputedStyle(e).visibility')=='hidden'
 assert geometry.is_visible()
 geometry.dispatch_event('click')
 assert geometry.get_attribute('aria-pressed')=='true'
 page.get_by_role('button',name='إظهار التسميات',exact=True).click()
 passed('labels toggle keeps SVG selectable')
 page.get_by_role('button',name='إخفاء الأوعية',exact=True).click()
 assert not geometry.is_visible()
 assert page.locator('[data-native-node-id="heart.exterior"]').first.is_visible()
 page.get_by_role('button',name='إظهار الأوعية',exact=True).click()
 assert geometry.is_visible()
 passed('vessels layer toggles independently of exterior')
 page.locator('.immersiveControls button').filter(has_text='＋').click(force=True)
 assert '110%' in page.locator('.immersiveControls').inner_text()
 page.get_by_role('button',name='إعادة المشهد',exact=True).click(force=True)
 assert '100%' in page.locator('.immersiveControls').inner_text()
 passed('existing zoom and reset controls work')
 slider=page.get_by_role('slider',name='BPM')
 for bpm,duration in [(40,1.5),(180,1/3)]:
  slider.focus();slider.press('Home' if bpm==40 else 'End')
  period=page.locator('[data-playing]').evaluate('(e)=>parseFloat(getComputedStyle(e).getPropertyValue("--native-motion-speed"))')
  assert abs(period-duration)<.001,(bpm,period)
 passed('40 and 180 BPM change native pulse period')
 page.locator('.playButton').click()
 page.wait_for_function('document.querySelector("[data-playing]").dataset.playing==="true"')
 page.locator('.playButton').click()
 assert page.locator('[data-playing]').get_attribute('data-playing')=='false'
 passed('existing play/pause controls native animation')
 page.get_by_role('button',name='إعادة الضبط',exact=True).click()
 page.wait_for_selector('[data-native-node-id]')
 assert slider.input_value()=='60'
 passed('lab reset restores BPM and runtime')
 page.screenshot(path=str(out/'desktop.png'),full_page=True)
 for width in [390,768]:
  page.set_viewport_size({'width':width,'height':844});page.wait_for_timeout(100)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
  assert page.locator('#heart-root').is_visible()
  page.screenshot(path=str(out/f'{width}.png'),full_page=True)
 passed('mobile and tablet responsive checks')
 assert not errors,errors
 passed('no browser runtime errors')
 assert page.evaluate('localStorage.getItem("mybee:last-session")')==saved
 passed('embedded lab preserves existing home session')
 page.set_viewport_size({'width':1440,'height':1000});page.goto(args.url+'/')
 page.wait_for_selector('button.graphNode[data-node-id="one"]')
 assert page.locator('#heart-root').count()==0
 assert page.locator('.actorVisual').count()==2
 page.locator('button.graphNode[data-node-id="one"]').click()
 assert page.locator('button.graphNode[data-node-id="one"]').evaluate('(e)=>e.classList.contains("selectedNode")')
 passed('generic runtime and saved scene still restore/select')
 fixture['sceneGraph']['nativeSvg']={'svg':'<svg onload="window.unsafeHeartExecuted=true"><path/><path/><path/><path/></svg>','bindings':[]}
 page.evaluate('(saved)=>localStorage.setItem("mybee:last-session",saved)',json.dumps({'result':fixture,'active':0}))
 page.reload();page.wait_for_selector('button.graphNode')
 assert page.locator('svg[onload]').count()==0
 assert page.evaluate('window.unsafeHeartExecuted') is None
 passed('unsafe native SVG from saved sessions is rejected before insertion')
 browser.close()
(out/'results.json').write_text(json.dumps({'checks':checks,'passed':len(checks),'url':args.url},indent=2))
