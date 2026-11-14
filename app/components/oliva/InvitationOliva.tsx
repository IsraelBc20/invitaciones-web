"use client";

// Diseño Oliva — jardín / hobbit (rediseño 12 nov 2026).
// Lo usan /oliva (demo, con banner) y /oliva/israel-y-marisol (cliente).
// Todo con estilos inline; las imágenes salen de `photosPath` y, si el archivo
// no existe ahí (la carpeta del cliente arranca vacía), caen a las del demo.

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, Clock, MapPin, Music, Sparkles, UtensilsCrossed, Wine } from "lucide-react";
import { useMusic } from "@/app/components/shared/useMusic";
import { venueFor } from "@/lib/venue";
import { coupleFor } from "@/lib/couple";
import WhatsAppButton from "@/app/components/shared/WhatsAppButton";

const DESIGN_ID = "oliva";

// Assets del DEMO (/oliva). La galería importa MUSIC_SRC y MusicFab para que
// la misma canción siga sonando al navegar entre invitación y galería.
export const MUSIC_SRC = "/oliva-demo/music.mp3";
export const DEMO_PHOTOS_PATH = "/oliva-demo/photos";

// ─── Paleta y fuentes ────────────────────────────────────────────────────────

const BG = "#f5e6c8";
const GREEN_DARK = "#2d5a1b";
const GREEN = "#4a7c35";
const TERRACOTA = "#c4714a";
const TEXT = "#3a2a1a";
// Azul plano de fondo-cielo-2.png (muestreado), para que no se vea la costura
// entre el cielo y la foto de cierre.
const SKY = "#108dfb";

// Toda la invitación va en CalmíusSans High (14 nov 2026; antes el cierre
// usaba Perandory y los campos DM Sans). @font-face en globals.css.
const CALM_FONT = "'CalmíusSans High', 'Playfair Display', serif";

// Datos del evento. Por ahora el demo y el cliente comparten fecha y horarios;
// la dirección sí cambia (venueFor: las demos muestran la Plaza de Armas de
// Lima, solo la ruta de cliente lleva el local real).
const FECHA = "Septiembre 12, 2026";
const HORA = "4:00 PM";
const WHATSAPP = "51993092110";

const ITINERARIO = [
  { file: "icono-anillos.png", hora: "4:00pm", nombre: "Ceremonia", Icon: Sparkles, gif: false },
  { file: "it-brindis.gif", hora: "4:30pm", nombre: "Hora del brindis", Icon: Wine, gif: true },
  { file: "it-comida.gif", hora: "5:00pm", nombre: "Hora de la comida", Icon: UtensilsCrossed, gif: true },
  { file: "it-celebracion.gif", hora: "6:00pm", nombre: "Baile", Icon: Music, gif: true },
];

// Tiñe los GIF del itinerario de #456b3e. Los GIF tienen trazo gris, no negro:
// brightness(0) los lleva primero a negro, que es de donde parte el resto del
// filtro. icono-anillos.png ya viene verde y no lo lleva.
const GIF_FILTER =
  "brightness(0) saturate(100%) invert(37%) sepia(28%) saturate(534%) hue-rotate(74deg) brightness(89%) contrast(89%)";

const COLORES = [
  { hex: "#1a2744", nombre: "Midnight Navy" },
  { hex: "#7a9cb5", nombre: "Fresco Blue" },
  { hex: "#c08457", nombre: "Terracotta" },
  { hex: "#6b7348", nombre: "Olive Green" },
  { hex: "#c9a84c", nombre: "Antique Gold" },
];

// ─── Imagen con respaldo ─────────────────────────────────────────────────────
// Prueba `photosPath/<file>` y, si falla, la misma del demo. Si tampoco existe
// muestra `fallback` (o nada).

