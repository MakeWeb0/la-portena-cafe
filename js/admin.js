/* =========================================================================
   La Porteña — panel de control
   Lee js/data.js, deja editarlo con formularios y lo vuelve a escribir.
   Al publicar hace UN commit en GitHub (data.js + las fotos nuevas) y GitHub
   Pages actualiza la web en uno o dos minutos. No hay servidor propio.
   ========================================================================= */
(() => {
'use strict';

/* ← dónde vive la web. Si se cambia de repositorio, se cambia aquí. */
const REPO = { owner: 'MakeWeb0', repo: 'la-portena-cafe', branch: 'main' };
const CLAVE = 'lp.admin.clave';
const NOMBRES = ['CONFIG', 'PROMOS', 'CARTA', 'SECCIONES', 'PRODUCTOS', 'RESENAS', 'DESTACADOS'];

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let D = null;                 // los datos que se editan
let token = '';               // clave de acceso (token de GitHub)
let demo = false;             // modo prueba: no publica, descarga
let sucio = false;            // hay cambios sin publicar
let pestana = 'inicio';
let cartaTab = 0;             // familia de carta abierta
let tiendaSec = 'todos';      // sección de tienda filtrada
let siguienteFoco = null;
const fotos = new Map();      // ruta → { dataUrl, b64 }  (fotos nuevas aún sin publicar)

/* ---------------------------------------------------------------- avisos */
function toast(msg, tipo = '', ms = 4200) {
  const t = document.createElement('div');
  t.className = 'toast ' + tipo;
  t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), ms);
}

/* ----------------------------------------------------- acceso a los datos */
const get = (o, ruta) => ruta.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
function poner(o, ruta, v) {
  const ks = ruta.split('.');
  const ult = ks.pop();
  const padre = ks.length ? get(o, ks.join('.')) : o;
  padre[ult] = v;
}
const mover = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return false; [arr[i], arr[j]] = [arr[j], arr[i]]; return true; };

function parsear(txt) {
  return new Function(txt + ';return {' + NOMBRES.join(',') + '};')();
}

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
}

const aB64 = txt => btoa(String.fromCharCode(...new TextEncoder().encode(txt)));

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
function marcar(s) {
  sucio = s;
  const e = $('#estado');
  e.className = 'estado' + (s ? ' sucio' : '');
  $('span', e).textContent = s ? 'Cambios sin publicar' : 'Sin cambios';
  const b = $('#pub');
  b.disabled = !s;
  b.classList.toggle('listo', s);
  b.textContent = demo ? 'Descargar data.js' : 'Publicar cambios';
}

function cambiado() { if (!sucio) marcar(true); }

/* Que lo escrito a mano quede bien: «1.5» → «1,50 €» */
function precio(v) {
  const t = v.trim();
  if (/^\d+([.,]\d{1,2})?$/.test(t)) {
    const n = parseFloat(t.replace(',', '.'));
    return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }
  return t;
}

/* Cosas que se calculan solas a partir de lo que escribe el dueño */
function sincronizar() {
  const C = D.CONFIG, a = C.abre;
  C.horario = [
    { d: 'Lunes a sábado', h: `${a.semana[0]} – ${a.semana[1]}` },
    { d: 'Domingo', h: a.dom ? `${a.dom[0]} – ${a.dom[1]}` : 'Cerrado' }
  ];
  const tel = (C.telefono || '').replace(/\D/g, '');
  C.telHref = tel ? (tel.length === 9 ? '+34' + tel : '+' + tel) : '';
  C.whatsapp = (C.whatsapp || '').replace(/\D/g, '');
}

/* ----------------------------------------------------------------- vistas */
const campoTxt = (etq, ruta, extra = '') => `
  <div class="campo"><label>${etq}</label>
    <input type="text" data-p="${ruta}" value="${esc(get(D, ruta))}" ${extra}></div>`;

