"use client";

// /nosotros: banner con el título, "Quiénes somos", los cuatro puntos de
// lib/negocio.ts en versión grande y un botón al catálogo. Header y footer
// son los mismos del catálogo; el header va blanco desde el inicio (no hay hero).
//
// Las imágenes son opcionales y la página recibe por props cuáles existen:
// - Banner: /marca/nosotros-banner.jpg con capa oscura; sin ella, #1a1a1a.
// - Foto: /marca/autor.jpg; si falta, /marca/logo-negro.png; si tampoco, el
//   texto ocupa todo el ancho.

import Link from "next/link";
import { CatalogHeader, HERO_CSS } from "@/app/components/catalog/CatalogHero";
import { numero } from "@/app/components/catalog/CatalogSections";
import { BLACK, LINE, MUTED, SERIF, SITE_CSS, SiteFooter, TEXT, WA_CATALOGO } from "@/app/components/catalog/site";
import { NOSOTROS_TEXTO, PUNTOS } from "@/lib/negocio";

/* eslint-disable @next/next/no-img-element */

export default function NosotrosPage({ banner, autor, logo }: { banner: boolean; autor: boolean; logo: boolean }) {
  const foto = autor ? "/marca/autor.jpg" : logo ? "/marca/logo-negro.png" : null;

  return (
    <div className="shop-root">
      <style>{`
        ${SITE_CSS}
        ${HERO_CSS}

        .nos-banner {
          position: relative; margin-top: 64px; min-height: clamp(220px, 42vh, 400px);
          display: flex; align-items: center; justify-content: center; text-align: center;
          background-color: #1a1a1a; background-size: cover; background-position: center; color: #fff;
          padding: 48px 16px;
        }
        @media (min-width: 768px) { .nos-banner { margin-top: 72px; } }
        .nos-banner-shade { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.4); }
        .nos-banner h1 {
          position: relative; font-family: ${SERIF}; font-weight: 500;
          font-size: clamp(44px, 9vw, 84px); line-height: 1.05; color: #fff;
        }

        .nos-quienes { display: grid; grid-template-columns: 1fr; gap: 28px; align-items: center; margin-top: 64px; }
        @media (min-width: 900px) { .nos-quienes.con-foto { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 56px; } }
        .nos-foto { width: 100%; max-width: 460px; margin: 0 auto; border-radius: 12px; overflow: hidden; background: #fff; }
        .nos-foto.autor img { display: block; width: 100%; aspect-ratio: 4 / 5; object-fit: cover; }
        .nos-foto.logo { aspect-ratio: 4 / 3; display: flex; align-items: center; justify-content: center; padding: 12%; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .nos-foto.logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .nos-texto h2 { font-family: ${SERIF}; font-weight: 500; font-size: clamp(28px, 3.6vw, 38px); color: ${BLACK}; }
        .nos-texto p { margin-top: 16px; font-size: 17px; line-height: 1.75; color: ${TEXT}; }
        .nos-quienes:not(.con-foto) .nos-texto { max-width: 760px; margin: 0 auto; text-align: center; }

        .nos-puntos { list-style: none; margin: 36px 0 0; padding: 0; display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 768px) { .nos-puntos { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; } }
        .nos-punto { background: #fff; border-radius: 12px; padding: 28px 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-top: 1px solid ${LINE}; }
        @media (min-width: 768px) { .nos-punto { padding: 36px 32px; } }
        .nos-punto-num { display: block; font-family: ${SERIF}; font-size: clamp(44px, 6vw, 60px); line-height: 1; color: #a7a7a7; }
        .nos-punto h3 { margin-top: 18px; font-size: clamp(19px, 2.2vw, 22px); font-weight: 600; color: ${BLACK}; }
        .nos-punto p { margin-top: 8px; font-size: 16px; line-height: 1.65; color: ${MUTED}; }

        .nos-cta {
          display: inline-flex; align-items: center; justify-content: center;
          background: ${BLACK}; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px;
          letter-spacing: 0.08em; text-transform: uppercase; padding: 15px 36px; border-radius: 999px;
          transition: opacity 0.2s ease;
        }
        .nos-cta:hover { opacity: 0.85; }
      `}</style>

      <CatalogHeader waHref={WA_CATALOGO} actual="nosotros" />

      <section className="nos-banner" style={banner ? { backgroundImage: "url(/marca/nosotros-banner.jpg)" } : undefined}>
        <div className="nos-banner-shade" aria-hidden="true" />
        <h1>Nosotros</h1>
      </section>

      <main className="shop-inner">
        <section className={`nos-quienes${foto ? " con-foto" : ""}`} aria-labelledby="quienes-title">
          {foto && (
            <div className={`nos-foto ${autor ? "autor" : "logo"}`}>
              <img src={foto} alt={autor ? "Quiénes somos" : "Invitaciones Digitales"} />
            </div>
          )}
          <div className="nos-texto">
            <h2 id="quienes-title">Quiénes somos</h2>
            <p>{NOSOTROS_TEXTO}</p>
          </div>
        </section>

        <section className="sec" aria-labelledby="puntos-title">
          <h2 id="puntos-title" className="shop-section-title">
            Cuidamos cada detalle de tu celebración
          </h2>
          <ol className="nos-puntos">
            {PUNTOS.map((p, i) => (
              <li key={p.titulo} className="nos-punto">
                <span className="nos-punto-num" aria-hidden="true">
                  {numero(i)}
                </span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <div style={{ textAlign: "center", marginTop: 56 }}>
          <Link href="/#catalogo" className="nos-cta">
            Ir al catálogo
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
