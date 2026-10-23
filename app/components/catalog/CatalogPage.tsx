"use client";

// Catálogo (/) con estilo de tienda (rediseño 19 oct 2026, inspirado en
// dariwithlove.ru): fondo gris claro, filtros por categoría, tarjetas blancas
// con un celular que muestra la portada de cada diseño y un panel lateral de
// "Solicitar" que arma el mensaje de WhatsApp.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import WhatsAppButton from "@/app/components/shared/WhatsAppButton";
import { Camera, Clock, MapPin, MessageCircle, Music, Smartphone } from "lucide-react";
import { designs, PRECIOS, type Categoria, type Design } from "@/lib/designs";

const NEGOCIO = "Invitaciones Digitales";
const WA_NUMBER = "51993092110";

const WA_CATALOGO = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "¡Hola! Vi el catálogo de Invitaciones Digitales y me gustaría más información."
)}`;

// Paleta de la tienda
const PAGE_BG = "#f8f8f8";
const CARD_BG = "#ffffff";
const BLACK = "#111111";
const TEXT = "#222222";
const MUTED = "#6b6b6b";
const LINE = "#e4e4e4";
const LINK = "#3a5f8f"; // nombre del diseño, azulado como un enlace

const FONT = "'DM Sans', 'Segoe UI', Arial, sans-serif";

type Filtro = "todas" | Categoria;

const FILTROS: { id: Filtro | "bautizos" | "quinceaneros"; label: string; pronto?: boolean }[] = [
  { id: "todas", label: "Todas" },
  { id: "boda", label: "Bodas" },
  { id: "cumpleanos", label: "Cumpleaños" },
  { id: "bautizos", label: "Bautizos", pronto: true },
  { id: "quinceaneros", label: "Quinceañeros", pronto: true },
];

const FEATURES = [
  { icon: Music, titulo: "Música de fondo", texto: "Canción personalizada que suena al abrir la invitación." },
  { icon: Clock, titulo: "Cuenta regresiva", texto: "Días, horas, minutos y segundos en vivo hasta el gran día." },
  { icon: MapPin, titulo: "Ubicación con mapa", texto: "Google Maps integrado para que nadie se pierda." },
  { icon: MessageCircle, titulo: "Confirmación por WhatsApp", texto: "Tus invitados confirman su asistencia con un toque." },
  { icon: Camera, titulo: "Galería de fotos", texto: "En las bodas, los invitados suben sus fotos y videos." },
  { icon: Smartphone, titulo: "Hecha para celular", texto: "Se ve perfecta en cualquier teléfono." },
];

const PASOS = [
  { n: 1, titulo: "Elige tu diseño", texto: "Explora el catálogo y mira las demos en vivo." },
  { n: 2, titulo: "Envíanos los datos", texto: "Nombres, fecha, lugar, fotos y la canción que quieres." },
  { n: 3, titulo: "La personalizamos", texto: "Adaptamos el diseño con toda tu información." },
  { n: 4, titulo: "Recibe tu link", texto: "Compártelo por WhatsApp con todos tus invitados." },
];

const soles = (n: number) => `S/. ${n}`;

// "2026-11-27" → "27/11/2026" para el mensaje de WhatsApp
const fechaCorta = (iso: string) => iso.split("-").reverse().join("/");

/* eslint-disable @next/next/no-img-element */

// ─── Celular con la portada ──────────────────────────────────────────────────
// La pantalla va DEBAJO del SVG: el cuerpo negro es un path con un hueco
// (fill-rule evenodd) por donde se ve la portada, y encima se dibujan la isla
// y los botones laterales. Sin `preview` la pantalla es colores[0] + nombre.

function PhoneFrame({ design, compact = false }: { design: Design; compact?: boolean }) {
  // viewBox 200×410: cuerpo de x=6 a x=194; pantalla de 14,12 a 186,398
  const screen = { left: 14 / 200, top: 12 / 410, width: 172 / 200, height: 386 / 410 };
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "200 / 410" }}>
      <div
        style={{
          position: "absolute",
          left: `${screen.left * 100}%`,
          top: `${screen.top * 100}%`,
          width: `${screen.width * 100}%`,
          height: `${screen.height * 100}%`,
          borderRadius: compact ? 6 : "11% / 5.4%",
          overflow: "hidden",
          background: design.colores[0],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 10%",
          textAlign: "center",
        }}
      >
        {design.preview ? (
          <img
            src={design.preview}
            alt={`Portada del diseño ${design.nombre}`}
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
          />
        ) : (
          !compact && (
            <span className="phone-name" style={{ color: "#ffffff", fontFamily: FONT, fontWeight: 600, lineHeight: 1.2 }}>
              {design.nombre}
            </span>
          )
        )}
      </div>
      <svg
        viewBox="0 0 200 410"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
      >
        {/* Botones laterales: volumen (izq.) y encendido (der.) */}
        <rect x="2" y="92" width="5" height="30" rx="2" fill="#1c1c1c" />
        <rect x="2" y="132" width="5" height="46" rx="2" fill="#1c1c1c" />
        <rect x="2" y="186" width="5" height="46" rx="2" fill="#1c1c1c" />
        <rect x="193" y="142" width="5" height="68" rx="2" fill="#1c1c1c" />
        <path
          fillRule="evenodd"
          fill={BLACK}
          d="M36 2h128a30 30 0 0 1 30 30v346a30 30 0 0 1-30 30H36a30 30 0 0 1-30-30V32A30 30 0 0 1 36 2Z M36 12h128a22 22 0 0 1 22 22v342a22 22 0 0 1-22 22H36a22 22 0 0 1-22-22V34a22 22 0 0 1 22-22Z"
        />
        {/* Isla dinámica */}
        <rect x="76" y="20" width="48" height="13" rx="6.5" fill={BLACK} />
      </svg>
    </div>
  );
}

// ─── Tarjeta ─────────────────────────────────────────────────────────────────

function DesignCard({ design, onSolicitar }: { design: Design; onSolicitar: (d: Design) => void }) {
  const { precio, antes } = PRECIOS[design.categoria];
  return (
    <article className="shop-card">
      <Link href={design.ruta} className="shop-phone" aria-label={`Ver demo de ${design.nombre}`}>
        <span className="shop-badge">NUEVO</span>
        <PhoneFrame design={design} />
      </Link>

      <div className="shop-info">
        <Link href={design.ruta} className="shop-name">
          “{design.nombre.toUpperCase()}”
        </Link>
        <p className="shop-desc">{design.descripcion}</p>
        <div className="shop-tags">
          {design.tags.map((tag) => (
            <span key={tag} className="shop-tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="shop-price">
          {antes && <s style={{ color: MUTED, fontWeight: 400, marginRight: 8 }}>{soles(antes)}</s>}
          {soles(precio)}
        </div>
        <div className="shop-actions">
          <Link href={design.ruta} className="shop-btn shop-btn-outline">
            Ver demo
          </Link>
          <button type="button" className="shop-btn shop-btn-solid" onClick={() => onSolicitar(design)}>
            Solicitar
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Panel lateral "Tu solicitud" ────────────────────────────────────────────

function SolicitudPanel({
  design,
  open,
  onClose,
  onRemove,
}: {
  design: Design | null;
  open: boolean;
  onClose: () => void;
  onRemove: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [fecha, setFecha] = useState("");
  const [detalles, setDetalles] = useState("");
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Al corregir cualquier campo desaparece el aviso de validación
  const campo = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    set(e.target.value);
    setError(null);
  };

  // Escape cierra; mientras está abierto la página de fondo no hace scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!design) return setError("Elige un diseño para tu solicitud");
    if (!nombre.trim()) return setError("Por favor escribe tu nombre completo");
    if (!fecha) return setError("Por favor indica la fecha del evento");
    setError(null);
    const mensaje = [
      `Hola, quiero solicitar la invitación "${design.nombre}".`,
      `Mi nombre es ${nombre.trim()}, el evento es el ${fechaCorta(fecha)}.`,
      whatsapp.trim() ? `Mi WhatsApp: ${whatsapp.trim()}` : "",
      detalles.trim() ? `Detalles: ${detalles.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`, "_blank", "noopener");
  };

  const total = design ? PRECIOS[design.categoria].precio : 0;

  return (
    <>
      <div className={`shop-overlay${open ? " open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside
        className={`shop-panel${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Tu solicitud"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="panel-head">
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.08em" }}>TU SOLICITUD:</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar" className="panel-x">
            ×
          </button>
        </div>

        <div className="panel-body">
          {design ? (
            <div className="panel-item">
              <div style={{ width: 50, flexShrink: 0 }}>
                <PhoneFrame design={design} compact />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: TEXT }}>“{design.nombre.toUpperCase()}”</div>
                <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>
                  {soles(PRECIOS[design.categoria].precio)}
                </div>
              </div>
              <button type="button" onClick={onRemove} aria-label={`Quitar ${design.nombre}`} className="panel-remove">
                ×
              </button>
            </div>
          ) : (
            <p style={{ color: MUTED, fontSize: 14, padding: "18px 0" }}>
              Aún no elegiste un diseño. Cierra el panel y toca “Solicitar” en el que te guste.
            </p>
          )}

          <div className="panel-total">
            <span>Total</span>
            <span>{soles(total)}</span>
          </div>

          <form onSubmit={enviar} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label className="panel-field">
              <span>Nombre completo</span>
              <input value={nombre} onChange={campo(setNombre)} autoComplete="name" />
            </label>
            <label className="panel-field">
              <span>Número de WhatsApp</span>
              <input
                type="tel"
                value={whatsapp}
                onChange={campo(setWhatsapp)}
                placeholder="+51 999 999 999"
                autoComplete="tel"
              />
            </label>
            <label className="panel-field">
              <span>Fecha del evento</span>
              <input type="date" value={fecha} onChange={campo(setFecha)} />
            </label>
            <label className="panel-field">
              <span>
                Mensaje o detalles adicionales <em style={{ color: MUTED, fontStyle: "normal" }}>(opcional)</em>
              </span>
              <textarea rows={4} value={detalles} onChange={campo(setDetalles)} />
            </label>

            {error && (
              <p role="alert" style={{ color: "#c0392b", fontSize: 13.5 }}>
                {error}
              </p>
            )}

            <button type="submit" className="shop-btn shop-btn-solid" style={{ width: "100%", padding: "15px 0" }}>
              ENVIAR SOLICITUD
            </button>
            <p style={{ textAlign: "center", fontSize: 12.5, color: MUTED, marginTop: -4 }}>
              Te responderemos por WhatsApp a la brevedad
            </p>
          </form>
        </div>
      </aside>
    </>
  );
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [panelOpen, setPanelOpen] = useState(false);
  const [elegido, setElegido] = useState<Design | null>(null);

  const visibles = filtro === "todas" ? designs : designs.filter((d) => d.categoria === filtro);
  const contar = (c: Filtro) => (c === "todas" ? designs.length : designs.filter((d) => d.categoria === c).length);

  // Estable: el panel la usa como dependencia de su efecto (Escape + foco)
  const cerrarPanel = useCallback(() => setPanelOpen(false), []);

  const solicitar = (d: Design) => {
    setElegido(d);
    setPanelOpen(true);
  };

  return (
    <div className="shop-root">
      <style>{`
        html { scroll-behavior: smooth; }
        body { background: ${PAGE_BG}; display: block; }
        .shop-root { width: 100%; min-height: 100vh; background: ${PAGE_BG}; color: ${TEXT}; font-family: ${FONT}; }
        .shop-inner { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
        @media (min-width: 768px) { .shop-inner { padding: 0 32px; } }

        .shop-header { background: ${CARD_BG}; border-bottom: 1px solid ${LINE}; }
        .shop-header .shop-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
        .shop-logo { font-weight: 700; font-size: 17px; letter-spacing: 0.14em; text-transform: uppercase; color: ${BLACK}; text-decoration: none; }
        @media (max-width: 520px) {
          .shop-logo { font-size: 14px; letter-spacing: 0.1em; }
        }

        .shop-pills { display: flex; gap: 8px; overflow-x: auto; padding: 4px 0 8px; scrollbar-width: none; }
        .shop-pills::-webkit-scrollbar { display: none; }
        .shop-pill {
          flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 999px; border: 1px solid ${LINE}; background: ${CARD_BG};
          font-family: inherit; font-size: 14px; color: ${TEXT}; cursor: pointer; transition: all 0.2s ease;
        }
        .shop-pill:hover:not(:disabled) { border-color: ${BLACK}; }
        .shop-pill.active { background: ${BLACK}; border-color: ${BLACK}; color: #fff; }
        .shop-pill:disabled { color: #9a9a9a; cursor: not-allowed; }
        .shop-pill .count { font-size: 12px; opacity: 0.6; }
        .shop-soon { font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; background: #f0e6c8; color: #6e5a1c; padding: 2px 7px; border-radius: 999px; }

        .shop-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 12px; }
        @media (min-width: 900px) { .shop-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; } }

        .shop-card {
          background: ${CARD_BG}; border-radius: 12px; overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex; flex-direction: column;
        }
        .shop-card:hover { transform: translateY(-6px); box-shadow: 0 18px 36px -12px rgba(0, 0, 0, 0.22); }
        .shop-phone { position: relative; display: block; padding: 22px 22% 18px; background: #f1f1f1; }
        @media (max-width: 899px) { .shop-phone { padding: 16px 18% 14px; } }
        .shop-badge {
          position: absolute; top: 10px; left: 10px; z-index: 2;
          background: ${BLACK}; color: #fff; font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
          padding: 4px 8px; border-radius: 4px;
        }
        .phone-name { font-size: clamp(11px, 1.5vw, 16px); }

        .shop-info { padding: 14px 14px 16px; display: flex; flex-direction: column; flex: 1; }
        @media (min-width: 900px) { .shop-info { padding: 18px 18px 20px; } }
        .shop-name { color: ${LINK}; font-weight: 700; font-size: 14px; letter-spacing: 0.04em; text-decoration: none; cursor: pointer; }
        .shop-name:hover { text-decoration: underline; }
        .shop-desc {
          margin-top: 6px; font-size: 13px; line-height: 1.45; color: ${MUTED};
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .shop-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
        .shop-tag { font-size: 10.5px; padding: 3px 8px; border-radius: 999px; background: #f2f2f2; color: #555; }
        .shop-price { margin-top: auto; padding-top: 12px; font-size: 17px; font-weight: 700; color: ${BLACK}; }
        .shop-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
        .shop-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 10px 6px; border-radius: 6px; font-family: inherit; font-size: 13px; font-weight: 600;
          text-decoration: none; cursor: pointer; transition: background 0.2s ease, color 0.2s ease, opacity 0.2s ease;
          white-space: nowrap;
        }
        @media (max-width: 899px) { .shop-actions { gap: 6px; } .shop-actions .shop-btn { font-size: 12px; padding: 9px 2px; } }
        .shop-btn-outline { background: #fff; color: ${BLACK}; border: 1px solid ${BLACK}; }
        .shop-btn-outline:hover { background: ${BLACK}; color: #fff; }
        .shop-btn-solid { background: ${BLACK}; color: #fff; border: 1px solid ${BLACK}; }
        .shop-btn-solid:hover { opacity: 0.85; }

        .shop-empty { grid-column: 1 / -1; text-align: center; color: ${MUTED}; padding: 60px 0; }

        .shop-section-title { font-size: clamp(20px, 3vw, 26px); font-weight: 700; text-align: center; color: ${BLACK}; }
        .shop-features { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 28px; }
        @media (min-width: 900px) { .shop-features { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; } }
        .shop-feature { background: #fff; border-radius: 12px; padding: 18px 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .shop-steps { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px 12px; margin-top: 28px; }
        @media (min-width: 900px) { .shop-steps { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

        .shop-overlay {
          position: fixed; inset: 0; z-index: 200; background: rgba(0, 0, 0, 0.45);
          opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        }
        .shop-overlay.open { opacity: 1; pointer-events: auto; }
        .shop-panel {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 210;
          width: 100%; max-width: 400px; background: #fff; color: ${TEXT};
          display: flex; flex-direction: column;
          transform: translateX(100%); transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .shop-panel.open { transform: translateX(0); box-shadow: -12px 0 40px rgba(0, 0, 0, 0.18); }
        @media (max-width: 480px) { .shop-panel { max-width: none; } }
        .panel-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid ${LINE}; }
        .panel-x { background: none; border: 0; font-size: 28px; line-height: 1; cursor: pointer; color: ${BLACK}; padding: 4px 8px; }
        .panel-body { flex: 1; overflow-y: auto; padding: 18px 20px 28px; }
        .panel-item { display: flex; align-items: center; gap: 14px; padding-bottom: 16px; border-bottom: 1px solid ${LINE}; }
        .panel-remove { background: none; border: 1px solid ${LINE}; border-radius: 50%; width: 28px; height: 28px; font-size: 16px; line-height: 1; cursor: pointer; color: ${MUTED}; }
        .panel-remove:hover { border-color: ${BLACK}; color: ${BLACK}; }
        .panel-total { display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; padding: 16px 0 22px; }
        .panel-field { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: ${TEXT}; }
        .panel-field input, .panel-field textarea {
          font-family: inherit; font-size: 15px; font-weight: 400; color: ${TEXT};
          border: 1px solid #d6d6d6; border-radius: 6px; padding: 11px 12px; background: #fff; resize: vertical;
        }
        .panel-field input:focus, .panel-field textarea:focus { outline: none; border-color: ${BLACK}; }

        .shop-footer { background: #151515; color: #e8e8e8; text-align: center; padding: 48px 16px 36px; margin-top: 70px; }
      `}</style>

      {/* ── Header ── */}
      <header className="shop-header">
        <div className="shop-inner">
          <Link href="/" className="shop-logo">
            {NEGOCIO}
          </Link>
          <WhatsAppButton href={WA_CATALOGO} />
        </div>
      </header>

      <main className="shop-inner">
        <div style={{ padding: "36px 0 20px" }}>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, color: BLACK }}>Invitaciones digitales</h1>
          <p style={{ color: MUTED, fontSize: 15, marginTop: 8 }}>
            Diseños con música, cuenta regresiva, mapa y confirmación por WhatsApp.
          </p>
        </div>

        {/* ── Filtros ── */}
        <div className="shop-pills" role="tablist" aria-label="Categorías">
          {FILTROS.map((f) =>
            f.pronto ? (
              <button key={f.id} type="button" className="shop-pill" disabled>
                {f.label}
                <span className="shop-soon">Próximamente</span>
              </button>
            ) : (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filtro === f.id}
                className={`shop-pill${filtro === f.id ? " active" : ""}`}
                onClick={() => setFiltro(f.id as Filtro)}
              >
                {f.label}
                <span className="count">{contar(f.id as Filtro)}</span>
              </button>
            )
          )}
        </div>

        {/* ── Grid ── */}
        <section className="shop-grid" style={{ marginTop: 18 }} aria-live="polite">
          {visibles.length === 0 ? (
            <p className="shop-empty">Pronto tendremos diseños en esta categoría.</p>
          ) : (
            visibles.map((d) => <DesignCard key={d.id} design={d} onSolicitar={solicitar} />)
          )}
        </section>

        {/* ── Qué incluye ── */}
        <section style={{ marginTop: 72 }}>
          <h2 className="shop-section-title">Cada invitación incluye</h2>
          <div className="shop-features">
            {FEATURES.map((f) => (
              <div key={f.titulo} className="shop-feature">
                <f.icon size={24} color={LINK} strokeWidth={1.8} aria-hidden="true" />
                <div style={{ fontWeight: 600, fontSize: 15, marginTop: 8, color: BLACK }}>{f.titulo}</div>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: MUTED, marginTop: 4 }}>{f.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Cómo funciona ── */}
        <section style={{ marginTop: 64 }}>
          <h2 className="shop-section-title">Cómo funciona</h2>
          <div className="shop-steps">
            {PASOS.map((p) => (
              <div key={p.n} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    margin: "0 auto",
                    borderRadius: "50%",
                    background: BLACK,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                  }}
                >
                  {p.n}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, marginTop: 10, color: BLACK }}>{p.titulo}</div>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: MUTED, marginTop: 4 }}>{p.texto}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="shop-footer">
        <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase" }}>{NEGOCIO}</div>
        <p style={{ marginTop: 14, color: "#bdbdbd", fontSize: 15 }}>¿Tienes dudas? Contáctanos</p>
        <WhatsAppButton href={WA_CATALOGO} style={{ marginTop: 18 }} />
        <div style={{ marginTop: 34, fontSize: 12, color: "#8a8a8a" }}>© 2026 Invitaciones Digitales</div>
      </footer>

      <SolicitudPanel
        design={elegido}
        open={panelOpen}
        onClose={cerrarPanel}
        onRemove={() => setElegido(null)}
      />
    </div>
  );
}