function vistaInicio() {
  const C = D.CONFIG, a = C.abre;
  return `
  <section class="card"><h2>Aviso en la web</h2>
    <p class="ayuda">Sale en una franja ámbar arriba del todo. Úsalo para «Cerrado por vacaciones», un puente… Déjalo vacío para quitarlo.</p>
    <div class="cuerpo"><div class="campo"><label>Texto del aviso</label>
      <input type="text" data-p="CONFIG.aviso" value="${esc(C.aviso)}" placeholder="Ej.: Cerrado del 10 al 20 de agosto. ¡Volvemos pronto!"></div></div>
  </section>

  <section class="card"><h2>Horario</h2>
    <p class="ayuda">La web pone sola «Abierto ahora» o «Cerrado» según estas horas.</p>
    <div class="cuerpo">
      <div class="horas"><b>Lunes a sábado</b>
        <span class="par"><input type="time" data-p="CONFIG.abre.semana.0" value="${esc(a.semana[0])}"> <span>a</span> <input type="time" data-p="CONFIG.abre.semana.1" value="${esc(a.semana[1])}"></span><span></span></div>
      <div class="horas"><b>Domingo</b>
        <span class="par"><input type="time" data-p="CONFIG.abre.dom.0" value="${esc(a.dom?.[0] || '09:00')}" ${a.dom ? '' : 'disabled'}> <span>a</span> <input type="time" data-p="CONFIG.abre.dom.1" value="${esc(a.dom?.[1] || '14:00')}" ${a.dom ? '' : 'disabled'}></span>
        <label class="check"><input type="checkbox" data-act="domCerrado" ${a.dom ? '' : 'checked'}> Cerrado</label></div>
    </div>
  </section>

  <section class="card"><h2>Teléfono y dirección</h2>
    <div class="cuerpo">
      <div class="dos">
        ${campoTxt('Teléfono (el que se ve en la web)', 'CONFIG.telefono', 'inputmode="tel"')}
        ${campoTxt('WhatsApp donde llegan los pedidos', 'CONFIG.whatsapp', 'inputmode="numeric" placeholder="34600123456"')}
      </div>
      <p class="ayuda" style="margin-top:-6px">El WhatsApp, con el 34 delante y sin espacios. Si lo cambias, los pedidos de la tienda llegarán a ese número.</p>
      <div class="dos">
        ${campoTxt('Dirección', 'CONFIG.direccion')}
        ${campoTxt('Ciudad', 'CONFIG.ciudad')}
      </div>
      ${campoTxt('Instagram (enlace completo)', 'CONFIG.instagram', 'inputmode="url"')}
      <details><summary class="enlace">Enlaces avanzados</summary>
        <div class="cuerpo" style="margin-top:12px">
          ${campoTxt('Enlace de Google Maps', 'CONFIG.mapa')}
          ${campoTxt('Enlace a las reseñas de Google', 'CONFIG.google')}
        </div></details>
    </div>
  </section>

  <section class="card"><h2>La pizarra de la portada</h2>
    <p class="ayuda">Las promos que salen en la pizarrita junto al vídeo de la portada.</p>
    <div class="cuerpo"><div class="lista">
      ${D.PROMOS.map((p, i) => `
        <div class="fila">
          <input type="text" data-p="PROMOS.${i}.t" value="${esc(p.t)}" placeholder="Ej.: Tapa + caña" aria-label="Promo">
          <input type="text" data-p="PROMOS.${i}.p" data-k="precio" value="${esc(p.p)}" placeholder="4,90 €" aria-label="Precio">
          ${botonesFila('promo', i, D.PROMOS.length)}
        </div>`).join('') || '<p class="vacio">No hay promos. Añade la primera.</p>'}
    </div>
    <button class="mas" data-act="promoAdd">+ Añadir promo</button></div>
  </section>`;
}

function botonesFila(tipo, i, n, g = '') {
  return `<span class="btns">
    <button class="ib" data-act="${tipo}Up" data-a="${i}" data-b="${g}" ${i === 0 ? 'disabled' : ''} title="Subir" aria-label="Subir">▲</button>
    <button class="ib" data-act="${tipo}Down" data-a="${i}" data-b="${g}" ${i === n - 1 ? 'disabled' : ''} title="Bajar" aria-label="Bajar">▼</button>
    <button class="ib ib--x" data-act="${tipo}Del" data-a="${i}" data-b="${g}" title="Quitar" aria-label="Quitar">✕</button></span>`;
}

