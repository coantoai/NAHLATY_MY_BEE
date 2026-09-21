"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./page.module.css";

const STEPS=[
  {
    eyebrow:"01 · الانجذاب",
    title:"الزهرة تجذب النحلة",
    body:"الرائحة واللون والرحيق يوجّهون النحلة نحو الزهرة. الحركة هنا خفيفة لأن المهم هو اتجاه الانتباه.",
    fact:"حقيقة",
    cue:"راقب مسار النحلة نحو الزهرة"
  },
  {
    eyebrow:"02 · التلامس",
    title:"حبوب اللقاح تلتصق بجسمها",
    body:"عندما تلامس النحلة المتك والأسدية، تنتقل حبوب اللقاح إلى الشعيرات على جسمها.",
    fact:"حقيقة",
    cue:"اضغط على الزهرة أو انتقل للخطوة التالية"
  },
  {
    eyebrow:"03 · النقل",
    title:"النحلة تحمل اللقاح معها",
    body:"أثناء الطيران تبقى حبوب اللقاح عالقة، وبعضها ينتقل مع النحلة إلى زهرة أخرى.",
    fact:"حقيقة",
    cue:"حرّك المؤشر لترى العمق يتبدّل"
  },
  {
    eyebrow:"04 · التلقيح",
    title:"اللقاح يصل إلى زهرة جديدة",
    body:"عندما تزور النحلة زهرة أخرى من النوع المناسب، يمكن أن تصل حبوب اللقاح إلى الميسم وتبدأ عملية التلقيح.",
    fact:"حقيقة",
    cue:"أعد المشهد أو انتقل بين المراحل"
  }
];

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function makeFlower(color=0xff6fa8,center=0xffcf5a,scale=1){
  const g=new THREE.Group();
  const stem=new THREE.Mesh(
    new THREE.CylinderGeometry(.11,.16,4.8,10),
    new THREE.MeshStandardMaterial({color:0x4f9b63,roughness:.82})
  );
  stem.position.y=-2.35;
  g.add(stem);

  const leafMat=new THREE.MeshStandardMaterial({color:0x56a86a,roughness:.72});
  const leaf=new THREE.Mesh(new THREE.SphereGeometry(.55,18,12),leafMat);
  leaf.scale.set(1.5,.34,.72);
  leaf.position.set(.5,-2.1,.12);
  leaf.rotation.z=.52;
  g.add(leaf);

  const petalMat=new THREE.MeshStandardMaterial({
    color,
    roughness:.46,
    metalness:.02,
    emissive:color,
    emissiveIntensity:.035
  });
  for(let i=0;i<9;i++){
    const p=new THREE.Mesh(new THREE.SphereGeometry(.72,22,14),petalMat);
    const a=i/9*Math.PI*2;
    p.position.set(Math.cos(a)*1.08,Math.sin(a)*1.08,Math.sin(a*2)*.12);
    p.scale.set(.92,1.42,.46);
    p.rotation.z=a-Math.PI/2;
    p.userData.phase=i*.55;
    g.add(p);
  }
  const disk=new THREE.Mesh(
    new THREE.SphereGeometry(.72,28,18),
    new THREE.MeshStandardMaterial({
      color:center,
      roughness:.38,
      emissive:center,
      emissiveIntensity:.13
    })
  );
  disk.scale.z=.52;
  disk.position.z=.18;
  g.add(disk);

  const stamenMat=new THREE.MeshStandardMaterial({color:0xffe890,roughness:.65});
  for(let i=0;i<11;i++){
    const a=i/11*Math.PI*2;
    const st=new THREE.Mesh(new THREE.SphereGeometry(.065,8,6),stamenMat);
    st.position.set(Math.cos(a)*.48,Math.sin(a)*.48,.7);
    g.add(st);
  }
  g.scale.setScalar(scale);
  g.userData.petals=g.children.filter(x=>x.userData?.phase!==undefined);
  return g;
}

