"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaUpload } from "@/app/components/shared/useMediaUpload";
import UploadPreview from "@/app/components/shared/UploadPreview";
import { ACCEPT_ATTR } from "@/lib/media";

const DESIGN_ID = "oliva";

// ─── Paleta floral (SVG) ──────────────────────────────────────────────────────

interface FlowerColors {
  outer: string;
  mid: string;
  inner: string;
  core: string;
}

interface EucalyptusColors {
  leaf: string;
  leaf2: string;
  stem: string;
}

const FLOWER: FlowerColors = {
  outer: "#E8D3BC",
  mid: "#D3B295",
  inner: "#C8A489",
  core: "#8E6F55",
};
const FLOWER_ALT: FlowerColors = {
  outer: "#F6ECDD",
  mid: "#E8D8C0",
  inner: "#CBB292",
  core: "#9A7E62",
};
const OLIVE: EucalyptusColors = {
  leaf: "#7f9a87",
  leaf2: "#5d7a66",
  stem: "#46604f",
};

// ─── SVG helpers ─────────────────────────────────────────────────────────────

const pa = (len: number, w: number) =>
  `M 0,0 Q ${-w},${-len * 0.45} 0,${-len} Q ${w},${-len * 0.45} 0,0 Z`;

function Peony({ size = 70, palette: c }: { size?: number; palette: FlowerColors }) {
  return (
    <svg
      viewBox="-50 -50 100 100"
      width={size}
      height={size}
      style={{ display: "block", overflow: "visible" }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse
          key={"o" + i}
          cx={0}
          cy={-30}
          rx={14}
          ry={18}
          fill={c.outer}
          stroke={c.mid}
          strokeWidth={0.4}
          strokeOpacity={0.3}
          opacity={0.95}
          transform={`rotate(${(i / 12) * 360})`}
        />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <ellipse
          key={"m" + i}
          cx={0}
          cy={-20}
          rx={11}
          ry={15}
          fill={c.mid}
          opacity={0.95}
          transform={`rotate(${(i / 10) * 360 + 18})`}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={"i" + i}
          cx={0}
          cy={-11}
          rx={8}
          ry={11}
          fill={c.inner}
          transform={`rotate(${(i / 8) * 360})`}
        />
      ))}
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={"b" + a} d={pa(11, 6)} fill={c.core} transform={`rotate(${a})`} />
      ))}
      <circle cx={0} cy={0} r={3} fill={c.core} opacity={0.7} />
    </svg>
  );
}

function Eucalyptus({
  size = 90,
  palette: c,
  rotate = 0,
}: {
  size?: number;
  palette: EucalyptusColors;
  rotate?: number;
}) {
  const ys = [12, 28, 44, 60, 76, 92];
  return (
    <svg
      viewBox="0 0 100 110"
      width={size}
      height={size * 1.1}
      style={{ display: "block", transform: `rotate(${rotate}deg)`, overflow: "visible" }}
    >
      <path
        d="M 50 5 Q 48 50 50 105"
        stroke={c.stem}
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
      />
      {ys.map((y, i) => {
        const g = 1 - i * 0.05;
        const lw = 16 * g;
        const ll = 10 * g;
        const L = `M 50 ${y} C ${50 - lw * 0.4} ${y - ll * 0.6}, ${50 - lw} ${y - ll * 0.2}, ${50 - lw - 2} ${y + ll * 0.4} C ${50 - lw * 0.7} ${y + ll * 0.8}, ${50 - lw * 0.3} ${y + ll * 0.5}, 50 ${y + 1} Z`;
        const R = `M 50 ${y} C ${50 + lw * 0.4} ${y - ll * 0.6}, ${50 + lw} ${y - ll * 0.2}, ${50 + lw + 2} ${y + ll * 0.4} C ${50 + lw * 0.7} ${y + ll * 0.8}, ${50 + lw * 0.3} ${y + ll * 0.5}, 50 ${y + 1} Z`;
        const cL = i % 2 ? c.leaf : c.leaf2;
        const cR = i % 2 ? c.leaf2 : c.leaf;
        return (
          <g key={i}>
            <path d={L} fill={cL} stroke={c.stem} strokeWidth={0.4} strokeOpacity={0.4} />
            <path d={R} fill={cR} stroke={c.stem} strokeWidth={0.4} strokeOpacity={0.4} />
          </g>
        );
      })}
      <ellipse cx={50} cy={6} rx={4} ry={7} fill={c.leaf2} transform="rotate(-10 50 6)" />
    </svg>
  );
}

