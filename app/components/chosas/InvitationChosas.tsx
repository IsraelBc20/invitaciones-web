"use client";

// Diseño Chosas (16 nov 2026): invitación de boda presentada como una revista
// de lujo. Sigue la estructura de _ref/wedvitation-cover-story.txt: una
// pantalla de entrada con la prueba de imprenta de la portada, la portada con
// el índice sobre la foto y cuatro páginas interiores (historia, el día, la
// guía y RSVP) que se pasan una a una con el enlace "A continuación" del pie o
// desde el índice. Solo hay una página montada a la vez.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Minus,
  Pause,
  Play,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useMusic } from "@/app/components/shared/useMusic";
import WhatsAppButton from "@/app/components/shared/WhatsAppButton";
import { venueFor, type Venue } from "@/lib/venue";
import { coupleFor, type Couple } from "@/lib/couple";

const DESIGN_ID = "chosas";

// Assets del DEMO. Cada cliente pasa los suyos con `photosPath` y `musicSrc`
// (public/chosas/<cliente>/). La galería importa MUSIC_SRC como default.
export const MUSIC_SRC = "/chosas-demo/music.mp3";
export const DEMO_PHOTOS_PATH = "/chosas-demo/photos";

// ─── Paleta ──────────────────────────────────────────────────────────────────
export const PAPER = "#FAFAF8"; // blanco cálido de las páginas
export const INK = "#1A1A1A";
export const COBALT = "#1B3A6B";
export const PINK = "#D4698A";
export const GOLD = "#B8963E";
export const GRAY = "#666666";
// Rosa claro para texto sobre la foto o sobre cobalto (el rosa del brief no
// alcanza contraste ahí) y cobalto profundo para el placeholder de la portada.
export const PINK_SOFT = "#F6CBD8";
export const COBALT_DEEP = "#11264A";
// Rosa oscurecido para rótulos chicos sobre blanco (el rosa del brief queda en
// 3,4:1 y no alcanza para texto de 10px).
const PINK_DEEP = "#A8405F";

// ─── Tipografías (en el <link> de app/layout.tsx) ────────────────────────────
export const HEAD = "'Playfair Display', Georgia, serif";
export const MAST = "'Cormorant Garamond', Georgia, serif";
export const BODY = "'Inter', 'Segoe UI', Arial, sans-serif";

// ─── Datos de la revista y del evento (los comparten la demo y el cliente) ───
export const REVISTA = "Chosas";
const NUMERO = "Especial Boda · 2026";
const FECHA_LARGA = "sábado, 12 de septiembre de 2026";
const FECHA_CORTA = "12 de septiembre";
const HORA = "4:00 PM";
const RSVP_HASTA = "1 de septiembre de 2026";
const WA_NUMBER = "51993092110";
const MAX_PERSONAS = 10;
const CITA = "Éramos el plan B del otro, hasta que nos dimos cuenta de que éramos el plan A.";

const PAGINAS = [
  { id: "portada", titulo: "La portada", nota: "" },
  { id: "historia", titulo: "Su historia", nota: "Cómo empezó todo, contado por ellos" },
  { id: "dia", titulo: "El día", nota: "Hora a hora, de la ceremonia al último baile" },
  { id: "guia", titulo: "La guía", nota: "Dónde, qué ponerse y algunas notas" },
  { id: "rsvp", titulo: "RSVP", nota: "Tu respuesta, antes del 1 de septiembre" },
] as const;

const PROGRAMA = [
  { hora: "4:00 PM", titulo: "La ceremonia civil", nota: "Por favor, llega unos minutos antes." },
  { hora: "5:00 PM", titulo: "Brindis y fotos", nota: "Un momento para brindar y recordar." },
  { hora: "6:30 PM", titulo: "La cena", nota: "Una mesa larga, buena comida y algún discurso corto." },
  { hora: "8:30 PM", titulo: "El primer baile", nota: "Primero el nuestro, y luego la pista es tuya." },
  { hora: "11:00 PM", titulo: "Hasta pronto", nota: "Un último baile y nos vemos en el camino." },
];

// Código de barras decorativo del pie: anchos alternos de barra y hueco.
const BARRAS = [2, 1, 1, 2, 3, 1, 1, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 1, 1, 3, 1, 2, 2, 1, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1];
const BARRAS_ANCHO = BARRAS.reduce((a, b) => a + b, 0);
const BARRAS_CSS = (() => {
  const stops: string[] = [];
  let x = 0;
  BARRAS.forEach((w, i) => {
    const color = i % 2 === 0 ? INK : "transparent";
    stops.push(`${color} ${x}px ${x + w}px`);
    x += w;
  });
  return `linear-gradient(90deg, ${stops.join(", ")})`;
})();

