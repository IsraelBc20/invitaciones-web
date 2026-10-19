// Textos y enlaces del modal "límite de almacenamiento alcanzado".
// La regla (500MB acumulados por invitado) vive en lib/media.ts (GUEST_MAX_BYTES)
// y se aplica en useMediaUpload; aquí solo está el CONTENIDO del modal, para no
// duplicarlo en oliva/playa/tortuga. Cada diseño lo pinta con su paleta usando
// UploadLimitModal.

const WA_TEXT_NOVIOS = "Hola %s, quiero compartir más fotos de tu boda";

function wa(phone: string, text: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/** Contactos de los novios (solo en invitaciones reales, no en las demos). */
export const WA_MARISOL = wa("51943905219", WA_TEXT_NOVIOS.replace("%s", "Marisol"));
export const WA_ISRAEL = wa("51993092110", WA_TEXT_NOVIOS.replace("%s", "Israel"));

/** Contacto del negocio (solo en las demos). */
export const WA_NEGOCIO = wa("51993092110", "Hola, quiero contratar una invitación digital");

export const WHATSAPP_GREEN = "#25D366";

export interface LimitModalCopy {
  title: string;
  message: string;
  buttons: { label: string; href: string }[];
}

const CLIENT_COPY: LimitModalCopy = {
  title: "¡Límite de almacenamiento alcanzado!",
  message:
    "Has compartido muchos recuerdos hermosos (máximo 500MB por persona). Si deseas enviar más fotos o videos, puedes hacerlo directamente por WhatsApp:",
  buttons: [
    { label: "Enviar a Marisol", href: WA_MARISOL },
    { label: "Enviar a Israel", href: WA_ISRAEL },
  ],
};

const DEMO_COPY: LimitModalCopy = {
  title: "¡Límite de almacenamiento alcanzado!",
  message:
    "Has alcanzado el límite de la versión demo. Para una galería sin límites para tu boda, ¡contáctanos!",
  buttons: [{ label: "Escríbenos por WhatsApp", href: WA_NEGOCIO }],
};

export function limitModalCopy(demo: boolean): LimitModalCopy {
  return demo ? DEMO_COPY : CLIENT_COPY;
}
