"use client";

// Diseño Cabo Azul (9 sep 2026): réplica del estilo del Canva propio del usuario
// (https://politicasdeemergenciaskusipet.my.canva.site/israel-marisol), un
// scrapbook náutico en crema y azul con polaroids, conchas, sellos postales y
// olas dibujadas a línea.
//
// El Canva original solo tenía portada, "nuestra historia", countdown y foto
// final, y traía datos distintos (16/09/2027, "Lima - Huaral"). Aquí se usa
// como guía VISUAL y se completa con el set estándar de la plataforma
// (ceremonia, itinerario, dress code, regalos, subida de fotos, RSVP, galería)
// y con los datos canónicos del proyecto — el mismo criterio que se siguió con
// tortuga-tropical.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMediaUpload } from "@/app/components/shared/useMediaUpload";
import { ACCEPT_ATTR, DEMO_INVITATION } from "@/lib/media";
import { useUploadGate, type UploadGate } from "@/app/components/shared/uploadGate";
import { UploadLimitModal } from "@/app/components/shared/UploadLimitModal";
import UploadPreview from "@/app/components/shared/UploadPreview";
import { useMusic } from "@/app/components/shared/useMusic";
import { venueFor } from "@/lib/venue";
import { coupleFor } from "@/lib/couple";
import { Heart, Lock, Sparkles } from "lucide-react";
import WhatsAppButton from "@/app/components/shared/WhatsAppButton";

const DESIGN_ID = "cabo-azul";

// Assets del DEMO. Las decoraciones (deco-*) viven en la raíz de
// /cabo-azul-demo/ y son parte del DISEÑO: las usan también las rutas de
// clientes. Las fotos de la pareja viven en /cabo-azul-demo/photos/ y cada
// cliente las reemplaza vía props `photosPath` y `musicSrc`
// (public/cabo-azul/<cliente>/). La galería importa MUSIC_SRC como default.
export const MUSIC_SRC = "/cabo-azul-demo/music.mp3";
export const DEMO_PHOTOS_PATH = "/cabo-azul-demo/photos";
const DECO_PATH = "/cabo-azul-demo";

// ─── Paleta (muestreada del Canva) ───────────────────────────────────────────
const BG = "#f5ede7"; // crema de fondo
const INK = "#007caf"; // azul de toda la tinta (títulos y cuerpo, como el Canva)
const INK_SOFT = "#4a95b5"; // azul aguado para textos secundarios
const KRAFT = "#f0e2d3"; // tarjeta de papel kraft con la fecha
const WATER = "#c8dee2"; // banda de acuarela del countdown (muestreado del PNG)
const PAPER = "#ffffff"; // marco de las polaroids
const RED_ERR = "#b33a2c";

// ─── Tipografías (en el <link> de app/layout.tsx) ────────────────────────────
// Alex Brush sustituye al script del Canva para los nombres; Sacramento, al
// script más suelto de los títulos de sección; el cuerpo es Cormorant Garamond,
// que ya usaba oliva.
const SCRIPT = "'Alex Brush', 'Great Vibes', cursive";
const SCRIPT_SOFT = "'Sacramento', 'Great Vibes', cursive";
const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Abel', 'Segoe UI', Arial, sans-serif";

// Los GIFs decorativos compartidos de public/ vienen en tonos marrones; este
// filtro los lleva al azul #007caf sin duplicar archivos (mismo truco que playa
// y tortuga). Calibrado visualmente: ajustar hue-rotate/brightness si cambia la
// paleta.
const GIF_FILTER = "sepia(1) saturate(3.2) hue-rotate(163deg) brightness(0.92)";

const WEDDING_ISO = "2026-09-12T16:00:00";

const smallCaps: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: 12,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
};

const waConfirm = (demo: boolean) =>
  `https://wa.me/51993092110?text=${encodeURIComponent(
    `¡Hola ${coupleFor(demo).prose}! Confirmo mi asistencia a su matrimonio civil del 12 de septiembre.`
  )}`;

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

// Variante que se dispara al ingresar (no con scroll), para la portada
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

// ─── Decoración del diseño ───────────────────────────────────────────────────
// Carga `${DECO_PATH}/${file}`. Si el archivo no existe no muestra nada (sin
// placeholder): basta copiar el PNG con ese nombre para que aparezca.

