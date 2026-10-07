#!/usr/bin/env python3
"""Write the original, editable educational cutaway and its provenance record.

All anatomy below is authored vector geometry. No NIH exterior paths, raster
reference pixels, or patient measurements are incorporated into this cutaway.
"""
from pathlib import Path
import hashlib
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "public/heart-vector"

outer = "M190 222 C223 197 272 202 310 219 C350 201 408 207 448 231 C490 260 518 306 528 366 C542 449 514 523 468 580 C449 605 426 628 405 650 C387 668 369 645 345 625 C285 601 227 565 186 511 C148 462 130 411 129 358 C127 299 148 249 190 222Z"
lumens = {
 "ra": "M199 235 C236 218 267 237 279 271 C291 309 269 341 260 363 L253 388 L218 392 C194 373 160 355 155 321 C149 284 169 250 199 235Z",
 "rv": "M216 390 L253 389 C267 405 282 423 283 449 C288 492 309 543 338 581 C285 568 224 525 193 475 C171 440 165 407 186 386 C196 378 207 382 216 390Z",
 "rvot": "M252 416 C269 396 279 374 280 346 L307 344 C310 387 303 416 281 446 L270 463Z",
 "la": "M368 246 C397 227 440 235 460 255 C479 275 475 307 451 329 L421 359 L382 359 C360 338 341 308 347 280 C350 265 357 254 368 246Z",
 "lv": "M382 359 L420 359 C440 379 456 407 460 436 C467 477 453 517 431 550 C421 567 409 583 397 598 C385 580 373 565 365 544 C351 513 348 487 351 460 C351 422 364 389 382 359Z",
 "lvot": "M378 403 C359 382 339 363 338 338 L363 335 C366 355 382 370 397 385Z",
 "svc": "M181 115 C181 159 182 209 185 244 L216 254 C211 206 211 158 213 116Z",
 "ivc": "M136 478 C136 435 146 398 178 354 L198 373 C172 411 165 448 166 479Z",
 "pa": "M280 346 C279 291 279 246 299 219 C314 198 320 188 333 182 C360 167 401 172 468 166 L470 190 C407 196 376 187 350 198 C326 211 308 239 307 269 L307 345Z",
 "pa-left": "M334 184 C278 157 226 158 100 163 L101 188 C221 181 269 181 319 207Z",
 "aorta": "M338 341 C337 291 333 246 331 211 C329 167 342 125 378 105 C421 80 470 107 492 144 C522 196 525 253 528 311 L499 314 C493 256 494 208 471 164 C455 132 426 115 397 130 C370 144 360 175 361 207 L365 341Z",
 "pv1": "M323 222 C342 228 352 237 372 255 L359 271 C345 252 334 245 312 242Z",
 "pv2": "M312 307 C333 300 347 301 368 296 L373 316 C350 320 337 322 315 329Z",
 "pv3": "M545 222 C506 223 478 235 448 253 L456 273 C488 255 514 246 547 246Z",
 "pv4": "M546 312 C507 318 485 310 454 296 L445 316 C481 334 507 341 549 336Z",
}

def path(d, **attrs):
    encoded = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items())
    return f'<path d="{d}" {encoded}/>'

def group(id, concept, body, **attrs):
    data = f' data-concept-id="heart.{concept}"' if concept else ""
    extra = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items())
    return f'<g id="{id}"{data} {extra}>\n{body}\n</g>'

