import type { Metadata } from "next";
import InvitationQori from "@/app/components/qori/InvitationQori";

export const metadata: Metadata = {
  title: "Invitación Qori | Demo",
  description: "Demo del diseño Qori, una invitación digital de boda con alma andina.",
};

export default function Page() {
  return <InvitationQori demo />;
}