function vistaCarta() {
  if (cartaTab >= D.CARTA.length) cartaTab = Math.max(0, D.CARTA.length - 1);
  const fam = D.CARTA[cartaTab];
  const chips = D.CARTA.map((c, i) => `<button class="chip${i === cartaTab ? ' on' : ''}" data-act="cartaSel" data-a="${i}">${esc(c.tab || 'Sin nombre')}</button>`).join('')
    + '<button class="chip chip--nuevo" data-act="cartaAdd">+ Nueva sección</button>';

  if (!fam) return `<section class="card"><div class="chips">${chips}</div></section>`;
  return `
  <section class="card">
    <div class="chips">${chips}</div>
    <div class="cuerpo" style="margin-top:18px">
      <div class="grupo__cab" style="margin-bottom:0">
        <div class="campo"><label>Nombre de esta sección de la carta</label>
          <input type="text" data-p="CARTA.${cartaTab}.tab" value="${esc(fam.tab)}"></div>
        <span class="btns">
          <button class="ib" data-act="cartaUp" ${cartaTab === 0 ? 'disabled' : ''} title="Mover a la izquierda" aria-label="Mover a la izquierda">◀</button>
          <button class="ib" data-act="cartaDown" ${cartaTab === D.CARTA.length - 1 ? 'disabled' : ''} title="Mover a la derecha" aria-label="Mover a la derecha">▶</button>
          <button class="ib ib--x" data-act="cartaDel" title="Quitar la sección entera" aria-label="Quitar la sección entera">✕</button></span>
      </div>
      <input type="search" class="buscar" id="buscar" placeholder="Buscar un plato o bebida…" aria-label="Buscar en la carta">
    </div>
  </section>

  ${fam.grupos.map((g, gi) => `
  <section class="card grupo">
    <div class="grupo__cab">
      <div class="campo"><label>Familia (ej.: Café, Tartas, Cervezas)</label>
        <input type="text" data-p="CARTA.${cartaTab}.grupos.${gi}.t" value="${esc(g.t)}"></div>
      <span class="btns">
        <button class="ib" data-act="grpUp" data-a="${gi}" ${gi === 0 ? 'disabled' : ''} title="Subir" aria-label="Subir">▲</button>
        <button class="ib" data-act="grpDown" data-a="${gi}" ${gi === fam.grupos.length - 1 ? 'disabled' : ''} title="Bajar" aria-label="Bajar">▼</button>
        <button class="ib ib--x" data-act="grpDel" data-a="${gi}" title="Quitar la familia" aria-label="Quitar la familia">✕</button></span>
    </div>
    <div class="lista">
      ${g.items.map((it, ii) => `
        <div class="fila" data-fila>
          <input type="text" data-p="CARTA.${cartaTab}.grupos.${gi}.items.${ii}.0" value="${esc(it[0])}" placeholder="Nombre" aria-label="Nombre">
          <input type="text" data-p="CARTA.${cartaTab}.grupos.${gi}.items.${ii}.1" data-k="precio" value="${esc(it[1])}" placeholder="Precio" aria-label="Precio">
          ${botonesFila('item', ii, g.items.length, gi)}
        </div>`).join('') || '<p class="vacio">Sin platos todavía.</p>'}
    </div>
    <div class="nota"><button class="mas" data-act="itemAdd" data-a="${gi}">+ Añadir a ${esc(g.t || 'esta familia')}</button></div>
    <div class="campo" style="margin-top:16px"><label>Nota al pie (opcional)</label>
      <input type="text" data-p="CARTA.${cartaTab}.grupos.${gi}.nota" value="${esc(g.nota || '')}" placeholder="Ej.: Tenemos leche de avena y sin lactosa."></div>
  </section>`).join('')}

  <button class="mas" data-act="grpAdd">+ Añadir una familia nueva a «${esc(fam.tab)}»</button>`;
}

const fotoSrc = p => (p.i && fotos.get(p.i)?.dataUrl) || p.i || '';