defs = '''<defs>
  <radialGradient id="muscle-depth" cx=".34" cy=".27" r=".78"><stop stop-color="#a64b59"/><stop offset=".32" stop-color="#772d40"/><stop offset=".72" stop-color="#49172b"/><stop offset="1" stop-color="#230e20"/></radialGradient>
  <radialGradient id="cut-surface" cx=".47" cy=".26" r=".78"><stop stop-color="#b87878"/><stop offset=".22" stop-color="#92505f"/><stop offset=".5" stop-color="#74364b"/><stop offset=".79" stop-color="#4d1e36"/><stop offset="1" stop-color="#2b1026"/></radialGradient>
  <radialGradient id="surface-glaze" cx=".66" cy=".3" r=".62"><stop stop-color="#eed0ab" stop-opacity=".3"/><stop offset=".35" stop-color="#b47877" stop-opacity=".05"/><stop offset="1" stop-color="#180d20" stop-opacity=".58"/></radialGradient>
  <linearGradient id="blue-wall" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="#243649"/><stop offset=".28" stop-color="#6e8c9c"/><stop offset=".5" stop-color="#50687d"/><stop offset=".82" stop-color="#24374f"/><stop offset="1" stop-color="#142536"/></linearGradient>
  <linearGradient id="red-wall" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="#3b1828"/><stop offset=".27" stop-color="#b97176"/><stop offset=".49" stop-color="#8f394b"/><stop offset=".82" stop-color="#562034"/><stop offset="1" stop-color="#301122"/></linearGradient>
  <radialGradient id="blue-lumen" cx=".37" cy=".33" r=".83"><stop stop-color="#294e6b"/><stop offset=".42" stop-color="#17364e"/><stop offset="1" stop-color="#0b162b"/></radialGradient>
  <radialGradient id="red-lumen" cx=".55" cy=".3" r=".8"><stop stop-color="#963f54"/><stop offset=".4" stop-color="#60243b"/><stop offset="1" stop-color="#250f27"/></radialGradient>
  <linearGradient id="ivory-leaflet" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="#c7a89e"/><stop offset=".35" stop-color="#b28884"/><stop offset=".8" stop-color="#82606b"/><stop offset="1" stop-color="#50374b"/></linearGradient>
  <radialGradient id="septum-depth" cx=".44" cy=".2" r=".9"><stop stop-color="#aa6b71"/><stop offset=".35" stop-color="#844656"/><stop offset=".66" stop-color="#612a42"/><stop offset="1" stop-color="#33132c"/></radialGradient>
'''
defs += '<clipPath id="heart-lumen" clipPathUnits="userSpaceOnUse">\n'
defs += "\n".join(path(d) for d in lumens.values()) + "\n</clipPath>\n"
defs += '<mask id="front-wall-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="700">\n'
defs += path(outer, fill="white") + "\n"
defs += "\n".join(path(d, fill="black") for d in lumens.values()) + "\n</mask>\n"
# Occlude flow in the rear vessels where a foreground vessel crosses them.
# The shared lumen clip remains the final containment boundary for every path.
defs += '<mask id="aortic-flow-depth" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="700"><rect width="640" height="700" fill="white"/>'
defs += path(lumens["pa"], fill="black", stroke="black", stroke_width="28") + path(lumens["pa-left"], fill="black", stroke="black", stroke_width="26") + '</mask>\n'
defs += '<mask id="pulmonary-vein-flow-depth" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="700"><rect width="640" height="700" fill="white"/>'
defs += path(lumens["aorta"], fill="black", stroke="black", stroke_width="28") + '</mask>\n</defs>'

# Each vessel has a real outer wall and a closed lumen outline. Gradients shade
# tissue, while the cavity remains a separate native path used by the clip union.
def vessel(d, color, width=15):
    return "\n".join([
      path(d, fill=f"url(#{color}-wall)", stroke="#281327", stroke_width=width+1, stroke_linejoin="round"),
      path(d, fill=f"url(#{color}-lumen)", stroke=f"url(#{color}-wall)", stroke_width=width, stroke_linejoin="round"),
      path(d, fill="none", stroke="#d0a9a3" if color == "red" else "#adc0ca", stroke_width="1", opacity=".28"),
    ])

muscle = group("myocardium", "myocardium", path(outer, fill="url(#muscle-depth)", stroke="#210b1e", stroke_width="4") + "\n" + path("M144 332 C132 410 181 502 247 551 M479 306 C538 430 475 545 412 614 M181 247 C220 218 259 226 284 246", fill="none", stroke="#d79790", stroke_width="3", opacity=".23", stroke_linecap="round"), data_heart_motion="myocardium")

