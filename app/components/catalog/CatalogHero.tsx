"use client";

// Hero a pantalla completa del catálogo (/) + header que flota encima
// (10 nov 2026, inspirado en dariwithlove.ru).
//
// Todos los archivos de /marca/ son opcionales: si faltan no se ve nada roto.
// - Fondo: #1a1a1a sólido → encima el poster como background-image (si no
//   existe, no pinta nada) → encima el video, en opacity 0 hasta que arranca.
// - Logos: se precargan con `new Image()` y solo se renderizan si cargaron;
//   el header cae al texto "INVITACIONES DIGITALES".
// - El video NO se pide en la carga inicial: su src se asigna recién con el
//   evento `load` de la ventana, y nunca con ahorro de datos o con
//   prefers-reduced-motion (ahí queda solo el poster).

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import WhatsAppButton from "@/app/components/shared/WhatsAppButton";

const HERO_VIDEO = "/marca/hero.mp4";
const HERO_POSTER = "/marca/hero-poster.jpg";
const LOGO_BLANCO = "/marca/logo-blanco.png";
const LOGO_NEGRO = "/marca/logo-negro.png";

const NEGOCIO = "INVITACIONES DIGITALES";
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";

export const MENU = [
  { href: "#catalogo", label: "Catálogo" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#contacto", label: "Contacto" },
];

/** true cuando la imagen existe y cargó; false mientras carga o si falla. */
function useImageExists(src: string) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setOk(img.naturalWidth > 0);
    img.onerror = () => setOk(false);
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  return ok;
}

/* eslint-disable @next/next/no-img-element */

// ─── Header ──────────────────────────────────────────────────────────────────

