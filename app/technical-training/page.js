"use client";

import { useMemo, useState } from "react";
import { ENGINE_DEMO, SCIENCE_GATES, TRAINING_MODES } from "../lib/technicalProductData";

const STATUS_LABEL = {
  fact: "FACT",
  inference: "INFERENCE",
  unknown: "UNKNOWN",
};

export default function TechnicalTrainingPage() {
  const [mode, setMode] = useState("understand");
  const [faultStep, setFaultStep] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState("pump");
  const [showScience, setShowScience] = useState(false);

  const currentFaultStep = ENGINE_DEMO.fault.steps[faultStep];
  const selected = useMemo(
    () => ENGINE_DEMO.overview.components.find((item) => item.id === selectedComponent),
    [selectedComponent]
  );

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <span style={styles.eyebrow}>NAHLATY · TECHNICAL TRAINING</span>
          <h1 style={styles.h1}>افهم المعدّة. شخّص المشكلة. تدرّب بصريًا.</h1>
          <p style={styles.lead}>
            أول Product Experience تجاري لنحلتي: نفس النواة التفاعلية، لكن موجّهة لتدريب الفنيين
            وتشخيص الأعطال بدون تحويل المنصة إلى منتج منفصل.
          </p>
        </div>
        <div style={styles.heroCard}>
          <small>Commercial demo</small>
          <b>{ENGINE_DEMO.title}</b>
          <span>{ENGINE_DEMO.subtitle}</span>
          <button style={styles.secondaryButton} onClick={() => setShowScience((value) => !value)}>
            {showScience ? "إخفاء بروتوكول الدقة" : "عرض بروتوكول الدقة"}
          </button>
        </div>
      </section>

      {showScience && (
        <section style={styles.sciencePanel}>
          <div>
            <span style={styles.eyebrow}>SCIENTIFIC VETO</span>
            <h2 style={styles.h2}>العلم يملك حق الفيتو على التصميم.</h2>
          </div>
          <div style={styles.gateGrid}>
            {SCIENCE_GATES.map((gate) => (
              <div key={gate} style={styles.gateItem}>✓ {gate}</div>
            ))}
          </div>
        </section>
      )}

      <nav style={styles.modeBar}>
        {TRAINING_MODES.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            style={{ ...styles.modeButton, ...(mode === item.id ? styles.modeButtonActive : {}) }}
          >
            <b>{item.label}</b>
            <small>{item.description}</small>
          </button>
        ))}
      </nav>

      <section style={styles.workspace}>
        <aside style={styles.sidebar}>
          <span style={styles.eyebrow}>SYSTEM MAP</span>
          <h2 style={styles.h2}>المكوّنات</h2>
          <div style={styles.componentList}>
            {ENGINE_DEMO.overview.components.map((component) => (
              <button
                key={component.id}
                style={{
                  ...styles.componentButton,
                  ...(selectedComponent === component.id ? styles.componentButtonActive : {}),
                }}
                onClick={() => setSelectedComponent(component.id)}
              >
                <span>{component.label}</span>
                <small>{STATUS_LABEL[component.status]}</small>
              </button>
            ))}
          </div>
        </aside>

        <div style={styles.stage}>
          <div style={styles.stageTop}>
            <div>
              <span style={styles.eyebrow}>{mode.toUpperCase()} MODE</span>
              <h2 style={styles.h2}>{ENGINE_DEMO.overview.objective}</h2>
            </div>
            <span style={styles.truthBadge}>FACT / INFERENCE / UNKNOWN</span>
          </div>

          {mode === "understand" && (
            <div>
              <div style={styles.flow}>
                {ENGINE_DEMO.overview.flow.map((item, index) => (
                  <div key={item} style={styles.flowItem}>
                    <span>{index + 1}</span>
                    <b>{item}</b>
                    {index < ENGINE_DEMO.overview.flow.length - 1 && <em>→</em>}
                  </div>
                ))}
              </div>
              <div style={styles.detailCard}>
                <small>المكوّن المحدد</small>
                <h3>{selected?.label}</h3>
                <p>{selected?.role}</p>
                <span style={styles.factPill}>{STATUS_LABEL[selected?.status]}</span>
              </div>
            </div>
          )}

          {mode === "troubleshoot" && (
            <div>
              <div style={styles.faultHeader}>
                <div>
                  <small>العَرَض</small>
                  <h3>{ENGINE_DEMO.fault.symptom}</h3>
                  <p>{ENGINE_DEMO.fault.principle}</p>
                </div>
                <b>{faultStep + 1} / {ENGINE_DEMO.fault.steps.length}</b>
              </div>

              <article style={styles.diagnosticCard}>
                <div style={styles.diagnosticMeta}>
                  <span>الخطوة {faultStep + 1}</span>
                  <span style={styles.knowledgePill}>{STATUS_LABEL[currentFaultStep.knowledge]}</span>
                </div>
                <h3>{currentFaultStep.title}</h3>
                <p><b>افحص:</b> {currentFaultStep.check}</p>
                <p><b>لماذا:</b> {currentFaultStep.why}</p>
                <p><b>ما الذي نستنتجه:</b> {currentFaultStep.outcome}</p>
              </article>

              <div style={styles.controls}>
                <button
                  style={styles.secondaryButton}
                  disabled={faultStep === 0}
                  onClick={() => setFaultStep((value) => Math.max(0, value - 1))}
                >
                  السابق
                </button>
                <button
                  style={styles.primaryButton}
                  onClick={() =>
                    setFaultStep((value) =>
                      Math.min(ENGINE_DEMO.fault.steps.length - 1, value + 1)
                    )
                  }
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {mode === "train" && (
            <div style={styles.trainingGrid}>
              {ENGINE_DEMO.training.steps.map((step, index) => (
                <article key={step} style={styles.trainingCard}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={styles.pilot}>
        <div>
          <span style={styles.eyebrow}>NEXT COMMERCIAL STEP</span>
          <h2 style={styles.h2}>حوّل معدّتك أنت إلى تجربة تدريب وتشخيص.</h2>
          <p>هذه الصفحة تثبت الـProduct Flow. المرحلة التالية تربط نفس الهيكل بالـRuntime والمشهد الفعلي للمعدة.</p>
        </div>
        <button style={styles.primaryButton}>Request a company pilot</button>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#081016",
    color: "#eef6f8",
    padding: "32px",
    fontFamily: "Arial, sans-serif",
    direction: "rtl",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.5fr .8fr",
    gap: "24px",
    maxWidth: "1180px",
    margin: "0 auto 24px",
    alignItems: "stretch",
  },
  eyebrow: { fontSize: "12px", letterSpacing: "1.5px", color: "#8bc7c0" },
  h1: { fontSize: "48px", lineHeight: 1.05, margin: "12px 0", maxWidth: "760px" },
  h2: { fontSize: "26px", margin: "8px 0 0" },
  lead: { fontSize: "18px", lineHeight: 1.8, color: "#b7c7ce", maxWidth: "760px" },
  heroCard: {
    background: "#0e1a22",
    border: "1px solid #1f333d",
    borderRadius: "22px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sciencePanel: {
    maxWidth: "1180px",
    margin: "0 auto 20px",
    padding: "22px",
    border: "1px solid #335d59",
    background: "#0b1b1b",
    borderRadius: "18px",
  },
  gateGrid: {
    marginTop: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "10px",
  },
  gateItem: { background: "#102625", padding: "12px", borderRadius: "12px", color: "#cce8e4" },
  modeBar: {
    maxWidth: "1180px",
    margin: "0 auto 20px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  modeButton: {
    textAlign: "right",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid #243741",
    background: "#0d171e",
    color: "#dce9ed",
    cursor: "pointer",
  },
  modeButtonActive: { borderColor: "#6cc8bd", background: "#112622" },
  workspace: {
    maxWidth: "1180px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "290px 1fr",
    gap: "18px",
  },
  sidebar: {
    background: "#0d171e",
    border: "1px solid #1f313b",
    borderRadius: "20px",
    padding: "18px",
  },
  componentList: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" },
  componentButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #233844",
    background: "#0c141a",
    color: "#d7e6ea",
    cursor: "pointer",
  },
  componentButtonActive: { borderColor: "#70c9be", background: "#112520" },
  stage: {
    background: "#0c151b",
    border: "1px solid #1f313b",
    borderRadius: "20px",
    padding: "24px",
    minHeight: "520px",
  },
  stageTop: { display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "start" },
  truthBadge: {
    border: "1px solid #344a55",
    borderRadius: "999px",
    padding: "8px 12px",
    color: "#9bb2bb",
    fontSize: "12px",
  },
  flow: {
    marginTop: "34px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  flowItem: {
    display: "flex",
    gap: "9px",
    alignItems: "center",
    background: "#10212a",
    border: "1px solid #24414b",
    borderRadius: "999px",
    padding: "10px 14px",
  },
  detailCard: {
    marginTop: "30px",
    padding: "24px",
    borderRadius: "18px",
    background: "#101d24",
    border: "1px solid #213943",
  },
  factPill: { display: "inline-block", marginTop: "8px", color: "#7bd2c8", fontSize: "12px" },
  faultHeader: {
    marginTop: "28px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "start",
  },
  diagnosticCard: {
    marginTop: "18px",
    padding: "24px",
    background: "#111d24",
    border: "1px solid #31444d",
    borderRadius: "18px",
  },
  diagnosticMeta: { display: "flex", justifyContent: "space-between", gap: "12px" },
  knowledgePill: {
    fontSize: "12px",
    color: "#f0c878",
    border: "1px solid #6b5932",
    borderRadius: "999px",
    padding: "4px 9px",
  },
  controls: { marginTop: "18px", display: "flex", gap: "10px" },
  primaryButton: {
    background: "#d7f06e",
    color: "#132016",
    border: 0,
    borderRadius: "12px",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#14232c",
    color: "#d9e8ec",
    border: "1px solid #2c414c",
    borderRadius: "12px",
    padding: "12px 18px",
    cursor: "pointer",
  },
  trainingGrid: {
    marginTop: "28px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  trainingCard: {
    padding: "18px",
    borderRadius: "16px",
    background: "#111e25",
    border: "1px solid #263b45",
  },
  pilot: {
    maxWidth: "1180px",
    margin: "22px auto 0",
    padding: "24px",
    background: "#0f1d1a",
    border: "1px solid #2f554e",
    borderRadius: "20px",
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "center",
  },
};
