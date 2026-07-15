import type { Metadata } from "next";
import InvitationTortuga from "../components/tortuga-tropical/InvitationTortuga";

export const metadata: Metadata = {
  title: "Invitación Tortuga Tropical | Demo",
  description: "Demo del diseño Tortuga Tropical para invitaciones digitales de boda.",
};

export default function Page() {
  return <InvitationTortuga demo />;
}