veins = group("pulmonary-veins", "pulmonaryVeins", "\n".join(vessel(lumens[k], "red", 9) for k in ("pv1", "pv2", "pv3", "pv4")) + '\n<ellipse cx="318" cy="232" rx="4" ry="14" transform="rotate(29 318 232)" fill="#371527" stroke="#a96c74" stroke-width="2.5"/><ellipse cx="313" cy="318" rx="4" ry="14" fill="#371527" stroke="#a96c74" stroke-width="2.5"/><ellipse cx="546" cy="234" rx="4" ry="15" fill="#371527" stroke="#a96c74" stroke-width="2.5"/><ellipse cx="548" cy="324" rx="4" ry="15" fill="#371527" stroke="#a96c74" stroke-width="2.5"/>')
aorta = group("aorta", "aorta", vessel(lumens["aorta"], "red", 14) + "\n" + "\n".join([
 path("M382 116 C379 84 378 64 372 42 L392 38 C398 59 400 82 401 106Z", fill="url(#red-wall)", stroke="#351325", stroke_width="3"),
 path("M413 106 L413 40 L432 39 L436 109Z", fill="url(#red-wall)", stroke="#351325", stroke_width="3"),
 path("M447 117 C452 89 461 70 473 47 L491 57 C479 82 472 104 470 134Z", fill="url(#red-wall)", stroke="#351325", stroke_width="3"),
 path("M385 46 L390 83 M423 47 L425 79 M479 57 L463 97", fill="none", stroke="#dba6a1", stroke_width="3", opacity=".46", stroke_linecap="round"),
 '<ellipse cx="382" cy="41" rx="10" ry="3.5" transform="rotate(-11 382 41)" fill="#4e2131" stroke="#b57a7f" stroke-width="1.8"/><ellipse cx="423" cy="40" rx="9.5" ry="3.5" fill="#4e2131" stroke="#b57a7f" stroke-width="1.8"/><ellipse cx="482" cy="52" rx="10" ry="3.5" transform="rotate(27 482 52)" fill="#4e2131" stroke="#b57a7f" stroke-width="1.8"/><ellipse cx="514" cy="312" rx="21" ry="7.5" transform="rotate(-5 514 312)" fill="#432033" stroke="#a26b78" stroke-width="3"/>',
]))
cavae = group("vena-cava", "venaCava", group("superior-vena-cava", None, vessel(lumens["svc"], "blue", 11) + '\n<ellipse cx="197" cy="116" rx="23" ry="8" fill="#182d42" stroke="#7994a6" stroke-width="3"/>') + "\n" + group("inferior-vena-cava", None, vessel(lumens["ivc"], "blue", 10) + '\n<ellipse cx="151" cy="479" rx="20" ry="8" fill="#172b40" stroke="#657f95" stroke-width="3"/>'))
pa = group("pulmonary-artery", "pulmonaryArtery", vessel(lumens["pa-left"], "blue", 13) + "\n" + vessel(lumens["pa"], "blue", 14) + "\n" + path("M289 308 C284 259 297 226 322 205 M114 168 C197 167 252 162 293 178 M367 181 C400 183 430 177 460 174", fill="none", stroke="#b5c9d0", stroke_width="3", opacity=".31", stroke_linecap="round") + '\n<ellipse cx="100" cy="175" rx="5" ry="19" fill="#183046" stroke="#819aa9" stroke-width="3"/><ellipse cx="469" cy="178" rx="5" ry="19" transform="rotate(-5 469 178)" fill="#183046" stroke="#819aa9" stroke-width="3"/>')

chamber_parts = []
for key, id, concept, color in [
 ("ra", "right-atrium", "rightAtrium", "blue"),
 ("rv", "right-ventricle", "rightVentricle", "blue"),
 ("la", "left-atrium", "leftAtrium", "red"),
 ("lv", "left-ventricle", "leftVentricle", "red"),
]:
    interior = path(lumens[key], fill=f"url(#{color}-lumen)", stroke="#442437", stroke_width="1.5")
    if key == "rv":
        interior += "\n" + path(lumens["rvot"], fill="url(#blue-lumen)")
        interior += "\n" + path("M194 417 C208 450 215 468 237 491 M202 448 C221 467 226 485 252 510 M222 484 C247 512 273 531 294 548", fill="none", stroke="#66879b", stroke_width="3", opacity=".22", stroke_linecap="round")
    if key == "lv":
        interior += "\n" + path(lumens["lvot"], fill="url(#red-lumen)")
        interior += "\n" + path("M365 439 C375 458 369 489 383 520 M449 432 C432 453 438 485 423 518 M378 515 L398 562 L424 524", fill="none", stroke="#c88187", stroke_width="4", opacity=".24", stroke_linecap="round")
    chamber_parts.append(group(id, concept, interior))
