import type { Metadata } from "next";
import InvitationPlaya from "../components/playa/InvitationPlaya";

export const metadata: Metadata = {
  title: "Invitación Playa Tropical | Demo",
  description: "Demo del diseño Playa Tropical para invitaciones digitales de boda.",
};

export default function Page() {
  return <InvitationPlaya demo />;
}