function makeBee(){
  const bee=new THREE.Group();

  const bodyMat=new THREE.MeshStandardMaterial({
    color:0xf3b52d,
    roughness:.38,
    metalness:.05,
    emissive:0x4a2700,
    emissiveIntensity:.08
  });
  const darkMat=new THREE.MeshStandardMaterial({color:0x171412,roughness:.54});

  const abdomen=new THREE.Mesh(new THREE.SphereGeometry(1,28,20),bodyMat);
  abdomen.scale.set(1.5,.85,.9);
  bee.add(abdomen);

  for(let i=-1;i<=1;i++){
    const stripe=new THREE.Mesh(new THREE.TorusGeometry(.83,.08,8,40),darkMat);
    stripe.rotation.y=Math.PI/2;
    stripe.position.x=i*.38;
    stripe.scale.set(1,.88,1);
    bee.add(stripe);
  }

  const thorax=new THREE.Mesh(new THREE.SphereGeometry(.7,24,18),darkMat);
  thorax.position.x=-1.02;
  bee.add(thorax);

  const head=new THREE.Mesh(new THREE.SphereGeometry(.5,22,16),darkMat);
  head.position.x=-1.7;
  bee.add(head);

  const eyeMat=new THREE.MeshStandardMaterial({color:0x111111,roughness:.25,metalness:.35});
  for(const z of [-.34,.34]){
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.18,14,10),eyeMat);
    eye.position.set(-2.05,.13,z);
    bee.add(eye);
  }

  const wingMat=new THREE.MeshPhysicalMaterial({
    color:0xe9fbff,
    transparent:true,
    opacity:.38,
    roughness:.2,
    transmission:.22,
    side:THREE.DoubleSide,
    depthWrite:false
  });
  const wings=[];
  for(const side of [-1,1]){
    const w=new THREE.Mesh(new THREE.SphereGeometry(.95,24,14),wingMat);
    w.scale.set(1.35,.18,.7);
    w.position.set(-.55,.65,side*.68);
    w.rotation.x=side*.42;
    w.rotation.z=-.28;
    bee.add(w);
    wings.push(w);
  }

  const antennaMat=new THREE.MeshStandardMaterial({color:0x211b16,roughness:.72});
  for(const side of [-1,1]){
    const ant=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,.78,7),antennaMat);
    ant.position.set(-2.02,.45,side*.2);
    ant.rotation.z=.92;
    ant.rotation.x=side*.32;
    bee.add(ant);
  }

  bee.userData.wings=wings;
  bee.scale.setScalar(.9);
  return bee;
}

