import type { Metadata } from "next";
import InvitationChosas from "@/app/components/chosas/InvitationChosas";

// Invitación de cliente de Israel & Marisol (diseño Chosas): sin banner de demo
// y con WhatsApp real en la confirmación. Al no llevar la prop `demo`, muestra
// la dirección real del local (VENUE_REAL de lib/venue.ts).

export const metadata: Metadata = {
  title: "Israel & Marisol — 12 de Septiembre 2026",
  description: "Estamos felices de invitarte a nuestra boda",
};

export default function Page() {
  return (
    <InvitationChosas
      galeriaHref="/chosas/israel-y-marisol/galeria"
      photosPath="/chosas/israel-y-marisol/photos"
      // Por ahora la misma canción del demo; cuando el cliente tenga la suya
      // irá en /chosas/israel-y-marisol/music.mp3
      musicSrc="/chosas-demo/music.mp3"
    />
  );
}
