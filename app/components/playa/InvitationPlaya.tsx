"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMediaUpload } from "@/app/components/shared/useMediaUpload";
import UploadPreview from "@/app/components/shared/UploadPreview";
import { useMusic } from "@/app/components/shared/useMusic";
import { ACCEPT_ATTR } from "@/lib/media";

const DESIGN_ID = "playa";

// Canción del diseño; la galería importa esta constante para que el mismo
// audio siga sonando al navegar entre invitación y galería.
export const MUSIC_SRC = "/Enamorarte_Mil_Veces.mp3";

// Paleta del diseño Playa (tomada del HTML de referencia de Canva)
const BG = "#f6f2ee";
// Tonos alternados por sección para dar dinamismo al scroll (claro ↔ medio)
const BG_MID = "#f0eae4";
const PINK = "#f6e6f2";
const GREEN = "#304c3a";
const BLUE = "#6f8f9d";

// Marcellus reemplaza a "Marcellus" del original; Cormorant italic sustituye a "Lydian Italic"
const BODY = "'Marcellus', 'Lora', Georgia, serif";
const DISPLAY = "'Cormorant Garamond', Georgia, serif";

// Los GIFs decorativos de public/ vienen en tonos oliva/marrón; este filtro
// los lleva al verde #304c3a de Playa sin tocar los archivos (sepia normaliza
// el tono a ~40° y el hue-rotate lo gira hasta ~140°, el matiz de ese verde).
const GIF_FILTER = "sepia(1) saturate(0.9) hue-rotate(100deg) brightness(0.58)";

const WEDDING_ISO = "2026-09-12T16:00:00";
// Coordenadas exactas del local (Av. Circunvalación Norte 404, Huaral)
const COORDS = "-11.489522,-77.206264";
const MAPS_URL = `https://www.google.com/maps?q=${COORDS}`;
const MAPS_DIR_URL = `https://www.google.com/maps/dir/?api=1&destination=${COORDS}`;
const WA_CONFIRM = `https://wa.me/51993092110?text=${encodeURIComponent(
  "¡Hola Israel y Marisol! Confirmo mi asistencia a su matrimonio civil del 12 de septiembre. 🌊"
)}`;

// ─── Scroll reveal (mismas clases CSS globales que el diseño oliva) ──────────

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

// Variante del reveal para la entrada: reutiliza las mismas clases CSS pero se
// dispara cuando el usuario ingresa (prop `active`) en vez de esperar el scroll.
// El IntersectionObserver no sirve aquí: el gate es un overlay fijo y las
// secciones de abajo ya "intersectan" el viewport antes de abrir.
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/* eslint-disable @next/next/no-img-element */

function Tape({
  src = "/playa/deco-monograma.png",
  width = 96,
  rotate = 0,
  style,
}: {
  src?: string;
  width?: number;
  rotate?: number;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      style={{
        width,
        display: "block",
        transform: `rotate(${rotate}deg)`,
        opacity: 0.92,
        pointerEvents: "none",
        // Sombra corta pegada a la cinta: la hace ver adherida y no flotando
        filter: "drop-shadow(0 2px 3px rgba(48,76,58,0.35))",
        zIndex: 2,
        ...style,
      }}
    />
  );
}

function BtnBlue({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block",
        background: BLUE,
        color: "#fdfdfe",
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        textDecoration: "none",
        padding: "12px 34px",
        borderRadius: 4,
        boxShadow: "0 10px 24px -10px rgba(111,143,157,0.7)",
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
    "¡Hola! Me gusta el diseño Playa Tropical y quiero una invitación como esta. 🌊"
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
        background: "rgba(48, 76, 58, 0.92)",
        backdropFilter: "blur(8px)",
        color: "#f8f6f3",
        fontFamily: BODY,
        fontSize: 12,
        letterSpacing: "0.05em",
      }}
    >
      <span>✨ Esta es una demo — ¿Te gusta este diseño?</span>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flexShrink: 0,
          background: BLUE,
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
          color: "#f8f6f3",
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

