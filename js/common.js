/* =========================================================================
   La Porteña — piezas compartidas por la portada y la tienda
   ========================================================================= */
window.LP = (() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE    = window.matchMedia('(pointer: fine)').matches;
const GS      = !!window.gsap;
const eur = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

if (GS && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* Ejecuta fn una sola vez cuando el elemento entra en pantalla.
   Se usa en lugar de ScrollTrigger para las entradas: si el scroll ya está
   pasado, dispara igual y nada se queda escondido.                         */
function onView(el, fn, margin = '0px 0px -12% 0px') {
  if (!el) return;
  if (!('IntersectionObserver' in window)) { fn(el); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { io.disconnect(); fn(el); }
  }), { rootMargin: margin });
  io.observe(el);
}

/* ================================================================ botánica
   Un helecho dibujado a medida: el motivo del muro vegetal del local.
   El primer trazo es el tallo; luego van los foliolos por pares, de la base
   a la punta, que es el orden en el que se dibujan al crecer.              */
function fern({ h = 220, w = 120, n = 15 } = {}) {
  const cx = w / 2;
  const out = [`<path d="M${cx} ${h} C ${cx - 4} ${h * .62} ${cx + 4} ${h * .3} ${cx} 5"/>`];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const len = Math.pow(1 - t, .8) * (cx - 5) + 3;
    const y   = h - 12 - t * (h - 24);
    const up  = 9 * (1 - t) + 3;
    out.push(`<path d="M${cx} ${y} q ${-len * .5} ${-up * .4} ${-len} ${-up}"/>`);
    out.push(`<path d="M${cx} ${y} q ${ len * .5} ${-up * .4} ${ len} ${-up}"/>`);
  }
  return `<g class="sway">${out.join('')}</g>`;
}

const fernSvg = (cls = '', o = {}) => `
  <svg class="${cls}" viewBox="0 0 ${o.w || 120} ${o.h || 220}" fill="none" stroke="currentColor"
       stroke-width="${o.sw || 1.6}" stroke-linecap="round" aria-hidden="true">${fern(o)}</svg>`;

function foliage(sec, specs) {
  if (!sec) return;
  const layer = document.createElement('div');
  layer.className = 'foliage';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = specs.map(s =>
    `<svg viewBox="0 0 120 220" fill="none" stroke="currentColor" stroke-width="1.5"
          stroke-linecap="round" style="${s.css}">${fern({ n: s.n || 14 })}</svg>`).join('');
  sec.prepend(layer);
}

/* Deja el helecho sin dibujar */
function prepFern(svg) {
  $$('path', svg).forEach(p => {
    const L = p.getTotalLength();
    p.style.strokeDasharray = L;
    p.style.strokeDashoffset = L;
  });
}

/* Lo hace crecer: primero el tallo, luego los foliolos de abajo arriba */
function growFern(svg, { delay = 0, speed = 1 } = {}) {
  const [tallo, ...hojas] = $$('path', svg);
  return gsap.timeline({ delay })
    .to(tallo, { strokeDashoffset: 0, duration: 1.1 * speed, ease: 'power2.inOut' })
    .to(hojas, { strokeDashoffset: 0, duration: .5 * speed, ease: 'power2.out',
                 stagger: .028 * speed }, .25 * speed);
}

/* Un balanceo lento, desde la base, como si entrara aire por la puerta */
function sway(svg, amp = 2.4) {
  const g = $('.sway', svg);
  if (!g || REDUCED || !GS) return;
  const vb = svg.viewBox.baseVal;
  gsap.to(g, {
    rotation: (Math.random() < .5 ? -1 : 1) * gsap.utils.random(amp * .6, amp),
    svgOrigin: `${vb.width / 2} ${vb.height}`,
    duration: gsap.utils.random(3.2, 5.2), ease: 'sine.inOut',
    yoyo: true, repeat: -1, delay: gsap.utils.random(0, 1.6)
  });
}

