"use client";

import { useMemo, useState } from "react";
import {
  CopilotKitProvider,
  CopilotChat,
  useAgentContext,
  useFrontendTool
} from "@copilotkit/react-core/v2";
import { z } from "zod";

const FLOW = {
  venous: "M150 86 C190 112 217 150 238 206 C252 244 266 284 310 318 C344 345 378 352 414 336",
  pulmOut: "M352 178 C392 148 432 132 474 132 C516 132 551 150 578 180",
  pulmIn: "M575 212 C530 224 500 246 464 278 C438 300 410 312 374 314",
  systemic: "M380 108 C414 84 462 74 512 88 C558 100 592 128 615 166"
};

function FlowDots({ pathId, color, count = 7, duration = 4.2, reverse = false, radius = 5, opacity = 0.95 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <circle key={i} r={radius} fill={color} opacity={opacity}>
          <animateMotion
            dur={`${duration}s`}
            begin={`-${(duration / count) * i}s`}
            repeatCount="indefinite"
            rotate="auto"
            keyPoints={reverse ? "1;0" : "0;1"}
            keyTimes="0;1"
            calcMode="linear"
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      ))}
    </>
  );
}

function CinematicHeartExperience() {
  const [running, setRunning] = useState(true);
  const [bpm, setBpm] = useState(72);
  const [labels, setLabels] = useState(true);
  const [cutaway, setCutaway] = useState(false);
  const [lastAIAction, setLastAIAction] = useState("none");
  const beatSeconds = useMemo(() => Math.max(0.45, 60 / bpm), [bpm]);

  useAgentContext({
    description: "Live state of the cinematic NAHLATY HTML/SVG heart scene. Use this context before answering what is visible or running.",
    value: {
      running,
      bpm,
      labels,
      cutaway,
      mode: cutaway ? "cutaway" : "anatomy",
      bloodFlowAnimated: running,
      lastAIAction
    }
  });

  useFrontendTool({
    name: "set_heart_rate",
    description: "Set the live heart rate for the HTML/SVG heart. Use when the user asks for a BPM or faster/slower heartbeat.",
    parameters: z.object({
      bpm: z.number().min(45).max(140).describe("Heart rate in beats per minute, between 45 and 140.")
    }),
    handler: async ({ bpm: nextBpm }) => {
      const safeBpm = Math.max(45, Math.min(140, Math.round(nextBpm)));
      setBpm(safeBpm);
      setRunning(true);
      setLastAIAction(`set_heart_rate(${safeBpm})`);
      return { status: "success", bpm: safeBpm, running: true };
    }
  }, []);

  useFrontendTool({
    name: "set_heart_view",
    description: "Change the live HTML/SVG heart view. anatomy shows the normal heart; cutaway reveals internal chambers; blood_flow emphasizes the moving circulation.",
    parameters: z.object({
      view: z.enum(["anatomy", "cutaway", "blood_flow"]).describe("The heart view to show.")
    }),
    handler: async ({ view }) => {
      if (view === "anatomy") {
        setCutaway(false);
        setLabels(true);
      } else if (view === "cutaway") {
        setCutaway(true);
        setLabels(true);
      } else {
        setCutaway(true);
        setLabels(false);
        setRunning(true);
      }
      setLastAIAction(`set_heart_view(${view})`);
      return { status: "success", view };
    }
  }, []);

  useFrontendTool({
    name: "set_heart_labels",
    description: "Show or hide anatomical labels on the live HTML/SVG heart.",
    parameters: z.object({
      visible: z.boolean().describe("Whether labels should be visible.")
    }),
    handler: async ({ visible }) => {
      setLabels(visible);
      setLastAIAction(`set_heart_labels(${visible})`);
      return { status: "success", labels: visible };
    }
  }, []);

  useFrontendTool({
    name: "set_heart_playback",
    description: "Start or pause the heartbeat and blood-flow animation in the live HTML/SVG heart.",
    parameters: z.object({
      running: z.boolean().describe("True to animate, false to pause.")
    }),
    handler: async ({ running: shouldRun }) => {
      setRunning(shouldRun);
      setLastAIAction(`set_heart_playback(${shouldRun})`);
      return { status: "success", running: shouldRun };
    }
  }, []);

  return (
    <main
      dir="rtl"
      className={`cinematicHeart ${running ? "isRunning" : "isPaused"} ${cutaway ? "isCutaway" : ""}`}
      style={{ "--beat": `${beatSeconds}s` }}
    >
      <section className="stage">
        <div className="ambient ambientA" />
        <div className="ambient ambientB" />

        <header className="topbar">
          <div>
            <span className="eyebrow">NAHLATY · COPILOTKIT × LIVE HTML HEART</span>
            <h1>قلب حيّ — HTML / SVG</h1>
            <p>CopilotKit يتحكم فعليًا بقلب HTML/SVG: النبض، BPM، تدفق الدم، Cutaway والـLabels.</p>
          </div>
          <div className="statusPill">
            <span className="liveDot" />
            <b>{bpm} BPM</b>
          </div>
        </header>

        <div className="sceneWrap">
          <svg
            className="heartSvg"
            viewBox="0 0 760 560"
            role="img"
            aria-label="قلب بشري متحرك مع تدفق الدم"
          >
            <defs>
              <radialGradient id="bgGlow" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="#1a2130" stopOpacity=".92" />
                <stop offset="100%" stopColor="#04070d" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="muscle" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#6d0718" />
                <stop offset="32%" stopColor="#9c1027" />
                <stop offset="63%" stopColor="#5d0717" />
                <stop offset="100%" stopColor="#220510" />
              </linearGradient>

              <linearGradient id="muscleHi" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#e2455c" stopOpacity=".9" />
                <stop offset="55%" stopColor="#8e1329" stopOpacity=".15" />
                <stop offset="100%" stopColor="#18050d" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="artery" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ff6b73" />
                <stop offset="50%" stopColor="#c71735" />
                <stop offset="100%" stopColor="#6e071c" />
              </linearGradient>

              <linearGradient id="vein" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#6fb6ff" />
                <stop offset="45%" stopColor="#245fc8" />
                <stop offset="100%" stopColor="#102b63" />
              </linearGradient>

              <radialGradient id="chamberRed">
                <stop offset="0%" stopColor="#ff5b6d" stopOpacity=".92" />
                <stop offset="65%" stopColor="#8f0c23" stopOpacity=".9" />
                <stop offset="100%" stopColor="#24040c" stopOpacity=".96" />
              </radialGradient>

              <radialGradient id="chamberBlue">
                <stop offset="0%" stopColor="#66b8ff" stopOpacity=".9" />
                <stop offset="65%" stopColor="#1a4ba7" stopOpacity=".88" />
                <stop offset="100%" stopColor="#071a45" stopOpacity=".96" />
              </radialGradient>

              <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="specular" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".55" specularExponent="18" lightingColor="#ffd8dc" result="spec">
                  <fePointLight x="180" y="70" z="260" />
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut" />
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="1" k2="1" k3=".42" k4="0" />
              </filter>

              <clipPath id="heartClip">
                <path d="M373 156 C326 111 250 109 207 156 C161 207 171 293 226 355 C280 417 344 455 380 483 C416 455 487 414 534 350 C577 291 588 216 546 169 C504 122 438 125 398 160 C388 169 381 179 376 188 C371 177 370 166 373 156 Z" />
              </clipPath>

              <path id="flowVenous" d={FLOW.venous} fill="none" />
              <path id="flowPulmOut" d={FLOW.pulmOut} fill="none" />
              <path id="flowPulmIn" d={FLOW.pulmIn} fill="none" />
              <path id="flowSystemic" d={FLOW.systemic} fill="none" />
            </defs>

            <ellipse cx="380" cy="300" rx="310" ry="245" fill="url(#bgGlow)" />

            <g className="vascularBack">
              <path d="M354 171 C347 111 356 54 386 28 C414 4 443 14 448 45 C453 75 423 116 404 159" fill="none" stroke="url(#artery)" strokeWidth="42" strokeLinecap="round" filter="url(#specular)" />
              <path d="M380 112 C431 77 505 68 554 93 C589 111 613 144 620 180" fill="none" stroke="url(#artery)" strokeWidth="30" strokeLinecap="round" />
              <path d="M337 163 C302 120 254 94 213 102 C181 108 159 135 157 171" fill="none" stroke="url(#vein)" strokeWidth="34" strokeLinecap="round" />
              <path d="M191 127 C154 92 127 77 98 82" fill="none" stroke="url(#vein)" strokeWidth="25" strokeLinecap="round" />
              <path d="M206 184 C166 187 134 209 112 244" fill="none" stroke="url(#vein)" strokeWidth="27" strokeLinecap="round" />
            </g>

            <g className="heartBody">
              <path
                className="heartShell"
                d="M373 156 C326 111 250 109 207 156 C161 207 171 293 226 355 C280 417 344 455 380 483 C416 455 487 414 534 350 C577 291 588 216 546 169 C504 122 438 125 398 160 C388 169 381 179 376 188 C371 177 370 166 373 156 Z"
                fill="url(#muscle)"
                filter="url(#specular)"
              />

              <path
                className="muscleHighlight"
                d="M239 161 C200 205 206 281 252 336 C293 384 337 414 368 436 C332 379 329 315 340 261 C348 220 352 179 326 151 C296 128 263 136 239 161 Z"
                fill="url(#muscleHi)"
                opacity=".7"
              />

              <g clipPath="url(#heartClip)" className="internal">
                <path d="M223 186 C262 151 316 157 339 201 C349 220 350 247 344 272 C323 255 293 250 261 260 C238 267 220 251 214 230 C208 211 211 197 223 186 Z" fill="url(#chamberBlue)" stroke="#5aa7ff" strokeOpacity=".45" strokeWidth="3" />
                <path d="M274 282 C315 257 349 274 363 312 C378 352 354 402 320 428 C286 402 250 370 244 333 C240 307 251 294 274 282 Z" fill="url(#chamberBlue)" stroke="#6caaff" strokeOpacity=".45" strokeWidth="3" />
                <path d="M421 190 C456 158 506 160 533 194 C548 213 548 239 538 262 C513 245 479 245 450 257 C425 267 403 255 397 233 C391 213 400 201 421 190 Z" fill="url(#chamberRed)" stroke="#ff6e7f" strokeOpacity=".45" strokeWidth="3" />
                <path d="M419 275 C461 251 508 267 524 308 C542 352 509 401 465 431 C426 397 394 350 394 315 C394 298 402 285 419 275 Z" fill="url(#chamberRed)" stroke="#ff7b88" strokeOpacity=".5" strokeWidth="3" />

                <path d="M377 187 C366 236 367 303 379 395" fill="none" stroke="#d89aa3" strokeWidth="8" strokeLinecap="round" opacity=".65" />

                <g className="valves">
                  <path d="M343 274 Q359 289 370 312 Q354 302 340 314 Q351 291 343 274 Z" fill="#f7bdc5" opacity=".92" />
                  <path d="M397 266 Q412 282 418 304 Q404 293 391 305 Q403 284 397 266 Z" fill="#ffd0d5" opacity=".92" />
                  <path d="M382 185 Q395 199 399 219 Q388 208 377 218 Q386 201 382 185 Z" fill="#ffc5ce" opacity=".86" />
                </g>

                <g className="flowGlow" opacity=".9">
                  <path d="M154 90 C203 121 230 166 249 219 C263 257 277 296 317 326" fill="none" stroke="#5aa7ff" strokeOpacity=".25" strokeWidth="16" strokeLinecap="round" />
                  <path d="M314 328 C334 344 351 356 365 369" fill="none" stroke="#5aa7ff" strokeOpacity=".22" strokeWidth="14" strokeLinecap="round" />
                  <path d="M367 363 C404 335 433 313 466 287 C505 257 533 232 575 214" fill="none" stroke="#ff5f72" strokeOpacity=".25" strokeWidth="16" strokeLinecap="round" />
                </g>

                <FlowDots pathId="flowVenous" color="#72b8ff" count={8} duration={4.6} radius={5.6} />
                <FlowDots pathId="flowPulmOut" color="#77bdff" count={6} duration={3.8} radius={5.2} />
                <FlowDots pathId="flowPulmIn" color="#ff6c7b" count={6} duration={3.7} radius={5.2} reverse />
                <FlowDots pathId="flowSystemic" color="#ff6b79" count={7} duration={4.1} radius={5.6} />
              </g>

              <path d="M356 167 C347 129 348 100 359 78" fill="none" stroke="#8b1027" strokeWidth="16" strokeLinecap="round" opacity=".9" />
              <path d="M403 159 C419 134 443 116 470 108" fill="none" stroke="#b71931" strokeWidth="14" strokeLinecap="round" opacity=".92" />
            </g>

            <g className={labels ? "labels visible" : "labels"}>
              <line x1="276" y1="223" x2="152" y2="194" stroke="#8ebcf2" strokeOpacity=".7" />
              <text x="144" y="190" textAnchor="end">الأذين الأيمن</text>

              <line x1="297" y1="344" x2="160" y2="378" stroke="#8ebcf2" strokeOpacity=".7" />
              <text x="152" y="383" textAnchor="end">البطين الأيمن</text>

              <line x1="472" y1="218" x2="610" y2="186" stroke="#ff9da8" strokeOpacity=".72" />
              <text x="618" y="182">الأذين الأيسر</text>

              <line x1="468" y1="348" x2="608" y2="382" stroke="#ff9da8" strokeOpacity=".72" />
              <text x="616" y="387">البطين الأيسر</text>

              <line x1="421" y1="80" x2="524" y2="42" stroke="#ff9da8" strokeOpacity=".72" />
              <text x="534" y="39">الأبهر</text>
            </g>

            <g className="heartbeatRing">
              <circle cx="380" cy="286" r="180" fill="none" stroke="#ff566e" strokeOpacity=".16" strokeWidth="2" />
              <circle cx="380" cy="286" r="222" fill="none" stroke="#ff566e" strokeOpacity=".08" strokeWidth="1" />
            </g>
          </svg>

          <div className="hud">
            <div className="metric">
              <span>STATE</span>
              <strong>{running ? "LIVE" : "PAUSED"}</strong>
            </div>
            <div className="metric">
              <span>FLOW</span>
              <strong>RIGHT → LUNGS → LEFT → BODY</strong>
            </div>
            <div className="metric">
              <span>MODE</span>
              <strong>{cutaway ? "CUTAWAY" : "ANATOMY"}</strong>
            </div>
          </div>
        </div>

        <div className="controls">
          <button type="button" onClick={() => setRunning(v => !v)}>
            {running ? "إيقاف" : "تشغيل"}
          </button>

          <label>
            <span>Heart rate</span>
            <input
              type="range"
              min="45"
              max="140"
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
            />
            <b>{bpm} BPM</b>
          </label>

          <button type="button" className={labels ? "active" : ""} onClick={() => setLabels(v => !v)}>
            Labels
          </button>

          <button type="button" className={cutaway ? "active" : ""} onClick={() => setCutaway(v => !v)}>
            Cutaway
          </button>

          <button type="button" onClick={() => { setBpm(72); setLabels(true); setCutaway(false); setRunning(true); }}>
            Reset
          </button>
        </div>

        <div className="legend">
          <div><i className="blue" />دم غير مؤكسج</div>
          <div><i className="red" />دم مؤكسج</div>
          <div className="note">المشهد HTML/SVG مباشر، وCopilotKit ينفّذ تغييرات حقيقية على الحالة.</div>
        </div>

        <section className="copilotPanel">
          <div className="copilotSummary">
            <span className="eyebrow">COPILOTKIT E2E TEST</span>
            <h2>اطلب من الوكيل تغيير القلب</h2>
            <p>جرّب: “Show blood flow, set the heart to 96 BPM, turn labels on, then pause it.”</p>
            <div className="aiAction">Last AI action: <b>{lastAIAction}</b></div>
          </div>
          <div className="copilotChatBox">
            <CopilotChat
              agentId="default"
              labels={{
                chatInputPlaceholder: "مثال: Show blood flow at 96 BPM"
              }}
            />
          </div>
        </section>
      </section>

      <style jsx global>{`
        *{box-sizing:border-box}
        html,body{margin:0;background:#03060b;color:#f7f8fb}
        body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .cinematicHeart{min-height:100vh;background:
          radial-gradient(circle at 50% 18%,rgba(67,78,100,.16),transparent 28%),
          radial-gradient(circle at 50% 58%,rgba(114,6,26,.16),transparent 32%),
          linear-gradient(180deg,#04070c,#020409 74%,#05070b);
          padding:24px}
        .stage{max-width:1320px;margin:0 auto;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:28px;background:linear-gradient(180deg,rgba(10,14,21,.88),rgba(5,8,13,.96));box-shadow:0 30px 90px rgba(0,0,0,.42);padding:24px}
        .ambient{position:absolute;border-radius:999px;filter:blur(70px);pointer-events:none}
        .ambientA{width:340px;height:340px;top:14%;left:17%;background:rgba(32,88,185,.12)}
        .ambientB{width:420px;height:420px;right:12%;bottom:2%;background:rgba(175,21,52,.12)}
        .topbar{position:relative;z-index:2;display:flex;gap:24px;justify-content:space-between;align-items:flex-start;padding:4px 4px 10px}
        .eyebrow{font-size:12px;letter-spacing:.18em;color:#a8aebb}
        .topbar h1{font-size:clamp(34px,5vw,68px);line-height:1;margin:12px 0 10px;letter-spacing:-.04em}
        .topbar p{margin:0;color:#adb4c1;font-size:16px}
        .statusPill{display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.09);border-radius:999px;padding:10px 14px;background:rgba(255,255,255,.035);white-space:nowrap}
        .liveDot{width:9px;height:9px;border-radius:50%;background:#ff5d73;box-shadow:0 0 18px rgba(255,93,115,.85);animation:liveDot 1.1s infinite ease-in-out}
        .sceneWrap{position:relative;z-index:1;margin-top:4px}
        .heartSvg{display:block;width:100%;max-height:690px;margin:0 auto;overflow:visible}
        .heartBody{transform-box:fill-box;transform-origin:center center;animation:beat var(--beat) infinite cubic-bezier(.3,.02,.28,1)}
        .heartShell{transition:opacity .28s ease}
        .isCutaway .heartShell{opacity:.38}
        .isCutaway .muscleHighlight{opacity:.18}
        .internal{transition:opacity .25s ease}
        .isCutaway .internal{opacity:1}
        .vascularBack{filter:drop-shadow(0 12px 18px rgba(0,0,0,.28))}
        .labels{opacity:0;transition:opacity .24s ease;pointer-events:none}
        .labels.visible{opacity:1}
        .labels text{fill:#e9edf4;font-size:15px;font-weight:650;paint-order:stroke;stroke:#03060b;stroke-width:4px;stroke-linejoin:round}
        .heartbeatRing circle{transform-box:fill-box;transform-origin:center;animation:ring var(--beat) infinite ease-out}
        .heartbeatRing circle:nth-child(2){animation-delay:calc(var(--beat) * .12)}
        .isPaused .heartBody,.isPaused .heartbeatRing circle,.isPaused .liveDot,.isPaused circle animateMotion{animation-play-state:paused}
        .isPaused .heartSvg{animation-play-state:paused}
        .hud{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:-26px;position:relative;z-index:3}
        .metric{padding:14px 16px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(9,13,20,.72);backdrop-filter:blur(14px)}
        .metric span{display:block;color:#747e8e;font-size:10px;letter-spacing:.13em;margin-bottom:6px}
        .metric strong{font-size:13px;color:#e8ebf1}
        .controls{position:relative;z-index:3;display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:16px;padding:14px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(8,12,18,.75);backdrop-filter:blur(14px)}
        .controls button{min-height:44px;border:1px solid rgba(255,255,255,.11);border-radius:12px;background:#101722;color:#eef2f7;padding:0 16px;cursor:pointer;font-weight:700}
        .controls button:hover{background:#151f2d}
        .controls button.active{border-color:rgba(255,94,115,.48);background:rgba(255,94,115,.12)}
        .controls label{display:flex;align-items:center;gap:10px;min-height:44px;padding:0 14px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:#0c121b}
        .controls label span{color:#9aa4b3;font-size:13px}
        .controls input[type=range]{width:180px;accent-color:#e84c64}
        .controls label b{font-size:13px;min-width:58px}
        .legend{display:flex;flex-wrap:wrap;gap:18px;align-items:center;color:#aab2be;font-size:13px;padding:14px 4px 0}
        .legend>div{display:flex;gap:8px;align-items:center}
        .legend i{width:10px;height:10px;border-radius:50%;display:inline-block}
        .legend .blue{background:#68b7ff;box-shadow:0 0 12px rgba(104,183,255,.65)}
        .legend .red{background:#ff6678;box-shadow:0 0 12px rgba(255,102,120,.65)}
        .legend .note{margin-right:auto;color:#6f7987}
        .copilotPanel{position:relative;z-index:4;display:grid;grid-template-columns:minmax(260px,.7fr) minmax(360px,1.3fr);gap:14px;margin-top:18px}
        .copilotSummary,.copilotChatBox{border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(8,12,18,.82);backdrop-filter:blur(14px)}
        .copilotSummary{padding:18px}
        .copilotSummary h2{margin:8px 0 10px;font-size:24px}
        .copilotSummary p{margin:0;color:#aab2be;line-height:1.7}
        .aiAction{margin-top:16px;padding:12px;border-radius:12px;background:#0c121b;color:#9aa4b3;font-size:13px;overflow-wrap:anywhere}
        .copilotChatBox{height:390px;overflow:hidden}
        @keyframes beat{
          0%,100%{transform:scale(1)}
          10%{transform:scale(1.025)}
          18%{transform:scale(.995)}
          28%{transform:scale(1.018)}
          40%{transform:scale(1)}
        }
        @keyframes ring{
          0%{transform:scale(.93);opacity:.16}
          55%{transform:scale(1.08);opacity:.015}
          100%{transform:scale(1.08);opacity:0}
        }
        @keyframes liveDot{50%{opacity:.35;transform:scale(.75)}}
        @media(max-width:800px){
          .cinematicHeart{padding:10px}
          .stage{padding:14px;border-radius:20px}
          .topbar{flex-direction:column}
          .hud{grid-template-columns:1fr;margin-top:-8px}
          .controls{align-items:stretch}
          .controls label{width:100%}
          .controls input[type=range]{flex:1;min-width:0}
          .legend{gap:12px}
          .legend .note{width:100%;margin:0}
          .copilotPanel{grid-template-columns:1fr}
          .copilotChatBox{height:420px}
        }
        @media(prefers-reduced-motion:reduce){
          .heartBody,.heartbeatRing circle,.liveDot{animation:none!important}
          .heartSvg animateMotion{display:none}
        }
      `}</style>
    </main>
  );
}


export default function CopilotKitCinematicHeartPage() {
  return (
    <CopilotKitProvider runtimeUrl="/api/copilotkit" agentId="default">
      <CinematicHeartExperience />
    </CopilotKitProvider>
  );
}
