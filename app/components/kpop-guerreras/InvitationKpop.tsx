"use client";

// Diseño K-Pop Guerreras (19 oct 2026): primer diseño de CUMPLEAÑOS infantil,
// para la ahijada del usuario (Emilia, 4 años). Fondo noche con estrellas que
// parpadean, títulos con glow magenta y botones en degradado magenta → morado.
//
// A diferencia de las bodas NO tiene galería, subida de fotos, regalos,
// playlist ni historia: es portada → countdown → chicas → la fiesta →
// programa → RSVP → video de cierre → cierre con confetti. Emilia entra por
// una intro de 3 estados (en vez de IntroGate) y abre además con su video.

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
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { getMusicAudio, useMusic } from "@/app/components/shared/useMusic";
import { VENUE_EMILIA, venueFor } from "@/lib/venue";

const DESIGN_ID = "kpop-guerreras";

// Assets del DEMO. Las decoraciones (deco-*) viven en la raíz de
// /kpop-guerreras-demo/ y son parte del DISEÑO: las usan también las rutas de
// clientes. La foto de la festejada vive en /kpop-guerreras-demo/photos/ y cada
// cliente la reemplaza vía props `photosPath` y `musicSrc`
// (public/kpop-guerreras/<cliente>/).
export const DEMO_PHOTOS_PATH = "/kpop-guerreras-demo/photos";
export const MUSIC_SRC = `${DEMO_PHOTOS_PATH}/huntrix.mp3`;
const DECO_PATH = "/kpop-guerreras-demo";

// ─── Paleta ──────────────────────────────────────────────────────────────────
const BG = "#1a1a2e"; // noche azul casi negro
const MAGENTA = "#e91e8c";
const PURPLE = "#6b0fa8";
const GOLD = "#f5d800";
const WHITE = "#ffffff";
const PINK_SOFT = "#f0a0d0"; // texto secundario
const GLOW = "rgba(233, 30, 140, 0.4)";

// Fredoka queda para botones, el aviso de demo y los números del contador del
// demo. El texto corrido (párrafos, datos, programa, etiquetas) va en
// Montserrat Arabic (@font-face en globals.css), que solo trae peso normal.
const FONT = "'Fredoka', 'Segoe UI', Arial, sans-serif";
const BODY_FONT = "'Montserrat Arabic', 'Fredoka', 'Segoe UI', Arial, sans-serif";
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

