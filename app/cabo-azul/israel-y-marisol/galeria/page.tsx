import type { Metadata } from "next";
import GalleryCaboAzul from "@/app/components/cabo-azul/GalleryCaboAzul";

export const metadata: Metadata = {
  title: "Galería | Israel & Marisol",
  description: "Galería de fotos y videos de los invitados.",
};

export default function Page() {
  return (
    <GalleryCaboAzul
      invitation="israel-y-marisol"
      backHref="/cabo-azul/israel-y-marisol"
      musicSrc="/cabo-azul-demo/music.mp3"
    />
  );
}
