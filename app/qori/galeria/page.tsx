import type { Metadata } from "next";
import GalleryQori from "@/app/components/qori/GalleryQori";

export const metadata: Metadata = {
  title: "Galería | Qori",
  description: "Galería de fotos y videos de los invitados.",
};

export default function Page() {
  return <GalleryQori backHref="/qori" />;
}