/* Los helechos de cada sección crecen al llegar y luego se mecen */
function animarFoliage() {
  $$('section .foliage, footer .foliage').forEach(layer => {
    const svgs = $$('svg', layer);
    if (!GS || REDUCED) return;
    svgs.forEach(prepFern);
    onView(layer.parentElement, () => {
      svgs.forEach((s, i) => { growFern(s, { delay: i * .2, speed: 1.2 }); sway(s, 2); });
    }, '0px 0px -20% 0px');

    if (window.ScrollTrigger) svgs.forEach((s, i) => gsap.fromTo(s,
      { yPercent: i % 2 ? 10 : -10 }, { yPercent: i % 2 ? -10 : 10, ease: 'none',
        scrollTrigger: { trigger: layer.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  });
}

/* ============================================================= separadores */
function sprigMarkup() {
  const cx = 45, cy = 13, hojas = [];
  for (let i = -3; i <= 3; i++) {
    if (!i) continue;
    const x = cx + i * 11, s = 1 - Math.abs(i) * .17;
    hojas.push(`<ellipse class="lf" cx="${x}" cy="${cy + (i % 2 ? -4.5 : 4.5) * s}"
      rx="${7.5 * s}" ry="${3.8 * s}" transform="rotate(${i % 2 ? -26 : 26} ${x} ${cy})"/>`);
  }
  return `<span class="sprig__l"></span>
    <svg class="sprig__o" viewBox="0 0 90 26" fill="currentColor" aria-hidden="true">
      <circle class="lf" cx="${cx}" cy="${cy}" r="2.6"/>${hojas.join('')}</svg>
    <span class="sprig__l"></span>`;
}

function sprigs() {
  $$('.sprig').forEach(el => {
    if (el.dataset.built) return;
    el.dataset.built = '1';
    el.innerHTML = sprigMarkup();
    if (!GS || REDUCED) return;

    const [l1, l2] = $$('.sprig__l', el);
    const hojas = $$('.lf', el);
    gsap.set(l1, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(l2, { scaleX: 0, transformOrigin: 'right center' });
    gsap.set(hojas, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });

    onView(el, () => {
      gsap.to([l1, l2], { scaleX: 1, duration: 1.1, ease: 'power2.inOut' });
      gsap.to(hojas, { scale: 1, opacity: 1, duration: .55, stagger: .05, ease: 'back.out(2.4)', delay: .35 });
    });
  });
}

/* ======================================================== microanimaciones */

/* Los títulos suben palabra a palabra desde una ranura */
function words() {
  $$('section h2, .shophero h1').forEach(h => {
    if (h.dataset.split) return;
    h.dataset.split = '1';
    h.innerHTML = [...h.childNodes].map(n => n.nodeType === 3
      ? n.textContent.split(/(\s+)/).map(t => /^\s+$/.test(t) ? ' ' : t ? `<span class="w"><span>${t}</span></span>` : '').join('')
      : n.outerHTML).join('');
    if (!GS || REDUCED) return;
    const inner = $$('.w > span', h);
    gsap.set(inner, { yPercent: 115 });
    onView(h, () => gsap.to(inner, { yPercent: 0, duration: 1.05, ease: 'power4.out', stagger: .07 }));
  });
}

/* La hojita del antetítulo gira al aparecer (transición en CSS) */
function eyebrows() {
  $$('.eyebrow').forEach(e => onView(e, () => e.classList.add('in')));
}

function reveals() {
  if (!GS || REDUCED) return;
  $$('[data-reveal]').forEach(el => {
    gsap.set(el, { opacity: 0, y: 40 });
    onView(el, () => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', clearProps: 'transform' }));
  });
}

/* Fotos y vídeos se destapan de abajo arriba */
function mediaReveal() {
  if (!GS || REDUCED) return;
  $$('.about__media, .reel, .shoplink__v, .shophero__v').forEach((el, i) => {
    const m = $('video, img', el);
    gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
    if (m) gsap.set(m, { scale: 1.22 });
    onView(el, () => {
      gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power4.inOut',
                    delay: el.classList.contains('reel') ? (i % 3) * .12 : 0 });
      if (m) gsap.to(m, { scale: 1, duration: 1.7, ease: 'power3.out', clearProps: 'transform' });
    });
  });
}

/* Botones imantados: se acercan un poco al cursor */
function magnetic() {
  if (!GS || REDUCED || !FINE) return;
  $$('.btn, .c3d__arrow, .cartbtn, .burger, .reel__sound, .nav__logo').forEach(el => {
    if (el.dataset.mag) return;
    el.dataset.mag = '1';
    const fuerza = el.classList.contains('btn') ? .28 : .38;
    const xTo = gsap.quickTo(el, 'x', { duration: .45, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: .45, ease: 'power3' });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * fuerza);
      yTo((e.clientY - (r.top + r.height / 2)) * fuerza);
    });
    el.addEventListener('pointerleave', () =>
      gsap.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' }));
  });
}

/* Un tallo arriba del todo que crece con el scroll; la hoja va girando */
function vine() {
  if ($('.vine')) return;
  const v = document.createElement('div');
  v.className = 'vine';
  v.setAttribute('aria-hidden', 'true');
  v.innerHTML = '<i></i><b></b>';
  document.body.appendChild(v);
  const [barra, hoja] = [v.firstChild, v.lastChild];
  let raf = 0;
  const pinta = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    barra.style.transform = `scaleX(${p})`;
    hoja.style.transform = `translateX(${p * innerWidth - 7}px) rotate(${40 + p * 320}deg)`;
    hoja.style.opacity = p > .005 ? 1 : 0;
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(pinta); }, { passive: true });
  addEventListener('resize', pinta);
  pinta();
}

