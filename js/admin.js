/* =========================================================================
   La Porteña — panel de control
   Lee js/data.js, deja editarlo con botones y formularios y lo vuelve a escribir.
   Al publicar hace UN commit en GitHub (data.js + las fotos nuevas) y GitHub
   Pages actualiza la web en uno o dos minutos. No hay servidor propio.
   ========================================================================= */
(() => {
'use strict';

/* ← dónde vive la web. Si se cambia de repositorio, se cambia aquí. */
const REPO = { owner: 'MakeWeb0', repo: 'la-portena-cafe', branch: 'main' };
const CLAVE = 'lp.admin.clave';
const PRUEBA = '1234';        // contraseña de entrada al modo prueba (no publica nada)
const NOMBRES = ['CONFIG', 'PROMOS', 'CARTA', 'SECCIONES', 'PRODUCTOS', 'RESENAS', 'DESTACADOS'];

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let D = null;                 // los datos que se editan
let base = '';                // cómo estaban al cargar / publicar (para saber si hay cambios)
let token = '';               // clave de acceso (token de GitHub)
let demo = false;             // modo prueba: no publica, descarga
let pestana = 'inicio';
let cartaTab = 0;             // sección de carta abierta
let tiendaSec = 'todos';      // sección de tienda filtrada
let siguienteFoco = null;
let hist = [];                // fotos fijas del estado anterior, para «Deshacer»
const fotos = new Map();      // ruta → { dataUrl, b64 }  (fotos nuevas aún sin publicar)


/* ---------------------------------------------------------------- iconos
   Dibujos de línea (misma familia que usa el resto de la web), sin emojis. */
const IC = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  utensils: '<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10"/><path d="M17 21V3c-2 1-4 4-4 8h4"/>',
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2.4l2.3 11h10l2-8H6.2"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  megaphone: '<path d="M4 10v4h3l8 4V6L7 10H4z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
  euro: '<path d="M17 6.5a6.5 6.5 0 1 0 0 11"/><path d="M4 10h9M4 14h9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0 4.9 4.9l-9.4 9.4a2 2 0 0 1-3-3l9.4-9.4a4 4 0 0 1-1.9-1.9z"/>',
  sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17v4M17 19h4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
  trash: '<path d="M4 7h16M10 3h4M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  left: '<path d="M15 6l-6 6 6 6"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
  percent: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="17" r="2.2"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5H5V6h5"/>'
};
const ic = n => `<svg class="ic ic--${n}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;

/* ---------------------------------------------------------------- avisos */
function toast(msg, tipo = '', ms = 4200, accion = null) {
  const t = document.createElement('div');
  t.className = 'toast ' + tipo;
  const s = document.createElement('span'); s.textContent = msg; t.appendChild(s);
  if (accion) {
    const b = document.createElement('button');
    b.textContent = accion.txt; b.className = 'toast__b';
    b.onclick = () => { accion.fn(); t.remove(); };
    t.appendChild(b);
  }
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), ms);
}

/* ----------------------------------------------------- acceso a los datos */
const get = (o, ruta) => ruta.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
function poner(o, ruta, v) {
  const ks = ruta.split('.');
  const ult = ks.pop();
  (ks.length ? get(o, ks.join('.')) : o)[ult] = v;
}
const mover = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return false; [arr[i], arr[j]] = [arr[j], arr[i]]; return true; };
const parsear = txt => new Function(txt + ';return {' + NOMBRES.join(',') + '};')();

/* ------------------------------------------------------------ GitHub (API) */
async function api(ruta, opt = {}) {
  const r = await fetch('https://api.github.com' + ruta, {
    ...opt,
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(opt.headers || {}) }
  });
  if (!r.ok) { const e = new Error('GitHub ' + r.status); e.status = r.status; try { e.detalle = (await r.json()).message; } catch {} throw e; }
  return r.status === 204 ? null : (opt.raw ? r.text() : r.json());
}
const repoUrl = `/repos/${REPO.owner}/${REPO.repo}`;

async function cargar() {
  let txt;
  if (token && !demo) {
    // directo del repositorio: así se ve lo último aunque la web aún no se haya reconstruido
    txt = await api(`${repoUrl}/contents/js/data.js?ref=${REPO.branch}`, { raw: true, headers: { Accept: 'application/vnd.github.raw+json' } });
  } else {
    const r = await fetch('js/data.js?v=' + Date.now());
    if (!r.ok) throw new Error('No se pudo leer js/data.js');
    txt = await r.text();
  }
  D = parsear(txt);
  D.CONFIG.aviso = D.CONFIG.aviso || '';
  D.CONFIG.abre = D.CONFIG.abre || { semana: ['08:00', '22:00'], dom: ['09:00', '14:00'] };
  base = JSON.stringify(D);
  hist = [];
}

async function subir(texto) {
  const ref = await api(`${repoUrl}/git/ref/heads/${REPO.branch}`);
  const commitBase = await api(`${repoUrl}/git/commits/${ref.object.sha}`);

  const entradas = [];
  const blobDatos = await api(`${repoUrl}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: texto, encoding: 'utf-8' }) });
  entradas.push({ path: 'js/data.js', mode: '100644', type: 'blob', sha: blobDatos.sha });

  // solo las fotos que siguen en uso
  const usadas = new Set(D.PRODUCTOS.map(p => p.i).filter(Boolean));
  for (const [ruta, f] of fotos) {
    if (!usadas.has(ruta)) continue;
    const b = await api(`${repoUrl}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: f.b64, encoding: 'base64' }) });
    entradas.push({ path: ruta, mode: '100644', type: 'blob', sha: b.sha });
  }

  const arbol = await api(`${repoUrl}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: commitBase.tree.sha, tree: entradas }) });
  const nuevo = await api(`${repoUrl}/git/commits`, { method: 'POST', body: JSON.stringify({
    message: 'Cambios desde el panel de control', tree: arbol.sha, parents: [ref.object.sha] }) });
  await api(`${repoUrl}/git/refs/heads/${REPO.branch}`, { method: 'PATCH', body: JSON.stringify({ sha: nuevo.sha }) });
}

