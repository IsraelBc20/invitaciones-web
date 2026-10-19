// Configuración central de los diseños del catálogo.
// Para agregar un diseño nuevo: crear su ruta en app/<id>/ y añadir un objeto aquí.

export interface Design {
  id: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  /** null en los diseños sin galería de invitados (p. ej. cumpleaños). */
  galeriaRuta: string | null;
  disponible: boolean;
  colores: string[];
  tags: string[];
  categoria: Categoria;
  /**
   * Screenshot de la portada para el celular del catálogo (ruta en public/).
   * Sin él, el celular muestra colores[0] con el nombre del diseño.
   */
  preview?: string;
}

export type Categoria = "boda" | "cumpleanos";

/** Precio en soles por categoría; `antes` se muestra tachado. */
export const PRECIOS: Record<Categoria, { precio: number; antes?: number }> = {
  boda: { precio: 89, antes: 109 },
  cumpleanos: { precio: 59 },
};

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
    categoria: "boda",
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
    categoria: "boda",
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
    categoria: "boda",
  },
  {
    id: "cabo-azul",
    nombre: "Cabo Azul",
    descripcion:
      "Scrapbook náutico en crema y azul: polaroids con clip, conchas y sellos postales dibujados a mano, cuenta regresiva sobre acuarela y galería de fotos y videos para invitados.",
    ruta: "/cabo-azul",
    galeriaRuta: "/cabo-azul/galeria",
    disponible: true,
    colores: ["#007caf", "#f5ede7", "#cfe3ec"],
    tags: ["Boda Civil", "Playa", "Scrapbook"],
    categoria: "boda",
  },
  {
    id: "kpop-guerreras",
    nombre: "K-Pop Guerreras",
    descripcion: "Invitación de cumpleaños infantil con temática K-pop brillante y colorida.",
    // Los cumpleaños viven bajo /cumpleanos/<id> y no tienen galería.
    ruta: "/cumpleanos/kpop-guerreras",
    galeriaRuta: null,
    disponible: true,
    colores: ["#6b0fa8", "#e91e8c", "#1a1a2e", "#f5d800"],
    tags: ["Cumpleaños", "Infantil", "K-pop"],
    categoria: "cumpleanos",
  },
  // Futuros diseños se agregan aquí:
];
