/* =========================================================================
   La Porteña — tienda online
   ========================================================================= */
(() => {
'use strict';
const { $, $$, REDUCED, FINE, GS, eur, svgFor, waLink, toast, badge, byId, units, subtotal,
        cart, save, foliage, onView } = LP;

const hayRecogidaObligatoria = () => Object.keys(cart).some(id => byId(id)?.pickupOnly);

/* ------------------------------------------------------------ las plantas */
foliage($('#shopHero'), [
  { css: 'top:-6%;right:-4%;width:260px;transform:rotate(166deg)', n: 15 },
  { css: 'bottom:-10%;left:-4%;width:220px;transform:rotate(-12deg)', n: 13 }
]);
foliage($('#catalogo'), [
  { css: 'top:2%;right:-5%;width:230px;transform:rotate(170deg)', n: 14 },
  { css: 'top:38%;left:-6%;width:220px;transform:rotate(-14deg)', n: 13 },
  { css: 'bottom:2%;right:-4%;width:240px;transform:rotate(190deg)', n: 14 }
]);
foliage($('#envios'), [
  { css: 'bottom:-10%;left:-3%;width:200px;transform:rotate(14deg)', n: 12 }
]);

/* --------------------------------------------------------------- catálogo */
function pintarTienda() {
  $('#shopbar').innerHTML = SECCIONES
    .map((s, i) => `<button data-go="${s.id}"${i ? '' : ' class="on"'}>${s.t}</button>`).join('');

  $('#shopBody').innerHTML = SECCIONES.map(sec => {
    const items = PRODUCTOS.filter(p => p.s === sec.id);
    if (!items.length) return '';
    const soloRecogida = items.every(p => p.pickupOnly);
    return `
      <section class="shopsec" id="${sec.id}">
        <div class="shopsec__h"><h2>${sec.t}</h2><p>${sec.d}</p></div>
        <div class="sprig shopsec__r" aria-hidden="true"></div>
        ${soloRecogida ? `
          <span class="pickupnote">
            <svg viewBox="0 0 24 24"><path d="M3 10h18M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9"/></svg>
            Solo recogida en tienda — recién hecho, no viaja bien
          </span>` : ''}
        <div class="grid">${items.map(ficha).join('')}</div>
      </section>`;
  }).join('');

  navTienda();
  engancharAñadir();
  inclinar();

  if (GS && !REDUCED) $$('.shopsec').forEach(sec => {
    const cards = $$('.card', sec);
    gsap.set(cards, { opacity: 0, y: 40 });
    onView(sec, () => gsap.to(cards, { opacity: 1, y: 0, duration: .75, stagger: .04,
      ease: 'power3.out', clearProps: 'transform' }), '0px 0px -8% 0px');
  });
}

function ficha(p) {
  const media = p.i ? `<img src="${p.i}" alt="${p.n}" loading="lazy">` : svgFor(p.g);
  const pie = p.p === null
    ? `<div class="card__f card__f--ask">
         <a class="ask" target="_blank" rel="noopener"
            href="${waLink(`Hola, quería preguntar el precio de: ${p.n}${p.v ? ' (' + p.v + ')' : ''}.`)}">Preguntar precio</a>
       </div>`
    : `<div class="card__f">
         <span class="card__p">${eur(p.p)}</span>
         <button class="add" data-add="${p.id}" aria-label="Añadir ${p.n} al carrito">
           <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
         </button>
       </div>`;
  const sello = p.pickupOnly ? 'Recogida' : p.p === null ? 'Precio en breve' : '';
  return `
    <article class="card" data-id="${p.id}">
      <div class="card__fig">${media}${sello ? `<span class="card__badge">${sello}</span>` : ''}</div>
      <div class="card__b">
        <h3 class="card__n">${p.n}</h3>
        ${p.v ? `<p class="card__v">${p.v}</p>` : ''}
        ${pie}
      </div>
    </article>`;
}

/* Las fichas se inclinan hacia el cursor, como al coger un paquete */
function inclinar() {
  if (!GS || REDUCED || !FINE) return;
  $$('.card').forEach(c => {
    const rx = gsap.quickTo(c, 'rotationX', { duration: .5, ease: 'power3' });
    const ry = gsap.quickTo(c, 'rotationY', { duration: .5, ease: 'power3' });
    gsap.set(c, { transformPerspective: 900 });
    c.addEventListener('pointerenter', () => gsap.to(c, { y: -6, duration: .4, ease: 'power3.out' }));
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      ry(px * 9); rx(-py * 9);
    });
    c.addEventListener('pointerleave', () => {
      rx(0); ry(0);
      gsap.to(c, { y: 0, duration: .7, ease: 'elastic.out(1,.5)' });
    });
  });
}