function Deco({
  file,
  width,
  rotate = 0,
  flip = false,
  opacity = 1,
  style,
}: {
  file: string;
  width: number | string;
  rotate?: number;
  flip?: boolean;
  opacity?: number;
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

  if (missing) return null;
  return (
    <img
      ref={imgRef}
      src={`${DECO_PATH}/${file}`}
      alt=""
      aria-hidden="true"
      draggable={false}
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

// ─── Foto de la pareja ───────────────────────────────────────────────────────
// Carga `${base}/${file}` y, si no existe, muestra un placeholder azul con el
// nombre esperado del archivo (igual que oliva/playa/tortuga).

function Foto({
  file,
  base,
  alt,
  ratio = "3 / 4",
  style,
  imgStyle,
}: {
  file: string;
  base: string;
  alt: string;
  ratio?: string;
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

  return (
    <div style={{ position: "relative", width: "100%", ...style }}>
      {!loaded && (
        <div
          style={{
            width: "100%",
            aspectRatio: ratio,
            background: `linear-gradient(180deg, ${INK_SOFT} 0%, ${INK} 120%)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            color: "rgba(245,237,231,0.92)",
          }}
        >
          <svg viewBox="0 0 24 24" width={32} height={32} fill="none" aria-hidden="true">
            <path
              d="M4 8h2.2l1.2-2h9.2l1.2 2H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span style={{ ...smallCaps, fontSize: 9.5, letterSpacing: "0.14em" }}>{file}</span>
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
            width: "100%",
            display: "block",
            aspectRatio: ratio,
            objectFit: "cover",
            ...imgStyle,
            ...(loaded ? {} : { position: "absolute", inset: 0, height: "100%", opacity: 0 }),
          }}
        />
      )}
    </div>
  );
}

// ─── Polaroid ────────────────────────────────────────────────────────────────
// Marco blanco con sombra y pie opcional escrito a mano, como los del Canva.

function Polaroid({
  file,
  base,
  alt,
  caption,
  rotate = 0,
  ratio = "3 / 4",
  style,
}: {
  file: string;
  base: string;
  alt: string;
  caption?: string;
  rotate?: number;
  ratio?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: PAPER,
        padding: caption ? "10px 10px 34px" : "10px 10px 30px",
        boxShadow: "0 16px 34px -16px rgba(0,90,130,0.45)",
        transform: `rotate(${rotate}deg)`,
        position: "relative",
        ...style,
      }}
    >
      <Foto file={file} base={base} alt={alt} ratio={ratio} />
      {caption && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 6,
            textAlign: "center",
            fontFamily: SCRIPT_SOFT,
            fontSize: 20,
            lineHeight: 1,
            color: "#3d3a37",
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}

// Clip metálico de la polaroid de portada. En el Canva el clip venía dentro de
// una polaroid vacía (deco-polaroid-clip.png), así que aquí se dibuja aparte
// para poder ponerlo sobre la foto real.
function Clip({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 38 86"
      width={30}
      aria-hidden="true"
      style={{ display: "block", filter: "drop-shadow(0 3px 4px rgba(0,60,90,0.35))", ...style }}
    >
      <path
        d="M13 70V22a6 6 0 0 1 12 0v46a11 11 0 0 1-22 0V18a16 16 0 0 1 32 0v40"
        fill="none"
        stroke="#b9c2c8"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Sello circular "Estás invitado" ─────────────────────────────────────────
// El aro azul es un PNG del Canva (deco-sello-circulo) y el texto va encima.

function SelloCircular({ size = 96, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", width: size, height: size, ...style }}>
      <Deco file="deco-sello-circulo.png" width={size} style={{ position: "absolute", inset: 0 }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          color: INK,
          textAlign: "center",
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: size * 0.085, letterSpacing: "0.12em" }}>
          12 · 09 · 2026
        </span>
        <span style={{ fontFamily: SERIF, fontSize: size * 0.17, letterSpacing: "0.08em" }}>
          I &amp; M
        </span>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: size * 0.088 }}>
          Estás invitado
        </span>
      </div>
    </div>
  );
}

// ─── Banner de demo (solo en el catálogo, no en invitaciones de clientes) ────

function DemoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const waLink = `https://wa.me/51993092110?text=${encodeURIComponent(
    "¡Hola! Me gusta el diseño Cabo Azul y quiero una invitación como esta."
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
        background: "rgba(0, 124, 175, 0.93)",
        backdropFilter: "blur(8px)",
        color: BG,
        fontFamily: SANS,
        fontSize: 12.5,
        letterSpacing: "0.05em",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Sparkles size={14} color="currentColor" aria-hidden="true" />
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

// ─── Intro (pantalla de entrada que arranca la música) ───────────────────────

function IntroGate({
  onOpen,
  photosPath,
  demo,
}: {
  onOpen: () => void;
  photosPath: string;
  demo: boolean;
}) {
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
      {/* Foto de portada al fondo + velo azul para que se lea el texto */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url('${photosPath}/portada.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,80,115,0.55) 0%, rgba(0,60,90,0.7) 100%)",
        }}
      />
      <Deco
        file="deco-concha-azul.png"
        width={110}
        opacity={0.55}
        style={{ position: "absolute", top: 38, left: 24 }}
      />
      <Deco
        file="deco-olas.png"
        width={230}
        opacity={0.5}
        style={{ position: "absolute", bottom: 46, right: -40 }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
        }}
      >
        <h1
          style={{
            fontFamily: SCRIPT,
            fontWeight: 400,
            fontSize: 62,
            lineHeight: 1.05,
            color: BG,
            textShadow: "0 2px 20px rgba(0,0,0,0.45)",
          }}
        >
          {coupleFor(demo).first}
          <div style={{ fontFamily: SERIF, fontSize: 30, opacity: 0.9, margin: "2px 0" }}>&amp;</div>
          {coupleFor(demo).second}
        </h1>

        <button
          onClick={onOpen}
          style={{
            appearance: "none",
            border: 0,
            cursor: "pointer",
            background: BG,
            color: INK,
            fontFamily: SANS,
            fontSize: 15,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            padding: "13px 34px",
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
            opacity: 0.88,
            marginTop: -10,
            textShadow: "0 1px 8px rgba(0,0,0,0.45)",
          }}
        >
          Sube el volumen para una mejor experiencia
        </div>
      </div>
    </div>
  );
}

// ─── Portada ─────────────────────────────────────────────────────────────────
// Réplica de la primera pantalla del Canva: concha arriba a la izquierda, sello
// circular a la derecha, nombres en script, polaroid con clip y tarjeta kraft.

function PortadaSection({
  opened,
  photosPath,
  demo,
}: {
  opened: boolean;
  photosPath: string;
  demo: boolean;
}) {
  const venue = venueFor(demo);
  return (
    <section style={{ background: BG, padding: "34px 26px 20px", position: "relative" }}>
      <Deco
        file="deco-concha-azul.png"
        width={48}
        style={{ position: "absolute", top: 18, left: 20 }}
      />

      <EnterReveal active={opened} kind="reveal-scale">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <SelloCircular size={104} style={{ marginRight: 4 }} />
        </div>
      </EnterReveal>

      <EnterReveal active={opened} delay={120}>
        <h1
          style={{
            fontFamily: SCRIPT,
            fontWeight: 400,
            fontSize: 58,
            lineHeight: 0.95,
            color: INK,
            textAlign: "center",
            marginTop: -46,
          }}
        >
          <div style={{ textAlign: "left", paddingLeft: 12 }}>{coupleFor(demo).first}</div>
          <div style={{ fontFamily: SERIF, fontSize: 32, margin: "2px 0 2px 46px", textAlign: "left" }}>
            &amp;
          </div>
          <div style={{ textAlign: "right", paddingRight: 8 }}>{coupleFor(demo).second}</div>
        </h1>
      </EnterReveal>

      {/* Polaroid principal con el clip metálico encima */}
      <EnterReveal active={opened} kind="reveal-scale" delay={260}>
        <div style={{ position: "relative", margin: "26px 12px 0" }}>
          <Polaroid
            file="portada.jpg"
            base={photosPath}
            alt={`${coupleFor(demo).prose} en la playa`}
            ratio="4 / 5"
          />
          <Clip style={{ position: "absolute", top: -22, right: 36, zIndex: 3 }} />
          <Deco
            file="deco-olas-chicas.png"
            width={80}
            opacity={0.9}
            style={{ position: "absolute", top: 96, right: -46 }}
          />
          <Deco
            file="deco-concha-crema.png"
            width={86}
            rotate={-14}
            style={{ position: "absolute", bottom: -16, left: -26 }}
          />
        </div>
      </EnterReveal>

      {/* Tarjeta kraft con fecha y lugar */}
      <EnterReveal active={opened} delay={380}>
        <div
          style={{
            position: "relative",
            width: 178,
            marginLeft: "auto",
            marginRight: 6,
            marginTop: -34,
            padding: "14px 10px 12px",
            background: KRAFT,
            boxShadow: "0 12px 26px -14px rgba(0,90,130,0.5)",
            textAlign: "center",
            zIndex: 4,
          }}
        >
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 14, color: INK }}>
            Septiembre 12, 2026
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 14, color: INK, marginTop: 2 }}>
            {venue.city}
          </div>
          <div style={{ marginTop: 4, lineHeight: 0 }}>
            <Heart size={13} fill={INK} color={INK} aria-hidden="true" />
          </div>
        </div>
      </EnterReveal>
    </section>
  );
}

// ─── ¡Nos casamos! ───────────────────────────────────────────────────────────

function NosCasamosSection() {
  return (
    <section style={{ background: BG, padding: "44px 34px 30px", textAlign: "center", position: "relative" }}>
      <Reveal>
        <h2 style={{ fontFamily: SCRIPT_SOFT, fontSize: 46, lineHeight: 1, color: INK }}>
          ¡Nos casamos!
        </h2>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 19,
            lineHeight: 1.55,
            color: INK,
            marginTop: 14,
            maxWidth: 300,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Y estamos emocionados de querer compartir contigo ese día tan especial.
        </p>
      </Reveal>
      <Deco
        file="deco-estrella.png"
        width={92}
        rotate={8}
        style={{ position: "absolute", right: -6, bottom: -26 }}
      />
    </section>
  );
}

// ─── Cuenta regresiva ("Guarda este dia") ────────────────────────────────────

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
  // Arranca en null y se calcula recién en el cliente: depende de Date.now() y
  // renderizarlo en SSR causa hydration mismatch (gotcha del proyecto).
  const [t, setT] = useState<ReturnType<typeof getTimeLeft> | null>(null);
  useEffect(() => {
    const tick = () => setT(getTimeLeft());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const unit = (value: number, label: string) => (
    <div style={{ minWidth: 54, textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 1, color: INK }}>
        {String(value).padStart(2, "0")}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 12.5,
          color: INK,
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );

  return (
    <section style={{ background: BG, position: "relative" }}>
      {/* Borde superior de acuarela rasgada, como en el Canva. El PNG es una
          TIRA rasgada por arriba Y por abajo: solo interesa el corte de arriba,
          así que el bloque sólido se solapa (marginBottom negativo) para tapar
          el rasgado inferior; por eso WATER es el color exacto del PNG. */}
      <Deco file="deco-banda-acuarela.png" width="100%" style={{ marginBottom: -26 }} />
      <div style={{ background: WATER, padding: "6px 26px 46px", textAlign: "center" }}>
        <Reveal>
          <h2 style={{ fontFamily: SCRIPT_SOFT, fontSize: 44, lineHeight: 1.1, color: INK }}>
            Guarda este dia
          </h2>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 27,
              letterSpacing: "0.08em",
              color: INK,
              marginTop: 6,
            }}
          >
            12 · 09 · 2026
          </div>
          <Deco
            file="deco-concha-crema.png"
            width={44}
            style={{ margin: "14px auto 0" }}
          />
        </Reveal>

        <Reveal delay={1}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginTop: 20,
            }}
          >
            {t === null ? (
              <div style={{ fontFamily: SERIF, fontSize: 17, color: INK, padding: "18px 0" }}>
                Calculando…
              </div>
            ) : (
              <>
                {unit(t.d, "Días")}
                {unit(t.h, "Horas")}
                {unit(t.m, "Minutos")}
                {unit(t.s, "Segundos")}
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Ceremonia civil ─────────────────────────────────────────────────────────

function BotonMapa({
  href,
  children,
  outline = false,
}: {
  href: string;
  children: React.ReactNode;
  outline?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block",
        fontFamily: SANS,
        fontSize: 12.5,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        textDecoration: "none",
        padding: "11px 26px",
        borderRadius: 999,
        border: `1px solid ${INK}`,
        background: outline ? "transparent" : INK,
        color: outline ? INK : BG,
      }}
    >
      {children}
    </a>
  );
}

function CeremoniaSection({ demo }: { demo: boolean }) {
  const venue = venueFor(demo);
  return (
    <section style={{ background: BG, padding: "50px 30px 46px", textAlign: "center", position: "relative" }}>
      <Deco
        file="deco-caracol.png"
        width={60}
        style={{ position: "absolute", top: 26, left: 14 }}
      />
      <Reveal>
        <img
          src="/iglesia.gif"
          alt="Ceremonia civil"
          width={92}
          height={92}
          draggable={false}
          style={{ display: "block", margin: "0 auto 8px", filter: GIF_FILTER }}
        />
        <h2 style={{ fontFamily: SCRIPT_SOFT, fontSize: 42, lineHeight: 1, color: INK }}>
          Ceremonia civil
        </h2>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 24,
            color: INK,
            marginTop: 10,
          }}
        >
          4:00 p.m.
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.5, color: INK, marginTop: 8 }}>
          {venue.street}
          <br />
          {venue.city}
        </p>
      </Reveal>

      <Reveal delay={1}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            marginTop: 22,
          }}
        >
          <BotonMapa href={venue.mapsUrl}>Ver en Google Maps</BotonMapa>
          <BotonMapa href={venue.directionsUrl} outline>
            Cómo llegar
          </BotonMapa>
        </div>
      </Reveal>

      <Reveal kind="reveal-scale" delay={2}>
        <div
          style={{
            marginTop: 24,
            background: PAPER,
            padding: 9,
            boxShadow: "0 18px 40px -20px rgba(0,90,130,0.55)",
          }}
        >
          <iframe
            title="Mapa del local"
            src={venue.embedUrl}
            width="100%"
            height="215"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Reveal>
    </section>
  );
}

