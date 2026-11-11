import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import NosotrosPage from "@/app/components/catalog/NosotrosPage";

export const metadata: Metadata = {
  title: "Nosotros | Invitaciones Digitales",
  description:
    "Somos un emprendimiento de Huaral, Perú, que crea invitaciones digitales para bodas, cumpleaños y celebraciones especiales.",
};

// Las imágenes de /marca/ son opcionales: se comprueba aquí (en el servidor,
// al generar la página) cuáles existen, para que el navegador nunca pida un
// archivo que no está ni muestre un recuadro roto.
const existe = (archivo: string) => existsSync(join(process.cwd(), "public", "marca", archivo));

export default function Page() {
  return (
    <NosotrosPage
      banner={existe("nosotros-banner.jpg")}
      autor={existe("autor.jpg")}
      logo={existe("logo-negro.png")}
    />
  );
}
