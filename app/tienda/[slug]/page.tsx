import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Check, Clock3, MessageCircle, PackageCheck, ShieldCheck } from "lucide-react";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { formatSoles } from "@/lib/content";
import { getPublicProduct, getPublicProducts } from "@/lib/public-data";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProduct(slug);
  if (!product) return { title: "Producto no disponible", robots: { index: false, follow: false } };
  const canonical = `/tienda/${product.slug}`;
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical },
    openGraph: { title: product.name, description: product.description, url: canonical, images: [{ url: product.image, alt: product.name }] },
    twitter: { card: "summary_large_image", title: product.name, description: product.description, images: [product.image] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, settings] = await Promise.all([params, getPublicSiteSettings()]);
  const [product, products] = await Promise.all([getPublicProduct(slug), getPublicProducts()]);
  if (!product) notFound();
  const related = products.filter((item) => item.category === product.category && item.slug !== product.slug).slice(0, 3);
  const images = [...new Set(product.images?.length ? product.images : [product.image])];
  const stockLabel = product.stock == null ? "Disponibilidad por confirmar" : product.stock === 0 ? "Sin stock" : `${product.stock} ${product.stock === 1 ? "unidad disponible" : "unidades disponibles"}`;
  const canonicalUrl = `${settings.url}/tienda/${product.slug}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.map((image) => new URL(image, settings.url).toString()),
    ...(product.sku ? { sku: product.sku } : {}),
    brand: { "@type": "Brand", name: product.brand },
    ...(product.price === null ? {} : {
      offers: {
        "@type": "Offer",
        url: canonicalUrl,
        priceCurrency: product.currency || "PEN",
        price: product.price.toFixed(2),
        availability: product.stock === 0 ? "https://schema.org/OutOfStock" : product.stock == null ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    }),
  };
  return (
    <main id="contenido" className="inner-page product-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, "\\u003c") }} />
      <section className="product-detail section-cream"><div className="shell"><Link className="back-link" href="/tienda"><ArrowLeft /> Volver a la tienda</Link><div className="product-detail-grid"><ProductGallery images={images} productName={product.name} stockLabel={stockLabel} /><div className="product-detail-copy"><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><p className="product-license">{product.license}</p><p className="product-description">{product.description}</p><div className="detail-price"><span>{product.price === null ? "Precio por confirmar" : "Precio con IGV"}</span><strong>{product.price === null ? "Cotiza disponibilidad" : formatSoles(product.price)}</strong><small>{stockLabel} · {product.delivery}</small></div><div className="detail-actions"><AddToCart product={product} large /><a className="button button-ghost button-large" href={settings.whatsapp} target="_blank" rel="noreferrer"><MessageCircle /> Consultar</a></div><div className="purchase-reassurance"><span><BadgeCheck /> Licencia original</span><span><ShieldCheck /> Compra segura</span><span><PackageCheck /> Soporte de activación</span></div></div></div></div></section>
      <section className="section product-info-section section-dark"><div className="shell product-info-grid"><div><span className="eyebrow eyebrow-light">Especificaciones</span><h2>Lo que recibirás.</h2><p>Antes del pago confirmamos versión, compatibilidad, vigencia, stock y modalidad exacta.</p></div><ul>{product.specs.map((item) => <li key={item}><Check /> {item}</li>)}<li><Clock3 /> Entrega coordinada después de confirmar el pago</li><li><BadgeCheck /> Boleta o factura electrónica</li></ul></div></section>
      {related.length > 0 && <section className="section section-cream"><div className="shell"><div className="section-heading"><span className="eyebrow">También te puede interesar</span><h2>Más opciones <em>para tu equipo.</em></h2></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} compact />)}</div></div></section>}
    </main>
  );
}
