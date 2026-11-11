"use client";

// Secciones del catálogo debajo de "Cómo funciona": Por qué elegirnos,
// Reseñas (solo si hay testimonios reales) y Preguntas frecuentes.

import { useId, useRef, useState } from "react";
import { ChevronDown, ExternalLink, Quote } from "lucide-react";
import WhatsAppButton from "@/app/components/shared/WhatsAppButton";
import { PUNTOS } from "@/lib/negocio";
import { FAQ } from "@/lib/faq";
import { TESTIMONIOS } from "@/lib/testimonios";
import { BLACK, LINE, MUTED, SERIF, TEXT, WA_NUMBER } from "./site";

const WA_DUDA = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "¡Hola! Vi las preguntas frecuentes del catálogo y tengo una duda."
)}`;

/** "01", "02"... para los puntos numerados. */
export const numero = (i: number) => String(i + 1).padStart(2, "0");

// ─── Por qué elegirnos ───────────────────────────────────────────────────────

export function PorQueSection() {
  return (
    <section className="sec" aria-labelledby="porque-title">
      <h2 id="porque-title" className="shop-section-title">
        Cuidamos cada detalle de tu celebración
      </h2>
      <ol className="porque-grid">
        {PUNTOS.map((p, i) => (
          <li key={p.titulo} className="porque-item">
            <span className="porque-num" aria-hidden="true">
              {numero(i)}
            </span>
            <h3 className="porque-titulo">{p.titulo}</h3>
            <p className="porque-texto">{p.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ─── Reseñas ─────────────────────────────────────────────────────────────────

export function ResenasSection() {
  if (TESTIMONIOS.length === 0) return null;
  return (
    <section className="sec" aria-labelledby="resenas-title">
      <h2 id="resenas-title" className="shop-section-title">
        La confianza se construye en cada celebración
      </h2>
      <div className="resenas-grid">
        {TESTIMONIOS.map((t) => {
          const original = t.enlace ?? t.captura;
          return (
            <figure key={`${t.nombre}-${t.texto.slice(0, 20)}`} className="resena">
              <Quote size={22} color="#b5b5b5" aria-hidden="true" />
              <blockquote className="resena-texto">{t.texto}</blockquote>
              <figcaption className="resena-autor">
                <strong>{t.nombre}</strong>
                <span>{t.rol}</span>
              </figcaption>
              {original && (
                <a href={original} target="_blank" rel="noopener noreferrer" className="resena-link">
                  Ver mensaje original
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}
            </figure>
          );
        })}
      </div>
    </section>
  );
}

// ─── Preguntas frecuentes ────────────────────────────────────────────────────
// Acordeón: una respuesta abierta a la vez. Cada pregunta es un <button> con
// aria-expanded/aria-controls; flechas arriba/abajo, Inicio y Fin mueven el
// foco entre preguntas (Enter y Espacio abren, como en cualquier botón).

export function FaqSection() {
  const [abierta, setAbierta] = useState<number | null>(null);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const total = FAQ.length;
    const destino =
      e.key === "ArrowDown" ? (i + 1) % total
      : e.key === "ArrowUp" ? (i - 1 + total) % total
      : e.key === "Home" ? 0
      : e.key === "End" ? total - 1
      : null;
    if (destino === null) return;
    e.preventDefault();
    botones.current[destino]?.focus();
  };

  return (
    <section id="faq" className="sec" aria-labelledby="faq-title">
      <h2 id="faq-title" className="shop-section-title">
        Preguntas frecuentes
      </h2>
      <div className="faq-list">
        {FAQ.map((f, i) => {
          const open = abierta === i;
          const btnId = `${base}-q${i}`;
          const panelId = `${base}-a${i}`;
          return (
            <div key={f.pregunta} className={`faq-item${open ? " open" : ""}`}>
              <h3>
                <button
                  ref={(el) => {
                    botones.current[i] = el;
                  }}
                  id={btnId}
                  type="button"
                  className="faq-q"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setAbierta(open ? null : i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                >
                  <span>{f.pregunta}</span>
                  <ChevronDown size={20} className="faq-chevron" aria-hidden="true" />
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={btnId} className="faq-a" aria-hidden={!open}>
                <div className="faq-a-inner">
                  <p>{f.respuesta}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 36 }}>
        <WhatsAppButton href={WA_DUDA} label="¿Tienes otra duda? Escríbenos" />
      </div>
    </section>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

export const SECTIONS_CSS = `


  .porque-grid {
    list-style: none; margin: 36px 0 0; padding: 0;
    display: grid; grid-template-columns: 1fr; gap: 28px;
  }
  @media (min-width: 600px) { .porque-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (min-width: 1024px) { .porque-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 32px; } }
  .porque-item { border-top: 1px solid ${LINE}; padding-top: 18px; }
  .porque-num { display: block; font-family: ${SERIF}; font-size: 34px; line-height: 1; color: #a7a7a7; }
  .porque-titulo { margin-top: 14px; font-size: 16px; font-weight: 600; color: ${BLACK}; }
  .porque-texto { margin-top: 6px; font-size: 14px; line-height: 1.6; color: ${MUTED}; }

  .resenas-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 36px; }
  @media (min-width: 768px) { .resenas-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; } }
  .resena {
    margin: 0; background: #fff; border-radius: 12px; padding: 22px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); display: flex; flex-direction: column; gap: 12px;
  }
  .resena-texto { margin: 0; font-size: 14.5px; line-height: 1.6; color: ${TEXT}; }
  .resena-autor { display: flex; flex-direction: column; gap: 2px; font-size: 14px; color: ${BLACK}; margin-top: auto; }
  .resena-autor span { font-size: 13px; color: ${MUTED}; }
  .resena-link {
    align-self: flex-start; display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600; color: ${BLACK}; text-decoration: none;
    border: 1px solid ${BLACK}; border-radius: 6px; padding: 8px 12px;
  }
  .resena-link:hover { background: ${BLACK}; color: #fff; }

  .faq-list { max-width: 820px; margin: 32px auto 0; border-top: 1px solid ${LINE}; }
  .faq-item { border-bottom: 1px solid ${LINE}; }
  .faq-item h3 { margin: 0; font: inherit; }
  .faq-q {
    width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px;
    background: none; border: 0; padding: 20px 4px; cursor: pointer; text-align: left;
    font-family: inherit; font-size: 16px; font-weight: 600; color: ${BLACK}; line-height: 1.4;
  }
  .faq-q:focus-visible { outline: 2px solid ${BLACK}; outline-offset: 2px; border-radius: 4px; }
  .faq-chevron { flex-shrink: 0; color: ${MUTED}; transition: transform 0.25s ease; }
  .faq-item.open .faq-chevron { transform: rotate(180deg); }
  .faq-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease; }
  .faq-item.open .faq-a { grid-template-rows: 1fr; }
  .faq-a-inner { overflow: hidden; }
  .faq-a p { padding: 0 4px 20px; font-size: 15px; line-height: 1.65; color: ${MUTED}; max-width: 70ch; }
  @media (prefers-reduced-motion: reduce) { .faq-a, .faq-chevron { transition: none; } }
`;
