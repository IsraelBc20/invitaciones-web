import type { Metadata } from "next";

// El panel es privado: no debe aparecer en buscadores. Tampoco monta
// ContentProtection (a diferencia de app/oliva|playa|tortuga-tropical): aquí sí
// hace falta poder abrir DevTools.
export const metadata: Metadata = {
  title: "Panel de Galería — Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
