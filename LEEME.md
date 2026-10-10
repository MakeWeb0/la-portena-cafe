# La Porteña — web

Dos páginas: **`index.html`** (el local) y **`tienda.html`** (la tienda online).

## Cómo verla

Doble clic en `index.html` funciona, pero **los vídeos van mucho mejor con un servidor**:

```
cd "C:\Users\Usuario\Desktop\La porteña\web"
python servidor.py
```

Y abre http://127.0.0.1:8000

## Panel de control (para el dueño)

`admin.html` permite cambiar horario, avisos, promos, carta, tienda (precios y fotos) y reseñas
sin saber programar. Guía y puesta en marcha: **[ADMIN.md](ADMIN.md)**.

## Qué hay dentro

```
index.html              el local: hero, carta, fotos, reseñas, redes
tienda.html             la tienda online
css/styles.css          todo el diseño de las dos páginas
js/data.js              ← LO QUE SE EDITA: contacto, carta, tienda y reseñas
js/common.js            lo que comparten: navbar, carrito, luces, hojas, separadores
js/home.js              portada: hero, carta, fotos, reseñas, redes
js/tienda.js            tienda: catálogo, carrito, entrega y pedido
assets/img/tienda/      las 28 fotos de yerbas
assets/img/comida/      las 14 fotos de la bollería (sección «Recién hecho» y rincones)
assets/img/poster/      primer fotograma de cada vídeo
assets/video/           los vídeos, comprimidos para web
servidor.py             servidor local de pruebas
```

## La estética — «pizarra y bombilla»

Sale del local de noche: la **pizarra negra** de la puerta y la carta, la
**tiza**, las **bombillas ámbar** colgando sobre la barra, la guirnalda de
estrellas del techo, el **papel pintado de hojas tropicales** y el muro verde.

- Fondo negro pizarra con grano; texto en blanco tiza.
- Un solo acento: el **ámbar** de las bombillas (precios, botones, detalles).
  El verde solo aparece como hojas de palmera muy oscuras al fondo.
- Tipografías: **Yellowtail** (el script del rótulo), **Jost** (texto) y
  **Caveat** (notas a tiza). Los colores y fuentes están en `:root` de
  `css/styles.css`.
- Piezas propias: la pizarra con marco de madera (carta), la pizarrita de
  promos del hero, comandas de papel clavadas (reseñas), estantería de madera
  (tienda), vídeos en arco (la puerta).

## Las animaciones

- **Intro**: cae una bombilla del techo, parpadea, se enciende y su luz
  escribe el nombre; después se abre como un círculo. Solo la primera vez por
  sesión; se salta tocando.
- **Hero**: bombillas que se balancean, guirnalda de estrellas que titila,
  el nombre se escribe y la pizarrita cae con rebote. Cartel «Abierto ahora»
  calculado con la hora de Alicante (`CONFIG.abre` en `data.js`).
- **Cursor**: una luz cálida sigue al ratón.
- **Títulos**: suben palabra a palabra; los separadores se trazan a tiza.
- **Carta**: pestañas de tiza, platos que entran en cascada.
- **Recién hecho**: fotos en forma de hoja que entran escalonadas.
- **Reseñas**: las comandas caen y se clavan en el tablón.
- **Botones**: imantados. **Tienda**: las fichas se inclinan hacia el cursor y
  el producto vuela al carrito.
- Arriba del todo: una línea ámbar (el cable) que avanza con el scroll.

Todo respeta «reducir movimiento» del sistema.

## Lo que se cambia a diario: `js/data.js`

**Contacto** — arriba del todo, en `CONFIG`: dirección, teléfono, Instagram,
horario y la nota de Google (4,5 ★ · 471 reseñas).

> ⚠️ `whatsapp: '34865809500'` — los pedidos se envían a ese número.
> Si el WhatsApp del local es otro, cámbialo ahí.

**Carta** — en `CARTA`, cada línea es `['Nombre', '0,00 €']`.

**Tienda** — en `PRODUCTOS`:

```js
{ id:'y01', s:'yerbas', n:'Taragüí', v:'500 g', p:4.90, i:img('taragui') }
```

- `p: 4.90` → se puede comprar.
- `p: null` → sello **«Precio en breve»** y botón **«Preguntar precio»** (abre
  WhatsApp). En cuanto sepas el precio, pon el número y ya se vende solo.
- `pickupOnly: true` → solo recogida; si hay uno en el carrito, el envío se
  desactiva automáticamente.
- `i:` foto · `g:` ilustración (mates, termos y bombillas, hasta que haya fotos).

Para ponerle foto a un mate o un termo: guarda la imagen en
`assets/img/tienda/` y cambia `g:'termo'` por `i:img('nombre-del-archivo')`.

**Reseñas** — en `RESENAS`, con nombre y estrellas. Cada una se convierte en
una hoja; con 4 quedan dos pares, pero funcionan con cualquier número:

```js
{ a:'Alejandra Okretic', e:5, t:'Bajamos del tren…' }
```

Son reales, copiadas literalmente. Para añadir más, cópialas tal cual desde
Google. **No inventes reseñas.**

## La carta

Las familias de más de 12 platos se reparten en varias láminas (con «1/3»,
«2/3»…) y las cortas se juntan en una. Todas las láminas de una pestaña miden
lo mismo. Los límites están al principio del bloque de la carta en `home.js`
(`MAX_LINEAS`, `TROZO`, `CAPACIDAD`).

## Pendiente de ti

1. **Precio de 10 yerbas** que no estaban en la carta: CBSé limón, jengibre,
   pomelo y hierbas serranas, La Tranquera, Armiño, Cabral Para Nerviosos,
   Amanda, Playadito mate cocido, Rosamonte mate cocido y Nobleza Gaucha mate
   cocido.
2. **Mates, termos y bombillas**: fotos y precios. Ahora van con ilustración.
3. **Confirmar el WhatsApp** de pedidos.

## Envíos

La web no cobra: el pedido llega por WhatsApp y se confirma a mano. En envío a
domicilio se muestra «el coste y el plazo los pone la empresa de transporte» y
el total aparece como «00,00 € + envío». La recogida en tienda deja elegir día
y franja, y los domingos solo ofrece 09:00–14:00 porque es lo que abre el local.
