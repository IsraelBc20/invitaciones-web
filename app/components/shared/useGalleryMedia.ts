"use client";

// Carga de las fotos y videos de una galería (oliva, playa, tortuga-tropical).
// Cada diseño renderiza su propia UI; aquí vive solo la consulta.
//
// Filtra por design + invitation: cada invitación (la demo y la de cada cliente)
// tiene su propia galería aunque compartan diseño.
//
// Antes cada galería hacía el fetch inline con `if (!error && data) setItems(data)`:
// si la consulta fallaba, el error se tragaba y la pantalla quedaba idéntica a
// una galería vacía ("Aún no hay recuerdos"), sin forma de distinguir "no hay
// fotos" de "no se pudieron cargar". Además solo consultaba al montar, así que
// una galería abierta antes de subir se quedaba con la lista vieja.

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MediaKind } from "@/lib/media";

export interface GalleryItem {
  id: string;
  url: string;
  uploader_name: string;
  created_at: string;
  file_type?: MediaKind | null;
}

export function useGalleryMedia(designId: string, invitation: string) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      let { data, error: queryError } = await supabase
        .from("photos")
        .select("*")
        .eq("design", designId)
        .eq("invitation", invitation)
        .order("created_at", { ascending: false });

      // Si la migración `invitation` todavía no se ejecutó, la consulta falla
      // con 42703 (columna inexistente). Se reintenta solo por diseño para que
      // la galería siga funcionando entre el deploy y el SQL — mismo criterio
      // que el fallback en cascada de insertMediaRow. Es transitorio: una vez
      // ejecutada la migración esta rama no se vuelve a usar.
      if (queryError?.code === "42703") {
        ({ data, error: queryError } = await supabase
          .from("photos")
          .select("*")
          .eq("design", designId)
          .order("created_at", { ascending: false }));
      }

      // No se pisan los items ya cargados: si falla una recarga, se sigue
      // viendo lo que había además del aviso.
      if (queryError) setError(queryError.message);
      else {
        setError("");
        setItems(data || []);
      }
    } catch (e) {
      // Sin red (o petición abortada) supabase-js RECHAZA la promesa en vez de
      // devolver `error`: sin este catch la galería se quedaba en "Cargando
      // recuerdos..." para siempre.
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }, [designId, invitation]);

  // load() es async: los setState ocurren después del fetch, no de forma
  // síncrona dentro del efecto.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Recargar al volver a la pestaña o a la página (incluido el bfcache del
  // botón "atrás", que NO vuelve a montar el componente): así una galería que
  // quedó abierta antes de subir no se queda con la lista vieja.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, [load]);

  return { items, loading, error, reload: load };
}
