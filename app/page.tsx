import type { Metadata } from "next";
import CatalogPage from "./components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Invitaciones Digitales | Diseños exclusivos para tu boda",
  description:
    "Invitaciones digitales elegantes con música, galería de fotos y cuenta regresiva. Perfectas para bodas y eventos especiales.",
};

export default function Page() {
  return <CatalogPage />;
}