function vistaTienda() {
  const secs = D.SECCIONES;
  const chips = ['<button class="chip' + (tiendaSec === 'todos' ? ' on' : '') + '" data-act="secSel" data-s="todos">Todo</button>']
    .concat(secs.map(s => `<button class="chip${tiendaSec === s.id ? ' on' : ''}" data-act="secSel" data-s="${s.id}">${esc(s.t)}</button>`)).join('');
  const lista = D.PRODUCTOS.map((p, n) => ({ p, n })).filter(({ p }) => tiendaSec === 'todos' || p.s === tiendaSec);

  return `
  <section class="card"><h2>Productos de la tienda</h2>
    <p class="ayuda">Si dejas el precio vacío, en la web sale «Precio en breve» y el cliente puede preguntarlo por WhatsApp. «Ocultar» lo quita de la tienda sin borrarlo (por ejemplo, si se agota).</p>
    <div class="cuerpo"><div class="chips">${chips}</div></div>
  </section>
  <div class="prods">
    ${lista.map(({ p, n }) => {
      const src = fotoSrc(p);
      return `
      <article class="prod${p.off ? ' oculto' : ''}">
        <label class="foto${src ? '' : ' foto--sin'}" title="Cambiar la foto">
          ${src ? `<img src="${esc(src)}" alt=""><span>Cambiar foto</span>` : 'Sin foto<br>Toca para añadirla'}
          <input type="file" accept="image/*" data-foto="${n}">
        </label>
        <div class="prod__f">
          <input type="text" data-p="PRODUCTOS.${n}.n" value="${esc(p.n)}" placeholder="Nombre del producto" aria-label="Nombre">
          <input type="text" data-p="PRODUCTOS.${n}.v" value="${esc(p.v || '')}" placeholder="Formato (500 g, 1 L…)" aria-label="Formato">
          <label class="check"><input type="checkbox" data-pb="PRODUCTOS.${n}.pickupOnly" ${p.pickupOnly ? 'checked' : ''}> Solo recogida en tienda</label>
          <label class="check"><input type="checkbox" data-pb="PRODUCTOS.${n}.off" ${p.off ? 'checked' : ''}> Ocultar (agotado)</label>
        </div>
        <div class="prod__pie">
          <span class="precio"><input type="text" inputmode="decimal" data-p="PRODUCTOS.${n}.p" data-k="num" value="${p.p == null ? '' : p.p.toFixed(2).replace('.', ',')}" placeholder="Precio" aria-label="Precio en euros"> €
            ${p.p == null ? '<span class="sello sello--aviso">Precio en breve</span>' : ''}</span>
          <select data-p="PRODUCTOS.${n}.s" aria-label="Sección">${secs.map(s => `<option value="${s.id}" ${s.id === p.s ? 'selected' : ''}>${esc(s.t)}</option>`).join('')}</select>
          <button class="borrar" data-act="prodDel" data-a="${n}">Borrar</button>
        </div>
      </article>`; }).join('') || '<p class="vacio" style="grid-column:1/-1">No hay productos en esta sección.</p>'}
  </div>
  <button class="mas" data-act="prodAdd">+ Añadir un producto${tiendaSec === 'todos' ? '' : ' a ' + esc(secs.find(s => s.id === tiendaSec)?.t || '')}</button>`;
}

function vistaResenas() {
  const C = D.CONFIG;
  return `
  <section class="card"><h2>La nota de Google</h2>
    <p class="ayuda">Lo que sale en «La nota de la casa». Cópialo de la ficha de Google.</p>
    <div class="cuerpo"><div class="dos">
      <div class="campo"><label>Nota (de 1 a 5)</label><input type="text" inputmode="decimal" data-p="CONFIG.rating" data-k="num" value="${String(C.rating).replace('.', ',')}"></div>
      <div class="campo"><label>Número de reseñas</label><input type="text" inputmode="numeric" data-p="CONFIG.resenas" data-k="num" value="${C.resenas}"></div>
    </div>
    <div class="campo"><label>Lo que más repiten (separado por comas)</label>
      <input type="text" data-destacados value="${esc(D.DESTACADOS.join(', '))}" placeholder="Medialunas, Empanadas, El café"></div></div>
  </section>

  <section class="card"><h2>Reseñas que se muestran</h2>
    <p class="ayuda">Copia las reseñas tal cual desde Google. No inventes ninguna.</p>
    <div class="cuerpo">
      ${D.RESENAS.map((r, i) => `
      <div class="res">
        <div class="res__cab">
          <div class="campo"><label>Nombre</label><input type="text" data-p="RESENAS.${i}.a" value="${esc(r.a)}"></div>
          <div class="campo"><label>Estrellas</label>
            <select data-p="RESENAS.${i}.e" data-k="num">${[5, 4, 3, 2, 1].map(n => `<option value="${n}" ${(r.e || 5) === n ? 'selected' : ''}>${'★'.repeat(n)}</option>`).join('')}</select></div>
          <span class="btns">
            <button class="ib" data-act="resUp" data-a="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Subir">▲</button>
            <button class="ib" data-act="resDown" data-a="${i}" ${i === D.RESENAS.length - 1 ? 'disabled' : ''} aria-label="Bajar">▼</button>
            <button class="ib ib--x" data-act="resDel" data-a="${i}" aria-label="Quitar">✕</button></span>
        </div>
        <div class="campo"><label>Lo que dice</label><textarea data-p="RESENAS.${i}.t">${esc(r.t)}</textarea></div>
      </div>`).join('') || '<p class="vacio">No hay reseñas.</p>'}
      <button class="mas" data-act="resAdd">+ Añadir una reseña</button>
    </div>
  </section>`;
}

