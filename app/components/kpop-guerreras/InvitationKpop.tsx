"use client";

// Diseño K-Pop Guerreras (19 oct 2026): primer diseño de CUMPLEAÑOS infantil,
// para la ahijada del usuario (Emilia, 4 años). Fondo noche con estrellas que
// parpadean, títulos con glow magenta y botones en degradado magenta → morado.
//
// A diferencia de las bodas NO tiene galería, subida de fotos, regalos,
// playlist ni historia: es portada → bienvenida → countdown → la fiesta →
// programa → RSVP → cierre con confetti. Todos los efectos son CSS, así que
// el diseño se ve animado aunque todavía no existan las imágenes.

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Cake,
  Clock,
  Gamepad2,
  Gift,
  MapPin,
  MessageCircle,
  Mic,
  Music,
  Music2,
  PartyPopper,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useMusic } from "@/app/components/shared/useMusic";
import { VENUE_EMILIA, venueFor } from "@/lib/venue";

const DESIGN_ID = "kpop-guerreras";

// Assets del DEMO. Las decoraciones (deco-*) viven en la raíz de
// /kpop-guerreras-demo/ y son parte del DISEÑO: las usan también las rutas de
// clientes. La foto de la festejada vive en /kpop-guerreras-demo/photos/ y cada
// cliente la reemplaza vía props `photosPath` y `musicSrc`
// (public/kpop-guerreras/<cliente>/).
export const MUSIC_SRC = "/kpop-guerreras-demo/music.mp3";
export const DEMO_PHOTOS_PATH = "/kpop-guerreras-demo/photos";
const DECO_PATH = "/kpop-guerreras-demo";

// ─── Paleta ──────────────────────────────────────────────────────────────────
const BG = "#1a1a2e"; // noche azul casi negro
const MAGENTA = "#e91e8c";
const PURPLE = "#6b0fa8";
const GOLD = "#f5d800";
const WHITE = "#ffffff";
const PINK_SOFT = "#f0a0d0"; // texto secundario
const GLOW = "rgba(233, 30, 140, 0.4)";
const WHATSAPP = "#25D366";

const FONT = "'Fredoka', 'Segoe UI', Arial, sans-serif";
// Títulos (nombre de la portada y títulos de sección); @font-face en globals.css
const TITLE_FONT = "'Hunters K-Pop', 'Fredoka', 'Segoe UI', Arial, sans-serif";

const GRADIENT = `linear-gradient(135deg, ${MAGENTA} 0%, ${PURPLE} 100%)`;
const TEXT_GLOW = `0 0 20px ${MAGENTA}, 0 0 40px ${MAGENTA}, 0 0 80px ${PURPLE}`;

// ─── Datos demo / cliente ────────────────────────────────────────────────────
// Igual que las bodas, la prop `demo` elige entre datos ficticios (catálogo
// público) y los reales. La hora del programa es la misma en ambos.

interface Festejada {
  nombre: string;
  edad: number;
  /** Inicio de la fiesta: alimenta countdown y tarjeta de fecha. */
  iso: string;
  hora: string;
  lugar: string;
  rsvpHasta: string;
}

const FESTEJADA_DEMO: Festejada = {
  nombre: "Valentina",
  edad: 5,
  iso: "2027-01-15T16:00:00",
  hora: "4:00 PM",
  lugar: "Salón de Fiestas",
  rsvpHasta: "10 de enero",
};

const FESTEJADA_CLIENTE: Festejada = {
  nombre: "Emilia",
  edad: 4,
  iso: "2026-11-27T16:00:00",
  hora: "4:00 PM",
  // Placeholder hasta tener el local real (ver VENUE_EMILIA en lib/venue.ts)
  lugar: "Salón de fiestas",
  rsvpHasta: "20 de noviembre",
};

