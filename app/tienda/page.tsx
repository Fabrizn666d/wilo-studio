import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, GraduationCap, PackageCheck, ShieldCheck } from "lucide-react";
import { StoreCatalog } from "@/components/store-catalog";
import { getPublicProducts } from "@/lib/public-data";

export const dynamic = "force-dynamic";

const description = "Licencias Adobe, Corel, Microsoft y kits de robótica Wilo Education en Perú, con soporte y comprobante electrónico.";
export const metadata: Metadata = {
  title: "Tienda de licencias originales y kits STEM",
  description,
  alternates: { canonical: "/tienda" },
  openGraph: { title: "Tienda oficial | Wilo Studio", description, url: "/tienda", images: [{ url: "/brand/portfolio-showcase.webp", alt: "Tienda oficial de Wilo Studio" }] },
  twitter: { card: "summary_large_image", title: "Tienda oficial | Wilo Studio", description, images: ["/brand/portfolio-showcase.webp"] },
};

export default async function StorePage() {
  const products = await getPublicProducts();
  return (
    <main id="contenido" className="inner-page store-page">
      <section className="store-hero section-dark"><div className="store-hero-glow" /><div className="shell store-hero-grid"><div><span className="eyebrow eyebrow-light">Tienda oficial Wilo</span><h1>Herramientas originales para <em>crear, trabajar y aprender.</em></h1><p>Licencias de software y kits de robótica con orientación antes de comprar, comprobante electrónico y soporte real.</p><a href="#catalogo" className="button button-yellow button-large">Explorar productos <ArrowRight /></a></div><div className="store-hero-cards"><article><BadgeCheck /><span>Software original</span><strong>Licencias verificadas y activación acompañada.</strong></article><article><GraduationCap /><span>Wilo Education</span><strong>Kits STEM para aprender construyendo.</strong></article></div></div></section>
      <section className="shop-benefits"><div className="shell"><span><ShieldCheck /> Compra acompañada</span><span><PackageCheck /> Entrega digital o coordinada</span><span><BadgeCheck /> Boleta o factura electrónica</span><Link href="/medios-de-pago">Medios de pago <ArrowRight /></Link></div></section>
      <section id="catalogo" className="section section-cream"><div className="shell"><div className="section-heading split-heading"><div><span className="eyebrow">Catálogo</span><h2>Elige con confianza. <em>Nosotros te ayudamos.</em></h2></div><p>Mientras completamos precios y stock, puedes añadir productos al carrito y pedir una cotización exacta sin asumir datos que no están confirmados.</p></div><StoreCatalog initialItems={products} /></div></section>
    </main>
  );
}