const CHOSAS_CSS = `
@keyframes ch-letter { from { opacity: 0; transform: translateY(0.55em) rotate(7deg) } to { opacity: 1; transform: none } }
@keyframes ch-rise { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@keyframes ch-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes ch-turn-fwd { from { opacity: 0; transform: translateX(36px) } to { opacity: 1; transform: none } }
@keyframes ch-turn-back { from { opacity: 0; transform: translateX(-36px) } to { opacity: 1; transform: none } }
@keyframes ch-stamp { 0% { opacity: 0; transform: rotate(-11deg) scale(2.3) } 60% { opacity: 1; transform: rotate(-11deg) scale(0.93) } 100% { opacity: 1; transform: rotate(-11deg) scale(1) } }
@keyframes ch-pulse { 0%, 100% { transform: scale(1); opacity: 0.9 } 50% { transform: scale(2.1); opacity: 0 } }
@keyframes ch-wobble { 0%, 100% { transform: rotate(-12deg) } 50% { transform: rotate(-6deg) } }
@keyframes ch-sheet { from { transform: translateY(100%) } to { transform: none } }

.ch-root { background: ${PAPER}; color: ${INK}; font-family: ${BODY}; }
.ch-root button { font-family: inherit; }
.ch-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.ch-kw { display: inline-block; white-space: nowrap; }
.ch-k { display: inline-block; opacity: 0; animation: ch-letter 0.62s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.ch-ar { opacity: 0; animation: ch-rise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.ch-hold .ch-k, .ch-hold .ch-ar { animation-play-state: paused; }
.ch-page { outline: none; }
.ch-turn-fwd { animation: ch-turn-fwd 0.48s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.ch-turn-back { animation: ch-turn-back 0.48s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

.ch-kicker { display: inline-flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase; color: ${COBALT}; }
.ch-kicker::before { content: ""; width: 26px; height: 2px; background: ${PINK}; }
.ch-big { font-family: ${HEAD}; font-weight: 700; font-size: clamp(64px, 21vw, 92px); line-height: 0.92; letter-spacing: -0.02em; color: ${INK}; }

.ch-run { display: grid; grid-template-columns: 1fr auto 1fr; align-items: baseline; gap: 10px; padding: 16px 20px 10px; border-bottom: 1px solid ${INK}; }
.ch-run-mast { font-family: ${MAST}; font-style: italic; font-weight: 600; font-size: 23px; line-height: 1; color: ${COBALT}; }
.ch-run-title { font-size: 10.5px; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase; color: ${INK}; text-align: center; }
.ch-run-folio { font-family: ${MAST}; font-style: italic; font-size: 18px; line-height: 1; color: ${INK}; text-align: right; }

.ch-end { padding: 0 20px 96px; }
.ch-next { appearance: none; width: 100%; display: grid; grid-template-columns: 1fr auto; align-items: end; column-gap: 12px; text-align: left; background: transparent; border: 0; border-top: 2px solid ${INK}; border-bottom: 1px solid ${INK}; padding: 16px 0 18px; cursor: pointer; color: ${INK}; }
.ch-next-kicker { grid-column: 1 / -1; font-size: 10.5px; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase; color: ${GRAY}; margin-bottom: 6px; }
.ch-next-title { font-family: ${HEAD}; font-weight: 700; font-size: 31px; line-height: 1.05; }
.ch-next-folio { display: inline-flex; align-items: center; gap: 8px; font-family: ${MAST}; font-style: italic; font-size: 20px; color: ${COBALT}; padding-bottom: 3px; }
.ch-arrow { transition: transform 0.3s ease; flex-shrink: 0; }
.ch-next:hover .ch-arrow, .ch-pill:hover .ch-arrow, .ch-submit:hover .ch-arrow { transform: translateX(5px); }

.ch-line { appearance: none; display: block; width: 100%; text-align: left; background: transparent; border: 0; border-top: 1px solid rgba(255,255,255,0.55); padding: 9px 0 10px; color: #fff; cursor: pointer; }
.ch-line-title { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; font-family: ${HEAD}; font-weight: 700; font-size: 20px; line-height: 1.15; }
.ch-line-title em { font-family: ${MAST}; font-style: italic; font-weight: 500; font-size: 16px; color: ${PINK_SOFT}; white-space: nowrap; }
.ch-line:hover .ch-line-title { text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px; }

.ch-box { position: relative; border: 1px solid ${INK}; padding: 20px 18px 22px; background: #fff; }
.ch-box-label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: ${PINK_DEEP}; margin-bottom: 10px; }
.ch-box-text { font-size: 15.5px; line-height: 1.65; color: ${GRAY}; }
.ch-pill { display: inline-flex; align-items: center; gap: 10px; margin-top: 16px; padding: 13px 22px; border-radius: 999px; background: ${COBALT}; color: #fff; font-size: 12px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; }

.ch-flabel { display: block; padding: 0; font-size: 10.5px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${COBALT}; margin-bottom: 6px; }
.ch-input { display: block; width: 100%; appearance: none; border: 0; border-bottom: 1.5px solid ${INK}; border-radius: 0; background: transparent; padding: 9px 0; font-family: ${BODY}; font-size: 16px; line-height: 1.4; color: ${INK}; }
.ch-input:focus-visible { outline: none; border-bottom-color: ${COBALT}; box-shadow: 0 2px 0 ${COBALT}; }
.ch-choice { display: flex; align-items: center; gap: 12px; padding: 9px 0; cursor: pointer; font-size: 16px; color: ${INK}; }
.ch-choice input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.ch-check { display: grid; place-items: center; width: 24px; height: 24px; border: 1.5px solid ${INK}; background: #fff; flex-shrink: 0; transition: background 0.2s ease, border-color 0.2s ease; }
.ch-check svg { opacity: 0; transition: opacity 0.2s ease; }
.ch-choice input:checked + .ch-check { background: ${COBALT}; border-color: ${COBALT}; }
.ch-choice input:checked + .ch-check svg { opacity: 1; }
.ch-choice input:focus-visible + .ch-check { outline: 2px solid ${PINK}; outline-offset: 2px; }
.ch-step { appearance: none; display: grid; place-items: center; width: 44px; height: 44px; border: 1.5px solid ${INK}; background: #fff; color: ${INK}; cursor: pointer; }
.ch-step:disabled { opacity: 0.35; cursor: default; }
.ch-error { font-size: 13.5px; color: #B3261E; margin-top: 6px; }
.ch-submit { appearance: none; display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 16px 20px; border: 0; background: ${COBALT}; color: #fff; font-size: 12.5px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; }

.ch-root button:focus-visible, .ch-root a:focus-visible { outline: 2px solid ${PINK}; outline-offset: 3px; }
.ch-fab { position: fixed; bottom: 18px; z-index: 60; }

@media (prefers-reduced-motion: reduce) {
  .ch-k, .ch-ar { animation: none; opacity: 1; }
  .ch-turn-fwd, .ch-turn-back { animation: none; }
}
`;

/* eslint-disable @next/next/no-img-element */

// ─── Título cinético: las letras entran una a una ────────────────────────────
// El texto real va en un span solo para lectores de pantalla; las letras
// animadas son decorativas.

function Kinetic({ text, step = 34, delay = 0 }: { text: string; step?: number; delay?: number }) {
  const palabras = text.split(" ");
  const inicios = palabras.map((_, i) => palabras.slice(0, i).reduce((a, p) => a + p.length, 0));
  return (
    <>
      <span className="ch-sr">{text}</span>
      <span aria-hidden="true">
        {palabras.map((palabra, pi) => (
          <span key={pi}>
            {pi > 0 && " "}
            <span className="ch-kw">
              {Array.from(palabra).map((letra, li) => (
                <span key={li} className="ch-k" style={{ animationDelay: `${delay + (inicios[pi] + li) * step}ms` }}>
                  {letra}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}

// Entrada escalonada de un bloque (se dispara al montarse la página).
const ar = (i: number): React.CSSProperties => ({ animationDelay: `${120 + i * 110}ms` });

// ─── Fotos ───────────────────────────────────────────────────────────────────

// Imagen que puede no existir: ocupa todo su contenedor (que debe ser
// position: relative) y, mientras no carga o si falta, muestra `fallback`.
function Imagen({ src, alt, fallback }: { src: string; alt: string; fallback?: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Si la imagen del HTML SSR ya terminó (o falló) antes de hidratar, onLoad y
  // onError no vuelven a dispararse: se lee el estado real.
  useEffect(() => {
    const img = ref.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) setLoaded(true);
    else setMissing(true);
  }, []);

  return (
    <>
      {!loaded && fallback}
      {!missing && (
        <img
          ref={ref}
          src={src}
          alt={alt}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setMissing(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />
      )}
    </>
  );
}

// Foto de la pareja: si el archivo no existe muestra un placeholder con el
// nombre esperado.
function Foto({ src, file, alt, ratio }: { src: string; file: string; alt: string; ratio: string }) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: ratio, overflow: "hidden", background: "#E4E8F0" }}>
      <Imagen
        src={src}
        alt={alt}
        fallback={
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: COBALT,
            }}
          >
            <Camera size={26} strokeWidth={1.3} aria-hidden="true" />
            <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>{file}</span>
          </div>
        }
      />
    </div>
  );
}

// Foto de portada a sangre. Sin archivo queda el fondo cobalto oscuro.
function FotoPortada({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(120% 80% at 70% 20%, ${COBALT} 0%, ${COBALT_DEEP} 62%, #0B1830 100%)`,
      }}
    >
      <Imagen src={src} alt={alt} />
    </div>
  );
}

// ─── Ilustraciones (SVG de línea, sin archivos) ──────────────────────────────

function Flor({ x, y, r = 6 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle
          key={a}
          cx={x + Math.cos((a * Math.PI) / 180) * r}
          cy={y + Math.sin((a * Math.PI) / 180) * r}
          r={r * 0.78}
          fill={PAPER}
        />
      ))}
      <circle cx={x} cy={y} r={r * 0.5} fill={PINK} stroke="none" />
    </g>
  );
}