// ─── Itinerario ──────────────────────────────────────────────────────────────
// Timeline de línea central con los GIFs compartidos recoloreados a azul.

const ITINERARIO = [
  { time: "4:00 p.m.", label: "Ceremonia", img: "/it-ceremonia.gif" },
  { time: "5:00 p.m.", label: "Brindis", img: "/it-brindis.gif" },
  { time: "6:00 p.m.", label: "Comida", img: "/it-comida.gif" },
  { time: "7:00 p.m.", label: "Celebración", img: "/it-celebracion.gif" },
];

function ItinerarioSection() {
  return (
    <section style={{ background: BG, padding: "34px 26px 50px", position: "relative" }}>
      <Reveal>
        <h2
          style={{
            fontFamily: SCRIPT_SOFT,
            fontSize: 42,
            lineHeight: 1,
            color: INK,
            textAlign: "center",
            marginBottom: 26,
          }}
        >
          Itinerario
        </h2>
      </Reveal>

      <div style={{ position: "relative" }}>
        {/* Línea vertical exactamente al centro */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 6,
            bottom: 6,
            left: "50%",
            width: 1,
            marginLeft: -0.5,
            background: `${INK}55`,
          }}
        />
        {ITINERARIO.map((it, i) => {
          const left = i % 2 === 0;
          const texto = (
            <div style={{ textAlign: left ? "right" : "left" }}>
              <div style={{ ...smallCaps, fontSize: 11, color: INK }}>{it.label}</div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 19,
                  color: INK,
                  marginTop: 2,
                }}
              >
                {it.time}
              </div>
            </div>
          );
          const icono = (
            <div style={{ textAlign: left ? "left" : "right" }}>
              <img
                src={it.img}
                alt=""
                aria-hidden="true"
                width={62}
                height={62}
                draggable={false}
                style={{ filter: GIF_FILTER, display: "inline-block" }}
              />
            </div>
          );
          return (
            <Reveal key={it.label} kind={left ? "reveal-right" : "reveal-left"}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 18,
                  position: "relative",
                }}
              >
                {/* Columnas de ancho fijo: con flex:1 el texto largo descentra el punto */}
                <div style={{ width: "calc(50% - 5px)" }}>{left ? texto : icono}</div>
                <div
                  aria-hidden="true"
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: INK,
                    flexShrink: 0,
                  }}
                />
                <div style={{ width: "calc(50% - 5px)" }}>{left ? icono : texto}</div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Deco
        file="deco-peces.png"
        width={64}
        style={{ position: "absolute", right: 12, bottom: 8 }}
      />
    </section>
  );
}

