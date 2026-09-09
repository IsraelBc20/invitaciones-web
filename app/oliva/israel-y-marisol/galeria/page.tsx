import type { Metadata } from "next";
import GalleryOliva from "@/app/components/oliva/GalleryOliva";

export const metadata: Metadata = {
  title: "Galería | Israel & Marisol",
  description: "Galería de fotos y videos de los invitados.",
};

export default function Page() {
  return (
    <GalleryOliva
      invitation="israel-y-marisol"
      backHref="/oliva/israel-y-marisol"
      musicSrc="/oliva/israel-y-marisol/music.mp3"
    />
  );
}