const svgBase = {
  fill: "none",
  stroke: COBALT,
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Ramo({ size = 104 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 140" width={size} height={(size * 140) / 120} aria-hidden="true" {...svgBase}>
      <path d="M60 128 L43 66 M60 128 L61 52 M60 128 L80 68 M60 128 L28 84 M60 128 L93 88" />
      <path d="M50 92 C40 90 36 82 38 76 C46 78 51 84 50 92 Z M71 94 C81 92 86 84 84 77 C76 80 71 86 71 94 Z" fill={PAPER} />
      <Flor x={28} y={80} r={5} />
      <Flor x={93} y={84} r={5} />
      <Flor x={42} y={58} r={7.5} />
      <Flor x={81} y={60} r={7.5} />
      <Flor x={61} y={42} r={9} />
      <path
        d="M60 108 C50 98 40 102 44 111 C47 117 55 113 60 108 C65 113 73 117 76 111 C80 102 70 98 60 108 Z"
        fill={PINK}
        stroke={PINK}
      />
      <path d="M57 111 L50 134 M63 111 L71 134" stroke={PINK} />
    </svg>
  );
}

function Tarta({ size = 96 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 130" width={size} height={(size * 130) / 120} aria-hidden="true" {...svgBase}>
      <path d="M10 116 H110" />
      <rect x="20" y="86" width="80" height="30" rx="3" fill={PAPER} />
      <rect x="32" y="60" width="56" height="26" rx="3" fill={PAPER} />
      <rect x="44" y="38" width="32" height="22" rx="3" fill={PAPER} />
      <path
        d="M20 95 q6.7 7 13.3 0 t13.3 0 t13.3 0 t13.3 0 t13.3 0 t13.3 0 M32 68 q7 6 14 0 t14 0 t14 0 t14 0 M44 45 q5.3 5 10.7 0 t10.7 0 t10.6 0"
        stroke={PINK}
      />
      <path d="M60 38 V28" />
      <Flor x={60} y={21} r={6.5} />
      <path d="M48 36 C44 30 46 26 51 27 M72 36 C76 30 74 26 69 27" />
    </svg>
  );
}

function Zapatos({ size = 132 }: { size?: number }) {
  return (
    <svg viewBox="0 0 150 84" width={size} height={(size * 84) / 150} aria-hidden="true" {...svgBase}>
      {/* Tacón */}
      <path
        d="M8 30 C10 20 20 15 27 21 C37 40 54 52 76 57 C83 59 86 63 85 69 H44 C36 60 29 51 23 43 L20 69 H14 Z"
        fill={PAPER}
      />
      <path d="M23 43 C22 36 23 28 27 21" stroke={PINK} />
      {/* Zapato de vestir */}
      <path
        d="M78 38 C86 35 94 36 99 41 C108 49 122 52 135 55 C141 57 143 62 142 69 H80 C78 59 77 48 78 38 Z"
        fill={PAPER}
      />
      <path d="M80 62 H142 M99 41 C101 46 105 50 111 52 M104 45 l5 -4 M109 48 l5 -4" />
      <path d="M4 76 H146" stroke={GOLD} strokeDasharray="1 7" />
    </svg>
  );
}

// ─── Banner de demo (solo en /chosas, no en las invitaciones de clientes) ────

function DemoBanner({ onHeight }: { onHeight: (h: number) => void }) {
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  // La altura del banner empuja la revista hacia abajo para no taparle la
  // cabecera; cambia si el texto pasa a dos líneas.
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      onHeight(0);
      return;
    }
    const medir = () => onHeight(el.offsetHeight);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visible, onHeight]);

  if (!visible) return null;

  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    "¡Hola! Me gusta el diseño Chosas y quiero una invitación como esta."
  )}`;

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        margin: "0 auto",
        maxWidth: 430,
        zIndex: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "9px 42px 9px 12px",
        background: "rgba(17, 38, 74, 0.96)",
        borderBottom: `1px solid ${GOLD}`,
        backdropFilter: "blur(8px)",
        color: "#fff",
        fontFamily: BODY,
        fontSize: 12.5,
        lineHeight: 1.25,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Sparkles size={14} color={PINK_SOFT} aria-hidden="true" style={{ flexShrink: 0 }} />
        Esta es una demo. ¿Te gusta este diseño?
      </span>
      <WhatsAppButton href={waLink} compact />
      <button
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso de demo"
        style={{
          position: "absolute",
          right: 2,
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: 0,
          color: "#fff",
          cursor: "pointer",
          padding: 12,
          display: "grid",
          placeItems: "center",
        }}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── Pantalla de entrada: la prueba de imprenta ──────────────────────────────
// Una miniatura de la portada con marcas de corte y barra de color, como la
// prueba que sale de la imprenta. Al tocarla, la pantalla gira sobre su lomo
// (borde izquierdo) como la tapa de una revista y deja ver la portada.

const APERTURA_MS = 950;

function Gate({
  couple,
  coverSrc,
  top,
  opening,
  onOpen,
}: {
  couple: Couple;
  coverSrc: string;
  top: number;
  opening: boolean;
  onOpen: () => void;
}) {
  const marca = (v: "top" | "bottom", h: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    [v]: -15,
    [h]: -15,
    width: 11,
    height: 11,
    [`border${v === "top" ? "Bottom" : "Top"}`]: `1px solid ${INK}`,
    [`border${h === "left" ? "Right" : "Left"}`]: `1px solid ${INK}`,
  });

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Toca para abrir la invitación"
      style={{
        appearance: "none",
        border: 0,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        margin: "0 auto",
        width: "100%",
        maxWidth: 430,
        height: "100svh",
        zIndex: 100,
        padding: `${top + 24}px 24px 24px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 34,
        cursor: "pointer",
        color: INK,
        backgroundColor: "#EFEDE7",
        backgroundImage: "radial-gradient(rgba(26,26,26,0.07) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
        boxShadow: opening ? "30px 0 60px rgba(0,0,0,0.35)" : "none",
        transformOrigin: "left center",
        transform: opening ? "perspective(1500px) rotateY(-104deg)" : "perspective(1500px) rotateY(0deg)",
        opacity: opening ? 0 : 1,
        transition: `transform ${APERTURA_MS}ms cubic-bezier(0.62, 0.04, 0.3, 1), opacity 420ms ease ${APERTURA_MS - 420}ms`,
        pointerEvents: opening ? "none" : "auto",
      }}
    >
      <span aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <span
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "min(58vw, 236px)",
            aspectRatio: "3 / 4",
            background: PAPER,
            boxShadow: "0 26px 50px -22px rgba(17,38,74,0.55), 0 2px 6px rgba(0,0,0,0.12)",
          }}
        >
          <span
            style={{
              display: "block",
              padding: "7px 0 3px",
              textAlign: "center",
              fontFamily: MAST,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 46,
              lineHeight: 0.85,
              color: COBALT,
            }}
          >
            {REVISTA}
          </span>
          <span
            style={{
              display: "block",
              margin: "0 10px",
              padding: "3px 0",
              borderTop: `1px solid ${INK}`,
              fontSize: 6.5,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            {NUMERO}
          </span>
          <span style={{ position: "relative", display: "block", flex: 1, overflow: "hidden" }}>
            <FotoPortada src={coverSrc} alt="" />
            <span
              style={{
                position: "absolute",
                left: 12,
                right: 12,
                bottom: 12,
                textAlign: "left",
                fontFamily: HEAD,
                fontWeight: 700,
                fontSize: 23,
                lineHeight: 1,
                color: "#fff",
                textShadow: "0 1px 12px rgba(0,0,0,0.45)",
              }}
            >
              {couple.first}
              <br />
              <em style={{ fontFamily: MAST, fontWeight: 500, color: PINK_SOFT }}>&amp;</em> {couple.second}
            </span>
          </span>
          {(["top", "bottom"] as const).map((v) =>
            (["left", "right"] as const).map((h) => <i key={v + h} style={marca(v, h)} />)
          )}
        </span>
        <span style={{ display: "flex", gap: 0 }}>
          {[COBALT, PINK, GOLD, INK, GRAY].map((c) => (
            <i key={c} style={{ width: 20, height: 9, background: c }} />
          ))}
        </span>
      </span>

      <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
        <span style={{ fontFamily: MAST, fontStyle: "italic", fontSize: 27, lineHeight: 1.1, color: COBALT }}>
          Un especial de boda
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          <i aria-hidden="true" style={{ position: "relative", width: 8, height: 8, borderRadius: "50%", background: PINK }}>
            <i
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: PINK,
                animation: "ch-pulse 1.8s ease-out infinite",
              }}
            />
          </i>
          Toca para abrir tu ejemplar
        </span>
      </span>
    </button>
  );
}