export default function VisualBenchmarkPage(){
  const hostRef=useRef(null);
  const stepRef=useRef(0);
  const [step,setStep]=useState(0);
  const [playing,setPlaying]=useState(true);

  useEffect(()=>{stepRef.current=step},[step]);

  useEffect(()=>{
    const host=hostRef.current;
    if(!host)return;

    let disposed=false;
    let raf=0;
    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x071018);
    scene.fog=new THREE.FogExp2(0x071018,.012);

    const camera=new THREE.PerspectiveCamera(42,1,.1,300);
    camera.position.set(0,8,26);

    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const hemi=new THREE.HemisphereLight(0xbde9ff,0x172318,1.45);
    const sun=new THREE.DirectionalLight(0xffe6bc,4.4);
    sun.position.set(-10,20,14);
    sun.castShadow=true;
    const rim=new THREE.PointLight(0x7ce8d0,45,60);
    rim.position.set(12,4,7);
    const warm=new THREE.PointLight(0xff9d5c,28,45);
    warm.position.set(-12,3,-2);
    scene.add(hemi,sun,rim,warm);

    const groundMat=new THREE.MeshStandardMaterial({color:0x163322,roughness:.9,metalness:0});
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(90,60,1,1),groundMat);
    ground.rotation.x=-Math.PI/2;
    ground.position.y=-4.8;
    ground.receiveShadow=true;
    scene.add(ground);

    const haze=new THREE.Mesh(
      new THREE.PlaneGeometry(70,30),
      new THREE.MeshBasicMaterial({color:0x2fa77d,transparent:true,opacity:.055,depthWrite:false})
    );
    haze.rotation.x=-Math.PI/2;
    haze.position.y=-4.72;
    scene.add(haze);

    const flowerA=makeFlower(0xff6f9d,0xffc84f,1.34);
    flowerA.position.set(-7.2,-.2,-1.5);
    flowerA.rotation.x=-.1;
    flowerA.rotation.y=.2;
    scene.add(flowerA);

    const flowerB=makeFlower(0x8e75ff,0xffd35b,1.08);
    flowerB.position.set(6.7,-.45,-.1);
    flowerB.rotation.y=-.3;
    scene.add(flowerB);

    const flowerC=makeFlower(0xffb760,0xffd85f,.74);
    flowerC.position.set(1,-1.6,-7.5);
    flowerC.rotation.y=.4;
    scene.add(flowerC);

    const bee=makeBee();
    bee.position.set(0,2.7,4.4);
    bee.rotation.y=Math.PI;
    scene.add(bee);

    const grass=[];
    const grassMat=new THREE.MeshStandardMaterial({color:0x39794b,roughness:.88});
    for(let i=0;i<95;i++){
      const blade=new THREE.Mesh(new THREE.ConeGeometry(.045,.95,5),grassMat);
      const gx=(i%19-9)*2.35 + Math.sin(i*2.1)*.7;
      const gz=(Math.floor(i/19)-2)*4.2 + Math.cos(i*1.9)*.8;
      blade.position.set(gx,-4.33,gz);
      blade.rotation.z=(Math.sin(i)*.14);
      blade.userData.phase=i*.37;
      scene.add(blade);
      grass.push(blade);
    }

    const pollen=[];
    const pollenMat=new THREE.MeshBasicMaterial({color:0xffd34e,transparent:true,opacity:.92});
    for(let i=0;i<40;i++){
      const p=new THREE.Mesh(new THREE.SphereGeometry(.055+(i%4)*.012,8,6),pollenMat);
      p.position.set(100,100,100);
      p.userData.phase=i/40*Math.PI*2;
      p.userData.radius=.55+(i%7)*.07;
      scene.add(p);
      pollen.push(p);
    }

    const trail=[];
    const trailMat=new THREE.MeshBasicMaterial({color:0xffd66e,transparent:true,opacity:.65,depthWrite:false});
    for(let i=0;i<22;i++){
      const p=new THREE.Mesh(new THREE.SphereGeometry(.045+(22-i)*.004,8,6),trailMat);
      scene.add(p);
      trail.push(p);
    }

    const bloom=[];
    const bloomMat=new THREE.MeshBasicMaterial({color:0xb5fff0,transparent:true,opacity:.28,depthWrite:false});
    for(let i=0;i<9;i++){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(1.2+i*.28,.02,6,64),bloomMat);
      ring.rotation.x=Math.PI/2;
      ring.position.copy(flowerB.position).add(new THREE.Vector3(0,0.2,0));
      ring.visible=false;
      scene.add(ring);
      bloom.push(ring);
    }

    const pointer={x:0,y:0};
    const onPointer=e=>{
      const r=host.getBoundingClientRect();
      pointer.x=((e.clientX-r.left)/Math.max(1,r.width)-.5)*2;
      pointer.y=((e.clientY-r.top)/Math.max(1,r.height)-.5)*2;
    };
    const onClick=e=>{
      if(e.target===renderer.domElement){
        setStep(v=>(v+1)%STEPS.length);
      }
    };
    host.addEventListener("pointermove",onPointer,{passive:true});
    host.addEventListener("click",onClick);

    const resize=()=>{
      const w=host.clientWidth||1,h=host.clientHeight||1;
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      camera.updateProjectionMatrix();
    };
    const ro=new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const pathA=new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,2.7,4.4),
      new THREE.Vector3(-2.4,3.2,2.3),
      new THREE.Vector3(-5.4,1.7,.2),
      new THREE.Vector3(-6.8,.45,-.8)
    ]);
    const pathB=new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6.8,.45,-.8),
      new THREE.Vector3(-2.8,3.6,-.1),
      new THREE.Vector3(2.8,3.2,.9),
      new THREE.Vector3(6.05,.75,.25)
    ]);

    const clock=new THREE.Clock();
    const beePos=new THREE.Vector3();
    const camTarget=new THREE.Vector3(0,0,0);
    const desiredCam=new THREE.Vector3();

    const animate=()=>{
      if(disposed)return;
      raf=requestAnimationFrame(animate);
      const t=clock.getElapsedTime();
      const s=stepRef.current;
      const isPlaying=playing;

      let u=0;
      if(s===0)u=.18+.18*(.5+.5*Math.sin(t*.55));
      if(s===1)u=.98;
      if(s===2)u=.15+.58*(.5+.5*Math.sin(t*.36));
      if(s===3)u=.98;

      if(s<=1){
        pathA.getPoint(clamp(u,0,1),beePos);
      }else{
        pathB.getPoint(clamp(u,0,1),beePos);
      }
      if(!isPlaying){
        if(s===0)pathA.getPoint(.32,beePos);
        if(s===1)pathA.getPoint(.98,beePos);
        if(s===2)pathB.getPoint(.5,beePos);
        if(s===3)pathB.getPoint(.98,beePos);
      }
      bee.position.lerp(beePos,.055);
      bee.position.y+=Math.sin(t*3.1)*.035;
      bee.rotation.z=Math.sin(t*2.3)*.05;
      bee.rotation.y=s<=1?Math.PI*.98:.06;

      bee.userData.wings.forEach((w,i)=>{
        w.rotation.z=(-.28)+(i?1:-1)*Math.sin(t*25)*.52;
      });

      flowerA.rotation.z=Math.sin(t*.75)*.018;
      flowerB.rotation.z=Math.sin(t*.66+.7)*.02;
      flowerC.rotation.z=Math.sin(t*.58+1.2)*.017;
      for(const f of [flowerA,flowerB,flowerC]){
        f.userData.petals?.forEach((p,i)=>{
          p.rotation.y=Math.sin(t*.9+p.userData.phase)*.035;
        });
      }
      grass.forEach((g,i)=>{g.rotation.z=Math.sin(t*.78+g.userData.phase)*.06});

      const showPollen=s>=1;
      pollen.forEach((p,i)=>{
        p.visible=showPollen;
        if(!showPollen)return;
        const phase=p.userData.phase+t*(s===2?1.6:.85);
        const base=s===3?flowerB.position:bee.position;
        const r=p.userData.radius*(s===3?1.7:1);
        p.position.set(
          base.x+Math.cos(phase)*r,
          base.y+.25+Math.sin(phase*1.4)*r*.55,
          base.z+Math.sin(phase)*r*.72
        );
        p.material.opacity=s===3?.35+.55*(.5+.5*Math.sin(t*2+i)):.7;
      });

      const activePath=s<=1?pathA:pathB;
      trail.forEach((p,i)=>{
        const behind=clamp((s<=1?u:u)-i*.026,0,1);
        const tp=activePath.getPoint(behind);
        p.position.copy(tp);
        p.material.opacity=Math.max(0,.68-i*.025);
      });

      bloom.forEach((r,i)=>{
        r.visible=s===3;
        if(s===3){
          const pulse=(t*.28+i*.065)%1;
          r.scale.setScalar(.7+pulse*.72);
          r.material.opacity=(1-pulse)*.23;
        }
      });

      const focus=s===0?new THREE.Vector3(-2.1,.8,0):s===1?flowerA.position.clone().add(new THREE.Vector3(0,.8,0)):s===2?bee.position.clone():flowerB.position.clone().add(new THREE.Vector3(0,.7,0));
      camTarget.lerp(focus,.035);
      const base=s===1?new THREE.Vector3(-1.3,6.4,19):s===3?new THREE.Vector3(2.8,7.5,20):new THREE.Vector3(0,7.2,25);
      desiredCam.copy(base);
      desiredCam.x+=pointer.x*1.5;
      desiredCam.y+=pointer.y*.7;
      camera.position.lerp(desiredCam,.025);
      camera.lookAt(camTarget);

      warm.intensity=26+Math.sin(t*.7)*3;
      rim.intensity=42+Math.sin(t*.62+1.1)*5;

      renderer.render(scene,camera);
    };
    animate();

    return()=>{
      disposed=true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove",onPointer);
      host.removeEventListener("click",onClick);
      scene.traverse(obj=>{
        obj.geometry?.dispose?.();
        if(obj.material){
          const mats=Array.isArray(obj.material)?obj.material:[obj.material];
          mats.forEach(m=>m.dispose?.());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  },[playing]);

  const current=STEPS[step];
  return (
    <main className={styles.page}>
      <section className={styles.stageShell}>
        <div className={styles.canvas} ref={hostRef} aria-label="مشهد ثلاثي الأبعاد يشرح كيف تنقل النحلة حبوب اللقاح"/>
        <div className={styles.vignette}/>
        <div className={styles.topbar}>
          <div className={styles.brand}><span>✦</span><b>نحلتي</b><small>VISUAL BENCHMARK</small></div>
          <div className={styles.status}><i/> مشهد حيّ · 3D + motion</div>
        </div>

        <aside className={styles.story}>
          <div className={styles.eyebrow}>{current.eyebrow}</div>
          <h1>{current.title}</h1>
          <p>{current.body}</p>
          <div className={styles.factLine}>
            <span className={styles.factDot}>●</span>
            <b>{current.fact}</b>
            <em>من المحتوى العلمي المباشر</em>
          </div>
          <div className={styles.hint}>{current.cue}</div>
        </aside>

        <div className={styles.depthHint}>
          <span>حرّك المؤشر</span>
          <i>↔</i>
          <small>المشهد يستجيب للانتباه</small>
        </div>

        <nav className={styles.timeline} aria-label="مراحل التلقيح">
          {STEPS.map((item,i)=>(
            <button
              key={item.title}
              className={i===step?styles.active:i<step?styles.done:""}
              onClick={()=>setStep(i)}
            >
              <span>{String(i+1).padStart(2,"0")}</span>
              <b>{item.title}</b>
            </button>
          ))}
        </nav>

        <button className={styles.play} onClick={()=>setPlaying(v=>!v)} aria-label={playing?"إيقاف الحركة":"تشغيل الحركة"}>
          {playing?"❚❚":"▶"}
        </button>

        <div className={styles.legend}>
          <span><i className={styles.factSwatch}/>حقيقة</span>
          <span><i className={styles.motionSwatch}/>الحركة تخدم المعنى</span>
          <span><i className={styles.quietSwatch}/>السكون مقصود</span>
        </div>
      </section>
    </main>
  );
}
