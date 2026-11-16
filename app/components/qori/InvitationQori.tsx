"use client";

// Diseño Qori (16 nov 2026): invitación de boda de temática cusqueña andina.
// "Qori" es oro en quechua. La estructura (entrada interactiva, portada tipo
// tarjeta, historia, el día hora a hora, cómo llegar, vestimenta, RSVP con
// formulario y cierre) sigue la referencia _ref/wedvitation-midsommar.txt,
// llevada a la paleta y los motivos del Cusco: chakanas, franjas de manta y un
// telar en canvas que el invitado teje para abrir la invitación.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, Camera, Check, Minus, Pause, Play, Plus, Sparkles, X } from "lucide-react";
import { useMusic } from "@/app/components/shared/useMusic";
import WhatsAppButton, { WhatsAppLogo } from "@/app/components/shared/WhatsAppButton";
import { VENUE_CUSCO, type Venue } from "@/lib/venue";
import { coupleFor } from "@/lib/couple";

const DESIGN_ID = "qori";

// Assets del DEMO. Cada cliente pasa los suyos con `photosPath` y `musicSrc`
// (public/qori/<cliente>/). La galería importa MUSIC_SRC como default.
export const MUSIC_SRC = "/qori-demo/music.mp3";
export const DEMO_PHOTOS_PATH = "/qori-demo/photos";

// ─── Paleta ──────────────────────────────────────────────────────────────────
export const RED = "#8B1A1A"; // rojo imperial inca
export const GOLD = "#C9A84C"; // oro andino
export const GREEN = "#2C4A1E"; // verde coca
export const CREAM = "#F5E6C8"; // crema pergamino
export const SMOKE = "#1A0A00"; // negro humo
export const EARTH = "#6B3A1F"; // tierra
// El oro #C9A84C sobre el pergamino no alcanza contraste para texto chico: las
// líneas pequeñas sobre crema usan este oro viejo, más oscuro.
const GOLD_DEEP = "#8A6A1C";
const CREAM_DARK = "#EBD7B0";

// ─── Tipografías (en el <link> de app/layout.tsx) ────────────────────────────
export const TITLE = "'Cinzel', 'Times New Roman', serif";
export const SUB = "'Cormorant Garamond', Georgia, serif";
export const BODY = "'Lato', 'Segoe UI', Arial, sans-serif";

// Rombos andinos en CSS puro: dos familias de diagonales que se cruzan.
export const rombos = (opacity = 0.3): string =>
  `repeating-linear-gradient(45deg, rgba(139,26,26,${opacity}) 0 2px, transparent 2px 26px), ` +
  `repeating-linear-gradient(-45deg, rgba(139,26,26,${opacity}) 0 2px, transparent 2px 26px)`;

// ─── Datos del evento (los comparten la demo y el cliente) ───────────────────
const FECHA_PORTADA = "Septiembre 12, 2026";
const FECHA_TEXTO = "12 de septiembre";
const RSVP_HASTA = "1 de septiembre";
const WA_NUMBER = "51993092110";
const MAX_PERSONAS = 10;

const ITINERARIO = [
  { num: "I", hora: "4:00 PM", titulo: "La ceremonia civil", nota: "Por favor, llega unos minutos antes." },
  { num: "II", hora: "5:00 PM", titulo: "Brindis y fotos", nota: "Una copa y un recuerdo para siempre." },
  { num: "III", hora: "6:30 PM", titulo: "La cena", nota: "Una mesa compartida bajo el cielo cusqueño." },
  { num: "IV", hora: "8:30 PM", titulo: "El primer baile", nota: "Primero el nuestro, luego la pista es tuya." },
  { num: "V", hora: "11:00 PM", titulo: "Hasta pronto", nota: "Un último abrazo y nos vemos en el camino." },
];

const VESTIMENTA = [
  { color: RED, nombre: "Rojo imperial" },
  { color: GOLD, nombre: "Oro andino" },
  { color: GREEN, nombre: "Verde coca" },
  { color: EARTH, nombre: "Tierra" },
  { color: CREAM, nombre: "Crema" },
];

// Nombre y dirección de la tarjeta "Cómo llegar". Para la Plaza de Armas del
// Cusco se usa el nombre completo; cualquier otro local sale de su Venue.
function lugarDe(venue: Venue) {
  return venue === VENUE_CUSCO
    ? { nombre: "Plaza de Armas del Cusco", direccion: "Centro Histórico · Cusco, Perú" }
    : { nombre: venue.street, direccion: venue.city };
}

const QORI_CSS = `
@keyframes qori-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes qori-rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
@keyframes qori-pop { from { transform: scale(0) } to { transform: scale(1) } }
@keyframes qori-bob { 0%, 100% { transform: translateY(-5px) } 50% { transform: translateY(7px) } }
@keyframes qori-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.55) } 50% { box-shadow: 0 0 0 12px rgba(201,168,76,0) } }
.qori-input::placeholder { color: rgba(245,230,200,0.55); }
.qori-input:focus-visible, .qori-btn:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
`;

// ─── Chakana (cruz andina) ───────────────────────────────────────────────────
// El contorno es el del brief; se le agrega el círculo central calado.

export function Chakana({
  size = 16,
  color = "currentColor",
  style,
}: {
  size?: number | string;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0, color, ...style }}
    >
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M35 0 L65 0 L65 35 L100 35 L100 65 L65 65 L65 100 L35 100 L35 65 L0 65 L0 35 L35 35 Z M50 37 A13 13 0 1 0 50 63 A13 13 0 1 0 50 37 Z"
      />
    </svg>
  );
}

// Separador entre secciones: línea fina dorada con una chakana centrada.
export function Separador({ color = GOLD, style }: { color?: string; style?: React.CSSProperties }) {
  const linea = (dir: "left" | "right"): React.CSSProperties => ({
    flex: 1,
    height: 1,
    background: `linear-gradient(to ${dir}, ${color}, transparent)`,
  });
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        maxWidth: 300,
        margin: "0 auto",
        ...style,
      }}
    >
      <span style={linea("left")} />
      <Chakana size={7} color={color} style={{ opacity: 0.7 }} />
      <Chakana size={15} color={color} />
      <Chakana size={7} color={color} style={{ opacity: 0.7 }} />
      <span style={linea("right")} />
    </div>
  );
}