// ─── Piezas de página ────────────────────────────────────────────────────────

// Cabecera de cada página interior: revista · sección · folio.
function RunHead({ titulo, folio }: { titulo: string; folio: number }) {
  return (
    <header className="ch-run">
      <span className="ch-run-mast">{REVISTA}</span>
      <span className="ch-run-title">{titulo}</span>
      <span className="ch-run-folio">pág. {folio}</span>
    </header>
  );
}

// Pie de página: "A continuación · [título] · pág. N →".
function NextLink({ index, onGo }: { index: number; onGo: (i: number) => void }) {
  return (
    <button type="button" className="ch-next" onClick={() => onGo(index)}>
      <span className="ch-next-kicker">A continuación</span>
      <span className="ch-next-title">{PAGINAS[index].titulo}</span>
      <span className="ch-next-folio">
        pág. {index + 1}
        <ArrowRight className="ch-arrow" size={20} strokeWidth={1.6} aria-hidden="true" />
      </span>
    </button>
  );
}

// ─── Portada ─────────────────────────────────────────────────────────────────

function Portada({
  couple,
  venue,
  coverSrc,
  minHeight,
  onGo,
}: {
  couple: Couple;
  venue: Venue;
  coverSrc: string;
  minHeight: string;
  onGo: (i: number) => void;
}) {
  const sombra = "0 1px 14px rgba(5,12,30,0.55)";
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", minHeight }}>
        <header style={{ padding: "12px 20px 0", textAlign: "center" }}>
          <p
            className="ch-ar"
            style={{
              fontFamily: MAST,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: "clamp(92px, 29vw, 124px)",
              lineHeight: 0.82,
              letterSpacing: "-0.02em",
              color: COBALT,
              paddingBottom: 10,
            }}
          >
            {REVISTA}
          </p>
          <p
            className="ch-ar"
            style={{
              ...ar(1),
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              padding: "7px 0",
              borderTop: `1px solid ${INK}`,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            <span>{NUMERO}</span>
            <span>12 · 09</span>
          </p>
        </header>

        <div style={{ position: "relative", flex: 1, minHeight: 560, display: "flex", flexDirection: "column", color: "#fff" }}>
          <FotoPortada src={coverSrc} alt={`${couple.amp} en la portada`} />
          <i
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(9,20,44,0.62) 0%, rgba(9,20,44,0.18) 36%, rgba(9,20,44,0.3) 56%, rgba(9,20,44,0.9) 100%)",
            }}
          />

          <nav aria-label="Índice" style={{ position: "relative", width: "64%", padding: "22px 0 0 20px", textShadow: sombra }}>
            <p
              className="ch-ar"
              style={{
                ...ar(2),
                display: "inline-block",
                background: PINK_SOFT,
                color: INK,
                textShadow: "none",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                padding: "5px 9px",
                marginBottom: 12,
              }}
            >
              En este número
            </p>
            {PAGINAS.slice(1).map((p, i) => (
              <button key={p.id} type="button" className="ch-line ch-ar" style={ar(3 + i)} onClick={() => onGo(i + 1)}>
                <span className="ch-line-title">
                  {p.titulo}
                  <em>pág. {i + 2}</em>
                </span>
                {i === 0 && (
                  <span style={{ display: "block", fontSize: 12.5, lineHeight: 1.35, marginTop: 3, opacity: 0.92 }}>
                    {p.nota}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="ch-ar"
            onClick={() => onGo(4)}
            aria-label="RSVP, página 5"
            style={{
              ...ar(6),
              appearance: "none",
              position: "absolute",
              top: 26,
              right: 16,
              width: 94,
              height: 94,
              padding: 0,
              border: 0,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: PINK,
                color: "#fff",
                boxShadow: `0 10px 24px rgba(5,12,30,0.4), inset 0 0 0 4px ${PINK}, inset 0 0 0 5px rgba(255,255,255,0.8)`,
                animation: "ch-wobble 5s ease-in-out infinite",
              }}
            >
              <b style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 23, lineHeight: 1, letterSpacing: "0.04em" }}>RSVP</b>
              <small style={{ fontFamily: MAST, fontStyle: "italic", fontWeight: 600, fontSize: 16, lineHeight: 1.1, marginTop: 3 }}>
                pág. 5
              </small>
            </span>
          </button>

          <div style={{ position: "relative", marginTop: "auto", padding: "40px 20px 84px", textShadow: sombra }}>
            <p
              className="ch-ar"
              style={{ ...ar(4), fontSize: 10.5, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase" }}
            >
              Junto a sus familias
            </p>
            <h1
              style={{
                fontFamily: HEAD,
                fontWeight: 700,
                fontSize: "clamp(54px, 17vw, 72px)",
                lineHeight: 0.96,
                letterSpacing: "-0.015em",
                color: "#fff",
                margin: "10px 0 12px",
              }}
            >
              <span style={{ display: "block" }}>
                <Kinetic text={couple.first} step={55} delay={350} />
              </span>
              <span style={{ display: "block" }}>
                <em className="ch-ar" style={{ ...ar(5), display: "inline-block", fontFamily: MAST, fontWeight: 500, color: PINK_SOFT }}>
                  &amp;
                </em>{" "}
                <Kinetic text={couple.second} step={55} delay={700} />
              </span>
            </h1>
            <p className="ch-ar" style={{ ...ar(7), fontFamily: MAST, fontStyle: "italic", fontSize: 22, lineHeight: 1.2 }}>
              te invitan a celebrar su boda
            </p>
            <p
              className="ch-ar"
              style={{
                ...ar(8),
                display: "flex",
                flexWrap: "wrap",
                gap: "2px 12px",
                marginTop: 14,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.6)",
                fontSize: 14.5,
                lineHeight: 1.4,
              }}
            >
              <b style={{ fontWeight: 600 }}>{FECHA_LARGA}</b>
              <span>{HORA}</span>
            </p>
            <p className="ch-ar" style={{ ...ar(9), fontSize: 14.5, lineHeight: 1.4, marginTop: 2 }}>
              {venue.street}, {venue.city}
            </p>
          </div>
        </div>
      </div>
      <footer className="ch-end" style={{ paddingTop: 22 }}>
        <NextLink index={1} onGo={onGo} />
      </footer>
    </>
  );
}

// ─── Página 2: Su historia ───────────────────────────────────────────────────

function Historia({ couple, photosPath, onGo }: { couple: Couple; photosPath: string; onGo: (i: number) => void }) {
  return (
    <>
      <RunHead titulo="Su historia" folio={2} />
      <div style={{ padding: "28px 20px 40px" }}>
        <p className="ch-kicker ch-ar">La entrevista</p>
        <blockquote style={{ position: "relative", margin: "6px 0 0", paddingTop: 58 }}>
          <span
            className="ch-ar"
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -6,
              left: -4,
              fontFamily: HEAD,
              fontWeight: 700,
              fontSize: 120,
              lineHeight: 1,
              color: PINK,
            }}
          >
            “
          </span>
          <p
            style={{
              fontFamily: HEAD,
              fontWeight: 700,
              fontStyle: "italic",
              fontSize: "clamp(27px, 8.2vw, 35px)",
              lineHeight: 1.16,
              letterSpacing: "-0.01em",
              color: INK,
              textWrap: "balance",
            }}
          >
            <Kinetic text={CITA} step={16} delay={150} />
          </p>
        </blockquote>

        <div style={{ position: "relative", margin: "40px 0 0", paddingBottom: "22%" }}>
          <i
            className="ch-ar"
            aria-hidden="true"
            style={{ ...ar(2), position: "absolute", top: "9%", right: -20, width: "58%", height: "66%", background: COBALT }}
          />
          <figure className="ch-ar" style={{ ...ar(3), position: "relative", width: "74%", margin: 0 }}>
            <Foto src={`${photosPath}/nosotros-1.jpg`} file="nosotros-1.jpg" alt={couple.amp} ratio="4 / 5" />
          </figure>
          <figure
            className="ch-ar"
            style={{
              ...ar(4),
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "48%",
              margin: 0,
              border: `6px solid ${PAPER}`,
              boxShadow: "0 18px 34px -18px rgba(17,38,74,0.6)",
            }}
          >
            <Foto src={`${photosPath}/nosotros-2.jpg`} file="nosotros-2.jpg" alt={couple.amp} ratio="1 / 1" />
          </figure>
        </div>

        <div className="ch-ar" style={{ ...ar(5), marginTop: 34 }}>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: INK, textWrap: "pretty" }}>
            <span
              aria-hidden="true"
              style={{
                float: "left",
                fontFamily: HEAD,
                fontWeight: 700,
                fontSize: 62,
                lineHeight: 0.84,
                color: COBALT,
                padding: "4px 10px 0 0",
              }}
            >
              {couple.prose.charAt(0)}
            </span>
            <span className="ch-sr">{couple.prose.charAt(0)}</span>
            {couple.prose.slice(1)} se conocieron en Huaral, donde el trabajo y la casualidad los pusieron en el
            mismo lugar. Lo que empezó como una conversación entre colegas se fue tejiendo despacio, con la misma
            paciencia que hace falta para construir algo que dure. Hoy, lo hacen oficial.
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginTop: 22 }}>
            <p
              style={{
                fontFamily: MAST,
                fontStyle: "italic",
                fontSize: 20,
                lineHeight: 1.2,
                color: COBALT,
                paddingBottom: 10,
                borderBottom: `2px solid ${PINK}`,
              }}
            >
              Contada por {couple.amp}
            </p>
            <Ramo size={96} />
          </div>
        </div>
      </div>
      <footer className="ch-end">
        <NextLink index={2} onGo={onGo} />
      </footer>
    </>
  );
}

