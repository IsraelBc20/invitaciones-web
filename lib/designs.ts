// Configuración central de los diseños del catálogo.
// Para agregar un diseño nuevo: crear su ruta en app/<id>/ y añadir un objeto aquí.

export interface Design {
  id: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  galeriaRuta: string;
  disponible: boolean;
  colores: string[];
  tags: string[];
}

export const designs: Design[] = [
  {
    id: "oliva",
    nombre: "Oliva Elegante",
    descripcion:
      "Invitación sofisticada en tonos oliva y perla con flores decorativas, música de fondo, cuenta regresiva y galería de fotos para invitados.",
    ruta: "/oliva",
    galeriaRuta: "/oliva/galeria",
    disponible: true,
    colores: ["#6b7c5c", "#f5f0e8", "#d4af37"],
    tags: ["Boda Civil", "Romántico", "Con música"],
  },
  {
    id: "playa",
    nombre: "Playa Tropical",
    descripcion:
      "Recuerdos junto al mar estilo scrapbook: fotos a página completa con cintas washi, cuenta regresiva, QR de Yape y galería de fotos para invitados.",
    ruta: "/playa",
    galeriaRuta: "/playa/galeria",
    disponible: true,
    colores: ["#6f8f9d", "#f6f2ee", "#304c3a"],
    tags: ["Boda", "Playa", "Tropical"],
  },
  {
    id: "tortuga-tropical",
    nombre: "Tortuga Tropical",
    descripcion:
      "Brisa marina en azul petróleo y coral: tortuguitas, cuenta regresiva, itinerario ilustrado, QR de Yape y galería de fotos y videos para invitados.",
    ruta: "/tortuga-tropical",
    galeriaRuta: "/tortuga-tropical/galeria",
    disponible: true,
    colores: ["#02536f", "#faf3eb", "#f56646"],
    tags: ["Boda Civil", "Playa", "Tropical"],
  },
  // Futuros diseños se agregan aquí:
];