function navTienda() {
  const bar = $('#shopbar');
  bar.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (!b) return;
    $('#' + b.dataset.go)?.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
  });
  const obs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    $$('button', bar).forEach(b => b.classList.toggle('on', b.dataset.go === e.target.id));
    $('button.on', bar)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('.shopsec').forEach(s => obs.observe(s));
}

/* ---------------------------------- la microanimación: vuela al carrito */
function volarAlCarrito(card) {
  if (REDUCED || !GS) return;
  const fig = $('.card__fig', card);
  const desde = fig.getBoundingClientRect();
  const dest  = $('#cartBtn').getBoundingClientRect();

  const fly = document.createElement('div');
  fly.className = 'flyer';
  fly.innerHTML = fig.innerHTML.replace(/<span class="card__badge">[\s\S]*?<\/span>/, '');
  Object.assign(fly.style, { left: desde.left + 'px', top: desde.top + 'px',
    width: desde.width + 'px', height: desde.height + 'px' });
  document.body.appendChild(fly);

  const dx = (dest.left + dest.width / 2) - (desde.left + desde.width / 2);
  const dy = (dest.top + dest.height / 2) - (desde.top + desde.height / 2);

  gsap.timeline({ onComplete: () => fly.remove() })
    .to(fly, { scale: .52, rotation: -12, duration: .22, ease: 'power2.out' })
    .to(fly, { x: dx * .55, y: dy - 110, duration: .42, ease: 'power2.out' }, 0)
    .to(fly, { x: dx, y: dy, scale: .06, rotation: 40, opacity: .25, duration: .4, ease: 'power2.in' }, '>-.02');
  gsap.fromTo('#cartBtn', { scale: 1 }, { scale: 1.12, duration: .16, yoyo: true, repeat: 1, delay: .78 });
}

function engancharAñadir() {
  $$('[data-add]').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.add, p = byId(id);
    cart[id] = (cart[id] || 0) + 1;
    save();
    volarAlCarrito(btn.closest('.card'));
    setTimeout(() => badge(true), REDUCED ? 0 : 820);
    btn.classList.add('done');
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    setTimeout(() => {
      btn.classList.remove('done');
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>';
    }, 1300);
    toast(`${p.n} · añadido al pedido`);
    if ($('#panel').classList.contains('on')) pintarPanel();
  }));
}

/* ------------------------------------------------------------------ panel */
let entrega = 'recogida';
const FORM = {};
const campos = ['fecha', 'franja', 'cp', 'nom', 'tel', 'dir', 'nota'];
const guardarForm   = () => campos.forEach(k => { const el = $('#' + k); if (el) FORM[k] = el.value; });
const restaurarForm = () => campos.forEach(k => { const el = $('#' + k); if (el && FORM[k]) el.value = FORM[k]; });

function abrirPanel(abrir) {
  $('#panel').classList.toggle('on', abrir);
  $('#scrim').classList.toggle('on', abrir);
  $('#panel').setAttribute('aria-hidden', String(!abrir));
  document.body.classList.toggle('no-scroll', abrir);
  if (abrir) pintarPanel(true);
}

