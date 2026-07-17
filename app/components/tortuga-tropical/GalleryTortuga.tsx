"use client";

// Galería del diseño Tortuga Tropical. La usan /tortuga-tropical/galeria (demo)
// y las galerías de clientes (p. ej. /tortuga-tropical/israel-y-marisol/galeria):
// todas leen las mismas fotos (design = 'tortuga-tropical'); solo cambia el
// enlace "Volver" (backHref) y la canción (musicSrc).

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { MediaKind, kindFromUrl } from "@/lib/media";
import Lightbox from "@/app/components/shared/Lightbox";
import { useMusic } from "@/app/components/shared/useMusic";
import { MusicFab, MUSIC_SRC } from "@/app/components/tortuga-tropical/InvitationTortuga";

const DESIGN_ID = "tortuga-tropical";

// Perandory: fuente original del diseño (ver comentario en InvitationTortuga.tsx)
const DISPLAY = "'Perandory', 'Cinzel', Georgia, serif";
const BODY = "'DM Sans', 'Segoe UI', Arial, sans-serif";

interface MediaItem {
  id: string;
  url: string;
  uploader_name: string;
  created_at: string;
  file_type?: MediaKind | null;
}

type Filter = "all" | MediaKind;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "photo", label: "Fotos" },
  { id: "video", label: "Videos" },
];

function kindOf(item: MediaItem): MediaKind {
  return item.file_type ?? kindFromUrl(item.url);
}