// ─── Código de vestimenta ────────────────────────────────────────────────────

function DressCodeSection() {
  return (
    <section style={{ background: KRAFT, padding: "44px 34px", textAlign: "center", position: "relative" }}>
      <Reveal>
        <img
          src="/dresscode.gif"
          alt="Código de vestimenta"
          width={96}
          height={96}
          draggable={false}
          style={{ display: "block", margin: "0 auto 8px", filter: GIF_FILTER }}
        />
        <h2
          style={{
            fontFamily: SCRIPT_SOFT,
            fontSize: "clamp(30px, 9.2vw, 40px)",
            lineHeight: 1,
            color: INK,
          }}
        >
          Código de vestimenta
        </h2>
        <p style={{ fontFamily: SERIF, fontSize: 20, color: INK, marginTop: 10 }}>
          Casual elegante
        </p>
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 17,
            lineHeight: 1.5,
            color: INK,
            marginTop: 8,
          }}
        >
          Sin blanco · Sin jeans
        </p>
      </Reveal>
      <Deco
        file="deco-sello-caballito.png"
        width={54}
        rotate={-6}
        style={{ position: "absolute", left: 16, bottom: 18 }}
      />
    </section>
  );
}

// ─── Nuestra historia ────────────────────────────────────────────────────────
// Estructura del Canva: título con caracol, párrafo + polaroid a la derecha,
// concha grande, y segunda polaroid con pie escrito a mano.

