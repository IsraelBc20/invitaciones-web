import Link from "next/link";
import { designs } from "@/lib/designs";

const WA_CATALOGO = `https://wa.me/51993092110?text=${encodeURIComponent(
  "¡Hola! Vi el catálogo de Invitaciones Digitales y me gustaría más información. ✨"
)}`;

const FEATURES = [
  { icon: "🎵", titulo: "Música de fondo", texto: "Canción personalizada que suena al abrir la invitación." },
  { icon: "📸", titulo: "Galería de fotos", texto: "Tus invitados suben sus fotos y todos las ven en un solo lugar." },
  { icon: "⏰", titulo: "Cuenta regresiva", texto: "Días, horas, minutos y segundos en vivo hasta el gran día." },
  { icon: "📍", titulo: "Ubicación con mapa", texto: "Google Maps integrado para que nadie se pierda." },
  { icon: "📱", titulo: "Optimizada para celular", texto: "Diseñada para verse perfecta en cualquier teléfono." },
  { icon: "✉️", titulo: "Confirmación de asistencia", texto: "Tus invitados confirman con un toque por WhatsApp." },
];

const PASOS = [
  { n: 1, titulo: "Elige tu diseño", texto: "Explora el catálogo y mira las demos en vivo." },
  { n: 2, titulo: "Envíanos los datos", texto: "Nombres, fecha, lugar, fotos y la canción que quieres." },
  { n: 3, titulo: "Personalizamos tu invitación", texto: "Adaptamos el diseño con toda tu información." },
  { n: 4, titulo: "Recibe tu link", texto: "Compártelo por WhatsApp con todos tus invitados." },
];

