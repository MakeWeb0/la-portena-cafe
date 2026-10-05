/* =========================================================================
   La Porteña — portada
   ========================================================================= */
(() => {
'use strict';
const { $, $$, REDUCED, GS, onView, fernSvg, foliage, prepFern, growFern, sway } = LP;

/* ------------------------------------------------------------ las plantas */
function plantar() {
  $('#heroFrame').innerHTML =
    fernSvg('f1', { n: 16 }) + fernSvg('f2', { n: 15 }) +
    fernSvg('f3', { n: 11 }) + fernSvg('f4', { n: 10 });

  const sitios = [
    ['#nosotros', [{ css: 'top:-4%;right:-3%;width:240px;transform:rotate(168deg)', n: 14 },
                   { css: 'bottom:-6%;left:-4%;width:180px;transform:rotate(12deg)', n: 12 }]],
    ['#carta',    [{ css: 'top:4%;left:-5%;width:210px;transform:rotate(-14deg)', n: 13 },
                   { css: 'bottom:-6%;right:-3%;width:260px;transform:rotate(172deg)', n: 15 }]],
    ['#vitrina',  [{ css: 'top:-6%;right:6%;width:200px;transform:rotate(190deg)', n: 13 },
                   { css: 'bottom:-8%;left:-3%;width:220px;transform:rotate(-6deg)', n: 14 }]],
    ['#resenas',  [{ css: 'bottom:-8%;left:-4%;width:240px;transform:rotate(18deg)', n: 14 },
                   { css: 'top:-4%;right:-4%;width:200px;transform:rotate(160deg)', n: 13 }]],
    ['#redes',    [{ css: 'top:-5%;left:-3%;width:200px;transform:rotate(-170deg)', n: 12 },
                   { css: 'bottom:-6%;right:-4%;width:230px;transform:rotate(6deg)', n: 14 }]],
    ['#latienda', [{ css: 'top:-4%;left:-4%;width:220px;transform:rotate(-10deg)', n: 14 }]],
    ['#contacto', [{ css: 'bottom:-7%;right:-4%;width:240px;transform:rotate(174deg)', n: 14 },
                   { css: 'top:2%;left:-4%;width:170px;transform:rotate(-20deg)', n: 11 }]]
  ];
  sitios.forEach(([sel, specs]) => foliage($(sel), specs));
}

/* =================================================== INTRO: crece un brote
   Se dibuja el suelo, sube el tallo, se abren las hojas de abajo arriba y
   en la punta brota el nombre. Después la pantalla se levanta.
   Solo la primera vez por sesión; se salta tocando.                       */
function intro() {
  return new Promise(resolve => {
    const el = $('#intro'), html = document.documentElement;
    let hecho = false, tl = null;
    const fin = () => {
      if (hecho) return;
      hecho = true; el?.remove(); html.classList.remove('intro-on'); resolve();
    };
    window.__lpIntro = true;          // el seguro del <head> ya no hace falta
    if (!el || html.classList.contains('intro-skip') || REDUCED || !GS) { fin(); return; }
    html.classList.add('intro-on');

    const saltar = () => { tl ? tl.progress(1) : fin(); };
    el.addEventListener('click', saltar);
    addEventListener('keydown', saltar, { once: true });

    /* Si la página se abrió en una pestaña de fondo, el navegador congela
       las animaciones: esperamos a que la miren para que no se la pierdan. */
    const empezar = () => {
      try { sessionStorage.setItem('lp.intro', '1'); } catch {}
      tl = crecer(el, html, resolve, () => { hecho = true; });
    };
    if (!document.hidden) { empezar(); return; }
    const alVer = () => {
      if (document.hidden) return;
      document.removeEventListener('visibilitychange', alVer);
      if (!hecho) empezar();
    };
    document.addEventListener('visibilitychange', alVer);
  });
}

function crecer(el, html, resolve, marcar) {
    const svg = $('#introPlant');
    const suelo = $('.intro__suelo', svg), tallo = $('.intro__tallo', svg);
    const L = tallo.getTotalLength();
    const HOJA = 'M0 0 C 12 -17 40 -19 54 -2 C 40 11 14 11 0 0 Z';

    const piezas = [.2, .33, .46, .58, .7, .81].map((t, k) => {
      const p = tallo.getPointAtLength(t * L);
      const lado = k % 2 ? 1 : -1, s = 1.15 - k * .1;
      return `<g transform="translate(${p.x} ${p.y}) rotate(${lado > 0 ? -32 : 32}) scale(${lado * s} ${s})">
        <g class="intro__h"><path fill="url(#introG)" d="${HOJA}"/><path class="intro__vena" d="M3 -1 Q 28 -6 48 -3"/></g></g>`;
    });
    const punta = tallo.getPointAtLength(L);
    [-1, 1].forEach(lado => piezas.push(
      `<g transform="translate(${punta.x} ${punta.y}) rotate(${lado > 0 ? -62 : 62}) scale(${lado * .78} .78)">
        <g class="intro__h intro__brote"><path fill="url(#introG)" d="${HOJA}"/></g></g>`));
    $('.intro__hojas', svg).innerHTML = piezas.join('');

    const hojas  = $$('.intro__h:not(.intro__brote)', svg);
    const brotes = $$('.intro__brote', svg);
    const textos = ['.intro__name', '.intro__sub', '.intro__skip'].map(s => $(s, el));

    [suelo, tallo].forEach(p => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
    gsap.set([...hojas, ...brotes], { scale: 0, transformOrigin: '0% 50%' });
    gsap.set(textos, { opacity: 0, y: 14 });
    el.classList.add('vivo');

    let saliendo = false;
    const salir = () => {
      if (saliendo) return;
      saliendo = true;
      marcar();
      setTimeout(resolve, 450);                  // el hero empieza bajo la cortina
      gsap.timeline({ onComplete: () => { el.remove(); html.classList.remove('intro-on'); } })
        .to(svg, { y: -46, opacity: 0, duration: .6, ease: 'power2.in' })
        .to(textos, { opacity: 0, y: -18, duration: .4, stagger: .04 }, '<')
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'power4.inOut' }, '-=.25');
    };

    return gsap.timeline({ onComplete: salir })
      .to(suelo, { strokeDashoffset: 0, duration: .5, ease: 'power2.out' })
      .to(tallo, { strokeDashoffset: 0, duration: 1.15, ease: 'power2.inOut' }, '-=.15')
      .to(hojas, { scale: 1, duration: .6, ease: 'back.out(2)', stagger: .13 }, '-=.85')
      .to(brotes, { scale: 1, duration: .55, ease: 'back.out(3)', stagger: .08 }, '-=.2')
      .to(textos[0], { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, '-=.35')
      .to(textos[1], { opacity: 1, y: 0, duration: .5 }, '-=.35')
      .to(textos[2], { opacity: .8, y: 0, duration: .4 }, '<')
      .to({}, { duration: .45 });
}

/* ------------------------------------------------------------------ hero */
function hero() {
  const h1 = $('#heroTitle');
  h1.innerHTML = [...h1.textContent.trim()]
    .map(c => c === ' ' ? '<span class="ch">&nbsp;</span>' : `<span class="ch">${c}</span>`).join('');

  const helechos = $$('#heroFrame svg');
  if (!GS || REDUCED) return () => {};

  const piezas = ['#heroMark', '.ch', '.hero__sub', '#heroChalk', '#heroCta .btn', '.promo', '.scrollcue'];
  helechos.forEach(prepFern);
  gsap.set(piezas, { opacity: 0 });

  /* parallax: el vídeo se aleja y los helechos se separan al bajar */
  const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero__bg', { yPercent: 14, ease: 'none', scrollTrigger: st });
  helechos.forEach((s, i) => gsap.to(s, { yPercent: i % 2 ? 16 : -16, ease: 'none', scrollTrigger: { ...st } }));

  return () => {
    helechos.forEach((s, i) => { growFern(s, { delay: i * .16, speed: 1.15 }); sway(s, 2.8); });
    gsap.timeline({ defaults: { ease: 'power3.out' }, delay: .3 })
      .fromTo('#heroMark', { scale: .4, rotate: -30, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1 })
      .fromTo('.ch', { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, stagger: .035 }, '-=.6')
      .fromTo('.hero__sub', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, '-=.45')
      .fromTo('#heroChalk', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, '-=.4')
      .fromTo('#heroCta .btn', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .1 }, '-=.45')
      .fromTo('.promo', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .08 }, '-=.3')
      .to('.scrollcue', { opacity: 1, duration: .6 }, '-=.3');
  };
}