// Franja de manta: listas de colores como el borde de un aguayo.
export function Franja({ style }: { style?: React.CSSProperties }) {
  const stops = [
    [RED, 14],
    [GOLD, 4],
    [GREEN, 10],
    [CREAM, 3],
    [EARTH, 8],
    [GOLD, 4],
    [RED, 14],
    [SMOKE, 3],
  ] as const;
  let x = 0;
  const parts = stops.map(([c, w]) => {
    const from = x;
    x += w;
    return `${c} ${from}px ${x}px`;
  });
  return (
    <div
      aria-hidden="true"
      style={{
        height: 12,
        backgroundImage: `repeating-linear-gradient(90deg, ${parts.join(", ")})`,
        borderTop: `2px solid ${GOLD}`,
        borderBottom: `2px solid ${GOLD}`,
        ...style,
      }}
    />
  );
}

// ─── Scroll reveal (mismas clases CSS globales que los otros diseños) ────────

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

function Reveal({
  children,
  delay = 0,
  kind = "reveal",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  kind?: string;
  style?: React.CSSProperties;
}) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`${kind}${delay ? " delay-" + delay : ""} ${inView ? "in" : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}

// Variante que se dispara al abrir la invitación (no con scroll): la portada.
function EnterReveal({
  active,
  delay = 0,
  children,
}: {
  active: boolean;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`reveal${active ? " in" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Titulo({
  children,
  color = RED,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h2
      style={{
        fontFamily: TITLE,
        fontWeight: 600,
        fontSize: "clamp(24px, 7.4vw, 31px)",
        lineHeight: 1.15,
        letterSpacing: "0.06em",
        color,
        textAlign: "center",
        textWrap: "balance",
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

const subtitulo: React.CSSProperties = {
  fontFamily: SUB,
  fontStyle: "italic",
  fontSize: 20,
  lineHeight: 1.35,
  color: EARTH,
  textAlign: "center",
  textWrap: "balance",
};

const parrafo: React.CSSProperties = {
  fontFamily: BODY,
  fontSize: 16,
  lineHeight: 1.7,
  color: SMOKE,
  textAlign: "center",
  textWrap: "pretty",
};

const boton: React.CSSProperties = {
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  cursor: "pointer",
  fontFamily: TITLE,
  fontWeight: 600,
  fontSize: 13,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  textDecoration: "none",
  padding: "13px 26px",
  borderRadius: 2,
  border: `1px solid ${RED}`,
  background: RED,
  color: CREAM,
};

/* eslint-disable @next/next/no-img-element */

// ─── Foto de la pareja ───────────────────────────────────────────────────────
// Carga `${base}/${file}`. Si no existe muestra un placeholder con el nombre
// esperado del archivo; con `optional`, no muestra nada.

function Foto({
  file,
  base,
  alt,
  ratio = "4 / 5",
  optional = false,
}: {
  file: string;
  base: string;
  alt: string;
  ratio?: string;
  optional?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Si la imagen del HTML SSR ya terminó (o falló) antes de hidratar, onLoad y
  // onError no vuelven a dispararse: se lee el estado real.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) setLoaded(true);
    else setMissing(true);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: ratio, overflow: "hidden" }}>
      {!loaded && !optional && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: CREAM_DARK,
            backgroundImage: rombos(0.1),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            color: EARTH,
          }}
        >
          <Camera size={30} strokeWidth={1.3} aria-hidden="true" />
          <span style={{ fontFamily: BODY, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {file}
          </span>
        </div>
      )}
      {!missing && (
        <img
          ref={imgRef}
          src={`${base}/${file}`}
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
          }}
        />
      )}
    </div>
  );
}

/** true cuando el archivo existe (para no reservar lugar a una foto opcional). */
function useImageExists(src: string) {
  const [exists, setExists] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setExists(true);
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);
  return exists;
}

// Marco colonial: filete dorado y escuadras en las cuatro esquinas, como los
// marcos de los cuadros de la escuela cusqueña.
function MarcoColonial({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const esquina = (v: "top" | "bottom", h: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    [v]: 0,
    [h]: 0,
    width: 34,
    height: 34,
    [`border${v === "top" ? "Top" : "Bottom"}`]: `3px solid ${GOLD}`,
    [`border${h === "left" ? "Left" : "Right"}`]: `3px solid ${GOLD}`,
    pointerEvents: "none",
  });
  const rombo = (v: "top" | "bottom", h: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    [v]: 9,
    [h]: 9,
    width: 8,
    height: 8,
    background: RED,
    transform: "rotate(45deg)",
    pointerEvents: "none",
  });
  return (
    <div style={{ position: "relative", padding: 13, ...style }}>
      <div
        style={{
          padding: 5,
          border: `1px solid ${GOLD}`,
          background: "#FBF1DC",
          boxShadow: "0 22px 40px -24px rgba(26,10,0,0.6)",
        }}
      >
        {children}
      </div>
      {(["top", "bottom"] as const).map((v) =>
        (["left", "right"] as const).map((h) => (
          <span key={v + h} aria-hidden="true">
            <span style={esquina(v, h)} />
            <span style={rombo(v, h)} />
          </span>
        ))
      )}
    </div>
  );
}

// ─── Banner de demo (solo en /qori, no en las invitaciones de clientes) ──────

function DemoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    "¡Hola! Me gusta el diseño Qori y quiero una invitación como esta."
  )}`;

  return (
    <div
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
        background: "rgba(26, 10, 0, 0.92)",
        borderBottom: `1px solid ${GOLD}`,
        backdropFilter: "blur(8px)",
        color: CREAM,
        fontFamily: BODY,
        fontSize: 12.5,
        lineHeight: 1.25,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Sparkles size={14} color={GOLD} aria-hidden="true" style={{ flexShrink: 0 }} />
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
          color: CREAM,
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

// ─── Pantalla de entrada: el telar ───────────────────────────────────────────
// Un canvas a pantalla completa con la urdimbre dibujada (líneas horizontales
// cada 8px). Al arrastrar el dedo o el mouse se teje la trama: el paso deja
// una banda de 7 hilos de 4px que sigue al puntero, cambia de color en cada
// cambio de dirección y pasa por encima y por debajo de la urdimbre en damero.
// Todo se lleva en una grilla de celdas de 8px, que además da el progreso
// (celdas tejidas / total). Al 60% aparece "Abrir invitación".

const CELL = 8; // separación de la urdimbre
const HILO = 4; // grosor de cada hilo de trama
const BANDA = 3; // hilos a cada lado del puntero (7 en total)
const TEJIDO_COLORES = [RED, GOLD, GREEN];
const ABRIR_AL = 0.6;
const GIRO_PX = 14; // retroceso horizontal que cuenta como cambio de dirección

function TelarGate({
  demo,
  leaving,
  onOpen,
}: {
  demo: boolean;
  leaving: boolean;
  onOpen: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [avance, setAvance] = useState(0); // 0..1 respecto de la meta (60%)
  const [tocado, setTocado] = useState(false);
  const listo = avance >= 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let cols = 0;
    let rows = 0;
    let grid = new Uint8Array(0); // 0 = sin tejer; n = color n-1
    let tejidas = 0;
    let ultimoPct = -1;

    const pintarCelda = (c: number, r: number) => {
      const v = grid[r * cols + c];
      if (!v) return;
      const x = c * CELL;
      const y = r * CELL + (CELL - HILO) / 2;
      ctx.clearRect(x, y, CELL, HILO);
      const encima = (c + r) % 2 === 0;
      ctx.globalAlpha = encima ? 1 : 0.34;
      ctx.fillStyle = TEJIDO_COLORES[v - 1];
      ctx.fillRect(x, y, CELL, HILO);
      if (encima) {
        // Un filo de luz arriba del hilo le da volumen de lana.
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, CELL, 1);
      }
      ctx.globalAlpha = 1;
    };

    const redibujar = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const nCols = Math.ceil(w / CELL);
      const nRows = Math.ceil(h / CELL);
      // Al cambiar de tamaño (barra del navegador, giro) se conserva lo tejido.
      if (nCols !== cols || nRows !== rows) {
        const nuevo = new Uint8Array(nCols * nRows);
        tejidas = 0;
        for (let r = 0; r < Math.min(rows, nRows); r++) {
          for (let c = 0; c < Math.min(cols, nCols); c++) {
            const v = grid[r * cols + c];
            if (v) {
              nuevo[r * nCols + c] = v;
              tejidas++;
            }
          }
        }
        grid = nuevo;
        cols = nCols;
        rows = nRows;
      }
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // Urdimbre: líneas horizontales tenues cada 8px.
      ctx.fillStyle = "rgba(201, 168, 76, 0.2)";
      for (let r = 0; r <= rows; r++) ctx.fillRect(0, r * CELL, w, 1);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pintarCelda(c, r);
    };

    let colorIdx = 0;
    let dir = 0;
    let extremoX = 0;
    let last: { x: number; y: number } | null = null;
    let activo = false;

    const tejerEn = (x: number, y: number) => {
      const c = Math.floor(x / CELL);
      const r0 = Math.floor(y / CELL);
      if (c < 0 || c >= cols) return;
      for (let k = -BANDA; k <= BANDA; k++) {
        const r = r0 + k;
        if (r < 0 || r >= rows) continue;
        // Los dos hilos de los bordes van en el color siguiente: una lista.
        const color = (Math.abs(k) === BANDA ? (colorIdx + 1) % TEJIDO_COLORES.length : colorIdx) + 1;
        const i = r * cols + c;
        if (!grid[i]) tejidas++;
        if (grid[i] !== color) {
          grid[i] = color;
          pintarCelda(c, r);
        }
      }
    };

    const trazo = (x: number, y: number) => {
      if (!last) {
        last = { x, y };
        extremoX = x;
        dir = 0;
        tejerEn(x, y);
        return;
      }
      // Cambio de dirección: el puntero retrocede GIRO_PX desde su extremo.
      if (dir >= 0 && x > extremoX) extremoX = x;
      if (dir <= 0 && x < extremoX) extremoX = x;
      if (dir === 0) {
        if (Math.abs(x - last.x) > 2) dir = Math.sign(x - last.x);
      } else if ((extremoX - x) * dir > GIRO_PX) {
        dir = -dir;
        extremoX = x;
        colorIdx = (colorIdx + 1) % TEJIDO_COLORES.length;
      }
      const dx = x - last.x;
      const dy = y - last.y;
      const pasos = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (CELL / 2)));
      for (let i = 1; i <= pasos; i++) tejerEn(last.x + (dx * i) / pasos, last.y + (dy * i) / pasos);
      last = { x, y };

      const pct = Math.min(100, Math.floor((tejidas / (cols * rows) / ABRIR_AL) * 100));
      if (pct !== ultimoPct) {
        ultimoPct = pct;
        setAvance(pct / 100);
      }
    };

    const punto = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top] as const;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      activo = true;
      last = null;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Sin captura el trazo igual funciona mientras el puntero siga encima.
      }
      setTocado(true);
      trazo(...punto(e));
    };
    const onMove = (e: PointerEvent) => {
      if (!activo) return;
      const eventos = e.getCoalescedEvents?.() ?? [];
      if (eventos.length) eventos.forEach((ev) => trazo(...punto(ev)));
      else trazo(...punto(e));
    };
    const onUp = () => {
      activo = false;
      last = null;
    };

    redibujar();
    const ro = new ResizeObserver(redibujar);
    ro.observe(canvas);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const couple = coupleFor(demo);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        margin: "0 auto",
        maxWidth: 430,
        height: "100svh",
        zIndex: 100,
        overflow: "hidden",
        backgroundColor: SMOKE,
        backgroundImage: rombos(0.3),
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.8s ease",
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="Telar: arrastra de lado a lado para tejer y abrir la invitación"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          touchAction: "none",
          cursor: "crosshair",
        }}
      />

      {/* Texto superior: no intercepta el trazo y se atenúa al empezar a tejer */}
      <div
        style={{
          position: "absolute",
          top: demo ? 86 : 56,
          left: 0,
          right: 0,
          padding: "0 24px",
          textAlign: "center",
          pointerEvents: "none",
          opacity: tocado ? 0.16 : 1,
          transition: "opacity 0.6s ease",
        }}
      >
        <Chakana size={26} color={GOLD} style={{ margin: "0 auto 14px" }} />
        <h1
          style={{
            fontFamily: TITLE,
            fontWeight: 700,
            fontSize: "clamp(58px, 19vw, 82px)",
            lineHeight: 1,
            letterSpacing: "0.08em",
            color: GOLD,
            textShadow: "0 2px 22px rgba(26,10,0,0.9)",
          }}
        >
          Qori
        </h1>
        <p style={{ fontFamily: SUB, fontStyle: "italic", fontSize: 24, color: CREAM, marginTop: 6 }}>
          Una invitación
        </p>
        <p
          style={{
            fontFamily: TITLE,
            fontSize: 13,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: CREAM,
            marginTop: 12,
            opacity: 0.85,
          }}
        >
          {couple.amp}
        </p>
      </div>

      {/* Instrucción, al centro, hasta el primer trazo */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          textAlign: "center",
          pointerEvents: "none",
          opacity: tocado ? 0 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        <p
          style={{
            fontFamily: TITLE,
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: GOLD,
          }}
        >
          Teje para abrir
        </p>
        <p style={{ fontFamily: BODY, fontSize: 14, color: CREAM, opacity: 0.85, marginTop: 6 }}>
          Desliza el dedo de lado a lado
        </p>
        <span
          style={{
            display: "inline-flex",
            marginTop: 14,
            color: GOLD,
            animation: "qori-bob 1.6s ease-in-out infinite",
          }}
        >
          <ArrowDown size={26} strokeWidth={1.6} aria-hidden="true" />
        </span>
      </div>

      {/* Botón que aparece al llegar al 60% */}
      {listo && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
            animation: "qori-fade-in 0.9s ease both",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              padding: "26px 26px 24px",
              textAlign: "center",
              background: "rgba(26,10,0,0.9)",
              border: `1px solid ${GOLD}`,
              boxShadow: "0 30px 60px -20px rgba(0,0,0,0.9)",
            }}
          >
            <p style={{ fontFamily: SUB, fontStyle: "italic", fontSize: 21, color: CREAM, marginBottom: 14 }}>
              Tu tejido está listo
            </p>
            <button
              className="qori-btn"
              onClick={onOpen}
              style={{
                ...boton,
                background: GOLD,
                borderColor: GOLD,
                color: SMOKE,
                fontSize: 14,
                padding: "15px 28px",
                animation: "qori-glow 2s ease-in-out infinite",
              }}
            >
              Abrir invitación
            </button>
          </div>
        </div>
      )}

      {/* Avance del tejido y "Saltar", siempre visibles */}
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 22,
          display: "flex",
          alignItems: "center",
          gap: 16,
          pointerEvents: "none",
        }}
      >
        <div
          role="progressbar"
          aria-label="Avance del tejido"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(avance * 100)}
          style={{ flex: 1, height: 3, background: "rgba(245,230,200,0.2)", overflow: "hidden" }}
        >
          <div
            style={{
              height: "100%",
              width: `${avance * 100}%`,
              background: GOLD,
              transition: "width 0.2s ease-out",
            }}
          />
        </div>
        <button
          className="qori-btn"
          onClick={onOpen}
          style={{
            appearance: "none",
            pointerEvents: "auto",
            cursor: "pointer",
            background: "rgba(26,10,0,0.75)",
            border: "1px solid rgba(245,230,200,0.45)",
            borderRadius: 2,
            color: CREAM,
            fontFamily: BODY,
            fontSize: 13,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "12px 18px",
          }}
        >
          Saltar
        </button>
      </div>
    </div>
  );
}

// ─── 1. Portada ──────────────────────────────────────────────────────────────

function PortadaSection({
  opened,
  demo,
  photosPath,
  venue,
}: {
  opened: boolean;
  demo: boolean;
  photosPath: string;
  venue: Venue;
}) {
  const couple = coupleFor(demo);
  const src = `${photosPath}/portada.jpg`;
  const hayFoto = useImageExists(src);

  const nombre: React.CSSProperties = {
    fontFamily: TITLE,
    fontWeight: 700,
    fontSize: "clamp(40px, 13vw, 56px)",
    lineHeight: 1.05,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: SMOKE,
    textShadow: `0 2px 0 rgba(201,168,76,0.75), 0 0 22px rgba(201,168,76,0.45)`,
    overflowWrap: "anywhere",
  };

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: demo ? "84px 22px 40px" : "48px 22px 40px",
        backgroundColor: CREAM,
        backgroundImage: rombos(0.07),
        overflow: "hidden",
      }}
    >
      {/* portada.jpg, si existe, bajo un velo de pergamino para que se lea */}
      {hayFoto && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${src}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, background: "rgba(245,230,200,0.78)" }}
          />
        </>
      )}

      {/* Doble filete dorado, como una tarjeta impresa */}
      <div
        style={{
          position: "relative",
          border: `1px solid ${GOLD}`,
          padding: 5,
        }}
      >
        <div
          style={{
            border: `1px solid ${GOLD}`,
            padding: "40px 16px 36px",
            textAlign: "center",
          }}
        >
          <EnterReveal active={opened}>
            <p
              style={{
                fontFamily: BODY,
                fontWeight: 700,
                fontSize: 12.5,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: GOLD_DEEP,
              }}
            >
              Junto a sus familias
            </p>
          </EnterReveal>

          <EnterReveal active={opened} delay={160}>
            <h1 style={{ marginTop: 26 }}>
              <span style={{ ...nombre, display: "block" }}>{couple.first}</span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  margin: "10px 0",
                }}
              >
                <Chakana size={15} color={GOLD} />
                <span
                  style={{
                    fontFamily: SUB,
                    fontStyle: "italic",
                    fontWeight: 500,
                    fontSize: 38,
                    lineHeight: 1,
                    color: RED,
                  }}
                >
                  &amp;
                </span>
                <Chakana size={15} color={GOLD} />
              </span>
              <span style={{ ...nombre, display: "block" }}>{couple.second}</span>
            </h1>
          </EnterReveal>

          <EnterReveal active={opened} delay={320}>
            <p style={{ ...subtitulo, fontSize: 22, color: SMOKE, marginTop: 24 }}>
              os invitan a celebrar su boda
            </p>
            <Separador style={{ margin: "22px auto", maxWidth: 220 }} />
            <p
              style={{
                fontFamily: TITLE,
                fontWeight: 600,
                fontSize: "clamp(18px, 5.6vw, 23px)",
                letterSpacing: "0.1em",
                color: RED,
              }}
            >
              {FECHA_PORTADA}
            </p>
            <p
              style={{
                fontFamily: BODY,
                fontSize: 14,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: EARTH,
                marginTop: 10,
              }}
            >
              {venue.street} · {venue.city}
            </p>
          </EnterReveal>

          <EnterReveal active={opened} delay={480}>
            <button
              className="qori-btn"
              onClick={() =>
                document.getElementById("qori-historia")?.scrollIntoView({ behavior: "smooth" })
              }
              style={{ ...boton, marginTop: 30 }}
            >
              Ver la invitación
              <ArrowDown size={15} aria-hidden="true" />
            </button>
          </EnterReveal>
        </div>
      </div>
    </section>
  );
}

// ─── 2. Nuestra historia ─────────────────────────────────────────────────────

function HistoriaSection({ demo, photosPath }: { demo: boolean; photosPath: string }) {
  const couple = coupleFor(demo);
  const haySegunda = useImageExists(`${photosPath}/nosotros-2.jpg`);
  return (
    <section
      id="qori-historia"
      style={{ background: CREAM, padding: "54px 26px 56px", scrollMarginTop: demo ? 44 : 0 }}
    >
      <Reveal>
        <Titulo>Nuestra historia</Titulo>
      </Reveal>

      <Reveal kind="reveal-scale" delay={1}>
        <MarcoColonial style={{ margin: "28px 6px 0" }}>
          <Foto file="nosotros-1.jpg" base={photosPath} alt={`${couple.prose}, retrato de pareja`} />
        </MarcoColonial>
      </Reveal>

      <Reveal delay={1}>
        <p style={{ ...parrafo, marginTop: 30 }}>
          Todo empezó en las calles empedradas del Cusco, donde el destino los puso en el mismo
          camino. Dos historias que se convirtieron en una sola, tejida con la misma paciencia y
          amor con que las manos andinas tejen el más fino aguayo.
        </p>
      </Reveal>

      {haySegunda && (
        <Reveal kind="reveal-scale">
          <MarcoColonial style={{ margin: "30px 34px 0" }}>
            <Foto
              file="nosotros-2.jpg"
              base={photosPath}
              alt={`${couple.prose} en el Cusco`}
              ratio="1 / 1"
              optional
            />
          </MarcoColonial>
        </Reveal>
      )}

      <Separador style={{ marginTop: 48 }} />
    </section>
  );
}

// ─── 3. El día ───────────────────────────────────────────────────────────────

function DiaSection() {
  return (
    <section style={{ background: CREAM, padding: "0 26px 56px" }}>
      <Reveal>
        <Titulo>El día</Titulo>
        <p style={{ ...subtitulo, marginTop: 10 }}>
          Hora a hora, de la ceremonia al último baile
        </p>
      </Reveal>

      <ol style={{ listStyle: "none", margin: "30px 0 0", padding: 0, position: "relative" }}>
        {/* Hilo vertical que une los momentos */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 27,
            top: 30,
            bottom: 30,
            width: 1,
            background: `linear-gradient(${GOLD}, rgba(201,168,76,0.25))`,
          }}
        />
        {ITINERARIO.map((it, i) => (
          <li key={it.num}>
            <Reveal delay={i < 2 ? i : 0}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "13px 0" }}>
                <div
                  aria-hidden="true"
                  style={{
                    position: "relative",
                    flex: "0 0 56px",
                    height: 56,
                    display: "grid",
                    placeItems: "center",
                    background: CREAM,
                    border: `1px solid ${GOLD}`,
                    transform: "rotate(45deg)",
                    marginTop: 2,
                  }}
                >
                  <span
                    style={{
                      transform: "rotate(-45deg)",
                      fontFamily: TITLE,
                      fontWeight: 700,
                      fontSize: 19,
                      color: GOLD,
                      textShadow: "0 1px 0 rgba(107,58,31,0.35)",
                    }}
                  >
                    {it.num}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingLeft: 6 }}>
                  <div
                    style={{
                      fontFamily: BODY,
                      fontWeight: 700,
                      fontSize: 12.5,
                      letterSpacing: "0.2em",
                      color: GOLD_DEEP,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {it.hora}
                  </div>
                  <h3
                    style={{
                      fontFamily: TITLE,
                      fontWeight: 600,
                      fontSize: 18,
                      lineHeight: 1.25,
                      letterSpacing: "0.03em",
                      color: SMOKE,
                      marginTop: 3,
                    }}
                  >
                    {it.titulo}
                  </h3>
                  <p style={{ ...subtitulo, fontSize: 18.5, textAlign: "left", marginTop: 3 }}>{it.nota}</p>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>

      <Separador style={{ marginTop: 40 }} />
    </section>
  );
}

// ─── 4. Cómo llegar ──────────────────────────────────────────────────────────

// Silueta simple del Ausangate: tres cumbres con sus nevados.
function Ausangate({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 240 84" width="100%" aria-hidden="true" style={{ display: "block", ...style }}>
      <path
        d="M0 84 L34 50 L50 62 L84 22 L100 40 L128 6 L154 38 L170 28 L204 58 L218 48 L240 84 Z"
        fill={GREEN}
      />
      <path
        d="M128 6 L143 24 L134 21 L128 30 L121 20 L113 25 Z M84 22 L94 33 L86 31 L80 38 L75 33 Z M170 28 L181 38 L172 37 L166 43 L161 34 Z"
        fill={CREAM}
        opacity="0.85"
      />
    </svg>
  );
}

function ComoLlegarSection({ venue }: { venue: Venue }) {
  const lugar = lugarDe(venue);
  return (
    <section style={{ background: CREAM, padding: "0 22px 56px" }}>
      <Reveal>
        <Titulo>Cómo llegar</Titulo>
      </Reveal>

      <Reveal delay={1}>
        <div
          style={{
            marginTop: 26,
            background: "#FBF1DC",
            border: `1px solid ${GOLD}`,
            boxShadow: "0 24px 44px -28px rgba(26,10,0,0.55)",
            overflow: "hidden",
          }}
        >
          <Ausangate style={{ width: "62%", margin: "22px auto 0" }} />
          <Franja style={{ height: 8 }} />
          <div style={{ padding: "22px 18px 20px", textAlign: "center" }}>
            <h3
              style={{
                fontFamily: TITLE,
                fontWeight: 600,
                fontSize: 19,
                lineHeight: 1.25,
                letterSpacing: "0.04em",
                color: SMOKE,
                textWrap: "balance",
              }}
            >
              {lugar.nombre}
            </h3>
            <p style={{ fontFamily: BODY, fontSize: 15, color: EARTH, marginTop: 6 }}>{lugar.direccion}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
              <a
                className="qori-btn"
                href={venue.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...boton, padding: "12px 18px", fontSize: 12 }}
              >
                Ver en Maps
              </a>
              <a
                className="qori-btn"
                href={venue.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...boton, padding: "12px 18px", fontSize: 12, background: "transparent", color: RED }}
              >
                Cómo llegar
              </a>
            </div>
          </div>
          <iframe
            title={`Mapa de ${lugar.nombre}`}
            src={venue.embedUrl}
            width="100%"
            height="230"
            style={{ border: 0, display: "block", borderTop: `1px solid ${GOLD}` }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Reveal>
    </section>
  );
}

// ─── 5. Vestimenta ───────────────────────────────────────────────────────────

function VestimentaSection() {
  return (
    <section style={{ background: CREAM_DARK }}>
      <Franja />
      <div style={{ padding: "50px 24px 52px" }}>
        <Reveal>
          <Titulo>Código de vestimenta</Titulo>
          <p style={{ ...parrafo, marginTop: 16 }}>
            Colores de la tierra y el cielo andino. Elegantes pero cómodos para caminar las calles
            de piedra.
          </p>
        </Reveal>

        <Reveal delay={1}>
          <ul
            style={{
              listStyle: "none",
              margin: "28px 0 0",
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 6,
            }}
          >
            {VESTIMENTA.map((v) => (
              <li key={v.nombre} style={{ textAlign: "center", minWidth: 0 }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: "block",
                    width: "min(100%, 54px)",
                    aspectRatio: "1",
                    margin: "0 auto",
                    borderRadius: "50%",
                    background: v.color,
                    border: `2px solid #FBF1DC`,
                    boxShadow: `0 0 0 1px ${GOLD}, 0 8px 14px -8px rgba(26,10,0,0.6)`,
                  }}
                />
                <span
                  style={{
                    display: "block",
                    fontFamily: BODY,
                    fontSize: 11.5,
                    lineHeight: 1.25,
                    color: SMOKE,
                    marginTop: 9,
                  }}
                >
                  {v.nombre}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={2}>
          <p style={{ ...subtitulo, fontSize: 19, marginTop: 28 }}>
            El suelo de piedra del Cusco agradece los zapatos cómodos.
          </p>
        </Reveal>
      </div>
      <Franja />
    </section>
  );
}