function pintarPanel(entrada = false) {
  guardarForm();
  const body = $('#panelBody'), foot = $('#panelFoot');
  const ids = Object.keys(cart);

  if (!ids.length) {
    body.innerHTML = `
      <div class="empty">
        <svg viewBox="0 0 24 24"><path d="M3 5h2.2l2.1 10.4a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.5L20.5 8H6.2"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></svg>
        <p>Tu pedido está vacío.</p>
        <p style="font-size:.88rem">Empieza por las yerbas, que es lo que más sale.</p>
      </div>`;
    foot.innerHTML = `<button class="btn btn--green wide" id="seguir">Ver la tienda</button>`;
    $('#seguir').addEventListener('click', () => abrirPanel(false));
    badge();
    return;
  }

  body.innerHTML = ids.map(id => {
    const p = byId(id), q = cart[id];
    return `
      <div class="line">
        <div class="line__i">${p.i ? `<img src="${p.i}" alt="">` : svgFor(p.g)}</div>
        <div>
          <div class="line__n">${p.n}</div>
          ${p.v ? `<div class="line__v">${p.v}</div>` : ''}
          <div class="line__p">${eur(p.p)} · ${eur(p.p * q)}</div>
        </div>
        <div class="qty">
          <button data-less="${id}" aria-label="Quitar uno">−</button>
          <span>${q}</span>
          <button data-more="${id}" aria-label="Añadir uno">+</button>
        </div>
      </div>`;
  }).join('') + bloqueEntrega();

  foot.innerHTML = `
    <div class="totals">
      <div><span>Productos (${units()})</span><span>${eur(subtotal())}</span></div>
      <div><span>Envío</span><span>${entrega === 'recogida' ? 'Gratis' : 'Según transporte'}</span></div>
      <div class="tot"><span>Total</span><span>${eur(subtotal())}${entrega === 'envio' ? ' + envío' : ''}</span></div>
    </div>
    <button class="btn btn--green wide" id="send">Enviar el pedido</button>
    <p class="hint" style="margin:12px 0 0;text-align:center">
      Te confirmamos disponibilidad ${entrega === 'envio' ? 'y el coste exacto del envío ' : ''}antes de cobrar nada.
    </p>`;

  engancharPanel();
  badge();
  if (entrada && GS && !REDUCED) gsap.from($$('.line', body),
    { opacity: 0, x: 30, duration: .5, stagger: .06, ease: 'power3.out', delay: .2 });
}

function bloqueEntrega() {
  const bloqueado = hayRecogidaObligatoria();
  if (bloqueado) entrega = 'recogida';
  const hoy = new Date();
  const min = new Date(hoy.getTime() + 864e5).toISOString().slice(0, 10);
  const max = new Date(hoy.getTime() + 30 * 864e5).toISOString().slice(0, 10);

  return `
    <h4 style="margin:26px 0 10px;font-size:.74rem;letter-spacing:.18em;text-transform:uppercase;color:var(--forest-2);font-weight:400">Cómo lo recibes</h4>
    <div class="choices">
      <label class="choice${entrega === 'recogida' ? ' on' : ''}">
        <input type="radio" name="entrega" value="recogida" ${entrega === 'recogida' ? 'checked' : ''}>
        <span><b>Recoger en tienda · gratis</b>
          <small>${CONFIG.direccion}, ${CONFIG.ciudad}. Eliges tú el día.</small></span>
      </label>
      <label class="choice${entrega === 'envio' ? ' on' : ''}" style="${bloqueado ? 'opacity:.5' : ''}">
        <input type="radio" name="entrega" value="envio" ${entrega === 'envio' ? 'checked' : ''} ${bloqueado ? 'disabled' : ''}>
        <span><b>Envío a domicilio · España</b>
          <small>${bloqueado
            ? 'Tu pedido lleva productos de pastelería o almacén que solo se recogen en tienda.'
            : 'El coste y el plazo los pone la empresa de transporte según peso y destino. Te pasamos el importe exacto antes de cobrar.'}</small></span>
      </label>
    </div>
    ${entrega === 'recogida' ? `
      <div class="row2">
        <div class="field"><label for="fecha">Día de recogida</label>
          <input type="date" id="fecha" min="${min}" max="${max}" value="${FORM.fecha || min}"></div>
        <div class="field"><label for="franja">Franja</label><select id="franja"></select></div>
      </div>` : `
      <div class="field"><label for="cp">Código postal</label>
        <input type="text" id="cp" inputmode="numeric" maxlength="5" placeholder="03001"></div>
      <p class="hint">Envíos a península. Plazo habitual de la transportista: 24–72 h laborables desde que sale el pedido.</p>`}
    <div class="field"><label for="nom">Tu nombre</label>
      <input type="text" id="nom" placeholder="Nombre y apellido" autocomplete="name"></div>
    <div class="field"><label for="tel">Teléfono</label>
      <input type="tel" id="tel" placeholder="600 000 000" autocomplete="tel"></div>
    ${entrega === 'envio' ? `
      <div class="field"><label for="dir">Dirección completa</label>
        <textarea id="dir" rows="2" placeholder="Calle, número, piso, ciudad"></textarea></div>` : ''}
    <div class="field"><label for="nota">Algo que debamos saber</label>
      <input type="text" id="nota" placeholder="Opcional"></div>`;
}