function HistoriaSection({ photosPath, demo }: { photosPath: string; demo: boolean }) {
  return (
    <section style={{ background: BG, padding: "46px 26px 40px", position: "relative" }}>
      <Reveal>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <Deco file="deco-caracol-2.png" width={46} />
          <h2 style={{ fontFamily: SCRIPT_SOFT, fontSize: 40, lineHeight: 1, color: INK }}>
            nuestra historia
          </h2>
        </div>
      </Reveal>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Reveal kind="reveal-right" style={{ flex: "1 1 0" }}>
          <p style={{ fontFamily: SERIF, fontSize: 17.5, lineHeight: 1.5, color: INK }}>
            Se conocieron en la universidad en 2018, sentados por casualidad en la misma fila
            durante una clase en la que ninguno de los dos quería estar.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 17.5, lineHeight: 1.5, color: INK, marginTop: 10 }}>
            Él le pidió prestado un lapicero. Ella nunca se lo devolvió.
          </p>
        </Reveal>

        <Reveal kind="reveal-left" style={{ flex: "0 0 44%" }}>
          <div style={{ position: "relative" }}>
            <Polaroid
              file="nosotros-1.jpg"
              base={photosPath}
              alt={`${coupleFor(demo).prose} en la orilla`}
              rotate={5}
              ratio="3 / 4"
            />
            <Deco
              file="deco-sello-peces.png"
              width={42}
              style={{ position: "absolute", right: -18, bottom: 24, zIndex: 3 }}
            />
          </div>
        </Reveal>
      </div>

      <Reveal>
        <Deco file="deco-caracol.png" width={104} style={{ margin: "26px 0 6px 6px" }} />
      </Reveal>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginTop: 6 }}>
        <Reveal kind="reveal-right" style={{ flex: "0 0 48%" }}>
          <div style={{ position: "relative" }}>
            <Deco
              file="deco-corazones.png"
              width={92}
              style={{ position: "absolute", top: -12, left: 6, zIndex: 3 }}
            />
            <Polaroid
              file="nosotros-2.jpg"
              base={photosPath}
              alt={`${coupleFor(demo).prose} mirando el mar`}
              caption="Solo una mirada"
              rotate={-4}
              ratio="4 / 3"
            />
            <Deco
              file="deco-sello-peces-azul.png"
              width={44}
              style={{ position: "absolute", right: -16, top: 28, zIndex: 3 }}
            />
          </div>
        </Reveal>

        <Reveal kind="reveal-left" style={{ flex: "1 1 0" }}>
          <p style={{ fontFamily: SERIF, fontSize: 17.5, lineHeight: 1.5, color: INK, textAlign: "right" }}>
            Desde ese día, ninguno de los dos volvió a estar en la misma fila por casualidad —
            siempre buscaron ese lugar el uno al lado del otro. Seis años después, han decidido
            que quieren seguir buscándose para siempre.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Regalos ─────────────────────────────────────────────────────────────────

