"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMediaUpload } from "@/app/components/shared/useMediaUpload";
import UploadPreview from "@/app/components/shared/UploadPreview";
import { useMusic } from "@/app/components/shared/useMusic";
import { ACCEPT_ATTR } from "@/lib/media";

const DESIGN_ID = "tortuga-tropical";

// Assets del DEMO (/tortuga-tropical). Las decoraciones (deco-*, tortugas-fondo,
// qr-yape) viven en /tortuga-tropical-demo/ y son parte del diseño (las usan
// también los clientes); las fotos de la pareja viven en
// /tortuga-tropical-demo/photos/ y las rutas de clientes las reemplazan vía
// props `photosPath` y `musicSrc` (public/tortuga-tropical/<cliente>/).
// La galería importa MUSIC_SRC como default.
export const MUSIC_SRC = "/tortuga-tropical-demo/Lo_Mejor_De_Mi_Vida_Eres_Tu.mp3";
export const DEMO_PHOTOS_PATH = "/tortuga-tropical-demo/photos";
const DECO_PATH = "/tortuga-tropical-demo";

// Paleta del diseño Tortuga Tropical (tomada del HTML de referencia de Canva)
const BG = "#faf3eb"; // crema
const INK = "#02536f"; // azul petróleo (títulos y texto)
const TEAL = "#03898c"; // acentos teal
const TEAL_BRIGHT = "#03beba"; // botón "Ver en maps"
const TEAL_DARK = "#03888b"; // botón "Cómo llegar"
const SAND = "#f5ead9"; // banda arena (#efdecc al 55% sobre crema)
const GOLD = "#f6cf86"; // caja del QR y botón confirmar
const CORAL = "#f56646"; // sección "¿Nos acompañas?"
const COUNT_BG = "#e6f2f0"; // caja del contador (mismo aqua de la tarjeta de fecha)
const COUNT_INK = "#02516f"; // números y etiquetas del contador

// Cormorant Garamond 600 sustituye a "Perandory" del original (fuente de pago
// de Canva, no está en Google Fonts); Bodoni Moda a "Bodoni FLF". Los títulos
// grandes y números del contador van en weight 600 para acercarse al trazo
// de Perandory.
const DISPLAY = "'Cormorant Garamond', 'Italiana', Georgia, serif";
const BODY = "'DM Sans', 'Segoe UI', Arial, sans-serif";
const ACCENT = "'Bodoni Moda', 'Bodoni MT', Georgia, serif";

// Los GIFs decorativos de public/ vienen en tonos oliva/marrón; este filtro
// los lleva al azul petróleo #02536f sin tocar los archivos (sepia normaliza
// el tono a ~40° y el hue-rotate lo gira hasta ~195°, el matiz de ese azul).
const GIF_FILTER = "sepia(1) saturate(2.4) hue-rotate(155deg) brightness(0.55)";

const WEDDING_ISO = "2026-09-12T16:00:00";
// Coordenadas exactas del local (Av. Circunvalación Norte 404, Huaral)
const COORDS = "-11.489522,-77.206264";
const MAPS_URL = `https://www.google.com/maps?q=${COORDS}`;
const MAPS_DIR_URL = `https://www.google.com/maps/dir/?api=1&destination=${COORDS}`;
const WA_CONFIRM = `https://wa.me/51993092110?text=${encodeURIComponent(
  "¡Hola Israel y Marisol! Confirmo mi asistencia a su matrimonio civil del 12 de septiembre. 🐢"
)}`;

// ─── Scroll reveal (mismas clases CSS globales que oliva y playa) ────────────

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

// Variante del reveal para la entrada (se dispara al ingresar, no con scroll)
function EnterReveal({
  active,
  delay = 0,
  kind = "reveal",
  style,
  children,
}: {
  active: boolean;
  delay?: number;
  kind?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${kind}${active ? " in" : ""}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */

// ─── Decoración opcional ─────────────────────────────────────────────────────
// Carga `${DECO_PATH}/${file}` (tortugas, hojas, flores…). Mientras el archivo
// no exista en public/tortuga-tropical-demo/ simplemente no se muestra nada:
// basta con copiar el PNG con ese nombre para que aparezca solo.

function Deco({
  file,
  width,
  rotate = 0,
  flip = false,
  opacity = 1,
  style,
}: {
  file: string;
  width: number;
  rotate?: number;
  flip?: boolean;
  opacity?: number;
  style?: React.CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Si la imagen del HTML SSR terminó de cargar (o falló) antes de que React
  // hidratara, los eventos onLoad/onError ya pasaron: se lee el estado real.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) setLoaded(true);
    else setMissing(true);
  }, []);

  if (missing) return null;
  return (
    <img
      ref={imgRef}
      src={`${DECO_PATH}/${file}`}
      alt=""
      aria-hidden="true"
      onLoad={() => setLoaded(true)}
      onError={() => setMissing(true)}
      style={{
        width,
        display: "block",
        transform: `${flip ? "scaleX(-1) " : ""}rotate(${rotate}deg)`,
        opacity: loaded ? opacity : 0,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

// ─── Foto de la pareja (desde photosPath, con placeholder de respaldo) ───────
// Intenta cargar `${base}/${file}` (demo: /tortuga-tropical-demo/photos;
// cliente: su carpeta) y si el archivo no existe muestra un recuadro con
// cámara y el nombre esperado. Basta con copiar la foto real con ese nombre.

function Foto({
  file,
  base,
  alt,
  ratio = "4 / 5",
  blob,
  style,
  imgStyle,
}: {
  file: string;
  base: string;
  alt: string;
  ratio?: string;
  blob?: string;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) setLoaded(true);
    else setMissing(true);
  }, []);

  const shape: React.CSSProperties = blob ? { borderRadius: blob, overflow: "hidden" } : {};

  return (
    <div style={{ position: "relative", width: "100%", ...style }}>
      {!loaded && (
        <div
          style={{
            width: "100%",
            aspectRatio: ratio,
            background: `linear-gradient(180deg, ${TEAL} 0%, ${INK} 130%)`,
            boxShadow: "0 18px 40px -18px rgba(2,83,111,0.45)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            color: "rgba(250,243,235,0.9)",
            ...shape,
          }}
        >
          <svg viewBox="0 0 24 24" width={34} height={34} fill="none" aria-hidden="true">
            <path
              d="M4 8h2.2l1.2-2h9.2l1.2 2H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span
            style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            {file}
          </span>
        </div>
      )}
      {!missing && (
        <img
          ref={imgRef}
          src={`${base}/${file}`}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setMissing(true)}
          style={{
            width: "100%",
            display: "block",
            aspectRatio: ratio,
            objectFit: "cover",
            ...shape,
            ...imgStyle,
            ...(loaded ? {} : { position: "absolute", inset: 0, height: "100%", opacity: 0 }),
          }}
        />
      )}
    </div>
  );
}

// Botón de mapa ("Ver en maps" / "Cómo llegar"): casi rectangular como en el
// Canva, teal con texto blanco en mayúsculas
function MapButton({
  href,
  bg = TEAL,
  color = "#ffffff",
  children,
}: {
  href: string;
  bg?: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        width: "100%",
        maxWidth: 270,
        boxSizing: "border-box",
        background: bg,
        color,
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: 19,
        letterSpacing: "0.13em",
        textTransform: "uppercase",
        textDecoration: "none",
        padding: "10px 24px",
        borderRadius: 8,
        boxShadow: "0 6px 14px -10px rgba(2,83,111,0.45)",
      }}
    >
      {children}
    </a>
  );
}

