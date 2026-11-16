import type { Metadata } from "next";
import GalleryChosas from "@/app/components/chosas/GalleryChosas";

export const metadata: Metadata = {
  title: "Galería | Israel & Marisol",
  description: "Galería de fotos y videos de los invitados.",
};

export default function Page() {
  return (
    <GalleryChosas
      invitation="israel-y-marisol"
      backHref="/chosas/israel-y-marisol"
      musicSrc="/chosas-demo/music.mp3"
    />
  );
}
