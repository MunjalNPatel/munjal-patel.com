document.documentElement.classList.add('js');

/* ── MOBILE NAV ── */
(function(){
  const toggle=document.querySelector('.nav-toggle');
  const links=document.getElementById('nav-links');
  if(!toggle||!links)return;
  function setOpen(open){
    links.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Close menu':'Open menu');
  }
  toggle.addEventListener('click',()=>setOpen(!links.classList.contains('open')));
  links.addEventListener('click',e=>{if(e.target.closest('a'))setOpen(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
})();

/* ── SCROLL REVEAL ── */
(function(){
  const els=document.querySelectorAll('.stat,.program,.case,.role');
  if(!('IntersectionObserver' in window))return;
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');io.unobserve(e.target)}});
  },{threshold:0.1});
  els.forEach(el=>{el.classList.add('reveal');io.observe(el)});
})();

/* ── FOOTER YEAR ── */
document.getElementById('year').textContent=new Date().getFullYear();
