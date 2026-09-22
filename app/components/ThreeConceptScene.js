"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function geometryFor(visual){
 if(visual==="heart") return new THREE.SphereGeometry(5,48,36);
 if(visual==="brain") return new THREE.IcosahedronGeometry(5,2);
 if(["cell","planet","blood"].includes(visual)) return new THREE.SphereGeometry(5,28,20);
 if(visual==="lung") return new THREE.SphereGeometry(4.7,24,18);
 if(visual==="road") return new THREE.BoxGeometry(12,1.1,4.2);
 if(visual==="stream") return new THREE.TorusGeometry(5,1,14,42);
 if(visual==="cloud") return new THREE.IcosahedronGeometry(5.2,2);
 if(["database","stack"].includes(visual)) return new THREE.CylinderGeometry(5,5,7,28);
 if(["volcano","fire"].includes(visual)) return new THREE.ConeGeometry(5.5,9,24);
 if(["portal","signal"].includes(visual)) return new THREE.TorusGeometry(5,1.2,18,40);
 if(["plant","water"].includes(visual)) return new THREE.IcosahedronGeometry(5,1);
 if(["gear"].includes(visual)) return new THREE.TorusKnotGeometry(3.4,1.15,70,12);
 return new THREE.BoxGeometry(9,7,7);
}

function makeDepthLabel(text,color=0xffe7a1){
 const canvas=document.createElement("canvas");
 canvas.width=420; canvas.height=96;
 const ctx=canvas.getContext("2d");
 if(!ctx) return null;
 ctx.clearRect(0,0,420,96);
 ctx.fillStyle="rgba(7,10,14,.82)";
 ctx.roundRect?.(8,10,404,76,22);
 ctx.fill();
 ctx.strokeStyle="rgba(255,231,161,.35)";
 ctx.lineWidth=2;
 ctx.stroke();
 ctx.fillStyle="#fff5d8";
 ctx.font="600 28px system-ui, sans-serif";
 ctx.textAlign="center";
 ctx.textBaseline="middle";
 ctx.fillText(String(text||"").slice(0,24),210,49,360);
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,opacity:0});
 const sprite=new THREE.Sprite(material);
 sprite.scale.set(13,3.1,1);
 sprite.position.set(0,3.15,1.2);
 sprite.userData.depthLabel=true;
 return sprite;
}

function nodeColor(visual,index){
 const v=String(visual||"").toLowerCase();
 if(["data","document","database","server","signal"].includes(v)) return 0x78a9ff;
 if(["heart","brain","blood","cell","lung","person"].includes(v)) return 0xf59a7d;
 if(["plant","water"].includes(v)) return 0x8fcf9d;
 if(["fire","volcano","factory","truck","gear"].includes(v)) return 0xf0b84e;
 if(["portal","planet"].includes(v)) return 0xb9a7ff;
 const honey=[0xf2c45c,0xffd977,0xd9aa48];
 return honey[index%honey.length];
}

function knowledgeTone(kind){
 if(kind==="fact") return 0x73d7a7;
 if(kind==="unknown") return 0x98a2ad;
 return 0xf1c76b;
}

const CAUSAL_RELATIONS_3D=new Set(["cause","causes","flow","activate","trigger","transform","increase","decrease","inhibit","block","lead","leads-to"]);
function isCausalEdge3D(edge){
 return Boolean(edge?.causal||CAUSAL_RELATIONS_3D.has(String(edge?.relation||"").toLowerCase()));
}