/* Los domingos solo abrimos por la mañana */
function pintarFranjas() {
  const f = $('#franja'), d = $('#fecha');
  if (!f || !d) return;
  const domingo = new Date(d.value + 'T12:00:00').getDay() === 0;
  const op = domingo ? ['09:00 – 14:00'] : ['09:00 – 13:00', '13:00 – 17:00', '17:00 – 21:30'];
  f.innerHTML = op.map(o => `<option>${o}</option>`).join('');
}

function engancharPanel() {
  $$('[data-more]').forEach(b => b.addEventListener('click', () => { cart[b.dataset.more]++; save(); pintarPanel(); }));
  $$('[data-less]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.less;
    if (--cart[id] <= 0) delete cart[id];
    save(); pintarPanel();
  }));
  $$('input[name="entrega"]').forEach(r => r.addEventListener('change', () => { entrega = r.value; pintarPanel(); }));
  const d = $('#fecha');
  if (d) { pintarFranjas(); d.addEventListener('change', () => { FORM.fecha = d.value; pintarFranjas(); }); }
  restaurarForm();
  const pb = $('#panelBody');
  if (!pb.dataset.bound) { pb.addEventListener('input', guardarForm); pb.dataset.bound = '1'; }
  $('#send')?.addEventListener('click', enviar);
}

/* ------------------------------------------------------- pedido a WhatsApp */
function enviar() {
  const v = id => ($('#' + id)?.value || '').trim();
  if (!v('nom') || !v('tel')) { toast('Pon tu nombre y un teléfono para poder avisarte'); return; }
  if (entrega === 'envio' && !v('dir')) { toast('Falta la dirección de envío'); return; }

  const fechaLarga = f => {
    const d = new Date(f + 'T12:00:00');
    return isNaN(d) ? f : d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  const lineas = Object.entries(cart).map(([id, q]) => {
    const p = byId(id);
    return `• ${q} × ${p.n}${p.v ? ` (${p.v})` : ''} — ${eur(p.p * q)}`;
  }).join('\n');
  const entregaTxt = entrega === 'recogida'
    ? `Recojo en tienda el ${fechaLarga(v('fecha'))}, franja ${v('franja')}.`
    : `Envío a domicilio.\nCP: ${v('cp') || '—'}\nDirección: ${v('dir')}`;

  const txt =
`Hola La Porteña, quería hacer este pedido:

${lineas}

Productos: ${eur(subtotal())}
${entregaTxt}

Nombre: ${v('nom')}
Teléfono: ${v('tel')}${v('nota') ? `\nNota: ${v('nota')}` : ''}${
  entrega === 'envio' ? '\n\n¿Me confirmáis el coste del envío?' : ''}`;

  window.open(waLink(txt), '_blank', 'noopener');
  toast('Abrimos WhatsApp para que lo confirmes');
}

/* ----------------------------------------------------------------- arranque */
pintarTienda();
LP.boot();

$('#cartBtn').addEventListener('click', e => { e.preventDefault(); abrirPanel(true); });
$('#panelX').addEventListener('click', () => abrirPanel(false));
$('#scrim').addEventListener('click', () => abrirPanel(false));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#panel').classList.contains('on')) abrirPanel(false);
});
})();
