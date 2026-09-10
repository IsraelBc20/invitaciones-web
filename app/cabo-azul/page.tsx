import type { Metadata } from "next";
import InvitationCaboAzul from "@/app/components/cabo-azul/InvitationCaboAzul";

export const metadata: Metadata = {
  title: "Invitación Cabo Azul | Demo",
  description: "Demo del diseño Cabo Azul para invitaciones digitales de boda.",
};

export default function Page() {
  return <InvitationCaboAzul demo />;
}