/* ================================================================ contacto */
function fillContact() {
  const dir = `${CONFIG.direccion}, ${CONFIG.ciudad}`;
  const set = (sel, fn) => $$(sel).forEach(fn);
  set('[data-dir]',  e => e.textContent = dir);
  set('[data-tel]',  e => { e.textContent = CONFIG.telefono; e.href = 'tel:' + CONFIG.telHref; });
  set('[data-ig]',   e => e.href = CONFIG.instagram);
  set('[data-mapa]', e => e.href = CONFIG.mapa);
  set('[data-goog]', e => e.href = CONFIG.google);
  set('[data-hor]',  e => e.textContent = CONFIG.horario.map(h => `${h.d}: ${h.h}`).join('  ·  '));
  set('[data-horl]', e => e.innerHTML = CONFIG.horario.map(h => `<p><strong>${h.d}</strong> · ${h.h}</p>`).join(''));
  set('[data-yr]',   e => e.textContent = new Date().getFullYear());
}

/* ================================================================== navbar */
function nav() {
  const bar = $('#nav'), burger = $('#burger'), menu = $('#menu');
  if (!bar) return;

  const onScroll = () => bar.classList.toggle('stuck', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* El menú también tiene sus helechos, que crecen cada vez que se abre */
  foliage(menu, [
    { css: 'bottom:-6%;right:2%;width:min(34vw,300px);transform:rotate(-8deg)', n: 16 },
    { css: 'top:6%;right:24%;width:min(16vw,150px);transform:rotate(198deg)', n: 11 }
  ]);
  const helechosMenu = $$('.foliage svg', menu);

  const toggle = force => {
    const open = force ?? !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    if (open && GS && !REDUCED) helechosMenu.forEach((s, i) => {
      prepFern(s); growFern(s, { delay: .25 + i * .15, speed: .8 });
    });
  };
  burger.addEventListener('click', () => toggle());
  $$('#menu a').forEach(a => a.addEventListener('click', () => toggle(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) toggle(false);
  });
}

/* ==================================================== ilustraciones tienda */
const BOMBILLA = '<path d="M70 58L88 22"/><path d="M88 22l5-9"/>';
const DRAW = {
  calabaza:  `<ellipse cx="58" cy="58" rx="28" ry="9"/><path d="M30 58c0 17 2 32 8 44s13 18 20 18 14-6 20-18 8-27 8-44"/>${BOMBILLA}`,
  camionero: `<ellipse cx="58" cy="58" rx="28" ry="9"/><path d="M30 58c0 17 2 32 8 44s13 18 20 18 14-6 20-18 8-27 8-44"/><path d="M32 80c16 7 36 7 52 0M35 96c14 6 32 6 46 0"/>${BOMBILLA}`,
  madera:    `<ellipse cx="58" cy="54" rx="26" ry="8"/><path d="M32 54l6 58c.7 8 8 14 20 14s19-6 20-14l6-58"/><path d="M34 76h48"/>${BOMBILLA}`,
  acero:     `<ellipse cx="58" cy="54" rx="24" ry="7"/><path d="M34 54v56c0 8 11 13 24 13s24-5 24-13V54"/><path d="M38 124h40"/>${BOMBILLA}`,
  vidrio:    `<ellipse cx="58" cy="52" rx="24" ry="7"/><path d="M34 52v58c0 8 11 13 24 13s24-5 24-13V52"/><path d="M34 76h48v30H34z"/>${BOMBILLA}`,
  torpedo:   `<ellipse cx="58" cy="50" rx="19" ry="6"/><path d="M39 50c0 32 5 57 19 74 14-17 19-42 19-74"/><path d="M42 76h32"/>${BOMBILLA}`,
  termo:       '<path d="M48 30h24a5 5 0 0 1 5 5v11H43V35a5 5 0 0 1 5-5z"/><rect x="39" y="46" width="42" height="88" rx="10"/><path d="M39 64h42"/><path d="M81 74l13-8v15z"/>',
  'termo-mini':'<path d="M49 48h22a5 5 0 0 1 5 5v11H44V53a5 5 0 0 1 5-5z"/><rect x="41" y="64" width="38" height="68" rx="10"/><path d="M41 80h38"/>',
  'termo-alto':'<path d="M49 14h22a5 5 0 0 1 5 5v11H44V19a5 5 0 0 1 5-5z"/><rect x="42" y="30" width="36" height="104" rx="10"/><path d="M42 48h36M42 114h36"/>',
  matera:      '<path d="M28 62h64a4 4 0 0 1 4 4v54a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V66a4 4 0 0 1 4-4z"/><path d="M44 62V48a16 16 0 0 1 32 0v14"/><path d="M24 86h72"/><circle cx="60" cy="104" r="7"/>',
  bombilla:       '<path d="M55 16h10v72H55z"/><path d="M50 88h20v26a10 10 0 0 1-10 10 10 10 0 0 1-10-10z"/><path d="M54 102h12M54 114h12"/>',
  'bombilla-loro':'<path d="M66 16v40c0 17-15 21-22 33"/><ellipse cx="38" cy="104" rx="17" ry="10" transform="rotate(-22 38 104)"/><path d="M30 100h14"/>',
  alfajor: '<ellipse cx="60" cy="54" rx="34" ry="12"/><path d="M26 54v15c0 7 15 12 34 12s34-5 34-12V54"/><path d="M26 81v15c0 7 15 12 34 12s34-5 34-12V81"/>',
  galleta: '<rect x="26" y="56" width="68" height="18" rx="6"/><rect x="26" y="80" width="68" height="18" rx="6"/><rect x="26" y="104" width="68" height="18" rx="6"/>',
  tarro:   '<path d="M42 38h36v14H42z"/><path d="M38 52h44v66a10 10 0 0 1-10 10H48a10 10 0 0 1-10-10z"/><path d="M46 72h28v30H46z"/>',
  bloque:  '<path d="M28 64h52v52H28z"/><path d="M28 64l14-14h52L80 64M80 64l14-14v52l-14 14"/>',
  barra:   '<rect x="40" y="40" width="40" height="88" rx="7"/><path d="M40 62h40M40 84h40M40 106h40"/>',
  caja:    '<path d="M30 60h56v62H30z"/><path d="M30 60l12-14h56L86 60M86 60l12-14v62l-12 14"/><path d="M48 82h20"/>'
};
const svgFor = g => `
  <svg viewBox="0 0 120 160" role="img" aria-hidden="true" fill="none"
       stroke="rgba(71,90,69,.82)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <rect width="120" height="160" fill="#E4E9DB" stroke="none"/>${DRAW[g] || DRAW.caja}</svg>`;

/* ================================================================= carrito
   Vive en localStorage: la portada y la tienda ven lo mismo.               */
const STORE = 'laportena.cart.v1';
let cart = {};
try { cart = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch { cart = {}; }
const save     = () => { try { localStorage.setItem(STORE, JSON.stringify(cart)); } catch {} };
/* PRODUCTOS es un const de data.js: vive en el ámbito global del script, no en window */
const byId     = id => PRODUCTOS.find(p => p.id === id);
const units    = () => Object.values(cart).reduce((a, b) => a + b, 0);
const subtotal = () => Object.entries(cart).reduce((a, [id, q]) => a + ((byId(id)?.p || 0) * q), 0);

function badge(pop = false) {
  const n = units();
  $$('.cartbtn__n').forEach(el => {
    el.textContent = n;
    el.classList.toggle('on', n > 0);
    if (pop) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  });
}

function toast(msg) {
  const t = $('#toast'); if (!t) return;
  $('#toastT').textContent = msg;
  t.classList.add('on');
  clearTimeout(window.__tt);
  window.__tt = setTimeout(() => t.classList.remove('on'), 2600);
}

const waLink = txt => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt)}`;

/* ================================================================ arranque */
function boot() {
  fillContact();
  nav();
  sprigs();
  words();
  eyebrows();
  reveals();
  mediaReveal();
  animarFoliage();
  magnetic();
  vine();
  badge();
  addEventListener('load', () => window.ScrollTrigger?.refresh());
}

return { $, $$, REDUCED, FINE, GS, eur, onView, fern, fernSvg, foliage, prepFern, growFern, sway,
         sprigs, magnetic, svgFor, cart, save, byId, units, subtotal, badge, toast, waLink, boot };
})();
