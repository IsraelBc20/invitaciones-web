@AGENTS.md

# Plataforma de invitaciones digitales

Negocio de invitaciones digitales. `/` es el catálogo de diseños (fondo verde oscuro + dorado); cada diseño vive en su propia ruta con su galería. El primer diseño, **Oliva Elegante** (`/oliva`), es la invitación de la boda civil de Israel & Marisol: **sábado 12 de septiembre de 2026, 4:00 p.m.** (cambiado de 3:00 el 13 jul 2026), Av. Circunvalación Norte 404, Huaral (coordenadas exactas `-11.489522,-77.206264`; botones "Ver en Google Maps" y "Cómo llegar" en ambos diseños usan esas coords). RSVP por WhatsApp al +51 993092110 (confirmar antes del 25 de julio). Dress code: casual elegante (sin blanco, sin jeans). **Sin sección de padres ni de "no niños"** (decisión del 13 jul 2026; se eliminó `PadresSection` de oliva).

## Stack y estructura

- Next.js 16.2.6 (Turbopack) · React 19 · Tailwind v4 · TypeScript · Supabase
- `app/page.tsx` → `app/components/catalog/CatalogPage.tsx` — catálogo (hero, grid de diseños, características, cómo funciona, footer WhatsApp)
- `lib/designs.ts` — config central de diseños; para agregar uno: crear `app/<id>/` y añadir un objeto al array
- `app/oliva/page.tsx` → `app/components/oliva/InvitationOliva.tsx` — invitación completa (max 430px). La página demo pasa `<InvitationOliva demo />`, que muestra un banner flotante "Esta es una demo" con botón Solicitar (WhatsApp) y X para cerrar; las invitaciones reales de clientes NO llevan la prop `demo`
- Galerías: `app/components/<diseño>/Gallery<Diseño>.tsx` — fotos **y videos** de invitados, filtra `design = '<diseño>'`; botones Todas/Fotos/Videos; prop `backHref` para el "Volver". Las páginas (`/oliva/galeria`, `/playa/galeria` y las de clientes) solo montan ese componente con su `backHref`
- **Rutas de clientes** (14 jul 2026): `/oliva/israel-y-marisol` y `/playa/israel-y-marisol` (+ sus `/galeria`) son las invitaciones REALES — sin prop `demo`, con `galeriaHref`, `photosPath` y `musicSrc` apuntando a sus propios assets, y metadata "Israel & Marisol — 12 de Septiembre 2026". Cómo crear un cliente nuevo: ver `README-CLIENTE.md`
- **Assets por cliente en `public/`** (14 jul 2026): `oliva-demo/` y `playa-demo/` tienen los assets de los demos (`photos/` + `music.mp3`; las decoraciones de playa —deco-*, ramo, qr-yape, sobre-confirmar, foto-arco, regalos-bg— van en la raíz de `playa-demo/` porque son del diseño y las comparten los clientes); `oliva/<cliente>/` y `playa/<cliente>/` llevan `photos/` + `music.mp3` de cada cliente (hoy vacíos para israel-y-marisol: muestran placeholders y sin música hasta subirlos). Los GIFs compartidos siguen en la raíz de `public/`. Ambas invitaciones aceptan `photosPath`/`musicSrc` (defaults = demo); las galerías aceptan `musicSrc`
- **Protección de contenido** (14 jul 2026): `app/components/shared/ContentProtection.tsx`, montado desde `app/oliva/layout.tsx` y `app/playa/layout.tsx` (cubre todas las subrutas del diseño; el catálogo `/` queda fuera). Bloquea click derecho, F12/Ctrl+Shift+I-J-C/Ctrl+U/Ctrl+S, arrastre de imágenes y selección de texto (inputs/textareas siguen seleccionables); overlay "Contenido protegido" si detecta DevTools por tamaño de ventana (solo desktop — en móvil daría falsos positivos). Es disuasión, no seguridad real
- `lib/media.ts` — reglas de fotos/videos: extensiones permitidas (jpg/jpeg/png/webp/heic · mp4/mov/avi), límites (100MB foto / 500MB video), subida con progreso real vía XHR (supabase-js no expone progreso) e insert con fallback si la migración `file_type` no se ejecutó
- `app/components/shared/` — `useMusic.ts` (hook `useMusic(src, group)` con `Audio` singleton a nivel de módulo y **grupos por diseño** desde el 14 jul 2026: todas las rutas de un diseño pasan su `DESIGN_ID` como grupo; la canción sigue sonando al navegar client-side dentro del grupo — los enlaces deben ser `<Link>`, nunca `<a>` — y **se detiene y rebobina al desmontarse la última ruta del grupo** (ir al catálogo o a otro diseño); cambiar de diseño nunca arranca la otra canción sola, solo el botón de ingresar; cada invitación exporta `MUSIC_SRC` y `MusicFab`, y su galería los importa para mostrar el mismo FAB), `useMediaUpload.ts` (estado de la subida: validación, previews, progreso por archivo), `UploadPreview.tsx` (miniatura con barra de progreso), `Lightbox.tsx` (visor fullscreen estilo galería de iPhone: swipe horizontal con seguimiento del gesto para navegar y **swipe-down para cerrar** (umbral 100px, fondo se transparenta proporcional, funciona con touch y mouse vía Pointer Events + listeners en window), flechas/teclado, botón de descarga vía `?download` de Supabase, contador, pie con nombre y fecha; **sin eliminar/editar a propósito**). Cada diseño renderiza su propia UI con su estética sobre estos
- `lib/supabase.ts` — cliente Supabase (usa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` de `.env.local`)
- `supabase/setup.sql` — referencia del esquema (ver Pendientes: la migración `design` aún no se ejecuta)
- `public/` — GIFs decorativos compartidos en la raíz (`camara`, `iglesia`, `it-ceremonia`, `it-brindis`, `it-comida`, `it-celebracion`, `dresscode`, `agradecimiento`, `regalo`); assets por demo/cliente en `oliva-demo/`, `playa-demo/`, `oliva/<cliente>/`, `playa/<cliente>/` (ver punto "Assets por cliente"). **No hotlinkear imágenes de sitios externos** — siempre descargar a `public/`.

## Diseño Oliva (réplica del estilo "Lyanne & Luis" de limafest, con datos propios)

- **Paleta (elegida por el usuario, jul 2026):** fondo `#f6f2ee` (`--bg`), títulos/acentos verde `#304c3a` (`--brown`, `--olive`), texto secundario azul-gris `#6f8f9d` (`--ink`, `--ink-soft`). Variables en `app/globals.css`.
- **Fuentes** (Google Fonts vía `<link>` en `app/layout.tsx`): Great Vibes (`--font-script`, nombres/títulos caligráficos), Cormorant Garamond (`--font-serif`, cuerpo), Lora (`--font-display`), Abel (`--font-sans`, small caps).
- Portada con botón "Ingresar a mi invitación" que inicia la música (vía `useMusic`) + nota "Sube el volumen para vivirla mejor" debajo (igual en playa); FAB flotante de música con anillo pulsante; countdown Día:Hrs:Min:Seg a `2026-09-12T16:00`; itinerario tipo timeline (Ceremonia civil 4:00, Brindis 5:00, Comida 6:00, Celebración 7:00); flores/ramas son SVG inline recoloreables.
- Los horarios aparecen en 3 sitios: itinerario, tarjeta "Ceremonia civil" y countdown — mantenerlos sincronizados.
- **Fotos de los novios** (14 jul 2026): el componente `Photo` carga `<photosPath>/<archivo>` con nombres fijos (9 huecos: `foto-pareja-hero`, `foto-colegio`, `foto-juntos`, `foto-momento`, `foto-pareja-circular`, `foto-full-bleed`, `foto-collage-grande`, `foto-collage-chica-1/2`; tabla con proporciones en `README-CLIENTE.md`); mientras el archivo no exista muestra un placeholder oliva con ícono de cámara y el nombre esperado. El demo ya tiene las 9 en `public/oliva-demo/photos/`. Playa tiene el equivalente `Foto` (6 fotos de pareja con nombres fijos: `portada`, `pareja-1/2`, `nosotros-1/2`, `final`).

## Diseño Playa (estilo scrapbook de Canva; mismos datos que oliva desde el 13 jul 2026: ceremonia 4:00 p.m., Norte 404)

- Paleta: fondo `#f6f2ee`, verde `#304c3a`, azul `#6f8f9d`, rosa `#f6e6f2`; fuentes Marcellus (cuerpo) + Cormorant Garamond italic (títulos). Todo con estilos inline en `InvitationPlaya.tsx` (no usa las clases/vars de oliva).
- **Fondos alternados por sección** (13 jul 2026, el tono oscuro `#e1d3c7` se eliminó ese mismo día a pedido del usuario): solo claro `#f6f2ee` (BG) y medio `#f0eae4` (BG_MID) — portada claro, nosotros medio, countdown claro, ubicación medio, itinerario claro, dresscode medio, regalos foto, upload claro, confirmar medio, cierre+footer claro. `/playa/galeria` usa `#f0eae4` como `--bg-2`; los footers de ambas galerías son verde `#304c3a` (letras `#f6f2ee`).
- Paridad con oliva (11 jul 2026): intro de entrada ("Ingresar a mi invitación") que inicia la música + FAB flotante (canción propia `/playa-demo/music.mp3` —antes Enamorarte_Mil_Veces— desde el 13 jul 2026; oliva usa `/oliva-demo/music.mp3`; FAB con estilos inline y paleta playa, reusa el keyframe global `pulse-ring`), countdown (caja verde con marco interior blanco y aves en las esquinas), itinerario timeline, código de vestimenta, mapa de Google embebido, subida de fotos+videos con cámara GIF.
- Los GIFs decorativos son los mismos de oliva (tonos marrones) recoloreados en CSS con `GIF_FILTER` al verde `#304c3a` (valor calibrado visualmente contra un swatch; ajustar `hue-rotate`/`brightness` si se cambia la paleta) — no duplicar archivos ni descargar otros.

## Supabase (proyecto `chbtejzilpvakdjevxnw`)

- Tabla `photos` (`id`, `url`, `uploader_name`, `created_at`, `design`) y bucket público `wedding-photos` — creados y verificados end-to-end (migración `design` ejecutada el 10 jul 2026; las filas previas quedaron como `'oliva'`).
- Multi-diseño: cada foto lleva `design` (default `'oliva'`); los archivos del bucket van en subcarpetas por diseño con prefijo por tipo (`oliva/foto-*.jpg`, `oliva/video-*.mp4`). La subida y la galería filtran por el `DESIGN_ID` de su componente.
- RLS: `anon` puede insertar y leer; no puede borrar ni actualizar (verificado el 11 jul 2026 probando PATCH/DELETE con la anon key). Para borrar fotos usar el dashboard.
- Migración fotos+videos (`file_type`, `file_size` — ver `supabase/setup.sql`) **pendiente de ejecutar**; mientras tanto el insert usa el fallback sin esas columnas y la galería deduce el tipo por la extensión de la URL.
- La anon key no permite DDL; cambios de esquema van por el SQL Editor del dashboard o el conector MCP de Supabase (requiere `/mcp`).

## Pendientes

- [ ] **Ejecutar en el SQL Editor la migración fotos+videos** (sección final de `supabase/setup.sql`: `file_type`, `file_size`)
- [ ] **Subir el "Upload file size limit" del proyecto** (Dashboard → Storage → Settings) para videos grandes; el plan free lo limita a 50MB por archivo, los 500MB del código requieren plan Pro
- [ ] Copiar fotos + `music.mp3` del cliente a `public/oliva/israel-y-marisol/` y `public/playa/israel-y-marisol/` (hoy vacíos: sus rutas muestran placeholders y no reproducen música); el demo ya tiene todo en `oliva-demo/` y `playa-demo/`
- [ ] Borrar archivos de prueba en Supabase (fila en `photos` + archivo en bucket): "Prueba Claude" y "Prueba Rediseño" (raíz), "Prueba Catálogo", "Prueba FotosVideos" ×2 y "Prueba UI" ×2 (en `oliva/`) — verificar también "Draguito" (en `playa/`, subido el 11 jul, puede ser prueba del usuario)

## Gotchas

- **Countdowns e hidratación:** todo countdown debe arrancar con estado `null` y calcularse recién en `useEffect` (patrón de `CountdownSection` en oliva). Renderizar `Date.now()` en el estado inicial causa hydration mismatch (pasó en `/playa` el 10 jul 2026).
- **HMR + OneDrive:** el dev server a veces no detecta cambios en archivos (sirve CSS/JS viejo). Si los estilos se ven desactualizados, reiniciar `npm run dev`.
- **Dev server zombi:** al matar `npm run dev` puede quedar un `node` huérfano escuchando en el 3000 (todas las rutas menos `/` devuelven 404, o el próximo `npm run dev` falla por lock). Arreglo: matar el proceso del puerto 3000 (`Get-NetTCPConnection -LocalPort 3000`) y borrar `.next/dev`.
- Para verificar en navegador, usar la skill del proyecto `.claude/skills/verify/SKILL.md` (Playwright + Edge; el iframe de Google Maps y la opción `animations: 'disabled'` cuelgan los screenshots — ahí está documentado el workaround).