/** Ornamento central: rama de olivo + peonía, como los divisores de orquídea */
function Ornament({ size = 80 }: { size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        pointerEvents: "none",
      }}
    >
      <Eucalyptus size={size} palette={OLIVE} rotate={-115} />
      <Peony size={size * 0.75} palette={FLOWER} />
      <Eucalyptus size={size} palette={OLIVE} rotate={115} />
    </div>
  );
}

/** Anillos entrelazados */
function Rings({ size = 54 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 70" width={size} height={size * 0.7} style={{ display: "block" }}>
      <circle cx={38} cy={38} r={24} fill="none" stroke="#d7c07a" strokeWidth={4} />
      <circle cx={62} cy={38} r={24} fill="none" stroke="#c8a489" strokeWidth={4} />
      <path d="M 34 12 L 38 6 L 42 12 Z" fill="#d7c07a" />
    </svg>
  );
}

// ─── useInView / Reveal ──────────────────────────────────────────────────────

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

// ─── Photo placeholder ────────────────────────────────────────────────────────

function Photo({
  label = "foto",
  ratio = "4 / 5",
  rounded = "14px",
  style,
  frame = true,
}: {
  label?: string;
  ratio?: string;
  rounded?: string;
  style?: React.CSSProperties;
  frame?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: ratio,
        borderRadius: rounded,
        overflow: "hidden",
        position: "relative",
        boxShadow: frame ? "var(--shadow)" : "none",
        ...style,
      }}
    >
      <div className="photo-placeholder" style={{ width: "100%", height: "100%" }}>
        <span>{label}</span>
      </div>
    </div>
  );
}

// ─── Gif icon ─────────────────────────────────────────────────────────────────

function Gif({ src, alt, size = 110 }: { src: string; alt: string; size?: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={size} height={size} style={{ display: "block" }} />
    </div>
  );
}

// ─── MusicFab ─────────────────────────────────────────────────────────────────

