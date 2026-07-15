import type { Metadata } from "next";
import InvitationTortuga from "@/app/components/tortuga-tropical/InvitationTortuga";

// Invitación REAL de Israel & Marisol (diseño Tortuga Tropical): sin banner de demo.

export const metadata: Metadata = {
  title: "Israel & Marisol — 12 de Septiembre 2026",
  description: "Estamos felices de invitarte a nuestra boda civil",
};

export default function Page() {
  return (
    <InvitationTortuga
      galeriaHref="/tortuga-tropical/israel-y-marisol/galeria"
      photosPath="/tortuga-tropical/israel-y-marisol/photos"
      // Por ahora la misma canción del demo; cuando el cliente tenga la suya
      // irá en /tortuga-tropical/israel-y-marisol/music.mp3
      musicSrc="/tortuga-tropical-demo/Lo_Mejor_De_Mi_Vida_Eres_Tu.mp3"
    />
  );
}
