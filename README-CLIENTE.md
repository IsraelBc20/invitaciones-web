# Cómo crear una nueva ruta de cliente

Cada cliente tiene su propia URL dentro de un diseño existente. Ejemplo real:
`tudominio.com/oliva/israel-y-marisol` (diseño Oliva) y su galería en
`tudominio.com/oliva/israel-y-marisol/galeria`.

## Pasos (ejemplo: Pedro y Ana con diseño oliva)

1. **Duplicar la carpeta del cliente existente:**

   ```
   app/oliva/israel-y-marisol/  →  app/oliva/pedro-y-ana/
   ```

   Quedan dos archivos:
   - `app/oliva/pedro-y-ana/page.tsx` (la invitación)
   - `app/oliva/pedro-y-ana/galeria/page.tsx` (su galería)

2. **Actualizar los datos en `page.tsx`:**

   ```tsx
   export const metadata: Metadata = {
     title: "Pedro & Ana — 15 de Octubre 2027",
     description: "Estamos felices de invitarte a nuestra boda civil",
   };

   export default function Page() {
     return <InvitationOliva galeriaHref="/oliva/pedro-y-ana/galeria" />;
   }
   ```

   Importante:
   - **NO** pasar la prop `demo` (esa es solo para `/oliva`, la página del catálogo).
   - `galeriaHref` debe apuntar a la galería del cliente para que el enlace
     "Ver galería de fotos" y el "Volver" cierren el círculo.

3. **Actualizar `galeria/page.tsx`:**

   ```tsx
   export default function Page() {
     return <GalleryOliva backHref="/oliva/pedro-y-ana" />;
   }
   ```

4. **Personalizar los datos de la pareja.** Hoy los textos (nombres, fecha,
   horarios, WhatsApp, cuentas, historia) viven dentro de
   `app/components/oliva/InvitationOliva.tsx`. Para un cliente nuevo hay dos
   opciones:
   - Si el componente todavía es de un solo cliente: editarlo directamente.
   - Si ya hay varios clientes del mismo diseño: extraer los datos a props o a
     un archivo de configuración por cliente (recomendado a futuro).

5. **Listo.** No hay que tocar nada más:
   - La **música** funciona sola: todas las rutas bajo `/oliva/*` comparten el
     "grupo" oliva (la canción sigue al navegar entre invitación y galería, y
     se corta al salir del grupo).
   - La **protección de contenido** la aplica `app/oliva/layout.tsx` a todas
     las subrutas automáticamente.
   - La **galería** comparte las fotos del diseño (`design = 'oliva'` en
     Supabase). Si el cliente necesita fotos separadas, habría que agregar un
     nuevo valor de `design` y pasarlo como prop (cambio pequeño en
     `GalleryOliva` y `useMediaUpload`).

## Fotos del cliente (diseño oliva)

Las fotos de los novios van en `public/photos/` con estos nombres exactos
(mientras no existan se muestra un placeholder elegante con el nombre esperado):

| Archivo | Ubicación | Proporción / tamaño sugerido |
| --- | --- | --- |
| `foto-pareja-hero.jpg` | Hero principal | 4:5 · 720×900 px |
| `foto-colegio.jpg` | Historia bloque 1 | 3:4 · 748×998 px |
| `foto-juntos.jpg` | Historia bloque 2, col. izquierda | 3:4 · 362×482 px |
| `foto-momento.jpg` | Historia bloque 2, col. derecha | 3:4 · 362×482 px |
| `foto-pareja-circular.jpg` | Historia bloque 3 (circular) | 1:1 · 748×748 px |
| `foto-full-bleed.jpg` | Foto edge-to-edge | 4:5 · 860×1075 px |
| `foto-collage-grande.jpg` | Collage principal | 3:4 · 486×648 px |
| `foto-collage-chica-1.jpg` | Collage pequeña superior | 1:1 · 242×242 px |
| `foto-collage-chica-2.jpg` | Collage pequeña inferior | 1:1 · 242×242 px |

El diseño Playa usa sus propias fotos en `public/playa/` (nombres libres,
referenciados directamente en `InvitationPlaya.tsx`).

## Checklist final

- [ ] `npm run build` pasa sin errores y lista las rutas nuevas
- [ ] La invitación del cliente NO muestra el banner "Esta es una demo"
- [ ] El botón de música aparece y la canción continúa al ir a la galería
- [ ] "Volver a la invitación" en la galería regresa a la ruta del cliente
