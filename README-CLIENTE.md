# Cómo crear una nueva ruta de cliente

Cada cliente tiene su propia URL dentro de un diseño existente. Ejemplo real:
`tudominio.com/oliva/israel-y-marisol` (diseño Oliva) y su galería en
`tudominio.com/oliva/israel-y-marisol/galeria`.

## Estructura de assets en `public/`

```
public/
├── oliva-demo/                 ← assets del DEMO oliva (/oliva)
│   ├── photos/                 ← las 9 fotos del demo (nombres fijos)
│   └── music.mp3
├── playa-demo/                 ← assets del DEMO playa (/playa)
│   ├── photos/                 ← fotos de la pareja del demo
│   ├── music.mp3
│   └── deco-*.png, ramo.png…   ← decoraciones DEL DISEÑO (las usan también
│                                  los clientes; no se duplican)
├── oliva/<cliente>/            ← assets de cada cliente oliva
│   ├── photos/                 ← sus 9 fotos (mismos nombres fijos)
│   └── music.mp3               ← su canción
└── playa/<cliente>/
    ├── photos/                 ← sus fotos de pareja (mismos nombres)
    └── music.mp3
```

Mientras una foto no exista en la carpeta del cliente, la invitación muestra
un placeholder elegante con el nombre del archivo esperado; al copiarla se
reemplaza sola. Si `music.mp3` no existe, el botón de ingresar simplemente no
reproduce nada (sin error visible) hasta que se suba el archivo.

## Pasos (ejemplo: Pedro y Ana con diseño oliva)

1. **Duplicar la carpeta de rutas del cliente existente:**

   ```
   app/oliva/israel-y-marisol/  →  app/oliva/pedro-y-ana/
   ```

2. **Actualizar `page.tsx`:**

   ```tsx
   export const metadata: Metadata = {
     title: "Pedro & Ana — 15 de Octubre 2027",
     description: "Estamos felices de invitarte a nuestra boda civil",
   };

   export default function Page() {
     return (
       <InvitationOliva
         galeriaHref="/oliva/pedro-y-ana/galeria"
         photosPath="/oliva/pedro-y-ana/photos"
         musicSrc="/oliva/pedro-y-ana/music.mp3"
       />
     );
   }
   ```

   Importante:
   - **NO** pasar la prop `demo` (esa es solo para `/oliva`, la página del catálogo).
   - Sin `photosPath`/`musicSrc` el componente usa los assets del demo
     (`/oliva-demo/…`).

3. **Actualizar `galeria/page.tsx`:**

   ```tsx
   export default function Page() {
     return (
       <GalleryOliva
         backHref="/oliva/pedro-y-ana"
         musicSrc="/oliva/pedro-y-ana/music.mp3"
       />
     );
   }
   ```

   (`musicSrc` debe ser el mismo que el de la invitación para que la canción
   continúe al navegar a la galería.)

4. **Crear los assets del cliente:**

   ```
   public/oliva/pedro-y-ana/photos/   ← copiar sus fotos (nombres de abajo)
   public/oliva/pedro-y-ana/music.mp3 ← su canción
   ```

5. **Personalizar los textos** (nombres, fecha, horarios, WhatsApp, cuentas,
   historia): hoy viven dentro de `app/components/oliva/InvitationOliva.tsx`.
   Con varios clientes del mismo diseño conviene extraerlos a props o a un
   archivo de configuración por cliente.

6. **Listo.** La música por grupos y la protección de contenido cubren las
   subrutas nuevas automáticamente (layout del diseño). La galería comparte
   las fotos del diseño (`design = 'oliva'` en Supabase); para separar fotos
   por cliente habría que agregar un nuevo valor de `design`.

## Nombres fijos de fotos

**Diseño oliva** (en `public/oliva/<cliente>/photos/`):

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

**Diseño playa** (en `public/playa/<cliente>/photos/`):

| Archivo | Ubicación |
| --- | --- |
| `portada.jpg` | Foto de portada (4:3 aprox.) |
| `pareja-1.jpg` | Foto a página completa tras la portada |
| `nosotros-1.jpg` | Historia, foto grande (se recorta a 3:4) |
| `nosotros-2.jpg` | Historia, foto chica (3:4) |
| `pareja-2.jpg` | Foto bajo el countdown |
| `final.jpg` | Foto de cierre a página completa |

Ojo (playa): el QR de Yape (`qr-yape.png`), el sobre de confirmar
(`sobre-confirmar.png`), el boceto del arco (`foto-arco.png`) y el fondo de
regalos (`regalos-bg.jpg`) hoy son fijos en `/playa-demo/` y muestran los de
Israel & Marisol; un cliente playa nuevo necesita reemplazarlos en el código
(o convertirlos a props, cambio pequeño en `InvitationPlaya.tsx`).

## Checklist final

- [ ] `npm run build` pasa sin errores y lista las rutas nuevas
- [ ] La invitación del cliente NO muestra el banner "Esta es una demo"
- [ ] Fotos y canción del cliente copiadas en `public/<diseño>/<cliente>/`
- [ ] El botón de música suena y la canción continúa al ir a la galería
- [ ] "Volver a la invitación" en la galería regresa a la ruta del cliente
