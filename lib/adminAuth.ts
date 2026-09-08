// Autenticación mínima del panel /admin/galeria.
//
// El login (POST /api/admin/login) compara la contraseña con ADMIN_PASSWORD
// (variable de entorno, NUNCA NEXT_PUBLIC_) y deja una cookie httpOnly con un
// token derivado de esa contraseña. Las rutas de admin verifican la cookie.
//
// Es la misma clase de protección que el resto del proyecto: suficiente para un
// panel privado de una sola persona, no un sistema de sesiones real.

import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "admin_session";

function adminPassword(): string | null {
  const pass = process.env.ADMIN_PASSWORD;
  return pass && pass.length > 0 ? pass : null;
}

/** Token de sesión derivado de la contraseña (no la expone en la cookie). */
export function adminToken(): string | null {
  const pass = adminPassword();
  if (!pass) return null;
  return createHash("sha256").update(`invitaciones-admin:${pass}`).digest("hex");
}

/** Comparación en tiempo constante de dos strings. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** ¿La contraseña recibida en el login es la correcta? */
export function checkPassword(candidate: unknown): boolean {
  const pass = adminPassword();
  if (!pass || typeof candidate !== "string") return false;
  return safeEqual(candidate, pass);
}

/** ¿La cookie de sesión de la request es válida? */
export function isAdminRequest(req: Request): boolean {
  const expected = adminToken();
  if (!expected) return false;
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`));
  return !!match && safeEqual(match[1], expected);
}