function descargar(nombre, texto) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([texto], { type: 'text/javascript' }));
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* --------------------------------------------------------------- estado */
const haySinPublicar = () => JSON.stringify(D) !== base;

function refrescar() {
  const s = haySinPublicar();
  const e = $('#estado');
  e.className = 'estado' + (s ? ' sucio' : '');
  $('span', e).textContent = s ? 'Cambios sin publicar' : 'Todo publicado';
  ['#pub', '#pub2'].forEach(id => { const b = $(id); b.disabled = !s; b.classList.toggle('listo', s); b.textContent = id === '#pub2' ? (demo ? 'Descargar' : 'Publicar ahora') : (demo ? 'Descargar data.js' : 'Publicar cambios'); });
  $('#barra').hidden = !s;
  $('#undo').disabled = !hist.length;
  document.body.classList.toggle('con-barra', s);
}

/* Foto fija antes de quitar/mover algo, para poder «Deshacer» */
function guardarHist() { hist.push(JSON.stringify(D)); if (hist.length > 30) hist.shift(); }
function deshacer() {
  if (!hist.length) return;
  D = JSON.parse(hist.pop());
  sincronizar(); pintar(); refrescar();
  toast('Deshecho.', 'ok', 1800);
}

/* Que lo escrito a mano quede bien: «1.5» → «1,50 €» */
function precio(v) {
  const t = v.trim();
  if (/^\d+([.,]\d{1,2})?$/.test(t)) {
    const n = parseFloat(t.replace(',', '.'));
    return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }
  return t;
}
const coma = n => n.toFixed(2).replace('.', ',');

/* Sube o baja un porcentaje todos los números de un precio («3 € / 6 €» también) */
function ajustarPrecio(txt, pct) {
  return txt.replace(/\d+(?:[.,]\d+)?/g, m => {
    const v = parseFloat(m.replace(',', '.')) * (1 + pct / 100);
    const r = Math.round(v * 10) / 10;
    return /[.,]/.test(m) || r % 1 ? coma(r) : String(r);
  });
}

/* Cosas que se calculan solas a partir de lo que escribe el dueño */
function sincronizar() {
  const C = D.CONFIG, a = C.abre;
  const txt = r => r ? `${r[0]} – ${r[1]}` : 'Cerrado';
  C.horario = [{ d: 'Lunes a sábado', h: txt(a.semana) }, { d: 'Domingo', h: txt(a.dom) }];
  const tel = (C.telefono || '').replace(/\D/g, '');
  C.telHref = tel ? (tel.length === 9 ? '+34' + tel : '+' + tel) : '';
  C.whatsapp = (C.whatsapp || '').replace(/\D/g, '');
}

/* ----------------------------------------------------------------- vistas */
const campoTxt = (etq, ruta, extra = '') => `
  <div class="campo"><label>${etq}</label>
    <input type="text" data-p="${ruta}" value="${esc(get(D, ruta))}" ${extra}></div>`;

const interruptor = (attrs, marcado, etq, cls = '') => `
  <label class="sw ${cls}"><input type="checkbox" ${attrs} ${marcado ? 'checked' : ''}><i></i><span>${etq}</span></label>`;

const ayuda = txt => `<p class="guia">${txt}</p>`;

function botonesFila(tipo, i, n, g = '') {
  return `<span class="btns">
    <button class="ib" data-act="${tipo}Up" data-a="${i}" data-b="${g}" ${i === 0 ? 'disabled' : ''} title="Subir" aria-label="Subir">${ic('up')}</button>
    <button class="ib" data-act="${tipo}Down" data-a="${i}" data-b="${g}" ${i === n - 1 ? 'disabled' : ''} title="Bajar" aria-label="Bajar">${ic('down')}</button>
    <button class="ib ib--x" data-act="${tipo}Del" data-a="${i}" data-b="${g}" title="Quitar" aria-label="Quitar">${ic('x')}</button></span>`;
}

/* ---- INICIO: botones grandes con lo más habitual ---- */
function vistaInicio() {
  const t = (icono, titulo, sub, ir) => `<button class="tile" data-act="ir" data-ir="${ir}"><i>${ic(icono)}</i><b>${titulo}</b><small>${sub}</small></button>`;
  return `
  <section class="bienvenida">
    <h1>¿Qué quieres hacer hoy?</h1>
    <p>Pulsa lo que necesites. Cuando termines, dale a <b>Publicar</b> y en un par de minutos está en la web.</p>
  </section>
  <div class="tiles">
    ${t('megaphone', 'Poner un aviso', 'Cerrado por vacaciones, obras, festivo…', 'aviso')}
    ${t('clock', 'Cambiar el horario', 'Cuándo abrimos y cerramos', 'horario')}
    ${t('euro', 'Cambiar un precio', 'Busca el plato y cámbialo', 'precio')}
    ${t('plus', 'Añadir un plato', 'A la carta, con su precio', 'plato')}
    ${t('cart', 'Producto de la tienda', 'Precio, foto o «agotado»', 'tienda')}
    ${t('camera', 'Poner una foto', 'A un producto de la tienda', 'foto')}
    ${t('star', 'Reseñas', 'Añadir o quitar reseñas de Google', 'resenas')}
    ${t('pin', 'Teléfono y dirección', 'WhatsApp, Instagram, promos', 'local')}
  </div>
  <section class="pasos">
    <div><b>1</b><span>Cambia lo que necesites</span></div>
    <div><b>2</b><span>Pulsa <em>Publicar</em> (arriba o abajo)</span></div>
    <div><b>3</b><span>En 1–2 minutos está en la web</span></div>
  </section>`;
}