function promos() {
  $('#promos').innerHTML = PROMOS
    .map(p => `<span class="promo"><b>${p.t}</b><span>${p.p}</span></span>`).join('');
}

function counters() {
  $$('[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10);
    const o = { v: 0 };
    const paint = () => el.textContent =
      o.v.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (!GS || REDUCED) { o.v = end; paint(); return; }
    paint();
    onView(el, () => gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: paint }));
  });
}

/* ============================================================== LA CARTA
   Láminas parejas: las familias largas se parten en varias láminas y las
   cortas se juntan, para que ninguna sea mucho más alta que las demás.
   En CSS, grid-auto-rows:1fr iguala la altura de todas.                   */
const MAX_LINEAS = 12, TROZO = 10, CAPACIDAD = 14;

function empaquetar(grupos) {
  const out = [];
  grupos.forEach(g => {
    const n = g.items.length;
    if (n > MAX_LINEAS) {
      const k = Math.ceil(n / TROZO), size = Math.ceil(n / k);
      for (let j = 0; j < k; j++) out.push({ fija: true, partes: [{
        t: g.t, sub: `${j + 1}/${k}`, items: g.items.slice(j * size, (j + 1) * size),
        nota: j === k - 1 ? g.nota : null }] });
      return;
    }
    const coste = n + 1.5 + (g.nota ? 1 : 0);
    const ult = out[out.length - 1];
    if (ult && !ult.fija && ult.coste + coste <= CAPACIDAD) {
      ult.partes.push({ t: g.t, items: g.items, nota: g.nota });
      ult.coste += coste;
    } else {
      out.push({ fija: false, coste, partes: [{ t: g.t, items: g.items, nota: g.nota }] });
    }
  });
  return out;
}