const festejadaFor = (demo: boolean) => (demo ? FESTEJADA_DEMO : FESTEJADA_CLIENTE);

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// "Viernes 27 de Noviembre de 2026". El día de la semana se calcula de la
// fecha para que nunca quede desfasado. Se arma a mano (sin Intl) para que el
// texto de SSR y el del navegador sean idénticos.
function fechaLarga(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const dia = new Date(y, m - 1, d).getDay();
  return `${DIAS[dia]} ${d} de ${MESES[m - 1]} de ${y}`;
}

const waConfirm = (demo: boolean) =>
  `https://wa.me/51993092110?text=${encodeURIComponent(
    `¡Hola! Confirmo mi asistencia al cumpleaños de ${festejadaFor(demo).nombre}.\nNombre: \nAsistentes: `
  )}`;

// ─── Aleatorio con semilla ───────────────────────────────────────────────────
// Estrellas y confetti van en posiciones "aleatorias" pero FIJAS: con
// Math.random() el HTML de SSR no coincidiría con el del cliente (hydration
// mismatch). mulberry32 da la misma secuencia en ambos lados.

function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeStars(count: number, seed: number) {
  const rnd = seeded(seed);
  return Array.from({ length: count }, () => ({
    top: rnd() * 100,
    left: rnd() * 100,
    size: 2 + Math.round(rnd() * 2),
    delay: rnd() * 3,
    duration: 1.6 + rnd() * 2.2,
    gold: rnd() < 0.18,
  }));
}

