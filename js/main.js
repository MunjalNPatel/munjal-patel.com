/* CURSOR */
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top = my + 'px';
});

(function animR() {
  rx += (mx - rx) * .12;
  ry += (my - ry) * .12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animR);
})();

/* SCROLL PROGRESS */
const prog = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const s = document.documentElement.scrollTop;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  prog.style.width = (s / h * 100) + '%';
});

/* THREE.JS SCENE */
(function () {
  const canvas = document.getElementById('canvas3d');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 18);

  /* Lights */
  scene.add(new THREE.AmbientLight(0xffffff, 0.1));
  const L1 = new THREE.PointLight(0xf97316, 4, 60); L1.position.set(10, 10, 10); scene.add(L1);
  const L2 = new THREE.PointLight(0x38bdf8, 3, 50); L2.position.set(-10, -5, 8); scene.add(L2);
  const L3 = new THREE.PointLight(0xa3e635, 2, 40); L3.position.set(0, -12, 5); scene.add(L3);

  /* Torus knot — hero centrepiece */
  const tkGeo = new THREE.TorusKnotGeometry(3.5, 0.85, 180, 20, 2, 3);
  const tk = new THREE.Mesh(tkGeo, new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: .85, roughness: .15, transparent: true, opacity: .88 }));
  tk.position.set(7, 0, -2);
  scene.add(tk);

  const tkW = new THREE.Mesh(tkGeo, new THREE.MeshBasicMaterial({ color: 0xf97316, wireframe: true, transparent: true, opacity: .07 }));
  tkW.position.copy(tk.position);
  scene.add(tkW);

  /* Icosahedron */
  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.8, 1),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 1, roughness: .05, transparent: true, opacity: .65 })
  );
  ico.position.set(-9, 2, -3);
  scene.add(ico);

  /* Octahedra cluster */
  const octas = [];
  [[-9, 4, -4], [-7, -3, -6], [-11, 0, -2], [12, 5, -8], [10, -4, -5], [0, 8, -10], [2, -7, -8], [-3, 5, -12], [5, 6, -10]].forEach(([x, y, z]) => {
    const m = new THREE.Mesh(
      new THREE.OctahedronGeometry(.4 + Math.random() * .5),
      new THREE.MeshStandardMaterial({ color: Math.random() > .5 ? 0x38bdf8 : 0xa3e635, metalness: .9, roughness: .1, transparent: true, opacity: .7 })
    );
    m.position.set(x, y, z);
    m.userData = { oy: y, sp: .003 + Math.random() * .005, ph: Math.random() * Math.PI * 2 };
    scene.add(m);
    octas.push(m);
  });

  /* Grid */
  const grid = new THREE.GridHelper(60, 40, 0xf97316, 0x111122);
  grid.material.transparent = true;
  grid.material.opacity = .07;
  grid.position.set(0, -8, -5);
  scene.add(grid);

  /* Particles */
  const N = 300, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - .5) * 60;
    pos[i * 3 + 1] = (Math.random() - .5) * 40;
    pos[i * 3 + 2] = (Math.random() - .5) * 30 - 5;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x38bdf8, size: .06, transparent: true, opacity: .5, sizeAttenuation: true }));
  scene.add(pts);

  /* Scroll & mouse */
  let scrollY = 0, tScrollY = 0, mX = 0, mY = 0;
  window.addEventListener('scroll', () => { tScrollY = window.scrollY; });
  document.addEventListener('mousemove', e => {
    mX = (e.clientX / window.innerWidth - .5) * 2;
    mY = (e.clientY / window.innerHeight - .5) * 2;
  });

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += .008;
    scrollY += (tScrollY - scrollY) * .07;

    /* Camera — scroll drift + mouse parallax */
    camera.position.z = 18 + scrollY * .006;
    camera.position.y += ((-scrollY * .003) - camera.position.y) * .05;
    camera.position.x += (mX * 1.5 - camera.position.x) * .04;
    camera.rotation.x = scrollY * .0002;

    /* Torus knot */
    tk.rotation.x = t * .4; tk.rotation.y = t * .3;
    tk.position.y = Math.sin(t * .5) * .8;
    tk.position.z = -2 - scrollY * .01;
    tkW.rotation.copy(tk.rotation);
    tkW.position.copy(tk.position);

    /* Icosahedron */
    ico.rotation.x += .008; ico.rotation.z += .005;
    ico.position.y = 2 + Math.cos(t * .7) * .6;

    /* Octahedra */
    octas.forEach(o => {
      o.rotation.x += .01; o.rotation.y += .008;
      o.position.y = o.userData.oy + Math.sin(t * o.userData.sp * 120 + o.userData.ph) * .5;
    });

    /* Particles */
    pts.rotation.y = t * .02;
    pts.position.y = -scrollY * .002;

    /* Grid */
    grid.position.z = -5 + (scrollY * .005 % 3);

    /* Lights orbit */
    L1.position.x = Math.cos(t * .4) * 12; L1.position.z = Math.sin(t * .4) * 8;
    L2.position.x = Math.cos(t * .3 + Math.PI) * 10; L2.position.y = Math.sin(t * .5) * 6;

    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* SCROLL REVEAL */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('vis'), i * 100);
      io.unobserve(e.target);
    }
  });
}, { threshold: .1 });

document.querySelectorAll('.exp, .skill-box').forEach(el => io.observe(el));