function MusicFab({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
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

// ─── IntroGate ────────────────────────────────────────────────────────────────

function IntroGate({ onOpen }: { onOpen: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        margin: "auto",
        maxWidth: 430,
        zIndex: 100,
        background: "linear-gradient(180deg, #faf7f4 0%, #f6f2ee 60%, #ece6df 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: 24,
        textAlign: "center",
      }}
    >
      {/* Rama de olivo superior */}
      <div style={{ position: "absolute", top: -46, left: "50%", transform: "translateX(-50%)" }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <Eucalyptus size={130} palette={OLIVE} rotate={-140} />
          <Eucalyptus size={130} palette={OLIVE} rotate={140} />
        </div>
      </div>

      {/* Flores inferiores */}
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: -40,
          animation: "drift 9s ease-in-out infinite",
        }}
      >
        <Peony size={160} palette={FLOWER} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 70,
          opacity: 0.85,
          animation: "drift 11s ease-in-out infinite reverse",
        }}
      >
        <Peony size={90} palette={FLOWER_ALT} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: -30,
          right: -35,
          animation: "drift 8s ease-in-out infinite reverse",
        }}
      >
        <Peony size={140} palette={FLOWER_ALT} />
      </div>
      <div style={{ position: "absolute", bottom: 80, right: -45, opacity: 0.6 }}>
        <Eucalyptus size={120} palette={OLIVE} rotate={200} />
      </div>
      <div style={{ position: "absolute", top: "34%", left: -50, opacity: 0.5 }}>
        <Eucalyptus size={120} palette={OLIVE} rotate={-20} />
      </div>

      {/* Contenido */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          className="small-caps"
          style={{ fontSize: 11, letterSpacing: "0.45em", animation: "shimmer 3s ease-in-out infinite" }}
        >
          Nuestra boda
        </div>

        <div className="script" style={{ fontSize: 72 }}>
          Israel
          <div style={{ fontSize: 46, color: "var(--tan)", margin: "-6px 0" }}>&amp;</div>
          Marisol
        </div>

        <div
          className="display-title"
          style={{ fontSize: 16, letterSpacing: "0.35em", color: "var(--tan)" }}
        >
          12 · 09 · 2026
        </div>

        {/* Indicador animado */}
        <div style={{ animation: "bounce-down 1.6s ease-in-out infinite", marginTop: 8 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="#848767"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <button
          onClick={onOpen}
          className="btn btn-olive"
          style={{ marginTop: 8, animation: "pulse-soft 2.4s ease-in-out infinite" }}
        >
          Ingresar a mi invitación
        </button>
        <div className="small-caps" style={{ fontSize: 10, marginTop: 2 }}>
          Sube el volumen para vivirla mejor
        </div>
      </div>
    </div>
  );
}

// ─── Nombres + ¡Nos casamos! ─────────────────────────────────────────────────

function NamesSection() {
  return (
    <section
      className="s"
      style={{ paddingTop: 90, paddingBottom: 40, textAlign: "center", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)" }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <Eucalyptus size={120} palette={OLIVE} rotate={-140} />
          <Eucalyptus size={120} palette={OLIVE} rotate={140} />
        </div>
      </div>

      <Reveal kind="reveal-scale">
        <div className="script" style={{ fontSize: 64, marginTop: 30 }}>
          Israel
          <div style={{ fontSize: 42, color: "var(--tan)", margin: "-4px 0" }}>&amp;</div>
          Marisol
        </div>
      </Reveal>

      <Reveal delay={2}>
        <h2
          className="display-title"
          style={{ fontSize: 22, marginTop: 26, letterSpacing: "0.3em" }}
        >
          ¡Nos casamos!
        </h2>
      </Reveal>

      <Reveal kind="reveal-scale" delay={3}>
        <div style={{ marginTop: 34 }}>
          <Photo label="Foto principal · pareja" ratio="4 / 5" rounded="200px 200px 14px 14px" />
        </div>
      </Reveal>
    </section>
  );
}

// ─── Frase ────────────────────────────────────────────────────────────────────

function QuoteSection() {
  return (
    <section className="s" style={{ paddingTop: 40, paddingBottom: 50, textAlign: "center" }}>
      <Reveal kind="reveal-left">
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 20,
            lineHeight: 1.65,
            fontStyle: "italic",
            color: "var(--ink)",
            maxWidth: 320,
            margin: "0 auto",
          }}
        >
          El amor nos encontró en el colegio hace 16 años,
          <br />
          el destino nos volvió a unir hace cuatro,
          <br />
          y hoy, con el corazón lleno de gratitud,
          <br />
          decidimos unir nuestras vidas para siempre.
        </p>
      </Reveal>
      <Reveal kind="reveal-scale" delay={2}>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
          <Rings size={64} />
        </div>
      </Reveal>
    </section>
  );
}

// ─── Fecha ────────────────────────────────────────────────────────────────────

function DateSection() {
  return (
    <section className="s" style={{ paddingTop: 20, paddingBottom: 50 }}>
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
            <div className="hline" />
            <div
              className="display-title"
              style={{ fontSize: 14, textAlign: "center", padding: "12px 0" }}
            >
              Sábado
            </div>
            <div className="hline" />
          </div>

          <div style={{ textAlign: "center", padding: "0 6px" }}>
            <div className="small-caps" style={{ fontSize: 11 }}>
              Huaral
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 54,
                lineHeight: 1.1,
                color: "var(--brown)",
              }}
            >
              12
            </div>
            <div className="small-caps" style={{ fontSize: 11 }}>
              2026
            </div>
          </div>

          <div>
            <div className="hline" />
            <div
              className="display-title"
              style={{ fontSize: 14, textAlign: "center", padding: "12px 0" }}
            >
              Septiembre
            </div>
            <div className="hline" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Countdown ───────────────────────────────────────────────────────────────