const smallCaps: React.CSSProperties = {
  fontFamily: BODY,
  fontSize: 13,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

// ─── Banner de demo (solo en el catálogo, no en invitaciones de clientes) ────

function DemoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const waLink = `https://wa.me/51993092110?text=${encodeURIComponent(
    "¡Hola! Me gusta el diseño Tortuga Tropical y quiero una invitación como esta. 🐢"
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
        background: "rgba(2, 83, 111, 0.92)",
        backdropFilter: "blur(8px)",
        color: BG,
        fontFamily: BODY,
        fontSize: 12,
        letterSpacing: "0.05em",
      }}
    >
      <span>🐢 Esta es una demo — ¿Te gusta este diseño?</span>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flexShrink: 0,
          background: TEAL_BRIGHT,
          color: "#fdfdfe",
          padding: "6px 14px",
          borderRadius: 50,
          textDecoration: "none",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: 11,
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
          color: BG,
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

// ─── Intro (portada de entrada, como oliva y playa) ──────────────────────────

function IntroGate({ onOpen }: { onOpen: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        margin: "auto",
        maxWidth: 430,
        zIndex: 100,
        background: INK,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: 24,
        textAlign: "center",
      }}
    >
      {/* Degradado marino de fondo */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(120% 90% at 50% 0%, ${TEAL_DARK} 0%, ${INK} 62%, #01374a 100%)`,
        }}
      />
      <Deco
        file="deco-tortuga.png"
        width={90}
        opacity={0.9}
        style={{ position: "absolute", top: 46, right: 30 }}
      />
      <Deco
        file="deco-hoja.png"
        width={210}
        opacity={0.18}
        style={{ position: "absolute", bottom: -40, left: -60 }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 54,
            lineHeight: 1.1,
            color: BG,
            textShadow: "0 2px 18px rgba(0,0,0,0.35)",
          }}
        >
          Israel
          <div style={{ fontSize: 34, opacity: 0.85, margin: "-2px 0" }}>&amp;</div>
          Marisol
        </h1>

        <button
          onClick={onOpen}
          style={{
            appearance: "none",
            border: 0,
            cursor: "pointer",
            background: BG,
            color: INK,
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "13px 36px",
            borderRadius: 999,
            boxShadow: "0 12px 28px -8px rgba(0,0,0,0.5)",
            animation: "pulse-soft 2.4s ease-in-out infinite",
          }}
        >
          Ingresar a mi invitación
        </button>

        <div
          style={{
            ...smallCaps,
            fontSize: 10,
            letterSpacing: "0.18em",
            color: BG,
            opacity: 0.85,
            marginTop: -12,
            textShadow: "0 1px 8px rgba(0,0,0,0.4)",
          }}
        >
          Sube el volumen para una mejor experiencia
        </div>
      </div>
    </div>
  );
}

// ─── Portada ─────────────────────────────────────────────────────────────────

