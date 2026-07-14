import ContentProtection from "@/app/components/shared/ContentProtection";

// Cubre /playa y todas sus subrutas (galería y clientes) con la protección de
// contenido. El catálogo (/) queda fuera a propósito.
export default function PlayaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ContentProtection />
      {children}
    </>
  );
}
