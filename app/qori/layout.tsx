import ContentProtection from "@/app/components/shared/ContentProtection";

// Cubre /qori y todas sus subrutas (galería y clientes) con la protección de
// contenido. El catálogo (/) queda fuera a propósito.
export default function QoriLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ContentProtection />
      {children}
    </>
  );
}