// "27 de noviembre", para el mensaje de WhatsApp
function diaYMes(iso: string) {
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} de ${MESES[m - 1].toLowerCase()}`;
}

// Mensaje prellenado: [nombre] y [N] quedan para que el invitado los complete
const waConfirm = (demo: boolean) => {
  const f = festejadaFor(demo);
  return `https://wa.me/51993092110?text=${encodeURIComponent(
    `Hola, quiero confirmar mi asistencia al cumpleaños de ${f.nombre} el ${diaYMes(f.iso)}. Mi nombre es [nombre] y asistiremos [N] personas.`
  )}`;
};

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

// ─── Decoraciones opcionales ────────────────────────────────────────────────
// Igual que el `Deco` de las bodas: la imagen queda oculta (display none, que
// igual la descarga) hasta que carga, y si el archivo no existe no se muestra
// nada ni ocupa lugar. Basta copiar el PNG con ese nombre a
// /kpop-guerreras-demo/ para que aparezca.

function Deco({
  file,
  width,
  style,
}: {
  file: string;
  width: number | string;
  style?: React.CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Si la imagen del HTML SSR ya terminó antes de hidratar, onLoad no vuelve a
  // dispararse: se lee el estado real.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <img
      ref={imgRef}
      src={`${DECO_PATH}/${file}`}
      alt=""
      aria-hidden="true"
      draggable={false}
      onLoad={() => setLoaded(true)}
      style={{ display: loaded ? "block" : "none", width, height: "auto", ...style }}
    />
  );
}

// ─── Piezas comunes ──────────────────────────────────────────────────────────

function Titulo({
  children,
  size = 34,
  style,
}: {
  children: React.ReactNode;
  size?: number | string;
  style?: React.CSSProperties;
}) {
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
        ...style,
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
        fontFamily: BODY_FONT,
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
        <Deco file="deco-portada.png" width={220} />

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

// ─── 1c. Portada en 3 estados (solo cliente; reemplaza a IntroGate) ──────────
// intro-llamada.mp4 (una vez) → intro-espera.png (imagen fija; toda la
// pantalla es clickeable) → intro-abrir.mp4 (una vez) → se abre la
// invitación. Las 3 capas están montadas desde el inicio, apiladas a pantalla
// completa: la del estado actual tiene opacity 1 y el resto 0, con una
// transición de 0,3s; al terminar, toda la intro se desvanece igual.
//
// Sonido: el navegador solo deja arrancar con sonido sin gesto del usuario si
// ya hubo interacción con el sitio. Si intro-llamada no puede sonar, va sin
// sonido, sin avisar. El clic en intro-espera arranca intro-abrir dentro del
// gesto y llama a `onToque`, que desbloquea la canción y el video de portada:
// la invitación se abre al terminar intro-abrir, ya sin gesto.
//
// Si falta algún video (onError) se salta al estado siguiente, para que el
// invitado nunca quede trabado en una pantalla negra.

const INTRO_FADE_MS = 300;
type EstadoIntro = "llamada" | "espera" | "abrir" | "done";

// play() + pause() dentro de un gesto deja al elemento habilitado para sonar
// después sin gesto (iOS). La promesa rechazada (AbortError) no importa.
function desbloquear(media: HTMLMediaElement | null) {
  if (!media || !media.paused) return;
  media.muted = false;
  media.play().catch(() => {});
  media.pause();
}

// Con sonido; si el navegador lo bloquea, sin sonido
function reproducirIntro(video: HTMLVideoElement | null) {
  if (!video) return;
  video.currentTime = 0;
  video.muted = false;
  video.play().catch(() => {
    video.muted = true;
    video.play().catch(() => {});
  });
}

function IntroVideos({
  photosPath,
  onToque,
  onAbrir,
  onOculta,
}: {
  photosPath: string;
  /** Clic en intro-espera (dentro del gesto): desbloquear audio de la invitación. */
  onToque: () => void;
  /** Terminó intro-abrir: revelar la invitación. */
  onAbrir: () => void;
  /** Terminó el fade de salida: desmontar la intro. */
  onOculta: () => void;
}) {
  const llamadaRef = useRef<HTMLVideoElement>(null);
  const abrirRef = useRef<HTMLVideoElement>(null);
  const [estado, setEstado] = useState<EstadoIntro>("llamada");
  // Los handlers de los videos leen el estado actual de aquí
  const estadoRef = useRef<EstadoIntro>("llamada");

  const irA = (siguiente: EstadoIntro) => {
    estadoRef.current = siguiente;
    setEstado(siguiente);
  };

  useEffect(() => {
    reproducirIntro(llamadaRef.current);
  }, []);

  const pasarAEspera = () => {
    if (estadoRef.current !== "llamada") return;
    irA("espera");
    window.setTimeout(() => llamadaRef.current?.pause(), INTRO_FADE_MS);
  };

  const handleClicEspera = () => {
    if (estadoRef.current !== "espera") return;
    onToque();
    irA("abrir");
    reproducirIntro(abrirRef.current);
  };

  const terminar = () => {
    if (estadoRef.current !== "abrir") return;
    irA("done");
    onAbrir();
    window.setTimeout(onOculta, INTRO_FADE_MS);
  };

  const capa = (visible: boolean): React.CSSProperties => ({
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.3s ease",
    pointerEvents: visible ? "auto" : "none",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "#000",
        opacity: estado === "done" ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <video
        ref={llamadaRef}
        src={`${photosPath}/intro-llamada.mp4`}
        preload="auto"
        playsInline
        controls={false}
        loop={false}
        draggable={false}
        onEnded={pasarAEspera}
        onError={pasarAEspera}
        style={capa(estado === "llamada")}
      />
      <img
        src={`${photosPath}/intro-espera.png`}
        alt="Toca para abrir tu invitación"
        draggable={false}
        onClick={handleClicEspera}
        style={{ ...capa(estado === "espera"), cursor: "pointer" }}
      />
      <video
        ref={abrirRef}
        src={`${photosPath}/intro-abrir.mp4`}
        preload="auto"
        playsInline
        controls={false}
        loop={false}
        draggable={false}
        onEnded={terminar}
        onError={terminar}
        style={capa(estado === "abrir")}
      />
    </div>
  );
}

// ─── Crossfade de audio (videos ↔ canción de fondo) ──────────────────────────
// La canción es el MISMO elemento Audio que controla el FAB (getMusicAudio de
// useMusic), así que el FAB se ve en pausa mientras suena un video. Si la
// canción ya estaba en pausa (el invitado la apagó), los videos no la tocan ni
// la reanudan.
//
// Limitación: en iOS el volumen de audio/video es de solo lectura, así que los
// fades son cortes secos (la pausa y la reanudación sí funcionan).

const FADE_MS = 500;
// Volumen normal de la canción (el que pone useMusic)
const MUSIC_VOLUME = 0.7;
// Fade en curso por elemento: un fade nuevo cancela el anterior
const fades = new WeakMap<HTMLMediaElement, number>();

function fadeTo(el: HTMLMediaElement, target: number, duration: number, onComplete?: () => void) {
  const prev = fades.get(el);
  if (prev !== undefined) window.clearInterval(prev);
  const steps = 20;
  const from = el.volume;
  let i = 0;
  const timer = window.setInterval(() => {
    i++;
    el.volume = Math.min(Math.max(from + ((target - from) * i) / steps, 0), 1);
    if (i < steps) return;
    window.clearInterval(timer);
    fades.delete(el);
    onComplete?.();
  }, duration / steps);
  fades.set(el, timer);
}

/** Cómo estaba la canción antes de que la bajara el primer video. */
interface MusicaGuardada {
  sonaba: boolean;
  posicion: number;
  volumen: number;
}

// Cuántos videos tienen la canción "tomada" (bajada y en pausa) y cómo estaba
// antes del primero. Con un contador compartido la canción solo vuelve cuando
// la suelta el ÚLTIMO video: si la portada la devolviera mientras suena el
// programa (pasa si el invitado baja rápido), sonarían los dos a la vez. Cada
// video debe llamar a soltarMusica exactamente una vez por cada tomarMusica.
let tomas = 0;
let guardada: MusicaGuardada = { sonaba: false, posicion: 0, volumen: 0.7 };

// Baja la canción en FADE_MS y la pausa. onPausada se llama al terminar, o
// enseguida si no sonaba o si ya la había bajado otro video.
function tomarMusica(onPausada?: () => void) {
  tomas++;
  const audio = getMusicAudio();
  if (tomas > 1) {
    onPausada?.();
    return;
  }
  const sonaba = !!audio && !audio.paused;
  // A mitad de un fade el volumen es intermedio: se conserva el "normal"
  const volumen = audio && !fades.has(audio) ? audio.volume || 0.7 : guardada.volumen;
  const m: MusicaGuardada = { sonaba, posicion: audio?.currentTime ?? 0, volumen };
  guardada = m;
  if (!audio || !sonaba) {
    onPausada?.();
    return;
  }
  fadeTo(audio, 0, FADE_MS, () => {
    audio.pause();
    m.posicion = audio.currentTime;
    // pause() no toca el volumen: se deja como estaba para el FAB
    audio.volume = m.volumen;
    onPausada?.();
  });
}

// Cuando la suelta el último video, la canción retoma donde quedó y sube en
// FADE_MS hasta su volumen previo (0,7 por defecto, el de useMusic; no 1). No
// hace nada si no sonaba antes del primer video.
function soltarMusica() {
  if (tomas === 0) return;
  tomas--;
  if (tomas > 0) return;
  const audio = getMusicAudio();
  const m = guardada;
  if (!audio || !m.sonaba) return;
  // Todavía bajando (se cancela ese fade) o el invitado la prendió con el FAB:
  // solo se sube, sin saltar de posición
  if (!audio.paused) {
    fadeTo(audio, m.volumen, FADE_MS);
    return;
  }
  audio.currentTime = m.posicion;
  audio.volume = 0;
  audio
    .play()
    .then(() => fadeTo(audio, m.volumen, FADE_MS))
    .catch(() => {});
}

// ─── 1b. Portada con video (solo cliente) ────────────────────────────────────
// Video a ancho completo con la tira de estrellas pegada sobre su borde
// inferior. Ambos son assets del cliente (photosPath), así que el demo no la
// monta. El video arranca recién al abrir la invitación (si corriera detrás
// del IntroGate podría terminar antes de que se vea) y, al terminar, la
// página baja sola hasta lo que sigue.
//
// Una vez que el video sale del viewport queda tapado por video-frame.png
// (y en pausa) hasta recargar: al volver a subir se ve la imagen fija, no el
// video. Antes de eso el frame está oculto y el video se ve normal.

// Audio al 100% con crossfade contra la canción: `playPortada` arranca el
// video en volumen 0 y lo sube en 0,5s mientras la canción baja en 0,5s y se
// pausa. Se llama desde el clic de "¡Abrir invitación!" (no un useEffect
// posterior) porque iOS solo deja reproducir con sonido dentro del gesto del
// usuario; por eso la canción también arranca en ese clic, aunque enseguida
// baje. El crossfade es simultáneo y no "canción baja → video arranca" como en
// el programa: esperar 0,5s sacaría el play del gesto.
//
// La canción vuelve (`onTerminar`, una sola vez) cuando el video termina o
// cuando sale de la pantalla antes de terminar: en ese caso queda en pausa
// bajo video-frame.png y onEnded nunca llegaría.

// Devuelve true si tomó la canción (hay video). onSinSonido la devuelve si el
// navegador no deja sonar al video.
function playPortada(video: HTMLVideoElement | null, onSinSonido: () => void): boolean {
  if (!video) return false;
  video.currentTime = 0;
  video.muted = false;
  video.volume = 0;
  tomarMusica();
  video
    .play()
    .then(() => fadeTo(video, 1, FADE_MS))
    .catch(() => {
      // Si igual lo bloquean, al menos se ve (sin sonido) y la canción vuelve
      video.muted = true;
      video.volume = 1;
      video.play().catch(() => {});
      onSinSonido();
    });
  return true;
}

function PortadaVideoSection({
  photosPath,
  opened,
  videoRef,
  onTerminar,
}: {
  photosPath: string;
  opened: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Devuelve la canción de fondo (el padre se encarga de hacerlo una sola vez). */
  onTerminar: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [frameVisible, setFrameVisible] = useState(false);

  // Baja el audio del video en 0,5s y devuelve la canción
  const soltarAudio = (video: HTMLVideoElement, pausar: boolean) => {
    const listo = () => {
      if (pausar) video.pause();
      onTerminar();
    };
    if (video.muted || video.paused) listo();
    else fadeTo(video, 0, FADE_MS, listo);
  };

  // Se observa recién al abrir: detrás del IntroGate la página está en top 0
  // y el video siempre "visible", así que no cambia nada antes.
  useEffect(() => {
    const video = videoRef.current;
    if (!opened || !video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) return;
      setFrameVisible(true);
      soltarAudio(video, true);
      observer.disconnect();
    });
    observer.observe(video);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleVideoEnded = () => {
    const video = videoRef.current;
    if (video) soltarAudio(video, false);
    const section = sectionRef.current;
    if (!section) return;
    window.scrollTo({ top: section.getBoundingClientRect().bottom + window.scrollY, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} style={{ position: "relative", lineHeight: 0 }}>
      <video
        ref={videoRef}
        src={`${photosPath}/video-portada.mp4`}
        playsInline
        preload="auto"
        draggable={false}
        onEnded={handleVideoEnded}
        style={{ width: "100%", display: "block", margin: 0, padding: 0 }}
      />
      <img
        src={`${photosPath}/video-frame.png`}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          visibility: frameVisible ? "visible" : "hidden",
          zIndex: 1,
        }}
      />
      <img
        src={`${photosPath}/estrellas.png`}
        alt=""
        draggable={false}
        style={{ position: "absolute", left: 0, bottom: -20, width: "100%", display: "block", margin: 0, zIndex: 2 }}
      />
    </section>
  );
}

// ─── 2b. Las chicas (parallax por scroll) ────────────────────────────────────
// Fondo fijo (chicas-fondo.png) y encima las 3 chicas superpuestas, apoyadas en
// el borde inferior: pelirroja a la izquierda, pelinegra al centro y morada a
// la derecha. Cada una entra desde fuera por la derecha en su tercio del
// recorrido (desde que la sección asoma por abajo hasta que queda centrada),
// sin transition: sigue al scroll.
//
// Las 3 tienen la altura del fondo (height 100%, width auto: proporción
// natural, sin object-fit) y se anclan por `anchor`: pelirroja a la izquierda,
// pelinegra centrada y morada a la derecha. Para entrar, cada una se desplaza
// en píxeles desde +ancho de la sección (fuera por la derecha) hasta 0, que se
// suma a su anclaje; overflow hidden esconde a las que todavía esperan.
//
// `z`: capas de abajo hacia arriba fondo (0) → pelirroja (1) → pelinegra (2)
// → morada (3), que queda encima de todas.
//
// `tope`: % de su propio ancho en que la chica se detiene a la derecha de su
// anclaje. La pelinegra centrada llegaría a tapar del todo a la pelirroja, así
// que frena antes.

const CHICAS: { file: string; anchor: "left" | "center" | "right"; z: number; tope: number }[] = [
  { file: "chica-pelirroja.png", anchor: "left", z: 1, tope: 0 },
  { file: "chica-pelinegra.png", anchor: "center", z: 2, tope: 20 },
  { file: "chica-morada.png", anchor: "right", z: 3, tope: 0 },
];

// Si la sección ya está a la vista al abrir la invitación (el demo, que no
// tiene video de portada), las chicas no podrían entrar con el scroll: bajar
// la sacaría de la pantalla. En ese caso entran solas en ENTRADA_MS, en
// secuencia, hasta donde indique el scroll; después manda el scroll.
const ENTRADA_MS = 1200;

function ChicasSection({ photosPath, opened }: { photosPath: string; opened: boolean }) {
  const chicasRef = useRef<HTMLElement>(null);
  // Desplazamiento pendiente de cada chica en px: ancho de la sección = fuera
  // por la derecha, 0 = en su lugar. Arranca en un valor enorme para que en
  // el SSR (sin medidas) también estén fuera.
  const [offset, setOffset] = useState([9999, 9999, 9999]);
  // Progreso según el scroll (0..1) y tope de la entrada automática (0..1): se
  // muestra el menor de los dos
  const scrollProgress = useRef(0);
  const entrada = useRef(0);
  const anchoSeccion = useRef(0);

  const pintar = () => {
    const progress = Math.min(scrollProgress.current, entrada.current);
    const fase1 = Math.min(progress / 0.33, 1);
    const fase2 = Math.min(Math.max((progress - 0.33) / 0.33, 0), 1);
    const fase3 = Math.min(Math.max((progress - 0.66) / 0.34, 0), 1);
    const w = anchoSeccion.current;
    setOffset([(1 - fase1) * w, (1 - fase2) * w, (1 - fase3) * w]);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!chicasRef.current) return;
      const rect = chicasRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // De 0 (la sección asoma por abajo) a 1 (la sección centrada en
      // pantalla). Medido hasta que sale por arriba, la última chica
      // terminaría de entrar fuera de la vista.
      const start = windowHeight;
      const end = (windowHeight - rect.height) / 2;
      scrollProgress.current = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
      anchoSeccion.current = rect.width;
      pintar();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Al abrir: si la sección no está a la vista, el scroll manda desde ya; si ya
  // se ve, la entrada sube de 0 a 1 en ENTRADA_MS (con ease-out)
  useEffect(() => {
    if (!opened) return;
    if (scrollProgress.current <= 0) {
      entrada.current = 1;
      pintar();
      return;
    }
    let frame = 0;
    const t0 = performance.now();
    const paso = (t: number) => {
      const k = Math.min((t - t0) / ENTRADA_MS, 1);
      entrada.current = 1 - (1 - k) ** 2;
      pintar();
      if (k < 1) frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [opened]);

  return (
    <section ref={chicasRef} style={{ position: "relative", overflow: "hidden", lineHeight: 0 }}>
      <img
        src={`${photosPath}/chicas-fondo.png`}
        alt=""
        draggable={false}
        style={{ position: "relative", zIndex: 0, width: "100%", display: "block" }}
      />
      {CHICAS.map((c, i) => (
        <img
          key={c.file}
          src={`${photosPath}/${c.file}`}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            bottom: 0,
            height: "100%",
            width: "auto",
            maxWidth: "none",
            ...(c.anchor === "left" && { left: 0 }),
            ...(c.anchor === "center" && { left: "50%" }),
            ...(c.anchor === "right" && { right: 0 }),
            zIndex: c.z,
            transform:
              c.anchor === "center"
                ? `translateX(calc(${c.tope - 50}% + ${offset[i]}px))`
                : `translateX(calc(${c.tope}% + ${offset[i]}px))`,
          }}
        />
      ))}
    </section>
  );
}

// ─── 5b / 6b. Videos con crossfade (las 2 rutas) ─────────────────────────────
// video-programa.mp4 va justo después de ¿QUÉ HAREMOS? y video-cierre.mp4
// (con corazones.png encima, como `children`) entre ¿VAS A VENIR? y el cierre.
// Cada uno se reproduce solo UNA vez por visita,
// cuando el video cruza el centro de la pantalla, con crossfade contra la
// canción de fondo: la canción baja en 0,5s y se pausa → el video arranca en
// volumen 0 y sube en 0,5s → al terminar el video baja en 0,5s → la canción
// retoma donde quedó y sube en 0,5s. Después aparece "Ver de nuevo", que repite
// la misma secuencia (ver "Crossfade de audio" arriba). Si el navegador no
// deja arrancar el video con sonido, se reproduce sin sonido y la canción
// vuelve.
//
// Si el video sale de la pantalla mientras suena (IntersectionObserver con
// threshold 0.1), su audio baja en 0,5s, se pausa, vuelve la canción y queda
// "Ver de nuevo": al regresar no se reproduce solo. Si sale mientras la
// canción todavía está bajando, el video ni arranca.

function VideoCrossfadeSection({ src, children }: { src: string; children?: React.ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasAutoPlayed = useRef(false);
  // Si este video tiene la canción tomada: garantiza un único soltarMusica
  const tieneMusica = useRef(false);
  const [estado, setEstado] = useState<"esperando" | "reproduciendo" | "terminado">("esperando");
  // El observer lee este ref (su callback no ve el estado nuevo)
  const reproduciendo = useRef(false);

  const soltar = () => {
    if (!tieneMusica.current) return;
    tieneMusica.current = false;
    soltarMusica();
  };

  const terminar = () => {
    reproduciendo.current = false;
    soltar();
    setEstado("terminado");
  };

  const arrancarVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    // Se fue de la pantalla mientras bajaba la canción: no arranca. Se mide en
    // el momento y no con el observer de salida: el del centro puede disparar
    // antes que ese (salto rápido de scroll) y lo daría por fuera.
    const r = video.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= window.innerHeight) {
      terminar();
      return;
    }
    video.currentTime = 0;
    video.muted = false;
    // Fade in de 0 a 1 (volumen al 100%), igual en el autoplay y en el replay
    video.volume = 0;
    video
      .play()
      .then(() => fadeTo(video, 1, FADE_MS))
      .catch(() => {
        // Sin permiso para sonar: va sin sonido y la canción vuelve
        video.muted = true;
        video.play().catch(() => {});
        soltar();
      });
  };

  // Canción baja en 0,5s y se pausa → recién ahí arranca el video
  const reproducir = () => {
    reproduciendo.current = true;
    setEstado("reproduciendo");
    if (!tieneMusica.current) {
      tieneMusica.current = true;
      tomarMusica(arrancarVideo);
    } else arrancarVideo();
  };

  const handleEnded = () => {
    const video = videoRef.current;
    // Al disparar onEnded el video ya no suena: el fade de salida solo deja el
    // volumen en 0 antes de devolver la canción
    if (video && !video.muted) fadeTo(video, 0, FADE_MS, terminar);
    else terminar();
  };

  // Salió de la pantalla: si está sonando, baja su audio, se pausa y vuelve la
  // canción. Si todavía no arrancó (la canción está bajando), arrancarVideo lo
  // detecta midiendo su posición.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || !reproduciendo.current || video.paused) return;
        reproduciendo.current = false;
        const pausar = () => {
          video.pause();
          terminar();
        };
        if (video.muted) pausar();
        else fadeTo(video, 0, FADE_MS, pausar);
      },
      { threshold: 0.1 }
    );
    observer.observe(video);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autoplay una sola vez: la franja de 1px en el centro de la pantalla
  // (rootMargin -50%) detecta cuando el video cruza el centro.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAutoPlayed.current) return;
        hasAutoPlayed.current = true;
        observer.disconnect();
        reproducir();
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    observer.observe(video);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={{ position: "relative", lineHeight: 0 }}>
      <video
        ref={videoRef}
        // #t=0.1 hace que el navegador pinte el primer cuadro como portada
        src={`${src}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        controls={false}
        loop={false}
        draggable={false}
        onEnded={handleEnded}
        style={{ width: "100%", display: "block", background: "#000" }}
      />
      {children}
      {estado === "terminado" && (
        <button
          onClick={reproducir}
          style={{
            position: "absolute",
            zIndex: 3,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "13px 24px",
            borderRadius: 999,
            border: `1.5px solid ${PINK_SOFT}`,
            background: "rgba(10, 10, 25, 0.62)",
            backdropFilter: "blur(4px)",
            color: WHITE,
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: "0.04em",
            lineHeight: 1,
            cursor: "pointer",
            boxShadow: `0 0 20px ${GLOW}`,
          }}
        >
          <RotateCcw size={20} color={WHITE} strokeWidth={2.3} aria-hidden="true" />
          Ver de nuevo
        </button>
      )}
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

