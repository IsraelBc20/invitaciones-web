"use client";

// Galería del diseño Cabo Azul. La usan /cabo-azul/galeria (demo) y las
// galerías de clientes (p. ej. /cabo-azul/israel-y-marisol/galeria): cada una
// ve solo SUS fotos (design = 'cabo-azul' + invitation), y cambian el enlace
// "Volver" (backHref) y la canción (musicSrc).

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Play, WifiOff } from "lucide-react";
import { MediaKind, kindFromUrl, DEMO_INVITATION } from "@/lib/media";
import Lightbox from "@/app/components/shared/Lightbox";
import { useMusic } from "@/app/components/shared/useMusic";
import { useGalleryMedia } from "@/app/components/shared/useGalleryMedia";
import { MusicFab, MUSIC_SRC } from "@/app/components/cabo-azul/InvitationCaboAzul";
import { coupleFor, signatureFor } from "@/lib/couple";

const DESIGN_ID = "cabo-azul";

const SCRIPT_SOFT = "'Sacramento', 'Great Vibes', cursive";
const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Abel', 'Segoe UI', Arial, sans-serif";

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
  r.setProperty("--bg", "#f5ede7");
  r.setProperty("--bg-2", "#c8dee2");
  r.setProperty("--ink", "#007caf");
  r.setProperty("--ink-soft", "#4a95b5");
  r.setProperty("--accent", "#007caf");
  r.setProperty("--paper", "#ffffff");
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

export default function GalleryCaboAzul({
  backHref = "/cabo-azul",
  invitation = DEMO_INVITATION,
  musicSrc = MUSIC_SRC,
  emptyImage = "/cabo-azul-demo/deco-concha-azul.png",
}: {
  backHref?: string;
  // Slug de la invitación: 'demo' o el del cliente (p. ej. 'israel-y-marisol').
  invitation?: string;
  // La galería de un cliente pasa la misma canción que su invitación para que
  // el audio continúe al navegar entre ambas.
  musicSrc?: string;
  // Imagen del estado vacío ("Aún no hay recuerdos").
  emptyImage?: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { playing, toggle } = useMusic(musicSrc, DESIGN_ID);

  const { items, loading, error, reload } = useGalleryMedia(DESIGN_ID, invitation);

  useEffect(() => {
    applyTheme();
  }, []);

  const photoCount = useMemo(() => items.filter((i) => kindOf(i) === "photo").length, [items]);
  const videoCount = items.length - photoCount;
  const filtered = filter === "all" ? items : items.filter((i) => kindOf(i) === filter);

  const demo = invitation === DEMO_INVITATION;

  return (
    <div id="invitation-root">
      {/* Header */}
      <div
        style={{
          padding: "58px 28px 34px",
          textAlign: "center",
          background: "var(--bg)",
          borderBottom: "1px solid rgba(0,124,175,0.14)",
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cabo-azul-demo/deco-olas-chicas.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{ width: 90, display: "block", margin: "0 auto 14px", opacity: 0.85 }}
        />
        <div
          style={{
            fontFamily: SANS,
            fontSize: 10,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
          }}
        >
          {coupleFor(demo).amp} · 12 · 09 · 2026
        </div>
        <h1
          style={{
            fontFamily: SCRIPT_SOFT,
            fontWeight: 400,
            fontSize: 52,
            lineHeight: 1,
            color: "var(--ink)",
            marginTop: 10,
          }}
        >
          Galería
        </h1>
        <p style={{ fontFamily: SERIF, fontSize: 18, color: "var(--ink)", marginTop: 8 }}>
          Los recuerdos de nuestro día especial
        </p>
        {items.length > 0 && (
          <div
            style={{
              fontFamily: SANS,
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginTop: 14,
              color: "var(--ink-soft)",
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
            marginTop: 20,
            fontFamily: SANS,
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
                fontFamily: SANS,
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                padding: "12px 22px",
                borderRadius: 999,
                border: "1px solid var(--accent)",
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#f5ede7" : "var(--accent)",
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
              fontFamily: SERIF,
              fontSize: 18,
              color: "var(--ink-soft)",
            }}
          >
            Cargando recuerdos...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "80px 28px" }}>
            <div style={{ marginBottom: 12 }}>
              <WifiOff size={44} strokeWidth={1.4} color="var(--ink)" />
            </div>
            <h3
              style={{
                fontFamily: SCRIPT_SOFT,
                fontSize: 34,
                lineHeight: 1.1,
                color: "var(--ink)",
                marginBottom: 10,
              }}
            >
              No pudimos cargar los recuerdos
            </h3>
            <p style={{ fontFamily: SERIF, fontSize: 17, color: "var(--ink-soft)" }}>
              Revisa tu conexión e inténtalo de nuevo.
            </p>
            <button
              onClick={reload}
              style={{
                appearance: "none",
                border: 0,
                cursor: "pointer",
                marginTop: 20,
                background: "var(--accent)",
                color: "#f5ede7",
                fontFamily: SANS,
                fontSize: 12.5,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                padding: "11px 30px",
                borderRadius: 999,
              }}
            >
              Reintentar
            </button>
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
              padding: "70px 28px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={emptyImage}
              alt="Sin fotos aún"
              draggable={false}
              style={{ width: 150, margin: "0 auto 16px", display: "block" }}
            />
            <h3 style={{ fontFamily: SCRIPT_SOFT, fontSize: 38, lineHeight: 1, color: "var(--ink)", marginBottom: 10 }}>
              {filter === "video"
                ? "Aún no hay videos"
                : filter === "photo"
                  ? "Aún no hay fotos"
                  : "Aún no hay recuerdos"}
            </h3>
            <p style={{ fontFamily: SERIF, fontSize: 17, color: "var(--ink-soft)" }}>
              El 12 de septiembre, los invitados podrán subir sus fotos y videos aquí.
            </p>
          </div>
        ) : (
          /* Masonry de 2 columnas, cada item en marco de polaroid */
          <div style={{ columns: 2, gap: 10, columnFill: "balance" }}>
            {filtered.map((item, idx) => (
              <div key={item.id} style={{ breakInside: "avoid", marginBottom: 14 }}>
                <button
                  onClick={() => setLightboxIndex(idx)}
                  aria-label={`Ver ${kindOf(item) === "video" ? "video" : "foto"} de ${item.uploader_name}`}
                  style={{
                    appearance: "none",
                    border: 0,
                    padding: 7,
                    background: "var(--paper)",
                    display: "block",
                    width: "100%",
                    cursor: "pointer",
                    boxShadow: "0 10px 26px -14px rgba(0,90,130,0.55)",
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
                          <Play size={14} fill="currentColor" strokeWidth={0} />
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
                  <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
                    {item.uploader_name}
                  </div>
                  <div
                    style={{
                      fontFamily: SANS,
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
          background: "#007caf",
          fontFamily: SANS,
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#f5ede7",
        }}
      >
        {signatureFor(demo)}
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
