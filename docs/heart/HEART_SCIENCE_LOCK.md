# Heart science lock

This contract describes simplified normal **postnatal** human circulation for an educational cutaway. It preserves the existing `heart.core-flow` scene and thirteen required heart concept IDs. It does not describe fetal circulation, congenital variants, patient-specific measurements or a clinical simulator.

The scientific references are NHLBI heart anatomy, blood flow and heartbeat, supplemented by OpenStax's official Anatomy and Physiology 2e source for ventricular wall-muscle comparison and cardiac-output arithmetic. The preserved NIH/NIAID BioArt asset is an exterior illustration: it is a credited visual reference, and its positional vessel groups do not establish hidden chambers or valve identities. The separately authored cutaway must be identified as original educational geometry; it must not claim that its internal structures were extracted from the NIH exterior.

## Locked circulation

```text
body tissues → venae cavae → right atrium → tricuspid valve
→ right ventricle → pulmonary valve → pulmonary artery → lungs
→ pulmonary veins → left atrium → mitral valve → left ventricle
→ aortic valve → aorta → body tissues
```

`HEART_FLOW_PATH` contains both body endpoints. `HEART_SCENE_SPEC` contains one `circulation.body` concept and one `circulation.lungs` concept, both external context with `assetRequired: false`. Every adjacent pair is a directed `flow` relation. The existing twelve relation IDs retain their original endpoints; `heart.flow.body-return` and `heart.flow.body-delivery` close the circuit.

Systemic venous return, right-heart flow and pulmonary arterial flow are oxygen-poor (`oxygenation: "deoxygenated"`). Lung outflow, pulmonary venous return, left-heart flow and aortic delivery are oxygen-rich (`oxygenation: "oxygenated"`). Gas exchange occurs in the lungs; oxygen extraction occurs in systemic tissues. “Deoxygenated” means relatively oxygen-poor, not zero oxygen. Artery and vein names indicate flow away from and toward the heart; they do not determine oxygen content.

## Anatomy and geometry contract

`HEART_ANATOMY_BINDINGS` exports these unchanged concept IDs and canonical authored SVG element IDs:

| Concept ID | SVG element ID | Structure or constraint |
| --- | --- | --- |
| `heart.venaCava` | `vena-cava` | Superior and inferior return to the right atrium |
| `heart.rightAtrium` | `right-atrium` | Receives systemic venous return |
| `heart.tricuspidValve` | `tricuspid-valve` | Between right atrium and right ventricle |
| `heart.rightVentricle` | `right-ventricle` | Ejects toward the pulmonary artery |
| `heart.pulmonaryValve` | `pulmonary-valve` | Between right ventricle and pulmonary artery |
| `heart.pulmonaryArtery` | `pulmonary-artery` | Carries oxygen-poor blood toward the lungs |
| `heart.pulmonaryVeins` | `pulmonary-veins` | Carries oxygen-rich blood from lungs to left atrium |
| `heart.leftAtrium` | `left-atrium` | Receives pulmonary venous return |
| `heart.mitralValve` | `mitral-valve` | Between left atrium and left ventricle |
| `heart.leftVentricle` | `left-ventricle` | Ejects through aortic valve to aorta; thicker muscular wall than right ventricle |
| `heart.aorticValve` | `aortic-valve` | Between left ventricle and aorta |
| `heart.aorta` | `aorta` | Delivers oxygen-rich blood to systemic tissues |
| `heart.myocardium` | `myocardium` | Muscular wall; not an additional chamber or flow route |

`HEART_VENA_CAVA_SUBPARTS` names `superior-vena-cava` and `inferior-vena-cava` separately under the existing `heart.venaCava` concept. The aggregate parent remains the runtime selection owner, avoiding a required-ID migration. Pulmonary veins can be represented as simplified visible branches; their exact number, dimensions and anatomical arrangement must not be claimed as measured by this diagram.

The cutaway must visibly distinguish all four chambers and all four valves. The septum separates the right and left sides. No normal direct right-to-left chamber route is permitted. The aorta connects to left ventricular outflow after the aortic valve; a visual crossing with the pulmonary artery is not a vessel junction. Anatomical right/left labels describe the patient, not screen coordinates; a frontal schematic normally shows the anatomical right on the viewer's left.

Bindings are a contract for authored geometry, not proof that a path is anatomically correct. SVG uniqueness, source/license checks, correct topology and visual inspection remain separate requirements. The exterior NIH asset retains its own `semantic.ready: false` status because it does not expose the required internal anatomy.

## Knowledge labels and simulation limits

`HEART_SCIENCE_LOCK` exports `heart-science-lock/v1` with claims using the existing knowledge vocabulary:

| Label | Meaning here | Examples |
| --- | --- | --- |
| `fact` | Established normal physiology or anatomy, with a cited source | Four chambers/four valves; directed flow; pulmonary arterial versus venous oxygenation; ventricular separation |
| `inference` | An explicitly authored educational convention or simplifying assumption | Red/blue coloring; SVG geometry; phase timings; 40–180 BPM control limits; fixed 70 mL stroke volume |
| `unknown` | Information not established or estimated by this scene | Individual stroke volume, ejection fraction, pathology, coronary flow and exercise response |

Every relation records physiological `oxygenation` separately from illustrative `bloodColor` and `colorKnowledge: "inference"`. Blood is red; venous blood is darker red. Blue is a diagram convention and must never be taught as the actual color of oxygen-poor blood.

The two ventricles pump during the same cardiac cycle. Sequentially highlighting a route explains circulation order; it does not imply that chambers pump serially or measure the transit time of a blood particle. The exported timeline marks all normalized phase positions as `inference`. The animation is educational, with no measured pressure, valve kinetics or clinical accuracy claim.

`cardiacOutputLitersPerMinute(heartRate, strokeVolume = 70)` retains its existing API. The arithmetic is:

```text
cardiac output (L/min) = heart rate (beats/min) × stroke volume (mL/beat) / 1000
```

The formula is factual arithmetic; the displayed result is an educational estimate because the default stroke volume is fixed at 70 mL. It must not imply that real stroke volume remains constant as heart rate changes. At 60 BPM this assumption yields 4.2 L/min; at 120 BPM it yields 8.4 L/min. The scene does not infer an individual user's cardiac output.

## Source and verification boundaries

See [HEART_EVIDENCE_LEDGER.md](HEART_EVIDENCE_LEDGER.md) for source URLs, exact supporting quotations and local provenance verification. On 2026-10-07, the official NIH/NHLBI pages were successfully fetched with TLS verification and their supporting anatomy, flow and license text inspected. OpenStax's official publisher source was also retrieved at an immutable Git revision to verify the ventricular muscle-thickness comparison and cardiac-output identity. This source-text review does not constitute clinical sign-off, endorsement or verification of the authored cutaway's precise dimensions and timing.

The semantic tests verify exact directed topology, pulmonary oxygenation, four distinct chamber and valve concepts, canonical IDs, vena cava subparts, knowledge labels and binding validation. Asset rendering, clipping, geometry placement, animation and interaction require the separate runtime/browser checks.