// ─── Página 3: El día ────────────────────────────────────────────────────────

function Dia({ onGo }: { onGo: (i: number) => void }) {
  return (
    <>
      <RunHead titulo="El día" folio={3} />
      <div style={{ padding: "28px 20px 40px" }}>
        <header style={{ position: "relative" }}>
          <p className="ch-kicker ch-ar">El programa</p>
          <h2 className="ch-big" style={{ margin: "14px 0 0" }}>
            <Kinetic text="El día" step={90} delay={150} />
          </h2>
          <p
            className="ch-ar"
            style={{ ...ar(3), fontFamily: MAST, fontStyle: "italic", fontSize: 22, lineHeight: 1.25, color: COBALT, marginTop: 14, maxWidth: "66%" }}
          >
            {PAGINAS[2].nota}
          </p>
          <p
            className="ch-ar"
            style={{ ...ar(4), fontSize: 11.5, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 14 }}
          >
            {FECHA_LARGA}
          </p>
          <div className="ch-ar" style={{ ...ar(5), position: "absolute", right: 0, bottom: 18 }}>
            <Tarta size={92} />
          </div>
        </header>

        <ol style={{ listStyle: "none", margin: "26px 0 0", padding: 0, borderTop: `2px solid ${INK}` }}>
          {PROGRAMA.map((item, i) => (
            <li
              key={item.hora}
              className="ch-ar"
              style={{
                ...ar(5 + i),
                display: "grid",
                gridTemplateColumns: "58px 1fr",
                alignItems: "start",
                gap: 6,
                padding: "18px 0 20px",
                borderBottom: `1px solid rgba(26,26,26,0.25)`,
              }}
            >
              <span
                aria-hidden="true"
                style={{ fontFamily: HEAD, fontWeight: 700, fontStyle: "italic", fontSize: 54, lineHeight: 0.9, color: PINK }}
              >
                {i + 1}
              </span>
              <div>
                <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: COBALT }}>
                  {item.hora}
                </p>
                <h3 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 24, lineHeight: 1.15, color: INK, margin: "5px 0 6px" }}>
                  {item.titulo}
                </h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.6, color: GRAY }}>{item.nota}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <footer className="ch-end">
        <NextLink index={3} onGo={onGo} />
      </footer>
    </>
  );
}

