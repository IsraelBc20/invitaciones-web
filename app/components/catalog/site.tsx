"use client";

// Piezas compartidas por el catálogo (/) y /nosotros: paleta, estilos base,
// footer ampliado y la barra fija con el plazo de entrega (solo en /).

import { useState } from "react";
import Link from "next/link";
import { MapPin, X } from "lucide-react";
import WhatsAppButton from "@/app/components/shared/WhatsAppButton";
import type { Categoria } from "@/lib/designs";
import { CIUDAD, PLAZO_ENTREGA } from "@/lib/negocio";

export const NEGOCIO = "Invitaciones Digitales";
export const WA_NUMBER = "51993092110";

export const WA_CATALOGO = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "¡Hola! Vi el catálogo de Invitaciones Digitales y me gustaría más información."
)}`;

// Paleta de la tienda
export const PAGE_BG = "#f8f8f8";
export const CARD_BG = "#ffffff";
export const BLACK = "#111111";
export const TEXT = "#222222";
export const MUTED = "#6b6b6b";
export const LINE = "#e4e4e4";
export const LINK = "#3a5f8f"; // nombre del diseño, azulado como un enlace

export const FONT = "'DM Sans', 'Segoe UI', Arial, sans-serif";
export const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";

/** Alto de la barra de plazo; el footer deja ese espacio libre mientras se ve. */
const PLAZO_H = 44;

// ─── Estilos base ────────────────────────────────────────────────────────────
// globals.css pinta el body oscuro y centrado a 430px (es de las invitaciones):
// estas reglas lo pisan mientras la página está montada.

export const SITE_CSS = `
  html { scroll-behavior: smooth; }
  body { background: ${PAGE_BG}; display: block; }
  .shop-root { width: 100%; min-height: 100vh; background: ${PAGE_BG}; color: ${TEXT}; font-family: ${FONT}; overflow-x: clip; }
  .shop-inner { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
  @media (min-width: 768px) { .shop-inner { padding: 0 32px; } }
  .sec { margin-top: 88px; }

  .shop-section-title {
    font-family: ${SERIF}; font-weight: 500; font-size: clamp(26px, 3.6vw, 36px);
    line-height: 1.2; text-align: center; color: ${BLACK};
  }

  .site-footer { background: #151515; color: #e8e8e8; padding: 52px 0 32px; margin-top: 80px; }
  .con-plazo .site-footer { padding-bottom: ${32 + PLAZO_H}px; }
  .site-footer-brand { font-weight: 700; font-size: 16px; letter-spacing: 0.14em; text-transform: uppercase; color: #fff; }
  .site-footer-cols { display: grid; grid-template-columns: 1fr; gap: 32px; margin-top: 32px; }
  @media (min-width: 768px) { .site-footer-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px; } }
  .site-footer-col h3 {
    font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #8f8f8f;
  }
  .site-footer-col ul { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
  .site-footer-col ul a { color: #e8e8e8; text-decoration: none; font-size: 15px; }
  .site-footer-col ul a:hover { text-decoration: underline; text-underline-offset: 4px; }
  .site-footer-city { display: flex; align-items: center; gap: 6px; margin-top: 14px; font-size: 14px; color: #bdbdbd; }
  .site-footer-copy { margin-top: 40px; padding-top: 22px; border-top: 1px solid #2c2c2c; font-size: 12px; color: #8a8a8a; }

  .plazo-bar {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 90;
    min-height: ${PLAZO_H}px; padding: 8px 48px calc(8px + env(safe-area-inset-bottom)) 16px;
    background: #151515; color: #fff; border-top: 1px solid #2c2c2c;
    display: flex; align-items: center; justify-content: center; text-align: center;
    font-size: 12.5px; letter-spacing: 0.02em; line-height: 1.35;
  }
  .plazo-bar strong { font-weight: 600; }
  .plazo-x {
    position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
    width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;
    background: none; border: 0; color: #fff; cursor: pointer; opacity: 0.75; border-radius: 50%;
  }
  .plazo-x:hover, .plazo-x:focus-visible { opacity: 1; background: rgba(255, 255, 255, 0.1); }
`;

// ─── Footer ──────────────────────────────────────────────────────────────────

const CATEGORIAS_FOOTER: { id: Categoria; label: string }[] = [
  { id: "boda", label: "Bodas" },
  { id: "cumpleanos", label: "Cumpleaños" },
];

/**
 * En / recibe `onFiltrar` y los enlaces de Catálogo filtran el grid ahí mismo;
 * desde otra página llevan a /?categoria=<id>#catalogo, que el catálogo lee
 * al montarse.
 */
export function SiteFooter({ onFiltrar }: { onFiltrar?: (c: Categoria) => void }) {
  return (
    <footer id="contacto" className="site-footer">
      <div className="shop-inner">
        <div className="site-footer-brand">{NEGOCIO}</div>

        <div className="site-footer-cols">
          <div className="site-footer-col">
            <h3>Catálogo</h3>
            <ul>
              {CATEGORIAS_FOOTER.map((c) => (
                <li key={c.id}>
                  {onFiltrar ? (
                    <a href="#catalogo" onClick={() => onFiltrar(c.id)}>
                      {c.label}
                    </a>
                  ) : (
                    <a href={`/?categoria=${c.id}#catalogo`}>{c.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer-col">
            <h3>Menú</h3>
            <ul>
              <li>
                <Link href="/nosotros">Nosotros</Link>
              </li>
              <li>
                <Link href="/#como-funciona">Cómo funciona</Link>
              </li>
              <li>
                <Link href="/#faq">Preguntas frecuentes</Link>
              </li>
            </ul>
          </div>

          <div className="site-footer-col">
            <h3>Contacto</h3>
            <WhatsAppButton href={WA_CATALOGO} style={{ marginTop: 14 }} />
            <p className="site-footer-city">
              <MapPin size={16} aria-hidden="true" />
              {CIUDAD}
            </p>
          </div>
        </div>

        <div className="site-footer-copy">© 2026 Invitaciones Digitales</div>
      </div>
    </footer>
  );
}

// ─── Barra de plazo ──────────────────────────────────────────────────────────

/** Barra fija con el plazo de entrega. Cerrarla solo dura hasta recargar. */
export function usePlazoBar() {
  const [visible, setVisible] = useState(true);
  const bar = visible ? (
    <div className="plazo-bar" role="note">
      <span>
        Plazo de entrega de tu invitación: <strong>{PLAZO_ENTREGA}</strong>
      </span>
      <button type="button" className="plazo-x" aria-label="Cerrar aviso de plazo" onClick={() => setVisible(false)}>
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  ) : null;
  return { visible, bar };
}
