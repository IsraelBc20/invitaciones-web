// Reglas y helpers compartidos para subir fotos y videos de los invitados.
// La subida usa XMLHttpRequest contra la API de Storage (supabase-js no expone
// progreso de subida); el registro en la tabla photos sí usa supabase-js.

import { supabase } from "./supabase";

export type MediaKind = "photo" | "video";

export const PHOTO_EXTS = ["jpg", "jpeg", "png", "webp", "heic"];
export const VIDEO_EXTS = ["mp4", "mov", "avi"];

export const MAX_PHOTO_BYTES = 100 * 1024 * 1024; // 100MB
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500MB

export const ACCEPT_ATTR = [
  ...PHOTO_EXTS.map((e) => "." + e),
  ...VIDEO_EXTS.map((e) => "." + e),
  "image/*",
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
].join(",");

const BUCKET = "wedding-photos";

export function fileExt(name: string): string {
  return (name.split(".").pop() || "").toLowerCase();
}

export function kindFromExt(ext: string): MediaKind | null {
  if (PHOTO_EXTS.includes(ext)) return "photo";
  if (VIDEO_EXTS.includes(ext)) return "video";
  return null;
}

/** Deduce el tipo de un item ya guardado (filas viejas no tienen file_type). */
export function kindFromUrl(url: string): MediaKind {
  return VIDEO_EXTS.includes(fileExt(url.split("?")[0])) ? "video" : "photo";
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  if (bytes >= 1024) return Math.round(bytes / 1024) + " KB";
  return bytes + " B";
}

/** Devuelve el tipo de archivo, o un mensaje de error si no es válido. */
export function validateFile(
  file: File
): { ok: true; kind: MediaKind } | { ok: false; error: string } {
  const ext = fileExt(file.name);
  const kind = kindFromExt(ext);
  if (!kind) {
    return {
      ok: false,
      error: `Formato no compatible (.${ext || "?"}). Fotos: ${PHOTO_EXTS.join(", ")} · Videos: ${VIDEO_EXTS.join(", ")}.`,
    };
  }
  const max = kind === "photo" ? MAX_PHOTO_BYTES : MAX_VIDEO_BYTES;
  if (file.size > max) {
    return {
      ok: false,
      error: `El ${kind === "photo" ? "archivo" : "video"} pesa ${formatBytes(file.size)} y el máximo es ${formatBytes(max)}.`,
    };
  }
  return { ok: true, kind };
}

const FALLBACK_MIME: Record<string, string> = {
  heic: "image/heic",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
};

/** Sube un archivo al bucket con progreso real (0–100). Devuelve la URL pública. */
export function uploadToStorage(
  file: File,
  designId: string,
  kind: MediaKind,
  onProgress: (pct: number) => void
): Promise<string> {
  const ext = fileExt(file.name) || (kind === "photo" ? "jpg" : "mp4");
  const path = `${designId}/${kind === "photo" ? "foto" : "video"}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const contentType = file.type || FALLBACK_MIME[ext] || "application/octet-stream";

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/storage/v1/object/${BUCKET}/${path}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("Authorization", `Bearer ${anonKey}`);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("Cache-Control", "max-age=3600");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        resolve(data.publicUrl);
      } else if (xhr.status === 413) {
        reject(new Error("El archivo supera el límite del servidor de almacenamiento."));
      } else {
        reject(new Error(`Error del servidor (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Error de red durante la subida."));
    xhr.send(file);
  });
}

/** Registra el archivo subido en la tabla photos.
 * Si la migración de file_type/file_size aún no se ejecutó, reintenta sin esas columnas. */
export async function insertMediaRow(
  url: string,
  uploaderName: string,
  designId: string,
  kind: MediaKind,
  size: number
): Promise<void> {
  let { error } = await supabase.from("photos").insert({
    url,
    uploader_name: uploaderName,
    design: designId,
    file_type: kind,
    file_size: size,
  });
  if (error && (error.code === "PGRST204" || /file_(type|size)/.test(error.message))) {
    ({ error } = await supabase
      .from("photos")
      .insert({ url, uploader_name: uploaderName, design: designId }));
  }
  if (error) throw error;
}