// Arranca en null y se calcula recién en el cliente: depende de Date.now() y
// renderizarlo en SSR causa hydration mismatch (gotcha del proyecto).
function useTimeLeft(iso: string) {
  const [t, setT] = useState<ReturnType<typeof getTimeLeft> | null>(null);
  useEffect(() => {
    const tick = () => setT(getTimeLeft(iso));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return t;
}

// Contador de Emilia: tarjeta crema con patitas (contador-base.png) y la
// cabeza del gato asomándose por detrás. La cabeza va DETRÁS de la tarjeta
// (zIndex menor) para que las patitas del PNG queden delante, y su posición
// sigue al scroll (parallax, sin transición ni opacity): escondida cuando el
// contador entra por abajo, del todo asomada cuando llega al centro.
const CAT_INK = "#1d2758"; // azul marino del contorno de la tarjeta
const CAT_BLUE = "#3a78c9"; // azul de las patitas

function ContadorGato({ partyIso, photosPath }: { partyIso: string; photosPath: string }) {
  const t = useTimeLeft(partyIso);
  const ref = useRef<HTMLDivElement>(null);
  // 0 = asomada del todo, 1 = escondida (fracción de su propia altura)
  const [cabeceraOffset, setCabeceraOffset] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const start = window.innerHeight; // contador entrando por abajo
      const end = window.innerHeight / 2; // contador en el centro
      const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
      setCabeceraOffset(1 - progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const unit = (value: number | null, label: string) => (
    <div style={{ textAlign: "center", minWidth: "2ch" }}>
      <div
        style={{
          fontFamily: TITLE_FONT,
          fontWeight: "normal",
          fontSize: "clamp(28px, 8vw, 48px)",
          lineHeight: 1,
          color: CAT_INK,
        }}
      >
        {value === null ? "--" : String(value).padStart(2, "0")}
      </div>
      <div
        style={{
          fontFamily: BODY_FONT,
          fontSize: "clamp(10px, 3vw, 14px)",
          color: CAT_BLUE,
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
  const sep = (
    <span
      aria-hidden="true"
      style={{
        fontFamily: TITLE_FONT,
        fontSize: "clamp(22px, 6vw, 36px)",
        lineHeight: 1,
        color: CAT_INK,
        alignSelf: "flex-start",
      }}
    >
      :
    </span>
  );

  // Proporciones medidas sobre contador-base.png (425×149): el borde superior
  // de la tarjeta está al ~28% del alto y su centro al ~60%. La cabeza vive en
  // una franja con overflow hidden cuyo borde inferior (34%) queda escondido
  // tras la tarjeta: al bajarla su propia altura desaparece del todo. Sin esa
  // franja asomaría por debajo de la tarjeta, que es más baja que la cabeza.
  return (
    <div ref={ref} style={{ position: "relative", marginTop: 76 }}>
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: 0, right: 0, bottom: "66%", height: "90%", overflow: "hidden", zIndex: 0 }}
      >
        <img
          src={`${photosPath}/gato-cabeza.png`}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            width: "29%",
            transform: `translateX(-50%) translateY(${cabeceraOffset * 100}%)`,
          }}
        />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <img
          src={`${photosPath}/contador-base.png`}
          alt=""
          draggable={false}
          style={{ width: "100%", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            top: "60%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          {unit(t?.d ?? null, "Días")}
          {sep}
          {unit(t?.h ?? null, "Horas")}
          {sep}
          {unit(t?.m ?? null, "Min")}
          {sep}
          {unit(t?.s ?? null, "Seg")}
        </div>
      </div>
    </div>
  );
}

function CountdownSection({ partyIso, photosPath, demo }: { partyIso: string; photosPath: string; demo: boolean }) {
  const t = useTimeLeft(partyIso);

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
      <div style={{ fontFamily: BODY_FONT, fontWeight: 600, fontSize: 11, letterSpacing: "0.14em", color: GOLD, marginTop: 8 }}>
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
        {demo && <Deco file="deco-microfono.png" width={70} style={{ margin: "0 auto 18px" }} />}
        <Titulo>¡SOLO FALTAN!</Titulo>
      </Reveal>
      {demo ? (
        <Reveal delay={1}>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 30 }}>
            {unit(t?.d ?? null, "DÍAS")}
            {unit(t?.h ?? null, "HRS")}
            {unit(t?.m ?? null, "MIN")}
            {unit(t?.s ?? null, "SEG")}
          </div>
        </Reveal>
      ) : (
        <ContadorGato partyIso={partyIso} photosPath={photosPath} />
      )}
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
      <div style={{ fontFamily: BODY_FONT, fontSize: 17, lineHeight: 1.35, color: WHITE }}>{children}</div>
    </div>
  );
}

// Decoraciones de ¡LA FIESTA! (bolas de disco y soda): fotos del diseño que
// cada ruta trae en su photosPath.
const decoImg = (src: string, style: React.CSSProperties) => (
  <img src={src} alt="" aria-hidden="true" draggable={false} style={{ pointerEvents: "none", flexShrink: 0, ...style }} />
);

function FiestaSection({ demo, photosPath }: { demo: boolean; photosPath: string }) {
  const f = festejadaFor(demo);
  const venue = venueFor(demo, VENUE_EMILIA);
  return (
    <section style={{ position: "relative", padding: "60px 22px 64px", overflow: "hidden" }}>
      <Stars count={18} seed={37} />
      <Reveal>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          {decoImg(`${photosPath}/bola-disco-izquierda.png`, { width: 62, marginRight: 12 })}
          <Titulo>¡LA FIESTA!</Titulo>
          {decoImg(`${photosPath}/bola-disco-derecha.png`, { width: 62, marginLeft: 12 })}
        </div>
      </Reveal>
      <Reveal delay={1}>
        <div
          style={{
            position: "relative",
            marginTop: 28,
            padding: "24px 16px 24px 18px",
            borderRadius: 24,
            background: "rgba(107, 15, 168, 0.22)",
            border: `1.5px solid rgba(233, 30, 140, 0.55)`,
            boxShadow: `0 0 26px ${GLOW}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Columna izquierda: los datos; derecha: la soda */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
            <DatoFila icon={CalendarDays}>{fechaLarga(f.iso)}</DatoFila>
            <DatoFila icon={Clock}>{f.hora}</DatoFila>
            <DatoFila icon={MapPin}>
              <strong style={{ fontWeight: 600 }}>{f.lugar}</strong>
              <div style={{ color: PINK_SOFT, fontSize: 15 }}>{venue.line}</div>
            </DatoFila>
          </div>
          {decoImg(`${photosPath}/soda-pop.png`, { width: 88, display: "block" })}
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

// Con `photosPath` (las 2 rutas) va en dos columnas: la lista a la izquierda
// (60%) y programa-chicas.png a la derecha (40%), que entra desde la derecha
// con el scroll, con el mismo recorrido que las chicas (de asomar por abajo a
// quedar centrada). Sin `photosPath` queda la lista sola en una columna.

const PROGRAMA_PAD_X = 26;

function ProgramaSection({ photosPath }: { photosPath?: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  // 1 = fuera por la derecha, 0 = en su lugar
  const [restante, setRestante] = useState(1);

  useEffect(() => {
    if (!photosPath) return;
    const handleScroll = () => {
      if (!imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      const start = window.innerHeight;
      const end = (window.innerHeight - rect.height) / 2;
      setRestante(1 - Math.min(Math.max((start - rect.top) / (start - end), 0), 1));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [photosPath]);

  const lista = (
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
            <div style={{ display: "flex", alignItems: "center", gap: photosPath ? 12 : 18 }}>
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
              <div style={{ fontFamily: BODY_FONT }}>
                <div style={{ fontSize: photosPath ? 16 : 18, fontWeight: 600, color: WHITE, lineHeight: 1.2 }}>
                  {it.nombre}
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: GOLD, marginTop: 2, letterSpacing: "0.06em" }}>
                  {it.hora}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );

  return (
    <section
      style={{
        position: "relative",
        padding: `60px ${PROGRAMA_PAD_X}px 66px`,
        background: `linear-gradient(180deg, ${BG} 0%, #2a0f3d 45%, #3a0d35 75%, ${BG} 100%)`,
        overflow: "hidden",
      }}
    >
      <Stars count={22} seed={53} />
      <Reveal>
        <Titulo>¿QUÉ HAREMOS?</Titulo>
      </Reveal>
      {photosPath ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: "0 0 60%", minWidth: 0 }}>{lista}</div>
          <div style={{ flex: "1 1 40%", minWidth: 0, marginTop: 34 }}>
            <img
              ref={imgRef}
              src={`${photosPath}/programa-chicas.png`}
              alt=""
              draggable={false}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                // 100% de su ancho + el padding derecho de la sección: así
                // arranca del todo fuera de la pantalla
                transform: `translateX(calc(${restante * 100}% + ${restante * PROGRAMA_PAD_X}px))`,
              }}
            />
          </div>
        </div>
      ) : (
        lista
      )}
    </section>
  );
}