function carta() {
  const tabs = $('#cartaTabs'), grid = $('#cartaGrid');

  tabs.innerHTML = CARTA.map((c, i) =>
    `<button class="ctab${i ? '' : ' on'}" role="tab" data-i="${i}" aria-selected="${!i}">${c.tab}</button>`).join('');

  const parte = p => `
    <div>
      <header class="lamina__h"><i></i><h3>${p.t}</h3>${p.sub ? `<small>${p.sub}</small>` : ''}</header>
      <svg class="lamina__r" viewBox="0 0 400 5" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 3 C 90 1, 150 5, 230 3 S 330 1, 400 3"/></svg>
      ${p.items.map(([n, pr]) => `
        <div class="plato"><span class="plato__n">${n}</span><span class="plato__d"></span><span class="plato__p">${pr}</span></div>`).join('')}
      ${p.nota ? `<p class="lamina__nota">${p.nota}</p>` : ''}
    </div>`;

  const paint = (i, animar) => {
    grid.innerHTML = empaquetar(CARTA[i].grupos)
      .map(c => `<article class="lamina">${c.partes.map(parte).join('')}</article>`).join('');
    if (!GS || REDUCED || !animar) return;
    gsap.from($$('.lamina', grid), { opacity: 0, y: 30, rotationX: -8, transformPerspective: 900,
      duration: .7, stagger: .05, ease: 'power3.out', clearProps: 'transform' });
    $$('.lamina__r path', grid).forEach(p => {
      const L = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L },
        { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut', delay: .25 });
    });
  };

  tabs.addEventListener('click', e => {
    const b = e.target.closest('.ctab'); if (!b || b.classList.contains('on')) return;
    $$('.ctab', tabs).forEach(t => { t.classList.remove('on'); t.setAttribute('aria-selected', 'false'); });
    b.classList.add('on'); b.setAttribute('aria-selected', 'true');
    paint(+b.dataset.i, true);
  });

  paint(0, false);
  onView(grid, () => {
    if (!GS || REDUCED) return;
    gsap.from($$('.lamina', grid), { opacity: 0, y: 40, duration: .9, stagger: .07,
      ease: 'power3.out', clearProps: 'transform' });
  });
}

/* =================================================== VITRINA — carrusel 3D
   Una sola posición continua (st.pos) manda sobre las 14 fotos: GSAP la
   anima y cada foto calcula su sitio a partir de ella. Así, por mucho que
   se pulse, ninguna foto puede quedarse a medio camino ni juntarse.
   Las medidas se toman con offsetWidth, que no cambia con el giro 3D.    */
const VITRINA = [
  'Licuado de vainilla', 'Masita recién horneada', 'Croissant de dulce de leche',
  'Croissants de mantequilla', 'Red velvet', 'Cheesecake de pistacho',
  'Brownie con coco', 'Fernet, como en Buenos Aires', 'Tartaleta de frutos rojos',
  'La vitrina a media mañana', 'Croissant de chocolate', 'Chocotorta',
  'Empanadas argentinas', 'Alfajor de la casa'
];

