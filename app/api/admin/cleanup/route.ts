// Mismo borrado que /api/cleanup-expired, pero disparado desde el botón
// "Eliminar archivos vencidos" del panel: autoriza con la cookie de admin en
// lugar del token de cron (el token es secreto del servidor y el panel corre
// en el navegador).

import { deleteExpiredMedia } from "@/lib/cleanup";
import { isAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ deleted: 0, errors: ["No autorizado."] }, { status: 401 });
  }
  const result = await deleteExpiredMedia();
  return Response.json(result, { status: result.errors.length > 0 ? 207 : 200 });
}
