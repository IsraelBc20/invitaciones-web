import type { Metadata } from "next";
import InvitationChosas from "@/app/components/chosas/InvitationChosas";

export const metadata: Metadata = {
  title: "Invitación Chosas | Demo",
  description: "Demo del diseño Chosas, una invitación digital de boda con formato de revista de lujo.",
};

export default function Page() {
  return <InvitationChosas demo />;
}