function vitrina() {
  const root = $('#c3d'), stage = $('#c3dStage'), dots = $('#c3dDots'), cap = $('#c3dCap');
  if (!root) return;
  const N = VITRINA.length;

  stage.innerHTML = VITRINA.map((t, i) => `
    <figure class="c3d__item" data-i="${i}">
      <img src="assets/img/comida/comida-${String(i + 1).padStart(2, '0')}.jpg" alt="${t}"
           draggable="false" loading="${i < 4 || i > N - 4 ? 'eager' : 'lazy'}">
    </figure>`).join('');
  dots.innerHTML = VITRINA.map((_, i) =>
    `<button class="c3d__dot" data-go="${i}" aria-label="Foto ${i + 1} de ${N}"></button>`).join('');

  const items = $$('.c3d__item', stage);
  const puntos = $$('.c3d__dot', dots);
  const st = { pos: GS && !REDUCED ? -6 : 0 };
  let objetivo = 0, mostrado = -1, sp = 180, dp = 150, tw = null;

  const medir = () => { const w = items[0].offsetWidth || 240; sp = w * .64; dp = w * .55; };
  const envolver = v => { let o = ((v % N) + N) % N; if (o > N / 2) o -= N; return o; };
  const indice = v => ((Math.round(v) % N) + N) % N;

  function colocar(el, o) {
    if (GS) { gsap.set(el, o); return; }
    el.style.transform = `translate(-50%,-50%) translate3d(${o.x}px,0,${o.z}px) rotateY(${o.rotationY}deg) scale(${o.scale})`;
    el.style.opacity = o.opacity; el.style.zIndex = o.zIndex;
  }

  function render() {
    items.forEach((el, i) => {
      const off = envolver(i - st.pos), a = Math.abs(off), s = Math.sign(off);
      const a1 = Math.min(a, 1), a2 = Math.max(0, a - 1);
      const op = a <= 3 ? 1 - a2 * .22 : Math.max(0, .56 * (1 - (a - 3) / .6));
      colocar(el, {
        xPercent: -50, yPercent: -50,
        x: s * (a1 * sp * 1.05 + a2 * sp * .62),
        z: -(a1 * dp + a2 * dp * .55),
        rotationY: -s * (a1 * 44 + a2 * 6),
        scale: 1 - a1 * .06 - a2 * .06,
        opacity: op, zIndex: Math.round(100 - a * 10)
      });
      el.classList.toggle('dim', a > .5);
      el.style.visibility = op < .01 ? 'hidden' : 'visible';
      el.style.pointerEvents = a < 3.2 ? 'auto' : 'none';
    });

    const actual = indice(st.pos);
    if (actual === mostrado) return;
    mostrado = actual;
    puntos.forEach((d, i) => d.classList.toggle('on', i === actual));
    cap.textContent = VITRINA[actual];
    if (GS && !REDUCED) gsap.fromTo(cap, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .45, overwrite: true });
  }

  function irA(destino, dur = .95) {
    objetivo = destino;
    tw?.kill();
    if (!GS || REDUCED) { st.pos = destino; render(); return; }
    tw = gsap.to(st, { pos: destino, duration: dur, ease: 'power3.out', onUpdate: render });
  }
  const paso   = d => irA(objetivo + d);
  const saltaA = i => irA(objetivo + envolver(i - objetivo));

  $('#c3dPrev').addEventListener('click', () => { paso(-1); pausa(); });
  $('#c3dNext').addEventListener('click', () => { paso(1); pausa(); });
  dots.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (b) { saltaA(+b.dataset.go); pausa(); }
  });

  /* Arrastre continuo: la cinta sigue al dedo y al soltar se asienta,
     con algo de inercia si el gesto fue rápido.                          */
  /* Sin setPointerCapture: así un toque corto sigue llegando a la foto */
  let abajo = false, x0 = 0, base = 0, arrastrado = false, ultX = 0, ultT = 0, vel = 0;
  const mover = e => {
    if (!abajo) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 6) arrastrado = true;
    const t = performance.now();
    vel = (e.clientX - ultX) / Math.max(1, t - ultT);
    ultX = e.clientX; ultT = t;
    st.pos = base - dx / (sp * 1.05);
    render();
  };
  const soltar = () => {
    if (!abajo) return;
    abajo = false; root.classList.remove('drag');
    removeEventListener('pointermove', mover);
    removeEventListener('pointerup', soltar);
    removeEventListener('pointercancel', soltar);
    if (!arrastrado) { irA(objetivo, .4); return; }
    const empuje = Math.max(-2, Math.min(2, -vel * 160 / sp));
    irA(Math.round(st.pos + empuje), .8);
    pausa();
  };
  root.addEventListener('pointerdown', e => {
    if (e.button && e.button !== 0) return;
    abajo = true; arrastrado = false; x0 = ultX = e.clientX; ultT = performance.now(); vel = 0;
    tw?.kill(); base = st.pos; root.classList.add('drag'); detener();
    addEventListener('pointermove', mover);
    addEventListener('pointerup', soltar);
    addEventListener('pointercancel', soltar);
  });

  /* Un toque (sin arrastre) en una foto lateral la trae al centro */
  stage.addEventListener('click', e => {
    if (arrastrado) return;
    const f = e.target.closest('.c3d__item'); if (!f) return;
    const i = +f.dataset.i;
    if (i !== indice(objetivo)) { saltaA(i); pausa(); }
  });

  root.tabIndex = 0;
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); paso(-1); pausa(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); paso(1); pausa(); }
  });

  /* Pasa sola; se para al tocarla y cuando no está a la vista */
  let auto = null, visible = false;
  function arrancar() { if (REDUCED || auto || !visible) return; auto = setInterval(() => paso(1), 4600); }
  function detener()  { clearInterval(auto); auto = null; }
  function pausa()    { detener(); clearTimeout(window.__v3); window.__v3 = setTimeout(arrancar, 6000); }
  root.addEventListener('pointerenter', detener);
  root.addEventListener('pointerleave', () => { if (!abajo) pausa(); });
  new IntersectionObserver(es => es.forEach(e => {
    visible = e.isIntersecting; visible ? arrancar() : detener();
  }), { threshold: .3 }).observe(root);

  addEventListener('resize', () => { clearTimeout(window.__v3r); window.__v3r = setTimeout(() => { medir(); render(); }, 150); });

  medir();
  render();

  /* Entrada: la cinta llega girando y las fotos se revelan */
  if (GS && !REDUCED) {
    const imgs = $$('img', stage);
    gsap.set(imgs, { opacity: 0, scale: 1.3 });
    onView(root, () => {
      irA(0, 1.9);
      gsap.to(imgs, { opacity: 1, scale: 1, duration: 1.2, stagger: { each: .04, from: 'center' }, ease: 'power3.out' });
    });
  }
}