function RegalosSection() {
  return (
    <section style={{ background: BG, padding: "20px 34px 46px", textAlign: "center", position: "relative" }}>
      <Reveal>
        <img
          src="/regalo.gif"
          alt="Regalos"
          width={88}
          height={88}
          draggable={false}
          style={{ display: "block", margin: "0 auto 6px", filter: GIF_FILTER }}
        />
        <h2 style={{ fontFamily: SCRIPT_SOFT, fontSize: 42, lineHeight: 1, color: INK }}>
          Regalos
        </h2>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 18,
            lineHeight: 1.55,
            color: INK,
            marginTop: 12,
            maxWidth: 300,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Tu presencia es nuestro mejor regalo. Si además quieres tener un detalle con nosotros,
          te dejamos nuestra cuenta.
        </p>
      </Reveal>

      <Reveal delay={1}>
        <div
          style={{
            marginTop: 20,
            background: KRAFT,
            padding: "20px 18px",
            boxShadow: "0 14px 30px -18px rgba(0,90,130,0.5)",
            display: "inline-block",
            minWidth: 210,
          }}
        >
          <div style={{ ...smallCaps, fontSize: 10, color: INK }}>Yape</div>
          <div style={{ fontFamily: SERIF, fontSize: 21, color: INK, marginTop: 6 }}>
            993 092 110
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Comparte tus fotos y videos (Supabase) ──────────────────────────────────

// Panel que reemplaza al formulario cuando la subida está bloqueada (demo, o
// invitación de cliente antes del día de la boda). Ver useUploadGate.
function UploadBlockedCard({ gate }: { gate: Extract<UploadGate, { blocked: true }> }) {
  return (
    <Reveal delay={1}>
      <div
        style={{
          background: PAPER,
          border: `1px dashed ${INK}`,
          padding: "30px 22px",
          marginTop: 24,
          textAlign: "center",
          boxShadow: "0 14px 30px -20px rgba(0,90,130,0.5)",
        }}
      >
        <div style={{ fontSize: 32, lineHeight: 1 }}>
          {gate.kind === "demo" ? (
            <Lock size={32} strokeWidth={1.6} color={INK} />
          ) : (
            <img src="/reloj-arena.gif" alt="Reloj de arena" style={{ width: 32, height: 32 }} />
          )}
        </div>
        <h3 style={{ fontFamily: SCRIPT_SOFT, fontSize: 32, lineHeight: 1.1, color: INK, marginTop: 10 }}>
          {gate.title}
        </h3>
        <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.5, color: INK, marginTop: 10 }}>
          {gate.message}
        </p>
        {gate.whatsapp && (
          <a
            href={gate.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: 18,
              background: INK,
              color: BG,
              fontFamily: SANS,
              fontSize: 12.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "11px 26px",
              borderRadius: 999,
            }}
          >
            Escríbenos por WhatsApp
          </a>
        )}
      </div>
    </Reveal>
  );
}