function applyTheme() {
  const r = document.documentElement.style;
  r.setProperty("--bg", "#faf3eb");
  r.setProperty("--bg-2", "#e6f2f0");
  r.setProperty("--ink", "#02536f");
  r.setProperty("--ink-soft", "#03898c");
  r.setProperty("--accent", "#03898c");
  r.setProperty("--paper", "#fdfbf8");
  r.setProperty("--speed", "1");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GalleryTortuga({
  backHref = "/tortuga-tropical",
  musicSrc = MUSIC_SRC,
  emptyImage = "/tortuga-tropical-demo/photos/tortuga-galeria.png",
}: {
  backHref?: string;
  // La galería de un cliente pasa la misma canción que su invitación
  // (p. ej. /tortuga-tropical/israel-y-marisol/music.mp3) para que el audio continúe.
  musicSrc?: string;
  // Imagen del estado vacío ("Aún no hay recuerdos"). El demo usa la tortuga
  // del diseño; cada cliente puede pasar la suya (p. ej. foto-galeria.png).
  emptyImage?: string;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  // Misma canción que la invitación: si llegó sonando, aquí sigue hasta pausar
  const { playing, toggle } = useMusic(musicSrc, DESIGN_ID);

  useEffect(() => {
    applyTheme();
    supabase
      .from("photos")
      .select("*")
      .eq("design", DESIGN_ID)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setItems(data);
        setLoading(false);
      });
  }, []);

  const photoCount = useMemo(() => items.filter((i) => kindOf(i) === "photo").length, [items]);
  const videoCount = items.length - photoCount;
  const filtered = filter === "all" ? items : items.filter((i) => kindOf(i) === filter);

  return (
    <div id="invitation-root">
      {/* Header */}
      <div
        style={{
          padding: "60px 28px 36px",
          textAlign: "center",
          background: "var(--bg)",
          borderBottom: "1px solid rgba(2,83,111,0.1)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, var(--accent), var(--bg-2), var(--accent))",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            fontFamily: BODY,
            fontSize: 10,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
          }}
        >
          Israel &amp; Marisol · 12 · 09 · 2026
        </div>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 400,
            fontSize: 46,
            lineHeight: 1,
            color: "var(--ink)",
            marginTop: 14,
          }}
        >
          Galería
        </h1>
        <p
          style={{
            fontFamily: BODY,
            fontSize: 15,
            color: "var(--ink-soft)",
            marginTop: 12,
          }}
        >
          Los recuerdos de nuestro día especial
        </p>
        {items.length > 0 && (
          <div
            style={{
              fontFamily: BODY,
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: 16,
              color: "var(--accent)",
            }}
          >
            {photoCount} foto{photoCount !== 1 ? "s" : ""} · {videoCount} video
            {videoCount !== 1 ? "s" : ""}
          </div>
        )}
        <Link
          href={backHref}
          style={{
            display: "inline-block",
            marginTop: 22,
            fontFamily: BODY,
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--accent)",
            textDecoration: "none",
          }}
        >
          ← Volver a la invitación
        </Link>
      </div>

      {/* Filtros */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          padding: "20px 14px 0",
          background: "var(--bg)",
        }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                appearance: "none",
                cursor: "pointer",
                fontFamily: BODY,
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                padding: "12px 22px",
                borderRadius: 999,
                border: "1px solid var(--accent)",
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#fdfdfe" : "var(--accent)",
                transition: "all 0.25s ease",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      <div style={{ padding: "24px 14px 80px", background: "var(--bg)", minHeight: "60vh" }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              fontFamily: BODY,
              fontSize: 16,
              color: "var(--ink-soft)",
            }}
          >
            Cargando recuerdos...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "80px 28px",
            }}
          >
            <img
              src={emptyImage}
              alt="Sin fotos aún"
              draggable={false}
              style={{ width: 120, marginBottom: 16, margin: "0 auto 16px", display: "block" }}
            />
            <h3
              style={{
                fontFamily: DISPLAY,
                fontSize: 30,
                color: "var(--ink)",
                marginBottom: 12,
              }}
            >
              {filter === "video"
                ? "Aún no hay videos"
                : filter === "photo"
                  ? "Aún no hay fotos"
                  : "Aún no hay recuerdos"}
            </h3>
            <p
              style={{
                fontFamily: BODY,
                fontSize: 15,
                color: "var(--ink-soft)",
              }}
            >
              El 12 de septiembre, los invitados podrán subir sus fotos y videos aquí.
            </p>
          </div>
        ) : (
          /* Masonry de 2 columnas */
          <div style={{ columns: 2, gap: 10, columnFill: "balance" }}>
            {filtered.map((item, idx) => (
              <div key={item.id} style={{ breakInside: "avoid", marginBottom: 12 }}>
                <button
                  onClick={() => setLightboxIndex(idx)}
                  aria-label={`Ver ${kindOf(item) === "video" ? "video" : "foto"} de ${item.uploader_name}`}
                  style={{
                    appearance: "none",
                    border: 0,
                    padding: 0,
                    background: "transparent",
                    display: "block",
                    width: "100%",
                    cursor: "pointer",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(2,83,111,0.16)",
                  }}
                >
                  {kindOf(item) === "video" ? (
                    <span style={{ position: "relative", display: "block" }}>
                      <video
                        src={item.url}
                        preload="metadata"
                        muted
                        playsInline
                        style={{ width: "100%", display: "block", background: "#000" }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <span
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.55)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            paddingLeft: 3,
                          }}
                        >
                          ▶
                        </span>
                      </span>
                    </span>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.url}
                      alt={`Foto de ${item.uploader_name}`}
                      style={{ width: "100%", display: "block" }}
                      loading="lazy"
                    />
                  )}
                </button>
                <div style={{ padding: "7px 4px 2px" }}>
                  <div
                    style={{
                      fontFamily: BODY,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--ink)",
                    }}
                  >
                    {item.uploader_name}
                  </div>
                  <div
                    style={{
                      fontFamily: BODY,
                      fontSize: 10,
                      color: "var(--ink-soft)",
                      marginTop: 2,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MusicFab playing={playing} onToggle={toggle} />

      {/* Footer */}
      <div
        style={{
          padding: "28px",
          textAlign: "center",
          background: "#02536f",
          fontFamily: BODY,
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#faf3eb",
        }}
      >
        Israel &amp; Marisol · Huaral 2026
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={filtered.map((i) => ({
            id: i.id,
            url: i.url,
            kind: kindOf(i),
            uploader_name: i.uploader_name,
            created_at: i.created_at,
          }))}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}