function Stars({ count = 26, seed = 1 }: { count?: number; seed?: number }) {
  const stars = makeStars(count, seed);
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: s.gold ? GOLD : WHITE,
            boxShadow: `0 0 ${s.size * 3}px ${s.gold ? GOLD : WHITE}`,
            animation: `kpop-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Destellos (estrellas) alrededor de la foto de bienvenida
function Sparkle({
  size,
  color = GOLD,
  delay = 0,
  style,
}: {
  size: number;
  color?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        lineHeight: 0,
        color,
        filter: `drop-shadow(0 0 6px ${color})`,
        animation: `kpop-twinkle 2.2s ease-in-out ${delay}s infinite`,
        pointerEvents: "none",
        ...style,
      }}
    >
      <Star size={size} fill={color} strokeWidth={0} />
    </span>
  );
}

const CONFETTI_COLORS = [MAGENTA, PURPLE, GOLD, WHITE];

function Confetti({ count = 36, seed = 7 }: { count?: number; seed?: number }) {
  const rnd = seeded(seed);
  const pieces = Array.from({ length: count }, (_, i) => ({
    left: rnd() * 100,
    w: 5 + rnd() * 5,
    h: 8 + rnd() * 8,
    delay: rnd() * 4,
    duration: 3.2 + rnd() * 2.6,
    spin: (rnd() < 0.5 ? -1 : 1) * (360 + rnd() * 540),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: -20,
            left: `${p.left}%`,
            width: p.w,
            height: p.h,
            borderRadius: 2,
            background: p.color,
            opacity: 0,
            ["--fall" as string]: "560px",
            ["--spin" as string]: `${p.spin}deg`,
            animation: `kpop-confetti ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
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
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
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

/* eslint-disable @next/next/no-img-element */

// ─── Imagen con placeholder ──────────────────────────────────────────────────
// Carga `src` y, mientras no exista, muestra un placeholder en degradado
// magenta/morado con el nombre esperado del archivo: basta copiar el PNG con
// ese nombre para que aparezca. A diferencia del `Deco` de las bodas, aquí
// también las decoraciones muestran placeholder (todavía no hay ninguna).

function Imagen({
  src,
  label,
  width,
  ratio = "1 / 1",
  round = false,
  style,
}: {
  src: string;
  label: string;
  width: number | string;
  ratio?: string;
  round?: boolean;
  style?: React.CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Si la imagen del HTML SSR ya terminó (o falló) antes de hidratar, onLoad y
  // onError no volverán a dispararse: se lee el estado real.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) setLoaded(true);
    else setMissing(true);
  }, []);

  const radius = round ? "50%" : 16;
  return (
    <div style={{ position: "relative", width, aspectRatio: ratio, ...style }}>
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            background: `repeating-linear-gradient(135deg, rgba(255,255,255,0.07) 0 6px, transparent 6px 12px), ${GRADIENT}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: 8,
            color: "rgba(255,255,255,0.9)",
            fontFamily: FONT,
            fontSize: 10,
            letterSpacing: "0.06em",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <Star size={18} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          <span style={{ wordBreak: "break-all" }}>{label}</span>
        </div>
      )}
      {!missing && (
        <img
          ref={imgRef}
          src={src}
          alt=""
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setMissing(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: round ? "cover" : "contain",
            borderRadius: round ? "50%" : 0,
            opacity: loaded ? 1 : 0,
          }}
        />
      )}
    </div>
  );
}

const Deco = (props: Omit<React.ComponentProps<typeof Imagen>, "src" | "label"> & { file: string }) => {
  const { file, ...rest } = props;
  return <Imagen src={`${DECO_PATH}/${file}`} label={file} {...rest} />;
};

// ─── Piezas comunes ──────────────────────────────────────────────────────────

function Titulo({ children, size = 34 }: { children: React.ReactNode; size?: number | string }) {
  return (
    <h2
      style={{
        fontFamily: TITLE_FONT,
        fontWeight: "normal",
        fontSize: size,
        letterSpacing: "0.04em",
        color: WHITE,
        textShadow: TEXT_GLOW,
        textAlign: "center",
        whiteSpace: "nowrap",
        animation: "kpop-glow 3s ease-in-out infinite",
      }}
    >
      {children}
    </h2>
  );
}

function BotonGradiente({
  children,
  href,
  onClick,
  style,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  const common: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: 0,
    cursor: "pointer",
    background: GRADIENT,
    color: WHITE,
    fontFamily: FONT,
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: "0.08em",
    textDecoration: "none",
    padding: "13px 26px",
    borderRadius: 999,
    boxShadow: hover
      ? `0 0 0 2px ${PINK_SOFT}, 0 0 28px ${MAGENTA}, 0 0 50px ${GLOW}`
      : `0 0 18px ${GLOW}, 0 10px 24px -10px rgba(0,0,0,0.6)`,
    transform: hover ? "translateY(-2px) scale(1.03)" : "none",
    transition: "box-shadow 0.25s, transform 0.25s",
    ...style,
  };
  // Reflejo que cruza el botón cada pocos segundos
  const shine = (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: "40%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
        animation: "kpop-shine 3s ease-in-out infinite",
        pointerEvents: "none",
      }}
    />
  );
  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  };
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={common} {...handlers}>
        {shine}
        <span style={{ position: "relative" }}>{children}</span>
      </a>
    );
  }
  return (
    <button onClick={onClick} style={common} {...handlers}>
      {shine}
      <span style={{ position: "relative" }}>{children}</span>
    </button>
  );
}

// ─── Banner de demo (solo en el catálogo, no en invitaciones de clientes) ────

function DemoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const waLink = `https://wa.me/51993092110?text=${encodeURIComponent(
    "¡Hola! Me gusta el diseño K-Pop Guerreras y quiero una invitación de cumpleaños como esta."
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
        padding: "10px 40px 10px 14px",
        background: "rgba(107, 15, 168, 0.92)",
        backdropFilter: "blur(8px)",
        color: WHITE,
        fontFamily: FONT,
        fontSize: 12.5,
        letterSpacing: "0.03em",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Mic size={15} color={GOLD} aria-hidden="true" />
        Esta es una demo — ¿Te gusta este diseño?
      </span>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flexShrink: 0,
          background: MAGENTA,
          color: WHITE,
          padding: "6px 14px",
          borderRadius: 50,
          textDecoration: "none",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        Solicitar
      </a>
      <button
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso de demo"
        style={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: 0,
          color: WHITE,
          fontSize: 18,
          lineHeight: 1,
          cursor: "pointer",
          padding: 12,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ─── 1. Pantalla de entrada (arranca la música) ──────────────────────────────

function IntroGate({ onOpen, demo }: { onOpen: () => void; demo: boolean }) {
  const f = festejadaFor(demo);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        margin: "auto",
        maxWidth: 430,
        zIndex: 100,
        background: `radial-gradient(ellipse at 50% 30%, #2d1748 0%, ${BG} 70%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: 24,
        textAlign: "center",
        fontFamily: FONT,
      }}
    >
      <Stars count={40} seed={3} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <Deco file="deco-portada.png" width={220} ratio="4 / 3" />

        <h1
          style={{
            fontFamily: TITLE_FONT,
            fontWeight: "normal",
            // Se encoge con nombres largos ("VALENTINA") para no tocar los bordes
            fontSize: "clamp(40px, 14vw, 64px)",
            lineHeight: 1,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: MAGENTA,
            textShadow: `0 0 12px ${MAGENTA}, 0 0 30px ${MAGENTA}, 0 0 60px ${PURPLE}`,
            animation: "kpop-glow 2.6s ease-in-out infinite",
          }}
        >
          {f.nombre}
        </h1>
        <div style={{ fontSize: 24, fontWeight: 500, color: WHITE }}>
          ¡Cumple <span style={{ color: GOLD, textShadow: `0 0 12px ${GOLD}` }}>{f.edad} años</span>!
        </div>

        <BotonGradiente onClick={onOpen} style={{ marginTop: 10, fontSize: 17, padding: "15px 34px" }}>
          ¡Abrir invitación!
        </BotonGradiente>

        <div style={{ fontSize: 12, letterSpacing: "0.08em", color: PINK_SOFT, opacity: 0.9 }}>
          Sube el volumen para vivirla mejor{" "}
          <Music size={13} color={GOLD} aria-hidden="true" style={{ verticalAlign: "-2px" }} />
        </div>
      </div>
    </div>
  );
}

// ─── 2. Bienvenida ───────────────────────────────────────────────────────────

function BienvenidaSection({ photosPath, demo }: { photosPath: string; demo: boolean }) {
  const f = festejadaFor(demo);
  return (
    <section style={{ position: "relative", padding: "86px 26px 64px", textAlign: "center", overflow: "hidden" }}>
      <Stars count={24} seed={11} />
      <Reveal kind="reveal-scale">
        <div style={{ position: "relative", width: 230, margin: "0 auto" }}>
          <Deco
            file="deco-corona.png"
            width={92}
            ratio="3 / 2"
            style={{ position: "absolute", top: -50, left: "50%", marginLeft: -46, zIndex: 3 }}
          />
          <Sparkle size={26} style={{ top: 6, left: -18 }} />
          <Sparkle size={16} color={PINK_SOFT} delay={0.7} style={{ top: 40, right: -22 }} />
          <Sparkle size={20} color={WHITE} delay={1.2} style={{ bottom: 18, left: -26 }} />
          <Sparkle size={28} delay={0.4} style={{ bottom: -6, right: -14 }} />
          {/* Borde degradado magenta/morado: aro con el GRADIENT de fondo y la
              foto adentro, más el halo brillante */}
          <div
            style={{
              borderRadius: "50%",
              padding: 5,
              background: GRADIENT,
              boxShadow: `0 0 0 3px ${MAGENTA}, 0 0 20px rgba(233,30,140,0.5), 0 0 50px ${GLOW}`,
            }}
          >
            <div style={{ borderRadius: "50%", padding: 3, background: BG }}>
              <Imagen src={`${photosPath}/foto-emilia.png`} label="foto-emilia.png" width="100%" round />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={1}>
        <div style={{ marginTop: 34 }}>
          <Titulo size="clamp(28px, 9vw, 36px)">¡Hola! Soy {f.nombre}</Titulo>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 18, lineHeight: 1.5, color: PINK_SOFT, marginTop: 16 }}>
          ¡Y quiero que seas parte
          <br />
          de mi fiesta más especial!
        </p>
      </Reveal>

      <Reveal delay={2}>
        <Deco file="deco-estrellas.png" width={170} ratio="3 / 1" style={{ margin: "28px auto 0" }} />
      </Reveal>
    </section>
  );
}

// ─── 3. Cuenta regresiva ─────────────────────────────────────────────────────

function getTimeLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const clamp = Math.max(diff, 0);
  return {
    d: Math.floor(clamp / 86400000),
    h: Math.floor((clamp / 3600000) % 24),
    m: Math.floor((clamp / 60000) % 60),
    s: Math.floor((clamp / 1000) % 60),
  };
}

function CountdownSection({ partyIso }: { partyIso: string }) {
  // Arranca en null y se calcula recién en el cliente: depende de Date.now() y
  // renderizarlo en SSR causa hydration mismatch (gotcha del proyecto).
  const [t, setT] = useState<ReturnType<typeof getTimeLeft> | null>(null);
  useEffect(() => {
    const tick = () => setT(getTimeLeft(partyIso));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [partyIso]);

  const unit = (value: number | null, label: string) => (
    <div
      style={{
        flex: 1,
        maxWidth: 82,
        padding: "14px 4px 10px",
        borderRadius: 16,
        background: GRADIENT,
        border: `2px solid ${PINK_SOFT}`,
        boxShadow: `0 0 16px ${GLOW}, inset 0 0 14px rgba(255,255,255,0.15)`,
        textAlign: "center",
      }}
    >
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, lineHeight: 1, color: WHITE }}>
        {value === null ? "--" : String(value).padStart(2, "0")}
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 11, letterSpacing: "0.14em", color: GOLD, marginTop: 8 }}>
        {label}
      </div>
    </div>
  );

  return (
    <section
      style={{
        position: "relative",
        padding: "60px 20px 66px",
        background: `linear-gradient(180deg, ${BG} 0%, #26163f 50%, ${BG} 100%)`,
        overflow: "hidden",
      }}
    >
      <Stars count={20} seed={23} />
      <Reveal>
        <Deco file="deco-microfono.png" width={70} ratio="1 / 2" style={{ margin: "0 auto 18px" }} />
        <Titulo>¡SOLO FALTAN!</Titulo>
      </Reveal>
      <Reveal delay={1}>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 30 }}>
          {unit(t?.d ?? null, "DÍAS")}
          {unit(t?.h ?? null, "HRS")}
          {unit(t?.m ?? null, "MIN")}
          {unit(t?.s ?? null, "SEG")}
        </div>
      </Reveal>
    </section>
  );
}

