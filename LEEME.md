# La Porteña — web

Dos páginas: **`index.html`** (el local) y **`tienda.html`** (la tienda online).

## Cómo verla

Doble clic en `index.html` funciona, pero **los vídeos van mucho mejor con un servidor**:

```
cd "C:\Users\Usuario\Desktop\La porteña\web"
python servidor.py
```

Y abre http://127.0.0.1:8000

## Qué hay dentro

```
index.html              el local: hero, carta, vitrina 3D, reseñas, redes
tienda.html             la tienda online
css/styles.css          todo el diseño de las dos páginas
js/data.js              ← LO QUE SE EDITA: contacto, carta, tienda y reseñas
js/common.js            lo que comparten: navbar, carrito, helechos, separadores
js/home.js              portada: hero, carta, carrusel 3D, reseñas, redes
js/tienda.js            tienda: catálogo, carrito, entrega y pedido
assets/img/tienda/      las 28 fotos de yerbas
assets/img/comida/      las 14 fotos del carrusel 3D
assets/img/poster/      primer fotograma de cada vídeo
assets/video/           los vídeos, comprimidos para web
servidor.py             servidor local de pruebas
```

## La estética

Sale del muro vegetal de la fachada y del interior. Las secciones **alternan
verde y blanco** (como la luz dentro del local) y entre una y otra el color se
funde con un degradado. En las dos hay helechos: dibujados por código
(`fern()` en `common.js`), crecen al llegar a cada sección y luego se mecen.

Dos acentos, los dos del local: el **ámbar** de las bombillas del mostrador
(precios y notas) y el **verde hoja** (acciones y detalles).

## Las animaciones

- **Intro**: un brote crece desde el suelo, abre sus hojas y en la punta
  aparece el nombre. Sale solo la primera vez por sesión y se salta tocando.
- **Hero**: los helechos que lo enmarcan se dibujan solos y se mecen.
- **Títulos**: suben palabra a palabra. Los separadores se trazan y brotan.
- **Fotos y vídeos**: se destapan de abajo arriba al aparecer.
- **Carta**: las láminas entran en abanico; al pasar el ratón la hoja gira y
  cada plato se ilumina.
- **Vitrina 3D**: arrastre continuo con inercia, flechas, puntos, teclado y
  paso automático.
- **Reseñas**: cada una es una hoja que brota del tallo, se mece sola y
  reacciona al ratón.
- **Botones**: imantados (se acercan al cursor).
- **Tienda**: las fichas se inclinan hacia el cursor y el producto vuela al
  carrito.
- **Arriba del todo**: un tallo crece con el scroll y la hoja de la punta gira.

Todo respeta «reducir movimiento» del sistema: si está activado, la web se ve
completa y quieta.

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

## El carrusel 3D de la vitrina

En `js/home.js`, función `vitrina()`. Una sola posición continua manda sobre
las 14 fotos: GSAP la anima y cada foto calcula su sitio a partir de ella, así
que por muchos clics seguidos que se den ninguna se queda a medias ni se
juntan. Los pies de foto están en la lista `VITRINA`, en ese mismo archivo.

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
