// Borra los archivos vencidos (expires_at < now()) del bucket y de la tabla.
// Pensado para un cron externo (Vercel Cron, cron-job.org, etc.):
//   POST /api/cleanup-expired
//   Authorization: Bearer <CLEANUP_SECRET_TOKEN>
// El botón del panel de admin usa /api/admin/cleanup (cookie de sesión).

import { deleteExpiredMedia } from "@/lib/cleanup";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = process.env.CLEANUP_SECRET_TOKEN;
  if (!token) {
    return Response.json(
      { deleted: 0, errors: ["CLEANUP_SECRET_TOKEN no está configurado en el servidor."] },
      { status: 500 }
    );
  }

  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${token}`) {
    return Response.json({ deleted: 0, errors: ["No autorizado."] }, { status: 401 });
  }

  const result = await deleteExpiredMedia();
  return Response.json(result, { status: result.errors.length > 0 ? 207 : 200 });
}
