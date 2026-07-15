import type { Metadata } from "next";
import GalleryTortuga from "@/app/components/tortuga-tropical/GalleryTortuga";

export const metadata: Metadata = {
  title: "Galería | Tortuga Tropical",
  description: "Galería de fotos y videos de los invitados.",
};

export default function Page() {
  return <GalleryTortuga backHref="/tortuga-tropical" />;
}
