"""Scientific cutaway browser regressions; run against a running dev/preview server.

Requires Playwright and Chromium. Evidence, including failure screenshots and
the actual animation timing samples, is written even when a check fails.
"""

import argparse
import copy
import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright


ANATOMY_IDS = [
    "heart.venaCava", "heart.rightAtrium", "heart.tricuspidValve",
    "heart.rightVentricle", "heart.pulmonaryValve", "heart.pulmonaryArtery",
    "heart.pulmonaryVeins", "heart.leftAtrium", "heart.mitralValve",
    "heart.leftVentricle", "heart.aorticValve", "heart.aorta", "heart.myocardium",
]
ANATOMY_ELEMENTS = dict(zip(ANATOMY_IDS, [
    "vena-cava", "right-atrium", "tricuspid-valve", "right-ventricle",
    "pulmonary-valve", "pulmonary-artery", "pulmonary-veins", "left-atrium",
    "mitral-valve", "left-ventricle", "aortic-valve", "aorta", "myocardium",
]))
# Points in the authored illustration reviewed against each semantic shape.
# Valve checks below use the rendered leaflet matrix because leaflets animate.
ANATOMY_HIT_ANCHORS = {
    "heart.venaCava": [195,140], "heart.rightAtrium": [215,300],
    "heart.tricuspidValve": [235,388], "heart.rightVentricle": [241,450],
    "heart.pulmonaryValve": [294,348], "heart.pulmonaryArtery": [380,182],
    "heart.pulmonaryVeins": [535,236], "heart.leftAtrium": [411,290],
    "heart.mitralValve": [395,371], "heart.leftVentricle": [404,455],
    "heart.aorticValve": [352,343], "heart.aorta": [486,180],
    "heart.myocardium": [491,437],
}
FLOW_PATH = ["circulation.body"] + ANATOMY_IDS[:6] + ["circulation.lungs"] + ANATOMY_IDS[6:12] + ["circulation.body"]
CANONICAL_EDGES = set(zip(FLOW_PATH, FLOW_PATH[1:]))
OXYGENATED_EDGES = set(zip(FLOW_PATH[7:], FLOW_PATH[8:]))
VESSEL_IDS = ["heart.venaCava", "heart.pulmonaryArtery", "heart.pulmonaryVeins", "heart.aorta"]