// ─── Página 4: La guía ───────────────────────────────────────────────────────

function Guia({ venue, onGo }: { venue: Venue; onGo: (i: number) => void }) {
  return (
    <>
      <RunHead titulo="La guía" folio={4} />
      <div style={{ padding: "28px 20px 40px" }}>
        <p className="ch-kicker ch-ar">Antes de venir</p>
        <h2 className="ch-big" style={{ margin: "14px 0 26px" }}>
          <Kinetic text="La guía" step={80} delay={150} />
        </h2>

        <div style={{ display: "grid", gap: 16 }}>
          <article className="ch-box ch-ar" style={{ ...ar(3), background: COBALT, borderColor: COBALT, color: "#fff" }}>
            <h3 className="ch-box-label" style={{ color: PINK_SOFT }}>
              Dónde
            </h3>
            <p style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 25, lineHeight: 1.15 }}>{venue.street}</p>
            <p style={{ fontFamily: MAST, fontStyle: "italic", fontSize: 21, lineHeight: 1.2, marginTop: 4 }}>{venue.city}</p>
            <p style={{ fontSize: 14.5, lineHeight: 1.5, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.4)" }}>
              {FECHA_LARGA} · {HORA}
            </p>
            <a
              className="ch-pill"
              href={venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#fff", color: COBALT }}
            >
              Abrir en Maps
              <ArrowRight className="ch-arrow" size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          </article>

          <article className="ch-box ch-ar" style={ar(4)}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <h3 className="ch-box-label">Qué ponerse</h3>
                <p style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 25, lineHeight: 1.15, color: INK, marginBottom: 8 }}>
                  Formal.
                </p>
                <p className="ch-box-text">Siéntete libre de atreverte con el color.</p>
              </div>
              <Zapatos size={118} />
            </div>
          </article>

          <article className="ch-box ch-ar" style={ar(5)}>
            <h3 className="ch-box-label">Dónde alojarse</h3>
            <p className="ch-box-text">Consulta con nosotros para recomendaciones cerca del lugar.</p>
            <hr style={{ border: 0, borderTop: `1px dashed rgba(26,26,26,0.35)`, margin: "18px 0" }} />
            <h3 className="ch-box-label">Sobre los regalos</h3>
            <p className="ch-box-text">Tu presencia es el único regalo que pedimos.</p>
          </article>
        </div>
      </div>
      <footer className="ch-end">
        <NextLink index={4} onGo={onGo} />
      </footer>
    </>
  );
}

// ─── Página 5: RSVP ──────────────────────────────────────────────────────────
// Mismo patrón que la Reserva de Oliva: al enviar, el formulario se desvanece y
// la confirmación ocupa su misma celda de grilla. La demo no envía nada; la
// ruta de cliente abre WhatsApp 600ms después.

const FADE_MS = 400;
const WA_DELAY_MS = 600;

function Sello({ activo }: { activo: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 14,
        right: 12,
        padding: "6px 12px",
        border: `2px solid ${PINK}`,
        outline: `1px solid ${PINK}`,
        outlineOffset: 2,
        borderRadius: 4,
        color: PINK,
        fontFamily: HEAD,
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        transform: "rotate(-11deg)",
        opacity: activo ? 1 : 0.22,
        animation: activo ? "ch-stamp 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2) both" : "none",
        pointerEvents: "none",
      }}
    >
      Recibido
    </span>
  );
}

