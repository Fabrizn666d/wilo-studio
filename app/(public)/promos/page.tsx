import type { Metadata } from "next";
import { PromotionsFeed } from "@/components/public-routes/promotions-feed";
import { PublicHero, RouteCta } from "@/components/public-routes/route-ui";

export const metadata: Metadata = {
  title: "Promociones vigentes",
  description: "Consulta las promociones activas de Wilo Studio, sus beneficios y fechas de vigencia.",
  alternates: { canonical: "/promos" },
  openGraph: { title: "Promociones | Wilo Studio", description: "Beneficios vigentes publicados directamente por Wilo Studio.", url: "/promos", images: [{ url: "/brand/promo-agosto.webp", alt: "Promociones de Wilo Studio" }] },
  twitter: { card: "summary_large_image", title: "Promociones | Wilo Studio", description: "Beneficios vigentes publicados directamente por Wilo Studio.", images: ["/brand/promo-agosto.webp"] },
};

export default function PromotionsPage() {
  return (
    <main id="contenido" className="pr-page">
      <PublicHero
        badge="Contenido administrable"
        description="Aquí aparecen únicamente las promociones activadas por nuestro equipo y dentro de su periodo de vigencia. Sin artes vencidos ni condiciones ocultas."
        eyebrow="Promociones Wilo"
        tone="dark"
        title={<>Una oportunidad para hacer <em>más con tu proyecto.</em></>}
      >
        <a className="pr-button pr-button--yellow" href="#vigentes">Ver promociones vigentes</a>
      </PublicHero>
      <section className="pr-section pr-section--dark pr-promos-section" id="vigentes"><div className="pr-shell"><PromotionsFeed /></div></section>
      <RouteCta message="Hola Wilo Studio, quiero consultar por sus promociones vigentes." title="¿Tienes un proyecto en mente? Revisemos qué beneficio aplica." />
    </main>
  );
}
