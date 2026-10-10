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
   Las hojas de palmera del papel pintado del mostrador, dibujadas a medida.
   Un nervio central curvo y foliolos puntiagudos a cada lado.              */
function frond({ h = 260, w = 150, n = 13, fill = true } = {}) {
  const cx = w / 2, out = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const y = h - 26 - t * (h - 46);
    const len = (cx - 4) * Math.pow(Math.sin(Math.PI * (.22 + t * .72)), .85) * (1 - t * .25) + 4;
    const rise = len * .5 + 4, wd = 4 + len * .09;
    [-1, 1].forEach(s => {
      const x2 = cx + s * len, y2 = y - rise;
      out.push(`<path d="M${cx} ${y} C ${cx + s * len * .3} ${y - wd - 2}, ${cx + s * len * .7} ${y2 - wd}, ${x2} ${y2}
        C ${cx + s * len * .74} ${y2 + wd * .9}, ${cx + s * len * .34} ${y + wd * .7}, ${cx} ${y + 2} Z"/>`);
    });
  }
  const rib = `<path class="rib" fill="none" stroke="currentColor" stroke-width="2" d="M${cx} ${h} C ${cx - 5} ${h * .6} ${cx + 5} ${h * .3} ${cx} 12"/>`;
  return `<g class="sway" ${fill ? 'fill="currentColor"' : ''}>${rib}${out.join('')}</g>`;
}

function foliage(sec, specs) {
  if (!sec) return;
  const layer = document.createElement('div');
  layer.className = 'foliage';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = specs.map(s =>
    `<svg viewBox="0 0 150 260" style="${s.css}">${frond({ n: s.n || 13 })}</svg>`).join('');
  sec.prepend(layer);
}

/* Un balanceo lento, desde la base, como si entrara aire por la puerta */
function sway(svg, amp = 2.4) {
  const g = $('.sway', svg);
  if (!g || REDUCED || !GS) return;
  gsap.to(g, {
    rotation: (Math.random() < .5 ? -1 : 1) * gsap.utils.random(amp * .6, amp),
    svgOrigin: '75 260', duration: gsap.utils.random(3.6, 5.8), ease: 'sine.inOut',
    yoyo: true, repeat: -1, delay: gsap.utils.random(0, 2)
  });
}