// ─── 6. RSVP ─────────────────────────────────────────────────────────────────

// rsvp-chicas.png arriba y rsvp-chicos.png abajo, estáticas, con el texto y
// el botón de WhatsApp en el medio. El fondo (rsvp-fondo.png) ya viene editado:
// sin overlay ni opacidad.

function ConfirmarSection({ demo, photosPath }: { demo: boolean; photosPath: string }) {
  const f = festejadaFor(demo);
  return (
    <section
      style={{
        backgroundColor: BG,
        backgroundImage: `url('${photosPath}/rsvp-fondo.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img src={`${photosPath}/rsvp-chicas.png`} alt="" draggable={false} style={{ width: "100%", display: "block" }} />

      <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: BODY_FONT }}>
        {/* Mismo Titulo (glow magenta/morado) que el resto de las secciones */}
        <Titulo size="clamp(28px, 8vw, 48px)" style={{ wordSpacing: "0.25em", marginBottom: 16 }}>
          ¿VAS A VENIR?
        </Titulo>
        <p style={{ color: PINK_SOFT, marginBottom: 8, fontSize: 17 }}>¡Necesitamos saber si contamos contigo!</p>
        <p style={{ color: WHITE, marginBottom: 24, fontSize: 17 }}>
          Confirma tu asistencia antes del <strong style={{ color: GOLD }}>{f.rsvpHasta}:</strong>
        </p>
        <a
          href={waConfirm(demo)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: `2px solid ${MAGENTA}`,
            borderRadius: 50,
            padding: "14px 32px",
            color: WHITE,
            fontFamily: TITLE_FONT,
            fontWeight: "normal",
            fontSize: 18,
            // El espacio de Hunters K-Pop casi no tiene ancho: sin esto se lee
            // "CONFIRMARASISTENCIA"
            wordSpacing: "0.35em",
            textDecoration: "none",
          }}
        >
          <MessageCircle size={20} color={WHITE} aria-hidden="true" />
          CONFIRMAR ASISTENCIA
        </a>
        <p style={{ color: PINK_SOFT, fontSize: 12, marginTop: 16 }}>Por favor indícanos el nombre y cuántos asistirán</p>
      </div>

      <img src={`${photosPath}/rsvp-chicos.png`} alt="" draggable={false} style={{ width: "100%", display: "block" }} />
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
        <Deco file="deco-confetti.png" width={150} style={{ margin: "0 auto 24px" }} />
        <Titulo size="clamp(30px, 10vw, 44px)">¡TE ESPERAMOS!</Titulo>
        <div
          style={{
            fontFamily: BODY_FONT,
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
  // (public/kpop-guerreras/<cliente>/photos, canción incluida: huntrix.mp3). Las decoraciones
  // son fijas del diseño y se comparten desde /kpop-guerreras-demo/.
  photosPath?: string;
  musicSrc?: string;
}) {
  const [opened, setOpened] = useState(false);
  const { playing, play, toggle } = useMusic(musicSrc, DESIGN_ID);

  const portadaRef = useRef<HTMLVideoElement>(null);
  // Si el video de portada tiene la canción tomada (false = no hay video o ya
  // la devolvió): garantiza un único soltarMusica
  const portadaTieneMusica = useRef(false);

  const devolverMusicaPortada = () => {
    if (!portadaTieneMusica.current) return;
    portadaTieneMusica.current = false;
    soltarMusica();
  };

  const handleOpen = () => {
    setOpened(true);
    play();
    portadaTieneMusica.current = playPortada(portadaRef.current, devolverMusicaPortada);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Emilia: la intro de 3 estados reemplaza a IntroGate y queda montada hasta
  // terminar su fade de salida
  const [introVisible, setIntroVisible] = useState(!demo);

  // Clic en intro-espera (gesto del usuario): habilita la canción y el video
  // de portada para que puedan sonar al abrir, que ya no es dentro del gesto
  const desbloquearInvitacion = () => {
    play(); // crea el Audio de la canción
    getMusicAudio()?.pause();
    desbloquear(portadaRef.current);
  };

  // Terminó intro-abrir: la canción entra con fade in de 0,5s y arranca el
  // video de portada, que la toma con el mismo crossfade de siempre
  const handleOpenVideos = () => {
    setOpened(true);
    play();
    const audio = getMusicAudio();
    if (audio) {
      audio.volume = 0;
      fadeTo(audio, MUSIC_VOLUME, FADE_MS);
    }
    portadaTieneMusica.current = playPortada(portadaRef.current, devolverMusicaPortada);
    window.scrollTo({ top: 0 });
  };

  return (
    <div id="invitation-root" style={{ background: BG, color: WHITE, fontFamily: FONT }}>
      {demo && <DemoBanner />}
      {demo && !opened && <IntroGate onOpen={handleOpen} demo={demo} />}
      {introVisible && (
        <IntroVideos
          photosPath={photosPath}
          onToque={desbloquearInvitacion}
          onAbrir={handleOpenVideos}
          onOculta={() => setIntroVisible(false)}
        />
      )}
      {opened && <MusicFab playing={playing} onToggle={toggle} />}

      <main style={{ position: "relative", zIndex: 1 }}>
        {/* Emilia: video + estrellas abren la invitación (el demo no tiene video) */}
        {!demo && (
          <PortadaVideoSection
            photosPath={photosPath}
            opened={opened}
            videoRef={portadaRef}
            onTerminar={devolverMusicaPortada}
          />
        )}
        <CountdownSection partyIso={festejadaFor(demo).iso} photosPath={photosPath} demo={demo} />
        <ChicasSection photosPath={photosPath} opened={opened} />
        <FiestaSection demo={demo} photosPath={photosPath} />
        <ProgramaSection photosPath={photosPath} />
        <VideoCrossfadeSection src={`${photosPath}/video-programa.mp4`} />
        <ConfirmarSection demo={demo} photosPath={photosPath} />
        <VideoCrossfadeSection src={`${photosPath}/video-cierre.mp4`}>
          {/* Corazones pegados al borde inferior, como las estrellas de la portada */}
          <img
            src={`${photosPath}/corazones.png`}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              display: "block",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        </VideoCrossfadeSection>
        <CierreSection demo={demo} />
      </main>
    </div>
  );
}
