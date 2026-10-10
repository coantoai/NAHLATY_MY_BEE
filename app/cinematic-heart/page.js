"use client";
import {useEffect,useRef,useState} from "react";
import * as THREE from "three";
import styles from "./heart.module.css";

const PHASES=[
 {key:"fill",label:"الامتلاء",note:"يرتخي القلب ويمتلئ البطينان بالدم.",av:true,out:false},
 {key:"atria",label:"انقباض الأذينين",note:"يدفع الأذينان الكمية الأخيرة إلى البطينين.",av:true,out:false},
 {key:"vent",label:"انقباض البطينين",note:"تغلق الصمامات الأذينية البطينية ويرتفع الضغط.",av:false,out:false},
 {key:"eject",label:"القذف",note:"تفتح الصمامات الهلالية ويُدفع الدم نحو الرئتين والجسم.",av:false,out:true}
];

function HeartWorld({phase,blocked,playing,onPart}){
 const host=useRef(null), state=useRef({phase,blocked,playing});
 useEffect(()=>{state.current={phase,blocked,playing}},[phase,blocked,playing]);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const scene=new THREE.Scene(); scene.fog=new THREE.FogExp2(0x05070b,.018);
  const camera=new THREE.PerspectiveCamera(38,1,.1,200);camera.position.set(0,1.2,31);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;el.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xffd7c7,1.5));
  const key=new THREE.PointLight(0xff735f,70,60,2);key.position.set(-8,9,14);scene.add(key);
  const rim=new THREE.PointLight(0x5aa8ff,50,55,2);rim.position.set(10,3,-8);scene.add(rim);
  const heart=new THREE.Group();scene.add(heart);
  const tissue=new THREE.MeshPhysicalMaterial({color:0xa82e37,roughness:.48,clearcoat:.25,sheen:.5,sheenColor:new THREE.Color(0xff776a),emissive:0x250406,emissiveIntensity:.35});
  const chamberMat=(c)=>new THREE.MeshPhysicalMaterial({color:c,roughness:.32,clearcoat:.35,transparent:true,opacity:.9,emissive:c,emissiveIntensity:.13});
  const l=new THREE.Mesh(new THREE.SphereGeometry(4.1,48,32),tissue);l.position.set(-2,1,0);l.scale.set(.95,1.08,.78);
  const r=l.clone();r.material=tissue.clone();r.position.x=2;
  const apex=new THREE.Mesh(new THREE.ConeGeometry(4.9,8.2,48),tissue.clone());apex.position.set(0,-3.2,.1);apex.rotation.z=Math.PI;
  heart.add(l,r,apex);
  const chambers=[
   ["الأذين الأيمن",-2.05,2.1,2.9,0x397bc5],["البطين الأيمن",-2.1,-1.25,3.1,0x397bc5],
   ["الأذين الأيسر",2.05,2.1,2.9,0xe14d4b],["البطين الأيسر",2.1,-1.25,3.1,0xe14d4b]
  ];
  const chamberMeshes=[];
  chambers.forEach(([name,x,y,z,c])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1.45,28,20),chamberMat(c));m.position.set(x,y,z);m.scale.set(1,1.15,.42);m.userData.name=name;heart.add(m);chamberMeshes.push(m)});
  const tube=(pts,color,rad=.34)=>new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),64,rad,12,false),new THREE.MeshPhysicalMaterial({color,roughness:.3,clearcoat:.5,emissive:color,emissiveIntensity:.1}));
  heart.add(tube([[-2,3,1],[-4,5,1],[-4,8,0]],0x3f86d9,.48));
  heart.add(tube([[2,-1,1],[3,3,1],[4,7,0],[6,8,-1]],0xe95550,.52));
  heart.add(tube([[-1,-1,1],[-2,3,1],[-6,5,0]],0x3f86d9,.43));
  const coronary=tube([[.1,3.4,4],[2.2,2.1,4.15],[2.9,-.5,3.7],[1.2,-4,2.6]],0xff5b4f,.16);heart.add(coronary);
  const valves=[];
  [["AV",-2,.45,4],["AV",2,.45,4],["OUT",-1.3,2.8,3.7],["OUT",1.3,2.8,3.7]].forEach(([kind,x,y,z])=>{const m=new THREE.Mesh(new THREE.TorusGeometry(.55,.1,10,28),new THREE.MeshBasicMaterial({color:0xffd4a5,transparent:true,opacity:.9}));m.position.set(x,y,z);m.rotation.x=Math.PI/2;m.userData.kind=kind;heart.add(m);valves.push(m)});
  const particles=[];
  for(let i=0;i<28;i++){const oxy=i>=14;const m=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),new THREE.MeshBasicMaterial({color:oxy?0xff7b6f:0x65b9ff,transparent:true,opacity:.85}));m.userData={p:(i%14)/14,oxy};heart.add(m);particles.push(m)}
  const dustGeo=new THREE.BufferGeometry(),arr=new Float32Array(300);for(let i=0;i<300;i++)arr[i]=(Math.random()-.5)*32;dustGeo.setAttribute("position",new THREE.BufferAttribute(arr,3));scene.add(new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xffb58d,size:.07,transparent:true,opacity:.22})));
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
  const click=e=>{const b=renderer.domElement.getBoundingClientRect();mouse.x=((e.clientX-b.left)/b.width)*2-1;mouse.y=-((e.clientY-b.top)/b.height)*2+1;ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(chamberMeshes)[0];if(hit)onPart?.(hit.object.userData.name)};
  renderer.domElement.addEventListener("pointerdown",click);
  const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};resize();addEventListener("resize",resize);
  let raf;const clock=new THREE.Clock();
  const animate=()=>{raf=requestAnimationFrame(animate);const t=clock.getElapsedTime(),s=state.current;const idx=PHASES.findIndex(x=>x.key===s.phase);const beat=s.playing?(Math.exp(-Math.pow(((t*.82)%1)-.18,2)/.006)*.075+Math.exp(-Math.pow(((t*.82)%1)-.34,2)/.012)*.035):0;heart.scale.set(1-beat,1-beat*.7,1-beat);
   heart.rotation.y=Math.sin(t*.25)*.09;
   valves.forEach(v=>{const open=v.userData.kind==="AV"?PHASES[idx].av:PHASES[idx].out;v.scale.y+=( (open?1:.12)-v.scale.y)*.12;v.material.opacity=open?1:.32});
   particles.forEach((p,i)=>{let q=(p.userData.p+(s.playing?t*.11:0))%1;if(p.userData.oxy){p.position.set(2+Math.sin(q*Math.PI*2)*1.1,-2.3+q*6,3.8+Math.cos(q*Math.PI*2)*.25)}else{p.position.set(-2+Math.sin(q*Math.PI*2)*1.1,3.5-q*6,3.8+Math.cos(q*Math.PI*2)*.25)}p.material.opacity=s.blocked&&p.userData.oxy&&q>.55?.18:.82});
   coronary.material.emissiveIntensity=s.blocked?.02:.28;coronary.material.opacity=s.blocked?.42:1;renderer.render(scene,camera)};
  animate();
  return()=>{cancelAnimationFrame(raf);removeEventListener("resize",resize);renderer.domElement.removeEventListener("pointerdown",click);renderer.dispose();el.replaceChildren()}
 },[onPart]);
 return <div ref={host} className={styles.world}/>;
}