/* ====================================================== RESEÑAS — hojas
   Cada reseña es una hoja que brota del tallo, se mece sola y reacciona
   al pasar el ratón.                                                     */
function resenas() {
  const r = CONFIG.rating;
  $('#revScore').textContent = r.toLocaleString('es-ES', { minimumFractionDigits: 1 });

  const STAR = 'M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.5 6.2 20.5l1.1-6.5-4.7-4.6 6.5-.95z';
  $('#revStars').innerHTML = [0, 1, 2, 3, 4].map(i => {
    const pc = Math.max(0, Math.min(1, r - i)) * 100;
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="g${i}">
      <stop offset="${pc}%" stop-color="#E0A758"/><stop offset="${pc}%" stop-color="rgba(241,238,228,.22)"/>
      </linearGradient></defs><path fill="url(#g${i})" d="${STAR}"/></svg>`;
  }).join('');
  $('#revCount').textContent = CONFIG.resenas.toLocaleString('es-ES');

  const dist = [[5, 72], [4, 17], [3, 6], [2, 2], [1, 3]];
  $('#revBars').innerHTML = dist.map(([s, pc]) =>
    `<div class="bar"><span>${s}★</span><i><b data-w="${pc}"></b></i><span>${pc}%</span></div>`).join('');
  $('#revChips').innerHTML = DESTACADOS.map(d => `<span class="chip">${d}</span>`).join('');

  const enr = $('#enredadera');
  enr.innerHTML = `
    <svg class="enredadera__tallo" viewBox="0 0 80 1000" preserveAspectRatio="none" aria-hidden="true">
      <path vector-effect="non-scaling-stroke" d="M40 0 C 12 120, 68 240, 40 360 S 12 600, 40 720 S 68 900, 40 1000"/>
    </svg>` +
    RESENAS.map((q, i) => `
      <blockquote class="hoja${i % 2 === 0 ? ' hoja--izq' : ''}">
        <div class="hoja__in">
          <div class="hoja__s" aria-label="${q.e || 5} de 5 estrellas">
            ${`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg>`.repeat(q.e || 5)}
          </div>
          <p>${q.t}</p>
          <footer><b aria-hidden="true">${q.a.trim()[0].toUpperCase()}</b><span>${q.a} · en Google</span></footer>
        </div>
      </blockquote>`).join('');

  /* barras de la nota */
  $$('#revBars b').forEach(b => {
    const w = b.dataset.w + '%';
    if (!GS || REDUCED) { b.style.width = w; return; }
    onView(b, () => gsap.to(b, { width: w, duration: 1.1, ease: 'power2.out' }));
  });

  if (!GS || REDUCED) return;

  const tallo = $('.enredadera__tallo path', enr);
  const hojas = $$('.hoja', enr);
  const movil = () => matchMedia('(max-width:760px)').matches;
  const izq   = h => h.classList.contains('hoja--izq') && !movil();
  const origen = h => izq(h) ? '100% 0%' : '0% 0%';
  const signo  = h => izq(h) ? 1 : -1;

  const L = tallo.getTotalLength();
  gsap.set(tallo, { strokeDasharray: L, strokeDashoffset: L });
  hojas.forEach(h => gsap.set(h, { scale: 0, opacity: 0, rotation: signo(h) * 32, transformOrigin: origen(h) }));

  const meceos = new Map();
  const mecer = h => {
    meceos.get(h)?.kill();
    meceos.set(h, gsap.to(h, { rotation: signo(h) * gsap.utils.random(.9, 1.7),
      duration: gsap.utils.random(2.6, 3.9), ease: 'sine.inOut', yoyo: true, repeat: -1 }));
  };

  onView(enr, () => {
    gsap.to(tallo, { strokeDashoffset: 0, duration: 1.7, ease: 'power2.inOut' });
    hojas.forEach((h, i) => gsap.to(h, {
      scale: 1, opacity: 1, rotation: 0, duration: 1.3, ease: 'elastic.out(1,.55)',
      delay: .35 + i * .3, transformOrigin: origen(h), onComplete: () => mecer(h)
    }));
  });

  hojas.forEach(h => {
    const estrellas = $$('.hoja__s svg', h);
    h.addEventListener('pointerenter', () => {
      meceos.get(h)?.kill();
      gsap.to(h, { rotation: signo(h) * -2.6, y: -8, scale: 1.025, duration: .6,
        ease: 'back.out(2.5)', overwrite: 'auto' });
      gsap.fromTo(estrellas, { rotation: -25, scale: .6 },
        { rotation: 0, scale: 1, duration: .5, stagger: .05, ease: 'back.out(3)', transformOrigin: '50% 50%' });
    });
    h.addEventListener('pointerleave', () => {
      gsap.to(h, { rotation: 0, y: 0, scale: 1, duration: 1.1, ease: 'elastic.out(1,.4)',
        overwrite: 'auto', onComplete: () => mecer(h) });
    });
  });
}

/* ---------------------------------------------------------------- redes */
function reels() {
  const vids = [
    { src: 'assets/video/redes-1.mp4', post: 'assets/img/poster/redes-1.jpg', tag: 'Para merendar' },
    { src: 'assets/video/redes-2.mp4', post: 'assets/img/poster/redes-2.jpg', tag: 'La vitrina' },
    { src: 'assets/video/redes-3.mp4', post: 'assets/img/poster/redes-3.jpg', tag: 'De noche' }
  ];
  $('#reels').innerHTML = vids.map(v => `
    <figure class="reel">
      <video src="${v.src}" poster="${v.post}" autoplay muted loop playsinline preload="metadata"></video>
      <button class="reel__sound" aria-label="Activar el sonido">
        <svg viewBox="0 0 24 24"><path d="M11 5L6 9H3v6h3l5 4V5Z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>
      </button>
      <figcaption class="reel__tag">${v.tag}</figcaption>
    </figure>`).join('');

  $$('.reel').forEach(fig => {
    const video = $('video', fig), btn = $('.reel__sound', fig);
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) video.play().catch(() => {}); else video.pause();
    }), { threshold: .4 }).observe(fig);
    btn.addEventListener('click', () => {
      const mudo = video.muted;
      $$('.reel video').forEach(v => { if (v !== video) v.muted = true; });
      video.muted = !mudo;
      btn.setAttribute('aria-label', mudo ? 'Silenciar' : 'Activar el sonido');
      btn.style.borderColor = mudo ? 'var(--verde)' : '';
    });
  });
}

/* --------------------------------------------------------------- arranque */
plantar();
promos();
const empezarHero = hero();
carta();
vitrina();
resenas();
reels();
counters();
LP.boot();
intro().then(empezarHero);
})();
