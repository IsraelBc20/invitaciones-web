import type { Metadata } from "next";
import GalleryOliva from "@/app/components/oliva/GalleryOliva";

export const metadata: Metadata = {
  title: "Galería | Oliva Elegante",
  description: "Galería de fotos y videos de los invitados.",
};

export default function Page() {
  return <GalleryOliva backHref="/oliva" />;
}
