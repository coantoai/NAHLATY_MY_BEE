"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./page.module.css";
import { getSmartAsset } from "../lib/assets/smartAssets";

const ASSET = getSmartAsset("engine-piston-v1");

function disposeObject(root){
  root.traverse(obj=>{
    if(obj.geometry) obj.geometry.dispose();
    if(obj.material){
      const mats=Array.isArray(obj.material)?obj.material:[obj.material];
      mats.forEach(m=>m.dispose());
    }
  });
}

export default function SmartAssetDemo(){
  const mountRef=useRef(null);
  const engineRef=useRef(null);
  const [mode,setMode]=useState("running");

  useEffect(()=>{
    const mount=mountRef.current;
    if(!mount) return;

    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x070b09);
    scene.fog=new THREE.Fog(0x070b09,8,18);

    const camera=new THREE.PerspectiveCamera(35,1,0.1,50);
    camera.position.set(5.5,3.8,8.4);
    camera.lookAt(0,0.7,0);

    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const hemi=new THREE.HemisphereLight(0xcfe2d3,0x111713,1.15);
    scene.add(hemi);

    const key=new THREE.DirectionalLight(0xffffff,3.2);
    key.position.set(4,7,5);
    key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);
    scene.add(key);

    const rim=new THREE.PointLight(0xf4b35f,8,10,2);
    rim.position.set(-3,2.5,-2);
    scene.add(rim);

    const cool=new THREE.PointLight(0x6fb7ff,5,9,2);
    cool.position.set(3,1.2,-3);
    scene.add(cool);

    const floor=new THREE.Mesh(
      new THREE.CircleGeometry(5.6,96),
      new THREE.MeshStandardMaterial({color:0x0d1510,roughness:0.96,metalness:0.03})
    );
    floor.rotation.x=-Math.PI/2;
    floor.position.y=-2.15;
    floor.receiveShadow=true;
    scene.add(floor);

    const engine=new THREE.Group();
    scene.add(engine);

    const metal=new THREE.MeshPhysicalMaterial({color:0xaeb7b3,metalness:0.86,roughness:0.26,clearcoat:0.25});
    const darkMetal=new THREE.MeshPhysicalMaterial({color:0x303936,metalness:0.9,roughness:0.22});
    const brass=new THREE.MeshPhysicalMaterial({color:0xb98b46,metalness:0.72,roughness:0.28});
    const chamberMat=new THREE.MeshPhysicalMaterial({color:0x18211d,metalness:0.55,roughness:0.38,transparent:true,opacity:0.28,side:THREE.DoubleSide});

    const block=new THREE.Mesh(new THREE.BoxGeometry(3.9,5.2,3.15), chamberMat);
    block.position.y=0.1;
    block.castShadow=true;
    engine.add(block);

    const liner=new THREE.Mesh(new THREE.CylinderGeometry(1.28,1.28,4.1,64,1,true), chamberMat.clone());
    liner.material.opacity=0.18;
    liner.position.y=0.55;
    engine.add(liner);

    const piston=new THREE.Group();
    const crown=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,0.72,64),metal);
    crown.castShadow=true;
    piston.add(crown);
    const skirt=new THREE.Mesh(new THREE.CylinderGeometry(0.98,0.98,1.05,64),metal);
    skirt.position.y=-0.73;
    skirt.castShadow=true;
    piston.add(skirt);
    const ring1=new THREE.Mesh(new THREE.TorusGeometry(1.01,0.045,12,72),darkMetal);
    ring1.rotation.x=Math.PI/2; ring1.position.y=0.22; piston.add(ring1);
    const ring2=ring1.clone(); ring2.position.y=0.02; piston.add(ring2);
    piston.position.y=1.35;
    engine.add(piston);

    const crankGroup=new THREE.Group();
    crankGroup.position.y=-1.7;
    engine.add(crankGroup);

    const crankshaft=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.26,3.7,48),darkMetal);
    crankshaft.rotation.z=Math.PI/2;
    crankshaft.castShadow=true;
    crankGroup.add(crankshaft);

    const wheelL=new THREE.Mesh(new THREE.CylinderGeometry(0.92,0.92,0.28,64),darkMetal);
    wheelL.rotation.z=Math.PI/2; wheelL.position.x=-1.25; wheelL.castShadow=true; crankGroup.add(wheelL);
    const wheelR=wheelL.clone(); wheelR.position.x=1.25; crankGroup.add(wheelR);

    const pin=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.72,32),brass);
    pin.rotation.z=Math.PI/2;
    pin.position.set(0,0.78,0);
    crankGroup.add(pin);

    const rodMat=brass.clone();
    const rod=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.24,2.7,32),rodMat);
    rod.castShadow=true;
    engine.add(rod);

    const sparkBody=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.22,0.9,32),darkMetal);
    sparkBody.position.set(0,2.82,0);
    engine.add(sparkBody);

    const sparkGlow=new THREE.Mesh(
      new THREE.SphereGeometry(0.18,32,32),
      new THREE.MeshBasicMaterial({color:0xffc25a,transparent:true,opacity:0})
    );
    sparkGlow.position.set(0,2.32,0);
    engine.add(sparkGlow);

    const combustion=new THREE.Mesh(
      new THREE.SphereGeometry(0.66,48,48),
      new THREE.MeshBasicMaterial({color:0xff8b3d,transparent:true,opacity:0,depthWrite:false})
    );
    combustion.position.set(0,1.95,0);
    engine.add(combustion);

    const pistonLabel=document.createElement("div");
    pistonLabel.className=styles.threeLabel;
    pistonLabel.textContent="البستم";
    mount.appendChild(pistonLabel);

    const crankLabel=document.createElement("div");
    crankLabel.className=styles.threeLabel;
    crankLabel.textContent="عمود المرفق";
    mount.appendChild(crankLabel);

    const world=new THREE.Vector3();
    function projectLabel(obj,el,offsetY=0){
      obj.getWorldPosition(world);
      world.y+=offsetY;
      world.project(camera);
      const x=(world.x*.5+.5)*renderer.domElement.clientWidth;
      const y=(-world.y*.5+.5)*renderer.domElement.clientHeight;
      el.style.transform=`translate(-50%,-50%) translate(${x}px,${y}px)`;
    }

    function resize(){
      const w=mount.clientWidth;
      const h=Math.max(360,Math.round(w*0.56));
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      camera.updateProjectionMatrix();
    }
    resize();

    const ro=new ResizeObserver(resize);
    ro.observe(mount);

    let raf=0;
    let start=performance.now();

    const state={
      running:true,
      focus:null,
      isolate:null
    };
    engineRef.current={
      setMode(next){
        state.running=next==="running";
        state.focus=next==="focus"?"piston":null;
        state.isolate=next==="isolate"?"piston":null;
        start=performance.now();
      },
      replay(){
        start=performance.now();
        state.running=true;
      },
      reset(){
        state.running=false;
        state.focus=null;
        state.isolate=null;
        start=performance.now();
      }
    };

    function setOpacity(object,opacity){
      object.traverse(o=>{
        if(o.material && "opacity" in o.material){
          o.material.transparent=opacity<1 || o.material.transparent;
          o.material.opacity=opacity;
        }
      });
    }

    function animate(now){
      const t=(now-start)/1000;
      const theta=(t*2.15)%(Math.PI*2);
      const cycle=Math.sin(theta);
      const running=state.running;

      const crankY=-1.7;
      const crankRadius=0.78;
      const pistonCenter=running ? 0.88 + (cycle+1)*0.78 : 1.35;
      piston.position.y=pistonCenter;
      crankGroup.rotation.x=running ? theta : 0;

      const pinY=crankY + (running ? Math.cos(theta)*crankRadius : crankRadius);
      const pinZ=running ? Math.sin(theta)*crankRadius : 0;
      pin.position.y=crankRadius;
      pin.position.z=0;

      const pistonJointY=pistonCenter-1.2;
      const dy=pistonJointY-pinY;
      const dz=0-pinZ;
      const length=Math.max(1.6,Math.sqrt(dy*dy+dz*dz));
      rod.scale.y=length/2.7;
      rod.position.set(0,(pistonJointY+pinY)/2,pinZ/2);
      rod.rotation.x=Math.atan2(dz,dy);

      const phase=(theta%(Math.PI*2));
      const ignition=running && phase>5.35 && phase<5.85;
      sparkGlow.material.opacity=ignition?0.95:0;
      sparkGlow.scale.setScalar(ignition?1.7:0.7);
      combustion.material.opacity=ignition?0.26:Math.max(0,0.12-(phase>5.85?phase-5.85:10));
      combustion.scale.setScalar(ignition?1.55:0.72);

      if(state.focus==="piston"){
        camera.position.lerp(new THREE.Vector3(3.2,2.4,5.2),0.08);
        camera.lookAt(0,1.05,0);
        setOpacity(block,0.08);
        setOpacity(liner,0.08);
      }else{
        camera.position.lerp(new THREE.Vector3(5.5,3.8,8.4),0.06);
        camera.lookAt(0,0.7,0);
        setOpacity(block,state.isolate?0.02:0.28);
        setOpacity(liner,state.isolate?0.02:0.18);
      }

      const otherOpacity=state.isolate?0.09:1;
      setOpacity(crankGroup,otherOpacity);
      setOpacity(rod,otherOpacity);
      setOpacity(sparkBody,otherOpacity);

      piston.rotation.y=Math.sin(t*0.5)*0.03;
      engine.rotation.y=-0.3 + Math.sin(t*0.25)*0.035;

      renderer.render(scene,camera);
      projectLabel(piston,pistonLabel,0.15);
      projectLabel(crankGroup,crankLabel,-0.15);
      pistonLabel.style.opacity=state.isolate||state.focus?1:0.86;
      crankLabel.style.opacity=state.isolate?0.18:0.72;

      raf=requestAnimationFrame(animate);
    }
    raf=requestAnimationFrame(animate);

    return ()=>{
      cancelAnimationFrame(raf);
      ro.disconnect();
      if(engineRef.current) engineRef.current=null;
      disposeObject(scene);
      renderer.dispose();
      pistonLabel.remove();
      crankLabel.remove();
      renderer.domElement.remove();
    };
  },[]);

  function select(next){
    setMode(next);
    engineRef.current?.setMode(next);
  }

  return <div className={styles.smartAssetShell}>
    <div className={styles.smartAssetHeader}>
      <div>
        <span>SMART ASSET 01</span>
        <b>{ASSET.title}</b>
        <small>أجزاء حقيقية داخل المشهد + قدرات محفوظة + حالات قابلة لإعادة الاستخدام</small>
      </div>
      <div className={styles.smartAssetMeta}>
        <i>3D</i><i>Parts</i><i>States</i><i>Actions</i>
      </div>
    </div>

    <div className={styles.smartAssetStage} ref={mountRef}>
      <div className={styles.smartAssetLegend}>
        <span>الشرارة</span>
        <span>الاحتراق</span>
        <span>البستم</span>
        <span>المرفق</span>
      </div>
    </div>

    <div className={styles.smartAssetControls}>
      <button className={mode==="running"?styles.smartAssetButtonActive:""} onClick={()=>select("running")}>شغّل الدورة</button>
      <button className={mode==="focus"?styles.smartAssetButtonActive:""} onClick={()=>select("focus")}>ركّز على البستم</button>
      <button className={mode==="isolate"?styles.smartAssetButtonActive:""} onClick={()=>select("isolate")}>اعزل البستم</button>
      <button onClick={()=>{setMode("running");engineRef.current?.replay();}}>↻ إعادة</button>
      <button onClick={()=>{setMode("idle");engineRef.current?.reset();}}>إيقاف</button>
    </div>

    <div className={styles.smartAssetFooter}>
      <span>الأصل محفوظ مرة واحدة.</span>
      <span>الحركة والتفاعل محليان.</span>
      <span>لا نولّد فيديو جديدًا لكل سؤال.</span>
    </div>
  </div>;
}
