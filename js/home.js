/* =========================================================================
   La Porteña — portada
   ========================================================================= */
(() => {
'use strict';
const { $, $$, REDUCED, GS, onView, foliage, lamps, fairy } = LP;

/* ------------------------------------------------- luces, plantas y pizarra */
function ambientar() {
  fairy($('#fairy'));

  /* Tres bombillas colgando sobre el vídeo, a distinta altura */
  lamps($('#hero'), [
    { x: 56, len: 70,  t: 6.4, d: 0,   a: 2.6, c: 'lamp--d' },
    { x: 70, len: 150, t: 5.6, d: -1.4, a: 2.2, c: 'lamp--d' },
    { x: 88, len: 96,  t: 7.2, d: -3,   a: 2.8 }
  ]);

  const sitios = [
    ['#hero',     [{ css: 'bottom:-10%;left:-4%;width:230px;transform:rotate(14deg)', n: 13 }]],
    ['#nosotros', [{ css: 'top:-6%;right:-3%;width:240px;transform:rotate(168deg)', n: 14 },
                   { css: 'bottom:-8%;left:-4%;width:200px;transform:rotate(10deg)', n: 12 }]],
    ['#redes',    [{ css: 'top:-6%;left:-3%;width:210px;transform:rotate(-170deg)', n: 12 },
                   { css: 'bottom:-8%;right:-4%;width:240px;transform:rotate(8deg)', n: 14 }]],
    ['#contacto', [{ css: 'bottom:-9%;right:-3%;width:250px;transform:rotate(174deg)', n: 14 }]]
  ];
  sitios.forEach(([sel, specs]) => foliage($(sel), specs));

}

function promos() {
  $('#promos').innerHTML = PROMOS.map(p => `<li>${p.t}<span>${p.p}</span></li>`).join('');
}

/* ============================================ INTRO: se enciende la bombilla
   Cae una bombilla del techo, parpadea y se enciende; su luz escribe el
   nombre y se abre como un círculo que deja ver la web.
   Solo la primera vez por sesión; se salta tocando.                         */
function intro() {
  return new Promise(resolve => {
    const el = $('#intro'), html = document.documentElement;
    let hecho = false, tl = null;
    const fin = () => {
      if (hecho) return;
      hecho = true; el?.remove(); html.classList.remove('intro-on'); resolve();
    };
    window.__lpIntro = true;          // el seguro del <head> ya no hace falta
    if (!el || !html.classList.contains('intro-on') || REDUCED || !GS) { fin(); return; }

    const saltar = () => { if (tl) tl.progress(1); else fin(); };
    el.addEventListener('click', saltar);
    addEventListener('keydown', saltar, { once: true });

    /* Si la página se abrió en una pestaña de fondo, el navegador congela las
       animaciones: esperamos a que la miren para que no se la pierdan.        */
    const empezar = () => {
      try { sessionStorage.setItem('lp.intro', '1'); } catch {}
      tl = encender(el, fin, resolve);
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

function encender(el, fin, resolve) {
  const lampara = $('#introLamp'), nombre = $('#introName'), sub = $('#introSub'), skip = $('.intro__skip', el);
  lampara.classList.add('off');
  gsap.set(lampara, { y: '-70vh' });
  gsap.set(nombre, { clipPath: 'inset(-20% 100% -30% -10%)', opacity: 1 });
  gsap.set([sub, skip], { opacity: 0, y: 10 });

  const luz = on => () => lampara.classList.toggle('off', !on);
  let abierto = false;
  const abrir = () => { if (abierto) return; abierto = true; setTimeout(resolve, 350); };

  return gsap.timeline({ onComplete: fin })
    .to(lampara, { y: 0, duration: 1.1, ease: 'bounce.out' })
    .to(lampara, { rotation: 2.4, duration: .5, ease: 'sine.inOut', yoyo: true, repeat: 3, transformOrigin: '50% 0' }, '<.4')
    .call(luz(true), null, 1.15).call(luz(false), null, 1.25).call(luz(true), null, 1.34)
    .call(luz(false), null, 1.42).call(luz(true), null, 1.52)
    .to(nombre, { clipPath: 'inset(-20% -10% -30% -10%)', duration: 1.3, ease: 'power2.inOut' }, 1.6)
    .to(sub, { opacity: 1, y: 0, duration: .6 }, 2.3)
    .to(skip, { opacity: .8, y: 0, duration: .5 }, 2.3)
    .to({}, { duration: .5 })
    .call(abrir)
    .to(el, { '--r': '1900px', duration: 1.3, ease: 'power2.in' })
    .to([nombre, sub, skip], { opacity: 0, duration: .4 }, '<');
}

/* ------------------------------------------------------------------ hero */
function hero() {
  if (!GS || REDUCED) return () => {};

  const piezas = ['#status', '#heroSub', '#heroChalk', '#heroLede', '#heroCta .btn', '.scrollcue'];
  gsap.set(piezas, { opacity: 0 });
  gsap.set('#heroTitle', { clipPath: 'inset(-20% 100% -30% -10%)' });
  gsap.set('#heroVideo', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('#heroVideo video', { scale: 1.25 });
  gsap.set('#board', { opacity: 0 });
  gsap.set('#hero .lamp', { opacity: 0 });
  gsap.set('#fairy', { opacity: 0 });

  /* parallax: el vídeo y la pizarra se separan un poco al bajar */
  const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('#heroStage', { yPercent: 8, ease: 'none', scrollTrigger: st });
  gsap.to('.hero__copy', { yPercent: -6, ease: 'none', scrollTrigger: st });

  return () => {
    gsap.timeline({ defaults: { ease: 'power3.out' }, delay: .15 })
      .to('#fairy', { opacity: 1, duration: 1.4 })
      .to('#hero .lamp', { opacity: 1, duration: 1.4, stagger: .22 }, '<')
      .to('#status', { opacity: 1, y: 0, duration: .7 }, .1)
      .to('#heroTitle', { clipPath: 'inset(-20% -10% -30% -10%)', duration: 1.5, ease: 'power2.inOut',
                          onComplete: () => gsap.set('#heroTitle', { clearProps: 'clipPath' }) }, .25)
      .fromTo('#heroSub', { y: 14 }, { y: 0, opacity: 1, duration: .8 }, 1.1)
      .fromTo('#heroChalk', { y: 18, rotation: -5 }, { y: 0, rotation: -1.5, opacity: 1, duration: .9 }, 1.3)
      .fromTo('#heroLede', { y: 18 }, { y: 0, opacity: 1, duration: .8 }, 1.5)
      .fromTo('#heroCta .btn', { y: 18 }, { y: 0, opacity: 1, duration: .6, stagger: .1, clearProps: 'transform' }, 1.65)
      .to('#heroVideo', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut',
                          onComplete: () => gsap.set('#heroVideo', { clearProps: 'clipPath' }) }, .35)
      .to('#heroVideo video', { scale: 1, duration: 1.9, ease: 'power3.out' }, .35)
      .fromTo('#board', { y: -260, rotation: -16, opacity: 0 }, { y: 0, rotation: -3.2, opacity: 1, duration: 1.5, ease: 'elastic.out(1,.55)' }, 1.3)
      .to('.scrollcue', { opacity: 1, duration: .6 }, 2);
  };
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
   Columnas parejas: las familias largas se parten en varias y las cortas se
   juntan, para que ninguna sea mucho más alta que las demás.
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

/* Los dibujitos de tiza de la pizarra del local, uno por familia */
const DOODLES = [
  [/^caf/i,        '<path d="M5 12h16v5a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z"/><path d="M21 14h2a3 3 0 0 1 0 6h-2"/><path d="M10 3c-1 2 1 3 0 6M15 3c-1 2 1 3 0 6"/>'],
  [/^leche/i,      '<path d="M8 6h14l-2 17H10z"/><path d="M9 12h12"/>'],
  [/^t[eé]$/i,     '<path d="M5 13h16v4a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z"/><path d="M21 15h2a3 3 0 0 1 0 5h-2"/><path d="M13 13V6l5-2"/>'],
  [/^tostada/i,    '<path d="M7 24V14a5 5 0 1 1 2-9.6A5 5 0 0 1 20 4a5 5 0 0 1 2 9.6V24z"/>'],
  [/^boller/i,     '<path d="M3 18c2-8 7-11 11-11s9 3 11 11c-3-2-5-2-7 0-2-2-5-2-8 0-2-2-4-2-7 0z"/><path d="M10 8l2 8M16 8l-1 8M20 11l-3 6"/>'],
  [/^tarta/i,      '<path d="M3 21l22-6V9L3 6z"/><path d="M3 6l2 15M3 21h22"/><circle cx="19" cy="7" r="2"/>'],
  [/^empanada/i,   '<path d="M3 21a11 11 0 0 1 22 0z"/><path d="M6 18a8 8 0 0 1 16 0" stroke-dasharray="2 2.6"/>'],
  [/^bocadillo/i,  '<path d="M3 11a11 6 0 0 1 22 0z"/><path d="M3 15h22M3 19h22"/><path d="M4 22a10 3 0 0 0 20 0"/>'],
  [/^tapa/i,       '<circle cx="10" cy="10" r="6"/><path d="M15 15l9 9"/><circle cx="10" cy="10" r="2"/>'],
  [/^panader/i,    '<path d="M4 21c-1-8 3-13 10-13s11 5 10 13z"/><path d="M10 11l-2 5M15 10l-1 6M20 11l-1 5"/>'],
  [/^refresco/i,   '<path d="M11 3h6v5l2 3v13H9V11l2-3z"/><path d="M9 16h10"/>'],
  [/^cerveza/i,    '<path d="M6 9h13v14H6z"/><path d="M19 12h3a2 2 0 0 1 0 8h-3"/><path d="M6 9c0-3 4-4 7-2 3-2 6-1 6 2"/>'],
  [/^vino/i,       '<path d="M8 4h12c0 8-2 11-6 11S8 12 8 4z"/><path d="M14 15v8M9 24h10"/>'],
  [/^sidra/i,      '<path d="M12 3h4v6l3 4v11H9V13l3-4z"/><path d="M9 17h10"/>'],
  [/^(aperitivo|licor|gin|vodka|tequila)/i, '<path d="M4 5h20l-10 12z"/><path d="M14 17v7M9 24h10"/>'],
  [/^whisky/i,     '<path d="M6 7h16l-2 16H8z"/><path d="M7 14h14"/>'],
  [/^yerba/i,      '<path d="M6 11h16c0 8-3 12-8 12s-8-4-8-12z"/><path d="M18 3l-4 12"/>'],
  [/^almac/i,      '<path d="M9 5h10v4H9z"/><path d="M7 9h14v14H7z"/><path d="M10 14h8v5h-8z"/>'],
  [/^alfajor/i,    '<ellipse cx="14" cy="9" rx="10" ry="3.5"/><path d="M4 9v5c0 2 4.5 3.5 10 3.5s10-1.5 10-3.5V9M4 17v3c0 2 4.5 3.5 10 3.5s10-1.5 10-3.5v-3"/>'],
  [/^galletit/i,   '<rect x="5" y="6" width="18" height="6" rx="2"/><rect x="5" y="15" width="18" height="6" rx="2"/>']
];
const doodle = t => {
  const d = DOODLES.find(([re]) => re.test(t.trim()));
  return `<svg viewBox="0 0 28 28" aria-hidden="true">${d ? d[1] : '<path d="M14 3l3 8 8 1-6 6 2 8-7-4-7 4 2-8-6-6 8-1z"/>'}</svg>`;
};

function carta() {
  const tabs = $('#cartaTabs'), grid = $('#cartaGrid');

  tabs.innerHTML = CARTA.map((c, i) =>
    `<button class="ctab${i ? '' : ' on'}" role="tab" data-i="${i}" aria-selected="${!i}">${c.tab}</button>`).join('');

  const parte = p => `
    <div>
      <header class="lamina__h">${doodle(p.t)}<h3>${p.t}</h3>${p.sub ? `<small>${p.sub}</small>` : ''}</header>
      ${p.items.map(([n, pr]) => `
        <div class="plato"><span class="plato__n">${n}</span><span class="plato__d"></span><span class="plato__p">${pr}</span></div>`).join('')}
      ${p.nota ? `<p class="lamina__nota">${p.nota}</p>` : ''}
    </div>`;

  const paint = (i, animar) => {
    grid.innerHTML = empaquetar(CARTA[i].grupos)
      .map(c => `<article class="lamina">${c.partes.map(parte).join('')}</article>`).join('');
    if (!GS || REDUCED || !animar) return;
    gsap.from($$('.lamina', grid), { opacity: 0, y: 24, duration: .7, stagger: .06, ease: 'power3.out', clearProps: 'transform,opacity' });
    gsap.from($$('.plato', grid), { opacity: 0, x: -10, duration: .5, stagger: .012, ease: 'power2.out', clearProps: 'transform,opacity', delay: .15 });
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
    gsap.from($$('.lamina', grid), { opacity: 0, y: 36, duration: .9, stagger: .08,
      ease: 'power3.out', clearProps: 'transform,opacity' });
  });
}

/* ============================================================ RESEÑAS
   Cada reseña es una comanda de papel clavada en el tablón.               */
function resenas() {
  const r = CONFIG.rating;
  $('#revScore').textContent = r.toLocaleString('es-ES', { minimumFractionDigits: 1 });

  const STAR = 'M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.5 6.2 20.5l1.1-6.5-4.7-4.6 6.5-.95z';
  $('#revStars').innerHTML = [0, 1, 2, 3, 4].map(i => {
    const pc = Math.max(0, Math.min(1, r - i)) * 100;
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="g${i}">
      <stop offset="${pc}%" stop-color="#F5B04C"/><stop offset="${pc}%" stop-color="rgba(242,237,227,.2)"/>
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
      <blockquote class="hoja ${i % 2 === 0 ? 'hoja--izq' : 'hoja--der'}">
        <div class="hoja__in">
          <div class="hoja__s" aria-label="${q.e || 5} de 5 estrellas">
            ${`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg>`.repeat(q.e || 5)}
          </div>
          <p>${q.t}</p>
          <footer><b>${q.a}</b><span>en Google</span></footer>
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
  hojas.forEach(h => gsap.set(h, { scale: 0, opacity: 0, rotation: signo(h) * 28, transformOrigin: origen(h) }));

  /* Cada hoja se mece sola, desde el punto donde la une el tallo */
  const meceos = new Map();
  const mecer = h => {
    meceos.get(h)?.kill();
    meceos.set(h, gsap.to(h, { rotation: signo(h) * gsap.utils.random(.8, 1.6),
      duration: gsap.utils.random(2.8, 4.2), ease: 'sine.inOut', yoyo: true, repeat: -1 }));
  };

  onView(enr, () => {
    gsap.to(tallo, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' });
    hojas.forEach((h, i) => gsap.to(h, {
      scale: 1, opacity: 1, rotation: 0, duration: 1.3, ease: 'elastic.out(1,.6)',
      delay: .4 + i * .35, transformOrigin: origen(h), onComplete: () => mecer(h)
    }));
  });

  hojas.forEach(h => {
    const estrellas = $$('.hoja__s svg', h);
    h.addEventListener('pointerenter', () => {
      meceos.get(h)?.kill();
      gsap.to(h, { rotation: signo(h) * -2.4, y: -6, duration: .6, ease: 'back.out(2.5)', overwrite: 'auto' });
      gsap.fromTo(estrellas, { rotation: -25, scale: .6 },
        { rotation: 0, scale: 1, duration: .5, stagger: .05, ease: 'back.out(3)', transformOrigin: '50% 50%' });
    });
    h.addEventListener('pointerleave', () => {
      gsap.to(h, { rotation: 0, y: 0, duration: 1.1, ease: 'elastic.out(1,.4)',
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
    btn.addEventListener('click', () => {
      const mudo = video.muted;
      $$('.reel video').forEach(v => { v.muted = true; });
      $$('.reel__sound').forEach(b => b.classList.remove('on'));
      video.muted = !mudo;
      btn.classList.toggle('on', mudo);
      btn.setAttribute('aria-label', mudo ? 'Silenciar' : 'Activar el sonido');
    });
    if (!GS || REDUCED) return;
    gsap.set(fig, { opacity: 0, y: 60 });
    onView(fig, () => gsap.to(fig, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity' }));
  });
}

/* --------------------------------------------------------------- arranque */
ambientar();
promos();
const empezarHero = hero();
carta();
resenas();
reels();
counters();
LP.boot();
intro().then(empezarHero);
})();
