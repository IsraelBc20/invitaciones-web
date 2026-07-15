"use client";

// Regla compartida de cuándo se habilita la sección "Sube tus fotos y videos".
// Cada diseño renderiza su propio panel de "bloqueado" con su estética; aquí solo
// vive la DECISIÓN y los textos, para no duplicarla en oliva/playa/tortuga.
//
//  - En la DEMO: la subida está bloqueada para todos (por ahora). Se muestra un
//    aviso para escribir por WhatsApp. (Pendiente: permitir 3 archivos al dueño
//    según su IP — ver CLAUDE.md.)
//  - En las invitaciones de CLIENTES: la subida está bloqueada hasta el día de la
//    boda, 12:00 del mediodía (hora de Perú); a partir de ahí funciona normal.
//
// Esto es disuasión de UI (oculta el formulario), no seguridad real: el bucket de
// Supabase sigue aceptando inserts con la anon key. Es coherente con el resto del
// proyecto (ver ContentProtection).

import { useEffect, useState } from "react";

// Instante exacto en que se habilita la subida en las invitaciones de clientes:
// 12 de septiembre de 2026, 12:00 del mediodía, hora de Perú (UTC-5, sin horario
// de verano). Se compara contra Date.now() (instante absoluto en epoch), así que
// el resultado NO depende de la zona horaria del visitante.
export const CLIENT_UPLOAD_OPENS_AT = new Date("2026-09-12T12:00:00-05:00").getTime();

// WhatsApp de contacto para el flujo de subida (demo bloqueada para invitados).
export const UPLOAD_CONTACT_WA = `https://wa.me/51993092110?text=${encodeURIComponent(
  "¡Hola! Estuve viendo la demo de las invitaciones y me gustaría saber cómo funciona la subida de fotos y videos de los invitados. 📸"
)}`;

export type UploadGate =
  | { blocked: false }
  | {
      blocked: true;
      kind: "demo" | "before-wedding";
      title: string;
      message: string;
      whatsapp?: string; // solo en el caso demo
    };

const DEMO_GATE: UploadGate = {
  blocked: true,
  kind: "demo",
  title: "Subida no disponible en la demo",
  message:
    "Esta es una vista de demostración. Para conocer cómo funciona la subida de fotos y videos de los invitados, comunícate con nosotros por WhatsApp.",
  whatsapp: UPLOAD_CONTACT_WA,
};

const BEFORE_WEDDING_GATE: UploadGate = {
  blocked: true,
  kind: "before-wedding",
  title: "Aún no es momento de subir tus recuerdos",
  message:
    "Podrás subir tus fotos y videos el día de la boda, a partir de las 12:00 del mediodía del 12 de septiembre de 2026. ¡Te esperamos!",
};

/**
 * Decide si la sección de subida está habilitada.
 *
 * `ready` arranca en false y la comprobación por fecha se hace recién en
 * useEffect para evitar hydration mismatch (renderizar Date.now() en el estado
 * inicial rompe la hidratación — mismo patrón que los countdowns del proyecto).
 * El caso demo no depende del reloj, así que se resuelve de inmediato.
 */
export function useUploadGate(demo: boolean): { ready: boolean; gate: UploadGate } {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
  }, []);

  if (demo) return { ready: true, gate: DEMO_GATE };

  if (now === null) return { ready: false, gate: { blocked: false } };
  return {
    ready: true,
    gate: now < CLIENT_UPLOAD_OPENS_AT ? BEFORE_WEDDING_GATE : { blocked: false },
  };
}
