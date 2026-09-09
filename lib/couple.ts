// Nombres de los novios para la firma del pie de página.
//
// Misma regla que lib/venue.ts (9 sep 2026): las DEMOS no muestran datos reales.
// Los footers de las 3 invitaciones demo y de sus 3 galerías firman con una
// pareja ficticia y la ciudad del placeholder; las rutas de cliente conservan
// los nombres y la ciudad reales.

import { venueFor } from "@/lib/venue";

/** Novios reales. Solo en rutas de cliente. */
export const COUPLE_REAL = "Israel & Marisol";

/** Pareja ficticia de las demos. */
export const COUPLE_DEMO = "Julian & Isabela";

export function coupleFor(demo: boolean): string {
  return demo ? COUPLE_DEMO : COUPLE_REAL;
}

/**
 * Firma completa del footer: "Nombres · Ciudad 2026".
 * La usan oliva y playa (invitación + galería) y la galería de tortuga.
 * El footer de la invitación de tortuga no lleva ciudad: arma su propia cadena
 * con `coupleFor`.
 */
export function signatureFor(demo: boolean): string {
  return `${coupleFor(demo)} · ${venueFor(demo).city} 2026`;
}