function decorateSemanticMesh(mesh,visual,color){
 const v=String(visual||"").toLowerCase();
 const soft=(opacity=.72,emissive=.16)=>new THREE.MeshPhysicalMaterial({color,roughness:.46,metalness:.02,emissive:color,emissiveIntensity:emissive,transparent:true,opacity,clearcoat:.32,clearcoatRoughness:.48,sheen:.34,sheenColor:new THREE.Color(color)});
 const glow=(opacity=.34)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false});
 if(v==="heart"){
  mesh.material.opacity=.16;
  mesh.material.roughness=.5;
  mesh.material.metalness=.01;
  const lobeGeometry=new THREE.SphereGeometry(2.75,36,26);
  const left=new THREE.Mesh(lobeGeometry,soft(.84,.22)); left.position.set(-1.65,1.15,.2); left.scale.set(1,.9,.85);
  const right=new THREE.Mesh(lobeGeometry.clone(),soft(.84,.22)); right.position.set(1.65,1.15,.2); right.scale.set(1,.9,.85);
  const lower=new THREE.Mesh(new THREE.ConeGeometry(3.5,6.2,28),soft(.8,.18)); lower.position.set(0,-2.25,.15); lower.rotation.z=Math.PI;
  const aura=new THREE.Mesh(new THREE.TorusGeometry(6.6,.1,10,72),glow(.12)); aura.rotation.x=Math.PI/2; aura.userData.semanticAura=true;
  const apexGlow=new THREE.PointLight(0xff8b72,5.5,28,2); apexGlow.position.set(0,-2.8,4.2);
  const coronaryMat=new THREE.MeshPhysicalMaterial({color:0xd95449,roughness:.32,clearcoat:.55,emissive:0x5b0907,emissiveIntensity:.18});
  const coronaryCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.2,2.6,2.55),new THREE.Vector3(1.9,1.25,2.85),new THREE.Vector3(2.35,-1.1,2.45),new THREE.Vector3(.8,-3.5,1.65)]);
  const coronary=new THREE.Mesh(new THREE.TubeGeometry(coronaryCurve,48,.12,10,false),coronaryMat);
  coronary.userData.semanticAura=true;
  mesh.add(left,right,lower,aura,coronary,apexGlow);
 }else if(v==="lung"){
  mesh.material.opacity=.14;
  const lobeGeometry=new THREE.SphereGeometry(3.4,24,18);
  const left=new THREE.Mesh(lobeGeometry,soft(.7,.12)); left.position.set(-2.25,-.2,0); left.scale.set(.72,1.16,.62);
  const right=new THREE.Mesh(lobeGeometry.clone(),soft(.7,.12)); right.position.set(2.25,-.2,0); right.scale.set(.72,1.16,.62);
  const trachea=new THREE.Mesh(new THREE.CylinderGeometry(.55,.72,6.2,16),soft(.82,.08)); trachea.position.set(0,3.5,.2);
  const bronchusL=new THREE.Mesh(new THREE.CylinderGeometry(.28,.42,3.4,12),soft(.74,.08)); bronchusL.position.set(-1.15,1.15,.2); bronchusL.rotation.z=-.72;
  const bronchusR=bronchusL.clone(); bronchusR.material=soft(.74,.08); bronchusR.position.x=1.15; bronchusR.rotation.z=.72;
  mesh.add(left,right,trachea,bronchusL,bronchusR);
 }else if(v==="brain"){
  for(let j=0;j<3;j++){
   const ring=new THREE.Mesh(new THREE.TorusGeometry(3.7-j*.45,.16,8,42),glow(.2-j*.035));
   ring.rotation.set(Math.PI/2+j*.28,j*.55,j*.4); ring.userData.semanticAura=true; mesh.add(ring);
  }
 }else if(v==="plant"){
  mesh.material.opacity=.18;
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.38,.52,7.2,14),soft(.82,.1)); stem.position.y=.2;
  const leafGeometry=new THREE.SphereGeometry(1.8,18,12);
  const leafL=new THREE.Mesh(leafGeometry,soft(.76,.12)); leafL.position.set(-1.7,1.2,.1); leafL.scale.set(1.4,.42,.7); leafL.rotation.z=.55;
  const leafR=new THREE.Mesh(leafGeometry.clone(),soft(.76,.12)); leafR.position.set(1.7,2.3,.1); leafR.scale.set(1.4,.42,.7); leafR.rotation.z=-.55;
  mesh.add(stem,leafL,leafR);
 }else if(v==="database"||v==="stack"){
  for(let j=-1;j<=1;j++){
   const ring=new THREE.Mesh(new THREE.TorusGeometry(4.6,.2,8,40),glow(.24));
   ring.rotation.x=Math.PI/2; ring.position.y=j*2.45; ring.userData.semanticAura=true; mesh.add(ring);
  }
 }else if(v==="cell"){
  mesh.material.opacity=.2;
  const membrane=new THREE.Mesh(new THREE.SphereGeometry(5.25,24,18),glow(.12));
  const nucleus=new THREE.Mesh(new THREE.SphereGeometry(1.65,18,14),soft(.86,.18)); nucleus.position.set(.65,.35,.8);
  const organelleGeometry=new THREE.SphereGeometry(.55,12,8);
  for(let j=0;j<5;j++){
   const organelle=new THREE.Mesh(organelleGeometry,soft(.58,.08));
   const angle=j/5*Math.PI*2; organelle.position.set(Math.cos(angle)*3.1,Math.sin(angle*1.3)*2.1,Math.sin(angle)*1.3);
   mesh.add(organelle);
  }
  mesh.add(membrane,nucleus);
 }else if(v==="gear"){
  mesh.material.opacity=.34;
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.7,2.2,18),soft(.82,.12)); hub.rotation.x=Math.PI/2;
  for(let j=0;j<10;j++){
   const tooth=new THREE.Mesh(new THREE.BoxGeometry(1.15,1.8,1.4),soft(.72,.09));
   const angle=j/10*Math.PI*2; tooth.position.set(Math.cos(angle)*4.7,Math.sin(angle)*4.7,0); tooth.rotation.z=angle;
   mesh.add(tooth);
  }
  mesh.add(hub);
 }else if(v==="server"){
  mesh.material.opacity=.2;
  for(let j=-1;j<=1;j++){
   const tray=new THREE.Mesh(new THREE.BoxGeometry(7.2,1.35,5.2),soft(.7,.08)); tray.position.y=j*2.15;
   for(let k=0;k<3;k++){
    const led=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),glow(.7)); led.position.set(-2.6+k*.55,j*2.15,2.7); mesh.add(led);
   }
   mesh.add(tray);
  }
 }else if(v==="planet"){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(6.2,.16,10,64),glow(.26)); ring.rotation.set(Math.PI/2.55,.25,.35); ring.userData.semanticAura=true;
  const moon=new THREE.Mesh(new THREE.SphereGeometry(.8,12,8),soft(.78,.1)); moon.position.set(6.1,1.5,0); moon.userData.semanticAura=true;
  mesh.add(ring,moon);
 }else if(v==="fire"||v==="volcano"){
  const core=new THREE.Mesh(new THREE.ConeGeometry(2.6,6.6,22),new THREE.MeshStandardMaterial({color:0xff7b32,roughness:.32,emissive:0xff4318,emissiveIntensity:.55,transparent:true,opacity:.78}));
  core.position.y=.8; core.scale.set(.7,1,.7);
  const ember=new THREE.Mesh(new THREE.SphereGeometry(1.4,14,10),new THREE.MeshBasicMaterial({color:0xffd66b,transparent:true,opacity:.48,depthWrite:false}));
  ember.position.y=-1.6; ember.userData.semanticAura=true;
  mesh.add(core,ember);
 }
}