ANIMATION_SNAPSHOT = """() => {
  const root = document.querySelector('#heart-root');
  return root.getAnimations({subtree:true}).filter(a => {
    const t = a.effect.getTiming();
    return t.iterations === Infinity && typeof t.duration === 'number';
  }).map((a, index) => {
    const target = a.effect.target;
    const style = getComputedStyle(target);
    return {
      key: (target.id || target.tagName + ':' + index) + ':' + (a.animationName || 'animation'),
      name: a.animationName || '',
      target: target.id,
      motion: target.dataset.heartMotion || null,
      node: target.closest('[data-native-node-id]')?.dataset.nativeNodeId || null,
      flow: Boolean(target.closest('[data-oxygenation],#blood-interior')),
      pulse: Boolean(target.closest('[data-heart-motion]')) && !target.closest('[data-oxygenation],#blood-interior'),
      duration: a.effect.getTiming().duration,
      time: a.currentTime,
      state: a.playState,
      opacity: style.opacity,
      dashOffset: style.strokeDashoffset,
      transform: style.transform
    };
  });
}"""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:3019")
    parser.add_argument("--output", default="/workspace/heart-issue23-evidence")
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    args = parser.parse_args()
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    report = {"url": args.url, "checks": [], "animationSamples": {}, "status": "running"}
    page = None
    browser = None
    p = None

    def passed(name, **evidence):
        report["checks"].append({"name": name, "status": "passed", **evidence})
        print("PASS", name, flush=True)

    def part(concept):
        return page.locator(f'#heart-root #{ANATOMY_ELEMENTS[concept]}[data-native-node-id="{concept}"]')

    def label(concept):
        return page.locator(f'button.graphNode[data-node-id="{concept}"]')

    def wait_science(target):
        target.wait_for_selector('#heart-root [data-native-node-id="heart.myocardium"]', timeout=20000)
        target.wait_for_function("""ids => ids.every(id =>
          document.querySelector(`#heart-root [data-native-node-id="${id}"]`))""", arg=ANATOMY_IDS)

    def select(concept, keyboard=None):
        geometry = part(concept)
        if keyboard:
            geometry.focus()
            page.keyboard.press(keyboard)
        else:
            geometry.dispatch_event("click")
        page.wait_for_function("""id =>
          document.querySelector(`button.graphNode[data-node-id="${id}"]`)
            .classList.contains('selectedNode') &&
          document.querySelector(`#heart-root [data-native-node-id="${id}"]`)
            .getAttribute('aria-pressed') === 'true'""", arg=concept)

    def reset_scene():
        page.get_by_role("button", name="إعادة المشهد", exact=True).click(force=True)
        page.wait_for_function("!document.querySelector('button.graphNode.selectedNode')")
        page.wait_for_timeout(700)  # Existing stage zoom uses a .65s transition.

    def set_playing(playing):
        host = page.locator('[data-playing]').first
        if host.get_attribute("data-playing") != str(playing).lower():
            page.locator(".playButton").click()
        page.wait_for_function("""playing =>
          document.querySelector('[data-playing]').dataset.playing === String(playing)""", arg=playing)
        page.wait_for_timeout(80)

    def animation_snapshot():
        return page.evaluate(ANIMATION_SNAPSHOT)

    def assert_shared_phase(samples, context):
        authored = [a for a in samples if a["motion"]]
        assert authored and any(a["flow"] for a in authored) and any(a["pulse"] for a in authored), context
        phases = [(a["time"] % a["duration"]) / a["duration"] for a in authored]
        reference = phases[0]
        for animation, phase in zip(authored, phases):
            distance = abs(phase - reference)
            assert min(distance, 1 - distance) < .05, (context, animation, reference, phase)

    def flow_visibility():
        # Filling and ejection are complementary phases of the same cycle.
        # Check whether routes are enabled by the view and inspection state;
        # the phase animation may legitimately make one phase transparent.
        return page.evaluate("""() => [...document.querySelectorAll(
          '#heart-root path[data-from][data-to][data-oxygenation]')].map(path => {
            for(let e=path; e; e=e.parentElement) {
              const style=getComputedStyle(e);
              const phase=e.matches('[data-heart-motion="fill-flow"],[data-heart-motion="eject-flow"]');
              if(style.display==='none' || style.visibility==='hidden' || (!phase && Number(style.opacity)===0)) return false;
            }
            return true;
          })""")

    fixture = {
        "title": "Runtime regression", "visual": "concept",
        "presentation": {"auto3d": "manual", "challengeStyle": "direct"},
        "sceneGraph": {
            "world": {"dimension": "2d"},
            "nodes": [{"id": "one", "label": "One", "x": 30, "y": 40},
                      {"id": "two", "label": "Two", "x": 70, "y": 50}], "edges": [],
        },
        "steps": [{"title": "Existing scene", "text": "Generic runtime",
                   "runtime": {"focusNodeIds": ["one"], "visibleNodeIds": ["one", "two"]}}],
    }
    saved = json.dumps({"content": "regression fixture", "audience": "عام", "result": fixture, "active": 0})
    try:
        p = sync_playwright().start()
        browser = p.chromium.launch(
            executable_path=args.chromium, headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-breakpad"],
        )
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="no-preference")
        context.add_init_script(
            'if(!localStorage.getItem("mybee:last-session"))'
            'localStorage.setItem("mybee:last-session",' + json.dumps(saved) + ')'
        )
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(args.url.rstrip("/") + "/lab/premium-heart-vector")
        wait_science(page)
        assert page.locator("#heart-root").count() == 1
        assert page.locator("#heart-root image, #heart-root foreignObject").count() == 0
        assert page.locator("#heart-root path").count() > 0
        for concept in ANATOMY_IDS:
            geometry = part(concept)
            assert geometry.count() == 1, concept
            assert geometry.get_attribute("role") == "button", concept
            assert geometry.get_attribute("tabindex") == "0", concept
            assert geometry.get_attribute("aria-label"), concept
            box = geometry.bounding_box()
            assert geometry.is_visible() and box and box["width"] > 0 and box["height"] > 0, concept
            assert geometry.evaluate("e => ['g','path','ellipse','circle','polygon','polyline','rect'].includes(e.tagName)"), concept
        passed("default science cutaway renders all 13 interactive vector anatomy parts")
        view = page.get_by_role("combobox", name="Heart view", exact=True)
        assert view.input_value() == "cutaway", "Science cutaway must be the default view"
        assert re.search(r"4[.,]2", page.get_by_test_id("cardiac-output").inner_text())
        passed("cutaway is the default view and 60 BPM reports educational cardiac output of 4.2 L/min")

        structure = page.evaluate(r"""() => {
          const root = document.querySelector('#heart-root');
          const groups = ['back-heart','blood-interior','front-occlusion'].map(id => root.querySelector('#'+id));
          const flows = [...root.querySelectorAll('path[data-from][data-to][data-oxygenation]')];
          function clipping(path) {
            const ids = [];
            for (let e=path; e && e!==root.parentElement; e=e.parentElement) {
              const value = e.getAttribute('clip-path') || getComputedStyle(e).clipPath;
              const match = value && value.match(/#([^\)"']+)/);
              if (match) ids.push(match[1]);
            }
            return ids.filter(id => root.querySelector('[id="'+id+'"]')?.tagName === 'clipPath');
          }
          return {
            groups: groups.map(e => e?.tagName || null),
            ordered: groups.every(Boolean) && groups.slice(1).every((e,i) =>
              Boolean(groups[i].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING)),
            flows: flows.map(e => ({from:e.dataset.from,to:e.dataset.to,
              oxygenation:e.dataset.oxygenation,clips:clipping(e),
              inside:groups[1]?.contains(e),length:e.getTotalLength(),
              declaredStart:e.dataset.start,declaredEnd:e.dataset.end,
              start:{x:e.getPointAtLength(0).x,y:e.getPointAtLength(0).y},
              end:{x:e.getPointAtLength(e.getTotalLength()).x,y:e.getPointAtLength(e.getTotalLength()).y}}))
          };
        }""")
        assert structure["groups"] == ["g", "g", "g"], structure
        assert structure["ordered"], structure
        assert structure["flows"], "No semantic blood-flow paths rendered"
        seen_edges = set()
        for flow in structure["flows"]:
            edge = (flow["from"], flow["to"])
            assert edge in CANONICAL_EDGES, flow
            expected = "oxygenated" if edge in OXYGENATED_EDGES else "deoxygenated"
            assert flow["oxygenation"] == expected, flow
            assert flow["inside"] and flow["clips"] and flow["length"] > 0, flow
            assert "heart-lumen" in flow["clips"], flow
            for endpoint in ["start", "end"]:
                declared = flow["declared" + endpoint.title()]
                assert declared, f"Missing data-{endpoint}: {flow}"
                x, y = map(float, re.split(r"[\s,]+", declared.strip()))
                assert abs(flow[endpoint]["x"] - x) < .01 and abs(flow[endpoint]["y"] - y) < .01, flow
            seen_edges.add(edge)
        assert CANONICAL_EDGES <= seen_edges, sorted(CANONICAL_EDGES - seen_edges)
        assert {f["oxygenation"] for f in structure["flows"]} == {"oxygenated", "deoxygenated"}
        for source, target, direction in [("heart.leftAtrium", "heart.mitralValve", 1), ("heart.leftVentricle", "heart.aorticValve", -1)]:
            paths = [f for f in structure["flows"] if (f["from"], f["to"]) == (source, target)]
            assert paths and all((f["end"]["y"] - f["start"]["y"]) * direction > 0 for f in paths), paths
        cava_paths = [f for f in structure["flows"] if (f["from"], f["to"]) == ("heart.venaCava", "heart.rightAtrium")]
        assert any(f["end"]["y"] > f["start"]["y"] for f in cava_paths), "SVC must descend toward the right atrium"
        assert any(f["end"]["y"] < f["start"]["y"] for f in cava_paths), "IVC must ascend toward the right atrium"
        report["flowStructure"] = structure
        passed("back, blood, and front layers contain clipped canonical blue/red blood-flow paths")

        reset_scene()
        page.locator("#heart-root").scroll_into_view_if_needed()
        pan_before = {concept:part(concept).bounding_box() for concept in ANATOMY_IDS}
        pan_anchor = page.evaluate("""() => {
          const svg=document.querySelector('#heart-root');
          const point=new DOMPoint(320,500).matrixTransform(svg.getScreenCTM());
          return {x:point.x,y:point.y};
        }""")
        page.keyboard.down("Shift")
        try:
            page.mouse.move(pan_anchor["x"],pan_anchor["y"])
            page.mouse.down()
            page.mouse.move(pan_anchor["x"]+40,pan_anchor["y"]-30,steps=8)
            page.mouse.up()
        finally:
            page.keyboard.up("Shift")
        pan_after = {concept:part(concept).bounding_box() for concept in ANATOMY_IDS}
        for concept in ANATOMY_IDS:
            before,after=pan_before[concept],pan_after[concept]
            assert abs(after["x"]-before["x"]-40)<4 and abs(after["y"]-before["y"]+30)<4, (concept,before,after)
            assert abs(after["width"]-before["width"])<2 and abs(after["height"]-before["height"])<2, (concept,before,after)
        assert all(flow_visibility()), "Viewport pan must preserve the connected blood routes"
        reset_scene()
        for concept in ANATOMY_IDS:
            restored=part(concept).bounding_box()
            assert abs(restored["x"]-pan_before[concept]["x"])<1 and abs(restored["y"]-pan_before[concept]["y"])<1, concept
        passed("Shift drag pans the entire native heart without moving anatomy relative to itself and Reset restores the view")

        # A cancelled gesture has no generated click to consume. The next
        # deliberate keyboard activation must therefore remain available.
        host=page.locator('[data-playing]').first
        page.keyboard.down("Shift")
        try:
            page.mouse.move(pan_anchor["x"],pan_anchor["y"])
            page.mouse.down()
            page.wait_for_function("document.querySelector('[data-playing]').dataset.panning==='true'")
            host.dispatch_event("pointercancel",{"pointerId":1,"pointerType":"mouse","isPrimary":True})
            page.keyboard.up("Shift")
            assert host.get_attribute("data-panning") == "false"
            part("heart.rightAtrium").focus()
            page.keyboard.press("Enter")
            page.wait_for_function("""document.querySelector('button.graphNode[data-node-id="heart.rightAtrium"]')
              .classList.contains('selectedNode')""",timeout=1000)
        finally:
            page.mouse.up()
            page.keyboard.up("Shift")
        reset_scene()
        passed("cancelling a pan clears gesture state and preserves the next keyboard selection")

        for concept in ANATOMY_IDS:
            select(concept)
        passed("all anatomy geometry selects through the existing graph runtime")
        select("heart.aorta", keyboard="Enter")
        select("heart.mitralValve", keyboard="Space")
        passed("Enter and Space select actual SVG anatomy geometry")

        # Use the authored lumen anchors to click the interior of each chamber.
        # Masks can remove paint while leaving an overlaid path's hit area intact.
        chamber_hits = []
        for concept in ["heart.rightAtrium", "heart.rightVentricle", "heart.leftAtrium", "heart.leftVentricle"]:
            reset_scene()
            part(concept).scroll_into_view_if_needed()
            point = page.evaluate("""concept => {
              const path = document.querySelector(`#heart-root path[data-from="${concept}"]`);
              const anchor = path.getPointAtLength(0);
              const screen = new DOMPoint(anchor.x,anchor.y).matrixTransform(path.getScreenCTM());
              const hit = document.elementFromPoint(screen.x,screen.y);
              return {x:screen.x,y:screen.y,concept,
                hitId:hit?.id,hitConcept:hit?.closest('[data-native-node-id]')?.dataset.nativeNodeId};
            }""", concept)
            assert point["hitConcept"] == concept, point
            page.mouse.click(point["x"], point["y"])
            page.wait_for_function("""id =>
              document.querySelector(`button.graphNode[data-node-id="${id}"]`).classList.contains('selectedNode')""", arg=concept)
            chamber_hits.append(point)
        passed("real pointer clicks inside all four chamber lumens select the chamber", chamberHits=chamber_hits)

        anatomy_hits = []
        for concept in ANATOMY_IDS:
            reset_scene()
            part(concept).scroll_into_view_if_needed()
            point = page.evaluate("""({concept,elementId,anchor}) => {
              const root=document.querySelector('#heart-root');
              const group=root.querySelector('#'+elementId);
              const leaflet=group.querySelector('path[data-heart-motion="av-valve"],path[data-heart-motion="semilunar-valve"]');
              if(leaflet) {
                const bounds=leaflet.getBBox(),matrix=leaflet.getScreenCTM();
                for(const fy of [.5,.35,.65,.2,.8]) for(const fx of [.5,.35,.65,.2,.8]) {
                  const point=new DOMPoint(bounds.x+bounds.width*fx,bounds.y+bounds.height*fy).matrixTransform(matrix);
                  const hit=document.elementFromPoint(point.x,point.y);
                  if(hit===leaflet) return {x:point.x,y:point.y,concept,
                    hitConcept:hit.closest('[data-native-node-id]')?.dataset.nativeNodeId,
                    hitMotion:hit.dataset.heartMotion,leaflet:true};
                }
                return null;
              }
              const point=new DOMPoint(anchor[0],anchor[1]).matrixTransform(root.getScreenCTM());
              const hit=document.elementFromPoint(point.x,point.y);
              return {x:point.x,y:point.y,concept,hitId:hit?.id,
                hitConcept:hit?.closest('[data-native-node-id]')?.dataset.nativeNodeId,leaflet:false};
            }""", {"concept":concept,"elementId":ANATOMY_ELEMENTS[concept],"anchor":ANATOMY_HIT_ANCHORS[concept]})
            assert point and point["hitConcept"] == concept, point or concept
            page.mouse.click(point["x"],point["y"])
            page.wait_for_function("""id =>
              document.querySelector(`button.graphNode[data-node-id="${id}"]`).classList.contains('selectedNode')""",arg=concept)
            anatomy_hits.append(point)
        assert len([hit for hit in anatomy_hits if hit["leaflet"]]) == 4, anatomy_hits
        passed("real pointer clicks select all 13 anatomy parts including all four rendered valve leaflets", anatomyHits=anatomy_hits)

        # Find a point that really hits SVG geometry, avoiding overlaid labels.
        reset_scene()
        point = None
        for concept in ["heart.leftVentricle", "heart.rightAtrium", "heart.aorta"]:
            part(concept).scroll_into_view_if_needed()
            point = part(concept).evaluate("""e => {
              const b=e.getBoundingClientRect();
              for (const fy of [.5,.25,.75,.1,.9,.4,.6]) for (const fx of [.5,.25,.75,.1,.9,.4,.6]) {
                const x=b.x+b.width*fx,y=b.y+b.height*fy;
                const hit=document.elementFromPoint(x,y)?.closest('[data-native-node-id]');
                if (hit?.dataset.nativeNodeId===e.dataset.nativeNodeId) return {x,y,id:e.dataset.nativeNodeId};
              }
              return null;
            }""")
            if point:
                break
        assert point, "No tested anatomy part has a pointer-hit region outside its labels"
        page.mouse.click(point["x"], point["y"])
        page.wait_for_function("""id =>
          document.querySelector(`button.graphNode[data-node-id="${id}"]`).classList.contains('selectedNode')""", arg=point["id"])
        passed("a real screen-coordinate pointer click selects visible cutaway geometry", concept=point["id"])

        reset_scene()
        geometry, control = part("heart.leftVentricle"), label("heart.leftVentricle")
        before, control_box = geometry.bounding_box(), control.bounding_box()
        other_before = part("heart.rightAtrium").bounding_box()
        assert before and control_box and other_before
        x, y = control_box["x"] + control_box["width"] / 2, control_box["y"] + control_box["height"] / 2
        page.mouse.move(x, y)
        page.mouse.down()
        # The right-side label starts at 88%; drag inward so the existing 92%
        # position clamp does not shorten the requested screen-space movement.
        page.mouse.move(x - 55, y + 20, steps=8)
        page.mouse.up()
        after = geometry.bounding_box()
        other_after = part("heart.rightAtrium").bounding_box()
        assert abs(after["x"] - before["x"] + 55) < 4, (before, after)
        assert abs(after["y"] - before["y"] - 20) < 4, (before, after)
        assert abs(other_after["x"] - other_before["x"]) < 1, (other_before, other_after)
        assert abs(other_after["y"] - other_before["y"]) < 1, (other_before, other_after)
        assert not any(flow_visibility()), "Dragging anatomy must conceal routes whose positions no longer match"
        passed("drag moves the actual ventricle by the requested screen delta and preserves other parts")
        reset_scene()
        restored = geometry.bounding_box()
        assert abs(restored["x"] - before["x"]) < 1 and abs(restored["y"] - before["y"]) < 1
        assert all(flow_visibility()), "Reset must restore the original blood routes"
        passed("runtime reset restores dragged geometry and concealed blood routes")

        page.get_by_role("button", name="إخفاء التسميات", exact=True).click()
        assert control.evaluate("e => getComputedStyle(e).visibility") == "hidden"
        assert geometry.is_visible()
        select("heart.leftVentricle")
        page.get_by_role("button", name="إظهار التسميات", exact=True).click()
        assert control.is_visible()
        passed("labels hide independently while geometry remains selectable")

        hide_vessels = page.get_by_role("button", name="إخفاء الأوعية", exact=True)
        assert hide_vessels.count() == 1
        hide_vessels.click()
        for concept in VESSEL_IDS:
            assert not part(concept).is_visible(), concept
        assert part("heart.leftVentricle").is_visible()
        page.get_by_role("button", name="إظهار الأوعية", exact=True).click()
        assert all(part(concept).is_visible() for concept in VESSEL_IDS)
        passed("vessel control hides vessels independently of chambers")

        hide_flow = page.get_by_role("button", name="إخفاء مسار الدم", exact=True)
        assert hide_flow.count() == 1
        hide_flow.click()
        assert not any(flow_visibility())
        assert part("heart.leftVentricle").is_visible()
        page.get_by_role("button", name="إظهار مسار الدم", exact=True).click()
        assert all(flow_visibility())
        passed("blood-flow control hides flows independently of anatomy")

        hide_anatomy = page.get_by_role("button", name=re.compile(r"^إخفاء (التشريح|طبقة التشريح)$"))
        if hide_anatomy.count():
            hide_anatomy.click()
            assert not part("heart.myocardium").is_visible()
            page.get_by_role("button", name=re.compile(r"^إظهار (التشريح|طبقة التشريح)$")).click()
            assert part("heart.myocardium").is_visible()
            passed("anatomy layer control restores cutaway geometry")

        reset_scene()
        zoom_before = part("heart.myocardium").bounding_box()
        page.locator(".immersiveControls button").filter(has_text="＋").click(force=True)
        page.wait_for_timeout(700)
        assert "110%" in page.locator(".immersiveControls").inner_text()
        zoom_after = part("heart.myocardium").bounding_box()
        assert abs(zoom_after["width"] / zoom_before["width"] - 1.1) < .03, (zoom_before, zoom_after)
        reset_scene()
        assert "100%" in page.locator(".immersiveControls").inner_text()
        assert abs(part("heart.myocardium").bounding_box()["width"] - zoom_before["width"]) < 1
        passed("existing zoom enlarges actual SVG geometry and runtime reset restores 100 percent")

        slider = page.get_by_role("slider", name="BPM", exact=True)
        for bpm, period in [(40, 1.5), (180, 1 / 3)]:
            slider.focus()
            slider.press("Home" if bpm == 40 else "End")
            page.wait_for_function("""period => Math.abs(parseFloat(getComputedStyle(
              document.querySelector('[data-playing]')).getPropertyValue('--native-motion-speed'))-period)<.001""", arg=period)
            assert slider.input_value() == str(bpm)
            expected_output = "2.8" if bpm == 40 else "12.6"
            assert expected_output in page.get_by_test_id("cardiac-output").inner_text().replace(",", ".")
            set_playing(True)
            timings = animation_snapshot()
            assert timings, "No actual native animations found"
            assert any(a["flow"] for a in timings), "Blood paths do not animate"
            assert any(a["pulse"] for a in timings), "Anatomy pulse does not animate"
            assert all(abs(a["duration"] - period * 1000) < 1 for a in timings), (bpm, timings)
            report["animationSamples"][f"{bpm}bpm"] = timings
            set_playing(False)
        passed("40 and 180 BPM set 1.5s and one-third-second CSS and actual Web Animation periods")

        # Use the slow period to keep the runtime on its initial step during sampling.
        slider.focus()
        slider.press("Home")
        set_playing(True)
        moving_before = animation_snapshot()
        page.wait_for_timeout(140)
        moving_after = animation_snapshot()
        for old, new in zip(moving_before, moving_after):
            assert old["key"] == new["key"] and new["state"] == "running", (old, new)
            assert new["time"] - old["time"] > 60, (old, new)
        assert moving_before and len(moving_before) == len(moving_after)
        set_playing(False)
        frozen_before = animation_snapshot()
        page.wait_for_timeout(160)
        frozen_after = animation_snapshot()
        assert frozen_before and len(frozen_before) == len(frozen_after)
        for old, new in zip(frozen_before, frozen_after):
            assert old["key"] == new["key"] and new["state"] == "paused", (old, new)
            assert abs(new["time"] - old["time"]) < 2, (old, new)
            assert old["dashOffset"] == new["dashOffset"] and old["opacity"] == new["opacity"], (old, new)
        set_playing(True)
        resumed_before = animation_snapshot()
        page.wait_for_timeout(140)
        resumed_after = animation_snapshot()
        assert resumed_before and len(resumed_before) == len(resumed_after)
        for old, new in zip(resumed_before, resumed_after):
            assert old["key"] == new["key"] and new["state"] == "running", (old, new)
            assert new["time"] - old["time"] > 60, (old, new)
        report["animationSamples"]["pauseResume"] = {
            "movingBefore": moving_before, "movingAfter": moving_after,
            "frozenBefore": frozen_before, "frozenAfter": frozen_after,
            "resumedBefore": resumed_before, "resumedAfter": resumed_after,
        }
        set_playing(False)
        passed("PlayPause freezes and resumes actual pulse and flow animations")

        set_playing(True)
        page.wait_for_timeout(260)
        before_vessels = animation_snapshot()
        assert_shared_phase(before_vessels, "before vessel concealment")
        page.get_by_role("button", name="إخفاء الأوعية", exact=True).click()
        page.wait_for_timeout(140)
        page.get_by_role("button", name="إظهار الأوعية", exact=True).click()
        page.wait_for_timeout(80)
        restored_vessels = animation_snapshot()
        assert_shared_phase(restored_vessels, "recreated vessel flow must match existing valve and myocardium phase")
        set_playing(False)
        frozen_vessels = animation_snapshot()
        page.wait_for_timeout(140)
        frozen_vessels_after = animation_snapshot()
        assert len(frozen_vessels) == len(frozen_vessels_after)
        for before, after in zip(frozen_vessels, frozen_vessels_after):
            assert before["key"] == after["key"] and after["state"] == "paused", (before,after)
            assert abs(after["time"] - before["time"]) < 2, (before,after)
        assert_shared_phase(frozen_vessels_after, "paused vessel flow remains synchronized")
        report["animationSamples"]["vesselRecreation"] = {"before":before_vessels,"restored":restored_vessels,"paused":frozen_vessels_after}
        passed("playing vessel concealment and restoration keeps recreated flow synchronized and pause freezes it")

        geometry, control = part("heart.leftVentricle"), label("heart.leftVentricle")
        control_box = control.bounding_box()
        x, y = control_box["x"] + control_box["width"] / 2, control_box["y"] + control_box["height"] / 2
        page.mouse.move(x, y)
        page.mouse.down()
        page.mouse.move(x - 45, y + 15, steps=8)
        page.mouse.up()
        assert not any(flow_visibility()), "Paused displacement must conceal unconnected blood routes"
        reset_scene()
        restored_after_drag = animation_snapshot()
        assert all(flow_visibility()), "Reset must restore the paused routes"
        assert_shared_phase(restored_after_drag, "recreated paused routes must match valve and myocardium phase")
        assert all(a["state"] == "paused" for a in restored_after_drag), restored_after_drag
        report["animationSamples"]["pausedDragReset"] = restored_after_drag
        passed("resetting displaced anatomy restores blood routes at the shared paused cycle phase")

        page.get_by_role("button", name="إخفاء التسميات", exact=True).click()
        page.get_by_role("button", name="إعادة الضبط", exact=True).click()
        wait_science(page)
        assert page.get_by_role("slider", name="BPM", exact=True).input_value() == "60"
        assert page.locator('[data-playing]').first.get_attribute("data-playing") == "false"
        assert label("heart.leftVentricle").is_visible()
        assert all(part(concept).is_visible() for concept in ANATOMY_IDS)
        assert "100%" in page.locator(".immersiveControls").inner_text()
        passed("lab Reset restores BPM, labels, anatomy, paused state, and runtime zoom")

        for width, height, filename in [(1440, 1000, "science-desktop.png"), (390, 844, "science-mobile.png"), (768, 1024, "science-tablet.png")]:
            page.set_viewport_size({"width": width, "height": height})
            page.wait_for_timeout(150)
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), width
            assert page.locator("#heart-root").is_visible()
            label_bounds=page.evaluate("""() => {
              const stage=document.querySelector('.heartExistingRuntime .dynamicStage');
              const rect=stage.getBoundingClientRect();
              const bounds=r=>({left:r.left,top:r.top,right:r.right,bottom:r.bottom});
              const labels=[...stage.querySelectorAll('button.graphNode[data-node-id]')]
                .filter(label=>{
                  const style=getComputedStyle(label);
                  return style.display!=='none' && style.visibility!=='hidden';
                }).map(label=>{
                  const title=label.querySelector('b');
                  const range=document.createRange();
                  range.selectNodeContents(title||label);
                  return {id:label.dataset.nodeId,text:title?.textContent||label.textContent,
                    bounds:bounds(label.getBoundingClientRect()),
                    textBounds:[...range.getClientRects()].filter(r=>r.width>0&&r.height>0).map(bounds)};
                });
              return {frame:bounds(rect),labels};
            }""")
            assert set(ANATOMY_IDS) <= {item["id"] for item in label_bounds["labels"]}, label_bounds
            frame=label_bounds["frame"]
            for item in label_bounds["labels"]:
                for bounds in [item["bounds"],*item["textBounds"]]:
                    assert bounds["left"]>=frame["left"]-1 and bounds["right"]<=frame["right"]+1, (width,item,frame)
                    assert bounds["top"]>=frame["top"]-1 and bounds["bottom"]<=frame["bottom"]+1, (width,item,frame)
            report.setdefault("responsiveLabelBounds",{})[str(width)]=label_bounds
            page.screenshot(path=str(out / filename), full_page=True)
        passed("desktop, mobile, and tablet keep anatomy and every visible label inside the scene frame without overflow")

        assert page.evaluate('localStorage.getItem("mybee:last-session")') == saved
        passed("embedded science lab preserves the saved home session")

        view.select_option("exterior")
        page.wait_for_selector('#heart-root [data-native-node-id="heart.exterior"]', timeout=20000)
        assert page.locator("#heart-root path").count() == 639
        assert page.locator("#heart-root image").count() == 0
        assert page.locator('#heart-root [data-native-node-id="heart.myocardium"]').count() == 0
        view.select_option("cutaway")
        wait_science(page)
        assert page.evaluate('localStorage.getItem("mybee:last-session")') == saved
        passed("Heart view switches to the NIH exterior vector and restores the science cutaway")

        reduced = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
        reduced_page = reduced.new_page()
        reduced_page.on("pageerror", lambda error: errors.append(str(error)))
        reduced_page.goto(args.url.rstrip("/") + "/lab/premium-heart-vector")
        wait_science(reduced_page)
        assert reduced_page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
        reduced_page.locator(".playButton").click()
        reduced_page.wait_for_timeout(160)
        reduced_animations = reduced_page.evaluate(ANIMATION_SNAPSHOT)
        assert not [a for a in reduced_animations if a["state"] == "running"], reduced_animations
        reduced_part = reduced_page.locator('#heart-root #left-ventricle[data-native-node-id="heart.leftVentricle"]')
        assert reduced_part.is_visible()
        reduced_part.focus()
        reduced_page.keyboard.press("Enter")
        reduced_page.wait_for_function("""document.querySelector('button.graphNode[data-node-id="heart.leftVentricle"]')
          .classList.contains('selectedNode')""")
        assert reduced_page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        reduced_page.screenshot(path=str(out / "science-reduced-motion.png"), full_page=True)
        reduced.close()
        passed("reduced-motion fallback keeps static cutaway selectable without running native animations")

        page.set_viewport_size({"width": 1440, "height": 1000})
        page.goto(args.url.rstrip("/") + "/")
        page.wait_for_selector('button.graphNode[data-node-id="one"]')
        assert page.locator("#heart-root").count() == 0
        assert page.locator(".actorVisual").count() == 2
        page.locator('button.graphNode[data-node-id="one"]').click()
        assert page.locator('button.graphNode[data-node-id="one"]').evaluate("e => e.classList.contains('selectedNode')")
        passed("generic runtime restores and selects the existing saved scene")

        unsafe = copy.deepcopy(fixture)
        unsafe["sceneGraph"]["nativeSvg"] = {
            "svg": '<svg onload="window.unsafeHeartExecuted=true"><path/><path/><path/><path/></svg>',
            "bindings": [],
        }
        page.evaluate('(saved) => localStorage.setItem("mybee:last-session", saved)', json.dumps({"result": unsafe, "active": 0}))
        page.reload()
        page.wait_for_selector("button.graphNode")
        assert page.locator("svg[onload]").count() == 0
        assert page.evaluate("window.unsafeHeartExecuted") is None
        passed("unsafe native SVG from saved sessions is rejected before insertion")
        assert not errors, errors
        passed("no browser runtime errors across science, reduced-motion, and generic runtime checks")
        report["status"] = "passed"
        browser.close()
        browser = None
    except Exception as error:
        report["status"] = "failed"
        report["error"] = f"{type(error).__name__}: {error}"
        if page and not page.is_closed():
            try:
                page.screenshot(path=str(out / "science-failure.png"), full_page=True)
                report["failureScreenshot"] = "science-failure.png"
            except Exception as screenshot_error:
                report["screenshotError"] = str(screenshot_error)
        raise
    finally:
        if browser:
            browser.close()
        if p:
            p.stop()
        report["passed"] = len(report["checks"])
        (out / "science-results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
