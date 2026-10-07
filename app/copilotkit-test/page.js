"use client";

import { CopilotKitProvider, CopilotSidebar } from "@copilotkit/react-core/v2";

export default function CopilotKitTestPage() {
  return (
    <CopilotKitProvider runtimeUrl="/api/copilotkit">
      <main style={{minHeight:"100vh",background:"#080b12",color:"#f7f8fb",padding:"48px 24px",fontFamily:"system-ui"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{fontSize:13,opacity:.65,letterSpacing:1}}>NAHLATY · COPILOTKIT TEST</div>
          <h1 style={{fontSize:"clamp(34px,7vw,72px)",lineHeight:1.02,margin:"18px 0"}}>اختبار الوكيل داخل نحلتي</h1>
          <p style={{fontSize:20,lineHeight:1.7,opacity:.82,maxWidth:720}}>
            هذه صفحة اختبار حقيقية لـ CopilotKit موصولة بواجهة Runtime داخل نفس مشروع نحلتي، وتستخدم Gemini من مفتاح المشروع الموجود على Vercel.
          </p>
          <div style={{display:"grid",gap:12,marginTop:34}}>
            {[
              "اشرح لي كيف يضخ القلب الدم خلال دورة واحدة.",
              "حوّل شرح القلب إلى مشهد بصري من 4 خطوات.",
              "ما الذي يجب أن يتحرك بصريًا لكي أفهم الصمام الأبهري؟"
            ].map((x)=><div key={x} style={{padding:"16px 18px",border:"1px solid #29303d",borderRadius:16,background:"#0d121b"}}>{x}</div>)}
          </div>
          <p style={{marginTop:26,opacity:.55}}>اكتب داخل الشريط الجانبي وجرب الآن.</p>
        </div>
      </main>
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "NAHLATY Agent Test",
          initial: "اكتب سؤالًا عن القلب أو اطلب مني تحويل فكرة إلى شرح بصري.",
          placeholder: "اكتب هنا..."
        }}
      />
    </CopilotKitProvider>
  );
}