function Rsvp({
  demo,
  couple,
  galeriaHref,
  onGo,
}: {
  demo: boolean;
  couple: Couple;
  galeriaHref: string;
  onGo: (i: number) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [asiste, setAsiste] = useState<"si" | "no" | null>(null);
  const [personas, setPersonas] = useState(1);
  const [nota, setNota] = useState("");
  const [errors, setErrors] = useState<{ nombre?: string; asiste?: string }>({});
  const [fase, setFase] = useState<"form" | "saliendo" | "enviado">("form");
  const [waBloqueado, setWaBloqueado] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pendientes = timers.current;
    return () => pendientes.forEach((t) => window.clearTimeout(t));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = nombre.trim();
    const errs: typeof errors = {};
    if (!limpio) errs.nombre = "Escribe tu nombre para enviar tu respuesta.";
    if (!asiste) errs.asiste = "Elige una de las dos opciones.";
    setErrors(errs);
    if (errs.nombre || errs.asiste) return;

    const base =
      asiste === "si"
        ? `Hola, confirmo asistencia a la boda de ${couple.prose}. Soy ${limpio}, ${
            personas === 1 ? "asistirá 1 persona" : `asistiremos ${personas} personas`
          }.`
        : `Hola, lamentablemente no podré asistir a la boda de ${couple.prose}. Soy ${limpio}.`;
    const linea = nota.trim();
    const mensaje = linea ? `${base} Mi línea para los novios: ${linea}` : base;
    const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;

    setFase("saliendo");
    timers.current.push(
      window.setTimeout(() => {
        setFase("enviado");
        if (demo) return;
        timers.current.push(
          window.setTimeout(() => {
            // Fuera del gesto del clic: si el navegador bloquea la ventana
            // (Safari iOS), queda un botón para abrir WhatsApp a mano. Sin
            // "noopener" en las features: con él window.open devuelve siempre
            // null y no se sabría si la ventana se bloqueó.
            const win = window.open(waLink, "_blank");
            if (win) win.opener = null;
            else setWaBloqueado(waLink);
          }, WA_DELAY_MS)
        );
      }, FADE_MS)
    );
  };

  return (
    <>
      <RunHead titulo="RSVP" folio={5} />
      <div style={{ padding: "28px 20px 40px" }}>
        <h2
          style={{
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize: "clamp(88px, 29vw, 124px)",
            lineHeight: 0.86,
            letterSpacing: "-0.03em",
            color: COBALT,
          }}
        >
          <Kinetic text="RSVP" step={110} delay={120} />
        </h2>
        <p className="ch-ar" style={{ ...ar(4), fontFamily: MAST, fontStyle: "italic", fontSize: 23, lineHeight: 1.25, marginTop: 16 }}>
          Por favor, responde antes del {RSVP_HASTA}.
        </p>

        <div
          className="ch-ar"
          style={{
            ...ar(5),
            position: "relative",
            marginTop: 28,
            padding: "22px 18px 22px",
            background: "#fff",
            border: `1.5px dashed ${INK}`,
          }}
        >
          <Sello activo={fase === "enviado"} />
          <div style={{ display: "grid" }}>
            <form
              noValidate
              onSubmit={handleSubmit}
              aria-hidden={fase !== "form"}
              style={{
                gridArea: "1 / 1",
                display: "grid",
                gap: 22,
                opacity: fase === "form" ? 1 : 0,
                visibility: fase === "enviado" ? "hidden" : "visible",
                transition: `opacity ${FADE_MS}ms ease`,
                pointerEvents: fase === "form" ? "auto" : "none",
              }}
            >
              <p className="ch-kicker" style={{ paddingRight: 120 }}>
                Tarjeta del lector
              </p>

              <div>
                <label className="ch-flabel" htmlFor="chosas-nombre">
                  Tu nombre
                </label>
                <input
                  id="chosas-nombre"
                  className="ch-input"
                  name="nombre"
                  autoComplete="name"
                  autoCapitalize="words"
                  spellCheck={false}
                  maxLength={60}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  aria-invalid={!!errors.nombre}
                  aria-describedby={errors.nombre ? "chosas-nombre-error" : undefined}
                />
                {errors.nombre && (
                  <p id="chosas-nombre-error" className="ch-error" role="alert">
                    {errors.nombre}
                  </p>
                )}
              </div>

              <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                <legend className="ch-flabel">¿Vendrás?</legend>
                {(
                  [
                    ["si", "Acepto con alegría"],
                    ["no", "Lo siento, no podré"],
                  ] as const
                ).map(([valor, texto]) => (
                  <label key={valor} className="ch-choice">
                    <input
                      type="radio"
                      name="asistencia"
                      value={valor}
                      checked={asiste === valor}
                      onChange={() => setAsiste(valor)}
                    />
                    <span className="ch-check" aria-hidden="true">
                      <Check size={17} color="#fff" strokeWidth={3} />
                    </span>
                    {texto}
                  </label>
                ))}
                {errors.asiste && (
                  <p className="ch-error" role="alert">
                    {errors.asiste}
                  </p>
                )}
              </fieldset>

              {asiste !== "no" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                  <span className="ch-flabel" style={{ margin: 0 }}>
                    Personas en total
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      type="button"
                      className="ch-step"
                      aria-label="Una persona menos"
                      disabled={personas <= 1}
                      onClick={() => setPersonas((n) => Math.max(1, n - 1))}
                    >
                      <Minus size={18} aria-hidden="true" />
                    </button>
                    <span
                      aria-live="polite"
                      style={{ minWidth: 46, textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 28, lineHeight: 1, fontVariantNumeric: "lining-nums" }}
                    >
                      {personas}
                    </span>
                    <button
                      type="button"
                      className="ch-step"
                      aria-label="Una persona más"
                      disabled={personas >= MAX_PERSONAS}
                      onClick={() => setPersonas((n) => Math.min(MAX_PERSONAS, n + 1))}
                    >
                      <Plus size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="ch-flabel" htmlFor="chosas-nota">
                  Una línea para las cartas de los lectores (opcional)
                </label>
                <textarea
                  id="chosas-nota"
                  className="ch-input"
                  name="nota"
                  rows={2}
                  maxLength={240}
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  style={{ resize: "none" }}
                />
              </div>

              <button type="submit" className="ch-submit">
                Enviar mi respuesta
                <ArrowRight className="ch-arrow" size={18} strokeWidth={2} aria-hidden="true" />
              </button>
            </form>

            {fase === "enviado" && (
              <div
                role="status"
                style={{
                  gridArea: "1 / 1",
                  alignSelf: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "center",
                  padding: "40px 0 10px",
                  animation: `ch-fade ${FADE_MS}ms ease both`,
                }}
              >
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: COBALT,
                  }}
                >
                  <Check size={36} color="#fff" strokeWidth={2.2} aria-hidden="true" />
                </span>
                <h3
                  style={{
                    fontFamily: HEAD,
                    fontWeight: 700,
                    fontSize: "clamp(26px, 7.6vw, 32px)",
                    lineHeight: 1.15,
                    color: INK,
                    marginTop: 6,
                    overflowWrap: "anywhere",
                  }}
                >
                  {asiste === "si" ? `¡Gracias, ${nombre.trim()}!` : "Gracias por avisarnos"}
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: GRAY }}>
                  {asiste === "si"
                    ? "Tu respuesta llegó a la redacción."
                    : "Lamentamos mucho que no puedas acompañarnos."}
                </p>
                <p style={{ fontFamily: MAST, fontStyle: "italic", fontSize: 23, lineHeight: 1.25, color: COBALT }}>
                  {asiste === "si" ? `Te esperamos el ${FECHA_CORTA}.` : "Te tendremos presente ese día."}
                </p>
                {waBloqueado && <WhatsAppButton href={waBloqueado} label="Enviar por WhatsApp" style={{ marginTop: 8 }} />}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="ch-end" style={{ textAlign: "center" }}>
        <div style={{ borderTop: `2px solid ${INK}`, paddingTop: 16, textAlign: "left" }}>
          <button
            type="button"
            onClick={() => onGo(0)}
            style={{
              appearance: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 0",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              color: COBALT,
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
            Volver a la portada
          </button>
        </div>

        <p style={{ fontFamily: MAST, fontStyle: "italic", fontSize: 21, lineHeight: 1.2, color: GRAY, marginTop: 30 }}>
          Editado con amor por
        </p>
        <p style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 27, lineHeight: 1.15, color: INK, marginTop: 4 }}>{couple.amp}</p>

        {/* Link (no <a>): la navegación client-side mantiene la música sonando */}
        <Link
          href={galeriaHref}
          style={{
            display: "inline-block",
            marginTop: 18,
            padding: "10px 2px",
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: COBALT,
            textDecoration: "none",
            borderBottom: `1px solid ${PINK}`,
          }}
        >
          Ver galería de fotos →
        </Link>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginTop: 36 }}>
          <span aria-hidden="true" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <i style={{ display: "block", width: BARRAS_ANCHO, height: 36, backgroundImage: BARRAS_CSS }} />
            <b style={{ fontSize: 8.5, fontWeight: 500, letterSpacing: "0.12em", color: INK }}>9 772026 091209</b>
          </span>
          <span style={{ fontFamily: MAST, fontStyle: "italic", fontWeight: 600, fontSize: 34, lineHeight: 0.9, color: COBALT }}>
            {REVISTA}
          </span>
        </div>
      </footer>
    </>
  );
}

// ─── Índice flotante ─────────────────────────────────────────────────────────
// Botón fijo abajo a la izquierda, visible en todas las páginas; abre una hoja
// con el índice completo y marca la página que se está leyendo.