function GardenImg({
  photosPath,
  file,
  alt = "",
  style,
  fallback = null,
  loading = "lazy",
}: {
  photosPath: string;
  file: string;
  alt?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
  loading?: "lazy" | "eager";
}) {
  const sources = [`${photosPath}/${file}`];
  if (photosPath !== DEMO_PHOTOS_PATH) sources.push(`${DEMO_PHOTOS_PATH}/${file}`);
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLImageElement>(null);

  // Si la imagen falló antes de que React hidratara, onError ya no dispara:
  // se revisa al montar.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setIdx((i) => i + 1);
  }, [idx]);

  if (idx >= sources.length) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={sources[idx]}
      alt={alt}
      loading={loading}
      draggable={false}
      onError={() => setIdx((i) => i + 1)}
      style={{ display: "block", ...style }}
    />
  );
}

// ─── Reveal (clases .reveal de globals.css) ──────────────────────────────────

function Reveal({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""}`} style={style}>
      {children}
    </div>
  );
}

// ─── Hoja (para el "&" de la portada) ────────────────────────────────────────

function Leaf({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="24"
      height="14"
      viewBox="0 0 40 22"
      aria-hidden="true"
      style={{ display: "block", margin: "0 8px", transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path d="M1 11 H8" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 11 C 14 1, 29 0, 39 11 C 29 22, 14 21, 7 11 Z" fill={GREEN} />
    </svg>
  );
}

// ─── Botón flotante de música (lo importa también la galería) ────────────────

export function MusicFab({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <button
      className={`music-fab ${playing ? "is-on" : "is-off"}`}
      onClick={onToggle}
      aria-label={playing ? "Pausar música" : "Reproducir música"}
      style={{ right: "max(18px, calc(50vw - 215px + 18px))" }}
    >
      <span className="ring" />
      {playing ? (
        <svg viewBox="0 0 24 24">
          <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24">
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      )}
    </button>
  );
}

async function fileExists(src: string) {
  try {
    const r = await fetch(src, { method: "HEAD" });
    const type = r.headers.get("content-type") ?? "";
    return r.ok && !type.includes("text/html");
  } catch {
    return false;
  }
}

/**
 * La canción a usar: la de `src` si existe y, si no (la carpeta del cliente
 * arranca vacía), la del demo. null mientras se comprueba o si no hay ninguna;
 * sin canción no se muestra el FAB.
 */
function useMusicSrc(src: string) {
  const [found, setFound] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      for (const s of src === MUSIC_SRC ? [src] : [src, MUSIC_SRC]) {
        if (await fileExists(s)) {
          if (alive) setFound(s);
          return;
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [src]);
  return found;
}

/**
 * Sin pantalla de entrada no hay un botón que arranque la canción, y los
 * navegadores no dejan sonar audio sin un gesto del usuario. Se intenta al
 * cargar (algunos lo permiten) y, si no, con el primer toque, clic o tecla en
 * cualquier parte. Una vez que sonó no se vuelve a forzar: si el invitado la
 * pausa con el FAB, queda pausada. Los toques sobre el FAB se ignoran para
 * que su propio toggle no la pause en el mismo gesto.
 */
function useAutoStartMusic(src: string | null, playing: boolean, play: () => void) {
  const started = useRef(false);
  useEffect(() => {
    if (playing) started.current = true;
    if (!src || started.current) return;
    play();
    const events = ["pointerdown", "touchend", "click", "keydown"] as const;
    const onGesture = (e: Event) => {
      if ((e.target as Element | null)?.closest?.(".music-fab")) return;
      play();
    };
    events.forEach((ev) => window.addEventListener(ev, onGesture, { capture: true, passive: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, onGesture, { capture: true }));
    // play cambia en cada render; basta con re-armar al cambiar src o playing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, playing]);
}

// ─── Botones ─────────────────────────────────────────────────────────────────

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: TERRACOTA,
  color: "#ffffff",
  border: 0,
  borderRadius: 50,
  padding: "13px 28px",
  fontFamily: CALM_FONT,
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: "0.02em",
  textDecoration: "none",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(196, 113, 74, 0.3)",
};

// ─── 1. Portada ──────────────────────────────────────────────────────────────
// Se ve directo al entrar, sin pantalla de "Abrir invitación" (13 nov 2026).

function PortadaSection({ demo, photosPath }: { demo: boolean; photosPath: string }) {
  const couple = coupleFor(demo);
  const venue = venueFor(demo);
  // Cliente: "Huaral - Lima". Demo: la ciudad ya es Lima, no se repite.
  const ciudad = venue.city === "Lima" ? "Lima" : `${venue.city} - Lima`;
  const nameStyle: React.CSSProperties = {
    fontFamily: CALM_FONT,
    fontSize: "clamp(44px, 12vw, 64px)",
    color: GREEN_DARK,
    letterSpacing: 2,
    textTransform: "uppercase",
    lineHeight: 1,
    margin: 0,
    fontWeight: "normal",
  };

  return (
    <section style={{ background: BG }}>
      <div style={{ position: "relative" }}>
        <GardenImg
          photosPath={photosPath}
          file="portada-fondo.png"
          loading="eager"
          style={{ width: "100%" }}
        />
        <GardenImg
          photosPath={photosPath}
          file="portada-pareja.png"
          alt={couple.amp}
          loading="eager"
          style={{
            position: "absolute",
            zIndex: 2,
            bottom: 0,
            left: "45%",
            transform: "translateX(-50%)",
            width: "60%",
            maxWidth: 260,
          }}
        />
        {/* Funde la arena del dibujo con el beige del fondo. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 60,
            background: `linear-gradient(to bottom, rgba(245,230,200,0), ${BG})`,
            zIndex: 1,
          }}
        />
      </div>

      <div style={{ textAlign: "center", padding: "0 24px 28px" }}>
        <p
          style={{
            fontFamily: CALM_FONT,
            fontSize: "clamp(20px, 5.5vw, 28px)",
            color: GREEN_DARK,
            margin: "20px 0 12px",
          }}
        >
          ¡Nos casamos!
        </p>
        <h1 style={nameStyle}>{couple.first}</h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "6px 0",
          }}
        >
          <Leaf flip />
          <span
            style={{
              fontFamily: CALM_FONT,
              fontSize: "clamp(32px, 8vw, 44px)",
              color: GREEN_DARK,
              lineHeight: 1,
            }}
          >
            &amp;
          </span>
          <Leaf />
        </div>
        <h1 style={nameStyle}>{couple.second}</h1>

        <p
          style={{
            fontFamily: CALM_FONT,
            fontSize: "clamp(14px, 4vw, 18px)",
            color: TEXT,
            margin: "16px 0 0",
          }}
        >
          {FECHA}
        </p>
        <p
          style={{
            fontFamily: CALM_FONT,
            fontSize: "clamp(13px, 3.5vw, 16px)",
            color: TEXT,
            margin: "4px 0 0",
          }}
        >
          {ciudad}
        </p>
      </div>

      {/* La última fila de portada-casita.png es casi transparente y dejaba una línea
          clara contra "¡Estás invitado!": se recortan 2px. */}
      <div style={{ overflow: "hidden" }}>
        <GardenImg
          photosPath={photosPath}
          file="portada-casita.png"
          style={{ width: "100%", marginBottom: -2 }}
        />
      </div>
    </section>
  );
}

// ─── 2. ¡Estás invitado! (detalles) ──────────────────────────────────────────

const CREAM = "#f1deb3";

// Pasto como fondo CSS (repeat-y), compartido por "¡Estás invitado!" y el
// itinerario (13 nov 2026) para que no haya cortes de verde plano. Si la
// carpeta del cliente no trae fondo-grass.png, queda a la vista la capa del demo.
function grassBackground(photosPath: string): React.CSSProperties {
  return {
    backgroundImage: [photosPath, DEMO_PHOTOS_PATH]
      .filter((p, i, all) => all.indexOf(p) === i)
      .map((p) => `url(${p}/fondo-grass.png)`)
      .join(", "),
    backgroundSize: "100% auto",
    backgroundRepeat: "repeat-y",
    backgroundColor: GREEN_DARK,
  };
}

function InvitadoSection({ demo, photosPath }: { demo: boolean; photosPath: string }) {
  const venue = venueFor(demo);
  const rows = [
    { Icon: CalendarDays, text: FECHA },
    { Icon: Clock, text: HORA },
    { Icon: MapPin, text: `${venue.street}, ${venue.city}` },
  ];
  const line: React.CSSProperties = {
    border: 0,
    borderTop: `1px solid ${CREAM}`,
    opacity: 0.5,
    margin: 0,
  };

  return (
    <section
      style={{
        ...grassBackground(photosPath),
        // Abajo 8px y no 40: el itinerario va pegado al botón "Ver en mapa".
        padding: "40px 24px 8px",
        textAlign: "center",
      }}
    >
      <Reveal>
        <h2
          style={{
            fontFamily: CALM_FONT,
            fontSize: "clamp(32px, 8.5vw, 44px)",
            color: CREAM,
            fontWeight: "bold",
            margin: "0 0 24px",
          }}
        >
          ¡Estás invitado!
        </h2>
        <div style={{ maxWidth: 360, margin: "0 auto" }}>
          {rows.map(({ Icon, text }) => (
            <div key={text}>
              <hr style={line} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  padding: "14px 0",
                  fontFamily: CALM_FONT,
                  fontSize: "clamp(16px, 4.5vw, 20px)",
                  color: CREAM,
                }}
              >
                <Icon size={24} color={CREAM} aria-hidden="true" style={{ flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            </div>
          ))}
          <hr style={line} />
        </div>
        <a
          href={venue.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 24,
            background: "#f9a094",
            color: "#000000",
            fontFamily: CALM_FONT,
            fontSize: "clamp(18px, 5vw, 22px)",
            fontWeight: "bold",
            borderRadius: 50,
            padding: "16px 40px",
            textDecoration: "none",
          }}
        >
          Ver en mapa
        </a>
      </Reveal>
    </section>
  );
}

// ─── 3. Itinerario ───────────────────────────────────────────────────────────
// itinerario-fondo-luces.png (425×873) es un óvalo beige con la guirnalda ya
// dibujada. El óvalo va del ~12% al 100% del alto y las luces lo cruzan entre
// el 11% y el 24%, por eso el título va debajo de ellas. Los porcentajes del
// título y de la lista están medidos sobre ese PNG: si se cambia, reajustar.

function ItinerarioSection({ photosPath }: { photosPath: string }) {
  return (
    <section
      style={{
        ...grassBackground(photosPath),
        padding: "8px 0 40px 0",
      }}
    >
      <Reveal>
        <div style={{ position: "relative", width: "100%", margin: 0 }}>
          <GardenImg
            photosPath={photosPath}
            file="itinerario-fondo-luces.png"
            style={{ width: "100%" }}
          />
          <h2
            style={{
              position: "absolute",
              top: "24.5%",
              left: "50%",
              transform: "translateX(-50%)",
              margin: 0,
              fontFamily: CALM_FONT,
              fontSize: "clamp(32px, 8.5vw, 48px)",
              color: GREEN_DARK,
              fontWeight: "normal",
              textAlign: "center",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            Itinerario
          </h2>

          <ol
            style={{
              position: "absolute",
              top: "31%",
              bottom: "10%",
              left: "17%",
              right: "8%",
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {ITINERARIO.map(({ file, hora, nombre, Icon, gif }) => (
              <li
                key={file}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <GardenImg
                  photosPath={photosPath}
                  file={file}
                  alt=""
                  style={{
                    width: 70,
                    height: 70,
                    objectFit: "contain",
                    flexShrink: 0,
                    filter: gif ? GIF_FILTER : undefined,
                  }}
                  fallback={
                    <span
                      style={{
                        width: 70,
                        height: 70,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={44} color={GREEN_DARK} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                  }
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontFamily: CALM_FONT,
                      fontSize: "clamp(24px, 6vw, 30px)",
                      color: GREEN_DARK,
                      lineHeight: 1.1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {hora}
                  </span>
                  <span
                    style={{
                      fontFamily: CALM_FONT,
                      fontSize: "clamp(15px, 4vw, 18px)",
                      color: TEXT,
                      lineHeight: 1.25,
                    }}
                  >
                    {nombre}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Separador de flores (itinerario → vestimenta) ───────────────────────────
// separador-flores.png (425×238) es transparente y solo en su fila ~125 los
// arbustos cubren el 100% del ancho. Va solapado sobre las dos secciones sin
// ocupar lugar propio: los márgenes (en % del ancho, así escalan con el PNG)
// suman su alto exacto y ponen la unión verde/azul justo en esa fila, que la
// tapa. Si se cambia el PNG, volver a medir esa fila.

function SeparadorFlores({ photosPath }: { photosPath: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        zIndex: 2,
        marginTop: "-29.4%",
        marginBottom: "-26.6%",
        pointerEvents: "none",
      }}
    >
      <GardenImg photosPath={photosPath} file="separador-flores.png" style={{ width: "100%" }} />
    </div>
  );
}

// ─── 4. Código de vestimenta ─────────────────────────────────────────────────
// Tres capas (13 nov 2026): fondo-cielo-1.png como fondo CSS de la sección →
// vestimenta-fondo.png (píldora beige, 389×806) → contenido centrado encima.

const GRIS = "#545454";

function VestimentaSection({ photosPath }: { photosPath: string }) {
  const cielo = [photosPath, DEMO_PHOTOS_PATH]
    .filter((p, i, all) => all.indexOf(p) === i)
    .map((p) => `url(${p}/fondo-cielo-1.png)`)
    .join(", ");

  return (
    <section
      style={{
        position: "relative",
        backgroundImage: cielo,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: SKY,
        padding: "40px 0",
      }}
    >
      <Reveal>
        <div style={{ position: "relative", width: "90%", maxWidth: 400, margin: "0 auto" }}>
          <GardenImg photosPath={photosPath} file="vestimenta-fondo.png" style={{ width: "100%" }} />

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontFamily: CALM_FONT,
                fontSize: "clamp(32px, 8.5vw, 46px)",
                color: "#000000",
                fontWeight: "normal",
                lineHeight: 1.1,
                margin: "0 0 14px",
              }}
            >
              Código
              <br />
              de vestimenta
            </h2>
            <p
              style={{
                fontFamily: CALM_FONT,
                fontSize: "clamp(16px, 4.5vw, 20px)",
                color: GRIS,
                fontWeight: "normal",
                lineHeight: 1.35,
                margin: "0 0 22px",
              }}
            >
              Nos encantaría verte
              <br />
              con cualquiera de
              <br />
              estos colores
            </p>

            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {COLORES.map(({ hex, nombre }) => (
                <li
                  key={hex}
                  style={{
                    width: 52,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: hex,
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
                    }}
                  />
                  {/* "Midnight Navy" → "Midnight" / "Navy" */}
                  <span
                    style={{
                      fontFamily: CALM_FONT,
                      fontSize: "clamp(11px, 3vw, 13px)",
                      color: GRIS,
                      fontWeight: "normal",
                      lineHeight: 1.2,
                    }}
                  >
                    {nombre.split(" ").map((w, i) => (
                      <span key={i} style={{ display: "block" }}>
                        {w}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>

            <GardenImg
              photosPath={photosPath}
              file="vestimenta.png"
              alt="Vestido y traje de ejemplo"
              style={{ width: "80%", maxWidth: 300, margin: "22px auto 0" }}
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── 5. Reserva (RSVP por WhatsApp) ──────────────────────────────────────────

// Textos claros directo sobre el cielo, sin tarjeta (13 nov 2026).
const LIGHT = "#efefef";
// Sombra suave para que el texto claro se lea sobre las nubes.
const LIGHT_SHADOW = "0 1px 4px rgba(0, 40, 90, 0.35)";

type Asistencia = "" | "si" | "no";

// Al enviar (14 nov 2026): el formulario se desvanece (0,4s) y en su lugar
// aparece la confirmación. En la demo no se manda nada; en la ruta cliente,
// 600ms después de que aparece el mensaje se abre WhatsApp con los datos.
const FADE_MS = 400;
const WA_DELAY_MS = 600;
// Para la confirmación: "Septiembre 12, 2026" → "Septiembre 12 de 2026".
const FECHA_TEXTO = FECHA.replace(", ", " de ");

type Fase = "form" | "saliendo" | "enviado";

function ReservaSection({ demo }: { demo: boolean }) {
  const [nombre, setNombre] = useState("");
  const [rsvp, setRsvp] = useState<Asistencia>("");
  const [dieta, setDieta] = useState("");
  const [cancion, setCancion] = useState("");
  const [errors, setErrors] = useState<{ nombre?: string; rsvp?: string }>({});
  const [fase, setFase] = useState<Fase>("form");
  // Enlace de WhatsApp si el navegador bloqueó la ventana (se abre fuera del
  // gesto del clic, por el retraso): se ofrece como botón en el mensaje.
  const [waBloqueado, setWaBloqueado] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const waLink = (n: string) => {
    const prose = coupleFor(demo).prose;
    const lines = [
      rsvp === "si"
        ? `Hola, confirmo mi asistencia a la boda de ${prose} el 12 de septiembre. Mi nombre es ${n}.`
        : `Hola, lamentablemente no podré asistir a la boda de ${prose}. Mi nombre es ${n}.`,
    ];
    if (dieta.trim()) lines.push(`Requerimiento dietético: ${dieta.trim()}`);
    if (cancion.trim()) lines.push(`Canción favorita: ${cancion.trim()}`);
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fase !== "form") return;
    const n = nombre.trim();
    const next: typeof errors = {};
    if (!n) next.nombre = "Por favor escribe tu nombre y apellido";
    if (!rsvp) next.rsvp = "Cuéntanos si nos acompañarás";
    setErrors(next);
    if (next.nombre || next.rsvp) return;

    // La demo no envía nada a ningún lado.
    const link = demo ? null : waLink(n);
    setFase("saliendo");
    timers.current.push(
      window.setTimeout(() => {
        setFase("enviado");
        if (!link) return;
        timers.current.push(
          window.setTimeout(() => {
            const w = window.open(link, "_blank");
            if (w) w.opener = null;
            else setWaBloqueado(link);
          }, WA_DELAY_MS)
        );
      }, FADE_MS)
    );
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: CALM_FONT,
    fontSize: "clamp(17px, 4.5vw, 21px)",
    color: LIGHT,
    textShadow: LIGHT_SHADOW,
    marginBottom: 8,
    lineHeight: 1.35,
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: CALM_FONT,
    fontSize: 16,
    color: TEXT,
    background: "#ffffff",
    border: "2px solid #000000",
    borderRadius: 25,
    padding: "12px 16px",
    outline: "none",
  };
  const errorStyle: React.CSSProperties = {
    fontFamily: CALM_FONT,
    fontSize: 13,
    color: "#ffe0d6",
    textShadow: LIGHT_SHADOW,
    margin: "6px 0 0",
  };
  const radioRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: CALM_FONT,
    fontSize: "clamp(16px, 4.2vw, 19px)",
    color: LIGHT,
    textShadow: LIGHT_SHADOW,
    cursor: "pointer",
    padding: "4px 0",
  };

  return (
    // El fondo-cielo-2.png lo pone el contenedor que comparte con el cierre.
    <section style={{ position: "relative", padding: "40px 24px" }}>
      <Reveal>
        <h2
          style={{
            fontFamily: CALM_FONT,
            fontSize: "clamp(36px, 10vw, 52px)",
            color: LIGHT,
            fontWeight: "normal",
            textAlign: "center",
            margin: "0 0 20px",
            textShadow: "0 2px 10px rgba(0, 40, 90, 0.25)",
          }}
        >
          Reserva
        </h2>

        {/* Formulario y confirmación comparten la misma celda de la grilla:
            el formulario queda invisible pero conserva su alto, y el mensaje
            se centra en ese espacio. */}
        <div style={{ display: "grid" }}>
        <form
          noValidate
          onSubmit={handleSubmit}
          aria-hidden={fase === "enviado"}
          style={{
            gridArea: "1 / 1",
            display: "grid",
            gap: 20,
            opacity: fase === "form" ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease`,
            visibility: fase === "enviado" ? "hidden" : "visible",
            pointerEvents: fase === "form" ? "auto" : "none",
          }}
        >
          <div>
            <label htmlFor="rsvp-nombre" style={labelStyle}>
              Tu nombre y apellido:
            </label>
            <input
              id="rsvp-nombre"
              type="text"
              required
              autoComplete="name"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errors.nombre) setErrors((x) => ({ ...x, nombre: undefined }));
              }}
              aria-invalid={!!errors.nombre}
              style={{ ...inputStyle, borderColor: errors.nombre ? "#b5523a" : inputStyle.borderColor }}
            />
            {errors.nombre && <p style={errorStyle}>{errors.nombre}</p>}
          </div>

          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend style={{ ...labelStyle, padding: 0 }}>¿Nos acompañarás?</legend>
            {(
              [
                ["si", "Sí claro, ahí estaré"],
                ["no", "Lo siento, no podré"],
              ] as const
            ).map(([value, text]) => (
              <label key={value} style={radioRow}>
                <input
                  type="radio"
                  name="rsvp"
                  value={value}
                  required
                  checked={rsvp === value}
                  onChange={() => {
                    setRsvp(value);
                    setErrors((x) => ({ ...x, rsvp: undefined }));
                  }}
                  style={{ accentColor: TERRACOTA, width: 18, height: 18, margin: 0 }}
                />
                {text}
              </label>
            ))}
            {errors.rsvp && <p style={errorStyle}>{errors.rsvp}</p>}
          </fieldset>

          <div>
            <label htmlFor="rsvp-dieta" style={labelStyle}>
              ¿Tienes algún requerimiento dietético o alergia?
            </label>
            <input
              id="rsvp-dieta"
              type="text"
              value={dieta}
              onChange={(e) => setDieta(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="rsvp-cancion" style={labelStyle}>
              ¿Qué canción es la que te hace salir a la pista de baile?
            </label>
            <input
              id="rsvp-cancion"
              type="text"
              value={cancion}
              onChange={(e) => setCancion(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={{
              ...pillStyle,
              justifySelf: "center",
              background: "#f9a094",
              color: "#000000",
              padding: "14px 40px",
              fontFamily: CALM_FONT,
              fontSize: "clamp(17px, 4.5vw, 20px)",
              fontWeight: "normal",
              boxShadow: "0 6px 16px rgba(0, 40, 90, 0.2)",
            }}
          >
            Enviar datos
          </button>
        </form>

        {fase === "enviado" && <Confirmacion asiste={rsvp === "si"} waLink={waBloqueado} />}
        </div>
      </Reveal>
    </section>
  );
}

const RESERVA_CSS = `
@keyframes oliva-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes oliva-pop { from { transform: scale(0) } to { transform: scale(1) } }
`;

function Confirmacion({ asiste, waLink }: { asiste: boolean; waLink: string | null }) {
  const texto: React.CSSProperties = {
    fontFamily: CALM_FONT,
    fontSize: "clamp(16px, 4vw, 20px)",
    color: LIGHT,
    textShadow: LIGHT_SHADOW,
    lineHeight: 1.4,
    margin: 0,
  };
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
        animation: `oliva-fade-in ${FADE_MS}ms ease both`,
      }}
    >
      <style>{RESERVA_CSS}</style>
      <span style={{ display: "inline-flex", animation: "oliva-pop 0.3s ease-out both" }}>
        <Check size={48} color={LIGHT} strokeWidth={2} aria-hidden="true" />
      </span>
      <h3
        style={{
          ...texto,
          fontSize: "clamp(28px, 7vw, 36px)",
          fontWeight: "normal",
          lineHeight: 1.15,
          textShadow: "0 2px 10px rgba(0, 40, 90, 0.25)",
        }}
      >
        {asiste ? "¡Muchas gracias!" : "Gracias por confirmarnos"}
      </h3>
      <p style={texto}>
        {asiste ? "Tu confirmación fue recibida." : "Lamentamos mucho que no puedas asistir."}
      </p>
      <p style={texto}>
        {asiste ? `¡Te esperamos el ${FECHA_TEXTO}!` : "¡Te llevaremos en el corazón ese día!"}
      </p>
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...pillStyle,
            marginTop: 8,
            background: "#f9a094",
            color: "#000000",
            fontFamily: CALM_FONT,
            fontSize: "clamp(16px, 4vw, 19px)",
            fontWeight: "normal",
            textDecoration: "none",
          }}
        >
          Enviar por WhatsApp
        </a>
      )}
    </div>
  );
}

