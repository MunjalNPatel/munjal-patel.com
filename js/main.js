/* ── CURSOR: Arrow + trail ── */
(function(){
  const SKY='#38bdf8', IND='#818cf8';

  // Inject styles — force cursor:none everywhere
  const s=document.createElement('style');
  s.textContent='*{cursor:none!important}#cur-arrow{position:fixed;pointer-events:none;z-index:9999;top:0;left:0;transform:translate(0px,0px)}.trail-pt{position:fixed;pointer-events:none;z-index:9998;border-radius:50%;transform:translate(-50%,-50%)}';
  document.head.appendChild(s);

  // Arrow element
  const arrow=document.createElement('div');
  arrow.id='cur-arrow';
  arrow.innerHTML=`<svg width="16" height="20" viewBox="0 0 16 20" fill="none" style="display:block;overflow:visible"><path d="M2 2L2 15L5.5 11.5L8 18L9.8 17.3L7.3 10.8L12 10.8Z" fill="${SKY}" stroke="#0a0f1e" stroke-width="1" stroke-linejoin="round"/></svg>`;
  document.body.appendChild(arrow);

  // Trail dots
  const N=5;
  const dots=Array.from({length:N},(_,i)=>{
    const d=document.createElement('div');
    d.className='trail-pt';
    const sz=5.5-i*0.7;
    d.style.cssText=`width:${sz}px;height:${sz}px;background:${i%2===0?SKY:IND};opacity:${0.6-i*0.1};box-shadow:0 0 ${sz*2}px ${i%2===0?SKY:IND}`;
    document.body.appendChild(d);
    return{el:d,x:-100,y:-100};
  });

  let mx=-100,my=-100;
  const hist=[];

  // Arrow snaps INSTANTLY — no lag
  document.addEventListener('mousemove',e=>{
    mx=e.clientX; my=e.clientY;
    arrow.style.transform=`translate(${mx}px,${my}px)`;
    hist.push({x:mx,y:my});
    if(hist.length>30)hist.shift();
  });

  // Trail follows with staggered delay through history
  (function loop(){
    requestAnimationFrame(loop);
    dots.forEach((d,i)=>{
      const delay=(i+1)*4;
      const past=hist[Math.max(0,hist.length-1-delay)]||{x:mx,y:my};
      d.x+=(past.x-d.x)*0.45;
      d.y+=(past.y-d.y)*0.45;
      d.el.style.transform=`translate(${d.x}px,${d.y}px) translate(-50%,-50%)`;
    });
  })();
})();

/* ── SCROLL PROGRESS ── */
const prog=document.getElementById('progress');
window.addEventListener('scroll',()=>{
  const s=document.documentElement.scrollTop,h=document.documentElement.scrollHeight-window.innerHeight;
  prog.style.width=(s/h*100)+'%';
});

