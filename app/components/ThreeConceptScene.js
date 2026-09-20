"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function geometryFor(visual){
 if(["heart","brain","cell","planet","blood"].includes(visual)) return new THREE.SphereGeometry(5,28,20);
 if(["database","stack"].includes(visual)) return new THREE.CylinderGeometry(5,5,7,28);
 if(["volcano","fire"].includes(visual)) return new THREE.ConeGeometry(5.5,9,24);
 if(["portal","signal"].includes(visual)) return new THREE.TorusGeometry(5,1.2,18,40);
 if(["lung","plant","water"].includes(visual)) return new THREE.IcosahedronGeometry(5,1);
 if(["gear"].includes(visual)) return new THREE.TorusKnotGeometry(3.4,1.15,70,12);
 return new THREE.BoxGeometry(9,7,7);
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

export default function ThreeConceptScene({nodes=[],edges=[],focusIds=[],visibleNodeIds=[],backgroundNodeIds=[],activeEdgeIds=[],nodeActions=[],cameraPlan={},playing=false,onSelect}){
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
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:!lowPower,alpha:true,powerPreference:lowPower?"low-power":"high-performance"});}catch(err){setFailed(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,lowPower?1.25:2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const ambient=new THREE.AmbientLight(0xfff6df,1.18);
  const key=new THREE.DirectionalLight(0xffe6ad,2.3);
  key.position.set(30,35,60);
  const fill=new THREE.PointLight(0x78a9ff,28,180);
  fill.position.set(-30,-12,45);
  scene.add(ambient,key,fill);

  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;
  controls.enablePan=false;
  controls.minDistance=55;
  controls.maxDistance=190;

  const group=new THREE.Group();
  scene.add(group);
  const positions=new Map();
  const meshes=[];
  const edgeCurves=new Map();
  const travelers=[];
  const actionMap=new Map((nodeActions||[]).map(a=>[a.id,a.action]));

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
   mesh.userData={nodeId:n.id,baseScale:1,action:actionMap.get(n.id)||"dim",phase:i*.7,visible:visible&&!background};
   if(n.visual==="heart") mesh.scale.set(.88,1.08,.92);
   if(n.visual==="building"||n.visual==="server") mesh.scale.set(.9,1.12,.9);
   group.add(mesh);
   meshes.push(mesh);

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
   const geometry=new THREE.BufferGeometry().setFromPoints(points);
   const active=activeEdgeIds.includes(e.id);
   const material=new THREE.LineBasicMaterial({
    color:active?0xffdf7f:(e.causal?0xf0c86b:0x6f91a3),
    transparent:true,
    opacity:active?.98:(e.causal?.78:.38)
   });
   group.add(new THREE.Line(geometry,material));
   if(active){
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

  const clock=new THREE.Clock();
  const cameraTarget=new THREE.Vector3();
  const desiredCamera=new THREE.Vector3(0,8,115);
  const cameraMode=cameraPlan?.mode||"focus";
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
  const animate=()=>{
   if(disposed)return;
   frame=requestAnimationFrame(animate);
   const t=clock.getElapsedTime();
   if(playingRef.current&&focused.length&&!reduced){
    controls.target.lerp(cameraTarget,.055);
    camera.position.lerp(desiredCamera,.035);
   }
   for(const traveler of travelers){
    const u=(t*.22+traveler.userData.phase)%1;
    traveler.position.copy(traveler.userData.curve.getPoint(u));
    const pulse=.9+Math.sin(t*8+traveler.userData.phase*12)*.18;
    traveler.scale.setScalar(pulse);
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
    mesh.scale.setScalar(s);
    if(!reduced&&action==="spin") mesh.rotation.y+=.018;
    if(!reduced&&action==="flow") mesh.position.x+=(Math.sin(t*2+phase)*.006);
   }
   controls.update();
   renderer.render(scene,camera);
  };
  animate();

  return()=>{
   disposed=true;
   cancelAnimationFrame(frame);
   ro.disconnect();
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
 },[nodes,edges,focusIds,visibleNodeIds,backgroundNodeIds,activeEdgeIds,nodeActions,cameraPlan]);

 if(failed)return <div className="threeFallback" role="status">تعذّر تشغيل 3D على هذا الجهاز — يبقى الشرح ثنائي الأبعاد متاحًا.</div>;
 return <div className="threeConceptScene" ref={hostRef} aria-label="مشهد ثلاثي الأبعاد تفاعلي"/>;
}
