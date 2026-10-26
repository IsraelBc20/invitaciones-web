"use client";

// Diseño K-Pop Guerreras (19 oct 2026): primer diseño de CUMPLEAÑOS infantil,
// para la ahijada del usuario (Emilia, 4 años). Fondo noche con estrellas que
// parpadean, títulos con glow magenta y botones en degradado magenta → morado.
//
// A diferencia de las bodas NO tiene galería, subida de fotos, regalos,
// playlist ni historia: es portada → countdown → chicas → la fiesta →
// programa → RSVP → video de cierre → cierre con confetti. Las 2 rutas entran
// por la misma intro (intro-espera → intro-abrir). Desde el 23 oct 2026 el demo
// tiene la misma estructura que Emilia, salvo los videos de portada y cierre:
// por ahora el demo muestra imágenes fijas en su lugar (25 oct 2026). Su festejada es
// Arelis (25 oct 2026).

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Cake,
  Clock,
  Gamepad2,
  Gift,
  MapPin,
  MessageCircle,
  Mic,
  Music2,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";
import { getMusicAudio, useMusic } from "@/app/components/shared/useMusic";
import { VENUE_EMILIA, venueFor } from "@/lib/venue";
import WhatsAppButton from "@/app/components/shared/WhatsAppButton";

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
  nombre: "Arelis",
  edad: 4,
  iso: "2028-11-15T16:00:00",
  hora: "4:00 PM",
  lugar: "Salón de Fiestas",
  rsvpHasta: "10 de noviembre",
};

