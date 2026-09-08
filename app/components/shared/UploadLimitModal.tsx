"use client";

// Modal que se muestra cuando un invitado supera los 500MB acumulados
// (GUEST_MAX_BYTES). La estructura es común a los tres diseños; cada uno pasa su
// paleta y sus fuentes en `theme` para que se vea acorde a su estética.
// Los textos y los enlaces de WhatsApp viven en uploadLimit.ts.

import { useEffect } from "react";
import { limitModalCopy, WHATSAPP_GREEN } from "./uploadLimit";

export interface LimitModalTheme {
  card: string; // fondo de la tarjeta
  title: string; // color del título
  text: string; // color del cuerpo
  titleFont: string;
  bodyFont: string;
  titleStyle?: React.CSSProperties; // ajustes finos del título (mayúsculas, itálica...)
}

export function UploadLimitModal({
  demo,
  theme,
  onClose,
}: {
  demo: boolean;
  theme: LimitModalTheme;
  onClose: () => void;
}) {
  const copy = limitModalCopy(demo);

  // Cerrar con Escape y evitar que el fondo haga scroll mientras está abierto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(20,20,20,0.62)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 360,
          maxHeight: "88vh",
          overflowY: "auto",
          background: theme.card,
          borderRadius: 16,
          padding: 24,
          textAlign: "center",
          boxShadow: "0 24px 60px -20px rgba(0,0,0,0.55)",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 30,
            height: 30,
            border: 0,
            borderRadius: 999,
            background: "transparent",
            color: theme.text,
            fontSize: 20,
            lineHeight: 1,
            cursor: "pointer",
            opacity: 0.7,
          }}
        >
          ×
        </button>

        <h3
          style={{
            fontFamily: theme.titleFont,
            fontSize: 21,
            lineHeight: 1.25,
            color: theme.title,
            margin: "6px 0 0",
            ...theme.titleStyle,
          }}
        >
          {copy.title}
        </h3>

        <p
          style={{
            fontFamily: theme.bodyFont,
            fontSize: 14.5,
            lineHeight: 1.6,
            color: theme.text,
            marginTop: 12,
          }}
        >
          {copy.message}
        </p>

        <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
          {copy.buttons.map((b) => (
            <a
              key={b.href}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                background: WHATSAPP_GREEN,
                color: "#ffffff",
                fontFamily: theme.bodyFont,
                fontSize: 15.5,
                fontWeight: 600,
                textDecoration: "none",
                padding: "13px 18px",
                borderRadius: 12,
              }}
            >
              {b.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