// ─── 6. Confirmación (RSVP) ──────────────────────────────────────────────────
// Mismo patrón que la Reserva de Oliva: al enviar, el formulario se desvanece
// y en su misma celda de grilla aparece la confirmación. La demo no envía nada;
// la ruta de cliente abre WhatsApp con el mensaje armado.

const FADE_MS = 400;
const WA_DELAY_MS = 600;

function ConfirmarSection({ demo }: { demo: boolean }) {
  const couple = coupleFor(demo);
  const [nombre, setNombre] = useState("");
  const [asiste, setAsiste] = useState<"si" | "no" | null>(null);
  const [personas, setPersonas] = useState(1);
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
    if (!limpio) errs.nombre = "Escribe tu nombre para confirmar.";
    if (!asiste) errs.asiste = "Elige una de las dos opciones.";
    setErrors(errs);
    if (errs.nombre || errs.asiste) return;

    const mensaje =
      asiste === "si"
        ? `Hola, confirmo mi asistencia a la boda de ${couple.prose}. Mi nombre es ${limpio} y ${
            personas === 1 ? "asistirá 1 persona" : `asistiremos ${personas} personas`
          }.`
        : `Hola, lamentablemente no podré asistir a la boda de ${couple.prose}. Mi nombre es ${limpio}.`;
    const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;

    setFase("saliendo");
    timers.current.push(
      window.setTimeout(() => {
        setFase("enviado");
        if (demo) return;
        timers.current.push(
          window.setTimeout(() => {
            // Fuera del gesto del clic: si el navegador bloquea la ventana
            // (Safari iOS), queda un botón para abrir WhatsApp a mano.
            // Sin "noopener" en las features: con él window.open devuelve
            // siempre null y no se sabría si la ventana se bloqueó.
            const win = window.open(waLink, "_blank");
            if (win) win.opener = null;
            else setWaBloqueado(waLink);
          }, WA_DELAY_MS)
        );
      }, FADE_MS)
    );
  };

  const label: React.CSSProperties = {
    display: "block",
    fontFamily: BODY,
    fontWeight: 700,
    fontSize: 12.5,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: GOLD,
    marginBottom: 9,
    padding: 0,
  };
  const error: React.CSSProperties = {
    fontFamily: BODY,
    fontSize: 14,
    color: "#FFD9A8",
    marginTop: 7,
  };
  const stepBtn: React.CSSProperties = {
    appearance: "none",
    width: 44,
    height: 44,
    display: "grid",
    placeItems: "center",
    background: "transparent",
    border: `1px solid ${GOLD}`,
    borderRadius: 2,
    color: CREAM,
    cursor: "pointer",
  };

  return (
    <section style={{ background: RED, position: "relative" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(26,10,0,0.16) 0 2px, transparent 2px 26px), repeating-linear-gradient(-45deg, rgba(26,10,0,0.16) 0 2px, transparent 2px 26px)",
        }}
      />
      <div style={{ position: "relative", padding: "52px 24px 56px" }}>
        <Reveal>
          <Separador style={{ marginBottom: 30 }} />
          <Titulo color={CREAM}>¿Nos acompañas?</Titulo>
          <p style={{ ...parrafo, color: CREAM, marginTop: 16 }}>
            Dinos si contamos contigo antes del <strong style={{ color: GOLD }}>{RSVP_HASTA}</strong>.
            Tu presencia es el mejor regalo.
          </p>
        </Reveal>

        <Reveal delay={1}>
          <div style={{ display: "grid", marginTop: 28 }}>
            <form
              noValidate
              onSubmit={handleSubmit}
              aria-hidden={fase === "enviado"}
              style={{
                gridArea: "1 / 1",
                display: "grid",
                gap: 22,
                opacity: fase === "form" ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease`,
                visibility: fase === "enviado" ? "hidden" : "visible",
                pointerEvents: fase === "form" ? "auto" : "none",
              }}
            >
              <div>
                <label htmlFor="qori-nombre" style={label}>
                  Tu nombre
                </label>
                <input
                  id="qori-nombre"
                  className="qori-input"
                  type="text"
                  required
                  maxLength={60}
                  autoComplete="name"
                  placeholder="Nombre y apellido"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errors.nombre) setErrors((x) => ({ ...x, nombre: undefined }));
                  }}
                  aria-invalid={!!errors.nombre}
                  aria-describedby={errors.nombre ? "qori-nombre-error" : undefined}
                  style={{
                    width: "100%",
                    padding: "13px 14px",
                    background: "rgba(26,10,0,0.28)",
                    border: `1px solid ${errors.nombre ? "#FFD9A8" : GOLD}`,
                    borderRadius: 2,
                    color: CREAM,
                    fontFamily: BODY,
                    fontSize: 16,
                  }}
                />
                {errors.nombre && (
                  <p id="qori-nombre-error" role="alert" style={error}>
                    {errors.nombre}
                  </p>
                )}
              </div>

              <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
                <legend style={label}>¿Contamos contigo?</legend>
                <div style={{ display: "grid", gap: 10 }}>
                  {(
                    [
                      ["si", "Sí, ahí estaré"],
                      ["no", "Lo siento, no podré"],
                    ] as const
                  ).map(([value, text]) => {
                    const activo = asiste === value;
                    return (
                      <label
                        key={value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          minHeight: 50,
                          padding: "10px 14px",
                          cursor: "pointer",
                          border: `1px solid ${activo ? GOLD : "rgba(201,168,76,0.45)"}`,
                          borderRadius: 2,
                          background: activo ? "rgba(26,10,0,0.42)" : "rgba(26,10,0,0.16)",
                          fontFamily: BODY,
                          fontSize: 16,
                          color: CREAM,
                          transition: "background 0.2s ease, border-color 0.2s ease",
                        }}
                      >
                        <input
                          type="radio"
                          name="qori-asiste"
                          value={value}
                          required
                          checked={activo}
                          onChange={() => {
                            setAsiste(value);
                            setErrors((x) => ({ ...x, asiste: undefined }));
                          }}
                          style={{ accentColor: GOLD, width: 19, height: 19, margin: 0, flexShrink: 0 }}
                        />
                        {text}
                      </label>
                    );
                  })}
                </div>
                {errors.asiste && (
                  <p role="alert" style={error}>
                    {errors.asiste}
                  </p>
                )}
              </fieldset>

              {asiste === "si" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    animation: "qori-rise 0.35s ease both",
                  }}
                >
                  <span style={{ ...label, marginBottom: 0 }}>¿Cuántas personas?</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      type="button"
                      className="qori-btn"
                      aria-label="Una persona menos"
                      disabled={personas <= 1}
                      onClick={() => setPersonas((n) => Math.max(1, n - 1))}
                      style={{ ...stepBtn, opacity: personas <= 1 ? 0.4 : 1 }}
                    >
                      <Minus size={17} aria-hidden="true" />
                    </button>
                    <output
                      aria-live="polite"
                      style={{
                        minWidth: 38,
                        textAlign: "center",
                        fontFamily: TITLE,
                        fontWeight: 600,
                        fontSize: 22,
                        color: CREAM,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {personas}
                    </output>
                    <button
                      type="button"
                      className="qori-btn"
                      aria-label="Una persona más"
                      disabled={personas >= MAX_PERSONAS}
                      onClick={() => setPersonas((n) => Math.min(MAX_PERSONAS, n + 1))}
                      style={{ ...stepBtn, opacity: personas >= MAX_PERSONAS ? 0.4 : 1 }}
                    >
                      <Plus size={17} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="qori-btn"
                style={{
                  appearance: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  width: "100%",
                  minHeight: 52,
                  cursor: "pointer",
                  background: "#25D366",
                  color: "#ffffff",
                  border: 0,
                  borderRadius: 50,
                  fontFamily: BODY,
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: "0 16px 30px -16px rgba(0,0,0,0.7)",
                }}
              >
                <WhatsAppLogo size={21} />
                Confirmar por WhatsApp
              </button>
            </form>

            {fase === "enviado" && (
              <Confirmacion asiste={asiste === "si"} nombre={nombre.trim()} waLink={waBloqueado} />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Confirmacion({
  asiste,
  nombre,
  waLink,
}: {
  asiste: boolean;
  nombre: string;
  waLink: string | null;
}) {
  const texto: React.CSSProperties = { ...parrafo, color: CREAM, fontSize: 17 };
  return (
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
        animation: `qori-fade-in ${FADE_MS}ms ease both`,
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 72,
          height: 72,
          borderRadius: "50%",
          border: `1px solid ${GOLD}`,
          background: "rgba(26,10,0,0.3)",
          animation: "qori-pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.3) both",
        }}
      >
        <Check size={38} color={GOLD} strokeWidth={2} aria-hidden="true" />
      </span>
      <h3
        style={{
          fontFamily: TITLE,
          fontWeight: 600,
          fontSize: "clamp(22px, 6.5vw, 27px)",
          lineHeight: 1.2,
          letterSpacing: "0.05em",
          color: GOLD,
          marginTop: 6,
          overflowWrap: "anywhere",
        }}
      >
        {asiste ? `¡Gracias, ${nombre}!` : "Gracias por avisarnos"}
      </h3>
      <p style={texto}>
        {asiste ? "Tu confirmación fue recibida." : "Lamentamos mucho que no puedas acompañarnos."}
      </p>
      <p style={{ ...subtitulo, color: CREAM, fontSize: 21 }}>
        {asiste ? `Te esperamos el ${FECHA_TEXTO} en el Cusco.` : "Te llevaremos en el corazón ese día."}
      </p>
      {waLink && <WhatsAppButton href={waLink} label="Enviar por WhatsApp" style={{ marginTop: 8 }} />}
    </div>
  );
}

// ─── 7. Cierre ───────────────────────────────────────────────────────────────

function CierreSection({ demo, galeriaHref }: { demo: boolean; galeriaHref: string }) {
  const couple = coupleFor(demo);
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: SMOKE,
        backgroundImage: rombos(0.3),
        textAlign: "center",
      }}
    >
      <Franja />
      <Chakana
        size="118%"
        color={RED}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.2,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", padding: "84px 26px 76px" }}>
        <Reveal>
          <Separador style={{ marginBottom: 34, maxWidth: 220 }} />
          <h2
            style={{
              fontFamily: TITLE,
              fontWeight: 700,
              fontSize: "clamp(56px, 18vw, 78px)",
              lineHeight: 1,
              letterSpacing: "0.06em",
              color: GOLD,
              textShadow: "0 0 34px rgba(201,168,76,0.35)",
            }}
          >
            ¡Qori!
          </h2>
          <p style={{ ...subtitulo, color: CREAM, fontSize: 24, marginTop: 18 }}>
            Nos vemos en el Cusco eterno.
          </p>
          <p
            style={{
              fontFamily: TITLE,
              fontWeight: 600,
              fontSize: 19,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: GOLD,
              marginTop: 30,
            }}
          >
            {couple.amp}
          </p>
          {/* Link (no <a>): la navegación client-side mantiene la música sonando */}
          <Link
            href={galeriaHref}
            className="qori-btn"
            style={{
              display: "inline-block",
              marginTop: 30,
              padding: "12px 4px",
              fontFamily: BODY,
              fontSize: 12.5,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: CREAM,
              textDecoration: "none",
              borderBottom: `1px solid ${GOLD}`,
            }}
          >
            Ver galería de fotos →
          </Link>
        </Reveal>
      </div>
    </section>
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
      className="music-fab qori-btn"
      aria-label={playing ? "Pausar música" : "Reproducir música"}
      style={{
        position: "fixed",
        bottom: 18,
        right: "max(18px, calc(50vw - 215px + 18px))",
        zIndex: 60,
        width: 54,
        height: 54,
        borderRadius: 999,
        border: `1px solid ${GOLD}`,
        background: "rgba(26,10,0,0.82)",
        boxShadow: "0 14px 34px rgba(26,10,0,0.5)",
        backdropFilter: "blur(10px)",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        color: GOLD,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: 999,
          border: `1px solid ${GOLD}`,
          opacity: playing ? 1 : 0,
          pointerEvents: "none",
          animation: playing ? "pulse-ring 1.4s infinite" : "none",
        }}
      />
      {playing ? (
        <Pause size={19} fill="currentColor" strokeWidth={0} aria-hidden="true" />
      ) : (
        <Play size={19} fill="currentColor" strokeWidth={0} aria-hidden="true" style={{ marginLeft: 2 }} />
      )}
    </button>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

const SALIDA_MS = 800; // fade out del telar al abrir

export default function InvitationQori({
  demo = false,
  galeriaHref = "/qori/galeria",
  photosPath = DEMO_PHOTOS_PATH,
  musicSrc = MUSIC_SRC,
  venue = VENUE_CUSCO,
}: {
  demo?: boolean;
  // Las rutas de clientes pasan su propia galería y sus propios assets
  // (public/qori/<cliente>/photos y .../music.mp3).
  galeriaHref?: string;
  photosPath?: string;
  musicSrc?: string;
  // Local del evento. La demo SIEMPRE muestra la Plaza de Armas del Cusco (un
  // lugar público): la prop solo vale en las rutas de cliente.
  venue?: Venue;
}) {
  const [gate, setGate] = useState<"telar" | "saliendo" | "abierta">("telar");
  const hasMusic = useMusicAvailable(musicSrc);
  const { playing, play, toggle } = useMusic(musicSrc, DESIGN_ID);
  const lugar = demo ? VENUE_CUSCO : venue;
  const opened = gate !== "telar";

  useEffect(() => {
    if (gate !== "saliendo") return;
    const t = window.setTimeout(() => setGate("abierta"), SALIDA_MS);
    return () => window.clearTimeout(t);
  }, [gate]);

  // Se llama dentro del clic de "Abrir invitación" o "Saltar": es el gesto que
  // deja arrancar la canción.
  const handleOpen = () => {
    if (gate !== "telar") return;
    setGate("saliendo");
    if (hasMusic) play();
    window.scrollTo({ top: 0 });
  };

  return (
    <div id="invitation-root" style={{ background: CREAM }}>
      <style>{QORI_CSS}</style>
      {demo && <DemoBanner />}
      {gate !== "abierta" && <TelarGate demo={demo} leaving={gate === "saliendo"} onOpen={handleOpen} />}
      {opened && hasMusic && <MusicFab playing={playing} onToggle={toggle} />}

      <main style={{ position: "relative", zIndex: 1 }}>
        <PortadaSection opened={opened} demo={demo} photosPath={photosPath} venue={lugar} />
        <HistoriaSection demo={demo} photosPath={photosPath} />
        <DiaSection />
        <ComoLlegarSection venue={lugar} />
        <VestimentaSection />
        <ConfirmarSection demo={demo} />
        <CierreSection demo={demo} galeriaHref={galeriaHref} />
      </main>
    </div>
  );
}