/* ---- HORARIO Y AVISOS ---- */
const AVISOS = [
  ['sun', 'Cerrado por vacaciones', 'Cerrado por vacaciones del __ al __. ¡Volvemos pronto!'],
  ['wrench', 'Cerrado por obras', 'Cerrado por obras. Disculpa las molestias.'],
  ['sparkles', 'Cerrado por festivo', 'Hoy cerramos por festivo. ¡Mañana abrimos como siempre!'],
  ['clock', 'Horario especial', 'Hoy abrimos en horario especial: de __ a __.']
];

function filaHoras(nombre, clave) {
  const r = D.CONFIG.abre[clave];
  return `<div class="horas">
    <b>${nombre}</b>
    ${interruptor(`data-cerrado="${clave}"`, !!r, 'Abierto', 'sw--abierto')}
    <span class="par ${r ? '' : 'apagado'}">
      <input type="time" data-p="CONFIG.abre.${clave}.0" value="${esc(r?.[0] || '09:00')}" ${r ? '' : 'disabled'} aria-label="Abre">
      <span>a</span>
      <input type="time" data-p="CONFIG.abre.${clave}.1" value="${esc(r?.[1] || '14:00')}" ${r ? '' : 'disabled'} aria-label="Cierra">
    </span></div>`;
}

function vistaHorario() {
  const C = D.CONFIG;
  return `
  ${ayuda('Lo que escribas en el aviso sale en una <b>franja ámbar arriba de toda la web</b>. El horario hace que la portada ponga sola «Abierto ahora» o «Cerrado».')}
  <section class="card"><h2>${ic('megaphone')} Aviso en la web</h2>
    <div class="cuerpo">
      <p class="lbl">Elige uno y cámbialo a tu gusto:</p>
      <div class="chips">
        ${AVISOS.map(([i, n, t]) => `<button class="chip" data-act="avisoPlantilla" data-t="${esc(t)}">${ic(i)} ${n}</button>`).join('')}
      </div>
      <div class="campo"><label>Texto del aviso</label>
        <input type="text" id="aviso" data-p="CONFIG.aviso" value="${esc(C.aviso)}" placeholder="Ej.: Cerrado del 10 al 20 de agosto. ¡Volvemos pronto!"></div>
      ${C.aviso ? '<button class="btn btn--ghost" data-act="avisoQuitar">' + ic('x') + ' Quitar el aviso</button>' : '<p class="ayuda">Ahora mismo no hay ningún aviso en la web.</p>'}
    </div>
  </section>

  <section class="card"><h2>${ic('clock')} Horario</h2>
    <div class="cuerpo">
      ${filaHoras('Lunes a sábado', 'semana')}
      ${filaHoras('Domingo', 'dom')}
      <p class="ayuda">Si un día está en «Cerrado», la web lo dice sola.</p>
    </div>
  </section>`;
}

/* ---- DATOS DEL LOCAL ---- */
function vistaLocal() {
  const C = D.CONFIG;
  return `
  ${ayuda('Estos datos salen en la portada, en «Dónde estamos» y en el pie de la web.')}
  <section class="card"><h2>${ic('phone')} Teléfono y WhatsApp</h2>
    <div class="cuerpo"><div class="dos">
      ${campoTxt('Teléfono (el que se ve en la web)', 'CONFIG.telefono', 'inputmode="tel"')}
      ${campoTxt('WhatsApp donde llegan los pedidos', 'CONFIG.whatsapp', 'inputmode="numeric" placeholder="34600123456"')}
    </div>
    <p class="ayuda">El WhatsApp, con el 34 delante y sin espacios. Si lo cambias, los pedidos de la tienda llegarán a ese número.</p></div>
  </section>

  <section class="card"><h2>${ic('pin')} Dirección y redes</h2>
    <div class="cuerpo"><div class="dos">
      ${campoTxt('Dirección', 'CONFIG.direccion')}
      ${campoTxt('Ciudad', 'CONFIG.ciudad')}
    </div>
    ${campoTxt('Instagram (enlace completo)', 'CONFIG.instagram', 'inputmode="url"')}
    <details><summary class="enlace">Enlaces avanzados (Google Maps y reseñas)</summary>
      <div class="cuerpo" style="margin-top:12px">
        ${campoTxt('Enlace de Google Maps', 'CONFIG.mapa')}
        ${campoTxt('Enlace a las reseñas de Google', 'CONFIG.google')}
      </div></details></div>
  </section>

  <section class="card"><h2>${ic('receipt')} La pizarra de la portada</h2>
    <p class="ayuda">Las promos de la pizarrita junto al vídeo de la portada.</p>
    <div class="cuerpo"><div class="lista">
      ${D.PROMOS.map((p, i) => `
        <div class="fila">
          <input type="text" data-p="PROMOS.${i}.t" value="${esc(p.t)}" placeholder="Ej.: Tapa + caña" aria-label="Promo">
          <input type="text" data-p="PROMOS.${i}.p" data-k="precio" value="${esc(p.p)}" placeholder="4,90 €" aria-label="Precio">
          ${botonesFila('promo', i, D.PROMOS.length)}
        </div>`).join('') || '<p class="vacio">No hay promos todavía.</p>'}
    </div>
    <button class="mas" data-act="promoAdd">${ic('plus')} Añadir promo</button></div>
  </section>`;
}