function PortadaSection({ opened, photosPath }: { opened: boolean; photosPath: string }) {
  return (
    <section
      style={{ background: BG, padding: "52px 18px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}
    >
      <EnterReveal active={opened}>
        <h1
          style={{
            fontFamily: ACCENT,
            fontWeight: 700,
            fontStyle: "normal",
            // clamp: una sola línea en cualquier ancho (320–430px)
            fontSize: "clamp(22px, 7.2vw, 31px)",
            lineHeight: 1.1,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            color: INK,
          }}
        >
          Israel &amp; Marisol
        </h1>
      </EnterReveal>

      <EnterReveal active={opened} kind="reveal-scale" delay={180}>
        {/* Negative margin breakout: compensa el padding 18px de la sección
            para que la foto corra de borde a borde de la pantalla */}
        <div style={{ position: "relative", marginTop: 20, marginLeft: -18, marginRight: -18 }}>
          {/* Foto limpia como el Canva: rectangular, sin radio, sin sombra ni marco */}
          <Foto file="portada.png" base={photosPath} alt="Israel y Marisol" ratio="4 / 3" />
          <EnterReveal
            active={opened}
            delay={380}
            style={{ position: "absolute", top: 18, left: 0, right: 0 }}
          >
            <div
              style={{
                fontFamily: BODY,
                fontSize: 20,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: BG,
                textShadow: "0 1px 10px rgba(0,0,0,0.45)",
              }}
            >
              ¡Se casan!
            </div>
          </EnterReveal>
          <Deco
            file="deco-tortuga.png"
            width={70}
            rotate={-8}
            style={{ position: "absolute", bottom: -18, right: 6 }}
          />
        </div>
      </EnterReveal>

      <EnterReveal active={opened} delay={470}>
        <div
          style={{
            ...smallCaps,
            color: INK,
            fontSize: 10.5,
            letterSpacing: "0.18em",
            marginTop: 26,
          }}
        >
          Estamos emocionados de extenderte esta invitación
        </div>
      </EnterReveal>

      {/* Aros entre el texto de bienvenida y la historia, como el Canva */}
      <EnterReveal active={opened} delay={560}>
        <Deco file="aros.png" width={100} style={{ margin: "26px auto 0" }} />
      </EnterReveal>

      <EnterReveal active={opened} delay={720}>
        <p
          style={{
            fontFamily: BODY,
            fontSize: 15.5,
            lineHeight: 1.6,
            color: INK,
            marginTop: 26,
            maxWidth: 310,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          El amor nos encontró hace 16 años, el destino nos volvió a unir hace cuatro, y hoy con
          el corazón lleno de gratitud, decidimos unir nuestras vidas para siempre.
        </p>
      </EnterReveal>
    </section>
  );
}

// ─── Fecha ───────────────────────────────────────────────────────────────────
// Misma estructura, tipografía y espaciado que DateSection de oliva
// (InvitationOliva.tsx + clases .hline/.display-title/.small-caps de
// globals.css), replicada inline con la paleta tortuga: texto azul petróleo,
// líneas y acentos teal.

function FechaSection() {
  // .hline de oliva (height 1px, opacity 0.5) en teal
  const hline: React.CSSProperties = { height: 1, background: TEAL, opacity: 0.5 };
  // .display-title de oliva (Lora, tracking 0.24em, uppercase, weight 500)
  const sideWord: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    color: INK,
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    fontWeight: 500,
    fontSize: 14,
    textAlign: "center",
    padding: "12px 0",
  };
  // .small-caps de oliva (Abel, tracking 0.32em, uppercase)
  const caps: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    letterSpacing: "0.32em",
    textTransform: "uppercase",
  };

  return (
    <section style={{ background: BG, padding: "20px 28px 50px", position: "relative" }}>
      <Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: 14,
            maxWidth: 340,
            margin: "0 auto",
          }}
        >
          <div>
            <div style={hline} />
            <div style={sideWord}>Sábado</div>
            <div style={hline} />
          </div>

          <div style={{ textAlign: "center", padding: "0 6px" }}>
            <div style={{ ...caps, color: TEAL }}>Huaral</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 54,
                lineHeight: 1.1,
                color: INK,
              }}
            >
              12
            </div>
            <div style={{ ...caps, color: INK }}>2026</div>
          </div>

          <div>
            <div style={hline} />
            <div style={sideWord}>Septiembre</div>
            <div style={hline} />
          </div>
        </div>
      </Reveal>
      <Reveal delay={1}>
        <Deco
          file="deco-ola.png"
          width={170}
          style={{ margin: "18px auto 0" }}
        />
      </Reveal>
    </section>
  );
}

// ─── Cuenta regresiva ("Solo faltan:") ───────────────────────────────────────

function getTimeLeft() {
  const diff = new Date(WEDDING_ISO).getTime() - Date.now();
  const clamp = Math.max(diff, 0);
  return {
    d: Math.floor(clamp / 86400000),
    h: Math.floor((clamp / 3600000) % 24),
    m: Math.floor((clamp / 60000) % 60),
    s: Math.floor((clamp / 1000) % 60),
  };
}

function CountdownSection() {
  // Arranca en null y se calcula recién en el cliente: el valor depende de
  // Date.now() y renderizarlo en SSR causa un hydration mismatch.
  const [t, setT] = useState<ReturnType<typeof getTimeLeft> | null>(null);
  useEffect(() => {
    const tick = () => setT(getTimeLeft());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const unit = (value: number, label: string) => (
    <div style={{ minWidth: 56 }}>
      <div
        style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 38, lineHeight: 1, color: COUNT_INK }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div style={{ ...smallCaps, fontSize: 9, color: COUNT_INK, marginTop: 8 }}>
        {label}
      </div>
    </div>
  );

  const sep = (key: string) => (
    <div
      key={key}
      style={{
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: 30,
        lineHeight: 1,
        color: COUNT_INK,
        paddingBottom: 16,
      }}
    >
      :
    </div>
  );

  return (
    <section style={{ background: BG, padding: "38px 24px 52px", textAlign: "center" }}>
      <Reveal>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 28,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: INK,
          }}
        >
          Solo faltan:
        </div>
      </Reveal>
      <Reveal kind="reveal-scale" delay={1}>
        <div
          style={{
            marginTop: 20,
            background: COUNT_BG,
            borderRadius: 18,
            padding: "24px 12px 20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 18px 40px -18px rgba(2,83,111,0.55)",
          }}
        >
          {unit(t?.d ?? 0, "Días")}
          {sep("s1")}
          {unit(t?.h ?? 0, "Hrs")}
          {sep("s2")}
          {unit(t?.m ?? 0, "Min")}
          {sep("s3")}
          {unit(t?.s ?? 0, "Seg")}
        </div>
      </Reveal>
    </section>
  );
}