function PhotoUpload({
  galeriaHref,
  demo,
  invitation,
}: {
  galeriaHref: string;
  demo: boolean;
  invitation: string;
}) {
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
    limitReached,
    closeLimitModal,
  } = useMediaUpload(DESIGN_ID, invitation);
  const { ready, gate } = useUploadGate(demo);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const rejected = items.filter((it) => it.status === "error");
  const selectable = items.filter((it) => it.status !== "error" || it.kind);

  const btnStyle: React.CSSProperties = {
    appearance: "none",
    border: `1px solid ${INK}`,
    cursor: "pointer",
    background: INK,
    color: BG,
    fontFamily: SANS,
    fontSize: 13,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    padding: "11px 28px",
    borderRadius: 999,
  };

  if (uploadDone) {
    return (
      <section style={{ background: BG, padding: "56px 34px", textAlign: "center" }}>
        <h3 style={{ fontFamily: SCRIPT_SOFT, fontSize: 46, lineHeight: 1, color: INK }}>
          ¡Gracias!
        </h3>
        <p style={{ fontFamily: SERIF, fontSize: 18, color: INK, marginTop: 12 }}>
          Tus fotos y videos fueron subidos exitosamente.
        </p>
        <button onClick={reset} style={{ ...btnStyle, marginTop: 22 }}>
          Subir más recuerdos
        </button>
      </section>
    );
  }

  return (
    <section style={{ background: BG, padding: "44px 30px 56px", textAlign: "center", position: "relative" }}>
      <Reveal>
        <img
          src="/camara.gif"
          alt="Cámara fotográfica"
          width={98}
          height={98}
          draggable={false}
          style={{ display: "block", margin: "0 auto 6px", filter: GIF_FILTER }}
        />
        <h2
          style={{
            fontFamily: SCRIPT_SOFT,
            fontSize: "clamp(30px, 9.2vw, 40px)",
            lineHeight: 1.05,
            color: INK,
          }}
        >
          Comparte tus fotos y videos
        </h2>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 18,
            lineHeight: 1.55,
            color: INK,
            marginTop: 12,
            maxWidth: 300,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Tu mirada es parte de nuestra historia. El 12 de Septiembre, ayúdanos a guardar el día
          desde tus ojos.
        </p>
      </Reveal>

      {ready && !gate.blocked && (
        <Reveal delay={1}>
          <div
            style={{
              background: PAPER,
              border: `1px dashed ${INK}`,
              padding: "24px 20px",
              marginTop: 24,
              boxShadow: "0 14px 30px -20px rgba(0,90,130,0.5)",
            }}
          >
            <div style={{ marginBottom: 16, textAlign: "left" }}>
              <label style={{ ...smallCaps, display: "block", fontSize: 10, color: INK, marginBottom: 8 }}>
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
                  border: `1px solid ${INK}55`,
                  fontFamily: SERIF,
                  fontSize: 17,
                  color: INK,
                  background: BG,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ fontFamily: SERIF, fontSize: 18, color: INK }}>
              {selectable.length > 0
                ? `${selectable.length} archivo${selectable.length > 1 ? "s" : ""} seleccionado${selectable.length > 1 ? "s" : ""}`
                : "Sube tus fotos y videos del día"}
            </div>
            <div style={{ ...smallCaps, fontSize: 9.5, color: INK_SOFT, marginTop: 6 }}>
              Fotos hasta 15MB · Videos hasta 500MB · 500MB por invitado
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
              style={{ ...btnStyle, background: "transparent", color: INK, marginTop: 14 }}
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
                    accent={INK}
                  />
                ))}
              </div>
            )}

            {rejected.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  fontFamily: SERIF,
                  fontSize: 14,
                  color: RED_ERR,
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
              <div style={{ marginTop: 12, fontFamily: SERIF, fontSize: 15, color: RED_ERR }}>
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
      )}

      {ready && gate.blocked && <UploadBlockedCard gate={gate} />}

      {limitReached && (
        <UploadLimitModal
          demo={demo}
          onClose={closeLimitModal}
          theme={{
            card: PAPER,
            title: INK,
            text: INK,
            titleFont: SCRIPT_SOFT,
            bodyFont: SERIF,
            titleStyle: { fontSize: 30, lineHeight: 1.1 },
          }}
        />
      )}

      <Reveal delay={2}>
        <div style={{ marginTop: 20 }}>
          {/* Link (no <a>): la navegación client-side mantiene la música sonando */}
          <Link href={galeriaHref} style={{ ...smallCaps, fontSize: 11, color: INK, textDecoration: "none" }}>
            Ver galería de fotos →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

