import ContentProtection from "@/app/components/shared/ContentProtection";

// Cubre /cumpleanos/kpop-guerreras y sus clientes con la protección de
// contenido. El catálogo (/) queda fuera a propósito.
export default function KpopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ContentProtection />
      {children}
    </>
  );
}
