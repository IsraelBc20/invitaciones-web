import ContentProtection from "@/app/components/shared/ContentProtection";

// Cubre /tortuga-tropical y todas sus subrutas (galería y clientes) con la
// protección de contenido. El catálogo (/) queda fuera a propósito.
export default function TortugaTropicalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ContentProtection />
      {children}
    </>
  );
}
