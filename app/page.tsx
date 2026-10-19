import type { Metadata } from "next";
import CatalogPage from "./components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Invitaciones Digitales | Diseños para bodas y cumpleaños",
  description:
    "Invitaciones digitales elegantes con música, galería de fotos y cuenta regresiva. Para bodas, cumpleaños y eventos especiales.",
};

export default function Page() {
  return <CatalogPage />;
}
