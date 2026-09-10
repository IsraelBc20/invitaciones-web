import type { Metadata } from "next";
import InvitationCaboAzul from "@/app/components/cabo-azul/InvitationCaboAzul";

// Invitación REAL de Israel & Marisol (diseño Cabo Azul): sin banner de demo,
// con la dirección y los nombres reales (ver lib/venue.ts y lib/couple.ts).

export const metadata: Metadata = {
  title: "Israel & Marisol — 12 de Septiembre 2026",
  description: "Estamos felices de invitarte a nuestra boda civil",
};

export default function Page() {
  return (
    <InvitationCaboAzul
      invitation="israel-y-marisol"
      galeriaHref="/cabo-azul/israel-y-marisol/galeria"
      photosPath="/cabo-azul/israel-y-marisol/photos"
      // Por ahora la misma canción del demo; cuando el cliente tenga la suya
      // irá en /cabo-azul/israel-y-marisol/music.mp3
      musicSrc="/cabo-azul-demo/music.mp3"
    />
  );
}
