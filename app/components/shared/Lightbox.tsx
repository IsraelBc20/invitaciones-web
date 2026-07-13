"use client";

// Visor de galería a pantalla completa, estilo galería de iPhone:
// se desliza con el dedo o el mouse (el carrete sigue el gesto horizontal y el
// arrastre vertical hacia abajo cierra el visor, con el fondo transparentándose
// según cuánto se baja), flechas y teclado en desktop, botón de descarga
// (?download fuerza attachment en Supabase Storage) y cierre con ×, Escape,
// swipe-down o tocando el fondo. Sin eliminar ni editar, a propósito.

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaKind } from "@/lib/media";

export interface LightboxItem {
  id: string;
  url: string;
  kind: MediaKind;
  uploader_name: string;
  created_at: string;
}

const EDGE_DAMP = 3; // resistencia al arrastrar más allá del primer/último item
const SWIPE_THRESHOLD = 60; // px horizontales para cambiar de slide
const CLOSE_THRESHOLD = 100; // px hacia abajo para cerrar el visor
const CLOSE_ANIM_MS = 260;

export default function Lightbox({
  items,
  startIndex,
  onClose,
  formatDate,
}: {
  items: LightboxItem[];
  startIndex: number;
  onClose: () => void;
  formatDate: (iso: string) => string;
}) {
  const [index, setIndex] = useState(startIndex);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  // El gesto se bloquea a un eje según el primer movimiento: horizontal navega,
  // vertical (hacia abajo) cierra. Refs y no estado: se leen dentro de listeners.
  const axis = useRef<"x" | "y" | null>(null);
  const dragXRef = useRef(0);
  const dragYRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setIndex((i) => Math.min(items.length - 1, i + 1)),
    [items.length]
  );

  // Cierre con animación de salida (la imagen cae y el fondo se desvanece)
  const requestClose = useCallback(() => {
    setClosing(true);
    window.setTimeout(onClose, CLOSE_ANIM_MS);
  }, [onClose]);

  // Teclado + bloquear el scroll del fondo mientras el visor está abierto
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [requestClose, next, prev]);

  // Pausar los videos al cambiar de slide
  useEffect(() => {
    trackRef.current?.querySelectorAll("video").forEach((v, i) => {
      if (i !== index) v.pause();
    });
  }, [index]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (closing) return;
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = null;
    setDragging(true);
  };

  // move/up van en window: el arrastre no se pierde al salir del contenedor
  // (típico con mouse en desktop) ni al soltar sobre otro elemento.
  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => {
      if (!start.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      if (!axis.current) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis.current === "x") {
        let d = dx;
        const atEdge = (d > 0 && index === 0) || (d < 0 && index === items.length - 1);
        if (atEdge) d /= EDGE_DAMP;
        dragXRef.current = d;
        setDragX(d);
      } else {
        // Hacia abajo sigue al dedo; hacia arriba solo con resistencia
        const d = dy > 0 ? dy : dy / EDGE_DAMP;
        dragYRef.current = d;
        setDragY(d);
      }
    };

    const onUp = () => {
      if (axis.current === "x") {
        if (dragXRef.current < -SWIPE_THRESHOLD) next();
        else if (dragXRef.current > SWIPE_THRESHOLD) prev();
      } else if (axis.current === "y" && dragYRef.current > CLOSE_THRESHOLD) {
        start.current = null;
        axis.current = null;
        dragXRef.current = 0;
        dragYRef.current = 0;
        setDragging(false);
        requestClose();
        return;
      }
      start.current = null;
      axis.current = null;
      dragXRef.current = 0;
      dragYRef.current = 0;
      setDragX(0);
      setDragY(0);
      setDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, index, items.length, next, prev, requestClose]);

  const item = items[index];

  // El fondo se transparenta proporcionalmente a cuánto se bajó la imagen
  const fade = closing ? 0 : Math.max(0.25, 1 - Math.max(dragY, 0) / 450);

  const iconBtn: React.CSSProperties = {
    appearance: "none",
    border: 0,
    cursor: "pointer",
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.14)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Recuerdo de ${item.uploader_name}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: `rgba(0,0,0,${0.96 * fade})`,
        transition: dragging ? "none" : `background ${CLOSE_ANIM_MS}ms ease`,
      }}
      onClick={requestClose}
    >
      <div
        style={{
          position: "relative",
          margin: "0 auto",
          maxWidth: 430,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transform: closing
            ? "translateY(100vh)"
            : `translateY(${dragY}px) scale(${1 - Math.max(dragY, 0) / 2400})`,
          opacity: closing ? 0 : 1,
          transition: dragging
            ? "none"
            : `transform ${CLOSE_ANIM_MS}ms ${closing ? "ease-in" : "cubic-bezier(0.2, 0.7, 0.2, 1)"}, opacity ${CLOSE_ANIM_MS}ms ease`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior: contador + descargar + cerrar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 14px 10px",
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {index + 1} / {items.length}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a
              href={`${item.url}?download`}
              download
              aria-label="Descargar"
              style={iconBtn}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12" />
                <path d="M7 11l5 5 5-5" />
                <path d="M4 20h16" />
              </svg>
            </a>
            <button onClick={requestClose} aria-label="Cerrar" style={iconBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carrete deslizable (horizontal: navegar · vertical: cerrar) */}
        <div
          style={{ flex: 1, overflow: "hidden", position: "relative", touchAction: "none" }}
          onPointerDown={onPointerDown}
        >
          <div
            ref={trackRef}
            style={{
              display: "flex",
              height: "100%",
              transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
              transition: dragging ? "none" : "transform 0.3s ease",
            }}
          >
            {items.map((it, i) => (
              <div
                key={it.id}
                style={{
                  flex: "0 0 100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                }}
              >
                {it.kind === "video" ? (
                  <video
                    src={it.url}
                    controls
                    playsInline
                    preload={Math.abs(i - index) <= 1 ? "metadata" : "none"}
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={it.url}
                    alt={`Foto de ${it.uploader_name}`}
                    loading={Math.abs(i - index) <= 1 ? "eager" : "lazy"}
                    draggable={false}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      userSelect: "none",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Flechas (desktop) */}
          {index > 0 && (
            <button
              onClick={prev}
              aria-label="Anterior"
              style={{ ...iconBtn, position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
          )}
          {index < items.length - 1 && (
            <button
              onClick={next}
              aria-label="Siguiente"
              style={{ ...iconBtn, position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Pie: quién lo subió y cuándo */}
        <div style={{ padding: "12px 18px 22px", textAlign: "center", zIndex: 2 }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "#fff",
            }}
          >
            {item.uploader_name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.6)",
              marginTop: 3,
            }}
          >
            {formatDate(item.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}