export default function CinematicHeart(){
 const [idx,setIdx]=useState(0),[playing,setPlaying]=useState(true),[blocked,setBlocked]=useState(false),[part,setPart]=useState("");
 useEffect(()=>{if(!playing)return;const id=setInterval(()=>setIdx(v=>(v+1)%PHASES.length),2200);return()=>clearInterval(id)},[playing]);
 const p=PHASES[idx];
 return <main className={styles.page} dir="rtl">
  <header className={styles.top}><div><small>نحلتي · تجربة فهم بصري</small><h1>كيف يعمل القلب؟</h1></div><div className={styles.live}>● مشهد حي</div></header>
  <section className={styles.stage}>
   <HeartWorld phase={p.key} blocked={blocked} playing={playing} onPart={setPart}/>
   <div className={styles.phase}><span>0{idx+1}</span><b>{p.label}</b><p>{blocked?"تضيّق الشريان التاجي يقلّل وصول الدم إلى عضلة القلب — تبسيط تعليمي.":p.note}</p></div>
   {part&&<button className={styles.part} onClick={()=>setPart("")}>{part}<small>اضغط لإغلاق</small></button>}
   <div className={styles.legend}><i className={styles.blue}/> دم أقل أكسجة <i className={styles.red}/> دم غني بالأكسجين</div>
  </section>
  <nav className={styles.controls}>
   <button onClick={()=>setPlaying(v=>!v)}>{playing?"إيقاف":"تشغيل"}</button>
   <button onClick={()=>{setPlaying(false);setIdx(v=>(v+1)%4)}}>المرحلة التالية</button>
   <button className={blocked?styles.danger:""} onClick={()=>setBlocked(v=>!v)}>{blocked?"العودة للوضع الطبيعي":"ماذا لو انسد شريان؟"}</button>
  </nav>
  <section className={styles.steps}>{PHASES.map((x,i)=><button key={x.key} className={i===idx?styles.active:""} onClick={()=>{setIdx(i);setPlaying(false)}}><span>0{i+1}</span><b>{x.label}</b></button>)}</section>
  <footer>الأحمر والأزرق ترميز تعليمي لحالة الأكسجة، وليس اللون الحرفي للدم.</footer>
 </main>
}