function CountdownSection() {
  const target = new Date("2026-09-12T15:00:00").getTime();
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setDiff(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const days = diff !== null ? Math.floor(diff / 86400000) : 0;
  const hours = diff !== null ? Math.floor((diff / 3600000) % 24) : 0;
  const mins = diff !== null ? Math.floor((diff / 60000) % 60) : 0;
  const secs = diff !== null ? Math.floor((diff / 1000) % 60) : 0;

  const cells = [
    { v: days, l: "Día" },
    { v: hours, l: "Hrs" },
    { v: mins, l: "Min" },
    { v: secs, l: "Seg" },
  ];

  return (
    <section className="s" style={{ paddingTop: 10, paddingBottom: 60, textAlign: "center" }}>
      <Reveal>
        <div
          className="script"
          style={{ fontSize: 40, color: "var(--brown)", marginBottom: 20 }}
        >
          Solo faltan
        </div>
      </Reveal>
      <Reveal kind="reveal-scale" delay={1}>
        <div className="countdown-box" style={{ maxWidth: 340, margin: "0 auto" }}>
          {cells.map(({ v, l }, i) => (
            <div key={l} style={{ display: "contents" }}>
              {i > 0 && <div className="sep">:</div>}
              <div style={{ minWidth: 56 }}>
                <div className="value">{String(v).padStart(2, "0")}</div>
                <div className="label">{l}</div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={2}>
        <div style={{ marginTop: 36 }}>
          <Ornament size={84} />
        </div>
      </Reveal>
    </section>
  );
}

// ─── Lugar ────────────────────────────────────────────────────────────────────

function VenueSection() {
  // Coordenadas exactas del local (Av. Circunvalación Norte 404, Huaral)
  const coords = "-11.489522,-77.206264";
  const mapsLink = `https://www.google.com/maps?q=${coords}`;
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
  const embed = `https://maps.google.com/maps?q=${coords}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section className="s" style={{ paddingTop: 60, paddingBottom: 60, textAlign: "center" }}>
      <Reveal kind="reveal-scale">
        <div className="info-card">
          <Gif src="/iglesia.gif" alt="Ceremonia civil" />
          <div
            className="display-title"
            style={{ fontSize: 17, marginTop: 14, letterSpacing: "0.28em" }}
          >
            Ceremonia civil
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 22,
              color: "var(--brown)",
              marginTop: 10,
            }}
          >
            3:00 p.m.
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              color: "var(--ink-soft)",
              marginTop: 10,
            }}
          >
            Av. Circunvalación Norte 404
            <br />
            Huaral
          </p>
          <div
            style={{
              marginTop: 22,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="btn btn-olive">
              Ver en Google Maps
            </a>
            <a
              href={directionsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Cómo llegar
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal kind="reveal-scale" delay={2}>
        <div
          style={{
            marginTop: 26,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(140,110,80,0.2)",
            boxShadow: "var(--shadow)",
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
    </section>
  );
}

// ─── Itinerario ───────────────────────────────────────────────────────────────

function ItinerarySection() {
  const items = [
    { time: "3:00 p.m.", label: "Ceremonia civil", img: "/it-ceremonia.gif" },
    { time: "4:30 p.m.", label: "Brindis", img: "/it-brindis.gif" },
    { time: "5:00 p.m.", label: "Comida", img: "/it-comida.gif" },
    { time: "6:00 p.m.", label: "Celebración", img: "/it-celebracion.gif" },
  ];

  return (
    <section
      className="s"
      style={{ paddingTop: 30, paddingBottom: 70, background: "var(--bg-2)", overflow: "hidden" }}
    >
      <Reveal>
        <div className="script" style={{ fontSize: 44, textAlign: "center", color: "var(--brown)" }}>
          Itinerario
        </div>
      </Reveal>

      <div className="timeline" style={{ marginTop: 36 }}>
        {items.map((item, i) => {
          const left = i % 2 === 0;
          return (
            <Reveal key={i} kind={left ? "reveal-left" : "reveal-right"} delay={1}>
              <div className="timeline-item">
                <div>
                  {left && (
                    <div className="timeline-card left-card">
                      <Gif src={item.img} alt={item.label} size={72} />
                      <div className="tl-title">{item.label}</div>
                      <div className="tl-time">{item.time}</div>
                    </div>
                  )}
                </div>
                <div className="timeline-dot" />
                <div>
                  {!left && (
                    <div className="timeline-card right-card">
                      <Gif src={item.img} alt={item.label} size={72} />
                      <div className="tl-title">{item.label}</div>
                      <div className="tl-time">{item.time}</div>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <div style={{ position: "absolute", bottom: -10, right: -35, opacity: 0.5 }}>
        <Eucalyptus size={120} palette={OLIVE} rotate={160} />
      </div>
      <div style={{ position: "absolute", top: 10, left: -35, opacity: 0.5 }}>
        <Eucalyptus size={120} palette={OLIVE} rotate={-20} />
      </div>
    </section>
  );
}

// ─── Código de vestimenta ────────────────────────────────────────────────────

function DressCode() {
  return (
    <section className="s" style={{ paddingTop: 60, paddingBottom: 60, textAlign: "center" }}>
      <Reveal>
        <Gif src="/dresscode.gif" alt="Código de vestimenta" />
      </Reveal>
      <Reveal delay={1}>
        <div className="display-title" style={{ fontSize: 17, marginTop: 14, letterSpacing: "0.28em" }}>
          Código de vestimenta
        </div>
      </Reveal>
      <Reveal delay={2}>
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 26,
            color: "var(--brown)",
            marginTop: 14,
          }}
        >
          Casual elegante
        </h3>
      </Reveal>
      <Reveal delay={3}>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            fontStyle: "italic",
            color: "var(--ink-soft)",
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
      <Reveal delay={4}>
        <div
          className="small-caps"
          style={{
            marginTop: 22,
            display: "flex",
            justifyContent: "center",
            gap: 20,
            fontSize: 11,
            color: "var(--brown)",
          }}
        >
          <span>• Sin blanco</span>
          <span>• Sin jeans</span>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Nosotros ─────────────────────────────────────────────────────────────────

function NosotrosSection() {
  return (
    <section
      className="s"
      style={{ paddingTop: 50, paddingBottom: 60, background: "var(--bg-2)", overflow: "hidden" }}
    >
      <Reveal kind="reveal-left">
        <div className="script" style={{ fontSize: 44, textAlign: "center", color: "var(--brown)" }}>
          Nosotros
        </div>
      </Reveal>

      <Reveal kind="reveal-scale" delay={1}>
        <div style={{ marginTop: 30, position: "relative" }}>
          <Photo label="foto · pareja" ratio="3 / 4" />
          <div
            style={{
              position: "absolute",
              top: -22,
              right: -12,
              animation: "drift 8s ease-in-out infinite",
            }}
          >
            <Peony size={70} palette={FLOWER_ALT} />
          </div>
          <div
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              animation: "drift 10s ease-in-out infinite reverse",
            }}
          >
            <Peony size={60} palette={FLOWER} />
          </div>
        </div>
      </Reveal>

      <Reveal delay={2}>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 19,
            lineHeight: 1.6,
            marginTop: 34,
            color: "var(--ink)",
            textAlign: "center",
          }}
        >
          Nos cruzamos por primera vez en 2009, quizás demasiado jóvenes para entender lo que
          significaba. El tiempo siguió su camino, y nosotros el nuestro. Pero el universo tenía
          otros planes, y en 2022 volvimos a encontrarnos... esta vez,{" "}
          <em style={{ color: "var(--brown)" }}>para quedarnos</em>.
        </p>
      </Reveal>

      <Reveal kind="reveal-scale" delay={3}>
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Photo label="foto · colegio" ratio="3 / 4" />
          <div style={{ paddingTop: 26 }}>
            <Photo label="foto · reencuentro" ratio="3 / 4" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Collage / galería de recuerdos ──────────────────────────────────────────

function CollageSection() {
  return (
    <section className="s" style={{ paddingTop: 40, paddingBottom: 30 }}>
      <Reveal kind="reveal-scale">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
          <Photo label="foto" ratio="3 / 4" />
          <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 10 }}>
            <Photo label="foto" ratio="1 / 1" />
            <Photo label="foto" ratio="1 / 1" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Agradecimiento ───────────────────────────────────────────────────────────

function ThanksSection() {
  return (
    <section className="s" style={{ paddingTop: 40, paddingBottom: 50, textAlign: "center" }}>
      <Reveal>
        <div style={{ marginBottom: 10 }}>
          <Gif src="/agradecimiento.gif" alt="Agradecimiento" />
        </div>
      </Reveal>
      <Reveal delay={1}>
        <div className="script" style={{ fontSize: 40, color: "var(--brown)" }}>
          Agradecimiento
        </div>
      </Reveal>
      <Reveal delay={2}>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 18,
            lineHeight: 1.6,
            color: "var(--ink-soft)",
            marginTop: 16,
            maxWidth: 310,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          A Dios y a nuestras familias por su amor, guía y apoyo incondicional. Gracias a cada
          persona que nos acompaña en este día tan especial.
        </p>
      </Reveal>
    </section>
  );
}

// ─── Sugerencia de regalo ─────────────────────────────────────────────────────

function GiftSection() {
  return (
    <section
      className="s"
      style={{ paddingTop: 50, paddingBottom: 60, textAlign: "center", background: "var(--bg-2)" }}
    >
      <Reveal>
        <Gif src="/regalo.gif" alt="Sugerencia de regalo" />
      </Reveal>
      <Reveal delay={1}>
        <div className="script" style={{ fontSize: 40, color: "var(--brown)", marginTop: 8 }}>
          Sugerencia de regalo
        </div>
      </Reveal>
      <Reveal delay={2}>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 18,
            lineHeight: 1.6,
            color: "var(--ink-soft)",
            marginTop: 16,
            maxWidth: 310,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Lo más valioso para nosotros es tenerte presente en este día. Pero si deseas hacernos
          un regalo, con mucho cariño lo recibiremos a través de:
        </p>
      </Reveal>
      <Reveal delay={3}>
        <div
          style={{
            marginTop: 20,
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: 310,
            padding: "18px 20px",
            border: "1px solid var(--brown)",
            borderRadius: 12,
            display: "grid",
            gap: 14,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "var(--brown)",
              }}
            >
              Cuenta Simple Soles Interbank
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                color: "var(--ink)",
                marginTop: 4,
              }}
            >
              8983327160054
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "var(--brown)",
              }}
            >
              Cuenta Interbancaria Interbank
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                color: "var(--ink)",
                marginTop: 4,
              }}
            >
              00389801332716005445
            </div>
          </div>
        </div>
      </Reveal>
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

  if (uploadDone) {
    return (
      <section className="s" style={{ paddingTop: 60, paddingBottom: 60, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Peony size={64} palette={FLOWER} />
        </div>
        <h3 className="script" style={{ fontSize: 44, color: "var(--brown)" }}>
          ¡Gracias!
        </h3>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 17,
            color: "var(--ink-soft)",
            marginTop: 12,
          }}
        >
          Tus fotos y videos fueron subidos exitosamente.
        </p>
        <button onClick={reset} className="btn btn-olive" style={{ marginTop: 24 }}>
          Subir más recuerdos
        </button>
      </section>
    );
  }

  return (
    <section className="s" style={{ paddingTop: 60, paddingBottom: 60 }}>
      <Reveal>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/camara.gif"
            alt="Cámara fotográfica"
            width={110}
            height={110}
            style={{ display: "block" }}
          />
        </div>
      </Reveal>
      <Reveal delay={1}>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 19,
            lineHeight: 1.6,
            color: "var(--ink)",
            textAlign: "center",
            marginTop: 14,
            maxWidth: 320,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          “Tu mirada es parte de nuestra historia. El 12 de septiembre, comparte tus fotos y
          videos y ayúdanos a guardar la eternidad en imágenes.”
        </p>
      </Reveal>

      <Reveal delay={2}>
        <div className="upload-card" style={{ marginTop: 26 }}>
          <div style={{ marginBottom: 20, textAlign: "left" }}>
            <label
              className="small-caps"
              style={{ display: "block", fontSize: 10, marginBottom: 8 }}
            >
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
                border: "1px solid rgba(140,110,80,0.3)",
                borderRadius: 8,
                fontFamily: "var(--font-serif)",
                fontSize: 16,
                color: "var(--ink)",
                background: "rgba(255,255,255,0.7)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink)" }}>
            {selectable.length > 0
              ? `${selectable.length} archivo${selectable.length > 1 ? "s" : ""} seleccionado${selectable.length > 1 ? "s" : ""}`
              : "Sube tus fotos y videos del día"}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 10.5,
              color: "var(--ink-soft)",
              marginTop: 6,
              letterSpacing: "0.04em",
            }}
          >
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
            className="btn btn-outline"
            style={{ marginTop: 14 }}
            disabled={uploading}
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
                  accent="var(--olive)"
                />
              ))}
            </div>
          )}

          {rejected.length > 0 && (
            <div
              style={{
                marginTop: 12,
                fontFamily: "var(--font-sans)",
                fontSize: 11,
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
            <div
              style={{
                marginTop: 12,
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "#B33A2C",
              }}
            >
              {formError}
            </div>
          )}

          <button
            onClick={uploadAll}
            disabled={uploading}
            className="btn btn-olive"
            style={{ marginTop: 18, opacity: uploading ? 0.7 : 1 }}
          >
            {uploading ? "Subiendo..." : "Subir archivos"}
          </button>
        </div>
      </Reveal>

      <Reveal delay={3}>
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <a
            href="/oliva/galeria"
            className="small-caps"
            style={{ color: "var(--brown)", textDecoration: "none", fontSize: 11 }}
          >
            Ver galería de fotos →
          </a>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Confirmar asistencia ────────────────────────────────────────────────────

function RSVPSection() {
  const phone = "993092110";
  const msg = encodeURIComponent(
    "¡Hola Israel y Marisol! Confirmo mi asistencia a su matrimonio civil del 12 de septiembre. ✨"
  );
  const link = `https://wa.me/51${phone}?text=${msg}`;

  return (
    <section
      className="s"
      style={{ paddingTop: 60, paddingBottom: 70, textAlign: "center", background: "var(--olive)" }}
    >
      <Reveal>
        <div className="script" style={{ fontSize: 44, color: "#f8f6f3" }}>
          ¿Nos acompañas?
        </div>
      </Reveal>
      <Reveal delay={1}>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 18,
            lineHeight: 1.6,
            marginTop: 14,
            color: "rgba(248,246,243,0.85)",
            maxWidth: 300,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Nos encantaría compartir este día tan especial contigo. Te agradeceríamos mucho si
          pudieras confirmar antes del 25 de julio.
        </p>
      </Reveal>
      <Reveal delay={2}>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            marginTop: 28,
            background: "#f8f6f3",
            color: "var(--brown)",
            border: "1px solid var(--gold)",
            boxShadow: "0 12px 18px -6px rgba(0,0,0,0.3)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5l-.7-1.8c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4 0-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.6 1 2.7.1.2 1.8 2.8 4.3 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.7.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 4.9L2 22l5.2-1.4c1.4.7 3 1.1 4.7 1.1 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
          </svg>
          Confirmar asistencia
        </a>
      </Reveal>
      <Reveal delay={3}>
        <div
          className="small-caps"
          style={{ marginTop: 20, fontSize: 11, color: "rgba(248,246,243,0.6)" }}
        >
          +51 {phone}
        </div>
      </Reveal>
    </section>
  );
}

// ─── Te esperamos ────────────────────────────────────────────────────────────

function TeEsperamos() {
  return (
    <section
      className="s"
      style={{ paddingTop: 70, paddingBottom: 40, textAlign: "center", overflow: "hidden" }}
    >
      <Reveal>
        <div className="script" style={{ fontSize: 84, lineHeight: 1 }}>
          I <span style={{ color: "var(--tan)", fontSize: 60 }}>&amp;</span> M
        </div>
      </Reveal>
      <Reveal delay={1}>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 18,
            lineHeight: 1.6,
            marginTop: 24,
            color: "var(--ink-soft)",
            maxWidth: 310,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Con mucha ilusión queremos vivir este momento rodeados de personas que han formado
          parte de nuestra historia. Será un honor contar con tu presencia.
        </p>
      </Reveal>
      <Reveal delay={2}>
        <h3
          className="script"
          style={{ fontSize: 48, marginTop: 26, color: "var(--brown)" }}
        >
          ¡Te esperamos!
        </h3>
      </Reveal>
      <Reveal kind="reveal-scale" delay={3}>
        <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <Peony size={70} palette={FLOWER_ALT} />
            <Peony size={100} palette={FLOWER} />
            <Peony size={70} palette={FLOWER_ALT} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Banner de demo (solo en el catálogo, no en invitaciones de clientes) ────

function DemoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const waLink = `https://wa.me/51993092110?text=${encodeURIComponent(
    "¡Hola! Me gusta el diseño Oliva Elegante y quiero una invitación como esta. ✨"
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
        background: "rgba(36, 57, 44, 0.92)",
        backdropFilter: "blur(8px)",
        color: "#f8f6f3",
        fontFamily: "var(--font-sans)",
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
          background: "var(--gold)",
          color: "#24392c",
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

// ─── Componente principal ────────────────────────────────────────────────────

export default function InvitationOliva({ demo = false }: { demo?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);

  const handleOpen = () => {
    setOpened(true);
    const a = audioRef.current;
    if (a) {
      a.volume = 0.5;
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <div id="invitation-root">
      <audio ref={audioRef} src="/music.mp3" loop preload="auto" />

      {demo && <DemoBanner />}
      {!opened && <IntroGate onOpen={handleOpen} />}
      {opened && <MusicFab playing={playing} onToggle={togglePlay} />}

      <main style={{ position: "relative", zIndex: 1 }}>
        <NamesSection />
        <QuoteSection />
        <DateSection />
        <CountdownSection />
        <VenueSection />
        <ItinerarySection />
        <DressCode />
        <NosotrosSection />
        <CollageSection />
        <ThanksSection />
        <GiftSection />
        <PhotoUpload />
        <RSVPSection />
        <TeEsperamos />

        <footer
          style={{
            padding: "36px 28px 56px",
            textAlign: "center",
            background: "var(--bg-2)",
          }}
        >
          <div className="small-caps" style={{ fontSize: 10 }}>
            Israel &amp; Marisol · Huaral 2026
          </div>
          <a
            href="/oliva/galeria"
            className="small-caps"
            style={{
              color: "var(--brown)",
              textDecoration: "none",
              fontSize: 10,
              marginTop: 10,
              display: "inline-block",
            }}
          >
            Ver galería de fotos →
          </a>
        </footer>
      </main>
    </div>
  );
}
