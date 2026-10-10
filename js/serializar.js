/* =========================================================================
   La Porteña — escribe los datos del sitio como el archivo js/data.js
   Lo usa el panel de administración (admin.html) para guardar lo que edita
   el dueño. Cada dato sale con la forma  const NOMBRE = {...};
   ========================================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Serializar = factory();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const ANCHO = 100;
const ident = k => /^[A-Za-z_$][\w$]*$/.test(k);
const clave = k => ident(k) ? k : JSON.stringify(k);

/* Una sola línea: [a, b]  ó  { k: v, k2: v2 } */
function plano(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(plano).join(', ') + ']';
  const ks = Object.keys(v).filter(k => v[k] !== undefined);
  return ks.length ? '{ ' + ks.map(k => clave(k) + ': ' + plano(v[k])).join(', ') + ' }' : '{}';
}

/* Si cabe en una línea, en una línea; si no, un elemento por línea */
function ser(v, nivel) {
  const sangria = '  '.repeat(nivel);
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  const uno = plano(v);
  if (sangria.length + uno.length <= ANCHO) return uno;
  if (Array.isArray(v))
    return '[\n' + v.map(x => sangria + '  ' + ser(x, nivel + 1)).join(',\n') + '\n' + sangria + ']';
  const ks = Object.keys(v).filter(k => v[k] !== undefined);
  return '{\n' + ks.map(k => sangria + '  ' + clave(k) + ': ' + ser(v[k], nivel + 1)).join(',\n') + '\n' + sangria + '}';
}

const CABECERA = `/* =========================================================================
   La Porteña — datos del sitio
   Contacto, horario, carta, tienda y reseñas.

   Este archivo lo escribe el panel de administración (admin.html): lo que se
   cambie allí y se publique se guarda aquí. Se puede editar a mano, pero la
   próxima vez que se publique desde el panel se vuelve a escribir entero.
   ========================================================================= */
`;

const ORDEN = ['CONFIG', 'PROMOS', 'CARTA', 'SECCIONES', 'PRODUCTOS', 'RESENAS', 'DESTACADOS'];
const TITULOS = {
  CONFIG: 'Contacto, horario y avisos', PROMOS: 'Promos de la pizarra de la puerta',
  CARTA: 'La carta', SECCIONES: 'Secciones de la tienda',
  PRODUCTOS: 'Productos de la tienda  (p: null → «Precio en breve»; off: true → oculto; pickupOnly → solo recogida)',
  RESENAS: 'Reseñas reales de Google', DESTACADOS: 'Lo que más se repite en las reseñas'
};

function construir(datos) {
  const bloques = ORDEN.map(n => `/* ---------- ${TITULOS[n]} ---------- */\nconst ${n} = ${ser(datos[n], 0)};\n`);
  bloques.splice(4, 0, 'const img = s => `assets/img/tienda/${s}.jpg`;   // atajo para fotos de tienda\n');
  return CABECERA + '\n' + bloques.join('\n');
}

return { construir, ORDEN };
});
