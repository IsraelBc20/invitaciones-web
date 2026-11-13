import type { Metadata } from "next";
import InvitationOliva from "@/app/components/oliva/InvitationOliva";

// Invitación REAL de Israel & Marisol (diseño Oliva): sin banner de demo.
// Las imágenes que falten en su carpeta caen a las del demo.

export const metadata: Metadata = {
  title: "Israel & Marisol — 12 de Septiembre 2026",
  description: "Estamos felices de invitarte a nuestra boda civil",
};

export default function Page() {
  return (
    <InvitationOliva
      photosPath="/oliva/israel-y-marisol/photos"
      musicSrc="/oliva/israel-y-marisol/music.mp3"
    />
  );
}
