import type { Metadata } from "next";
import InvitationOliva from "../components/oliva/InvitationOliva";

export const metadata: Metadata = {
  title: "Invitación Oliva Elegante | Demo",
  description: "Demo del diseño Oliva Elegante para invitaciones digitales de boda.",
};

export default function Page() {
  return <InvitationOliva demo />;
}