/* ---- LA CARTA ---- */
function vistaCarta() {
  if (cartaTab >= D.CARTA.length) cartaTab = Math.max(0, D.CARTA.length - 1);
  const fam = D.CARTA[cartaTab];
  const chips = D.CARTA.map((c, i) => `<button class="chip${i === cartaTab ? ' on' : ''}" data-act="cartaSel" data-a="${i}">${esc(c.tab || 'Sin nombre')}</button>`).join('')
    + `<button class="chip chip--nuevo" data-act="cartaAdd">${ic('plus')} Nueva sección</button>`;

  if (!fam) return `<section class="card"><div class="chips">${chips}</div></section>`;
  return `
  ${ayuda('Escribe en el cuadro de abajo para <b>buscar un plato</b>. Para cambiar un precio, toca el precio y escribe el nuevo. Con <b>Intro</b> pasas al siguiente plato.')}
  <section class="card">
    <div class="chips">${chips}</div>
    <div class="cuerpo" style="margin-top:18px">
      <span class="buscar-w">${ic('search')}<input type="search" class="buscar" id="buscar" placeholder="Buscar un plato o bebida…" aria-label="Buscar en la carta"></span>
      <details class="ajustes"><summary class="enlace">Opciones de esta sección («${esc(fam.tab)}»)</summary>
        <div class="grupo__cab" style="margin:12px 0 0">
          <div class="campo"><label>Nombre de la sección</label>
            <input type="text" data-p="CARTA.${cartaTab}.tab" value="${esc(fam.tab)}"></div>
          <span class="btns">
            <button class="ib" data-act="cartaUp" ${cartaTab === 0 ? 'disabled' : ''} title="Mover a la izquierda" aria-label="Mover a la izquierda">${ic('left')}</button>
            <button class="ib" data-act="cartaDown" ${cartaTab === D.CARTA.length - 1 ? 'disabled' : ''} title="Mover a la derecha" aria-label="Mover a la derecha">${ic('right')}</button>
            <button class="ib ib--x" data-act="cartaDel" title="Quitar la sección entera" aria-label="Quitar la sección entera">${ic('x')}</button></span>
        </div></details>
    </div>
  </section>

  ${fam.grupos.map((g, gi) => `
  <section class="card grupo">
    <div class="grupo__cab">
      <div class="campo"><label>Familia</label>
        <input type="text" data-p="CARTA.${cartaTab}.grupos.${gi}.t" value="${esc(g.t)}" placeholder="Ej.: Café, Tartas, Cervezas"></div>
      <span class="btns">
        <button class="ib" data-act="grpPct" data-a="${gi}" title="Subir o bajar todos los precios de esta familia" aria-label="Subir o bajar precios">${ic('percent')}</button>
        <button class="ib" data-act="grpUp" data-a="${gi}" ${gi === 0 ? 'disabled' : ''} title="Subir" aria-label="Subir">${ic('up')}</button>
        <button class="ib" data-act="grpDown" data-a="${gi}" ${gi === fam.grupos.length - 1 ? 'disabled' : ''} title="Bajar" aria-label="Bajar">${ic('down')}</button>
        <button class="ib ib--x" data-act="grpDel" data-a="${gi}" title="Quitar la familia" aria-label="Quitar la familia">${ic('x')}</button></span>
    </div>
    <div class="lista">
      ${g.items.map((it, ii) => `
        <div class="fila" data-fila>
          <input type="text" data-p="CARTA.${cartaTab}.grupos.${gi}.items.${ii}.0" value="${esc(it[0])}" placeholder="Nombre" aria-label="Nombre">
          <input type="text" data-p="CARTA.${cartaTab}.grupos.${gi}.items.${ii}.1" data-k="precio" value="${esc(it[1])}" placeholder="Precio" aria-label="Precio">
          ${botonesFila('item', ii, g.items.length, gi)}
        </div>`).join('') || '<p class="vacio">Sin platos todavía.</p>'}
    </div>
    <div class="nota"><button class="mas" data-act="itemAdd" data-a="${gi}">${ic('plus')} Añadir a ${esc(g.t || 'esta familia')}</button></div>
    <div class="campo" style="margin-top:16px"><label>Nota al pie (opcional)</label>
      <input type="text" data-p="CARTA.${cartaTab}.grupos.${gi}.nota" value="${esc(g.nota || '')}" placeholder="Ej.: Tenemos leche de avena y sin lactosa."></div>
  </section>`).join('')}

  <button class="mas" data-act="grpAdd">${ic('plus')} Añadir una familia nueva a «${esc(fam.tab)}»</button>`;
}

/* ---- TIENDA ---- */
const fotoSrc = p => (p.i && fotos.get(p.i)?.dataUrl) || p.i || '';

