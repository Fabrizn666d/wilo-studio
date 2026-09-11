import type { Metadata } from "next";
import { RealSitesShowcase } from "@/components/showcase/RealSitesShowcase";

export const metadata: Metadata = {
  title: "Sitios web reales",
  description: "Una selección privada de proyectos web reales desarrollados por Wilo Studio.",
  robots: { index: false, follow: false },
};

export default function RealSitesPage() {
  return <RealSitesShowcase />;
}
