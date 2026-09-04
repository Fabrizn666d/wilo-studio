"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { StoreProduct } from "@/lib/content";
import { ProductCard } from "./product-card";

type ApiProduct = {
  id: string; slug: string; sku?: string | null; name: string; description?: string; priceCents: number; digital: boolean;
  includesTax: boolean;
  currency?: string; stock?: number | null;
  licenseType?: string; licenseDuration?: string; images?: string[]; specifications?: string[];
  category?: { name: string };
};

function fromApi(product: ApiProduct): StoreProduct {
  const totalPriceCents = product.includesTax ? product.priceCents : product.priceCents + Math.round(product.priceCents * 0.18);
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    category: product.category?.name || "Tienda",
    brand: product.licenseType || product.category?.name || "Wilo Studio",
    license: [product.licenseType, product.licenseDuration].filter(Boolean).join(" · ") || "Detalle en la ficha",
    price: totalPriceCents / 100,
    currency: product.currency,
    image: product.images?.[0] || "/images/icon-sistemas.png",
    images: product.images?.length ? product.images : ["/images/icon-sistemas.png"],
    stock: product.stock,
    delivery: product.stock === 0 ? "Sin stock" : product.digital ? "Entrega digital" : "Entrega coordinada",
    description: product.description || "Producto original con soporte de Wilo Studio.",
    specs: product.specifications || [],
  };
}

export function StoreCatalog({ initialItems }: { initialItems: readonly StoreProduct[] }) {
  const [items, setItems] = useState<readonly StoreProduct[]>(initialItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  useEffect(() => {
    fetch("/api/productos")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (Array.isArray(data.products)) setItems(data.products.map(fromApi));
      })
      .catch(() => undefined);
  }, []);

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const filtered = useMemo(() => items.filter((item) => {
    const matchesCategory = category === "Todos" || item.category === category;
    const haystack = `${item.name} ${item.brand} ${item.description}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  }), [items, category, query]);

  return (
    <div className="store-catalog">
      <div className="catalog-toolbar">
        <label className="search-field"><Search aria-hidden="true" size={18} /><input aria-label="Buscar productos" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca Adobe, Microsoft, kits..." /><span aria-live="polite">{filtered.length} resultados</span></label>
        <div className="filter-label"><SlidersHorizontal size={18} /> Filtrar</div>
      </div>
      <div className="filter-chips" role="group" aria-label="Categorías">{categories.map((item) => <button aria-pressed={category === item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
      {filtered.length ? <div className="product-grid catalog-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="catalog-empty"><h2>No encontramos ese producto.</h2><p>Prueba con otro término o escríbenos para buscar la licencia que necesitas.</p></div>}
    </div>
  );
}
