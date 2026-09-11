import type { Metadata } from "next";
import { HomeSceneMotion } from "@/components/home/HomeSceneMotion";
import { StoreScene } from "@/components/home/StoreScene";
import { StoreCatalog } from "@/components/store-catalog";
import { getPublicProducts } from "@/lib/public-data";

export const dynamic = "force-dynamic";

const description = "Laptops, workstations, componentes, periféricos y software original con asesoría especializada en Perú.";
export const metadata: Metadata = {
  title: "Tienda de tecnología y licencias originales",
  description,
  alternates: { canonical: "/tienda" },
  openGraph: { title: "Tienda oficial | Wilo Studio", description, url: "/tienda", images: [{ url: "/brand/portfolio-showcase.webp", alt: "Tienda oficial de Wilo Studio" }] },
  twitter: { card: "summary_large_image", title: "Tienda oficial | Wilo Studio", description, images: ["/brand/portfolio-showcase.webp"] },
};

export default async function StorePage() {
  const products = await getPublicProducts();
  const catalogProducts = products.filter((product) => product.category.toLowerCase() !== "wilo education");
  return (
    <main id="contenido" className="inner-page store-page">
      <StoreScene />
      <section id="catalogo" className="section store-catalog-section"><div className="shell"><div className="section-heading split-heading"><div><span className="eyebrow">Catálogo</span><h2>Elige con confianza. <em>Nosotros te ayudamos.</em></h2></div><p>Explora tecnología para tu setup, compara opciones y recibe acompañamiento para elegir una configuración que sí responda a tu trabajo.</p></div><StoreCatalog hiddenCategories={["Wilo Education"]} initialItems={catalogProducts} /></div></section>
      <HomeSceneMotion />
    </main>
  );
}
