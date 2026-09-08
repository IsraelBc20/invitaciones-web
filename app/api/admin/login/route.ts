// Login del panel /admin/galeria: compara con ADMIN_PASSWORD y deja la cookie
// httpOnly que autoriza las rutas /api/admin/*.

import { ADMIN_COOKIE, adminToken, checkPassword } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let password: unknown = null;
  try {
    ({ password } = await request.json());
  } catch {
    return Response.json({ ok: false, error: "Petición inválida." }, { status: 400 });
  }

  const token = adminToken();
  if (!token) {
    return Response.json(
      { ok: false, error: "ADMIN_PASSWORD no está configurado en el servidor." },
      { status: 500 }
    );
  }
  if (!checkPassword(password)) {
    return Response.json({ ok: false, error: "Contraseña incorrecta" }, { status: 401 });
  }

  const res = Response.json({ ok: true });
  res.headers.set(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );
  return res;
}