const VISTAS = { inicio: vistaInicio, carta: vistaCarta, tienda: vistaTienda, resenas: vistaResenas };

function pintar() {
  const y = scrollY;
  $('#vista').innerHTML = VISTAS[pestana]();
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === pestana));
  filtrar();
  scrollTo(0, y);
  if (siguienteFoco) { $(siguienteFoco)?.focus(); siguienteFoco = null; }
}

function filtrar() {
  const q = ($('#buscar')?.value || '').trim().toLowerCase();
  $$('[data-fila]').forEach(f => {
    const nombre = $('input', f).value.toLowerCase();
    f.hidden = !!q && !nombre.includes(q);
  });
  $$('.grupo').forEach(g => { g.hidden = !!q && $$('[data-fila]:not([hidden])', g).length === 0; });
}

/* ------------------------------------------------------------- eventos */
function alEscribir(e) {
  const el = e.target;
  if (el.id === 'buscar') { filtrar(); return; }
  if (el.dataset.destacados !== undefined) {
    D.DESTACADOS = el.value.split(',').map(s => s.trim()).filter(Boolean); cambiado(); return;
  }
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
  cambiado();
}

function alCambiar(e) {
  const el = e.target;
  if (el.dataset.k === 'precio') {
    const v = precio(el.value);
    el.value = v; poner(D, el.dataset.p, v); cambiado();
  }
  if (/^PRODUCTOS\.\d+\.p$/.test(el.dataset.p || '') && el.value.trim() !== '') {
    const n = parseFloat(el.value.replace(',', '.'));
    if (!isNaN(n)) el.value = n.toFixed(2).replace('.', ',');
  }
  if (el.dataset.pb) {
    const ruta = el.dataset.pb;
    poner(D, ruta, el.checked ? true : undefined);
    cambiado();
    if (ruta.endsWith('.off')) pintar();
  }
  if (el.dataset.foto !== undefined && el.files[0]) subirFoto(+el.dataset.foto, el.files[0]);
  if (el.dataset.act === 'domCerrado') {
    D.CONFIG.abre.dom = el.checked ? null : ['09:00', '14:00'];
    sincronizar(); cambiado(); pintar();
  }
  if (/^PRODUCTOS\.\d+\.s$/.test(el.dataset.p || '')) pintar();
}