chambers = group("chambers", None, "\n".join(chamber_parts))
back = group("back-heart", None, "\n".join([muscle, veins, aorta, cavae, pa, chambers]))

flows = {"deoxygenated": [], "oxygenated": []}
def flow(id, concept, oxygen, records, phase=None):
    parts=[]
    for number, (start, end, d, anchor0, anchor1) in enumerate(records, 1):
        parts.append(path(d, id=f"{id}-path-{number}", data_from=start, data_to=end,
            data_oxygenation=oxygen, data_start=anchor0, data_end=anchor1,
            fill="none", stroke="#8fbdd5" if oxygen=="deoxygenated" else "#ed9498",
            stroke_width="3.5", stroke_dasharray="3.5 15", stroke_linecap="round",
            opacity=".72", class_="blood", data_heart_motion="blood"))
    body="\n".join(parts)
    if phase: body=f'<g data-heart-motion="{phase}">\n{body}\n</g>'
    depth_mask = "aortic-flow-depth" if id in ("flow-aortic-valve", "flow-aorta") else "pulmonary-vein-flow-depth" if id == "flow-pulmonary-veins" else None
    flows[oxygen].append(group(id, concept, body, **({"mask": f"url(#{depth_mask})"} if depth_mask else {})))

D="deoxygenated"; O="oxygenated"
flow("flow-vena-cava", "venaCava", D, [
 ("circulation.body","heart.venaCava","M198 118 L198 166","198,118","198,166"),
 ("circulation.body","heart.venaCava","M151 477 C151 457 157 439 164 423","151,477","164,423"),
 ("heart.venaCava","heart.rightAtrium","M198 166 C198 214 201 249 216 280","198,166","216,280"),
 ("heart.venaCava","heart.rightAtrium","M164 423 C176 382 195 352 218 326","164,423","218,326"),
])
flow("flow-right-atrium", "rightAtrium", D, [("heart.rightAtrium","heart.tricuspidValve","M216 280 C236 313 245 350 235 385","216,280","235,385")], "fill-flow")
flow("flow-tricuspid-valve", "tricuspidValve", D, [("heart.tricuspidValve","heart.rightVentricle","M235 385 C232 424 228 461 258 496","235,385","258,496")], "fill-flow")
flow("flow-right-ventricle", "rightVentricle", D, [("heart.rightVentricle","heart.pulmonaryValve","M258 496 C285 479 293 418 294 347","258,496","294,347")], "eject-flow")
flow("flow-pulmonary-valve", "pulmonaryValve", D, [("heart.pulmonaryValve","heart.pulmonaryArtery","M294 347 L294 280 C294 244 307 223 325 204","294,347","325,204")], "eject-flow")
flow("flow-pulmonary-artery", "pulmonaryArtery", D, [
 ("heart.pulmonaryArtery","circulation.lungs","M325 204 C284 177 226 174 102 176","325,204","102,176"),
 ("heart.pulmonaryArtery","circulation.lungs","M325 204 C355 177 406 187 468 178","325,204","468,178"),
], "eject-flow")
flow("flow-pulmonary-veins", "pulmonaryVeins", O, [
 ("circulation.lungs","heart.pulmonaryVeins","M545 234 C502 234 475 246 449 264","545,234","449,264"),
 ("circulation.lungs","heart.pulmonaryVeins","M547 324 C503 331 478 319 449 306","547,324","449,306"),
 ("circulation.lungs","heart.pulmonaryVeins","M318 232 C338 236 352 251 365 263","318,232","365,263"),
 ("circulation.lungs","heart.pulmonaryVeins","M313 318 C333 312 349 312 368 307","313,318","368,307"),
 ("heart.pulmonaryVeins","heart.leftAtrium","M449 264 C436 277 424 284 411 285","449,264","411,285"),
 ("heart.pulmonaryVeins","heart.leftAtrium","M449 306 C431 302 424 293 411 285","449,306","411,285"),
 ("heart.pulmonaryVeins","heart.leftAtrium","M365 263 C381 273 395 279 411 285","365,263","411,285"),
 ("heart.pulmonaryVeins","heart.leftAtrium","M368 307 C388 305 400 295 411 285","368,307","411,285"),
])
flow("flow-left-atrium", "leftAtrium", O, [("heart.leftAtrium","heart.mitralValve","M411 285 C418 316 402 337 401 358","411,285","401,358")], "fill-flow")
flow("flow-mitral-valve", "mitralValve", O, [("heart.mitralValve","heart.leftVentricle","M401 358 C395 397 391 441 402 481","401,358","402,481")], "fill-flow")
flow("flow-left-ventricle", "leftVentricle", O, [("heart.leftVentricle","heart.aorticValve","M402 481 C409 428 383 382 352 342","402,481","352,342")], "eject-flow")
flow("flow-aortic-valve", "aorticValve", O, [("heart.aorticValve","heart.aorta","M352 342 L347 249 C339 203 346 159 383 131","352,342","383,131")], "eject-flow")
flow("flow-aorta", "aorta", O, [("heart.aorta","circulation.body","M383 131 C419 109 458 127 483 168 C508 210 510 266 513 311","383,131","513,311")], "eject-flow")
blood = group("blood-interior", None, "\n".join(group(oxygen+"-flow", None, "\n".join(parts)) for oxygen, parts in flows.items()), clip_path="url(#heart-lumen)")

