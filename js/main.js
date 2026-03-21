/* ── CURSOR: Arrow + trail ── */
(function(){
  const SKY='#38bdf8', IND='#818cf8';
  const s=document.createElement('style');
  s.textContent='*{cursor:none!important}#cur-arrow{position:fixed;pointer-events:none;z-index:9999;top:0;left:0}.trail-pt{position:fixed;pointer-events:none;z-index:9998;border-radius:50%;transform:translate(-50%,-50%)}';
  document.head.appendChild(s);
  const arrow=document.createElement('div');
  arrow.id='cur-arrow';
  arrow.innerHTML=`<svg width="16" height="20" viewBox="0 0 16 20" fill="none" style="display:block;overflow:visible"><path d="M2 2L2 15L5.5 11.5L8 18L9.8 17.3L7.3 10.8L12 10.8Z" fill="${SKY}" stroke="#0a0f1e" stroke-width="1" stroke-linejoin="round"/></svg>`;
  document.body.appendChild(arrow);
  const dots=Array.from({length:5},(_,i)=>{
    const d=document.createElement('div');
    d.className='trail-pt';
    const sz=5.5-i*0.7;
    d.style.cssText=`width:${sz}px;height:${sz}px;background:${i%2===0?SKY:IND};opacity:${0.6-i*0.1};box-shadow:0 0 ${sz*2}px ${i%2===0?SKY:IND}`;
    document.body.appendChild(d);
    return{el:d,x:-100,y:-100};
  });
  let mx=-100,my=-100;
  const hist=[];
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    arrow.style.transform=`translate(${mx}px,${my}px)`;
    hist.push({x:mx,y:my});
    if(hist.length>30)hist.shift();
  });
  (function loop(){
    requestAnimationFrame(loop);
    dots.forEach((d,i)=>{
      const past=hist[Math.max(0,hist.length-1-(i+1)*4)]||{x:mx,y:my};
      d.x+=(past.x-d.x)*0.45;d.y+=(past.y-d.y)*0.45;
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
  scene.add(new THREE.AmbientLight(0x1e3a5f,0.5));
  const L1=new THREE.PointLight(0x38bdf8,6,55);L1.position.set(10,8,10);scene.add(L1);
  const L2=new THREE.PointLight(0x818cf8,4,45);L2.position.set(-10,-4,8);scene.add(L2);
  const L3=new THREE.PointLight(0x0ea5e9,3,38);L3.position.set(0,-10,5);scene.add(L3);
  const tkGeo=new THREE.TorusKnotGeometry(3.5,0.75,200,20,2,3);
  const tk=new THREE.Mesh(tkGeo,new THREE.MeshStandardMaterial({color:0x1d4ed8,metalness:.9,roughness:.08,transparent:true,opacity:.85}));
  tk.position.set(7,0,-2);scene.add(tk);
  const tkW=new THREE.Mesh(tkGeo,new THREE.MeshBasicMaterial({color:0x38bdf8,wireframe:true,transparent:true,opacity:.06}));
  tkW.position.copy(tk.position);scene.add(tkW);
  const ico=new THREE.Mesh(new THREE.IcosahedronGeometry(2,1),new THREE.MeshStandardMaterial({color:0x4f46e5,metalness:1,roughness:.04,transparent:true,opacity:.65}));
  ico.position.set(-9,2,-3);scene.add(ico);
  const icoW=new THREE.Mesh(new THREE.IcosahedronGeometry(2,1),new THREE.MeshBasicMaterial({color:0x818cf8,wireframe:true,transparent:true,opacity:.08}));
  icoW.position.copy(ico.position);scene.add(icoW);
  const octas=[];
  const oColors=[0x38bdf8,0x818cf8,0x0ea5e9,0x1d4ed8,0x7dd3fc];
  [[-9,4,-4],[-7,-3,-6],[-11,0,-2],[12,5,-8],[10,-4,-5],[0,8,-10],[2,-7,-8],[-3,5,-12],[5,6,-10],[-5,-6,-8],[8,3,-12]].forEach(([x,y,z])=>{
    const m=new THREE.Mesh(new THREE.OctahedronGeometry(.3+Math.random()*.55),new THREE.MeshStandardMaterial({color:oColors[Math.floor(Math.random()*oColors.length)],metalness:.85,roughness:.12,transparent:true,opacity:.7}));
    m.position.set(x,y,z);m.userData={oy:y,sp:.003+Math.random()*.005,ph:Math.random()*Math.PI*2};
    scene.add(m);octas.push(m);
  });
  const grid=new THREE.GridHelper(80,50,0x1e40af,0x0f172a);
  grid.material.transparent=true;grid.material.opacity=.12;
  grid.position.set(0,-9,-4);scene.add(grid);
  const N=400,pos=new Float32Array(N*3);
  for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*70;pos[i*3+1]=(Math.random()-.5)*45;pos[i*3+2]=(Math.random()-.5)*35-5}
  const pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pts=new THREE.Points(pGeo,new THREE.PointsMaterial({color:0x7dd3fc,size:.055,transparent:true,opacity:.55,sizeAttenuation:true}));
  scene.add(pts);
  const decRing=new THREE.Mesh(new THREE.TorusGeometry(5,0.05,8,80),new THREE.MeshBasicMaterial({color:0x1e40af,transparent:true,opacity:.22}));
  decRing.position.set(7,0,-4);decRing.rotation.x=Math.PI/3;scene.add(decRing);
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

/* ── PROGRAM DELIVERY NETWORK ── */
(function(){
  const scene=document.getElementById('net-scene');
  const canvas=document.getElementById('net-c');
  if(!scene||!canvas)return;
  const ctx=canvas.getContext('2d');
  const tt=document.getElementById('net-tt');

  const NODES=[
    {id:0,label:'KYRA',name:'Kyra Solutions',role:'Program Hub',color:'#0ea5e9',roleColor:'#38bdf8',size:26,
     platform:'Salesforce · Azure DevOps · JIRA · Power BI',
     impact:'20+ developers · 8 programs delivered',
     period:'2020–Present',tx:0.50,ty:0.04,connects:[1,2,3,4,5,6,7,8]},
    {id:1,label:'FL',name:'Florida Prepaid',role:'Business Analyst',color:'#fb923c',roleColor:'#fdba74',size:15,
     platform:'Salesforce · Licensing Portals',
     impact:'185+ app types · 90% processing time reduction',
     period:'2020–2021',tx:0.07,ty:0.72,connects:[0,2]},
    {id:2,label:'IN',name:'Indiana DOE',role:'Business Analyst',color:'#fb923c',roleColor:'#fdba74',size:15,
     platform:'Salesforce · REST API Integration',
     impact:'Grant application, approval & automated distribution · 70% faster approvals',
     period:'2021–2022',tx:0.22,ty:0.72,connects:[0,1]},
    {id:3,label:'RLD',name:'NM Regulatory & Licensing',role:'Sr. Business Analyst',color:'#f472b6',roleColor:'#f9a8d4',size:17,
     platform:'Salesforce CRM',
     impact:'Regulatory licensing & case management',
     period:'2022–2025',tx:0.36,ty:0.55,connects:[0,4,5]},
    {id:4,label:'CCD',name:'NM Cannabis Control Dept.',role:'Project Manager',color:'#38bdf8',roleColor:'#60a5fa',size:17,
     platform:'Salesforce CRM',
     impact:'Cannabis licensing & compliance management',
     period:'2022–2025',tx:0.44,ty:0.72,connects:[0,3,5]},
    {id:5,label:'NMMB',name:'NM Medical Board',role:'Project Manager',color:'#38bdf8',roleColor:'#60a5fa',size:17,
     platform:'Salesforce CRM',
     impact:'Medical licensing & practitioner management',
     period:'2022–2025',tx:0.52,ty:0.55,connects:[0,3,4]},
    {id:6,label:'IL',name:'Illinois DCR',role:'Project Manager',color:'#38bdf8',roleColor:'#60a5fa',size:19,
     platform:'Salesforce CRM',
     impact:'Cannabis inspection management system',
     period:'2024–Present',tx:0.72,ty:0.72,connects:[0]},
    {id:7,label:'MI',name:'Michigan EGLE',role:'Project Manager',color:'#38bdf8',roleColor:'#60a5fa',size:20,
     platform:'Salesforce CRM',
     impact:'Environmental licensing & permitting platform',
     period:'2025–Present',tx:0.90,ty:0.35,connects:[0]},
    {id:8,label:'OH',name:'Ohio Dept. of Health',role:'Tech Lead / DPM',color:'#818cf8',roleColor:'#a5b4fc',size:20,
     platform:'Salesforce PSS',
     impact:'Public health case & license mgmt · 1M+ residents',
     period:'2025–Present',tx:0.90,ty:0.68,connects:[0]},
  ];

  let W,H,hoveredNode=null,selectedNode=null,nt=0,dpr2=1;

  function resizeNet(){
    dpr2=window.devicePixelRatio||1;
    W=scene.offsetWidth;H=Math.round(W*0.60);
    canvas.width=W*dpr2;canvas.height=H*dpr2;
    canvas.style.height=H+'px';scene.style.height=H+'px';
    ctx.scale(dpr2,dpr2);placeNodes();
  }

  function placeNodes(){
    const pad={x:40,y:42,r:40,b:34};
    NODES.forEach(n=>{
      n.x=pad.x+n.tx*(W-pad.x-pad.r);
      n.y=pad.y+n.ty*(H-pad.y-pad.b);
      n.pulse=n.id*0.85;
    });
  }

  function hRgb(h){
    return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)].join(',');
  }

  function drawYearTicks(){
    const ticks=[{y:'2020',f:0.07},{y:'2021',f:0.22},{y:'2022',f:0.38},{y:'2024',f:0.72},{y:'2025',f:0.90}];
    const padX=40,usableW=W-padX-40;
    ticks.forEach(({y,f})=>{
      const x=padX+f*usableW;
      ctx.beginPath();ctx.moveTo(x,38);ctx.lineTo(x,H-22);
      ctx.strokeStyle='rgba(56,189,248,0.05)';ctx.lineWidth=1;
      ctx.setLineDash([3,7]);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='rgba(56,189,248,0.2)';ctx.font='7px ui-monospace,monospace';
      ctx.textAlign='center';ctx.fillText(y,x,H-8);
    });
    ctx.fillStyle='rgba(56,189,248,0.12)';ctx.font='7px ui-monospace,monospace';
    ctx.textAlign='left';
    ctx.fillText('earlier ──────────────────────────────────────── recent →',padX,H-8);
  }

  function drawEdge(a,b,alpha,width,anim){
    const dx=b.x-a.x,dy=b.y-a.y;
    const isK=a.id===0||b.id===0;const bend=isK?0.15:0.05;
    const cx1=a.x+dx*0.3+dy*bend,cy1=a.y+dy*0.3-dx*bend;
    const cx2=a.x+dx*0.7+dy*bend,cy2=a.y+dy*0.7-dx*bend;
    const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
    g.addColorStop(0,`rgba(${hRgb(a.color)},${alpha})`);
    g.addColorStop(1,`rgba(${hRgb(b.color)},${alpha})`);
    ctx.beginPath();ctx.moveTo(a.x,a.y);
    ctx.bezierCurveTo(cx1,cy1,cx2,cy2,b.x,b.y);
    ctx.strokeStyle=g;ctx.lineWidth=width;ctx.stroke();
    if(anim){
      const p=(nt*0.32+a.id*0.2)%1;
      const bx=Math.pow(1-p,3)*a.x+3*Math.pow(1-p,2)*p*cx1+3*(1-p)*p*p*cx2+Math.pow(p,3)*b.x;
      const by=Math.pow(1-p,3)*a.y+3*Math.pow(1-p,2)*p*cy1+3*(1-p)*p*p*cy2+Math.pow(p,3)*b.y;
      ctx.beginPath();ctx.arc(bx,by,2.2,0,Math.PI*2);
      ctx.fillStyle=`rgba(${hRgb(a.color)},0.95)`;
      ctx.shadowColor=a.color;ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0;
    }
  }

  function drawNode(n,highlighted,selected){
    const bob=Math.sin(nt*1.0+n.pulse)*2,ny=n.y+bob;
    const active=highlighted||selected,r=n.size+(active?4:0);
    const pulse=Math.sin(nt*2+n.pulse)*.5+.5;
    if(active){
      ctx.beginPath();ctx.arc(n.x,ny,r+16,0,Math.PI*2);
      ctx.fillStyle=`rgba(${hRgb(n.color)},0.06)`;ctx.fill();
      ctx.beginPath();ctx.arc(n.x,ny,r+8,0,Math.PI*2);
      ctx.fillStyle=`rgba(${hRgb(n.color)},0.1)`;ctx.fill();
    }
    ctx.beginPath();ctx.arc(n.x,ny,r+5,0,Math.PI*2);
    ctx.fillStyle=`rgba(${hRgb(n.color)},${0.05+pulse*0.07})`;ctx.fill();
    ctx.beginPath();ctx.arc(n.x,ny,r,0,Math.PI*2);
    const g=ctx.createRadialGradient(n.x-r*.28,ny-r*.28,0,n.x,ny,r);
    g.addColorStop(0,`rgba(${hRgb(n.color)},0.95)`);
    g.addColorStop(1,`rgba(${hRgb(n.color)},0.52)`);
    ctx.fillStyle=g;ctx.shadowColor=n.color;ctx.shadowBlur=active?22:10;ctx.fill();ctx.shadowBlur=0;
    ctx.beginPath();ctx.arc(n.x,ny,r,0,Math.PI*2);
    ctx.strokeStyle=`rgba(${hRgb(n.color)},${active?.9:.38})`;
    ctx.lineWidth=active?1.5:.8;ctx.stroke();
    ctx.fillStyle='#0a0f1e';
    ctx.font=`bold ${r>20?9:8}px ui-monospace,monospace`;
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n.label,n.x,ny);
    ctx.font='7px ui-monospace,monospace';
    ctx.fillStyle=active?`rgba(${hRgb(n.color)},0.92)`:'rgba(71,85,105,0.78)';
    ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(n.period,n.x,ny+r+7);
  }

  function getNodeAt(mx,my){
    for(const n of NODES){
      const bob=Math.sin(nt*1.0+n.pulse)*2;
      if(Math.sqrt((mx-n.x)**2+(my-(n.y+bob))**2)<n.size+12)return n;
    }
    return null;
  }

  function showTT(n,mx,my){
    const re=document.getElementById('net-tt-role');
    re.textContent=n.role;re.style.color=n.roleColor;
    document.getElementById('net-tt-plat').textContent=n.platform;
    document.getElementById('net-tt-plat').style.color=n.roleColor;
    document.getElementById('net-tt-impact').textContent=n.impact;
    document.getElementById('net-tt-impact').style.color=n.roleColor;
    document.getElementById('net-tt-name').textContent=n.name;
    document.getElementById('net-tt-period').textContent=n.period;
    tt.style.display='block';
    let tx=mx+18,ty=my-20;
    if(tx+205>W)tx=mx-210;if(ty+150>H)ty=H-150;if(ty<10)ty=10;
    tt.style.left=tx+'px';tt.style.top=ty+'px';
  }

  function netDraw(){
    ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,H);
    drawYearTicks();
    const active=selectedNode||hoveredNode;
    NODES.forEach(a=>{
      a.connects.forEach(bi=>{
        if(bi>a.id){
          const b=NODES[bi];
          const lit=active&&(active.id===a.id||active.id===b.id);
          drawEdge(a,b,active?(lit?0.52:0.03):0.12,lit?1.5:.5,lit);
        }
      });
    });
    NODES.forEach(n=>{
      const hi=hoveredNode===n||selectedNode===n;
      const conn=active&&active.connects.includes(n.id);
      const dim=active&&!hi&&!conn;
      if(dim)ctx.globalAlpha=0.15;
      drawNode(n,hi||conn,selectedNode===n);
      ctx.globalAlpha=1;
    });
    nt+=0.016;requestAnimationFrame(netDraw);
  }

  canvas.addEventListener('mousemove',e=>{
    const r=canvas.getBoundingClientRect();
    const mx=e.clientX-r.left,my=e.clientY-r.top;
    hoveredNode=getNodeAt(mx,my);
    canvas.style.cursor=hoveredNode?'pointer':'default';
    if(hoveredNode&&hoveredNode!==selectedNode)showTT(hoveredNode,mx,my);
    else if(!hoveredNode&&!selectedNode)tt.style.display='none';
  });
  canvas.addEventListener('mouseleave',()=>{hoveredNode=null;if(!selectedNode)tt.style.display='none';});
  canvas.addEventListener('click',e=>{
    const r=canvas.getBoundingClientRect();
    const n=getNodeAt(e.clientX-r.left,e.clientY-r.top);
    if(n&&n===selectedNode){selectedNode=null;tt.style.display='none';}
    else if(n){selectedNode=n;showTT(n,e.clientX-r.left,e.clientY-r.top);}
    else{selectedNode=null;tt.style.display='none';}
  });
  window.addEventListener('resize',resizeNet);
  resizeNet();netDraw();
})();