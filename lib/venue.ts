// Dirección del local, compartida por los tres diseños.
//
// Regla (9 sep 2026): las DEMOS nunca muestran la dirección real de los novios.
// Son páginas públicas del catálogo, así que usan un placeholder genérico y sus
// mapas apuntan a la Plaza de Armas de Lima. La dirección real solo aparece en
// las rutas de cliente (`/<diseño>/<cliente>`), que se renderizan sin la prop
// `demo`.
//
// Vive en lib/ y no en cada componente porque antes estaba triplicada y derivó:
// oliva y playa decían "Norte 404" mientras tortuga-tropical decía "Norte 402"
// (detectado el 9 sep 2026). El número bueno es el 402.

export interface Venue {
  /** Calle y número, sin ciudad. */
  street: string;
  /** Ciudad; se muestra sola en la tarjeta de fecha de oliva y tortuga. */
  city: string;
  /** "Calle 123 - Ciudad", el formato de una línea que usan playa y tortuga. */
  line: string;
  /** "lat,lng" para los enlaces de Google Maps ("" si se busca por nombre). */
  coords: string;
  /** Botón "Ver en Google Maps" / "Ver en maps". */
  mapsUrl: string;
  /** Botón "Cómo llegar". */
  directionsUrl: string;
  /** `src` del iframe del mapa. */
  embedUrl: string;
}

function venue(street: string, city: string, coords: string): Venue {
  return {
    street,
    city,
    line: `${street} - ${city}`,
    coords,
    mapsUrl: `https://www.google.com/maps?q=${coords}`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${coords}`,
    embedUrl: `https://maps.google.com/maps?q=${coords}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
  };
}

/** Local real de la boda de Israel & Marisol. Solo en rutas de cliente. */
export const VENUE_REAL = venue(
  "Av. Circunvalación Norte 402",
  "Huaral",
  "-11.489522,-77.206264",
);

/** Placeholder de las demos. Los mapas apuntan a la Plaza de Armas de Lima. */
export const VENUE_DEMO = venue(
  "Av. Sin Nombre 123",
  "Lima",
  "-12.045833,-77.030278",
);

/**
 * Local del cumpleaños de Emilia (K-Pop Guerreras): Plaza de Armas de Huaral
 * (21 oct 2026). Sin coordenadas: los enlaces y el iframe buscan el lugar por
 * nombre. No usar un embed `pb=` con -11.489522,-77.206264: esas son las
 * coordenadas del local de la boda (VENUE_REAL), no de la plaza.
 */
const HUARAL_PLAZA = "plaza+de+armas+huaral";
export const VENUE_EMILIA: Venue = {
  street: "Plaza de Armas de Huaral",
  city: "Huaral",
  line: "Plaza de Armas de Huaral",
  coords: "",
  mapsUrl: `https://www.google.com/maps?q=${HUARAL_PLAZA}`,
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${HUARAL_PLAZA}`,
  embedUrl: `https://maps.google.com/maps?q=${HUARAL_PLAZA}&output=embed`,
};

/**
 * Elige la dirección según la prop `demo` de la invitación. `real` es el local
 * del cliente; por defecto el de la boda, los cumpleaños pasan el suyo.
 */
export function venueFor(demo: boolean, real: Venue = VENUE_REAL): Venue {
  return demo ? VENUE_DEMO : real;
}