// ─── 6. Cierre ───────────────────────────────────────────────────────────────

function CierreSection({ demo, photosPath }: { demo: boolean; photosPath: string }) {
  const couple = coupleFor(demo);
  const white: React.CSSProperties = { color: "#ffffff", textShadow: "0 2px 10px rgba(0, 40, 90, 0.25)" };
  return (
    <section style={{ position: "relative", paddingTop: 32 }}>
      <Reveal style={{ textAlign: "center", padding: "0 24px 28px" }}>
        <h2
          style={{
            ...white,
            fontFamily: CALM_FONT,
            fontSize: "clamp(32px, 9vw, 48px)",
            fontWeight: "normal",
            margin: "0 0 10px",
          }}
        >
          ¡Muchas gracias!
        </h2>
        <p style={{ ...white, fontFamily: CALM_FONT, fontSize: 16, lineHeight: 1.5, margin: "0 0 18px" }}>
          No podemos esperar para celebrar ese día contigo
        </p>
        <p
          style={{
            ...white,
            fontFamily: CALM_FONT,
            fontSize: "clamp(36px, 10vw, 52px)",
            margin: 0,
          }}
        >
          {couple.first[0]} &amp; {couple.second[0]}
        </p>
      </Reveal>
      <div style={{ position: "relative" }}>
        <GardenImg
          photosPath={photosPath}
          file="cierre-pareja.png"
          alt={couple.amp}
          style={{ width: "100%" }}
        />
        {/* Disimula la costura entre el cielo y la foto. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 80,
            background: `linear-gradient(to bottom, ${SKY}, rgba(16, 141, 251, 0))`,
          }}
        />
      </div>
    </section>
  );
}

// ─── Banner de demo (solo /oliva) ────────────────────────────────────────────

function DemoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    "¡Hola! Me gusta el diseño Oliva y quiero una invitación como esta."
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
        background: "rgba(45, 90, 27, 0.92)",
        backdropFilter: "blur(8px)",
        color: "#fbf5e9",
        fontFamily: CALM_FONT,
        fontSize: 12,
        letterSpacing: "0.03em",
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
          color: "#fbf5e9",
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

// ─── Componente principal ────────────────────────────────────────────────────

export default function InvitationOliva({
  demo = false,
  photosPath = DEMO_PHOTOS_PATH,
  musicSrc = MUSIC_SRC,
}: {
  demo?: boolean;
  // Rutas de cliente: /oliva/<cliente>/photos y /oliva/<cliente>/music.mp3.
  photosPath?: string;
  musicSrc?: string;
}) {
  // Sin pantalla de entrada (13 nov 2026): la canción arranca con el primer
  // gesto del invitado (useAutoStartMusic) y el FAB queda a la vista.
  const src = useMusicSrc(musicSrc);
  const { playing, play, toggle } = useMusic(src ?? musicSrc, DESIGN_ID);
  const hasMusic = src !== null;
  useAutoStartMusic(src, playing, play);

  return (
    <div id="invitation-root" style={{ background: BG }}>
      {demo && <DemoBanner />}
      {hasMusic && <MusicFab playing={playing} onToggle={toggle} />}

      <main style={{ position: "relative", zIndex: 1 }}>
        <PortadaSection demo={demo} photosPath={photosPath} />
        <InvitadoSection demo={demo} photosPath={photosPath} />
        <ItinerarioSection photosPath={photosPath} />
        <SeparadorFlores photosPath={photosPath} />
        <VestimentaSection photosPath={photosPath} />
        {/* Reserva y cierre comparten el mismo cielo. Sube 4px sobre la
            vestimenta: la última fila de fondo-cielo-1.png es casi blanca y
            dejaba una línea en la unión. */}
        <div style={{ position: "relative", background: SKY, marginTop: -4 }}>
          <GardenImg
            photosPath={photosPath}
            file="fondo-cielo-2.png"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
          <ReservaSection demo={demo} />
          <CierreSection demo={demo} photosPath={photosPath} />
        </div>
      </main>
    </div>
  );
}