// ─── 4. La fiesta ────────────────────────────────────────────────────────────

function DatoFila({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: GRADIENT,
          display: "grid",
          placeItems: "center",
          boxShadow: `0 0 12px ${GLOW}`,
        }}
      >
        <Icon size={21} color={WHITE} strokeWidth={2.2} />
      </span>
      <div style={{ fontFamily: FONT, fontSize: 17, lineHeight: 1.35, color: WHITE }}>{children}</div>
    </div>
  );
}

function FiestaSection({ demo }: { demo: boolean }) {
  const f = festejadaFor(demo);
  const venue = venueFor(demo, VENUE_EMILIA);
  return (
    <section style={{ position: "relative", padding: "60px 22px 64px", overflow: "hidden" }}>
      <Stars count={18} seed={37} />
      <Reveal>
        <Titulo>¡LA FIESTA!</Titulo>
      </Reveal>
      <Reveal delay={1}>
        <div
          style={{
            position: "relative",
            marginTop: 28,
            padding: "26px 22px",
            borderRadius: 24,
            background: "rgba(107, 15, 168, 0.22)",
            border: `1.5px solid rgba(233, 30, 140, 0.55)`,
            boxShadow: `0 0 26px ${GLOW}`,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <DatoFila icon={CalendarDays}>{fechaLarga(f.iso)}</DatoFila>
          <DatoFila icon={Clock}>{f.hora}</DatoFila>
          <DatoFila icon={MapPin}>
            <strong style={{ fontWeight: 600 }}>{f.lugar}</strong>
            <div style={{ color: PINK_SOFT, fontSize: 15 }}>{venue.line}</div>
          </DatoFila>
        </div>
      </Reveal>
      <Reveal delay={2}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 26 }}>
          <BotonGradiente href={venue.mapsUrl} style={{ fontSize: 13.5, padding: "12px 20px" }}>
            VER UBICACIÓN
          </BotonGradiente>
          <BotonGradiente
            href={venue.directionsUrl}
            style={{ fontSize: 13.5, padding: "12px 20px", background: `linear-gradient(135deg, ${PURPLE} 0%, ${MAGENTA} 100%)` }}
          >
            CÓMO LLEGAR
          </BotonGradiente>
        </div>
        <div
          style={{
            marginTop: 26,
            borderRadius: 20,
            overflow: "hidden",
            border: `2px solid ${MAGENTA}`,
            boxShadow: `0 0 20px ${GLOW}`,
          }}
        >
          <iframe
            title={`Mapa de ${f.lugar}`}
            src={venue.embedUrl}
            width="100%"
            height="230"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Reveal>
    </section>
  );
}

