"use client";

import { useState } from "react";
import {
  CopilotKitProvider,
  CopilotSidebar,
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
    <>
      <main style={{minHeight:"100vh",background:"#080b12",color:"#f7f8fb",padding:"48px 24px",fontFamily:"system-ui"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{fontSize:13,opacity:.65,letterSpacing:1}}>NAHLATY · COPILOTKIT REAL ACTION TEST</div>
          <h1 style={{fontSize:"clamp(34px,7vw,72px)",lineHeight:1.02,margin:"18px 0"}}>{active.title}</h1>
          <p style={{fontSize:20,lineHeight:1.7,opacity:.82,maxWidth:720}}>{active.detail}</p>

          <div style={{marginTop:28,padding:"18px",border:"1px solid #29303d",borderRadius:16,background:"#0d121b"}}>
            <div style={{fontSize:12,opacity:.6,marginBottom:8}}>CURRENT STATE</div>
            <div style={{fontSize:24,fontWeight:700}}>{activeState}</div>
            <div style={{fontSize:13,opacity:.65,marginTop:10}}>Last AI action: {lastAction}</div>
          </div>

          <div style={{display:"grid",gap:12,marginTop:34}}>
            {[
              "Show me how blood flows through the heart.",
              "Now focus only on the aorta.",
              "What are you currently showing me?"
            ].map((x)=><div key={x} style={{padding:"16px 18px",border:"1px solid #29303d",borderRadius:16,background:"#0d121b"}}>{x}</div>)}
          </div>

          <p style={{marginTop:26,opacity:.55}}>
            PASS requires CopilotKit to invoke set_heart_scene and visibly change CURRENT STATE.
          </p>
        </div>
      </main>

      <CopilotSidebar
        agentId="default"
        defaultOpen={true}
        labels={{
          title: "NAHLATY Agent Action Test",
          initial: "اختبرني: اطلب عرض تدفق الدم أو التركيز على الأبهر.",
          placeholder: "اكتب أمرًا..."
        }}
      />
    </>
  );
}

export default function CopilotKitTestPage() {
  return (
    <CopilotKitProvider runtimeUrl="/api/copilotkit" agentId="default">
      <HeartAgentExperiment />
    </CopilotKitProvider>
  );
}
