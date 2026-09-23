"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const BLUE = 0x63b9ef;
const RED = 0xef7268;

export default function HeartWorld({ sceneName = "overview", valveMode = "normal", playing = true }) {
  const host = useRef(null);
  const runtime = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    runtime.current?.change({ sceneName, valveMode, playing });
  }, [sceneName, valveMode, playing]);

  useEffect(() => {
    const mount = host.current;
    if (!mount) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setStatus("error");
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
    camera.position.set(0, 1.5, 25);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mount.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xc9dae9, 1.5));
    const key = new THREE.DirectionalLight(0xffdbc9, 3.1);
    key.position.set(-8, 14, 18); scene.add(key);
    const rim = new THREE.PointLight(0x7ac4ef, 80, 70);
    rim.position.set(9, -4, -6); scene.add(rim);
    const back = new THREE.DirectionalLight(0xff846e, 2.5);
    back.position.set(6, 1, -10); scene.add(back);

    const heart = new THREE.Group();
    scene.add(heart);
    const flesh = new THREE.MeshPhysicalMaterial({
      color: 0xb3494b, roughness: .5, metalness: .02,
      clearcoat: .24, side: THREE.DoubleSide, transparent: true, opacity: .85,
      emissive: 0x380c14, emissiveIntensity: .16, depthWrite: false
    });
    const shellParts = [];
    const left = new THREE.Mesh(new THREE.SphereGeometry(3.6, 48, 32), flesh);
    left.position.set(-1.65, 1.25, -.5); left.scale.set(.93, 1.07, .82);
    const right = left.clone(); right.material = flesh.clone(); right.position.set(1.65, 1.25, -.5);
    const apex = new THREE.Mesh(new THREE.ConeGeometry(3.95, 6.5, 48), flesh.clone());
    apex.position.set(.1, -2.9, -.5); apex.rotation.z = Math.PI;
    shellParts.push(left, right, apex);
    heart.add(...shellParts);

    function chamber(label, x, y, tint) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1.43, 32, 22), new THREE.MeshPhysicalMaterial({
        color: tint, transparent: true, opacity: .78, roughness: .22,
        clearcoat: .7, metalness: .05, emissive: tint, emissiveIntensity: .13
      }));
      mesh.position.set(x, y, 2.1); mesh.scale.set(1, 1.16, .65);
      mesh.userData.name = label; heart.add(mesh);
      return mesh;
    }
    const chambers = [
      chamber("الأذين الأيمن", -2, 2.15, BLUE),
      chamber("البطين الأيمن", -1.85, -1.45, BLUE),
      chamber("الأذين الأيسر", 2, 2.15, RED),
      chamber("البطين الأيسر", 1.85, -1.45, RED)
    ];

    function tube(points, tint, radius = .19) {
      const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, "centripetal");
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, radius, 12, false), new THREE.MeshPhysicalMaterial({
        color: tint, roughness: .25, clearcoat: .55, emissive: tint, emissiveIntensity: .16
      }));
      heart.add(mesh);
      return curve;
    }
    const bluePath = tube([[-4.9,6.8,0],[-3,4,2],[-2,2,3],[-2,-1.7,3],[-4.2,-3.4,1],[-5.2,.2,0],[-6,3.7,-.5]], BLUE);
    const redPath = tube([[6,3.6,-.5],[4.7,5,0],[2.15,3.6,2],[2,2.1,3],[1.9,-1.7,3],[3.2,-3.7,1],[4.1,1.6,1],[5.1,7,0]], RED);
    const outflowBlue = tube([[-2.6,-1.8,2.4],[-4,-.4,1],[-5.8,2.1,.2]], BLUE, .29);
    const outflowRed = tube([[2.4,-1.8,2.4],[4.2,.6,1],[4.6,5,.3],[5.1,7,0]], RED, .29);
    void outflowBlue; void outflowRed;

    const valve = new THREE.Group();
    valve.position.set(2, .33, 3.45);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.87,.11,12,48),new THREE.MeshPhysicalMaterial({
      color:0xf4c6a1,roughness:.28,emissive:0x52341d,emissiveIntensity:.22
    }));
    valve.add(ring);
    const leafletMaterial = new THREE.MeshPhysicalMaterial({
      color:0xf8bc9a,roughness:.3,side:THREE.DoubleSide,transparent:true,opacity:.95
    });
    const leafA = new THREE.Mesh(new THREE.SphereGeometry(.78,28,16,0,Math.PI,0,Math.PI),leafletMaterial);
    leafA.scale.set(.94,.84,.08); leafA.rotation.z=Math.PI/2;
    const leafB = leafA.clone(); leafB.material=leafletMaterial.clone(); leafB.rotation.z=-Math.PI/2;
    valve.add(leafA,leafB);
    heart.add(valve);

    const particles = [];
    const particleGeom = new THREE.SphereGeometry(.13, 10, 8);
    for(let i=0;i<32;i++) {
      const red = i>=16;
      const material = new THREE.MeshBasicMaterial({color:red?RED:BLUE,transparent:true,opacity:.85});
      const p = new THREE.Mesh(particleGeom,material);
      p.userData = {path:red?redPath:bluePath, offset:(i%16)/16, red};
      heart.add(p);particles.push(p);
    }
    const leakParticles=[];
    for(let i=0;i<8;i++){
      const p=new THREE.Mesh(particleGeom,new THREE.MeshBasicMaterial({color:RED,transparent:true,opacity:0}));
      p.userData.offset=i/8;p.position.set(2,.3,3.7);heart.add(p);leakParticles.push(p);
    }

    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const state = { sceneName, valveMode, playing };
    const target = new THREE.Vector3(0,0,0);
    const targetCamera = new THREE.Vector3(0,1.5,25);
    let disposed = false;
    let frame = 0;
    let last = performance.now();
    let time = 0;
    let dragX = 0;
    let pointerDown = null;
    function resize() {
      const width=Math.max(300,mount.clientWidth);
      const height=Math.max(320,mount.clientHeight);
      renderer.setSize(width,height,false);
      camera.aspect=width/height;
      camera.updateProjectionMatrix();
    }
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    function pointerStart(e){
      pointerDown={x:e.clientX,y:e.clientY,start:dragX};
    }
    function pointerMove(e){
      if(pointerDown)dragX=pointerDown.start+(e.clientX-pointerDown.x)*.006;
    }
    function pointerEnd(){pointerDown=null;}
    renderer.domElement.addEventListener("pointerdown",pointerStart);
    window.addEventListener("pointermove",pointerMove);
    window.addEventListener("pointerup",pointerEnd);

    runtime.current = {
      change(next) {
        Object.assign(state,next);
        if (state.sceneName === "overview") {
          targetCamera.set(0,1.5,25);target.set(0,0,0);
        } else if (state.sceneName === "flow") {
          targetCamera.set(0,.5,20);target.set(0,.2,1);
        } else if (state.sceneName === "valve" || state.sceneName === "leak") {
          targetCamera.set(2,.7,10);target.set(2,.3,3);
        } else {
          targetCamera.set(1,0,17);target.set(1,0,2);
        }
      }
    };
    runtime.current.change(state);
    setStatus("ready");

    function animate(now) {
      if(disposed)return;
      frame=requestAnimationFrame(animate);
      const dt=Math.min((now-last)/1000,.05);last=now;
      if(state.playing)time+=dt;
      const focus=state.sceneName;
      const close=focus==="valve"||focus==="leak";
      camera.position.lerp(targetCamera,Math.min(1,dt*2.1));
      const look=target.clone();camera.lookAt(look);
      heart.rotation.y += ((close?0:dragX+Math.sin(time*.12)*.06)-heart.rotation.y)*Math.min(1,dt*3);
      const beat=state.playing?(Math.exp(-Math.pow((time*.85%1)-.17,2)/.008)*.044):0;
      heart.scale.setScalar(1-beat);
      shellParts.forEach(m=>{
        const opacity=focus==="overview"?.7:.1;
        m.material.opacity+=(opacity-m.material.opacity)*Math.min(1,dt*3);
      });
      chambers.forEach(c=>{
        c.material.opacity+=((close?.35:.76)-c.material.opacity)*Math.min(1,dt*2);
      });
      const cycle=(time*.85)%1;
      const opened=cycle<.57;
      const leaky=state.valveMode==="leaky";
      const openness=opened?1:(leaky?.3:.02);
      leafA.rotation.y += ((.65*openness)-leafA.rotation.y)*Math.min(1,dt*8);
      leafB.rotation.y += ((-.65*openness)-leafB.rotation.y)*Math.min(1,dt*8);
      valve.scale.setScalar(close?1.4:1);
      valve.visible=focus!=="overview";
      particles.forEach(p=>{
        const speed=state.playing?time*.11:0;
        const u=(p.userData.offset+speed)%1;
        const position=p.userData.path.getPoint(u);
        p.position.copy(position);
        p.material.opacity=focus==="overview"?.25:.93;
        p.scale.setScalar(close?.63:1);
      });
      leakParticles.forEach(p=>{
        const enabled=leaky && (focus==="leak"||focus==="effect");
        const u=(p.userData.offset+(state.playing?time*.29:0))%1;
        p.position.set(2+Math.sin(u*8)*.2,.3-u*2.1,3.9);
        p.material.opacity=enabled?(1-u)*.9:0;
      });
      renderer.render(scene,camera);
    }
    frame=requestAnimationFrame(animate);
    return()=>{
      disposed=true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown",pointerStart);
      window.removeEventListener("pointermove",pointerMove);
      window.removeEventListener("pointerup",pointerEnd);
      scene.traverse(obj=>{
        if(obj.geometry && obj.geometry!==particleGeom)obj.geometry.dispose();
        if(obj.material){
          const materials=Array.isArray(obj.material)?obj.material:[obj.material];
          materials.forEach(m=>m.dispose());
        }
      });
      particleGeom.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      runtime.current=null;
    };
  }, []);

  return <div ref={host} style={{width:"100%",height:"100%",position:"relative"}}>
    {status==="loading"&&<div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"#c4cdd2",fontSize:13}}>يُنشأ عالم القلب…</div>}
    {status==="error"&&<div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"#e6d1ca",padding:20,textAlign:"center"}}>لا يدعم هذا المتصفح عرض المشهد ثلاثي الأبعاد. جرّب Chrome مع تفعيل WebGL.</div>}
  </div>;
}
