import type { Metadata } from "next";
import InvitationKpop from "@/app/components/kpop-guerreras/InvitationKpop";

// Invitación REAL del cumpleaños de Emilia (diseño K-Pop Guerreras): sin banner
// de demo, con sus datos reales (FESTEJADA_CLIENTE en el componente y
// VENUE_EMILIA en lib/venue.ts, que aún es un placeholder).

export const metadata: Metadata = {
  title: "Emilia cumple 4 años — 27 de Noviembre 2026",
  description: "¡Estás invitado a la fiesta de cumpleaños de Emilia!",
};

export default function Page() {
  return (
    <InvitationKpop
      photosPath="/kpop-guerreras/emilia/photos"
      musicSrc="/kpop-guerreras/emilia/music.mp3"
    />
  );
}
