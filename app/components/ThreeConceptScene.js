"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function geometryFor(visual){
 if(visual==="heart") return new THREE.SphereGeometry(5,32,24);
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
  const labels=[];
  const edgeCurves=new Map();
  const travelers=[];
  const actionParticles=[];
  const actionMap=new Map((nodeActions||[]).map(a=>[a.id,a.action]));
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
   if(n.visual==="heart") mesh.scale.set(.88,1.08,.92);
   if(n.visual==="building"||n.visual==="server") mesh.scale.set(.9,1.12,.9);
   mesh.userData.baseVisualScale.copy(mesh.scale);
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
    sprite.scale.set(18,4.5,1);
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
  const animate=()=>{
   if(disposed)return;
   frame=requestAnimationFrame(animate);
   const t=clock.getElapsedTime();
   if(playingRef.current&&cameraMode==="inside"&&explicitTarget&&!reduced){
    const insideCamera=explicitTarget.clone().add(new THREE.Vector3(0,1,18));
    controls.target.lerp(explicitTarget,.1);
    camera.position.lerp(insideCamera,.075);
   }else if(playingRef.current&&focused.length&&!reduced){
    if(followCurve){
     const u=(t*.16)%1;
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
      const u=(t*.2+phase)%1;
      particle.position.copy(semanticCurve.getPoint(u));
     }else particle.position.copy(owner.position).add(new THREE.Vector3((phase*2-1)*9,Math.sin(t*3+phase*9)*1.3,2.8));
    }else{
     const rise=(t*.22+phase)%1;
     particle.position.copy(owner.position).add(new THREE.Vector3(Math.sin(t*3+phase*11)*2.4,2+rise*10,Math.cos(t*2+phase*8)*2));
     particle.scale.setScalar(1-rise*.65);
     particle.material.opacity=.82*(1-rise);
    }
   }
   for(const traveler of travelers){
    const u=(t*.22+traveler.userData.phase)%1;
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
    if(!reduced&&action==="spin") mesh.rotation.y+=.018;
    if(!reduced&&action==="flow"&&base) mesh.position.x=base.x+Math.sin(t*2+phase)*.8;
    if(action==="compress"){mesh.scale.y*=.58;mesh.scale.x*=1.08;}
    if(action==="contract"){
     const beat=.5+.5*Math.sin(t*5.2+phase);
     mesh.scale.x*=.9+.08*beat; mesh.scale.y*=.8+.12*beat; mesh.scale.z*=.9+.06*beat;
    }
    if(action==="expand"){
     const breath=.5+.5*Math.sin(t*2.15+phase);
     mesh.scale.x*=1.02+.1*breath; mesh.scale.y*=1.02+.14*breath; mesh.scale.z*=1.02+.1*breath;
    }
    const mat=mesh.material;
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
    }
    const parts=mesh.children.find(x=>x.userData?.semanticParts);
    if(parts){
     const explode=cameraMode==="explode"&&focusIds.includes(mesh.userData.nodeId);
     const split=action==="split"||action==="transform";
     parts.children.forEach((part,j)=>{
      const basePart=part.userData?.basePosition||new THREE.Vector3();
      const basePartScale=part.userData?.baseScale||new THREE.Vector3(.72,.48,.72);
      const dir=j-(parts.children.length-1)/2;
      const target=basePart.clone();
      if(explode) target.z+=dir*5.5;
      if(split){target.x+=dir*4.2;target.y+=Math.abs(dir)*1.6;}
      part.position.lerp(target,.08);
      part.scale.copy(basePartScale).multiplyScalar(explode||split?1.12:1);
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
