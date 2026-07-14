import type { Metadata } from "next";
import InvitationPlaya from "@/app/components/playa/InvitationPlaya";

// Invitación REAL de Israel & Marisol (diseño Playa): sin banner de demo.

export const metadata: Metadata = {
  title: "Israel & Marisol — 12 de Septiembre 2026",
  description: "Estamos felices de invitarte a nuestra boda civil",
};

export default function Page() {
  return <InvitationPlaya galeriaHref="/playa/israel-y-marisol/galeria" />;
}
