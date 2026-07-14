"use client";

import { useEffect, useState } from "react";

// Protección de contenido para las rutas de invitación (NO usar en el
// catálogo). Se agrega una sola vez en el layout del diseño
// (app/<diseño>/layout.tsx) y cubre la invitación, su galería y todas las
// rutas de clientes de ese diseño:
//   - bloquea click derecho y atajos de DevTools / ver fuente / guardar
//   - impide arrastrar imágenes y seleccionar texto (inputs y textareas
//     siguen siendo interactuables para el RSVP y la subida de fotos)
//   - si detecta DevTools abiertas (diferencia ventana/viewport) muestra un
//     overlay "Contenido protegido"; solo en desktop, porque en móviles la UI
//     del navegador produce diferencias parecidas y bloquearía a los invitados.
// Nada de esto es seguridad real (siempre se puede saltar), solo disuasión.

const DEVTOOLS_GAP = 170; // px de diferencia ventana/viewport para asumir DevTools

export default function ContentProtection() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === "IMG") e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const mod = e.ctrlKey || e.metaKey; // Ctrl en Windows, Cmd en Mac
      const devtoolsCombo =
        e.key === "F12" ||
        (mod && e.shiftKey && (key === "I" || key === "J" || key === "C")) ||
        (mod && e.altKey && (key === "I" || key === "J" || key === "C")) || // Cmd+Option en Mac
        (mod && (key === "U" || key === "S")); // ver fuente / guardar página
      if (devtoolsCombo) e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);

    let intervalId: number | undefined;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (!coarsePointer) {
      const check = () =>
        setBlocked(
          window.outerWidth - window.innerWidth > DEVTOOLS_GAP ||
            window.outerHeight - window.innerHeight > DEVTOOLS_GAP
        );
      check();
      intervalId = window.setInterval(check, 800);
    }

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <style>{`
        #invitation-root {
          -webkit-user-select: none;
          user-select: none;
        }
        #invitation-root input,
        #invitation-root textarea {
          -webkit-user-select: text;
          user-select: text;
        }
        #invitation-root img,
        #invitation-root video {
          -webkit-user-drag: none;
          user-drag: none;
        }
      `}</style>
      {blocked && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#14100a",
            color: "#f6f2ee",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            textAlign: "center",
            padding: 24,
            fontFamily: "var(--font-serif), Georgia, serif",
          }}
        >
          <div style={{ fontSize: 40 }}>🔒</div>
          <div style={{ fontSize: 26, fontStyle: "italic" }}>Contenido protegido</div>
          <div style={{ fontSize: 15, opacity: 0.7, maxWidth: 300 }}>
            Cierra las herramientas de desarrollo para seguir viendo la invitación.
          </div>
        </div>
      )}
    </>
  );
}