function vistaTienda() {
  const secs = D.SECCIONES;
  const chips = ['<button class="chip' + (tiendaSec === 'todos' ? ' on' : '') + '" data-act="secSel" data-s="todos">Todo</button>']
    .concat(secs.map(s => `<button class="chip${tiendaSec === s.id ? ' on' : ''}" data-act="secSel" data-s="${s.id}">${esc(s.t)}</button>`)).join('');
  const lista = D.PRODUCTOS.map((p, n) => ({ p, n })).filter(({ p }) => tiendaSec === 'todos' || p.s === tiendaSec);

  return `
  ${ayuda('Toca la <b>foto</b> para cambiarla. Con los botones de <b>menos y más</b> subes o bajas el precio de 10 en 10 céntimos. Si el interruptor «Disponible» está apagado, el producto desaparece de la tienda sin borrarse.')}
  <section class="card">
    <div class="chips">${chips}</div>
  </section>
  <div class="prods">
    ${lista.map(({ p, n }) => {
      const src = fotoSrc(p);
      return `
      <article class="prod${p.off ? ' oculto' : ''}">
        <label class="foto${src ? '' : ' foto--sin'}" title="Cambiar la foto">
          ${src ? `<img src="${esc(src)}" alt="">` : '<b>' + ic('camera') + '</b>'}
          <span>${src ? ic('camera') + ' Cambiar' : 'Añadir foto'}</span>
          <input type="file" accept="image/*" data-foto="${n}">
        </label>
        <div class="prod__f">
          <input type="text" data-p="PRODUCTOS.${n}.n" value="${esc(p.n)}" placeholder="Nombre del producto" aria-label="Nombre">
          <input type="text" data-p="PRODUCTOS.${n}.v" value="${esc(p.v || '')}" placeholder="Formato (500 g, 1 L…)" aria-label="Formato">
        </div>
        <div class="prod__pie">
          <div class="precio">
            <button class="ib" data-act="precioMenos" data-a="${n}" aria-label="Bajar 10 céntimos">${ic('minus')}</button>
            <input type="text" inputmode="decimal" data-p="PRODUCTOS.${n}.p" data-k="num" value="${p.p == null ? '' : coma(p.p)}" placeholder="—" aria-label="Precio en euros">
            <span>€</span>
            <button class="ib" data-act="precioMas" data-a="${n}" aria-label="Subir 10 céntimos">${ic('plus')}</button>
          </div>
          ${p.p == null ? '<span class="sello sello--aviso">Precio en breve</span>' : ''}
        </div>
        <div class="prod__sw">
          ${interruptor(`data-pb="PRODUCTOS.${n}.off" data-inv="1"`, !p.off, 'Disponible')}
          ${interruptor(`data-pb="PRODUCTOS.${n}.pickupOnly"`, p.pickupOnly, 'Solo recogida')}
        </div>
        <div class="prod__cola">
          <select data-p="PRODUCTOS.${n}.s" aria-label="Sección">${secs.map(s => `<option value="${s.id}" ${s.id === p.s ? 'selected' : ''}>${esc(s.t)}</option>`).join('')}</select>
          <button class="borrar" data-act="prodDel" data-a="${n}">${ic('trash')} Borrar</button>
        </div>
      </article>`; }).join('') || '<p class="vacio" style="grid-column:1/-1">No hay productos en esta sección.</p>'}
  </div>
  <button class="mas" data-act="prodAdd">${ic('plus')} Añadir un producto${tiendaSec === 'todos' ? '' : ' a ' + esc(secs.find(s => s.id === tiendaSec)?.t || '')}</button>`;
}

/* ---- RESEÑAS ---- */
function estrellas(i, n) {
  return `<span class="est" role="group" aria-label="Estrellas">${[1, 2, 3, 4, 5].map(k =>
    `<button class="${k <= n ? 'on' : ''}" data-act="estrella" data-a="${i}" data-b="${k}" aria-label="${k} estrellas">${ic('star')}</button>`).join('')}</span>`;
}

function vistaResenas() {
  const C = D.CONFIG;
  return `
  ${ayuda('Copia las reseñas <b>tal cual</b> desde Google. No inventes ninguna.')}
  <section class="card"><h2>${ic('star')} La nota de Google</h2>
    <div class="cuerpo"><div class="dos">
      <div class="campo"><label>Nota (de 1 a 5)</label><input type="text" inputmode="decimal" data-p="CONFIG.rating" data-k="num" value="${String(C.rating).replace('.', ',')}"></div>
      <div class="campo"><label>Número de reseñas</label><input type="text" inputmode="numeric" data-p="CONFIG.resenas" data-k="num" value="${C.resenas}"></div>
    </div>
    <div class="campo"><label>Lo que más repiten (separado por comas)</label>
      <input type="text" data-destacados value="${esc(D.DESTACADOS.join(', '))}" placeholder="Medialunas, Empanadas, El café"></div></div>
  </section>

  <section class="card"><h2>${ic('chat')} Reseñas que se muestran</h2>
    <div class="cuerpo">
      ${D.RESENAS.map((r, i) => `
      <div class="res">
        <div class="res__cab">
          <div class="campo"><label>Nombre</label><input type="text" data-p="RESENAS.${i}.a" value="${esc(r.a)}"></div>
          <div class="campo"><label>Estrellas</label>${estrellas(i, r.e || 5)}</div>
          ${botonesFila('res', i, D.RESENAS.length)}
        </div>
        <div class="campo"><label>Lo que dice</label><textarea data-p="RESENAS.${i}.t">${esc(r.t)}</textarea></div>
      </div>`).join('') || '<p class="vacio">No hay reseñas.</p>'}
      <button class="mas" data-act="resAdd">${ic('plus')} Añadir una reseña</button>
    </div>
  </section>`;
}

const VISTAS = { inicio: vistaInicio, horario: vistaHorario, carta: vistaCarta, tienda: vistaTienda, resenas: vistaResenas, local: vistaLocal };

