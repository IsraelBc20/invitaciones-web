import type { Metadata } from "next";
import GalleryOliva from "@/app/components/oliva/GalleryOliva";

export const metadata: Metadata = {
  title: "Galería | Israel & Marisol",
  description: "Galería de fotos y videos de los invitados.",
};

export default function Page() {
  return <GalleryOliva backHref="/oliva/israel-y-marisol" />;
}