// ─── 5. Programa ─────────────────────────────────────────────────────────────

const PROGRAMA = [
  { icon: PartyPopper, nombre: "Llegada y bienvenida", hora: "4:00 PM" },
  { icon: Gamepad2, nombre: "Juegos y actividades", hora: "4:30 PM" },
  { icon: Cake, nombre: "¡La torta y las velas!", hora: "5:30 PM" },
  { icon: Gift, nombre: "Apertura de regalos", hora: "6:00 PM" },
  { icon: Music2, nombre: "¡A bailar!", hora: "6:30 PM" },
];

function ProgramaSection() {
  return (
    <section
      style={{
        position: "relative",
        padding: "60px 26px 66px",
        background: `linear-gradient(180deg, ${BG} 0%, #2a0f3d 45%, #3a0d35 75%, ${BG} 100%)`,
        overflow: "hidden",
      }}
    >
      <Stars count={22} seed={53} />
      <Reveal>
        <Titulo>¿QUÉ HAREMOS?</Titulo>
      </Reveal>
      <div style={{ position: "relative", marginTop: 34, paddingLeft: 8 }}>
        {/* Línea del timeline, al centro de la columna de íconos */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 26,
            bottom: 26,
            left: 8 + 26 - 1.5,
            width: 3,
            borderRadius: 3,
            background: MAGENTA,
            boxShadow: `0 0 10px ${MAGENTA}`,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {PROGRAMA.map((it, i) => (
            <Reveal key={it.nombre} delay={Math.min(i + 1, 4)}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <span
                  aria-hidden="true"
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: BG,
                    border: `3px solid ${MAGENTA}`,
                    boxShadow: `0 0 14px ${GLOW}`,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <it.icon size={24} color={GOLD} strokeWidth={2.1} />
                </span>
                <div style={{ fontFamily: FONT }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: WHITE }}>{it.nombre}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 500, color: GOLD, marginTop: 2, letterSpacing: "0.06em" }}>
                    {it.hora}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 6. RSVP ─────────────────────────────────────────────────────────────────

function ConfirmarSection({ demo }: { demo: boolean }) {
  const f = festejadaFor(demo);
  return (
    <section style={{ position: "relative", padding: "60px 26px 64px", textAlign: "center", overflow: "hidden" }}>
      <Stars count={18} seed={71} />
      <Reveal>
        <Titulo>¿VAS A VENIR?</Titulo>
        <p style={{ fontFamily: FONT, fontSize: 17, lineHeight: 1.55, color: WHITE, marginTop: 18 }}>
          ¡Necesitamos saber si contamos contigo! Confirma tu asistencia antes del{" "}
          <span style={{ color: GOLD, fontWeight: 600 }}>{f.rsvpHasta}</span>:
        </p>
      </Reveal>
      <Reveal delay={1}>
        <a
          href={waConfirm(demo)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginTop: 26,
            padding: "17px 30px",
            borderRadius: 999,
            background: WHATSAPP,
            color: WHITE,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "0.06em",
            textDecoration: "none",
            boxShadow: "0 0 22px rgba(37, 211, 102, 0.45), 0 12px 26px -10px rgba(0,0,0,0.6)",
            animation: "pulse-soft 2.4s ease-in-out infinite",
          }}
        >
          CONFIRMAR ASISTENCIA
          <MessageCircle size={20} color={WHITE} strokeWidth={2.3} aria-hidden="true" />
        </a>
        <p style={{ fontFamily: FONT, fontSize: 14.5, color: PINK_SOFT, marginTop: 18 }}>
          Por favor indícanos el nombre y cuántos asistirán
        </p>
      </Reveal>
    </section>
  );
}

// ─── 7. Cierre ───────────────────────────────────────────────────────────────

function CierreSection({ demo }: { demo: boolean }) {
  const f = festejadaFor(demo);
  const year = f.iso.slice(0, 4);
  return (
    <section
      style={{
        position: "relative",
        minHeight: 420,
        padding: "80px 24px 96px",
        textAlign: "center",
        overflow: "hidden",
        background: `radial-gradient(ellipse at 50% 60%, #3a0d35 0%, ${BG} 75%)`,
      }}
    >
      <Stars count={20} seed={89} />
      <Confetti />
      <div style={{ position: "relative", zIndex: 2 }}>
        <Deco file="deco-confetti.png" width={150} ratio="2 / 1" style={{ margin: "0 auto 24px" }} />
        <Titulo size="clamp(30px, 10vw, 44px)">¡TE ESPERAMOS!</Titulo>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 19,
            letterSpacing: "0.1em",
            color: PINK_SOFT,
            marginTop: 20,
          }}
        >
          {f.nombre} · {f.edad} años · {year}
        </div>
      </div>
    </section>
  );
}