function pintar(arriba = false) {
  const y = arriba ? 0 : scrollY;
  $('#vista').innerHTML = VISTAS[pestana]();
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === pestana));
  filtrar();
  scrollTo(0, y);
  if (siguienteFoco) { const f = $(siguienteFoco); f?.focus(); f?.scrollIntoView?.({ block: 'center' }); siguienteFoco = null; }
  refrescar();
}

function ir(tab, foco = null) { pestana = tab; siguienteFoco = foco; pintar(true); }

function filtrar() {
  const q = ($('#buscar')?.value || '').trim().toLowerCase();
  $$('[data-fila]').forEach(f => { f.hidden = !!q && !$('input', f).value.toLowerCase().includes(q); });
  $$('.grupo').forEach(g => { g.hidden = !!q && $$('[data-fila]:not([hidden])', g).length === 0; });
}

/* ------------------------------------------------------------- eventos */
function alEscribir(e) {
  const el = e.target;
  if (el.id === 'buscar') { filtrar(); return; }
  if (el.dataset.destacados !== undefined) { D.DESTACADOS = el.value.split(',').map(s => s.trim()).filter(Boolean); refrescar(); return; }
  const ruta = el.dataset.p;
  if (!ruta) return;
  let v = el.value;
  if (el.dataset.k === 'num') {
    const n = parseFloat(v.replace(',', '.'));
    v = v.trim() === '' || isNaN(n) ? null : n;
  }
  poner(D, ruta, v);
  if (ruta.startsWith('CONFIG.')) sincronizar();
  if (ruta.endsWith('.nota') && v === '') poner(D, ruta, undefined);
  refrescar();
}

function alCambiar(e) {
  const el = e.target;
  if (el.dataset.k === 'precio') {
    const v = precio(el.value);
    el.value = v; poner(D, el.dataset.p, v); refrescar();
  }
  if (/^PRODUCTOS\.\d+\.p$/.test(el.dataset.p || '') && el.value.trim() !== '') {
    const n = parseFloat(el.value.replace(',', '.'));
    if (!isNaN(n)) el.value = coma(n);
  }
  if (el.dataset.pb) {
    const ruta = el.dataset.pb;
    const marcado = el.dataset.inv ? !el.checked : el.checked;   // «Disponible» es lo contrario de «off»
    poner(D, ruta, marcado ? true : undefined);
    refrescar();
    if (ruta.endsWith('.off')) el.closest('.prod')?.classList.toggle('oculto', marcado);
  }
  if (el.dataset.cerrado) {
    const k = el.dataset.cerrado;
    D.CONFIG.abre[k] = el.checked ? (k === 'dom' ? ['09:00', '14:00'] : ['08:00', '22:00']) : null;
    sincronizar(); pintar();
  }
  if (el.dataset.foto !== undefined && el.files[0]) subirFoto(+el.dataset.foto, el.files[0]);
  if (/^PRODUCTOS\.\d+\.s$/.test(el.dataset.p || '')) pintar();
}

/* Intro en un precio de la carta → nuevo plato justo debajo */
function alTeclear(e) {
  if (e.key !== 'Enter') return;
  const el = e.target, m = (el.dataset.p || '').match(/^CARTA\.(\d+)\.grupos\.(\d+)\.items\.(\d+)\.([01])$/);
  if (!m || e.isComposing) return;
  e.preventDefault();
  const [, t, g, i, col] = m.map(Number);
  if (col === 0) { $(`[data-p="CARTA.${t}.grupos.${g}.items.${i}.1"]`)?.focus(); return; }
  el.dispatchEvent(new Event('change', { bubbles: true }));
  guardarHist();
  D.CARTA[t].grupos[g].items.splice(i + 1, 0, ['', '']);
  siguienteFoco = `[data-p="CARTA.${t}.grupos.${g}.items.${i + 1}.0"]`;
  pintar();
}