// ─── ¿Nos acompañas? (RSVP) ──────────────────────────────────────────────────

function ConfirmarSection({ demo }: { demo: boolean }) {
  return (
    <section style={{ background: WATER, padding: "46px 34px", textAlign: "center", position: "relative" }}>
      <Deco
        file="deco-sello-peces-azul.png"
        width={48}
        rotate={-8}
        style={{ position: "absolute", left: 18, top: 22 }}
      />
      <Reveal>
        <h2 style={{ fontFamily: SCRIPT_SOFT, fontSize: 44, lineHeight: 1, color: INK }}>
          ¿Nos acompañas?
        </h2>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 18,
            lineHeight: 1.55,
            color: INK,
            marginTop: 12,
            maxWidth: 290,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Confírmanos tu asistencia antes del 25 de julio para reservar tu lugar.
        </p>
        <a
          href={waConfirm(demo)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 20,
            background: INK,
            color: BG,
            fontFamily: SANS,
            fontSize: 13,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            textDecoration: "none",
            padding: "12px 30px",
            borderRadius: 999,
            boxShadow: "0 14px 30px -16px rgba(0,80,115,0.7)",
          }}
        >
          Confirmar asistencia
        </a>
      </Reveal>
      <Deco
        file="deco-estrella.png"
        width={62}
        rotate={-12}
        style={{ position: "absolute", right: 14, bottom: 16 }}
      />
    </section>
  );
}

// ─── Cierre ──────────────────────────────────────────────────────────────────

function CierreSection({
  demo,
  photosPath,
  galeriaHref,
}: {
  demo: boolean;
  photosPath: string;
  galeriaHref: string;
}) {
  return (
    <section style={{ background: BG }}>
      <Reveal style={{ padding: "44px 34px 26px", textAlign: "center" }}>
        <img
          src="/agradecimiento.gif"
          alt="Gracias"
          width={92}
          height={92}
          draggable={false}
          style={{ display: "block", margin: "0 auto 6px", filter: GIF_FILTER }}
        />
        <h2 style={{ fontFamily: SCRIPT_SOFT, fontSize: 42, lineHeight: 1, color: INK }}>
          ¡Te esperamos!
        </h2>
      </Reveal>

      <Reveal kind="reveal-scale">
        <Foto
          file="final.jpg"
          base={photosPath}
          alt={`${coupleFor(demo).prose} caminando por la orilla`}
          ratio="3 / 4"
        />
      </Reveal>

      <div style={{ background: INK, padding: 26, textAlign: "center" }}>
        <div style={{ fontFamily: SCRIPT, fontSize: 38, lineHeight: 1, color: BG }}>
          {coupleFor(demo).amp}
        </div>
        <Link
          href={galeriaHref}
          style={{
            display: "inline-block",
            marginTop: 14,
            ...smallCaps,
            fontSize: 11,
            color: BG,
            textDecoration: "none",
            opacity: 0.9,
          }}
        >
          Ver galería de fotos →
        </Link>
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
        border: "1px solid rgba(255,255,255,0.5)",
        background: "rgba(245,237,231,0.72)",
        boxShadow: "0 14px 35px rgba(0,90,130,0.35)",
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
          border: `1px solid ${INK}`,
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

export default function InvitationCaboAzul({
  demo = false,
  galeriaHref = "/cabo-azul/galeria",
  invitation = DEMO_INVITATION,
  photosPath = DEMO_PHOTOS_PATH,
  musicSrc = MUSIC_SRC,
}: {
  demo?: boolean;
  // Slug de la invitación: 'demo' o el del cliente (p. ej. 'israel-y-marisol').
  // Se guarda en cada foto para que cada boda vea solo las suyas en su galería.
  invitation?: string;
  // Las rutas de clientes pasan su propia galería y sus propios assets
  // (public/cabo-azul/<cliente>/photos y .../music.mp3). Las decoraciones son
  // fijas del diseño y se comparten desde /cabo-azul-demo/.
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
      {!opened && <IntroGate onOpen={handleOpen} photosPath={photosPath} demo={demo} />}
      {opened && <MusicFab playing={playing} onToggle={toggle} />}

      <main style={{ position: "relative", zIndex: 1 }}>
        <PortadaSection opened={opened} photosPath={photosPath} demo={demo} />
        <NosCasamosSection />
        <HistoriaSection photosPath={photosPath} demo={demo} />
        <CountdownSection />
        <CeremoniaSection demo={demo} />
        <ItinerarioSection />
        <DressCodeSection />
        <RegalosSection />
        <PhotoUpload galeriaHref={galeriaHref} demo={demo} invitation={invitation} />
        <ConfirmarSection demo={demo} />
        <CierreSection demo={demo} photosPath={photosPath} galeriaHref={galeriaHref} />
      </main>
    </div>
  );
}