// ─── Intro (portada de entrada, como el diseño oliva) ────────────────────────

function IntroGate({ onOpen }: { onOpen: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        margin: "auto",
        maxWidth: 430,
        zIndex: 100,
        background: "#1c2620",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: 24,
        textAlign: "center",
      }}
    >
      {/* Fondo desenfocado: el blur va en esta capa (inset negativo + scale para
          que los bordes difuminados no dejen halo) y no sobre el texto */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: -16,
          backgroundImage: "url('/playa/regalos-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(4px)",
          transform: "scale(1.04)",
        }}
      />
      {/* Oscurecimiento para que los nombres se lean sobre la foto */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)" }}
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
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 54,
            lineHeight: 1.1,
            color: "rgb(246, 242, 238)",
            textShadow: "0 2px 18px rgba(0,0,0,0.45)",
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
            background: "rgb(246, 242, 238)",
            color: GREEN,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "13px 36px",
            borderRadius: 4,
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
            color: "rgb(246, 242, 238)",
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

function PortadaSection({ opened }: { opened: boolean }) {
  // Entrada al ingresar: nombres → portada → texto de bienvenida, con stagger.
  // La fecha entra al final de la secuencia (está en el primer viewport, así
  // que el scroll-reveal normal la mostraría de golpe junto con el resto).
  return (
    <section style={{ background: BG, padding: "56px 18px 46px", textAlign: "center" }}>
      <EnterReveal active={opened}>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 52,
            lineHeight: 1.05,
            color: GREEN,
          }}
        >
          Israel &amp; Marisol
        </h1>
      </EnterReveal>
      <EnterReveal active={opened} kind="reveal-scale" delay={180}>
        <div style={{ position: "relative", marginTop: 22 }}>
          <img
            src="/playa/portada.jpg"
            alt="Israel y Marisol en la playa"
            style={{ width: "100%", display: "block", boxShadow: "0 18px 40px -18px rgba(48,76,58,0.45)" }}
          />
          <EnterReveal
            active={opened}
            delay={380}
            style={{ position: "absolute", top: 14, left: 0, right: 0 }}
          >
            <div
              style={{
                ...smallCaps,
                color: BG,
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textShadow: "0 1px 8px rgba(0,0,0,0.35)",
                padding: "0 20px",
              }}
            >
              Estamos emocionados de extenderte esta invitación
            </div>
          </EnterReveal>
        </div>
      </EnterReveal>
      <EnterReveal active={opened} delay={560}>
        <div style={{ ...smallCaps, color: GREEN, fontSize: 16, letterSpacing: "0.12em", marginTop: 30 }}>
          12 · Septiembre · 2026
        </div>
      </EnterReveal>
    </section>
  );
}

// ─── Foto a página completa ──────────────────────────────────────────────────

function FullPhoto({ src, alt, bg = PINK }: { src: string; alt: string; bg?: string }) {
  return (
    <section style={{ background: bg }}>
      <img src={src} alt={alt} style={{ width: "100%", display: "block" }} />
    </section>
  );
}

// ─── Nosotros ────────────────────────────────────────────────────────────────