fiber_geometry = []
for i in range(19):
    x = 456 + i * 3.35
    y = 321 + i * 2.8
    d = f"M{x:.2f} {y:.2f} C{x+26:.2f} {y+79:.2f} {518-i*1.8:.2f} {480+i*2.4:.2f} {406+i*.6:.2f} {624-i*1.1:.2f}"
    fiber_geometry.append(path(d, fill="none", stroke="#c99a90", stroke_width=".8", opacity=".11", stroke_linecap="round"))
for i in range(15):
    y = 354 + i * 13
    d = f"M464 {y} C484 {y-8} 506 {y+6} 524 {y+18}"
    fiber_geometry.append(path(d, fill="none", stroke="#270e26", stroke_width="1", opacity=".2", stroke_linecap="round"))
fiber_geometry.append(path("M143 315 C128 378 158 444 187 487 M148 315 C136 379 163 439 193 488 M155 321 C145 381 169 433 198 482 M165 335 C152 382 176 425 202 468", fill="none", stroke="#d6aaa0", stroke_width=".85", opacity=".14", stroke_linecap="round"))
front_muscle = group("front-myocardium", "myocardium", path(outer, fill="url(#cut-surface)", mask="url(#front-wall-mask)", stroke="#321429", stroke_width="1.5") + "\n" + '<g mask="url(#front-wall-mask)">' + path(outer, fill="url(#surface-glaze)") + "\n" + "\n".join(fiber_geometry) + "</g>", data_heart_motion="myocardium", pointer_events="none")

# The open rim paths stop at each real valve port; no transverse tissue bar
# seals a ventricular inlet or outlet in the cutaway.
rims = [
 ("right-atrium","rightAtrium", "M218 391 C193 372 159 355 154 321 C148 283 168 249 199 235 C237 217 267 236 280 270 C291 308 270 341 260 363 L253 382"),
 ("right-ventricle","rightVentricle", "M216 390 C205 380 196 377 186 386 C165 407 171 441 193 475 C224 525 285 569 338 581 C309 543 288 492 283 449 M252 412 C269 395 279 373 280 351 M307 351 C309 385 303 416 282 445"),
 ("left-atrium","leftAtrium", "M382 356 C360 337 341 308 347 280 C350 265 357 254 368 246 C397 227 440 235 460 255 C479 275 475 307 451 329 L423 356"),
 ("left-ventricle","leftVentricle", "M379 365 C364 391 351 422 351 460 C348 487 351 513 365 544 C373 565 385 580 397 598 C409 583 421 567 431 550 C453 517 467 477 460 436 C456 407 440 379 423 364 M376 398 C358 378 339 362 338 346 M364 345 C368 360 382 373 395 386"),
]
border_parts=[]
for id, concept, d in rims:
    border_parts.append(group("border-"+id, concept, path(d, fill="none", stroke="#422238", stroke_width="7", opacity=".85", stroke_linecap="round", stroke_linejoin="round") + "\n" + path(d, fill="none", stroke="url(#cut-surface)", stroke_width="4.5", stroke_linecap="round", stroke_linejoin="round") + "\n" + path(d, fill="none", stroke="#d9a29b", stroke_width=".85", opacity=".3", stroke_linecap="round")))

