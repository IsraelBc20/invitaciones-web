// Nombres de los novios.
//
// Misma regla que lib/venue.ts (9 sep 2026): las DEMOS no muestran datos reales.
// Las 3 invitaciones demo y sus 3 galerías usan una pareja ficticia; las rutas
// de cliente conservan los nombres reales.

import { venueFor } from "@/lib/venue";

export interface Couple {
  /** Primer nombre; portadas y pantallas de entrada lo muestran solo. */
  first: string;
  /** Segundo nombre, en la línea de abajo de la portada. */
  second: string;
  /** "Israel & Marisol": firma del footer y cabecera de las galerías. */
  amp: string;
  /**
   * "Israel y Marisol": forma en prosa del mensaje de WhatsApp. Se guarda
   * literal en vez de armarla con "y", porque en español la conjunción cambia
   * a "e" delante de un sonido /i/: "Julian e Isabela".
   */
  prose: string;
}

/** Novios reales. Solo en rutas de cliente. */
export const COUPLE_REAL: Couple = {
  first: "Israel",
  second: "Marisol",
  amp: "Israel & Marisol",
  prose: "Israel y Marisol",
};

/** Pareja ficticia de las demos. */
export const COUPLE_DEMO: Couple = {
  first: "Julian",
  second: "Isabela",
  amp: "Julian & Isabela",
  prose: "Julian e Isabela",
};

export function coupleFor(demo: boolean): Couple {
  return demo ? COUPLE_DEMO : COUPLE_REAL;
}

/**
 * Firma completa del footer: "Nombres · Ciudad 2026".
 * La usan oliva y playa (invitación + galería) y la galería de tortuga.
 * El footer de la invitación de tortuga no lleva ciudad: arma su propia cadena
 * con `coupleFor`.
 */
export function signatureFor(demo: boolean): string {
  return `${coupleFor(demo).amp} · ${venueFor(demo).city} 2026`;
}