export default function CatalogPage() {
  return (
    <div className="catalog-root">
      <style>{`
        html { scroll-behavior: smooth; }
        .catalog-root {
          width: 100%;
          min-height: 100vh;
          background: radial-gradient(ellipse at top, #2a3a2e 0%, #131a15 55%, #0c110d 100%);
          color: #f0ece4;
          font-family: var(--font-serif);
        }
        .catalog-inner { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
        .cat-eyebrow {
          font-family: var(--font-sans);
          font-size: 12px;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .cat-h2 {
          font-family: var(--font-display);
          font-size: clamp(26px, 4vw, 36px);
          color: #f8f6f3;
          margin-top: 12px;
        }
        .design-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 380px)); gap: 28px; justify-content: center; }
        .design-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(215, 192, 122, 0.25);
          border-radius: 18px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .design-card:hover { transform: translateY(-4px); box-shadow: 0 24px 50px -20px rgba(0, 0, 0, 0.7); }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; }
        .feature-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 24px 20px;
        }
        .paso-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 18px; }
        .btn-cat {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 34px;
          border-radius: 50px;
          font-family: var(--font-sans);
          font-size: 13px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .btn-cat-gold { background: var(--gold); color: #1c2418; }
        .btn-cat-gold:hover { filter: brightness(1.08); }
        .btn-cat-outline { border: 1px solid rgba(215, 192, 122, 0.6); color: var(--gold); }
        .btn-cat-outline:hover { background: rgba(215, 192, 122, 0.12); }
      `}</style>

      {/* ── Header / Hero ── */}
      <header className="catalog-inner" style={{ textAlign: "center", padding: "90px 24px 70px" }}>
        <div className="cat-eyebrow">Invitaciones Digitales</div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(38px, 7vw, 64px)",
            lineHeight: 1.1,
            marginTop: 22,
            color: "#f8f6f3",
            fontWeight: 500,
          }}
        >
          Invitaciones únicas para
          <br />
          <span style={{ fontFamily: "var(--font-script)", color: "var(--gold)", fontWeight: 400 }}>
            el día más especial
          </span>
        </h1>
        <p
          style={{
            fontStyle: "italic",
            fontSize: 19,
            color: "rgba(240, 236, 228, 0.75)",
            marginTop: 20,
            maxWidth: 520,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.6,
          }}
        >
          Diseños exclusivos para bodas, 15 años y más
        </p>
        <div style={{ marginTop: 36 }}>
          <a href="#disenos" className="btn-cat btn-cat-gold">
            Ver diseños ↓
          </a>
        </div>
      </header>

      {/* ── Diseños ── */}
      <section id="disenos" className="catalog-inner" style={{ padding: "50px 24px 70px", textAlign: "center" }}>
        <div className="cat-eyebrow">Catálogo</div>
        <h2 className="cat-h2">Nuestros diseños</h2>
        <div className="design-grid" style={{ marginTop: 40 }}>
          {designs.map((d) => (
            <article key={d.id} className="design-card">
              {/* Preview: gradiente con los colores del diseño */}
              <div
                style={{
                  height: 190,
                  background: `linear-gradient(135deg, ${d.colores[0]} 0%, ${d.colores[1]} 60%, ${d.colores[2]} 130%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-script)",
                    fontSize: 46,
                    color: "rgba(30, 40, 30, 0.75)",
                  }}
                >
                  {d.nombre}
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    fontFamily: "var(--font-sans)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "5px 12px",
                    borderRadius: 50,
                    background: d.disponible ? "rgba(30, 45, 32, 0.85)" : "rgba(90, 80, 60, 0.85)",
                    color: d.disponible ? "#d7e5cf" : "#e8dcbc",
                  }}
                >
                  {d.disponible ? "Disponible" : "Próximamente"}
                </span>
              </div>

              <div style={{ padding: "24px 22px 28px", textAlign: "left" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#f8f6f3" }}>
                  {d.nombre}
                </h3>
                <p
                  style={{
                    fontStyle: "italic",
                    fontSize: 15.5,
                    lineHeight: 1.55,
                    color: "rgba(240, 236, 228, 0.7)",
                    marginTop: 10,
                  }}
                >
                  {d.descripcion}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                  {d.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        padding: "5px 11px",
                        borderRadius: 50,
                        border: "1px solid rgba(215, 192, 122, 0.4)",
                        color: "var(--gold)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {d.disponible && (
                  <div style={{ marginTop: 22 }}>
                    <Link href={d.ruta} className="btn-cat btn-cat-outline" style={{ width: "100%" }}>
                      Ver demo →
                    </Link>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Características ── */}
      <section className="catalog-inner" style={{ padding: "50px 24px 70px", textAlign: "center" }}>
        <div className="cat-eyebrow">Qué incluye</div>
        <h2 className="cat-h2">Cada invitación viene con</h2>
        <div className="feature-grid" style={{ marginTop: 40, textAlign: "left" }}>
          {FEATURES.map((f) => (
            <div key={f.titulo} className="feature-card">
              <div style={{ fontSize: 30 }}>{f.icon}</div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 17,
                  color: "#f8f6f3",
                  marginTop: 12,
                }}
              >
                {f.titulo}
              </div>
              <p
                style={{
                  fontStyle: "italic",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "rgba(240, 236, 228, 0.65)",
                  marginTop: 8,
                }}
              >
                {f.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="catalog-inner" style={{ padding: "50px 24px 80px", textAlign: "center" }}>
        <div className="cat-eyebrow">Proceso</div>
        <h2 className="cat-h2">Cómo funciona</h2>
        <div className="paso-grid" style={{ marginTop: 40 }}>
          {PASOS.map((p) => (
            <div key={p.n} style={{ padding: "10px 8px" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  margin: "0 auto",
                  borderRadius: "50%",
                  border: "1px solid var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  color: "var(--gold)",
                }}
              >
                {p.n}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 17,
                  color: "#f8f6f3",
                  marginTop: 16,
                }}
              >
                {p.titulo}
              </div>
              <p
                style={{
                  fontStyle: "italic",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "rgba(240, 236, 228, 0.65)",
                  marginTop: 8,
                }}
              >
                {p.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer / Contacto ── */}
      <footer
        style={{
          borderTop: "1px solid rgba(215, 192, 122, 0.2)",
          padding: "60px 24px 50px",
          textAlign: "center",
        }}
      >
        <h2 className="cat-h2" style={{ marginTop: 0 }}>
          ¿Te gustó algún diseño? Contáctanos
        </h2>
        <div style={{ marginTop: 26 }}>
          <a href={WA_CATALOGO} target="_blank" rel="noopener noreferrer" className="btn-cat btn-cat-gold">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.6.2-.8l.4-.5c.1-.2.1-.3.2-.5v-.5c0-.1-.5-1.3-.7-1.8-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.8 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.4Z" />
            </svg>
            +51 993 092 110
          </a>
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(240, 236, 228, 0.45)",
            marginTop: 44,
          }}
        >
          Invitaciones Digitales © 2026
        </div>
      </footer>
    </div>
  );
}
