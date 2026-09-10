import type { Metadata } from "next";
import GalleryCaboAzul from "@/app/components/cabo-azul/GalleryCaboAzul";

export const metadata: Metadata = {
  title: "Galería | Cabo Azul",
  description: "Galería de fotos y videos de los invitados.",
};

export default function Page() {
  return <GalleryCaboAzul backHref="/cabo-azul" />;
}