function NosotrosSection() {
  return (
    <section style={{ background: BG_MID, padding: "56px 34px 70px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <Reveal kind="reveal-scale">
        <div style={{ position: "relative", width: "78%", margin: "0 auto" }}>
          <img
            src="/playa/nosotros-1.jpg"
            alt="Israel y Marisol"
            style={{
              width: "100%",
              aspectRatio: "3 / 4",
              objectFit: "cover",
              // La pareja está en el tercio izquierdo del original apaisado
              objectPosition: "left center",
              display: "block",
              boxShadow: "0 18px 40px -18px rgba(48,76,58,0.45)",
            }}
          />
          <Tape
            src="/playa/deco-rama.png"
            width={100}
            rotate={-5}
            style={{ position: "absolute", top: -13, left: -26 }}
          />
          <Tape
            src="/playa/deco-hojas.png"
            width={100}
            rotate={4}
            style={{ position: "absolute", bottom: -13, right: -24 }}
          />
        </div>
      </Reveal>

      <Reveal delay={1}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontStyle: "italic",
            fontSize: 26,
            color: BLUE,
            marginTop: 42,
          }}
        >
          I &amp; M
        </div>
      </Reveal>

      <Reveal delay={2}>
        <p
          style={{
            fontFamily: BODY,
            fontSize: 16.5,
            lineHeight: 1.75,
            letterSpacing: "0.02em",
            color: GREEN,
            marginTop: 18,
            maxWidth: 300,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Nos cruzamos por primera vez en 2009, quizás demasiado jóvenes para entender lo que
          significaba.
          <br/>
          El tiempo siguió su camino, y nosotros el nuestro.
        </p>
        <p
          style={{
            fontFamily: BODY,
            fontSize: 16.5,
            lineHeight: 1.75,
            letterSpacing: "0.02em",
            color: GREEN,
            marginTop: 18,
            maxWidth: 300,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Pero el universo tenía otros planes, y en 2022 volvimos a encontrarnos... esta vez,
          para quedarnos.
        </p>
      </Reveal>

      <Reveal kind="reveal-scale" delay={2}>
        <div style={{ position: "relative", marginTop: 56, display: "inline-block" }}>
          <img
            src="/playa/nosotros-2.jpg"
            alt="Israel y Marisol"
            style={{
              width: 260,
              aspectRatio: "3 / 4",
              objectFit: "cover",
              display: "block",
              boxShadow: "0 18px 40px -18px rgba(48,76,58,0.45)",
            }}
          />
          <Tape
            src="/playa/deco-monograma.png"
            width={98}
            style={{
              position: "absolute",
              top: -24,
              left: "50%",
              transform: "translateX(-50%) rotate(-3deg)",
            }}
          />
        </div>
      </Reveal>
    </section>
  );
}

// ─── Invitación + cuenta regresiva ───────────────────────────────────────────

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

function InvitacionSection() {
  // Arranca en null y se calcula recién en el cliente: el valor depende de
  // Date.now() y renderizarlo en SSR causa un hydration mismatch (bug del 10 jul).
  const [t, setT] = useState<ReturnType<typeof getTimeLeft> | null>(null);
  useEffect(() => {
    const tick = () => setT(getTimeLeft());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const unit = (value: number, label: string) => (
    <div
      style={{
        minWidth: 52,
        background: "rgba(253,253,254,0.1)",
        borderRadius: 12,
        padding: "10px 4px 8px",
      }}
    >
      <div style={{ fontFamily: BODY, fontSize: 32, lineHeight: 1, color: "#fdfdfe" }}>
        {String(value).padStart(2, "0")}
      </div>
      <div style={{ ...smallCaps, fontSize: 9, color: "#b9cdd6", marginTop: 8 }}>{label}</div>
    </div>
  );

  const sep = (key: string) => (
    <div
      key={key}
      style={{
        fontFamily: BODY,
        fontSize: 26,
        lineHeight: 1,
        color: "rgba(253,253,254,0.4)",
        paddingTop: 3,
      }}
    >
      :
    </div>
  );

  return (
    <section style={{ background: BG, padding: "56px 34px 70px", textAlign: "center" }}>
      <Reveal>
        <h2
          style={{
            fontFamily: DISPLAY,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 38,
            lineHeight: 1.15,
            color: GREEN,
          }}
        >
          Tenemos el honor de invitarte a nuestro matrimonio civil
        </h2>
      </Reveal>

      <Reveal delay={1}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontStyle: "italic",
            fontSize: 26,
            color: BLUE,
            marginTop: 40,
          }}
        >
          Faltan
        </div>
        <div style={{ position: "relative", marginTop: 14 }}>
          <div
            style={{
              position: "relative",
              background: GREEN,
              borderRadius: 18,
              padding: "26px 12px 22px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 18px 40px -18px rgba(48,76,58,0.55)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 7,
                border: "1px solid rgba(253,253,254,0.3)",
                borderRadius: 12,
                pointerEvents: "none",
              }}
            />
            {unit(t?.d ?? 0, "Días")}
            {sep("s1")}
            {unit(t?.h ?? 0, "Hrs")}
            {sep("s2")}
            {unit(t?.m ?? 0, "Min")}
            {sep("s3")}
            {unit(t?.s ?? 0, "Seg")}
          </div>
        </div>
      </Reveal>

      <Reveal kind="reveal-scale" delay={2}>
        <div style={{ position: "relative", width: "88%", margin: "60px auto 0" }}>
          <img
            src="/playa/pareja-2.jpg"
            alt="Israel y Marisol"
            style={{
              width: "100%",
              display: "block",
              boxShadow: "0 18px 40px -18px rgba(48,76,58,0.45)",
            }}
          />
          {/* Cinta adhesiva "pegando" la foto: mitad sobre el borde superior */}
          <Tape
            src="/playa/deco-ave.png"
            width={92}
            style={{
              position: "absolute",
              top: -13,
              left: "50%",
              transform: "translateX(-50%) rotate(-4deg)",
            }}
          />
        </div>
      </Reveal>
    </section>
  );
}

// ─── Ubicación ───────────────────────────────────────────────────────────────

function UbicacionSection() {
  const embed = `https://maps.google.com/maps?q=${COORDS}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const info = (titulo: string, texto: string) => (
    <div style={{ marginTop: 30 }}>
      <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 26, color: GREEN }}>
        {titulo}
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontSize: 15,
          letterSpacing: "0.02em",
          color: GREEN,
          marginTop: 6,
        }}
      >
        {texto}
      </div>
    </div>
  );

  return (
    <section style={{ background: BG_MID, padding: "50px 34px 70px", textAlign: "center" }}>
      <Reveal kind="reveal-scale" delay={1}>
        <div style={{ position: "relative", display: "inline-block", marginTop: 30 }}>
          <div
            style={{
              background: "#fdfdfc",
              padding: 14,
              boxShadow: "0 20px 45px -18px rgba(48,76,58,0.4)",
            }}
          >
            <img
              src="/playa/foto-arco.png"
              alt="Boceto de Israel y Marisol frente al mar"
              style={{ width: 280, display: "block" }}
            />
          </div>
          <Tape
            src="/playa/deco-monograma.png"
            width={92}
            style={{
              position: "absolute",
              top: -24,
              left: "50%",
              transform: "translateX(-50%) rotate(-3deg)",
            }}
          />
          <Tape
            src="/playa/deco-monograma.png"
            width={92}
            rotate={5}
            style={{ position: "absolute", bottom: -14, right: -20 }}
          />
        </div>
      </Reveal>

      <Reveal delay={2}>
        {info("Dirección", "Av. Circunvalación Norte 404 - Huaral")}
        {info("Hora", "4:00 p.m.")}
      </Reveal>

      <Reveal delay={3}>
        <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 26, color: GREEN, marginTop: 34 }}>
          ¿Cómo llegar?
        </div>
      </Reveal>

      <Reveal kind="reveal-scale" delay={3}>
        <div
          style={{
            background: "#fdfdfc",
            padding: 10,
            boxShadow: "0 20px 45px -18px rgba(48,76,58,0.4)",
            marginTop: 20,
          }}
        >
          <iframe
            title="Mapa"
            src={embed}
            width="100%"
            height="220"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Reveal>

      <Reveal delay={3}>
        <div
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <BtnBlue href={MAPS_URL}>Ver en Google Maps</BtnBlue>
          <BtnBlue href={MAPS_DIR_URL}>Cómo llegar</BtnBlue>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Itinerario ──────────────────────────────────────────────────────────────
// Mismo timeline alternado que el diseño oliva, pero con la paleta y
// tipografías de Playa. Los horarios parten de la ceremonia de las 4:00 p.m.

function ItinerarioSection() {
  const items = [
    { time: "4:00 p.m.", label: "Ceremonia civil", img: "/it-ceremonia.gif" },
    { time: "5:00 p.m.", label: "Brindis", img: "/it-brindis.gif" },
    { time: "6:00 p.m.", label: "Comida", img: "/it-comida.gif" },
    { time: "7:00 p.m.", label: "Celebración", img: "/it-celebracion.gif" },
  ];

  return (
    <section
      style={{
        background: BG,
        padding: "56px 26px 70px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Tape
        src="/playa/ramo.png"
        width={120}
        rotate={8}
        style={{ position: "absolute", top: 14, right: -46 }}
      />
      <Tape
        src="/playa/ramo.png"
        width={120}
        style={{
          position: "absolute",
          bottom: 20,
          left: -46,
          // Espejado para que no se vea idéntico al de arriba
          transform: "scaleX(-1) rotate(6deg)",
        }}
      />

      <Reveal>
        <h2
          style={{
            fontFamily: DISPLAY,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 38,
            color: GREEN,
          }}
        >
          Itinerario
        </h2>
      </Reveal>

      <div style={{ position: "relative", marginTop: 36 }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            width: 2,
            transform: "translateX(-50%)",
            background: BLUE,
            opacity: 0.5,
          }}
        />
        {items.map((item, i) => {
          const left = i % 2 === 0;
          const card = (
            <div
              style={{
                background: "#ffffff",
                border: `1px solid ${BLUE}44`,
                boxShadow: "0 14px 30px -16px rgba(48,76,58,0.4)",
                padding: "16px 12px",
              }}
            >
              <img
                src={item.img}
                alt={item.label}
                width={64}
                height={64}
                style={{ display: "block", margin: "0 auto", filter: GIF_FILTER }}
              />
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontStyle: "italic",
                  fontSize: 21,
                  color: GREEN,
                  marginTop: 8,
                }}
              >
                {item.label}
              </div>
              <div style={{ ...smallCaps, fontSize: 10, color: BLUE, marginTop: 6 }}>
                {item.time}
              </div>
            </div>
          );
          return (
            <Reveal key={item.label} kind={left ? "reveal-left" : "reveal-right"} delay={1}>
              <div
                style={{
                  position: "relative",
                  display: "grid",
                  gridTemplateColumns: "1fr 40px 1fr",
                  alignItems: "center",
                  marginBottom: i === items.length - 1 ? 0 : 28,
                }}
              >
                <div>{left && card}</div>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#ffffff",
                    border: `3px solid ${GREEN}`,
                    boxShadow: `0 0 0 4px ${BG}`,
                    margin: "0 auto",
                  }}
                />
                <div>{!left && card}</div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ─── Código de vestimenta ────────────────────────────────────────────────────

function DressCodeSection() {
  return (
    <section style={{ background: BG_MID, padding: "56px 34px 70px", textAlign: "center" }}>
      <Reveal>
        <img
          src="/dresscode.gif"
          alt="Código de vestimenta"
          width={110}
          height={110}
          style={{ display: "block", margin: "0 auto", filter: GIF_FILTER }}
        />
      </Reveal>
      <Reveal delay={1}>
        <h2
          style={{
            fontFamily: DISPLAY,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 38,
            lineHeight: 1.15,
            color: GREEN,
            marginTop: 10,
          }}
        >
          Código de vestimenta
        </h2>
      </Reveal>
      <Reveal delay={2}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontStyle: "italic",
            fontSize: 26,
            color: BLUE,
            marginTop: 16,
          }}
        >
          Casual elegante
        </div>
        <p
          style={{
            fontFamily: BODY,
            fontSize: 16,
            lineHeight: 1.7,
            letterSpacing: "0.02em",
            color: GREEN,
            marginTop: 14,
            maxWidth: 300,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Ven cómodo, ven elegante.
          <br />
          Lo importante es que estés.
        </p>
      </Reveal>
      <Reveal delay={3}>
        <div
          style={{
            ...smallCaps,
            marginTop: 22,
            display: "flex",
            justifyContent: "center",
            gap: 20,
            fontSize: 11,
            color: BLUE,
          }}
        >
          <span>• Sin blanco</span>
          <span>• Sin jeans</span>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Regalos ─────────────────────────────────────────────────────────────────

function RegalosSection() {
  return (
    <section style={{ position: "relative", background: "#000", overflow: "hidden" }}>
      <img
        src="/playa/regalos-bg.jpg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.8,
        }}
      />
      <div style={{ position: "relative", padding: "60px 34px 70px", textAlign: "left" }}>
        <Reveal>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 44,
              color: BG,
            }}
          >
            Regalos
          </h2>
          <p
            style={{
              fontFamily: DISPLAY,
              fontStyle: "italic",
              fontSize: 19,
              color: BG,
              marginTop: 16,
            }}
          >
            Lo más valioso para nosotros es tenerte presente en este día.
          </p>
          <p
            style={{
              fontFamily: BODY,
              fontSize: 15,
              lineHeight: 1.65,
              letterSpacing: "0.02em",
              color: BG,
              marginTop: 14,
            }}
          >
            Pero si deseas hacernos un regalo, con mucho cariño lo recibiremos a través de:
          </p>
        </Reveal>

        <Reveal delay={1}>
          <div
            style={{
              fontFamily: BODY,
              fontSize: 15,
              lineHeight: 1.65,
              letterSpacing: "0.02em",
              color: BG,
              marginTop: 22,
            }}
          >
            <p>Cuenta Simple Soles Interbank: 8983327160054</p>
            <p style={{ marginTop: 14 }}>Cuenta Interbancaria Interbank: 00389801332716005445</p>
          </div>
        </Reveal>

        <Reveal kind="reveal-scale" delay={2}>
          <img
            src="/playa/qr-yape.png"
            alt="QR de Yape de Israel"
            style={{ width: 220, display: "block", margin: "26px auto 0" }}
          />
          <p
            style={{
              ...smallCaps,
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "none",
              fontFamily: DISPLAY,
              fontStyle: "italic",
              color: BG,
              textAlign: "center",
              marginTop: 10,
            }}
          >
            O también puedes escanear este QR para yape.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Comparte tus fotos y videos (Supabase) ──────────────────────────────────

function PhotoUpload() {
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
    background: BLUE,
    color: "#fdfdfe",
    fontFamily: DISPLAY,
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "11px 30px",
    borderRadius: 4,
  };

  if (uploadDone) {
    return (
      <section style={{ background: BG, padding: "60px 34px", textAlign: "center" }}>
        <h3 style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 400, fontSize: 40, color: GREEN }}>
          ¡Gracias!
        </h3>
        <p style={{ fontFamily: BODY, fontSize: 15.5, color: BLUE, marginTop: 12 }}>
          Tus fotos y videos fueron subidos exitosamente.
        </p>
        <button onClick={reset} style={{ ...btnStyle, marginTop: 24 }}>
          Subir más recuerdos
        </button>
      </section>
    );
  }

  return (
    <section style={{ background: BG, padding: "56px 34px 70px", textAlign: "center" }}>
      <Reveal>
        <img
          src="/camara.gif"
          alt="Cámara fotográfica"
          width={110}
          height={110}
          style={{ display: "block", margin: "0 auto 12px", filter: GIF_FILTER }}
        />
        <h2
          style={{
            fontFamily: DISPLAY,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 38,
            color: GREEN,
          }}
        >
          Sube tus fotos y videos
        </h2>
        <p
          style={{
            fontFamily: BODY,
            fontSize: 15.5,
            lineHeight: 1.7,
            letterSpacing: "0.02em",
            color: GREEN,
            marginTop: 14,
            maxWidth: 300,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          El 12 de septiembre, ayúdanos a guardar cada recuerdo: sube aquí las fotos y videos que
          tomes.
        </p>
      </Reveal>

      <Reveal delay={1}>
        <div
          style={{
            background: "#ffffff",
            border: `1px dashed ${BLUE}`,
            padding: "26px 20px",
            marginTop: 26,
          }}
        >
          <div style={{ marginBottom: 18, textAlign: "left" }}>
            <label style={{ ...smallCaps, display: "block", fontSize: 10, color: BLUE, marginBottom: 8 }}>
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
                border: `1px solid ${BLUE}55`,
                borderRadius: 4,
                fontFamily: BODY,
                fontSize: 15,
                color: GREEN,
                background: BG,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ fontFamily: BODY, fontSize: 16, color: GREEN }}>
            {selectable.length > 0
              ? `${selectable.length} archivo${selectable.length > 1 ? "s" : ""} seleccionado${selectable.length > 1 ? "s" : ""}`
              : "Sube tus fotos y videos del día"}
          </div>
          <div style={{ ...smallCaps, fontSize: 9.5, color: BLUE, marginTop: 6 }}>
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
              color: BLUE,
              border: `1px solid ${BLUE}`,
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
                  accent={BLUE}
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
            href="/playa/galeria"
            style={{ ...smallCaps, fontSize: 11, color: BLUE, textDecoration: "none" }}
          >
            Ver galería de fotos →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Confirmar asistencia ────────────────────────────────────────────────────

function ConfirmarSection() {
  return (
    <section style={{ background: BG_MID, padding: "60px 34px 70px", textAlign: "center" }}>
      <Reveal>
        <h2
          style={{
            fontFamily: DISPLAY,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 38,
            lineHeight: 1.15,
            color: BLUE,
          }}
        >
          Por favor confirme su asistencia antes del
          <br />
          01/09/2026
        </h2>
      </Reveal>
      <Reveal kind="reveal-scale" delay={1}>
        <img
          src="/playa/sobre-confirmar.png"
          alt="Perritos de Israel y Marisol"
          style={{ width: 270, display: "block", margin: "26px auto 0" }}
        />
      </Reveal>
      <Reveal delay={2}>
        <div style={{ marginTop: 28 }}>
          <BtnBlue href={WA_CONFIRM}>Confirmar</BtnBlue>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

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
        background: "rgba(246,242,238,0.55)",
        boxShadow: "0 14px 35px rgba(48,76,58,0.35)",
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
          border: `1px solid ${BLUE}`,
          opacity: playing ? 1 : 0,
          pointerEvents: "none",
          animation: playing ? "pulse-ring 1.4s infinite" : "none",
        }}
      />
      {playing ? (
        <svg viewBox="0 0 24 24" width="20" height="20" fill={GREEN}>
          <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="20" height="20" fill={GREEN}>
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      )}
    </button>
  );
}

export default function InvitationPlaya({ demo = false }: { demo?: boolean }) {
  const [opened, setOpened] = useState(false);
  const { playing, play, toggle } = useMusic(MUSIC_SRC);

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
        <PortadaSection opened={opened} />
        {/* Asoma en el primer viewport: entra al final de la secuencia de
            ingreso en vez de aparecer de golpe (no tiene scroll-reveal propio) */}
        <EnterReveal active={opened} delay={760}>
          <FullPhoto src="/playa/pareja-1.jpg" alt="Israel y Marisol" />
        </EnterReveal>
        <NosotrosSection />
        <InvitacionSection />
        <UbicacionSection />
        <ItinerarioSection />
        <DressCodeSection />
        <RegalosSection />
        <PhotoUpload />
        <ConfirmarSection />
        <FullPhoto src="/playa/final.jpg" alt="Israel y Marisol frente al mar" bg={BG} />

        <footer
          style={{
            padding: "30px 28px 44px",
            textAlign: "center",
            background: BG,
          }}
        >
          <div style={{ ...smallCaps, fontSize: 10, color: BLUE }}>
            Israel &amp; Marisol · Huaral 2026
          </div>
          <Link
            href="/playa/galeria"
            style={{
              ...smallCaps,
              color: GREEN,
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