function alPulsar(e) {
  const b = e.target.closest('[data-act]');
  if (!b || b.tagName === 'INPUT') return;
  const a = +b.dataset.a, bb = b.dataset.b === '' ? null : +b.dataset.b;
  const fam = D.CARTA[cartaTab];
  const conf = t => confirm(t);
  let cambio = true;

  switch (b.dataset.act) {
    /* pizarra de la portada */
    case 'promoAdd': D.PROMOS.push({ t: '', p: '' }); siguienteFoco = `[data-p="PROMOS.${D.PROMOS.length - 1}.t"]`; break;
    case 'promoUp': mover(D.PROMOS, a, -1); break;
    case 'promoDown': mover(D.PROMOS, a, 1); break;
    case 'promoDel': if (!conf('¿Quitar esta promo?')) return; D.PROMOS.splice(a, 1); break;

    /* secciones de la carta */
    case 'cartaSel': cartaTab = a; cambio = false; break;
    case 'cartaAdd': D.CARTA.push({ tab: 'Nueva sección', grupos: [{ t: 'Nueva familia', items: [] }] }); cartaTab = D.CARTA.length - 1; siguienteFoco = `[data-p="CARTA.${cartaTab}.tab"]`; break;
    case 'cartaDel': if (!conf(`¿Quitar la sección «${fam.tab}» con todo lo que lleva dentro?`)) return; D.CARTA.splice(cartaTab, 1); cartaTab = Math.max(0, cartaTab - 1); break;
    case 'cartaUp': if (mover(D.CARTA, cartaTab, -1)) cartaTab--; break;
    case 'cartaDown': if (mover(D.CARTA, cartaTab, 1)) cartaTab++; break;

    /* familias */
    case 'grpAdd': fam.grupos.push({ t: '', items: [['', '']] }); siguienteFoco = `[data-p="CARTA.${cartaTab}.grupos.${fam.grupos.length - 1}.t"]`; break;
    case 'grpUp': mover(fam.grupos, a, -1); break;
    case 'grpDown': mover(fam.grupos, a, 1); break;
    case 'grpDel': if (!conf(`¿Quitar la familia «${fam.grupos[a].t}» con sus ${fam.grupos[a].items.length} platos?`)) return; fam.grupos.splice(a, 1); break;

    /* platos */
    case 'itemAdd': fam.grupos[a].items.push(['', '']); siguienteFoco = `[data-p="CARTA.${cartaTab}.grupos.${a}.items.${fam.grupos[a].items.length - 1}.0"]`; break;
    case 'itemUp': mover(fam.grupos[bb].items, a, -1); break;
    case 'itemDown': mover(fam.grupos[bb].items, a, 1); break;
    case 'itemDel': {
      const it = fam.grupos[bb].items[a];
      if (it[0] && !conf(`¿Quitar «${it[0]}»?`)) return;
      fam.grupos[bb].items.splice(a, 1); break;
    }

    /* tienda */
    case 'secSel': tiendaSec = b.dataset.s; cambio = false; break;
    case 'prodAdd': {
      const s = tiendaSec === 'todos' ? D.SECCIONES[0].id : tiendaSec;
      const soloRec = ['alfajores', 'galletitas', 'almacen'].includes(s);
      D.PRODUCTOS.push({ id: 'n' + Date.now().toString(36), s, n: 'Nuevo producto', v: '', p: null, ...(soloRec ? { pickupOnly: true } : {}), g: 'caja' });
      siguienteFoco = `[data-p="PRODUCTOS.${D.PRODUCTOS.length - 1}.n"]`; break;
    }
    case 'prodDel': if (!conf(`¿Borrar «${D.PRODUCTOS[a].n}» de la tienda? (Si solo se ha agotado, mejor márcalo como «Ocultar».)`)) return; D.PRODUCTOS.splice(a, 1); break;

    /* reseñas */
    case 'resAdd': D.RESENAS.push({ a: '', e: 5, t: '' }); siguienteFoco = `[data-p="RESENAS.${D.RESENAS.length - 1}.a"]`; break;
    case 'resUp': mover(D.RESENAS, a, -1); break;
    case 'resDown': mover(D.RESENAS, a, 1); break;
    case 'resDel': if (!conf('¿Quitar esta reseña?')) return; D.RESENAS.splice(a, 1); break;
    default: return;
  }
  if (cambio) cambiado();
  pintar();
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
    p.i = ruta;
    cambiado(); pintar();
    toast('Foto lista. Se subirá al pulsar «Publicar cambios».', 'ok');
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
  const b = $('#pub');
  if (demo || !token) { descargar('data.js', texto); toast('Archivo descargado (modo prueba: no se ha publicado nada).'); marcar(false); pintar(); return; }

  b.disabled = true; b.textContent = 'Publicando…';
  try {
    await subir(texto);
    marcar(false);
    const e = $('#estado'); e.className = 'estado ok'; $('span', e).textContent = 'Publicado';
    toast('¡Publicado! En 1 o 2 minutos se verá en la web.', 'ok', 7000);
    pintar();
  } catch (err) {
    const msg = err.status === 401 || err.status === 403 ? 'La clave ya no vale o no tiene permiso. Pide una nueva.'
      : err.status === 409 || err.status === 422 ? 'Alguien ha publicado mientras editabas. Recarga la página y vuelve a hacer el cambio.'
      : 'No se pudo publicar (' + (err.detalle || err.message) + '). Tus cambios siguen aquí; prueba otra vez.';
    toast(msg, 'mal', 9000);
    marcar(true);
  }
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
    marcar(false);
    pintar();
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

  $('#vista').addEventListener('input', alEscribir);
  $('#vista').addEventListener('change', alCambiar);
  $('#vista').addEventListener('click', alPulsar);
  $('#tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]'); if (!b) return;
    pestana = b.dataset.tab; pintar();
  });
  $('#pub').addEventListener('click', publicar);
  $('#salir').addEventListener('click', () => {
    if (sucio && !confirm('Hay cambios sin publicar. Si sales, se pierden. ¿Salir?')) return;
    try { localStorage.removeItem(CLAVE); } catch {}
    sucio = false; token = ''; demo = false; mostrarLogin();
  });
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#clave').value.trim();
    if (!v) { mostrarLogin('Pega la clave que te dieron.'); return; }
    token = v; try { localStorage.setItem(CLAVE, v); } catch {}
    entrar();
  });
  $('#demoBtn').addEventListener('click', () => { demo = true; token = ''; entrar(); });
  addEventListener('beforeunload', e => { if (sucio) { e.preventDefault(); e.returnValue = ''; } });

  if (token) entrar(); else mostrarLogin();
}

arrancar();
})();