// ─── Ceremonia civil (fondo con imagen, ícono de municipalidad, botones y mapa)

// El pb del embed apunta a las coordenadas exactas del local (COORDS)
const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d487.5!2d-77.206264!3d-11.489522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTHCsDI5JzIyLjMiUyA3N8KwMTInMjIuNiJX!5e0!3m2!1ses!2spe!4v1";

function CeremoniaSection() {
  return (
    <section
      style={{
        backgroundColor: SAND,
        backgroundImage: `url('${DEMO_PHOTOS_PATH}/fondo-ceremonia.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "56px 30px 60px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative" }}>
        <Reveal>
          <img
            src={`${DEMO_PHOTOS_PATH}/municipalidad.png`}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{ width: 70, display: "block", margin: "0 auto" }}
          />
          <h2
            style={{
              fontFamily: DISPLAY,
              fontWeight: 600,
              fontSize: 38,
              letterSpacing: "0.02em",
              color: INK,
              textTransform: "uppercase",
              marginTop: 14,
            }}
          >
            Ceremonia civil
          </h2>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 16, color: INK, marginTop: 10 }}>
            4:00 p.m.
          </div>
          <div style={{ fontFamily: BODY, fontSize: 16, color: INK, marginTop: 16 }}>
            Av. Circunvalación Norte 404 - Huaral
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div
            style={{
              marginTop: 26,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <MapButton href={MAPS_URL}>Ver en maps</MapButton>
            <MapButton href={MAPS_DIR_URL}>Cómo llegar</MapButton>
          </div>
        </Reveal>

        <Reveal kind="reveal-scale" delay={2}>
          <iframe
            src={MAPS_EMBED_URL}
            title="Mapa de la ceremonia"
            width="100%"
            height={250}
            style={{ border: "none", borderRadius: 8, display: "block", marginTop: 16 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </div>
    </section>
  );
}

// ─── Itinerario (línea vertical con GIFs recoloreados a azul) ────────────────

function ItinerarioSection() {
  const items = [
    { time: "4:00 p.m.", label: "Ceremonia", img: "/it-ceremonia.gif" },
    { time: "5:00 p.m.", label: "Brindis", img: "/it-brindis.gif" },
    { time: "6:00 p.m.", label: "Comida", img: "/it-comida.gif" },
    { time: "7:00 p.m.", label: "Celebración", img: "/it-celebracion.gif" },
  ];

  return (
    <section style={{ background: BG, padding: "56px 0 84px" }}>
      {/* Título FUERA del contenedor con fondo: queda sobre el crema general */}
      <Reveal>
        <h2
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 42,
            color: INK,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          itinerario
        </h2>
      </Reveal>

      {/* La acuarela va como <img> con sus colores naturales, sin opacity ni
          overflow hidden. El PNG (1414×2000) es más alto que el bloque del
          timeline: se muestra a tamaño natural (height auto, centrada
          verticalmente) para NO recortar sus bordes orgánicos transparentes;
          que desborde un poco del contenedor es intencional, como el Canva.
          El marginTop 84 absorbe ese desborde superior (~73px en 430px de
          ancho) para que el título quede sobre el crema, no sobre la mancha */}
      <div style={{ position: "relative", marginTop: 84 }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {/* La acuarela es decorativa del DISEÑO: viene siempre del demo,
              también en las rutas de clientes (no de photosPath) */}
          <FotoBg
            file="fondo-itinerario.png"
            base={DEMO_PHOTOS_PATH}
            imgStyle={{
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)",
              height: "auto",
            }}
          />
        </div>

        {/* Timeline centrado: línea vertical exactamente al medio, íconos a la
            izquierda y textos a la derecha; cada ítem lleva un punto sobre la
            línea y un conector horizontal hacia el texto */}
        <div style={{ position: "relative", zIndex: 1, padding: "16px 24px 30px" }}>
          {/* Línea vertical del timeline, exactamente al centro */}
          <div
            style={{
              position: "absolute",
              top: 22,
              bottom: 56,
              left: "50%",
              width: 2,
              marginLeft: -1,
              background: INK,
              opacity: 0.85,
            }}
          />
          <Deco
            file="deco-tortuga.png"
            width={58}
            style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)" }}
          />
          {items.map((item, i) => (
            <Reveal key={item.label} kind="reveal-left" delay={1}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  marginTop: i === 0 ? 66 : 34,
                }}
              >
                {/* Columna izquierda: ícono alineado hacia la línea central.
                    Ancho fijo al 50% (no flex:1): con texto largo a la derecha
                    el reparto flexible se desequilibra y el punto se sale de
                    la línea central */}
                <div
                  style={{
                    flex: "0 0 calc(50% - 5px)",
                    minWidth: 0,
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingRight: 16,
                    boxSizing: "border-box",
                  }}
                >
                  <img
                    src={item.img}
                    alt={item.label}
                    width={62}
                    height={62}
                    style={{ display: "block", filter: GIF_FILTER }}
                  />
                </div>

                {/* Punto exactamente sobre la línea vertical */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    background: INK,
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />

                {/* Columna derecha: conector horizontal + texto */}
                <div
                  style={{
                    flex: "0 0 calc(50% - 5px)",
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{ width: 24, height: 2, background: INK, flexShrink: 0, marginLeft: -1 }}
                  />
                  <div style={{ paddingLeft: 8, textAlign: "left" }}>
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontWeight: 600,
                        fontSize: 22,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: INK,
                        lineHeight: 1.1,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontFamily: ACCENT,
                        fontWeight: 700,
                        fontSize: 14,
                        letterSpacing: "0.05em",
                        color: INK,
                        marginTop: 4,
                      }}
                    >
                      {item.time}
                    </div>
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

// Foto usada solo como fondo de sección: cubre todo el contenedor y se oculta
// sin placeholder si el archivo no existe (el fondo liso queda debajo).
// `imgStyle` permite anular el cover (p. ej. la acuarela del itinerario va a
// tamaño natural para no recortar sus bordes orgánicos).
function FotoBg({
  file,
  base,
  imgStyle,
}: {
  file: string;
  base: string;
  imgStyle?: React.CSSProperties;
}) {
  const [missing, setMissing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setMissing(true);
  }, []);
  if (missing) return null;
  return (
    <img
      ref={imgRef}
      src={`${base}/${file}`}
      alt=""
      aria-hidden="true"
      onError={() => setMissing(true)}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...imgStyle }}
    />
  );
}

// ─── Código de vestimenta ────────────────────────────────────────────────────

function DressCodeSection() {
  return (
    <section
      style={{
        background: BG,
        padding: "50px 30px 60px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Deco
        file="deco-flor-1.png"
        width={96}
        style={{ position: "absolute", top: 60, left: -14 }}
      />
      <Deco
        file="deco-flor-2.png"
        width={110}
        style={{ position: "absolute", bottom: 24, right: -18 }}
      />

      <Reveal>
        <img
          src="/dresscode.gif"
          alt="Código de vestimenta"
          width={104}
          height={104}
          style={{ display: "block", margin: "0 auto", filter: GIF_FILTER }}
        />
        <h2
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            // clamp + nowrap: siempre en UNA sola línea (320–430px)
            fontSize: "clamp(18px, 6.5vw, 30px)",
            whiteSpace: "nowrap",
            lineHeight: 1.1,
            color: INK,
            marginTop: 8,
            textTransform: "uppercase",
          }}
        >
          código de vestimenta
        </h2>
      </Reveal>
      <Reveal delay={1}>
        <div
          style={{
            fontFamily: ACCENT,
            fontWeight: 700,
            fontSize: 19,
            letterSpacing: "0.05em",
            color: TEAL,
            marginTop: 16,
          }}
        >
          Casual Elegante
        </div>
        <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: INK, marginTop: 12 }}>
          Ven cómodo, ven elegante.
          <br />
          Lo importante es que estés.
        </p>
      </Reveal>
      <Reveal delay={2}>
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            gap: 34,
            fontFamily: BODY,
            fontSize: 15,
            color: INK,
          }}
        >
          <span>• Sin blancos</span>
          <span>• Sin jean</span>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Nosotros ────────────────────────────────────────────────────────────────

// Rediseño (15 jul 2026, según capturas del Canva): patrón de tortugas de
// fondo en toda la sección, título flanqueado por flores, fotos PNG con
// bordes rasgados/orgánicos DENTRO del propio archivo (por eso ninguna foto
// lleva border-radius, clip-path ni overflow hidden: van a alto natural con
// aspectRatio auto para no recortar la transparencia) y filas de dos columnas
// con las tortugas decorativas junto a las fotos.
function NosotrosSection({ photosPath }: { photosPath: string }) {
  // Alto natural para las fotos cargadas: anula el aspectRatio/cover del
  // componente Foto (el ratio queda solo para el placeholder del demo)
  const natural: React.CSSProperties = { aspectRatio: "auto" };

  return (
    <section
      style={{
        background: BG,
        padding: "54px 0 0",
        textAlign: "center",
        position: "relative",
      }}
    >
      {/* Patrón de tortugas sobre TODA la sección. Capa propia (en vez de
          ::before, que no existe en estilos inline). SIN opacity CSS: el PNG
          ya trae su propia transparencia editada por el usuario */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url('${DEMO_PHOTOS_PATH}/tortuga-fondo.png')`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px auto",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* BLOQUE 1: [flor azul] NOSOTROS [flor amarilla] */}
        <Reveal>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "0 18px",
            }}
          >
            <img
              src={`${DEMO_PHOTOS_PATH}/flor-azul.png`}
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{ width: 52, display: "block" }}
            />
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 600,
                fontSize: 42,
                color: INK,
                textTransform: "uppercase",
              }}
            >
              nosotros
            </h2>
            <img
              src={`${DEMO_PHOTOS_PATH}/flor-amarilla.png`}
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{ width: 52, display: "block" }}
            />
          </div>
        </Reveal>

        {/* BLOQUE 2: nosotros-1 a ancho completo, borde rasgado del PNG */}
        <Reveal kind="reveal-scale" delay={1}>
          <Foto
            file="nosotros-1.png"
            base={photosPath}
            alt="Israel y Marisol"
            ratio="14 / 11"
            style={{ marginTop: 26 }}
            imgStyle={natural}
          />
        </Reveal>

        {/* BLOQUE 3: la historia */}
        <Reveal delay={1}>
          <p
            style={{
              fontFamily: BODY,
              fontSize: 15.5,
              lineHeight: 1.65,
              color: INK,
              margin: "32px auto",
              maxWidth: 320,
              padding: "0 24px",
            }}
          >
            Nos cruzamos por primera vez en el 2009, quizás demasiado jóvenes para entender lo que
            significaba.
            <br />
            El tiempo siguió su camino y nosotros el nuestro.
            <br />
            Pero el universo tenía otros planes, y en el 2022 volvimos a encontrarnos… esta vez,{" "}
            <em style={{ fontWeight: 700 }}>para quedarnos</em>.
          </p>
        </Reveal>

        {/* BLOQUE 4: [tortuga izquierda] | [nosotros-2] */}
        <Reveal kind="reveal-left" delay={1}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                flex: "0 0 50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <img
                src={`${DEMO_PHOTOS_PATH}/tortuga-izquierda.png`}
                alt=""
                aria-hidden="true"
                draggable={false}
                style={{ width: 135, maxWidth: "80%", display: "block" }}
              />
            </div>
            <div style={{ flex: "0 0 50%" }}>
              <Foto
                file="nosotros-2.png"
                base={photosPath}
                alt="Israel y Marisol"
                ratio="1 / 1"
                imgStyle={natural}
              />
            </div>
          </div>
        </Reveal>

        {/* BLOQUE 5: [nosotros-3] | [tortuga derecha] */}
        <Reveal kind="reveal-right" delay={1}>
          <div style={{ display: "flex", alignItems: "center", marginTop: 18 }}>
            <div style={{ flex: "0 0 50%" }}>
              <Foto
                file="nosotros-3.png"
                base={photosPath}
                alt="Israel y Marisol"
                ratio="10 / 9"
                imgStyle={natural}
              />
            </div>
            <div
              style={{
                flex: "0 0 50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={`${DEMO_PHOTOS_PATH}/tortuga-derecha.png`}
                alt=""
                aria-hidden="true"
                draggable={false}
                style={{ width: 135, maxWidth: "80%", display: "block" }}
              />
            </div>
          </div>
        </Reveal>

        {/* BLOQUE 6: nosotros-4 a ancho completo (la pareja en la playa) */}
        <Reveal kind="reveal-scale" delay={1}>
          <Foto
            file="nosotros-4.png"
            base={photosPath}
            alt="Israel y Marisol caminando en la playa"
            ratio="16 / 9"
            style={{ marginTop: 24 }}
            imgStyle={natural}
          />
        </Reveal>
      </div>
    </section>
  );
}