// ─── MusicFab ────────────────────────────────────────────────────────────────

export function MusicFab({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={playing ? "Pausar música" : "Reproducir música"}
      style={{
        position: "fixed",
        bottom: 18,
        right: "max(18px, calc(50vw - 215px + 18px))",
        zIndex: 60,
        width: 54,
        height: 54,
        borderRadius: 999,
        border: `1px solid ${PINK_SOFT}`,
        background: GRADIENT,
        boxShadow: `0 0 20px ${GLOW}, 0 14px 30px rgba(0,0,0,0.5)`,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: 999,
          border: `1px solid ${MAGENTA}`,
          opacity: playing ? 1 : 0,
          pointerEvents: "none",
          animation: playing ? "pulse-ring 1.4s infinite" : "none",
        }}
      />
      {playing ? (
        <svg viewBox="0 0 24 24" width="20" height="20" fill={WHITE}>
          <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="20" height="20" fill={WHITE}>
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      )}
    </button>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function InvitationKpop({
  demo = false,
  photosPath = DEMO_PHOTOS_PATH,
  musicSrc = MUSIC_SRC,
}: {
  demo?: boolean;
  // Las rutas de clientes pasan sus propios assets
  // (public/kpop-guerreras/<cliente>/photos y .../music.mp3). Las decoraciones
  // son fijas del diseño y se comparten desde /kpop-guerreras-demo/.
  photosPath?: string;
  musicSrc?: string;
}) {
  const [opened, setOpened] = useState(false);
  const { playing, play, toggle } = useMusic(musicSrc, DESIGN_ID);

  const handleOpen = () => {
    setOpened(true);
    play();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div id="invitation-root" style={{ background: BG, color: WHITE, fontFamily: FONT }}>
      {demo && <DemoBanner />}
      {!opened && <IntroGate onOpen={handleOpen} demo={demo} />}
      {opened && <MusicFab playing={playing} onToggle={toggle} />}

      <main style={{ position: "relative", zIndex: 1 }}>
        <BienvenidaSection photosPath={photosPath} demo={demo} />
        <CountdownSection partyIso={festejadaFor(demo).iso} />
        <FiestaSection demo={demo} />
        <ProgramaSection />
        <ConfirmarSection demo={demo} />
        <CierreSection demo={demo} />
      </main>
    </div>
  );
}
