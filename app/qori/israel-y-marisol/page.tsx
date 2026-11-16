import type { Metadata } from "next";
import InvitationQori from "@/app/components/qori/InvitationQori";

// Invitación de cliente de Israel & Marisol (diseño Qori): sin banner de demo
// y con WhatsApp real en la confirmación. El local es la Plaza de Armas del
// Cusco (default del diseño); para otro local, pasar la prop `venue` con un
// Venue de lib/venue.ts.

export const metadata: Metadata = {
  title: "Israel & Marisol — 12 de Septiembre 2026",
  description: "Estamos felices de invitarte a nuestra boda",
};

export default function Page() {
  return (
    <InvitationQori
      galeriaHref="/qori/israel-y-marisol/galeria"
      photosPath="/qori/israel-y-marisol/photos"
      // Por ahora la misma canción del demo; cuando el cliente tenga la suya
      // irá en /qori/israel-y-marisol/music.mp3
      musicSrc="/qori-demo/music.mp3"
    />
  );
}
