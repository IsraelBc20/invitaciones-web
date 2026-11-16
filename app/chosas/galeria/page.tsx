import type { Metadata } from "next";
import GalleryChosas from "@/app/components/chosas/GalleryChosas";

export const metadata: Metadata = {
  title: "Galería | Chosas",
  description: "Galería de fotos y videos de los invitados.",
};

export default function Page() {
  return <GalleryChosas backHref="/chosas" />;
}