function animarFoliage() {
  $$('.foliage').forEach(layer => {
    const svgs = $$('svg', layer);
    svgs.forEach(s => sway(s, 2.2));
    if (!GS || REDUCED || !window.ScrollTrigger || !layer.parentElement.matches('section, .hero, footer')) return;
    svgs.forEach((s, i) => gsap.fromTo(s,
      { yPercent: i % 2 ? 8 : -8 }, { yPercent: i % 2 ? -8 : 8, ease: 'none',
        scrollTrigger: { trigger: layer.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  });
}

/* El papel pintado: dos hojas cruzadas repetidas en una baldosa que se
   pone de fondo (--wall). Verde muy oscuro sobre negro, apenas se nota.    */
function wallpaper() {
  const W = 480;
  const leaf = (x, y, r, k) => [-W, 0, W].flatMap(dx => [-W, 0, W].map(dy =>
    `<g transform="translate(${x + dx} ${y + dy}) rotate(${r}) scale(${k}) translate(-75 -260)">${frond({ n: 11 })}</g>`)).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}"><g fill="#2c5237" fill-opacity=".3" stroke="#2c5237" stroke-opacity=".3">
    ${leaf(130, 280, -28, 1.05)}${leaf(350, 460, 36, 1.15)}${leaf(400, 120, 160, .85)}${leaf(40, 60, 200, .8)}</g></svg>`;
  document.documentElement.style.setProperty('--wall', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
}

/* ============================================================ luz y papel */
/* Bombillas colgantes del techo: cada spec es {x (%), len (px), t, d, a} */
function lamps(host, specs) {
  if (!host) return;
  host.insertAdjacentHTML('beforeend', specs.map(s => `
    <div class="lamp ${s.c || ''}" aria-hidden="true" style="left:${s.x}%;--len:${s.len}px;--t:${s.t || 6}s;--d:${s.d || 0}s;--a:${s.a || 2.4}deg">
      <i class="lamp__cord"></i><span class="lamp__cap"></span><span class="lamp__halo"></span><span class="lamp__globe" style="animation-delay:${(s.d || 0) * 2.1}s"></span>
    </div>`).join(''));
}

/* La guirnalda de estrellas que cuelga del techo del local */
function fairy(host) {
  if (!host) return;
  const star = (x, y, r) => `<polygon class="star" style="animation-delay:${(Math.random() * 3).toFixed(2)}s" points="${
    [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4 - Math.PI / 2, d = i % 2 ? r * .38 : r; return `${(x + Math.cos(a) * d).toFixed(1)},${(y + Math.sin(a) * d).toFixed(1)}`; }).join(' ')}"/>`;
  const hang = [[.05, 46], [.13, 78], [.22, 52], [.31, 92], [.41, 60], [.5, 84], [.6, 50], [.69, 96], [.79, 62], [.88, 80], [.96, 48]];
  const W = 1000, wire = x => 18 + Math.sin(x / W * Math.PI * 3.2) * 10;
  host.innerHTML = `<svg viewBox="0 0 ${W} 150" preserveAspectRatio="none" aria-hidden="true">
    <path class="wire" d="M0 ${wire(0)} ${Array.from({ length: 41 }, (_, i) => `L${i * 25} ${wire(i * 25)}`).join(' ')}"/>
    ${hang.map(([p, l]) => { const x = p * W, y = wire(x); return `<line class="str" x1="${x}" y1="${y}" x2="${x}" y2="${y + l}"/>${star(x, y + l + 8, 9)}`; }).join('')}</svg>`;
}

/* Separador a tiza: se traza al llegar y brilla una estrella en medio */
function chalkMarkup() {
  return `<svg viewBox="0 0 240 18" aria-hidden="true">
    <path class="l l1" d="M2 10 C 26 4, 50 15, 84 9 S 100 9, 100 9"/>
    <path class="st" d="M120 1 L122.8 7 L129 9 L122.8 11 L120 17 L117.2 11 L111 9 L117.2 7Z"/>
    <path class="l l2" d="M140 9 S 140 9, 156 9 C 190 15, 214 4, 238 10"/></svg>`;
}
function chalks() {
  $$('.chalk').forEach(el => {
    if (el.dataset.built) return;
    el.dataset.built = '1';
    el.innerHTML = chalkMarkup();
    if (!GS || REDUCED) return;
    const ls = $$('path.l', el), st = $('.st', el);
    ls.forEach(p => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(st, { scale: 0, opacity: 0 });
    onView(el, () => {
      gsap.to(ls, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' });
      gsap.to(st, { scale: 1, opacity: 1, duration: .6, ease: 'back.out(3)', delay: .45 });
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
    onView(h, () => gsap.to(inner, { yPercent: 0, duration: 1.05, ease: 'power4.out', stagger: .08 }));
  });
}

function eyebrows() { $$('.eyebrow').forEach(e => onView(e, () => e.classList.add('in'))); }

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
  $$('.shoplink__v, .shophero__v, .collage__a, .collage__b, .collage__c, .contact__ph img').forEach((el, i) => {
    const m = $('video, img', el);
    gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
    if (m) gsap.set(m, { scale: 1.2 });
    onView(el, () => {
      gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut', delay: (i % 3) * .1, clearProps: 'clipPath' });
      if (m) gsap.to(m, { scale: 1, duration: 1.6, ease: 'power3.out', clearProps: 'transform' });
    });
  });
}

/* El cable de la bombilla: una línea ámbar que avanza con el scroll */
function progress() {
  const bar = $('#progress i');
  if (!bar) return;
  let raf = 0;
  const pinta = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(pinta); }, { passive: true });
  addEventListener('resize', pinta);
  pinta();
}

/* Los vídeos solo corren mientras se ven */
function videos() {
  const vs = $$('video[autoplay]');
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause();
  }), { threshold: .12 });
  vs.forEach(v => io.observe(v));
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

