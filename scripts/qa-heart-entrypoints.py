"""Exercise real heart question entrypoints and existing native runtime controls.

Requires Playwright and Chromium; never requests paid generation.
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--url',default='http://127.0.0.1:3019')
parser.add_argument('--output',default='/tmp/nahlaty-heart-entrypoints')
parser.add_argument('--chromium',default='/usr/bin/chromium')
args=parser.parse_args()
out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
checks=[];errors=[];paid=[];timing=[];failure=None

def passed(name):
 checks.append(name);print('PASS',name,flush=True)

def tempo(page,bpm):
 page.get_by_role('slider',name='BPM',exact=True).evaluate('''(input,bpm)=>{
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,String(bpm));
  input.dispatchEvent(new Event('input',{bubbles:true}));
  input.dispatchEvent(new Event('change',{bubbles:true}));
 }''',bpm)
 expected=60000/bpm
 page.wait_for_function('''expected=>{
  const animations=document.querySelector('#heart-root').getAnimations({subtree:true}).filter(a=>a.effect.target.dataset.heartMotion);
  return animations.length>0&&animations.every(a=>Math.abs(a.effect.getTiming().duration-expected)<1);
 }''',arg=expected,timeout=10000)
 durations=page.evaluate("[...document.querySelector('#heart-root').getAnimations({subtree:true})].filter(a=>a.effect.target.dataset.heartMotion).map(a=>a.effect.getTiming().duration)")
 timing.append({'bpm':bpm,'durations':durations})
 assert page.locator('[data-testid="cardiac-output"]').inner_text()==f'{bpm*.07:.1f} L/min'

def native(page):
 page.wait_for_selector('#heart-root',timeout=20000)
 assert page.locator('#heart-root image').count()==0
 assert page.locator('#heart-root [data-concept-id="heart.leftVentricle"]').count()>0
 assert page.locator('.cinematicMeaningImage,.cinematicScene').count()==0

def separate_labels(page):
 boxes=page.locator('.graphNode').evaluate_all('''nodes=>nodes.filter(e=>{
  const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden';
 }).map(e=>{const b=e.getBoundingClientRect();return {id:e.dataset.nodeId,left:b.left,right:b.right,top:b.top,bottom:b.bottom};})''')
 for i,a in enumerate(boxes):
  for b in boxes[i+1:]:
   assert min(a['right'],b['right'])-max(a['left'],b['left'])<=1 or min(a['bottom'],b['bottom'])-max(a['top'],b['top'])<=1, (a,b)

with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=args.chromium,headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad'])
 def fresh(width=1440,height=1000):
  context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='no-preference')
  page=context.new_page()
  page.on('pageerror',lambda error:errors.append(str(error)))
  def prohibit_paid(route):
   paid.append(route.request.url);route.abort()
  page.route('**/api/generate-visual',prohibit_paid)
  return context,page
 try:
  context,page=fresh()
  page.goto(args.url+'/')
  page.get_by_role('textbox',name='ما الذي تريد أن تفهمه اليوم؟',exact=True).fill('كيف يعمل القلب؟')
  page.get_by_role('button',name='ابدأ الفهم',exact=True).click()
  native(page)
  assert page.url.rstrip('/')==args.url.rstrip('/')
  assert page.locator('.steps>button').count()==10
  separate_labels(page)
  passed('homepage heart question stays in the existing native runtime with ten lessons')
  tempo(page,40);tempo(page,180)
  passed('main BPM40/180 changes every cardiac animation and educational cardiac output')
  page.get_by_role('button',name='إخفاء التسميات',exact=True).click()
  assert page.locator('.graphNode').first.evaluate('(e)=>getComputedStyle(e).visibility')=='hidden'
  page.get_by_role('button',name='إظهار التسميات',exact=True).click()
  assert page.locator('.graphNode').first.evaluate('(e)=>getComputedStyle(e).visibility')=='visible'
  page.get_by_role('button',name='إخفاء مسار الدم',exact=True).click()
  assert page.locator('#blood-interior').evaluate('(e)=>getComputedStyle(e).visibility')=='hidden'
  page.get_by_role('button',name='إظهار مسار الدم',exact=True).click()
  page.get_by_role('button',name='إخفاء الأوعية',exact=True).click()
  assert page.locator('#vena-cava').evaluate('(e)=>getComputedStyle(e).display')=='none'
  page.locator('.steps>button').nth(3).click()
  page.get_by_role('button',name='إعادة الضبط',exact=True).click()
  assert page.get_by_role('slider',name='BPM',exact=True).input_value()=='60'
  assert page.locator('#blood-interior').evaluate('(e)=>getComputedStyle(e).visibility')=='visible'
  assert page.locator('#vena-cava').evaluate('(e)=>getComputedStyle(e).display')!='none'
  assert page.locator('.steps>button.active').inner_text().startswith('01')
  passed('labels, blood flow, vessels and reset affect actual SVG geometry')
  play=page.locator('.controls .playButton')
  if 'إيقاف' in play.inner_text():play.click()
  page.wait_for_function("[...document.querySelector('#heart-root').getAnimations({subtree:true})].filter(a=>a.effect.target.dataset.heartMotion).every(a=>a.playState==='paused')")
  play.click()
  page.wait_for_function("[...document.querySelector('#heart-root').getAnimations({subtree:true})].filter(a=>a.effect.target.dataset.heartMotion).every(a=>a.playState==='running')")
  play.click()
  passed('existing Play/Pause controls every cardiac animation')
  page.locator('.livingAskBar input').fill('كيف تمنع الصمامات رجوع الدم؟')
  page.locator('.livingAskBar input').press('Enter')
  page.wait_for_function("document.querySelector('.steps>button.active')?.textContent.includes('الصمامات')")
  native(page)
  assert page.locator('.steps>button.active').inner_text().startswith('04')
  passed('homepage follow-up preserves scene index3 and scientific native anatomy')
  page.locator('#explanation-result').screenshot(path=str(out/'homepage-native.png'))
  context.close()

  for route in ['/heart-cinematic','/engine-proof']:
   context,page=fresh();page.goto(args.url+route);native(page)
   assert page.get_by_role('slider',name='BPM',exact=True).count()==1
   if route=='/engine-proof':
    page.locator('.steps>button').nth(3).click()
    page.locator('.livingAskBar input').fill('وليش؟');page.locator('.livingAskBar input').press('Enter')
    page.wait_for_function("document.querySelector('.steps>button.active')?.textContent.includes('الصمامات')&&!document.querySelector('.livingAskBar input')?.disabled")
    native(page)
    assert page.locator('.steps>button.active').inner_text().startswith('04')
    page.locator('.audienceSwitchToggle').click()
    page.locator('.audienceSwitchPanel').get_by_role('button',name='طفل',exact=True).click()
    page.wait_for_function("document.querySelector('.viewer')?.classList.contains('experience-child')")
    native(page)
    assert page.locator('.steps>button.active').inner_text().startswith('04')
    assert page.locator('.steps>button').count()==10
    passed('seeded engine-proof follow-up and audience change preserve heart anatomy and selected lesson')
   page.screenshot(path=str(out/(route.strip('/')+'.png')),full_page=True)
   passed(route+' uses the scientific native runtime');context.close()

  context,page=fresh();page.goto(args.url+'/living-engine')
  question=page.get_by_placeholder('ما الذي تريد أن تفهمه؟',exact=True)
  question.fill('كيف يعمل القلب؟');question.press('Enter');native(page)
  assert page.locator('.scienceControls').count()==1
  tempo(page,180)
  assert page.locator('.steps>button').count()==10
  page.locator('#explanation-result').screenshot(path=str(out/'living-native.png'))
  passed('living-engine heart question embeds native anatomy and working controls');context.close()

  context,page=fresh(390,844);page.goto(args.url+'/')
  page.get_by_role('button',name='كيف يعمل القلب؟',exact=True).click();native(page)
  page.locator('#explanation-result').scroll_into_view_if_needed()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert page.get_by_role('slider',name='BPM',exact=True).count()==1
  assert page.locator('.scienceControls').is_visible()
  assert page.locator('.explainHeader h3').evaluate('(e)=>{const b=e.getBoundingClientRect();return b.width>0&&b.left>=-1&&b.right<=innerWidth+1}')
  assert page.locator('.graphNode').evaluate_all('(nodes)=>nodes.filter(e=>getComputedStyle(e).display!=="none").every(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.left>=-1&&b.right<=innerWidth+1})')
  separate_labels(page)
  page.screenshot(path=str(out/'mobile-native.png'),full_page=True)
  passed('mobile heart example reaches native controls without horizontal overflow');context.close()
  assert not errors,errors
  assert not paid,paid
 except Exception as error:
  failure=str(error)
  try:page.screenshot(path=str(out/'failure.png'),full_page=True)
  except Exception:pass
  raise
 finally:
  (out/'entrypoint-results.json').write_text(json.dumps({'status':'passed' if failure is None else 'failed','passCount':len(checks),'failure':failure,'checks':checks,'timing':timing,'errors':errors,'paidGenerationRequests':paid},ensure_ascii=False,indent=2))
  browser.close()
