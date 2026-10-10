# Panel de control — La Porteña

Una página privada (`admin.html`) para que el dueño cambie la web sin tocar código:
**horario, aviso de cierre, teléfono y WhatsApp, promos de la pizarra, la carta entera,
productos y precios de la tienda (con fotos) y las reseñas.**

Dirección: `https://makeweb0.github.io/la-portena-cafe/admin.html`
(no sale en Google ni está enlazada desde la web).

## Cómo funciona

No hay servidor. El panel lee `js/data.js` (donde viven todos los datos), lo edita con
formularios y, al pulsar **Publicar cambios**, hace un commit en GitHub con el archivo
nuevo y las fotos que se hayan subido. GitHub Pages reconstruye la web y en 1–2 minutos
el cambio está visible.

## Puesta en marcha (una sola vez, la hace quien entrega la web)

El panel necesita una **clave de acceso**: un token de GitHub que solo pueda tocar este
repositorio.

1. Entra en GitHub con la cuenta propietaria (`MakeWeb0`) →
   **Settings → Developer settings → Personal access tokens → Fine-grained tokens →
   Generate new token**.
2. Nombre: `Panel La Porteña`. Caducidad: la máxima (1 año).
3. **Repository access → Only select repositories →** `la-portena-cafe`.
4. **Permissions → Repository permissions → Contents: Read and write.** Nada más.
5. Generar y copiar el token (empieza por `github_pat_…`).
6. Pasarle al dueño este enlace (con la clave dentro; la primera vez que lo abra se
   guarda en su navegador y desaparece de la barra de direcciones):

   ```
   https://makeweb0.github.io/la-portena-cafe/admin.html#clave=PEGA_AQUI_EL_TOKEN
   ```

   Que lo guarde en marcadores. Si cambia de móvil u ordenador, se le vuelve a pasar.

> ⚠️ Quien tenga esa clave puede cambiar el contenido de la web. Mejor mandarla por un
> canal privado. Si se pierde o se filtra, se borra el token en GitHub y se crea otro.
> Cuando caduque (≈ 1 año) hay que repetir los pasos.

## Uso (para el dueño)

Al entrar sale **«¿Qué quieres hacer hoy?»** con botones grandes: poner un aviso, cambiar el
horario, cambiar un precio, añadir un plato, producto de la tienda, poner una foto, reseñas y
teléfono/dirección. Cada botón lleva directo al sitio y deja el cursor listo para escribir.

| Pestaña | Qué se cambia |
|---|---|
| **Inicio** | Los atajos de arriba y los 3 pasos (cambiar → Publicar → 1–2 min). |
| **Horario y avisos** | Botones de aviso listos («Cerrado por vacaciones», «obras», «festivo», «horario especial») que se editan; interruptor *Abierto/Cerrado* por día y horas. La web pone sola «Abierto ahora». |
| **La carta** | Buscador, nombre y precio de cada plato (con **Intro** se salta al siguiente y se crea uno nuevo), botón **％** para subir o bajar todos los precios de una familia, mover y quitar platos, familias y secciones. |
| **Tienda** | Foto (toca para cambiarla; se reduce sola), precio con **− / ＋** (10 en 10 céntimos), interruptores *Disponible* y *Solo recogida*, añadir y borrar productos. Sin precio → «Precio en breve». |
| **Reseñas** | Nota y número de reseñas de Google, palabras destacadas y reseñas con **estrellas** que se tocan. |
| **Datos del local** | Teléfono, WhatsApp de pedidos, dirección, Instagram y las promos de la pizarra de la portada. |

Arriba: **↶ Deshacer** (recupera lo último que se quitó o movió; nada pregunta «¿seguro?»,
todo se puede deshacer), **Ver la web** y **Publicar cambios**. Cuando hay algo sin publicar
aparece además una **barra fija abajo** con *Descartar* y *Publicar ahora*.

Los precios se pueden escribir como `1,5` o `1.5`: el panel los deja en `1,50 €`.
Si un precio lleva varias medidas (`3 € / 6 € / 8 €`), se respeta tal cual.

### Modo prueba

En la pantalla de entrada, la contraseña **`1234`** abre el panel con los datos de la web
sin permiso de escritura (es solo de prueba: cambiarla en `PRUEBA`, al principio de `js/admin.js`). El botón pasa a **Descargar data.js** (no se publica nada).
Útil para enseñárselo al cliente antes de darle la clave.

## Límites conocidos

- Las reseñas de «La nota de la casa» (barras 5★…1★) y la lista de franjas de recogida de la
  tienda están en el código, no en el panel.
- Si dos personas publican a la vez, la segunda verá «Alguien ha publicado mientras
  editabas»: se recarga y se repite el cambio.
- Cambiar un plato **no** actualiza las fotos de portada ni los textos escritos a mano en
  `index.html` (hero, «Nosotros»…). Eso se sigue editando en el código.
- Las fotos nuevas se guardan como `assets/img/tienda/<id>-<código>.jpg`; las que dejan de
  usarse se quedan en el repositorio (no pesan en la web).

## Para desarrolladores

- `admin.html`, `css/admin.css`, `js/admin.js`: el panel.
- `js/serializar.js`: escribe los datos como `js/data.js` (misma función en navegador y Node).
- Para otro repositorio, cambiar `REPO` al principio de `js/admin.js`.
- `CONFIG.abre` (`{ semana: ['08:00','22:00'], dom: ['09:00','14:00'] | null }`) manda sobre
  el cartel «Abierto ahora»; `CONFIG.horario` (el texto) lo regenera el panel.
- `CONFIG.aviso` (texto) pinta la franja ámbar; vacío = nada.
- Producto con `off: true` → no sale en la tienda.
