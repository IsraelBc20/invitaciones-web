import type { Metadata } from "next";
import GalleryQori from "@/app/components/qori/GalleryQori";

export const metadata: Metadata = {
  title: "Galería | Israel & Marisol",
  description: "Galería de fotos y videos de los invitados.",
};

export default function Page() {
  return (
    <GalleryQori
      invitation="israel-y-marisol"
      backHref="/qori/israel-y-marisol"
      musicSrc="/qori-demo/music.mp3"
    />
  );
}