function alPulsar(e) {
  const b = e.target.closest('[data-act]');
  if (!b || b.tagName === 'INPUT') return;
  const a = +b.dataset.a, bb = b.dataset.b === '' || b.dataset.b === undefined ? null : +b.dataset.b;
  const fam = D.CARTA[cartaTab];
  let nombreQuitado = '';

  switch (b.dataset.act) {
    /* inicio */
    case 'ir': {
      const m = { aviso: ['horario', '#aviso'], horario: ['horario', '[data-p="CONFIG.abre.semana.0"]'], precio: ['carta', '#buscar'],
        plato: ['carta', '[data-act="itemAdd"]'], tienda: ['tienda', null], foto: ['tienda', '.foto'], resenas: ['resenas', null], local: ['local', null] }[b.dataset.ir];
      ir(m[0], m[1]); return;
    }

    /* avisos */
    case 'avisoPlantilla': D.CONFIG.aviso = b.dataset.t; siguienteFoco = '#aviso'; break;
    case 'avisoQuitar': D.CONFIG.aviso = ''; break;

    /* pizarra de la portada */
    case 'promoAdd': D.PROMOS.push({ t: '', p: '' }); siguienteFoco = `[data-p="PROMOS.${D.PROMOS.length - 1}.t"]`; break;
    case 'promoUp': mover(D.PROMOS, a, -1); break;
    case 'promoDown': mover(D.PROMOS, a, 1); break;
    case 'promoDel': nombreQuitado = D.PROMOS[a].t || 'La promo'; D.PROMOS.splice(a, 1); break;

    /* secciones de la carta */
    case 'cartaSel': cartaTab = a; break;
    case 'cartaAdd': D.CARTA.push({ tab: 'Nueva sección', grupos: [{ t: 'Nueva familia', items: [['', '']] }] }); cartaTab = D.CARTA.length - 1; siguienteFoco = `[data-p="CARTA.${cartaTab}.grupos.0.t"]`; break;
    case 'cartaDel': nombreQuitado = `La sección «${fam.tab}»`; D.CARTA.splice(cartaTab, 1); cartaTab = Math.max(0, cartaTab - 1); break;
    case 'cartaUp': if (mover(D.CARTA, cartaTab, -1)) cartaTab--; break;
    case 'cartaDown': if (mover(D.CARTA, cartaTab, 1)) cartaTab++; break;

    /* familias */
    case 'grpAdd': fam.grupos.push({ t: '', items: [['', '']] }); siguienteFoco = `[data-p="CARTA.${cartaTab}.grupos.${fam.grupos.length - 1}.t"]`; break;
    case 'grpUp': mover(fam.grupos, a, -1); break;
    case 'grpDown': mover(fam.grupos, a, 1); break;
    case 'grpDel': nombreQuitado = `La familia «${fam.grupos[a].t}»`; fam.grupos.splice(a, 1); break;
    case 'grpPct': {
      const r = prompt(`¿Cuánto quieres subir los precios de «${fam.grupos[a].t}»?\n\nEscribe un porcentaje:\n  5   → sube un 5 %\n  -10 → baja un 10 %`, '5');
      const pct = parseFloat((r || '').replace(',', '.'));
      if (!r || isNaN(pct) || pct === 0) return;
      guardarHist();
      fam.grupos[a].items.forEach(it => { it[1] = ajustarPrecio(it[1], pct); });
      toast(`Precios de «${fam.grupos[a].t}» ${pct > 0 ? 'subidos' : 'bajados'} un ${Math.abs(pct)} %.`, 'ok', 5000, { txt: 'Deshacer', fn: deshacer });
      pintar(); return;
    }

    /* platos */
    case 'itemAdd': fam.grupos[a].items.push(['', '']); siguienteFoco = `[data-p="CARTA.${cartaTab}.grupos.${a}.items.${fam.grupos[a].items.length - 1}.0"]`; break;
    case 'itemUp': mover(fam.grupos[bb].items, a, -1); break;
    case 'itemDown': mover(fam.grupos[bb].items, a, 1); break;
    case 'itemDel': nombreQuitado = fam.grupos[bb].items[a][0] || 'El plato'; fam.grupos[bb].items.splice(a, 1); break;

    /* tienda */
    case 'secSel': tiendaSec = b.dataset.s; break;
    case 'prodAdd': {
      
      const s = tiendaSec === 'todos' ? D.SECCIONES[0].id : tiendaSec;
      const soloRec = ['alfajores', 'galletitas', 'almacen'].includes(s);
      D.PRODUCTOS.push({ id: 'n' + Date.now().toString(36), s, n: 'Nuevo producto', v: '', p: null, ...(soloRec ? { pickupOnly: true } : {}), g: 'caja' });
      siguienteFoco = `[data-p="PRODUCTOS.${D.PRODUCTOS.length - 1}.n"]`; break;
    }
    case 'prodDel': nombreQuitado = D.PRODUCTOS[a].n; D.PRODUCTOS.splice(a, 1); break;
    case 'precioMas': case 'precioMenos': {
      const p = D.PRODUCTOS[a], d = b.dataset.act === 'precioMas' ? .1 : -.1;
      p.p = Math.max(0, Math.round(((p.p ?? 0) + d) * 100) / 100);
      const inp = b.parentElement.querySelector('input'); inp.value = coma(p.p);
      refrescar(); return;
    }

    /* reseñas */
    case 'resAdd': D.RESENAS.push({ a: '', e: 5, t: '' }); siguienteFoco = `[data-p="RESENAS.${D.RESENAS.length - 1}.a"]`; break;
    case 'resUp': mover(D.RESENAS, a, -1); break;
    case 'resDown': mover(D.RESENAS, a, 1); break;
    case 'resDel': nombreQuitado = 'La reseña'; D.RESENAS.splice(a, 1); break;
    case 'estrella': D.RESENAS[a].e = bb; break;
    default: return;
  }
  if (nombreQuitado) toast(`${nombreQuitado} quitado.`, '', 6000, { txt: 'Deshacer', fn: deshacer });
  pintar();
}

/* Antes de cada acción que cambia la estructura, se guarda una foto para «Deshacer» */
const ACCIONES_CON_HIST = /^(promo(Add|Up|Down|Del)|carta(Add|Del|Up|Down)|grp(Add|Up|Down|Del)|item(Add|Up|Down|Del)|prod(Add|Del)|res(Add|Up|Down|Del)|avisoQuitar|avisoPlantilla)$/;
function alPulsarConHist(e) {
  const b = e.target.closest('[data-act]');
  if (b && b.tagName !== 'INPUT' && ACCIONES_CON_HIST.test(b.dataset.act)) guardarHist();
  alPulsar(e);
}

/* ------------------------------------------------------------ fotos */
function reducir(file, max = 1000) {
  return new Promise((ok, mal) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const dataUrl = c.toDataURL('image/jpeg', .85);
      ok({ dataUrl, b64: dataUrl.split(',')[1] });
    };
    im.onerror = () => { URL.revokeObjectURL(url); mal(new Error('No se pudo leer la imagen')); };
    im.src = url;
  });
}