/* «Abierto ahora» según la hora de Alicante. Los horarios salen de CONFIG.abre
   (los cambia el panel de administración): { semana: ['08:00','22:00'], dom: [...] | null } */
function estado() {
  const el = $('#status');
  if (!el) return;
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
    .formatToParts(new Date()).map(x => [x.type, x.value]));
  const DIAS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const NOMBRES = ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado'];
  const hoy = DIAS.indexOf(p.weekday);
  const hh = (+p.hour % 24) + (+p.minute) / 60;
  const num = s => { const [h, m] = s.split(':').map(Number); return h + (m || 0) / 60; };
  const rango = d => { const r = d === 0 ? CONFIG.abre.dom : CONFIG.abre.semana; return r ? { a: num(r[0]), c: num(r[1]), ta: r[0], tc: r[1] } : null; };
  const r = rango(hoy);
  const abierto = r && hh >= r.a && hh < r.c;
  let txt;
  if (abierto) txt = `Abierto ahora · hasta las ${r.tc}`;
  else if (r && hh < r.a) txt = `Abrimos hoy a las ${r.ta}`;
  else {
    let k = 1, s = null;
    while (k <= 7 && !(s = rango((hoy + k) % 7))) k++;
    txt = s ? `Cerrado · abrimos ${k === 1 ? 'mañana' : NOMBRES[(hoy + k) % 7]} a las ${s.ta}` : 'Cerrado';
  }
  el.className = 'status ' + (abierto ? 'open' : 'closed');
  $('span', el).textContent = txt;
}

/* Aviso arriba del todo («Cerrado por vacaciones…»): lo escribe el dueño en el panel */
function aviso() {
  const t = (CONFIG.aviso || '').trim();
  if (!t || $('.aviso')) return;
  const d = document.createElement('div');
  d.className = 'aviso';
  d.setAttribute('role', 'status');
  d.textContent = t;
  document.body.prepend(d);
  document.documentElement.classList.add('has-aviso');
}

/* ================================================================== navbar */
function nav() {
  const bar = $('#nav'), burger = $('#burger'), menu = $('#menu');
  if (!bar) return;

  const onScroll = () => bar.classList.toggle('stuck', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (!menu || !burger) return;
  foliage(menu, [
    { css: 'bottom:-6%;right:-2%;width:min(34vw,300px);transform:rotate(-12deg)', n: 14 },
    { css: 'top:4%;right:26%;width:min(16vw,150px);transform:rotate(190deg)', n: 10 }
  ]);
  $$('.foliage svg', menu).forEach(s => sway(s, 3));

  const toggle = force => {
    const open = force ?? !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    if (open && GS && !REDUCED) gsap.fromTo($$('.menu__list li, .menu__foot > *', menu),
      { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .05, ease: 'power3.out', delay: .25 });
  };
  burger.addEventListener('click', () => toggle());
  $$('#menu a').forEach(a => a.addEventListener('click', () => toggle(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) toggle(false);
  });
}

/* ==================================================== ilustraciones tienda
   Dibujos a tiza para lo que aún no tiene foto.                            */
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
       stroke="rgba(245,176,76,.85)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="120" height="160" fill="#23211e" stroke="none"/>
    <g style="filter:url(#rough)">${DRAW[g] || DRAW.caja}</g></svg>`;

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
  wallpaper();
  fillContact();
  aviso();
  estado();
  nav();
  chalks();
  words();
  eyebrows();
  reveals();
  mediaReveal();
  animarFoliage();
  progress();
  videos();
  badge();
  addEventListener('load', () => window.ScrollTrigger?.refresh());
}

return { $, $$, REDUCED, FINE, GS, eur, onView, frond, foliage, sway, lamps, fairy, chalks,
         svgFor, cart, save, byId, units, subtotal, badge, toast, waLink, boot };
})();