septum = group("front-septum", "myocardium", path("M321 348 C339 343 352 355 360 374 C340 408 337 445 340 481 C344 536 369 580 397 611 L378 627 C347 594 321 554 309 508 C297 464 292 427 278 393 C296 379 308 363 321 348Z", fill="url(#septum-depth)", stroke="#432138", stroke_width="1.3") + "\n" + path("M321 382 C308 425 320 491 335 534 C347 569 365 596 380 610 M325 384 C315 430 327 495 341 533 C352 566 369 592 384 607 M331 383 C321 431 331 493 346 530", fill="none", stroke="#d0a097", stroke_width=".85", opacity=".2"))

def leaflet(d, motion, hinge):
    return path(d, fill="url(#ivory-leaflet)", stroke="#795b66", stroke_width=".7", class_="valve-leaflet", data_heart_motion=motion, data_hinge=hinge, style="transform-box:fill-box;transform-origin:50% 0%")

tv = group("tricuspid-valve", "tricuspidValve", path("M207 381 Q235 369 263 380 L260 388 Q233 382 211 390Z", fill="#a27479", stroke="#78515e", stroke_width=".9") + "\n" + path("M211 379 Q235 373 259 379", fill="none", stroke="#d5b2a4", stroke_width="1", opacity=".6") + "\n" + leaflet("M211 383 C222 383 230 386 235 390 C235 397 232 404 227 402 C219 398 213 389 211 383Z", "av-valve", "211,383") + "\n" + leaflet("M260 383 C249 383 241 386 235 390 C237 397 241 403 246 400 C254 395 258 388 260 383Z", "av-valve", "260,383") + "\n" + leaflet("M231 384 Q237 381 243 384 C243 391 240 397 237 398 C233 393 231 388 231 384Z", "av-valve", "237,384"))
mv = group("mitral-valve", "mitralValve", path("M373 354 Q400 343 427 354 L424 362 Q401 354 377 363Z", fill="#a8777b", stroke="#79505d", stroke_width=".9") + "\n" + path("M377 352 Q400 347 423 352", fill="none", stroke="#d5b2a4", stroke_width="1", opacity=".6") + "\n" + leaflet("M377 357 C388 356 397 359 401 363 C402 371 400 380 395 379 C386 374 380 365 377 357Z", "av-valve", "377,357") + "\n" + leaflet("M423 357 C413 355 405 358 401 363 C401 370 404 380 409 377 C417 370 421 363 423 357Z", "av-valve", "423,357"))
pv = group("pulmonary-valve", "pulmonaryValve", path("M277 345 Q294 337 311 344 L309 351 Q294 345 280 353Z", fill="#8695a2", stroke="#343747", stroke_width="2") + "\n" + leaflet("M280 346 Q286 353 292 346 Q290 358 283 357Z", "semilunar-valve", "280,346") + "\n" + leaflet("M292 346 Q298 353 305 346 Q302 358 296 357Z", "semilunar-valve", "305,346") + "\n" + leaflet("M286 344 Q294 352 302 344 Q295 340 286 344Z", "semilunar-valve", "294,344"))
av = group("aortic-valve", "aorticValve", path("M335 340 Q352 332 368 339 L365 346 Q352 340 338 348Z", fill="#bb7f81", stroke="#613141", stroke_width="2") + "\n" + leaflet("M338 341 Q344 348 351 341 Q348 353 342 353Z", "semilunar-valve", "338,341") + "\n" + leaflet("M351 341 Q357 348 364 341 Q361 353 355 353Z", "semilunar-valve", "364,341") + "\n" + leaflet("M343 339 Q351 347 359 339 Q351 335 343 339Z", "semilunar-valve", "351,339"))
valves = group("valves", None, "\n".join([tv, pv, mv, av]))
front = group("front-occlusion", None, "\n".join([front_muscle, *border_parts, septum, valves]))

svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="heart-root" viewBox="0 0 640 700" role="img" aria-labelledby="heart-science-title heart-science-description" data-geometry-knowledge="inference" data-science-lock="heart-science-lock/v1">
<title id="heart-science-title">Human heart — original educational cutaway</title>
<desc id="heart-science-description">Patient right is viewer left. Four chambers and four distinct valve ports model normal postnatal circulation. A thick left ventricular wall and continuous septum separate the ventricular cavities. Blue denotes oxygen-poor and carmine oxygen-rich blood as an educational convention. Geometry, vessel branches and timing are authored illustration, not measured or clinically certified anatomy. NIH NIAID BioArt is retained separately as an exterior reference and supplies no internal anatomy to this drawing.</desc>
{defs}
{back}
{blood}
{front}
</svg>
'''.replace("class-=", "class=")
ET.fromstring(svg)
DEST.mkdir(parents=True, exist_ok=True)
asset = DEST / "heart-science.svg"
asset.write_text(svg, encoding="utf-8")
provenance = {
 "assetId": "nahlati-original-heart-science-cutaway-v1",
 "title": "Human heart — original educational cutaway",
 "creator": "Original vector illustration authored for Nahlati My Bee",
 "assetRole": "authored-educational-cutaway",
 "geometryKnowledge": "inference",
 "anatomyFactsKnowledge": "fact",
 "clinicalReview": {"status": "unknown", "certified": False},
 "viewBox": "0 0 640 700",
 "svgSha256": hashlib.sha256(asset.read_bytes()).hexdigest(),
 "generator": "scripts/prepare-heart-science.py",
 "generatorSha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
 "referenceAssets": [{
   "path": "/heart-vector/niaid-heart.svg", "role": "separate-exterior-reference",
   "provider": "NIH/NIAID BioArt", "creator": "Ryan Kissinger", "credit": "Courtesy of NIAID",
   "sourcePage": "https://bioart.niaid.nih.gov/bioart/228",
   "originalGeometryReusedInCutaway": False,
   "sha256": hashlib.sha256((DEST / "niaid-heart.svg").read_bytes()).hexdigest(),
 }],
 "scientificSources": [
   {"id": "nhlbi-anatomy", "title": "NHLBI — Heart anatomy", "url": "https://www.nhlbi.nih.gov/health/heart/anatomy"},
   {"id": "nhlbi-blood-flow", "title": "NHLBI — Blood flow through the heart", "url": "https://www.nhlbi.nih.gov/health/heart/blood-flow"},
 ],
 "disclosures": [
   "The NIH exterior reference and this original internal cutaway are distinct assets; no positional NIH group is relabeled as an internal chamber or valve.",
   "Native paths and gradients are authored educational geometry, not patient measurements or a clinically certified anatomical reconstruction.",
   "Normal postnatal circulation is simplified. The heart's own coronary circulation and pathology are not modeled.",
   "Blue is an educational convention for oxygen-poor blood; human blood is red.",
   "Chamber scale, cut plane, vessel branches, shading, cycle phase and transit speed are illustrative inferences.",
 ],
 "ports": {"tricuspidValve": [235,385], "pulmonaryValve": [294,347], "mitralValve": [401,358], "aorticValve": [352,342]},
 "orientation": "Patient right on viewer left; atria superior; ventricles inferior",
 "rasterPayloads": 0,
 "pathCount": len(ET.fromstring(svg).findall(".//{http://www.w3.org/2000/svg}path")),
}
(DEST / "heart-science.provenance.json").write_text(json.dumps(provenance, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps({"asset": str(asset.relative_to(ROOT)), "bytes": asset.stat().st_size, "paths": provenance["pathCount"], "svgSha256": provenance["svgSha256"]}))
