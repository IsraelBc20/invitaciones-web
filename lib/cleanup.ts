// Limpieza de archivos vencidos (expires_at < now()).
//
// Corre SOLO en el servidor: la anon key no puede borrar (RLS), así que usa la
// service role key. La lógica está aquí para que la compartan las dos rutas que
// la disparan: /api/cleanup-expired (token de cron) y /api/admin/cleanup (botón
// del panel, protegido por la cookie de admin).

import { createClient } from "@supabase/supabase-js";
import { BUCKET, storagePathFromUrl } from "./media";

export interface CleanupResult {
  deleted: number;
  errors: string[];
}

/** Cliente con service role (bypassa RLS). Null si falta la variable. */
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function deleteExpiredMedia(): Promise<CleanupResult> {
  const supabase = adminClient();
  if (!supabase) {
    return {
      deleted: 0,
      errors: ["Falta SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor."],
    };
  }

  const errors: string[] = [];
  const nowIso = new Date().toISOString();

  const { data: rows, error } = await supabase
    .from("photos")
    .select("id, url")
    .not("expires_at", "is", null)
    .lt("expires_at", nowIso);

  if (error) return { deleted: 0, errors: [error.message] };
  if (!rows || rows.length === 0) return { deleted: 0, errors };

  // 1) Archivos del bucket. Las filas cuya URL no se puede mapear a una ruta del
  //    bucket igual se borran de la tabla (el archivo ya no existe o es externo).
  const paths: string[] = [];
  for (const row of rows) {
    const path = storagePathFromUrl(row.url);
    if (path) paths.push(path);
    else errors.push(`No se pudo deducir la ruta del archivo: ${row.url}`);
  }
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove(paths);
    if (storageError) errors.push(`Storage: ${storageError.message}`);
  }

  // 2) Filas de la tabla.
  const ids = rows.map((r) => r.id);
  const { error: deleteError } = await supabase.from("photos").delete().in("id", ids);
  if (deleteError) {
    errors.push(`Tabla photos: ${deleteError.message}`);
    return { deleted: 0, errors };
  }

  return { deleted: ids.length, errors };
}