function Indice({ actual, onGo }: { actual: number; onGo: (i: number) => void }) {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        className="ch-fab"
        onClick={() => setAbierto(true)}
        aria-label="Abrir el índice"
        aria-expanded={abierto}
        style={{
          appearance: "none",
          left: "max(18px, calc(50vw - 215px + 18px))",
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          height: 48,
          padding: "0 18px",
          borderRadius: 999,
          border: `1px solid ${INK}`,
          background: "rgba(250,250,248,0.94)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 12px 28px rgba(17,38,74,0.22)",
          color: INK,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        <BookOpen size={17} strokeWidth={1.7} aria-hidden="true" />
        Índice
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Índice"
          onClick={() => setAbierto(false)}
          style={{
            position: "fixed",
            inset: 0,
            margin: "0 auto",
            maxWidth: 430,
            zIndex: 90,
            display: "flex",
            alignItems: "flex-end",
            background: "rgba(17,38,74,0.55)",
            animation: "ch-fade 0.25s ease both",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxHeight: "92svh",
              overflowY: "auto",
              background: PAPER,
              borderTop: `3px solid ${COBALT}`,
              padding: "20px 20px 26px",
              animation: "ch-sheet 0.38s cubic-bezier(0.2, 0.8, 0.2, 1) both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontFamily: MAST, fontStyle: "italic", fontWeight: 600, fontSize: 34, lineHeight: 1, color: COBALT }}>
                {REVISTA}
              </span>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar el índice"
                autoFocus
                style={{
                  appearance: "none",
                  display: "grid",
                  placeItems: "center",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: `1px solid ${INK}`,
                  background: "transparent",
                  color: INK,
                  cursor: "pointer",
                }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="ch-kicker" style={{ margin: "14px 0 10px" }}>
              En este número
            </p>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `2px solid ${INK}` }}>
              {PAGINAS.map((p, i) => {
                const leyendo = i === actual;
                return (
                  <li key={p.id} style={{ borderBottom: `1px solid rgba(26,26,26,0.25)` }}>
                    <button
                      type="button"
                      aria-current={leyendo ? "page" : undefined}
                      onClick={() => {
                        setAbierto(false);
                        onGo(i);
                      }}
                      style={{
                        appearance: "none",
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        alignItems: "baseline",
                        gap: "2px 12px",
                        width: "100%",
                        padding: "13px 0 14px",
                        background: "transparent",
                        border: 0,
                        textAlign: "left",
                        cursor: "pointer",
                        color: leyendo ? COBALT : INK,
                      }}
                    >
                      <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 23, lineHeight: 1.15 }}>{p.titulo}</span>
                      <span style={{ fontFamily: MAST, fontStyle: "italic", fontSize: 19 }}>pág. {i + 1}</span>
                      {(leyendo || p.nota) && (
                        <span style={{ gridColumn: "1 / -1", fontSize: 13.5, lineHeight: 1.4, color: GRAY }}>
                          {leyendo ? (
                            <b style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: PINK_DEEP }}>
                              Leyendo ahora
                            </b>
                          ) : (
                            p.nota
                          )}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Música ──────────────────────────────────────────────────────────────────

/** true si el mp3 existe: sin canción no se muestra el botón flotante. */
export function useMusicAvailable(src: string) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(src, { method: "HEAD" })
      .then((r) => {
        const type = r.headers.get("content-type") ?? "";
        if (alive) setOk(r.ok && !type.includes("text/html"));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [src]);
  return ok;
}

export function MusicFab({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="music-fab"
      aria-label={playing ? "Pausar música" : "Reproducir música"}
      style={{
        position: "fixed",
        bottom: 18,
        right: "max(18px, calc(50vw - 215px + 18px))",
        zIndex: 60,
        width: 48,
        height: 48,
        borderRadius: 999,
        border: 0,
        background: COBALT,
        boxShadow: "0 12px 28px rgba(17,38,74,0.35)",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        color: "#fff",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: 999,
          border: `1px solid ${PINK}`,
          opacity: playing ? 1 : 0,
          pointerEvents: "none",
          animation: playing ? "pulse-ring 1.4s infinite" : "none",
        }}
      />
      {playing ? (
        <Pause size={17} fill="currentColor" strokeWidth={0} aria-hidden="true" />
      ) : (
        <Play size={17} fill="currentColor" strokeWidth={0} aria-hidden="true" style={{ marginLeft: 2 }} />
      )}
    </button>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function InvitationChosas({
  demo = false,
  galeriaHref = "/chosas/galeria",
  photosPath = DEMO_PHOTOS_PATH,
  musicSrc = MUSIC_SRC,
}: {
  demo?: boolean;
  // Las rutas de clientes pasan su propia galería y sus propios assets
  // (public/chosas/<cliente>/photos y .../music.mp3).
  galeriaHref?: string;
  photosPath?: string;
  musicSrc?: string;
}) {
  const [gate, setGate] = useState<"cerrada" | "abriendo" | "abierta">("cerrada");
  const [pagina, setPagina] = useState(0);
  const [sentido, setSentido] = useState<"fwd" | "back">("fwd");
  const [bannerH, setBannerH] = useState(0);
  const pageRef = useRef<HTMLElement>(null);
  const [turnos, setTurnos] = useState(0); // 0 = todavía no se pasó de página
  const hasMusic = useMusicAvailable(musicSrc);
  const { playing, play, toggle } = useMusic(musicSrc, DESIGN_ID);
  const couple = coupleFor(demo);
  // La demo nunca muestra la dirección real: venueFor(true) es la Plaza de
  // Armas de Lima; la ruta de cliente recibe el local real de Huaral.
  const venue = venueFor(demo);
  const coverSrc = `${photosPath}/cover.jpg`;

  useEffect(() => {
    if (gate !== "abriendo") return;
    const t = window.setTimeout(() => setGate("abierta"), APERTURA_MS + 60);
    return () => window.clearTimeout(t);
  }, [gate]);

  // Al pasar de página el foco va a la página nueva (lectores de pantalla y
  // teclado); en la primera carga no se toca.
  useEffect(() => {
    if (turnos) pageRef.current?.focus({ preventScroll: true });
  }, [turnos]);

  // Se llama dentro del clic de la pantalla de entrada: es el gesto que deja
  // arrancar la canción.
  const handleOpen = () => {
    if (gate !== "cerrada") return;
    setGate("abriendo");
    if (hasMusic) play();
    window.scrollTo({ top: 0 });
  };

  const goTo = (i: number) => {
    if (i === pagina) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSentido(i > pagina ? "fwd" : "back");
    setPagina(i);
    setTurnos((n) => n + 1);
    window.scrollTo({ top: 0 });
  };

  const opened = gate !== "cerrada";

  return (
    <div id="invitation-root" className="ch-root" style={{ background: PAPER }}>
      <style>{CHOSAS_CSS}</style>
      {demo && <DemoBanner onHeight={setBannerH} />}
      {gate !== "abierta" && (
        <Gate couple={couple} coverSrc={coverSrc} top={bannerH} opening={gate === "abriendo"} onOpen={handleOpen} />
      )}
      {gate === "abierta" && <Indice actual={pagina} onGo={goTo} />}
      {opened && hasMusic && <MusicFab playing={playing} onToggle={toggle} />}

      <main style={{ position: "relative", zIndex: 1, paddingTop: bannerH }}>
        <section
          key={pagina}
          ref={pageRef}
          tabIndex={-1}
          aria-label={PAGINAS[pagina].titulo}
          className={`ch-page ${opened ? (turnos ? `ch-turn-${sentido}` : "") : "ch-hold"}`}
        >
          {pagina === 0 && (
            <Portada
              couple={couple}
              venue={venue}
              coverSrc={coverSrc}
              minHeight={`calc(100svh - ${bannerH}px)`}
              onGo={goTo}
            />
          )}
          {pagina === 1 && <Historia couple={couple} photosPath={photosPath} onGo={goTo} />}
          {pagina === 2 && <Dia onGo={goTo} />}
          {pagina === 3 && <Guia venue={venue} onGo={goTo} />}
          {pagina === 4 && <Rsvp demo={demo} couple={couple} galeriaHref={galeriaHref} onGo={goTo} />}
        </section>
      </main>
    </div>
  );
}