/* ── THREE.JS — Deep Navy Scene ── */
(function(){
  const canvas=document.getElementById('canvas3d');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setClearColor(0x000000,0);

  const scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x0a0f1e,0.016);
  const camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,200);
  camera.position.set(0,0,18);

  /* Lights — all blue spectrum */
  scene.add(new THREE.AmbientLight(0x1e3a5f,0.5));
  const L1=new THREE.PointLight(0x38bdf8,6,55);L1.position.set(10,8,10);scene.add(L1);
  const L2=new THREE.PointLight(0x818cf8,4,45);L2.position.set(-10,-4,8);scene.add(L2);
  const L3=new THREE.PointLight(0x0ea5e9,3,38);L3.position.set(0,-10,5);scene.add(L3);

  /* Torus knot */
  const tkGeo=new THREE.TorusKnotGeometry(3.5,0.75,200,20,2,3);
  const tk=new THREE.Mesh(tkGeo,new THREE.MeshStandardMaterial({color:0x1d4ed8,metalness:.9,roughness:.08,transparent:true,opacity:.85}));
  tk.position.set(7,0,-2);scene.add(tk);
  const tkW=new THREE.Mesh(tkGeo,new THREE.MeshBasicMaterial({color:0x38bdf8,wireframe:true,transparent:true,opacity:.06}));
  tkW.position.copy(tk.position);scene.add(tkW);

  /* Icosahedron */
  const ico=new THREE.Mesh(new THREE.IcosahedronGeometry(2,1),new THREE.MeshStandardMaterial({color:0x4f46e5,metalness:1,roughness:.04,transparent:true,opacity:.65}));
  ico.position.set(-9,2,-3);scene.add(ico);
  const icoW=new THREE.Mesh(new THREE.IcosahedronGeometry(2,1),new THREE.MeshBasicMaterial({color:0x818cf8,wireframe:true,transparent:true,opacity:.08}));
  icoW.position.copy(ico.position);scene.add(icoW);

  /* Octahedra cluster */
  const octas=[];
  const oColors=[0x38bdf8,0x818cf8,0x0ea5e9,0x1d4ed8,0x7dd3fc];
  [[-9,4,-4],[-7,-3,-6],[-11,0,-2],[12,5,-8],[10,-4,-5],[0,8,-10],[2,-7,-8],[-3,5,-12],[5,6,-10],[-5,-6,-8],[8,3,-12]].forEach(([x,y,z])=>{
    const m=new THREE.Mesh(new THREE.OctahedronGeometry(.3+Math.random()*.55),new THREE.MeshStandardMaterial({color:oColors[Math.floor(Math.random()*oColors.length)],metalness:.85,roughness:.12,transparent:true,opacity:.7}));
    m.position.set(x,y,z);m.userData={oy:y,sp:.003+Math.random()*.005,ph:Math.random()*Math.PI*2};
    scene.add(m);octas.push(m);
  });

  /* Grid */
  const grid=new THREE.GridHelper(80,50,0x1e40af,0x0f172a);
  grid.material.transparent=true;grid.material.opacity=.12;
  grid.position.set(0,-9,-4);scene.add(grid);

  /* Particles */
  const N=400,pos=new Float32Array(N*3);
  for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*70;pos[i*3+1]=(Math.random()-.5)*45;pos[i*3+2]=(Math.random()-.5)*35-5}
  const pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pts=new THREE.Points(pGeo,new THREE.PointsMaterial({color:0x7dd3fc,size:.055,transparent:true,opacity:.55,sizeAttenuation:true}));
  scene.add(pts);

  /* Decorative ring */
  const decRing=new THREE.Mesh(new THREE.TorusGeometry(5,0.05,8,80),new THREE.MeshBasicMaterial({color:0x1e40af,transparent:true,opacity:.22}));
  decRing.position.set(7,0,-4);decRing.rotation.x=Math.PI/3;scene.add(decRing);

  /* Scroll & mouse */
  let scrollY=0,tScrollY=0,mX=0,mY=0;
  window.addEventListener('scroll',()=>{tScrollY=window.scrollY});
  document.addEventListener('mousemove',e=>{mX=(e.clientX/window.innerWidth-.5)*2;mY=(e.clientY/window.innerHeight-.5)*2});

  let t=0;
  (function animate(){
    requestAnimationFrame(animate);t+=.007;
    scrollY+=(tScrollY-scrollY)*.06;
    camera.position.z=18+scrollY*.005;
    camera.position.y+=((-scrollY*.0025)-camera.position.y)*.05;
    camera.position.x+=(mX*1.2-camera.position.x)*.04;
    camera.rotation.x=scrollY*.00015;
    tk.rotation.x=t*.35;tk.rotation.y=t*.28;
    tk.position.y=Math.sin(t*.45)*.9;tk.position.z=-2-scrollY*.008;
    tkW.rotation.copy(tk.rotation);tkW.position.copy(tk.position);
    decRing.rotation.z=t*.15;decRing.position.copy(tk.position);decRing.position.z-=1;
    ico.rotation.x+=.007;ico.rotation.z+=.005;
    ico.position.y=2+Math.cos(t*.65)*.7;
    icoW.rotation.copy(ico.rotation);icoW.position.copy(ico.position);
    octas.forEach(o=>{o.rotation.x+=.009;o.rotation.y+=.007;o.position.y=o.userData.oy+Math.sin(t*o.userData.sp*130+o.userData.ph)*.55});
    pts.rotation.y=t*.018;pts.position.y=-scrollY*.0018;
    grid.position.z=-4+(scrollY*.004%4);
    L1.position.x=Math.cos(t*.35)*12;L1.position.z=Math.sin(t*.35)*9;
    L2.position.x=Math.cos(t*.28+2)*10;L2.position.y=Math.sin(t*.45)*7;
    renderer.render(scene,camera);
  })();

  window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
  });
})();

/* ── SCROLL REVEAL ── */
const io=new IntersectionObserver((entries)=>{
  entries.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('vis'),i*80);io.unobserve(e.target)}});
},{threshold:0.1});
document.querySelectorAll('.exp,.skill-box').forEach(el=>io.observe(el));