async function subirFoto(n, file) {
  try {
    const f = await reducir(file);
    const p = D.PRODUCTOS[n];
    const ruta = `assets/img/tienda/${p.id}-${Date.now().toString(36)}.jpg`;
    fotos.set(ruta, f);
    guardarHist();
    p.i = ruta;
    pintar();
    toast('Foto lista. Se subirá al pulsar «Publicar».', 'ok');
  } catch (err) { toast(err.message, 'mal'); }
}

/* --------------------------------------------------------------- publicar */
async function publicar() {
  sincronizar();
  const vacios = D.PRODUCTOS.filter(p => !p.n.trim()).length + D.CARTA.reduce((a, c) => a + c.grupos.reduce((b, g) => b + g.items.filter(i => !i[0].trim()).length, 0), 0);
  if (vacios && !confirm(`Hay ${vacios} cosa${vacios > 1 ? 's' : ''} sin nombre (platos o productos vacíos). Se quitarán al publicar. ¿Seguimos?`)) return;
  D.PRODUCTOS = D.PRODUCTOS.filter(p => p.n.trim());
  D.CARTA.forEach(c => c.grupos.forEach(g => { g.items = g.items.filter(i => i[0].trim()); }));
  D.PROMOS = D.PROMOS.filter(p => p.t.trim());
  D.RESENAS = D.RESENAS.filter(r => r.t.trim());

  const texto = Serializar.construir(D);
  if (demo || !token) {
    descargar('data.js', texto);
    base = JSON.stringify(D); hist = [];
    toast('Archivo descargado (modo prueba: no se ha publicado nada).'); pintar(); return;
  }

  ['#pub', '#pub2'].forEach(id => { $(id).disabled = true; $(id).textContent = 'Publicando…'; });
  try {
    await subir(texto);
    base = JSON.stringify(D); hist = [];
    pintar();
    const e = $('#estado'); e.className = 'estado ok'; $('span', e).textContent = 'Publicado';
    toast('¡Publicado! En 1 o 2 minutos se verá en la web.', 'ok', 8000);
  } catch (err) {
    const msg = err.status === 401 || err.status === 403 ? 'La clave ya no vale o no tiene permiso. Pide una nueva.'
      : err.status === 409 || err.status === 422 ? 'Alguien ha publicado mientras editabas. Recarga la página y vuelve a hacer el cambio.'
      : 'No se pudo publicar (' + (err.detalle || err.message) + '). Tus cambios siguen aquí; prueba otra vez.';
    toast(msg, 'mal', 9000);
    refrescar();
  }
}

function descartar() {
  if (!confirm('¿Descartar todos los cambios que no has publicado? Volverá a como estaba.')) return;
  D = JSON.parse(base); hist = []; sincronizar(); pintar();
  toast('Cambios descartados.', 'ok', 2500);
}

/* ----------------------------------------------------------------- inicio */
function mostrarLogin(msg) {
  $('#app').hidden = true; $('#login').hidden = false;
  const e = $('#loginErr'); e.hidden = !msg; e.textContent = msg || '';
}

async function entrar() {
  try {
    await cargar();
    sincronizar();
    $('#login').hidden = true; $('#app').hidden = false;
    $('#demo').hidden = !demo;
    $('#verWeb').href = location.pathname.replace(/admin\.html$/, '') || './';
    pestana = 'inicio';
    pintar(true);
  } catch (err) {
    if (err.status === 401) { localStorage.removeItem(CLAVE); token = ''; mostrarLogin('Esa clave no es válida. Revisa que esté completa.'); }
    else if (err.status === 404) mostrarLogin('Esa clave no tiene acceso a la web. Pide una nueva.');
    else mostrarLogin('No se pudo cargar: ' + (err.detalle || err.message));
  }
}

function arrancar() {
  // la clave puede venir en el enlace que te pasan: admin.html#clave=XXXX (se guarda y se borra de la barra)
  const m = location.hash.match(/clave=([^&]+)/);
  if (m) { try { localStorage.setItem(CLAVE, decodeURIComponent(m[1])); } catch {} history.replaceState(null, '', location.pathname); }
  try { token = localStorage.getItem(CLAVE) || ''; } catch { token = ''; }

  $$('[data-ic]').forEach(e => { e.innerHTML = ic(e.dataset.ic); });
  const vista = $('#vista');
  vista.addEventListener('input', alEscribir);
  vista.addEventListener('change', alCambiar);
  vista.addEventListener('click', alPulsarConHist);
  vista.addEventListener('keydown', alTeclear);
  $('#tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]'); if (!b) return;
    ir(b.dataset.tab);
  });
  $('#pub').addEventListener('click', publicar);
  $('#pub2').addEventListener('click', publicar);
  $('#undo').addEventListener('click', deshacer);
  $('#descartar').addEventListener('click', descartar);
  $('#salir').addEventListener('click', () => {
    if (haySinPublicar() && !confirm('Hay cambios sin publicar. Si sales, se pierden. ¿Salir?')) return;
    try { localStorage.removeItem(CLAVE); } catch {}
    base = JSON.stringify(D); token = ''; demo = false; mostrarLogin();
  });
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#clave').value.trim();
    if (!v) { mostrarLogin('Escribe la contraseña.'); return; }
    if (v === PRUEBA) { demo = true; token = ''; $('#clave').value = ''; entrar(); return; }
    token = v; try { localStorage.setItem(CLAVE, v); } catch {}
    entrar();
  });
  addEventListener('beforeunload', e => { if (D && haySinPublicar()) { e.preventDefault(); e.returnValue = ''; } });

  if (token) entrar(); else mostrarLogin();
}

arrancar();
})();