const FESTEJADA_CLIENTE: Festejada = {
  nombre: "Emilia",
  edad: 4,
  iso: "2026-11-27T16:00:00",
  hora: "4:00 PM",
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

// Mensaje prellenado: [nombre] y [N] quedan para que el invitado los complete.
// El demo arma el mismo mensaje con su festejada (Arelis); quien quiere
// comprar la invitación tiene el botón del banner de demo.
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
      <WhatsAppButton href={waLink} compact />
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

// ─── 1. Intro en 2 estados (las 2 rutas) ─────────────────────────────────────
// intro-espera.png (imagen fija desde que carga la página; toda la pantalla es
// clickeable) → intro-abrir.mp4 (una vez) → se abre la invitación. Las 2 capas
// están montadas desde el inicio, apiladas a pantalla completa: la del estado
// actual tiene opacity 1 y la otra 0, con una transición de 0,3s; al terminar,
// toda la intro se desvanece igual. (Hasta el 23 oct 2026 abría con
// intro-llamada.mp4; el archivo sigue en la carpeta pero ya no se usa.)
//
// Sonido: el clic en intro-espera arranca intro-abrir dentro del gesto (por
// eso suena) y llama a `onToque`, que desbloquea la canción: la invitación se
// abre al terminar intro-abrir, ya sin gesto. El video de portada recién se
// monta al abrir (ver el componente principal), que lo precarga mientras se
// ve la intro.
//
// Si falta intro-abrir (onError) se abre la invitación directo, para que el
// invitado nunca quede trabado en una pantalla negra. Y si un estado dura más
// de SALTAR_MS (algo falló, o el invitado no se anima a tocar), aparece un
// botón discreto "Saltar intro" que abre la invitación directo.
//
// intro-abrir.mp4 e intro-espera.png son verticales: van con object-fit
// contain sobre negro, así se ven completos en cualquier pantalla.

const INTRO_FADE_MS = 300;
const SALTAR_MS = 30000;
type EstadoIntro = "espera" | "abrir" | "done";

// play() + pause() dentro de un gesto del usuario deja al elemento habilitado
// para sonar después sin gesto: iOS lo exige por elemento, y sin esto el
// video de cierre (que arranca solo al llegar al centro, fuera de
// cualquier gesto) caía a muted y no se escuchaba. La promesa rechazada
// (AbortError) no importa.
//
// Solo en iOS: el play() hace que el video empiece a descargarse (con
// preload="none" igual), y en Chrome/Android no hace falta, porque tras el
// primer toque la página entera ya puede reproducir con sonido. Así el video
// de cierre no le quita ancho de banda a intro-abrir (eran ~670 KB al tocar).
function esIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function desbloquearVideos() {
  if (!esIOS()) return;
  document.querySelectorAll<HTMLVideoElement>("video[data-desbloquear]").forEach((video) => {
    if (!video.paused) return;
    video.muted = false;
    video.play().catch(() => {});
    video.pause();
  });
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
  onAbrirListo,
}: {
  photosPath: string;
  /** Clic en intro-espera (dentro del gesto): desbloquear audio de la invitación. */
  onToque: () => void;
  /** Terminó intro-abrir: revelar la invitación. */
  onAbrir: () => void;
  /** Terminó el fade de salida: desmontar la intro. */
  onOculta: () => void;
  /** intro-abrir ya se descargó (o falló): puede empezar la precarga de la portada. */
  onAbrirListo: () => void;
}) {
  const abrirRef = useRef<HTMLVideoElement>(null);
  const [estado, setEstado] = useState<EstadoIntro>("espera");
  // Los handlers de los videos leen el estado actual de aquí
  const estadoRef = useRef<EstadoIntro>("espera");
  // Estado en el que se cumplieron los SALTAR_MS (el botón se ve solo si
  // seguimos en ese mismo estado)
  const [saltarEn, setSaltarEn] = useState<EstadoIntro | null>(null);

  const irA = (siguiente: EstadoIntro) => {
    estadoRef.current = siguiente;
    setEstado(siguiente);
  };

  // El botón de escape aparece si el estado actual lleva SALTAR_MS sin cambiar
  useEffect(() => {
    if (estado === "done") return;
    const id = window.setTimeout(() => setSaltarEn(estado), SALTAR_MS);
    return () => window.clearTimeout(id);
  }, [estado]);

  // intro-abrir se precarga con el propio <video> (preload="auto", viene en el
  // HTML del servidor, así que arranca antes de hidratar). No se usa un
  // <video> oculto extra: descargaba el mismo archivo otra vez en paralelo y,
  // en conexiones lentas, lo hacía tardar más. Para que nada le quite ancho de
  // banda, la precarga de video-portada espera a que este termine
  // (onAbrirListo). Si ya terminó antes de hidratar, el evento se perdió:
  // se revisa readyState al montar.
  const avisoListo = useRef(false);
  const avisarListo = () => {
    if (avisoListo.current) return;
    avisoListo.current = true;
    onAbrirListo();
  };
  useEffect(() => {
    const video = abrirRef.current;
    if (video && (video.readyState >= 4 || video.error)) avisarListo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Evita un segundo clic mientras se espera a que intro-abrir esté listo
  const abriendo = useRef(false);

  // Si intro-abrir todavía no está listo para reproducirse entero sin cortes
  // (readyState < 4), espera a canplaythrough antes de darle play. Con canplay
  // (readyState 3) arrancaba con ~0,3s cargados y en conexiones lentas se
  // trababa varias veces. Mientras tanto sigue viéndose intro-espera
  // (el cambio de estado va recién con el play), así no hay pantalla negra.
  // Como ese play ya no es dentro del gesto, primero se desbloquea el sonido
  // con play() + pause() en el propio clic, igual que desbloquearVideos.
  const handleClicEspera = async () => {
    if (estadoRef.current !== "espera" || abriendo.current) return;
    abriendo.current = true;
    const video = abrirRef.current;
    onToque();
    if (video && video.readyState < 4 && !video.error) {
      video.muted = false;
      video.play().catch(() => {});
      video.pause();
      await new Promise<void>((resolve) => {
        video.addEventListener("canplaythrough", () => resolve(), { once: true });
        video.addEventListener("error", () => resolve(), { once: true });
      });
    }
    // Mientras esperaba pudo tocar "Saltar intro"
    if (estadoRef.current !== "espera") return;
    // Si el video no carga, se abre la invitación directo
    if (!video || video.error) {
      cerrar();
      return;
    }
    irA("abrir");
    reproducirIntro(video);
  };

  const cerrar = () => {
    irA("done");
    abrirRef.current?.pause();
    onAbrir();
    window.setTimeout(onOculta, INTRO_FADE_MS);
  };

  const terminar = () => {
    if (estadoRef.current === "abrir") cerrar();
  };

  const saltar = () => {
    if (estadoRef.current !== "done") cerrar();
  };

  const capa = (visible: boolean): React.CSSProperties => ({
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100vh",
    objectFit: "contain",
    background: "#000000",
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
      {/* next/image la sirve en WebP/AVIF y al ancho de la pantalla (el PNG
          pesa 907 KB). Es lo primero que se ve: eager + fetchPriority high
          (en Next 16 `priority` está deprecado) */}
      <div onClick={handleClicEspera} style={{ ...capa(estado === "espera"), cursor: "pointer" }}>
        <Image
          src={`${photosPath}/intro-espera.png`}
          alt="Toca para abrir tu invitación"
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          draggable={false}
          style={{ objectFit: "contain" }}
        />
      </div>
      {/* Textos sobre intro-espera, juntos arriba. No reciben el clic
          (pointerEvents none): toda la pantalla sigue abriendo la invitación */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          textAlign: "center",
          color: WHITE,
          zIndex: 51,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          pointerEvents: "none",
          opacity: estado === "espera" ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: TITLE_FONT,
            fontSize: "clamp(24px, 7vw, 40px)",
            // El espacio de Hunters K-Pop casi no tiene ancho
            wordSpacing: "0.25em",
            textShadow: "0 0 10px #0058ab, 0 0 20px #0058ab, 0 0 40px #0058ab, 0 0 80px #003d7a",
          }}
        >
          TIENES UNA INVITACIÓN
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "'Montserrat Arabic', sans-serif",
            fontSize: "clamp(14px, 4vw, 18px)",
            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          Haz tap en cualquier parte de la pantalla
        </p>
      </div>
      <video
        ref={abrirRef}
        src={`${photosPath}/intro-abrir.mp4`}
        preload="auto"
        playsInline
        controls={false}
        loop={false}
        draggable={false}
        onCanPlayThrough={avisarListo}
        onEnded={terminar}
        onError={() => {
          avisarListo();
          terminar();
        }}
        style={capa(estado === "abrir")}
      />
      {saltarEn === estado && estado !== "done" && (
        <button
          onClick={saltar}
          style={{
            position: "fixed",
            right: 14,
            bottom: 14,
            zIndex: 1,
            padding: "7px 14px",
            borderRadius: 999,
            border: "1px solid rgba(255, 255, 255, 0.25)",
            background: "rgba(0, 0, 0, 0.5)",
            color: WHITE,
            fontFamily: BODY_FONT,
            fontSize: 12,
            opacity: 0.75,
            cursor: "pointer",
          }}
        >
          Saltar intro
        </button>
      )}
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
// cierre (pasa si el invitado baja rápido), sonarían los dos a la vez. Cada
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
// de la intro podría terminar antes de que se vea) y, al terminar, la
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
// el cierre: esperar 0,5s sacaría el play del gesto.
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

  // Se observa recién al abrir: detrás de la intro la página está en top 0
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
        loading="lazy"
        alt=""
        draggable={false}
        style={{ position: "relative", zIndex: 0, width: "100%", display: "block" }}
      />
      {CHICAS.map((c, i) => (
        <img
          key={c.file}
          src={`${photosPath}/${c.file}`}
          loading="lazy"
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

// ─── 5b. Video del programa (las 2 rutas) ────────────────────────────────────
// video-programa.mp4 va justo después de ¿QUÉ HAREMOS?. Es decorativo: siempre
// muted y en loop, sin tocar la canción (huntrix sigue sonando). Arranca cuando
// cruza el centro de la pantalla (franja de 1px, rootMargin -50%), cada vez que
// lo cruza. Al salir de la pantalla (threshold 0.1) se pausa y al volver a
// entrar se reanuda, si ya había arrancado alguna vez.

// true desde que el elemento queda a menos de una pantalla de distancia
// (rootMargin 100%). Dentro de un padre con display none no se cumple nunca,
// así que detrás de la intro de Emilia no descarga nada.
function useCerca(ref: React.RefObject<Element | null>) {
  const [cerca, setCerca] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || cerca) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setCerca(true);
        observer.disconnect();
      },
      { rootMargin: "100% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, cerca]);
  return cerca;
}

function VideoLoopSection({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const arranco = useRef(false);
  // Sin precarga hasta que el invitado se acerca a la sección
  const cerca = useCerca(videoRef);

  // Salió de la pantalla: pausa. Volvió a entrar: reanuda
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) video.pause();
        else if (arranco.current) video.play().catch(() => {});
      },
      { threshold: 0.1 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Cruzó el centro de la pantalla: arranca (sin flag, puede repetirse)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        arranco.current = true;
        video.play().catch(() => {});
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ position: "relative", lineHeight: 0 }}>
      <video
        ref={videoRef}
        // #t=0.1 hace que el navegador pinte el primer cuadro como portada
        src={`${src}#t=0.1`}
        muted
        loop
        playsInline
        preload={cerca ? "metadata" : "none"}
        controls={false}
        draggable={false}
        style={{ width: "100%", display: "block", background: "#000" }}
      />
    </section>
  );
}

// ─── 6b. Video de cierre con crossfade (las 2 rutas) ─────────────────────────
// video-cierre.mp4 va entre ¿VAS A VENIR? y el cierre. Es el único video del
// cuerpo que interrumpe la canción. Se reproduce solo UNA vez por visita,
// cuando cruza el centro de la pantalla, con crossfade contra la canción de
// fondo: la canción baja en 0,5s y se pausa → el video arranca en volumen 0 y
// sube en 0,5s → al terminar el video baja en 0,5s → la canción retoma donde
// quedó y sube en 0,5s (ver "Crossfade de audio" arriba). Si el navegador no
// deja arrancar el video con sonido, se reproduce sin sonido y la canción
// vuelve.
//
// Si el video sale de la pantalla mientras suena (IntersectionObserver con
// threshold 0.1), su audio baja en 0,5s, se pausa y vuelve la canción. Si sale
// mientras la canción todavía está bajando, el video ni arranca.
//
// Al terminar (o al salir de la pantalla mientras suena) `frameFinal` tapa al
// video para siempre, igual que video-frame.png en la portada. Solo se vuelve a
// ver recargando.

function VideoCrossfadeSection({ src, frameFinal }: { src: string; frameFinal: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Sin precarga hasta que el invitado se acerca a la sección
  const cerca = useCerca(videoRef);
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
    // El frame final tapa al video en el acto, sin esperar el fade del audio
    setEstado("terminado");
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
    // zIndex 1: debajo de los corazones (zIndex 2) que se le superponen
    <section style={{ position: "relative", zIndex: 1, lineHeight: 0 }}>
      <video
        ref={videoRef}
        // #t=0.1 hace que el navegador pinte el primer cuadro como portada
        src={`${src}#t=0.1`}
        // Lo habilita para sonar desbloquearVideos (gesto de abrir la invitación)
        data-desbloquear
        muted
        playsInline
        preload={cerca ? "metadata" : "none"}
        controls={false}
        loop={false}
        draggable={false}
        onEnded={handleEnded}
        style={{ width: "100%", display: "block", background: "#000" }}
      />
      {estado === "terminado" && (
        <img
          src={frameFinal}
          loading="lazy"
          alt=""
          draggable={false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 3 }}
        />
      )}
    </section>
  );
}

// Demo: imágenes fijas (1080×1920, mismo formato que los videos de Emilia) en
// lugar de los videos de portada y cierre, hasta que se suban los reales a
// kpop-guerreras-demo/photos/. Entonces se reemplazan por PortadaVideoSection y
// VideoCrossfadeSection, como en Emilia. Van por next/image (los PNG pesan
// ~4 MB; llegan como WebP) y en lazy: mientras se ve la intro <main> está en
// display none y no se descargan, así no le quitan ancho de banda a intro-abrir.
function DemoFrame({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={1080}
      height={1920}
      sizes="(max-width: 430px) 100vw, 430px"
      draggable={false}
      style={{ width: "100%", height: "auto", display: "block", margin: 0, padding: 0 }}
    />
  );
}

// Portada del demo: la imagen con estrellas.png superpuesta sobre su borde
// inferior, igual que PortadaVideoSection
function PortadaFrameSection() {
  return (
    <section style={{ position: "relative", lineHeight: 0 }}>
      <DemoFrame src={`${DEMO_PHOTOS_PATH}/video-portada-frame.png`} />
      <img
        src={`${DEMO_PHOTOS_PATH}/estrellas.png`}
        loading="lazy"
        alt=""
        draggable={false}
        style={{ position: "absolute", left: 0, bottom: -20, width: "100%", display: "block", margin: 0, zIndex: 2 }}
      />
    </section>
  );
}

// Cierre del demo: zIndex 1 como VideoCrossfadeSection, debajo de los corazones
function CierreFrameSection() {
  return (
    <section style={{ position: "relative", zIndex: 1, lineHeight: 0 }}>
      <DemoFrame src={`${DEMO_PHOTOS_PATH}/video-cierre-frame.png`} />
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
          loading="lazy"
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
          loading="lazy"
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

function CountdownSection({ partyIso, photosPath }: { partyIso: string; photosPath: string }) {
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
        <Titulo>¡SOLO FALTAN!</Titulo>
      </Reveal>
      <ContadorGato partyIso={partyIso} photosPath={photosPath} />
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
  <img src={src} loading="lazy" alt="" aria-hidden="true" draggable={false} style={{ pointerEvents: "none", flexShrink: 0, ...style }} />
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
              loading="lazy"
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
// el botón de WhatsApp en el medio. El fondo (rsvp-fondo.png) ya viene
// editado: sin overlay ni opacidad.

// Textos de ¿VAS A VENIR? en blanco con glow neón
const NEON_TEXT: React.CSSProperties = {
  fontFamily: "'Montserrat Arabic', sans-serif",
  color: "#ffffff",
  textShadow: "0 0 7px #ffffff, 0 0 10px #ffffff, 0 0 21px #ffffff, 0 0 42px rgba(255,255,255,0.6)",
  textAlign: "center",
};

function ConfirmarSection({ demo, photosPath }: { demo: boolean; photosPath: string }) {
  const f = festejadaFor(demo);
  // rsvp-fondo.png es un fondo CSS (no admite loading="lazy"): se pide recién
  // cuando la sección está cerca
  const sectionRef = useRef<HTMLElement>(null);
  const cerca = useCerca(sectionRef);
  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: BG,
        backgroundImage: cerca ? `url('${photosPath}/rsvp-fondo.png')` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img src={`${photosPath}/rsvp-chicas.png`} loading="lazy" alt="" draggable={false} style={{ width: "100%", display: "block" }} />

      <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: BODY_FONT }}>
        {/* Mismo Titulo (glow magenta/morado) que el resto de las secciones */}
        <Titulo size="clamp(28px, 8vw, 48px)" style={{ wordSpacing: "0.25em", marginBottom: 16 }}>
          ¿VAS A VENIR?
        </Titulo>
        <p style={{ ...NEON_TEXT, fontSize: "clamp(14px, 4vw, 18px)", marginBottom: 8 }}>
          ¡Prepara tus mejores pasos!
          <br />
          El escenario K-Pop está listo para una batalla inolvidable.
        </p>
        <p style={{ color: WHITE, marginBottom: 24, fontSize: 17 }}>
          Confirma tu lugar en nuestro equipo antes del <strong style={{ color: GOLD }}>{f.rsvpHasta}</strong>:
        </p>
        <a
          href={waConfirm(demo)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#25D366",
            border: "none",
            borderRadius: 50,
            padding: "14px 32px",
            color: "#ffffff",
            fontFamily: "'Montserrat Arabic', sans-serif",
            fontWeight: "normal",
            fontSize: "clamp(14px, 4vw, 18px)",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          <MessageCircle size={20} color="#ffffff" aria-hidden="true" />
          Confirmar asistencia
        </a>
        <p style={{ ...NEON_TEXT, fontSize: "clamp(12px, 3.5vw, 16px)", marginTop: 16 }}>indicando tu nombre y con cuántos ídolos vendrás.</p>
      </div>

      <img src={`${photosPath}/rsvp-chicos.png`} loading="lazy" alt="" draggable={false} style={{ width: "100%", display: "block" }} />
    </section>
  );
}

// ─── 7. Cierre ───────────────────────────────────────────────────────────────

// Solo Emilia: la niña bailando, en loop y sin sonido. El MP4 no trae
// transparencia y su fondo es NEGRO: mixBlendMode screen lo hace invisible
// (multiply sirve para fondos blancos y aquí dejaba un recuadro negro). El <video> se
// monta recién cerca de la pantalla (useCerca) para no competir con la intro.
function BaileVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const cerca = useCerca(ref);
  return (
    <div ref={ref} style={{ width: "60%", maxWidth: 280, margin: "0 auto 24px" }}>
      {cerca && (
        <video
          src="/kpop-guerreras/emilia/photos/baile-emilia.mp4"
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          draggable={false}
          style={{ display: "block", width: "100%", mixBlendMode: "screen" }}
        />
      )}
    </div>
  );
}

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
      {/* Fuera del div con zIndex: ese div es un contexto de apilamiento y el
          blend se mezclaría con su fondo transparente, no con el de la sección */}
      {!demo && <BaileVideo />}
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
            textTransform: "uppercase",
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

  // La intro (las 2 rutas) queda montada hasta terminar su fade de salida
  const [introVisible, setIntroVisible] = useState(true);

  // Clic en intro-espera (gesto del usuario): habilita la canción para que
  // pueda sonar al abrir, que ya no es dentro del gesto, y el video de cierre
  // (crossfade)
  const desbloquearInvitacion = () => {
    play(); // crea el Audio de la canción
    getMusicAudio()?.pause();
    desbloquearVideos();
  };

  // Terminó intro-abrir (o "Saltar intro"): la canción entra con fade in de
  // 0,5s. El video de portada se monta recién ahora y arranca en el efecto de
  // abajo
  const handleOpenVideos = () => {
    setOpened(true);
    play();
    const audio = getMusicAudio();
    if (audio) {
      audio.volume = 0;
      fadeTo(audio, MUSIC_VOLUME, FADE_MS);
    }
    window.scrollTo({ top: 0 });
  };

  // Emilia: precarga video-portada.mp4 con un <video> oculto mientras corre la
  // intro, apenas termina de descargarse intro-abrir (introAbrirListo): antes
  // le quitaría ancho de banda y en móvil intro-abrir se trababa. Se quita al
  // abrir la invitación (el video real sigue desde la caché) para no
  // descargarlo dos veces en paralelo
  const [introAbrirListo, setIntroAbrirListo] = useState(false);
  useEffect(() => {
    if (demo || opened || !introAbrirListo) return;
    const preload = document.createElement("video");
    preload.src = `${photosPath}/video-portada.mp4`;
    preload.preload = "auto";
    preload.muted = true;
    preload.style.display = "none";
    document.body.appendChild(preload);
    return () => {
      preload.removeAttribute("src");
      preload.load();
      preload.remove();
    };
  }, [demo, opened, introAbrirListo, photosPath]);

  // Emilia: PortadaVideoSection solo existe en el DOM una vez abierta la
  // invitación (antes podía sonar detrás de la intro). Los efectos de los
  // hijos corren antes que este, así que portadaRef ya apunta al video recién
  // montado. Ya no está dentro del gesto: si el navegador no lo deja sonar
  // (iOS), va sin sonido y la canción vuelve.
  useEffect(() => {
    if (!opened || demo) return;
    portadaTieneMusica.current = playPortada(portadaRef.current, devolverMusicaPortada);
    // La invitación acaba de dejar de estar en display none: las secciones con
    // parallax (chicas, gato, programa) midieron su posición en 0 y recién la
    // corrigen con un scroll o resize
    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  return (
    <div id="invitation-root" style={{ background: BG, color: WHITE, fontFamily: FONT }}>
      {demo && <DemoBanner />}
      {introVisible && (
        <IntroVideos
          photosPath={photosPath}
          onToque={desbloquearInvitacion}
          onAbrir={handleOpenVideos}
          onOculta={() => setIntroVisible(false)}
          onAbrirListo={() => setIntroAbrirListo(true)}
        />
      )}
      {opened && <MusicFab playing={playing} onToggle={toggle} />}

      {/* Mientras se ve la intro, la invitación queda en display none
          para que no descargue nada (las imágenes lazy y los fondos CSS de un
          elemento sin mostrar no se piden) y toda la conexión quede para
          intro-abrir. El video de cierre sigue en el DOM para que
          desbloquearVideos lo encuentre al tocar intro-espera. */}
      <main style={{ position: "relative", zIndex: 1, display: opened ? undefined : "none" }}>
        {/* Emilia: video + estrellas abren la invitación (el demo, por ahora,
            una imagen fija con las mismas estrellas) */}
        {demo && <PortadaFrameSection />}
        {!demo && opened && (
          <PortadaVideoSection
            photosPath={photosPath}
            opened={opened}
            videoRef={portadaRef}
            onTerminar={devolverMusicaPortada}
          />
        )}
        <CountdownSection partyIso={festejadaFor(demo).iso} photosPath={photosPath} />
        <ChicasSection photosPath={photosPath} opened={opened} />
        <FiestaSection demo={demo} photosPath={photosPath} />
        <ProgramaSection photosPath={photosPath} />
        <VideoLoopSection src={`${photosPath}/video-programa.mp4`} />
        <ConfirmarSection demo={demo} photosPath={photosPath} />
        {/* Corazones sobre la unión de ¿VAS A VENIR? y el video de cierre,
            para tapar la línea, sobresaliendo más hacia el video.
            corazones.png mide 525×97 (alto = 18,48% del ancho): la unión pasa
            por su fila 36, donde los corazones ya cubren el 98% del ancho.
            Arriba quedan 36/97 de su alto (6,86% del ancho) y abajo 61/97
            (11,62%); los márgenes en % son relativos al ancho, y suman su
            alto exacto para no mover al video (más margen inferior lo
            subiría sobre los chicos). translateZ(0) los lleva a su propia
            capa: en iOS el <video> puede pintarse encima de un hermano con
            más z-index. */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            marginTop: "-6.86%",
            marginBottom: "-11.62%",
            transform: "translateZ(0)",
            pointerEvents: "none",
          }}
        >
          <img
            src={`${photosPath}/corazones.png`}
            loading="lazy"
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{ width: "100%", display: "block" }}
          />
        </div>
        {demo ? (
          <CierreFrameSection />
        ) : (
          <VideoCrossfadeSection
            src={`${photosPath}/video-cierre.mp4`}
            frameFinal={`${photosPath}/cierre-frame.png`}
          />
        )}
        <CierreSection demo={demo} />
      </main>
    </div>
  );
}
