"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, LoaderCircle, PackageOpen } from "lucide-react";
import { useEffect, useState } from "react";

type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  images?: unknown;
  priceCents: number;
  currency: string;
  includesTax: boolean;
  stock?: number | null;
};

function productImage(product: StoreProduct) {
  if (!Array.isArray(product.images)) return null;
  const source = product.images.find((item): item is string => typeof item === "string" && item.startsWith("/"));
  return source ?? null;
}

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: currency || "PEN" }).format(cents / 100);
}

export function EducationCatalog() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/productos?category=wilo-education", { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as { ok?: boolean; products?: StoreProduct[] };
        if (!response.ok || !payload.ok) throw new Error("catalog");
        setProducts(payload.products ?? []);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  if (status === "loading") return <div className="pr-feed-state"><LoaderCircle className="pr-spin" aria-hidden="true" /><p>Consultando el catálogo de la tienda…</p></div>;
  if (status === "error") return <div className="pr-feed-state"><PackageOpen aria-hidden="true" /><p>No pudimos consultar el catálogo en este momento.</p><Link href="/tienda">Ir a la tienda</Link></div>;
  if (!products.length) return <div className="pr-feed-state"><PackageOpen aria-hidden="true" /><p>Los kits se publicarán aquí cuando su ficha, stock y precio estén confirmados.</p><a href="https://wa.me/51919699194?text=Hola%20Wilo%20Studio%2C%20quiero%20informaci%C3%B3n%20sobre%20los%20kits%20Wilo%20Education." rel="noreferrer" target="_blank">Consultar por WhatsApp</a></div>;

  return (
    <div className="pr-product-grid">
      {products.map((product) => {
        const image = productImage(product);
        const priceWithTax = product.includesTax ? product.priceCents : product.priceCents + Math.round(product.priceCents * 0.18);
        const stockLabel = product.stock == null ? "Stock por confirmar" : product.stock === 0 ? "Sin stock" : `${product.stock} ${product.stock === 1 ? "unidad" : "unidades"}`;
        return (
          <article className="pr-product-card" key={product.id}>
            <div className="pr-product-card__image">
              {image ? <Image alt={product.name} fill sizes="(max-width: 680px) 100vw, 33vw" src={image} /> : <PackageOpen aria-hidden="true" size={50} />}
            </div>
            <span>Wilo Education</span>
            <h3>{product.name}</h3>
            {product.description ? <p>{product.description}</p> : null}
            <div className="pr-product-card__bottom">
              <strong>{money(priceWithTax, product.currency)}</strong>
              <small>IGV incluido · {stockLabel}</small>
              <Link aria-label={`Ver ${product.name}`} href={`/tienda/${product.slug}`}><ArrowUpRight aria-hidden="true" /></Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
