import type { Metadata } from "next";
import InvitationKpop from "@/app/components/kpop-guerreras/InvitationKpop";

export const metadata: Metadata = {
  title: "Invitación K-Pop Guerreras | Demo",
  description: "Demo del diseño K-Pop Guerreras para invitaciones digitales de cumpleaños infantil.",
};

export default function Page() {
  return <InvitationKpop demo />;
}
