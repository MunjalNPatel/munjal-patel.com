document.documentElement.classList.add('js');

/* ── MOBILE NAV ── */
(function(){
  const toggle=document.querySelector('.nav-toggle');
  const links=document.getElementById('nav-links');
  if(!toggle||!links)return;
  function isOpen(){return links.classList.contains('open')}
  function setOpen(open){
    links.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Close menu':'Open menu');
  }
  toggle.addEventListener('click',()=>setOpen(!isOpen()));
  links.addEventListener('click',e=>{if(e.target.closest('a'))setOpen(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen()){setOpen(false);toggle.focus()}});
  document.addEventListener('pointerdown',e=>{if(isOpen()&&!e.target.closest('.site-header'))setOpen(false)});
})();

/* ── HEADER EDGE (border only once content scrolls under it) ── */
(function(){
  const header=document.querySelector('.site-header');
  if(!header)return;
  const update=()=>header.classList.toggle('scrolled',window.scrollY>8);
  update();
  window.addEventListener('scroll',update,{passive:true});
})();

/* ── ACTIVE NAV LINK ── */
(function(){
  const links=[...document.querySelectorAll('.nav-links a:not(.btn)')];
  if(!links.length||!('IntersectionObserver' in window))return;
  const byId=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      links.forEach(a=>a.classList.remove('active'));
      const a=byId.get(e.target.id);
      if(a)a.classList.add('active');
    });
  },{rootMargin:'-45% 0px -50% 0px'});
  document.querySelectorAll('main section[id]').forEach(s=>io.observe(s));
})();

/* ── SCROLL REVEAL (skips anything already on screen at load) ── */
(function(){
  if(!('IntersectionObserver' in window))return;
  const groups=['.stat','.program','.case','.role','.tags li'];
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');io.unobserve(e.target)}});
  },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
  groups.forEach(sel=>{
    document.querySelectorAll(sel).forEach((el,i)=>{
      if(el.getBoundingClientRect().top<window.innerHeight)return;
      el.style.setProperty('--i',String(Math.min(i%4,3)));
      el.classList.add('reveal');
      io.observe(el);
    });
  });
})();

/* ── FOOTER YEAR ── */
document.getElementById('year').textContent=new Date().getFullYear();
