---
name: verify
description: Cómo levantar y verificar la plataforma de invitaciones (catálogo + invitación oliva + galería, Next.js + Supabase) end-to-end
---

# Verificar la plataforma de invitaciones

Rutas: `/` catálogo · `/oliva` invitación demo (banner "Esta es una demo") · `/oliva/galeria` galería.

## Levantar

- `npm run dev` (background) → http://localhost:3000. Levanta en ~1s.
- Requiere `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (proyecto `chbtejzilpvakdjevxnw`).

## Manejar el navegador

- Playwright no está en el proyecto: instalarlo en el scratchpad (`npm i playwright`) y usar `chromium.launch({ channel: 'msedge' })` — Edge está en `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`.
- **Gotchas obligatorios:**
  - `waitUntil: 'networkidle'` nunca se cumple en dev (HMR websocket). Usar `domcontentloaded` + `waitForSelector`.
  - La página tiene animaciones CSS infinitas (pétalos, pulso): los clicks fallan por "element is not stable" y los screenshots hacen timeout. Tras cada `goto`, inyectar `page.addStyleTag({ content: '*{animation:none!important}' })` y usar `animations: 'disabled'` en screenshots.
  - La portada bloquea todo: click en "Ingresar a mi invitación" antes de interactuar.
  - El iframe de Google Maps cuelga los screenshots de Playwright ("waiting for fonts"): bloquear con `page.route('**://maps.google.com/**', r => r.abort())`. Tampoco usar la opción `animations: 'disabled'` de screenshot (cuelga); basta la inyección CSS.
  - **`page.screenshot()` cuelga en el catálogo `/`** (aun sin animaciones y con viewport chico) y, una vez colgado uno, se cuelgan todos los siguientes del mismo browser. Workaround verificado: capturar vía CDP — `const cdp = await page.context().newCDPSession(page); const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' })` y escribir el base64 con `fs`. En `/oliva` el `page.screenshot()` normal sí funciona.
  - Si el CSS servido parece viejo (HMR no detecta reescrituras completas de archivo en OneDrive), reiniciar el dev server.

## Flujos que valen la pena

- **Catálogo** (`/`): tarjeta "Oliva Elegante" con badge Disponible; "Ver demo" navega a `/oliva`; banner de demo se cierra con `button[aria-label="Cerrar aviso de demo"]`.
- **Subida de fotos y videos** (en `/oliva` o `/playa`): llenar "¿Cómo te llamas?", `setInputFiles` en `input[type="file"]` (está oculto, funciona igual; acepta varios archivos mezclados), click `button:has-text("Subir archivos")`, esperar "¡Gracias!". Verificar en red: POST `storage/v1/object/wedding-photos/<design>/foto-*` o `video-*` → 200 y POST `rest/v1/photos` → 201. Mientras la migración `file_type` no se ejecute, se ve un POST 400 (PGRST204) seguido del 201 del fallback — es esperado.
- **Galería** (`/oliva/galeria`, `/playa/galeria`): debe listar el item con nombre del uploader; filtros Todas/Fotos/Videos; los videos llevan ícono ▶; la request a `rest/v1/photos` debe llevar `design=eq.<design>`.
- **Lightbox**: tocar un item abre el visor (`[role="dialog"]`) con contador "n / total", descarga (`a[aria-label="Descargar"]` → url + `?download`) y cierre con Escape/×/fondo. El swipe se prueba con contexto `hasTouch: true` + CDP `Input.dispatchTouchEvent` (touchStart → varios touchMove → touchEnd, ~230px de arrastre).
- `/playa` también tiene portada de entrada: click en "Ingresar a mi invitación" antes de interactuar (igual que oliva).
- Los `Reveal` quedan en `opacity:0` hasta que el IntersectionObserver dispara: para screenshots, inyectar también `.reveal,.reveal-scale,.reveal-left,.reveal-right{opacity:1!important;transform:none!important}`.
- **Limpieza**: la anon key NO puede borrar (RLS, por diseño). Borrar fotos de prueba desde el dashboard de Supabase (tabla `photos` + bucket `wedding-photos`).