export default function ThreeConceptScene({nodes=[],edges=[],focusIds=[],visibleNodeIds=[],backgroundNodeIds=[],activeEdgeIds=[],nodeActions=[],cameraPlan={},renderProfile={},playing=false,onSelect}){
 const hostRef=useRef(null); const selectRef=useRef(onSelect); const playingRef=useRef(playing); const [failed,setFailed]=useState(false);
 useEffect(()=>{selectRef.current=onSelect},[onSelect]);
 useEffect(()=>{playingRef.current=playing},[playing]);
 useEffect(()=>{
  const host=hostRef.current;
  if(!host||!nodes.length) return;
  let frame=0,disposed=false;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(48,1,.1,1000);
  camera.position.set(0,8,115);
  const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||false;
  const lowPower=(navigator.hardwareConcurrency||8)<=4;
  const motionScale=renderProfile?.motionLevel==="calm"?.62:renderProfile?.motionLevel==="precise"?.82:1;
  const labelMode=renderProfile?.labelMode||"contextual";
  const guided=Boolean(renderProfile?.guided);
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:!lowPower,alpha:true,powerPreference:lowPower?"low-power":"high-performance"});}catch(err){setFailed(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,lowPower?1.25:2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.08;
  host.appendChild(renderer.domElement);

  const ambient=new THREE.AmbientLight(0xfff6df,1.18);
  const key=new THREE.DirectionalLight(0xffe6ad,2.3);
  key.position.set(30,35,60);
  const fill=new THREE.PointLight(0x78a9ff,22,180);
  fill.position.set(-30,-12,45);
  const rim=new THREE.DirectionalLight(0xff765f,2.4); rim.position.set(-24,18,-30);
  const warm=new THREE.PointLight(0xffb07c,16,120,2); warm.position.set(18,-18,34);
  scene.fog=new THREE.FogExp2(0x090b10,.0065);
  scene.add(ambient,key,fill,rim,warm);

  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;
  controls.enablePan=false;
  controls.minDistance=55;
  controls.maxDistance=190;

  const group=new THREE.Group();
  scene.add(group);
  // Cinematic depth field: restrained dust motes give scale without distracting from meaning.
  const dustCount=lowPower?90:180;
  const dustGeo=new THREE.BufferGeometry();
  const dustPos=new Float32Array(dustCount*3);
  for(let d=0;d<dustCount;d++){dustPos[d*3]=(Math.random()-.5)*150;dustPos[d*3+1]=(Math.random()-.5)*95;dustPos[d*3+2]=(Math.random()-.5)*110;}
  dustGeo.setAttribute("position",new THREE.BufferAttribute(dustPos,3));
  const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xffd9b5,size:.18,transparent:true,opacity:.16,depthWrite:false}));
  scene.add(dust);
  const positions=new Map();
  const meshes=[];
  const labels=[];
  const edgeCurves=new Map();
  const travelers=[];
  const actionParticles=[];
  const heartFlowParticles=[];
  const heartValves=[];
  const edgeGlowTubes=[];
  const edgeArrows=[];
  const focusHalos=[];
  const actionMap=new Map((nodeActions||[]).map(a=>[a.id,a.action]));
  const primaryActiveEdge=edges.find(e=>activeEdgeIds.includes(e.id)&&isCausalEdge3D(e))||null;
  const causeNodeId=primaryActiveEdge?.from||"";
  const effectNodeId=primaryActiveEdge?.to||"";
  const outgoingActiveEdges=new Map();
  for(const e of edges){if(activeEdgeIds.includes(e.id)&&edgeCurves.has(e.id)) outgoingActiveEdges.set(e.from,edgeCurves.get(e.id));}

  nodes.forEach((n,i)=>{
   const pos=new THREE.Vector3((Number(n.x||50)-50)*1.05,(50-Number(n.y||50))*.72,Number(n.depth||0)*1.05);
   positions.set(n.id,pos);
   const geometry=geometryFor(n.visual);
   const color=nodeColor(n.visual,i);
   const visible=!visibleNodeIds.length||visibleNodeIds.includes(n.id);
   const background=backgroundNodeIds.includes(n.id);
   const material=new THREE.MeshStandardMaterial({
    color,
    roughness:.42,
    metalness:["server","database","gear","factory","truck"].includes(n.visual)?.45:.12,
    emissive:color,
    emissiveIntensity:focusIds.includes(n.id)?.32:(background?.015:.04),
    transparent:true,
    opacity:visible?(background?.2:.94):.12
   });
   const mesh=new THREE.Mesh(geometry,material);
   mesh.position.copy(pos);
   mesh.userData={nodeId:n.id,baseScale:1,baseVisualScale:new THREE.Vector3(1,1,1),action:actionMap.get(n.id)||"dim",phase:i*.7,visible:visible&&!background,basePosition:pos.clone(),baseColor:new THREE.Color(color)};
   if(n.visual==="heart"){
    mesh.scale.set(.9,1.12,.94);
    mesh.rotation.set(-.08,0,-.12);
    mesh.userData.cinematicHeart=true;
   }
   if(n.visual==="building"||n.visual==="server") mesh.scale.set(.9,1.12,.9);
   mesh.userData.baseVisualScale.copy(mesh.scale);
   decorateSemanticMesh(mesh,n.visual,color);
   if(n.visual==="heart"){
    // Four controllable valve cues. They remain visually subordinate until the heart is active.
    const valveGeo=new THREE.TorusGeometry(.62,.1,8,24);
    const valveMat=new THREE.MeshPhysicalMaterial({color:0xffd7b0,roughness:.34,clearcoat:.5,emissive:0x6a261f,emissiveIntensity:.12,transparent:true,opacity:.7});
    const valveSpecs=[
     {p:[-1.05,.65,2.85],kind:"av"},{p:[1.05,.72,2.85],kind:"av"},
     {p:[-.82,-.78,2.92],kind:"semilunar"},{p:[.9,-.72,2.92],kind:"semilunar"}
    ];
    valveSpecs.forEach((v,vi)=>{const valve=new THREE.Mesh(valveGeo,valveMat.clone());valve.position.set(...v.p);valve.rotation.x=Math.PI/2;valve.userData={heartOwner:mesh,phase:vi*.08,kind:v.kind};mesh.add(valve);heartValves.push(valve);});
   }
   if(n.visual==="heart"&&!reduced){
    // Local cardiac circulation cue: restrained dual-stream particles remain bound to the heart,
    // so the cinematic layer reinforces flow without inventing a separate mechanism.
    const flowMatA=new THREE.MeshBasicMaterial({color:0x66b8ff,transparent:true,opacity:.72,depthWrite:false});
    const flowMatB=new THREE.MeshBasicMaterial({color:0xff6b62,transparent:true,opacity:.76,depthWrite:false});
    const flowGeo=new THREE.SphereGeometry(.22,8,6);
    for(let hp=0;hp<18;hp++){
     const p=new THREE.Mesh(flowGeo,(hp<9?flowMatA:flowMatB).clone());
     p.userData={heartOwner:mesh,phase:(hp%9)/9,oxygenated:hp>=9};
     group.add(p); heartFlowParticles.push(p);
    }
   }
   if(focusIds.includes(n.id)){
    const focusHalo=new THREE.Mesh(new THREE.TorusGeometry(7.8,.14,8,56),new THREE.MeshBasicMaterial({color:knowledgeTone(n.knowledge),transparent:true,opacity:.34,depthWrite:false}));
    focusHalo.rotation.x=Math.PI/2; focusHalo.userData={focusHalo:true,phase:i*.6}; mesh.add(focusHalo); focusHalos.push(focusHalo);
   }
   if(n.id===causeNodeId||n.id===effectNodeId){
    const roleColor=n.id===causeNodeId?0xffd36d:0x78dfbf;
    const roleHalo=new THREE.Mesh(new THREE.TorusGeometry(n.id===causeNodeId?6.7:6.25,.09,8,48),new THREE.MeshBasicMaterial({color:roleColor,transparent:true,opacity:.3,depthWrite:false}));
    roleHalo.rotation.x=Math.PI/2;
    roleHalo.rotation.z=n.id===effectNodeId?Math.PI/4:0;
    mesh.add(roleHalo);
   }
   group.add(mesh);
   meshes.push(mesh);
   if(["flow","ignite","heat"].includes(mesh.userData.action)&&!reduced){
    const particleCount=mesh.userData.action==="flow"?5:8;
    for(let p=0;p<particleCount;p++){
     const particle=new THREE.Mesh(new THREE.SphereGeometry(mesh.userData.action==="flow"?.42:.34,8,6),new THREE.MeshBasicMaterial({color:mesh.userData.action==="flow"?0x9ed0ff:0xffb347,transparent:true,opacity:.78}));
     particle.userData={owner:mesh,phase:p/particleCount,kind:mesh.userData.action};
     group.add(particle); actionParticles.push(particle);
    }
   }

   const labelCanvas=document.createElement("canvas");
   const labelCtx=labelCanvas.getContext("2d");
   labelCanvas.width=512; labelCanvas.height=128;
   if(labelCtx){
    labelCtx.clearRect(0,0,512,128);
    labelCtx.fillStyle="rgba(16,22,26,.78)";
    labelCtx.roundRect?.(10,18,492,92,28);
    labelCtx.fill();
    labelCtx.fillStyle="#"+knowledgeTone(n.knowledge).toString(16).padStart(6,"0");
    labelCtx.beginPath();labelCtx.arc(474,64,8,0,Math.PI*2);labelCtx.fill();
    labelCtx.fillStyle="#fff7df";
    labelCtx.font="600 34px system-ui, sans-serif";
    labelCtx.textAlign="center";
    labelCtx.textBaseline="middle";
    const label=String(n.label||"").slice(0,26);
    labelCtx.fillText(label,256,64,455);
    const texture=new THREE.CanvasTexture(labelCanvas);
    texture.colorSpace=THREE.SRGBColorSpace;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,opacity:visible?(background?.32:.94):.08}));
    sprite.position.copy(pos).add(new THREE.Vector3(0,-9,3));
    const labelScale=labelMode==="always"?[20,5.2,1]:labelMode==="compact"?[15,3.6,1]:[18,4.5,1];
    sprite.scale.set(...labelScale);
    if(labelMode==="compact"&&!focusIds.includes(n.id)) sprite.material.opacity*=.68;
    sprite.userData={nodeId:n.id,labelSprite:true};
    group.add(sprite);
    labels.push(sprite);
   }

   if(n.spatial&&Array.isArray(n.depthParts)&&n.depthParts.length){
    const partsGroup=new THREE.Group();
    partsGroup.userData={semanticParts:true,nodeId:n.id};
    n.depthParts.forEach((part,partIndex)=>{
     const partGeometry=new THREE.SphereGeometry(Math.max(1.15,3.25-partIndex*.38),18,12);
     const partMaterial=new THREE.MeshStandardMaterial({color,roughness:.5,metalness:.08,transparent:true,opacity:.28,emissive:color,emissiveIntensity:.035});
     const partMesh=new THREE.Mesh(partGeometry,partMaterial);
     partMesh.position.set((partIndex%2?1:-1)*(2.2+partIndex*.45),(partIndex-1)*1.25,Number(part.z||0)*.22);
     partMesh.scale.set(.72,.48,.72);
     partMesh.userData={basePosition:partMesh.position.clone(),baseScale:partMesh.scale.clone(),partId:part.id,label:part.label};
     const partLabel=makeDepthLabel(part.label||part.id,color);
     if(partLabel) partMesh.add(partLabel)
     partsGroup.add(partMesh);
    });
    mesh.add(partsGroup);
   }
   if(n.spatial){
    const halo=new THREE.Mesh(
     new THREE.TorusGeometry(7.2,.16,10,42),
     new THREE.MeshBasicMaterial({color,transparent:true,opacity:.28})
    );
    halo.rotation.x=Math.PI/2;
    mesh.add(halo);
   }
  });

  edges.forEach((e,i)=>{
   const a=positions.get(e.from),b=positions.get(e.to);
   if(!a||!b)return;
   const curve=e.path==="curve"||e.path==="arc";
   let curveObj,points;
   if(curve){
    const mid=a.clone().add(b).multiplyScalar(.5);
    mid.z+=e.path==="arc"?16:9;
    mid.y+=i%2?4:-4;
    curveObj=new THREE.QuadraticBezierCurve3(a.clone(),mid,b.clone());
    points=curveObj.getPoints(32);
   }else{
    curveObj=new THREE.LineCurve3(a.clone(),b.clone());
    points=[a,b];
   }
   edgeCurves.set(e.id,curveObj);
   if(activeEdgeIds.includes(e.id)) outgoingActiveEdges.set(e.from,curveObj);
   const geometry=new THREE.BufferGeometry().setFromPoints(points);
   const active=activeEdgeIds.includes(e.id);
   const material=new THREE.LineBasicMaterial({
    color:active?0xffdf7f:(e.causal?0xf0c86b:0x6f91a3),
    transparent:true,
    opacity:active?.98:(e.causal?.78:.38)
   });
   group.add(new THREE.Line(geometry,material));
   if(active){
    const tube=new THREE.Mesh(new THREE.TubeGeometry(curveObj,42,guided?.34:.28,8,false),new THREE.MeshBasicMaterial({color:0xffd76b,transparent:true,opacity:guided?.26:.2,depthWrite:false}));
    tube.userData={phase:i*.9}; group.add(tube); edgeGlowTubes.push(tube);
    const arrow=new THREE.Mesh(new THREE.ConeGeometry(.95,2.8,12),new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:.88,depthWrite:false}));
    const au=.82,ap=curveObj.getPoint(au),ahead=curveObj.getPoint(Math.min(.995,au+.025)),tangent=ahead.clone().sub(ap).normalize();
    arrow.position.copy(ap);
    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tangent);
    arrow.userData={curve:curveObj,phase:i*.13};
    group.add(arrow); edgeArrows.push(arrow);
    if(reduced)return;
    const traveler=new THREE.Mesh(
     new THREE.SphereGeometry(1.15,14,10),
     new THREE.MeshBasicMaterial({color:0xfff3bf,transparent:true,opacity:.95})
    );
    traveler.userData={curve:curveObj,phase:i*.17};
    group.add(traveler);
    travelers.push(traveler);
   }
  });

  const raycaster=new THREE.Raycaster();
  const pointer=new THREE.Vector2();
  const onPointer=(event)=>{
   const rect=renderer.domElement.getBoundingClientRect();
   pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
   pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
   raycaster.setFromCamera(pointer,camera);
   const hit=raycaster.intersectObjects(meshes.filter(m=>m.userData.visible!==false),false)[0];
   if(hit?.object?.userData?.nodeId) selectRef.current?.(hit.object.userData.nodeId);
  };
  renderer.domElement.addEventListener("pointerdown",onPointer);
  const onContextLost=e=>{e.preventDefault();setFailed(true)};
  renderer.domElement.addEventListener("webglcontextlost",onContextLost);

  const resize=()=>{
   const w=Math.max(240,host.clientWidth),h=Math.max(220,host.clientHeight);
   renderer.setSize(w,h,false);
   camera.aspect=w/h;
   camera.updateProjectionMatrix();
  };
  const ro=new ResizeObserver(resize);
  ro.observe(host);
  resize();
  let inViewport=true;
  const io=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(entries=>{inViewport=entries?.[0]?.isIntersecting!==false},{rootMargin:"140px"}):null;
  io?.observe(host);

  const clock=new THREE.Clock();
  const cameraTarget=new THREE.Vector3();
  const desiredCamera=new THREE.Vector3(0,8,115);
  const cameraMode=cameraPlan?.mode||"focus";
  const followCurve=cameraMode==="follow"&&activeEdgeIds.length?edgeCurves.get(activeEdgeIds[0]):null;
  const explicitTarget=cameraPlan?.targetNodeId?positions.get(cameraPlan.targetNodeId):null;
  let focused=(explicitTarget?[explicitTarget]:focusIds.map(id=>positions.get(id)).filter(Boolean));
  if(cameraMode==="follow"&&activeEdgeIds.length){
   const edge=edges.find(e=>e.id===activeEdgeIds[0]);
   const a=edge?positions.get(edge.from):null,b=edge?positions.get(edge.to):null;
   if(a&&b) focused=[a.clone().add(b).multiplyScalar(.5)];
  }
  if(cameraMode==="overview"){
   focused=[new THREE.Vector3(0,0,0)];
  }
  if(focused.length){
   focused.forEach(v=>cameraTarget.add(v));
   cameraTarget.multiplyScalar(1/focused.length);
   const requested=Math.max(35,Math.min(150,Number(cameraPlan?.distance)||72));
   const distance=cameraMode==="inside"?Math.max(38,requested*.62):cameraMode==="explode"?Math.max(45,requested*.78):cameraMode==="overview"?Math.max(100,requested):requested;
   desiredCamera.copy(cameraTarget).add(new THREE.Vector3(0,cameraMode==="overview"?18:10,distance));
  }
  camera.position.copy(desiredCamera);
  controls.target.copy(cameraTarget);
  controls.update();
  const animate=()=>{
   if(disposed)return;
   frame=requestAnimationFrame(animate);
   if(document.hidden||!inViewport)return;
   const t=clock.getElapsedTime();
   if(!reduced){dust.rotation.y=t*.006;dust.rotation.x=Math.sin(t*.08)*.025;}
   if(playingRef.current&&cameraMode==="inside"&&explicitTarget&&!reduced){
    const insideCamera=explicitTarget.clone().add(new THREE.Vector3(0,1,18));
    controls.target.lerp(explicitTarget,.1);
    camera.position.lerp(insideCamera,.075);
   }else if(playingRef.current&&focused.length&&!reduced){
    if(followCurve){
     const u=(t*.16*motionScale)%1;
     const p=followCurve.getPoint(u);
     const ahead=followCurve.getPoint(Math.min(.999,u+.035));
     const tangent=ahead.clone().sub(p).normalize();
     const followTarget=p.clone().add(tangent.multiplyScalar(4));
     const followCamera=p.clone().add(new THREE.Vector3(0,7,Math.max(34,Number(cameraPlan?.distance)||58)));
     controls.target.lerp(followTarget,.09);
     camera.position.lerp(followCamera,.065);
    }else{
     controls.target.lerp(cameraTarget,.055);
     camera.position.lerp(desiredCamera,.035);
    }
   }
   for(const particle of actionParticles){
    const owner=particle.userData.owner;
    if(!owner)continue;
    const phase=particle.userData.phase;
    if(particle.userData.kind==="flow"){
     const semanticCurve=outgoingActiveEdges.get(owner.userData.nodeId);
     if(semanticCurve){
      const u=(t*.2*motionScale+phase)%1;
      particle.position.copy(semanticCurve.getPoint(u));
     }else particle.position.copy(owner.position).add(new THREE.Vector3((phase*2-1)*9,Math.sin(t*3+phase*9)*1.3,2.8));
    }else{
     const rise=(t*.22*motionScale+phase)%1;
     particle.position.copy(owner.position).add(new THREE.Vector3(Math.sin(t*3+phase*11)*2.4,2+rise*10,Math.cos(t*2+phase*8)*2));
     particle.scale.setScalar(1-rise*.65);
     particle.material.opacity=.82*(1-rise);
    }
   }
   for(const valve of heartValves){
    const owner=valve.userData.heartOwner;
    const active=owner?.userData?.action==="contract"&&playingRef.current;
    const cyc=(t*.82+valve.userData.phase)%1;
    const avOpen=cyc>.48||cyc<.08;
    const semilunarOpen=cyc>.14&&cyc<.36;
    const opening=active?((valve.userData.kind==="av"?avOpen:semilunarOpen)?1:.08):.18;
    valve.scale.set(1,.34+.66*opening,1);
    valve.material.emissiveIntensity=.1+.22*opening;
    valve.material.opacity=.5+.35*opening;
   }
   for(const particle of heartFlowParticles){
    const owner=particle.userData.heartOwner;
    if(!owner)continue;
    const u=(t*.34+particle.userData.phase)%1;
    const oxy=particle.userData.oxygenated;
    const angle=(oxy?1:-1)*(u*Math.PI*1.55-.75);
    const radius=2.2+u*1.5;
    particle.position.copy(owner.position).add(new THREE.Vector3(
     (oxy?1:-1)*(1.25+Math.sin(angle)*radius*.48),
     3.5-u*7.2,
     3.2+Math.cos(angle)*radius*.32
    ));
    const pulse=.72+.28*Math.sin(Math.PI*u);
    particle.scale.setScalar(pulse);
    particle.material.opacity=.38+.4*Math.sin(Math.PI*u);
   }
   for(const tube of edgeGlowTubes){
    tube.material.opacity=.14+(.5+.5*Math.sin(t*3.2+tube.userData.phase))*.16;
   }
   for(const arrow of edgeArrows){
    const u=.72+((t*.035*motionScale+arrow.userData.phase)%1)*.2;
    const p=arrow.userData.curve.getPoint(Math.min(.94,u));
    const ahead=arrow.userData.curve.getPoint(Math.min(.98,u+.025));
    const tangent=ahead.clone().sub(p).normalize();
    arrow.position.copy(p);
    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tangent);
    arrow.material.opacity=.62+(.5+.5*Math.sin(t*4+arrow.userData.phase*10))*.3;
   }
   for(const halo of focusHalos){
    if(!reduced){halo.rotation.z+=.004;halo.rotation.y+=.002;}
    halo.material.opacity=.18+(.5+.5*Math.sin(t*2.2+halo.userData.phase))*.16;
   }
   for(const traveler of travelers){
    const u=(t*.22*motionScale+traveler.userData.phase)%1;
    traveler.position.copy(traveler.userData.curve.getPoint(u));
    const pulse=.9+Math.sin(t*8+traveler.userData.phase*12)*.18;
    traveler.scale.setScalar(pulse);
   }
   for(const label of labels){
    const source=meshes.find(m=>m.userData.nodeId===label.userData.nodeId);
    if(source) label.position.copy(source.position).add(new THREE.Vector3(0,-9,3));
   }
   for(const mesh of meshes){
    const {action,phase}=mesh.userData;
    let s=1;
    if(reduced)s=1;
    else if(action==="pulse")s=1+Math.sin(t*4+phase)*.08;
    else if(action==="contract")s=.9+Math.sin(t*4+phase)*.1;
    else if(action==="expand")s=1.04+Math.sin(t*2.6+phase)*.1;
    else if(action==="grow")s=.96+Math.sin(t*1.8+phase)*.07;
    else if(action==="shrink")s=.82+Math.sin(t*2+phase)*.04;
    else if(action==="activate")s=1.04+Math.sin(t*3+phase)*.03;
    const baseVisualScale=mesh.userData.baseVisualScale||new THREE.Vector3(1,1,1);
    mesh.scale.copy(baseVisualScale).multiplyScalar(s);
    const base=mesh.userData.basePosition;
    if(base) mesh.position.copy(base);
    if(!reduced&&action==="spin") mesh.rotation.y+=.018*motionScale;
    if(!reduced&&action==="flow"&&base) mesh.position.x=base.x+Math.sin(t*2+phase)*.8;
    if(action==="compress"){mesh.scale.y*=.58;mesh.scale.x*=1.08;}
    if(action==="contract"){
     // Two-part heartbeat profile: quick systolic squeeze followed by a longer relaxed phase.
     const cycle=(t*.82+phase*.08)%1;
     const systole=Math.exp(-Math.pow((cycle-.18)/.085,2));
     const rebound=.32*Math.exp(-Math.pow((cycle-.34)/.11,2));
     const squeeze=Math.min(1,systole+rebound);
     mesh.scale.x*=1-.075*squeeze; mesh.scale.y*=1-.115*squeeze; mesh.scale.z*=1-.065*squeeze;
     if(mesh.userData.cinematicHeart){
      mesh.rotation.z=-.12-.025*squeeze;
      mesh.rotation.y=.025*Math.sin(t*.55);
      const coronary=mesh.children.find(x=>x.geometry?.type==="TubeGeometry");
      if(coronary?.material) coronary.material.emissiveIntensity=.12+.28*squeeze;
     }
    }
    if(action==="expand"){
     const breath=.5+.5*Math.sin(t*2.15+phase);
     mesh.scale.x*=1.02+.1*breath; mesh.scale.y*=1.02+.14*breath; mesh.scale.z*=1.02+.1*breath;
    }
    const mat=mesh.material;
    const depthTarget=cameraPlan?.targetNodeId||focusIds[0]||"";
    const depthFocus=mesh.userData.nodeId===depthTarget||focusIds.includes(mesh.userData.nodeId);
    const depthActive=depthFocus&&["inside","explode"].includes(cameraMode);
    if(mat&&depthActive){
     const targetOpacity=cameraMode==="explode"?.1:.16;
     mat.opacity+=(targetOpacity-mat.opacity)*.12;
    }
    if(mat){
     const baseColor=mesh.userData.baseColor||new THREE.Color(0xf2c45c);
     mat.color.copy(baseColor);
     mat.emissive.copy(baseColor);
     if(action==="heat"||action==="ignite"){
      mat.color.lerp(new THREE.Color(0xff7a2f),.62);
      mat.emissive.lerp(new THREE.Color(0xff3d12),.72);
      mat.emissiveIntensity=action==="ignite"?.72:.46;
     }else if(action==="cool"){
      mat.color.lerp(new THREE.Color(0x6fb9ff),.68);
      mat.emissive.lerp(new THREE.Color(0x2d74ff),.6);
      mat.emissiveIntensity=.34;
     }else if(action==="dim"){
      mat.emissiveIntensity=.015;
     }
     if(action==="fill") mat.opacity=Math.min(1,.82+Math.sin(t*2.5+phase)*.12);
     if(action==="empty") mat.opacity=.28+Math.sin(t*2.1+phase)*.06;
     const isFocused=focusIds.includes(mesh.userData.nodeId);
     if(playingRef.current&&focusIds.length&&!isFocused&&action==="dim") mat.opacity=Math.min(mat.opacity,.2);
     if(isFocused){
      mat.emissiveIntensity=Math.max(mat.emissiveIntensity,.24+(.5+.5*Math.sin(t*2.4+phase))*.18);
     }
    }
    const semanticAuras=mesh.children.filter(x=>x.userData?.semanticAura);
    if(!reduced) semanticAuras.forEach((aura,j)=>{aura.rotation.z+=.0025*(j+1)*motionScale});
    const parts=mesh.children.find(x=>x.userData?.semanticParts);
    if(parts){
     const explode=cameraMode==="explode"&&focusIds.includes(mesh.userData.nodeId);
     const split=action==="split"||action==="transform";
     parts.children.forEach((part,j)=>{
      const basePart=part.userData?.basePosition||new THREE.Vector3();
      const basePartScale=part.userData?.baseScale||new THREE.Vector3(.72,.48,.72);
      const dir=j-(parts.children.length-1)/2;
      const target=basePart.clone();
      const inside=cameraMode==="inside"&&depthFocus;
      if(explode) target.z+=dir*5.5;
      if(inside){target.x+=dir*2.1;target.z+=dir*2.4;}
      if(split){target.x+=dir*4.2;target.y+=Math.abs(dir)*1.6;}
      part.position.lerp(target,.08);
      const emphasized=explode||inside||split;
      part.scale.copy(basePartScale).multiplyScalar(emphasized?1.16:1);
      if(part.material){
       const desired=depthFocus&&["inside","explode"].includes(cameraMode)?.76:.28;
       part.material.opacity+=(desired-part.material.opacity)*.12;
       part.material.emissiveIntensity=depthFocus&&["inside","explode"].includes(cameraMode)?.16:.035;
      }
      const depthLabel=part.children.find(x=>x.userData?.depthLabel);
      if(depthLabel){
       const desiredLabel=depthFocus&&["inside","explode"].includes(cameraMode)?(j===0?.92:.82):0;
       depthLabel.material.opacity+=(desiredLabel-depthLabel.material.opacity)*.18;
       depthLabel.position.y=3.15+(explode?Math.abs(dir)*.22:0);
      }
      if(action==="transform"&&!reduced) part.rotation.y+=.012*(j+1);
     });
    }
   }
   controls.update();
   renderer.render(scene,camera);
  };
  animate();

  return()=>{
   disposed=true;
   cancelAnimationFrame(frame);
   ro.disconnect();
   io?.disconnect();
   renderer.domElement.removeEventListener("pointerdown",onPointer);
   renderer.domElement.removeEventListener("webglcontextlost",onContextLost);
   controls.dispose();
   scene.traverse(obj=>{
    if(obj.geometry)obj.geometry.dispose?.();
    if(obj.material){
     if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose?.());
     else obj.material.dispose?.();
    }
   });
   renderer.dispose();
   renderer.domElement.remove();
  };
 },[nodes,edges,focusIds,visibleNodeIds,backgroundNodeIds,activeEdgeIds,nodeActions,cameraPlan,renderProfile]);

 if(failed)return <div className="threeFallback" role="status">تعذّر تشغيل 3D على هذا الجهاز — يبقى الشرح ثنائي الأبعاد متاحًا.</div>;
 return <div className="threeConceptScene" ref={hostRef} aria-label="مشهد ثلاثي الأبعاد تفاعلي"><div className="threeKnowledgeLegend" aria-hidden="true"><span className="fact">● حقيقة</span><span className="inference">◐ استنتاج</span><span className="unknown">○ غير محسوم</span></div></div>;
}