// ─── Agradecimientos ─────────────────────────────────────────────────────────

function AgradecimientosSection() {
  return (
    <section style={{ background: BG, padding: "44px 30px 56px", textAlign: "center" }}>
      <Reveal>
        <img
          src="/agradecimiento.gif"
          alt="Agradecimiento"
          width={100}
          height={100}
          style={{ display: "block", margin: "0 auto", filter: GIF_FILTER }}
        />
        <h2
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 38,
            letterSpacing: "0.06em",
            color: INK,
            marginTop: 8,
            textTransform: "uppercase",
          }}
        >
          agradecimientos
        </h2>
      </Reveal>
      <Reveal delay={1}>
        <p
          style={{
            fontFamily: BODY,
            fontSize: 15.5,
            lineHeight: 1.65,
            color: INK,
            marginTop: 14,
            maxWidth: 320,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          A Dios, a nuestras familias por su amor, apoyo y cariño incondicional. Gracias a cada
          persona que nos acompaña en este día tan especial.
        </p>
      </Reveal>
    </section>
  );
}

// ─── Regalos (rediseño 15 jul 2026 según captura del Canva) ──────────────────
// fondo-regalos.png del cliente como fondo de TODA la sección (sin overlay ni
// opacity; si el archivo no existe —caso del demo— queda el teal sólido de
// respaldo) y layout de dos columnas: izquierda (60%) título + texto + cuentas,
// derecha (40%) QR de yape sobre tarjeta blanca. El QR es del diseño y viene
// siempre de /tortuga-tropical-demo/photos/, en demo y en clientes.

