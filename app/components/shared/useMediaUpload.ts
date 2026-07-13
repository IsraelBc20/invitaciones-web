"use client";

// Lógica compartida de la sección "Sube tus fotos y videos" (oliva, playa, ...).
// Cada diseño renderiza su propia UI con su estética; este hook maneja el estado:
// selección con validación, previews, progreso individual y subida secuencial.

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaKind, insertMediaRow, uploadToStorage, validateFile } from "@/lib/media";

export interface UploadItem {
  id: string;
  file: File;
  kind: MediaKind | null; // null = archivo rechazado
  previewUrl: string;
  progress: number; // 0–100
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

let nextId = 0;

export function useMediaUpload(designId: string) {
  const [uploaderName, setUploaderName] = useState("");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [formError, setFormError] = useState("");
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Liberar los object URLs al desmontar
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    };
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    setFormError("");
    const added: UploadItem[] = Array.from(files).map((file) => {
      const v = validateFile(file);
      return {
        id: `u${nextId++}`,
        file,
        kind: v.ok ? v.kind : null,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: v.ok ? "pending" : "error",
        error: v.ok ? undefined : v.error,
      };
    });
    setItems((prev) => [...prev, ...added]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const it = prev.find((p) => p.id === id);
      if (it) URL.revokeObjectURL(it.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const reset = useCallback(() => {
    itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setItems([]);
    setUploadDone(false);
    setFormError("");
  }, []);

  const patchItem = (id: string, patch: Partial<UploadItem>) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const uploadAll = useCallback(async () => {
    const name = uploaderName.trim();
    const pending = itemsRef.current.filter((it) => it.status === "pending" && it.kind);
    if (!name) {
      setFormError("Por favor ingresa tu nombre antes de subir tus archivos.");
      return;
    }
    if (pending.length === 0) {
      setFormError("Selecciona al menos una foto o video válido.");
      return;
    }
    setUploading(true);
    setFormError("");
    let failed = 0;
    for (const it of pending) {
      patchItem(it.id, { status: "uploading", progress: 0 });
      try {
        const url = await uploadToStorage(it.file, designId, it.kind!, (pct) =>
          patchItem(it.id, { progress: pct })
        );
        await insertMediaRow(url, name, designId, it.kind!, it.file.size);
        patchItem(it.id, { status: "done", progress: 100 });
      } catch (e) {
        failed++;
        patchItem(it.id, {
          status: "error",
          error: e instanceof Error ? e.message : "Error al subir. Intenta de nuevo.",
        });
      }
    }
    setUploading(false);
    if (failed === 0) {
      setUploadDone(true);
    } else {
      setFormError(
        `${failed} archivo${failed > 1 ? "s" : ""} no se pudo${failed > 1 ? "ieron" : ""} subir. Revisa los mensajes e intenta de nuevo.`
      );
    }
  }, [designId, uploaderName]);

  const validCount = items.filter((it) => it.status !== "error" || it.kind).length;
  const pendingCount = items.filter((it) => it.status === "pending").length;

  return {
    uploaderName,
    setUploaderName,
    items,
    addFiles,
    removeItem,
    reset,
    uploadAll,
    uploading,
    uploadDone,
    setUploadDone,
    formError,
    validCount,
    pendingCount,
  };
}