export function CatalogHeader({ waHref, heroRef }: { waHref: string; heroRef: React.RefObject<HTMLElement | null> }) {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const logoBlanco = useImageExists(LOGO_BLANCO);
  const logoNegro = useImageExists(LOGO_NEGRO);

  // Blanco en cuanto el borde inferior del hero pasa por debajo del header
  useEffect(() => {
    const onScroll = () => {
      const hero = heroRef.current;
      const limite = hero ? hero.offsetHeight - 72 : window.innerHeight - 72;
      setSolid(window.scrollY > limite);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [heroRef]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Con el menú móvil abierto el header se pinta blanco aunque esté sobre el hero
  const claro = solid || menuOpen;
  const logo = claro ? (logoNegro ? LOGO_NEGRO : null) : logoBlanco ? LOGO_BLANCO : null;

  return (
    <header className={`hero-header${claro ? " solid" : ""}`}>
      <div className="hero-header-inner">
        <a href="#top" className="hero-brand" aria-label={NEGOCIO} onClick={() => setMenuOpen(false)}>
          {logo ? <img src={logo} alt={NEGOCIO} className="hero-brand-logo" /> : NEGOCIO}
        </a>

        <nav className="hero-nav" aria-label="Principal">
          {MENU.map((m) => (
            <a key={m.href} href={m.href}>
              {m.label}
            </a>
          ))}
        </nav>

        <div className="hero-header-right">
          <WhatsAppButton href={waHref} compact />
          <button
            type="button"
            className="hero-menu-btn"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="hero-mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <nav
        id="hero-mobile-menu"
        className={`hero-mobile-menu${menuOpen ? " open" : ""}`}
        aria-label="Principal (móvil)"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        {MENU.map((m) => (
          <a key={m.href} href={m.href} onClick={() => setMenuOpen(false)}>
            {m.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

export function CatalogHero({ heroRef }: { heroRef: React.RefObject<HTMLElement | null> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoListo, setVideoListo] = useState(false);
  const logo = useImageExists(LOGO_BLANCO);

  // El src del video se asigna recién cuando terminó de cargar la página
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cargar = () => setVideoSrc(HERO_VIDEO);
    if (document.readyState === "complete") {
      cargar();
      return;
    }
    window.addEventListener("load", cargar, { once: true });
    return () => window.removeEventListener("load", cargar);
  }, []);

  // autoPlay no siempre arranca cuando el src llega después del montaje
  useEffect(() => {
    if (!videoSrc) return;
    videoRef.current?.play().catch(() => {});
  }, [videoSrc]);

  return (
    <section ref={heroRef} id="top" className="hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${HERO_POSTER})` }} aria-hidden="true" />
      {videoSrc && (
        <video
          ref={videoRef}
          className={`hero-video${videoListo ? " ready" : ""}`}
          src={videoSrc}
          poster={HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setVideoListo(true)}
          onError={() => setVideoSrc(null)}
        />
      )}
      <div className="hero-shade" aria-hidden="true" />

      <div className="hero-content">
        {logo && <img src={LOGO_BLANCO} alt="" className="hero-logo" />}
        <h1 className="hero-title">{NEGOCIO}</h1>
        <p className="hero-tagline">Invitaciones digitales para cada celebración</p>
        <a href="#catalogo" className="hero-cta">
          Ver catálogo
        </a>
      </div>

      <div className="hero-bottom">
        <div className="hero-line" />
        <p className="hero-motto">
          Aquí vive <em>tu celebración</em>
        </p>
      </div>
    </section>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

export const HERO_CSS = `
  .hero { position: relative; height: 100svh; min-height: 520px; width: 100%; overflow: hidden; background: #1a1a1a; color: #fff; }
  .hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
  .hero-video {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    opacity: 0; transition: opacity 0.8s ease;
  }
  .hero-video.ready { opacity: 1; }
  .hero-shade { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.35); }

  .hero-content {
    position: relative; z-index: 2; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 0 16px 90px;
  }
  .hero-logo { width: 120px; height: auto; margin-bottom: 22px; }
  .hero-title {
    font-weight: 600; font-size: clamp(20px, 5.4vw, 40px); letter-spacing: 0.28em;
    padding-left: 0.28em; /* compensa el espaciado del último carácter para centrar */
    color: #fff;
  }
  .hero-tagline { margin-top: 14px; font-size: clamp(14px, 3.8vw, 18px); color: rgba(255, 255, 255, 0.9); max-width: 32ch; }
  .hero-cta {
    margin-top: 30px; display: inline-flex; align-items: center; justify-content: center;
    background: #fff; color: #111; text-decoration: none; font-weight: 600; font-size: 14px;
    letter-spacing: 0.08em; text-transform: uppercase; padding: 14px 34px; border-radius: 999px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25); }

  .hero-bottom { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 0 16px 28px; }
  .hero-line { height: 1px; background: rgba(255, 255, 255, 0.45); max-width: 1200px; margin: 0 auto; }
  .hero-motto {
    margin-top: 18px; text-align: center; font-family: ${SERIF}; font-weight: 400;
    font-size: clamp(22px, 5.5vw, 40px); color: #fff; line-height: 1.15;
  }
  .hero-motto em { font-style: italic; }

  .hero-header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: transparent; color: #fff;
    transition: background 0.35s ease, color 0.35s ease, box-shadow 0.35s ease;
  }
  .hero-header.solid { background: #fff; color: #111; box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08); }
  .hero-header-inner {
    max-width: 1200px; margin: 0 auto; padding: 0 16px; height: 64px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  @media (min-width: 768px) { .hero-header-inner { padding: 0 32px; height: 72px; } }
  .hero-brand {
    color: inherit; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.12em;
    white-space: nowrap; display: flex; align-items: center; min-width: 0;
  }
  @media (max-width: 520px) { .hero-brand { font-size: 12px; letter-spacing: 0.06em; overflow: hidden; text-overflow: ellipsis; } .hero-brand-logo { height: 32px; } }
  .hero-brand-logo { height: 38px; width: auto; display: block; }
  .hero-nav { display: none; gap: 32px; }
  .hero-nav a { color: inherit; text-decoration: none; font-size: 14px; letter-spacing: 0.04em; opacity: 0.9; transition: opacity 0.2s ease; }
  .hero-nav a:hover { opacity: 1; text-decoration: underline; text-underline-offset: 4px; }
  .hero-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .hero-menu-btn {
    background: none; border: 0; color: inherit; cursor: pointer; padding: 6px;
    display: inline-flex; align-items: center; justify-content: center;
  }
  @media (min-width: 900px) {
    .hero-nav { display: flex; }
    .hero-menu-btn { display: none; }
  }
  .hero-mobile-menu {
    display: flex; flex-direction: column; background: #fff; color: #111;
    max-height: 0; overflow: hidden; transition: max-height 0.3s ease, box-shadow 0.3s ease;
  }
  .hero-mobile-menu.open { max-height: 260px; box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12); }
  .hero-mobile-menu a {
    color: #111; text-decoration: none; font-size: 16px; padding: 16px; border-top: 1px solid #ececec;
  }
  @media (min-width: 900px) { .hero-mobile-menu { display: none; } }

  #catalogo, #como-funciona, #contacto { scroll-margin-top: 80px; }
`;
