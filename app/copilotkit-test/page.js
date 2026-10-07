"use client";

import { useState } from "react";
import {
  CopilotKitProvider,
  CopilotChat,
  useAgentContext,
  useFrontendTool
} from "@copilotkit/react-core/v2";
import { z } from "zod";

const STATES = {
  overview: {
    title: "Overview",
    detail: "القلب كمضخة رباعية الحجرات."
  },
  blood_flow: {
    title: "Blood Flow",
    detail: "تدفّق الدم: الجسم ← القلب الأيمن ← الرئتان ← القلب الأيسر ← الجسم."
  },
  valves: {
    title: "Valves",
    detail: "الصمامات تضمن مرور الدم باتجاه واحد."
  },
  aorta: {
    title: "Aorta",
    detail: "الأبهر هو الشريان الرئيسي الذي يخرج الدم المؤكسج من البطين الأيسر."
  }
};

function HeartAgentExperiment() {
  const [activeState, setActiveState] = useState("overview");
  const [lastAction, setLastAction] = useState("none");

  useAgentContext({
    description: "Current NAHLATY heart demo state. Use this when answering what is currently shown.",
    value: {
      activeState,
      visibleTitle: STATES[activeState].title,
      visibleDetail: STATES[activeState].detail,
      lastAction
    }
  });

  useFrontendTool({
    name: "set_heart_scene",
    description:
      "Change the visible NAHLATY heart learning scene. Use this whenever the user asks to show, focus on, switch to, or explain a specific heart view. Valid scenes are overview, blood_flow, valves, and aorta.",
    parameters: z.object({
      scene: z
        .enum(["overview", "blood_flow", "valves", "aorta"])
        .describe("The heart scene to show."),
      reason: z
        .string()
        .describe("A short reason for this scene change.")
    }),
    handler: async ({ scene, reason }) => {
      setActiveState(scene);
      setLastAction(`set_heart_scene(${scene}) — ${reason}`);
      return {
        status: "success",
        activeState: scene,
        visibleTitle: STATES[scene].title
      };
    }
  }, []);

  const active = STATES[activeState];

  return (
    <main style={{minHeight:"100vh",background:"#080b12",color:"#f7f8fb",padding:"32px 20px",fontFamily:"system-ui"}}>
      <div style={{maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"minmax(0,1.25fr) minmax(340px,.75fr)",gap:24,alignItems:"start"}}>
        <section>
          <div style={{fontSize:13,opacity:.65,letterSpacing:1}}>NAHLATY · COPILOTKIT REAL ACTION TEST</div>
          <h1 style={{fontSize:"clamp(34px,7vw,72px)",lineHeight:1.02,margin:"18px 0"}}>{active.title}</h1>
          <p style={{fontSize:20,lineHeight:1.7,opacity:.82,maxWidth:720}}>{active.detail}</p>

          <div style={{marginTop:28,padding:"18px",border:"1px solid #29303d",borderRadius:16,background:"#0d121b"}}>
            <div style={{fontSize:12,opacity:.6,marginBottom:8}}>CURRENT STATE</div>
            <div style={{fontSize:24,fontWeight:700}}>{activeState}</div>
            <div style={{fontSize:13,opacity:.65,marginTop:10}}>Last AI action: {lastAction}</div>
          </div>

          <div style={{display:"grid",gap:12,marginTop:28}}>
            {[
              "Show me how blood flows through the heart.",
              "Now focus only on the aorta.",
              "What are you currently showing me?"
            ].map((x)=><div key={x} style={{padding:"16px 18px",border:"1px solid #29303d",borderRadius:16,background:"#0d121b"}}>{x}</div>)}
          </div>

          <p style={{marginTop:22,opacity:.55}}>
            PASS requires CopilotKit to invoke set_heart_scene and visibly change CURRENT STATE.
          </p>
        </section>

        <aside style={{position:"sticky",top:20,height:"calc(100vh - 40px)",minHeight:560,border:"1px solid #29303d",borderRadius:18,overflow:"hidden",background:"#0d121b"}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid #29303d",fontWeight:700}}>
            NAHLATY Agent Chat
          </div>
          <div style={{height:"calc(100% - 49px)"}}>
            <CopilotChat
              agentId="default"
              labels={{
                chatInputPlaceholder: "Type: Show me how blood flows through the heart."
              }}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CopilotKitTestPage() {
  return (
    <CopilotKitProvider runtimeUrl="/api/copilotkit" agentId="default">
      <HeartAgentExperiment />
    </CopilotKitProvider>
  );
}
