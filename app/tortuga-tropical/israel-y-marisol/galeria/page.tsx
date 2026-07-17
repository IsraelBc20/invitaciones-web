import type { Metadata } from "next";
import GalleryTortuga from "@/app/components/tortuga-tropical/GalleryTortuga";

export const metadata: Metadata = {
  title: "Galería | Israel & Marisol",
  description: "Galería de fotos y videos de los invitados.",
};

export default function Page() {
  return (
    <GalleryTortuga
      backHref="/tortuga-tropical/israel-y-marisol"
      // Por ahora la misma canción del demo; cuando el cliente tenga la suya
      // irá en /tortuga-tropical/israel-y-marisol/music.mp3
      musicSrc="/tortuga-tropical-demo/Lo_Mejor_De_Mi_Vida_Eres_Tu.mp3"
      emptyImage="/tortuga-tropical/israel-y-marisol/photos/foto-galeria.png"
    />
  );
}
