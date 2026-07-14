import type { Metadata } from "next";
import GalleryPlaya from "@/app/components/playa/GalleryPlaya";

export const metadata: Metadata = {
  title: "Galería | Israel & Marisol",
  description: "Galería de fotos y videos de los invitados.",
};

export default function Page() {
  return (
    <GalleryPlaya
      backHref="/playa/israel-y-marisol"
      musicSrc="/playa/israel-y-marisol/music.mp3"
    />
  );
}
