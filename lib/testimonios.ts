// Reseñas reales de clientes para la sección "La confianza se construye en
// cada celebración" del catálogo. Mientras el arreglo esté vacío la sección
// NO se muestra. No inventar reseñas: agregar solo mensajes reales.
//
// captura: ruta en public/ a la captura del mensaje (p. ej. "/resenas/ana.jpg").
// enlace:  link al mensaje o publicación original.
// Con cualquiera de los dos la tarjeta muestra "Ver mensaje original".

export interface Testimonio {
  nombre: string;
  rol: string;
  texto: string;
  captura?: string;
  enlace?: string;
}

export const TESTIMONIOS: Testimonio[] = [];