function RegalosSection({ photosPath }: { photosPath: string }) {
  const light: React.CSSProperties = {
    fontFamily: BODY,
    fontSize: 14,
    lineHeight: 1.6,
    color: BG,
    textShadow: "0 1px 3px rgba(0,0,0,0.4)",
  };

  return (
    <section style={{ position: "relative", background: TEAL }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
        <FotoBg file="fondo-regalos.png" base={photosPath} />
      </div>

      <div
        style={{
          position: "relative",
          padding: "54px 22px 60px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Columna izquierda (60%): título, texto y cuentas */}
        <div style={{ flex: "0 0 60%", boxSizing: "border-box", paddingRight: 10, textAlign: "left" }}>
          <Reveal>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontWeight: 600,
                fontSize: 42,
                letterSpacing: "0.07em",
                color: BG,
                textTransform: "uppercase",
                textShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }}
            >
              regalos
            </h2>
            <p style={{ ...light, marginTop: 12 }}>
              Lo más valioso para nosotros es tenerte a ti este día. Pero si deseas hacernos un
              regalo, con mucho cariño lo recibiremos a través de:
            </p>
          </Reveal>
          <Reveal delay={1}>
            <p style={{ ...light, marginTop: 18 }}>
              Cuenta Soles Interbank:
              <br />
              8983327160054
            </p>
            <p style={{ ...light, marginTop: 12 }}>
              Cuenta Interbancaria Interbank:
              <br />
              00389801332716005445
            </p>
          </Reveal>
        </div>

        {/* Columna derecha (40%): QR de yape sobre tarjeta blanca */}
        <div style={{ flex: "0 0 40%", boxSizing: "border-box", textAlign: "center" }}>
          <Reveal kind="reveal-scale" delay={1}>
            <div
              style={{
                background: "#ffffff",
                borderRadius: 8,
                padding: 8,
                width: 130,
                margin: "0 auto",
                boxShadow: "0 12px 26px -12px rgba(0,0,0,0.45)",
              }}
            >
              {/* El PNG trae los módulos en crema #f6f2ee sobre transparente y
                  la mitad derecha vacía (1920×1080): brightness(0) los vuelve
                  negros (escaneables sobre blanco) y el object-fit recorta al
                  cuadrado izquierdo donde vive el QR */}
              <img
                src={`${DEMO_PHOTOS_PATH}/qr-yape.png`}
                alt="QR de Yape"
                draggable={false}
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                  objectPosition: "left center",
                  filter: "brightness(0)",
                  display: "block",
                  borderRadius: 4,
                }}
              />
            </div>
            <p style={{ ...light, fontSize: 12.5, marginTop: 12 }}>
              O también puedes escanear este QR para yape.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Comparte tus fotos y videos (Supabase) ──────────────────────────────────

function PhotoUpload({ galeriaHref }: { galeriaHref: string }) {
  const {
    uploaderName,
    setUploaderName,
    items,
    addFiles,
    removeItem,
    reset,
    uploadAll,
    uploading,
    uploadDone,
    formError,
  } = useMediaUpload(DESIGN_ID);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const rejected = items.filter((it) => it.status === "error");
  const selectable = items.filter((it) => it.status !== "error" || it.kind);

  const btnStyle: React.CSSProperties = {
    appearance: "none",
    border: 0,
    cursor: "pointer",
    background: TEAL,
    color: "#fdfdfe",
    fontFamily: DISPLAY,
    fontWeight: 600,
    fontSize: 17,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "11px 30px",
    borderRadius: 999,
  };

  if (uploadDone) {
    return (
      <section style={{ background: BG, padding: "60px 34px", textAlign: "center" }}>
        <h3
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 40,
            color: INK,
            textTransform: "uppercase",
          }}
        >
          ¡Gracias!
        </h3>
        <p style={{ fontFamily: BODY, fontSize: 15.5, color: TEAL, marginTop: 12 }}>
          Tus fotos y videos fueron subidos exitosamente.
        </p>
        <button onClick={reset} style={{ ...btnStyle, marginTop: 24 }}>
          Subir más recuerdos
        </button>
      </section>
    );
  }

  return (
    <section style={{ background: BG, padding: "54px 34px 64px", textAlign: "center" }}>
      <Reveal>
        <img
          src="/camara.gif"
          alt="Cámara fotográfica"
          width={104}
          height={104}
          style={{ display: "block", margin: "0 auto 10px", filter: GIF_FILTER }}
        />
        <h2
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 36,
            color: INK,
            textTransform: "uppercase",
          }}
        >
          Comparte tus fotos y videos
        </h2>
        <p
          style={{
            fontFamily: BODY,
            fontSize: 15,
            lineHeight: 1.65,
            color: INK,
            marginTop: 12,
            maxWidth: 310,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Tu mirada es parte de nuestra historia. El 12 de Septiembre, comparte tus fotos y videos
          y ayúdanos a guardar la eternidad en imágenes.
        </p>
      </Reveal>

      <Reveal delay={1}>
        <div
          style={{
            background: "#ffffff",
            border: `1px dashed ${TEAL}`,
            borderRadius: 16,
            padding: "26px 20px",
            marginTop: 26,
          }}
        >
          <div style={{ marginBottom: 18, textAlign: "left" }}>
            <label style={{ ...smallCaps, display: "block", fontSize: 10, color: TEAL, marginBottom: 8 }}>
              Tu nombre *
            </label>
            <input
              type="text"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              placeholder="¿Cómo te llamas?"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1px solid ${TEAL}55`,
                borderRadius: 10,
                fontFamily: BODY,
                fontSize: 15,
                color: INK,
                background: BG,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ fontFamily: BODY, fontSize: 15.5, color: INK }}>
            {selectable.length > 0
              ? `${selectable.length} archivo${selectable.length > 1 ? "s" : ""} seleccionado${selectable.length > 1 ? "s" : ""}`
              : "Sube tus fotos y videos del día"}
          </div>
          <div style={{ ...smallCaps, fontSize: 9.5, color: TEAL, marginTop: 6 }}>
            Fotos hasta 100MB · Videos hasta 500MB
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ATTR}
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              ...btnStyle,
              background: "transparent",
              color: TEAL,
              border: `1px solid ${TEAL}`,
              marginTop: 14,
            }}
          >
            {items.length > 0 ? "Agregar más" : "Elegir archivos"}
          </button>

          {items.length > 0 && (
            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {items.map((it) => (
                <UploadPreview
                  key={it.id}
                  item={it}
                  uploading={uploading}
                  onRemove={removeItem}
                  accent={TEAL}
                />
              ))}
            </div>
          )}

          {rejected.length > 0 && (
            <div
              style={{
                marginTop: 12,
                fontFamily: BODY,
                fontSize: 11.5,
                color: "#B33A2C",
                textAlign: "left",
              }}
            >
              {rejected.map((it) => (
                <div key={it.id} style={{ padding: "2px 0" }}>
                  · {it.file.name}: {it.error}
                </div>
              ))}
            </div>
          )}

          {formError && (
            <div style={{ marginTop: 12, fontFamily: BODY, fontSize: 12.5, color: "#B33A2C" }}>
              {formError}
            </div>
          )}

          <div>
            <button
              onClick={uploadAll}
              disabled={uploading}
              style={{ ...btnStyle, marginTop: 18, opacity: uploading ? 0.7 : 1 }}
            >
              {uploading ? "Subiendo..." : "Subir archivos"}
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={2}>
        <div style={{ marginTop: 22 }}>
          {/* Link (no <a>): la navegación client-side mantiene la música sonando */}
          <Link
            href={galeriaHref}
            style={{ ...smallCaps, fontSize: 11, color: TEAL, textDecoration: "none" }}
          >
            Ver galería de fotos →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

// ─── ¿Nos acompañas? (sección coral con patrón de tortugas) ──────────────────

function ConfirmarSection() {
  return (
    <section style={{ position: "relative", background: CORAL, overflow: "hidden" }}>
      {/* Patrón de tortugas sobre el coral, como el Canva (opacidad 0.35) */}
      <Deco
        file="tortugas-fondo.png"
        width={430}
        opacity={0.35}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ position: "relative", padding: "54px 34px 60px", textAlign: "center" }}>
        <Reveal>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontWeight: 600,
              // clamp + nowrap: siempre en UNA sola línea (320–430px)
              fontSize: "clamp(18px, 7vw, 30px)",
              whiteSpace: "nowrap",
              letterSpacing: "0.07em",
              // Sobre el coral el azul petróleo no contrasta: va en crema,
              // como el Canva
              color: BG,
              textTransform: "uppercase",
            }}
          >
            ¿Nos acompañas?
          </h2>
          <p
            style={{
              fontFamily: BODY,
              fontSize: 15,
              lineHeight: 1.6,
              color: BG,
              marginTop: 14,
              maxWidth: 310,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Nos encantaría compartir este día tan especial contigo. Te agradeceríamos mucho si
            pudieras confirmar antes del 01 de Septiembre.
          </p>
        </Reveal>
        <Reveal delay={1}>
          <div style={{ marginTop: 26 }}>
            <a
              href={WA_CONFIRM}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                background: GOLD,
                color: INK,
                fontFamily: BODY,
                fontSize: 16,
                textDecoration: "none",
                padding: "12px 32px",
                borderRadius: 999,
                boxShadow: "0 12px 26px -12px rgba(0,0,0,0.4)",
              }}
            >
              Confirmar asistencia
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Cierre ──────────────────────────────────────────────────────────────────

function CierreSection({ photosPath }: { photosPath: string }) {
  return (
    <section style={{ background: BG, padding: "56px 30px 0", textAlign: "center" }}>
      <Reveal>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 84,
            lineHeight: 1,
            letterSpacing: "0.07em",
            color: INK,
          }}
        >
          I &amp; M
        </div>
      </Reveal>
      <Reveal delay={1}>
        <p
          style={{
            fontFamily: BODY,
            fontSize: 15.5,
            lineHeight: 1.65,
            color: INK,
            marginTop: 18,
            maxWidth: 310,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Con mucha ilusión queremos vivir este momento rodeados de personas que han formado parte
          de nuestra historia.
          <br />
          Será un honor contar con tu presencia.
        </p>
      </Reveal>
      <Reveal delay={2}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: "0.07em",
            color: INK,
            marginTop: 26,
            textTransform: "uppercase",
          }}
        >
          ¡Te esperamos!
        </div>
        <Deco file="deco-pez.png" width={72} style={{ margin: "18px auto 0" }} />
      </Reveal>
      <Reveal kind="reveal-scale" delay={2}>
        <Foto
          file="final.jpg"
          base={photosPath}
          alt="Israel y Marisol"
          ratio="4 / 5"
          style={{ marginTop: 30 }}
        />
      </Reveal>
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
        border: "1px solid rgba(255,255,255,0.4)",
        background: "rgba(250,243,235,0.6)",
        boxShadow: "0 14px 35px rgba(2,83,111,0.35)",
        backdropFilter: "blur(10px)",
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
          border: `1px solid ${TEAL_BRIGHT}`,
          opacity: playing ? 1 : 0,
          pointerEvents: "none",
          animation: playing ? "pulse-ring 1.4s infinite" : "none",
        }}
      />
      {playing ? (
        <svg viewBox="0 0 24 24" width="20" height="20" fill={INK}>
          <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="20" height="20" fill={INK}>
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      )}
    </button>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function InvitationTortuga({
  demo = false,
  galeriaHref = "/tortuga-tropical/galeria",
  photosPath = DEMO_PHOTOS_PATH,
  musicSrc = MUSIC_SRC,
}: {
  demo?: boolean;
  // Las rutas de clientes pasan su propia galería (p. ej.
  // /tortuga-tropical/israel-y-marisol/galeria) para que el "Volver" cierre el
  // círculo, y sus propios assets (public/tortuga-tropical/<cliente>/photos y
  // .../music.mp3). El demo usa los defaults de /tortuga-tropical-demo/. Las
  // decoraciones son fijas del diseño y se comparten.
  galeriaHref?: string;
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
    <div id="invitation-root">
      {demo && <DemoBanner />}
      {!opened && <IntroGate onOpen={handleOpen} />}
      {opened && <MusicFab playing={playing} onToggle={toggle} />}

      <main style={{ position: "relative", zIndex: 1 }}>
        <PortadaSection opened={opened} photosPath={photosPath} />
        <FechaSection />
        <CountdownSection />
        {/* Arreglo floral de transición entre el contador y la ceremonia */}
        <div style={{ background: BG, textAlign: "center", padding: "24px 0" }}>
          <img
            src={`${DEMO_PHOTOS_PATH}/arreglo-flores.png`}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{ width: 220, maxWidth: "60%", display: "inline-block" }}
          />
        </div>
        <CeremoniaSection />
        <ItinerarioSection />
        <DressCodeSection />
        <NosotrosSection photosPath={photosPath} />
        <AgradecimientosSection />
        <RegalosSection photosPath={photosPath} />
        <PhotoUpload galeriaHref={galeriaHref} />
        <ConfirmarSection />
        <CierreSection photosPath={photosPath} />

        <footer style={{ padding: "30px 28px 44px", textAlign: "center", background: BG }}>
          <div style={{ ...smallCaps, fontSize: 10, color: TEAL }}>
            Israel &amp; Marisol · Huaral 2026
          </div>
          <Link
            href={galeriaHref}
            style={{
              ...smallCaps,
              color: INK,
              textDecoration: "none",
              fontSize: 10,
              marginTop: 10,
              display: "inline-block",
            }}
          >
            Ver galería de fotos →
          </Link>
        </footer>
      </main>
    </div>
  );
}
