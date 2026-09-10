"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { StoreProduct } from "@/lib/content";
import { ProductCard } from "./product-card";

type ApiProduct = {
  id: string; slug: string; sku?: string | null; name: string; description?: string; priceCents: number; digital: boolean;
  includesTax: boolean;
  featured?: boolean;
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
    featured: product.featured,
    delivery: product.stock === 0 ? "Sin stock" : product.digital ? "Entrega digital" : "Entrega coordinada",
    description: product.description || "Producto original con soporte de Wilo Studio.",
    specs: product.specifications || [],
  };
}

export function StoreCatalog({ initialItems }: { initialItems: readonly StoreProduct[] }) {
  const [items, setItems] = useState<readonly StoreProduct[]>(initialItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [brand, setBrand] = useState("Todas");
  const [availability, setAvailability] = useState("all");
  const [price, setPrice] = useState("all");
  const [offersOnly, setOffersOnly] = useState(false);
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    fetch("/api/productos")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (Array.isArray(data.products)) setItems(data.products.map(fromApi));
      })
      .catch(() => undefined);
  }, []);

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const brands = useMemo(() => ["Todas", ...Array.from(new Set(items.map((item) => item.brand)))], [items]);
  const filtered = useMemo(() => items.filter((item) => {
    const matchesCategory = category === "Todos" || item.category === category;
    const matchesBrand = brand === "Todas" || item.brand === brand;
    const matchesAvailability = availability === "all" || (availability === "available" ? item.stock !== 0 : item.stock === 0);
    const matchesPrice = price === "all" || item.price === null || (price === "under-500" ? item.price < 500 : price === "500-1500" ? item.price >= 500 && item.price <= 1500 : item.price > 1500);
    const matchesOffers = !offersOnly || item.featured;
    const haystack = `${item.name} ${item.brand} ${item.description}`.toLowerCase();
    return matchesCategory && matchesBrand && matchesAvailability && matchesPrice && matchesOffers && haystack.includes(query.toLowerCase());
  }).sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "es");
    if (sort === "price-asc") return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY);
    if (sort === "price-desc") return (b.price ?? Number.NEGATIVE_INFINITY) - (a.price ?? Number.NEGATIVE_INFINITY);
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
  }), [items, category, brand, availability, price, offersOnly, query, sort]);

  return (
    <div className="store-catalog">
      <div className="catalog-toolbar">
        <label className="search-field"><Search aria-hidden="true" size={18} /><input aria-label="Buscar productos" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca Adobe, Microsoft, kits..." /><span aria-live="polite">{filtered.length} resultados</span></label>
        <div className="filter-label"><SlidersHorizontal size={18} /> Filtros y orden</div>
      </div>
      <div className="filter-chips" role="group" aria-label="Categorías">{categories.map((item) => <button aria-pressed={category === item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
      <div className="catalog-filters" aria-label="Filtros del catálogo">
        <label><span>Marca</span><select value={brand} onChange={(event) => setBrand(event.target.value)}>{brands.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Precio</span><select value={price} onChange={(event) => setPrice(event.target.value)}><option value="all">Cualquier precio</option><option value="under-500">Menos de S/ 500</option><option value="500-1500">S/ 500 a S/ 1,500</option><option value="over-1500">Más de S/ 1,500</option></select></label>
        <label><span>Disponibilidad</span><select value={availability} onChange={(event) => setAvailability(event.target.value)}><option value="all">Todas</option><option value="available">Disponible / consultar</option><option value="sold-out">Sin stock</option></select></label>
        <label><span>Ordenar</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Destacados</option><option value="name">Nombre</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option></select></label>
        <button type="button" aria-pressed={offersOnly} disabled={!items.some((item) => item.featured)} className={offersOnly ? "is-active" : ""} onClick={() => setOffersOnly((value) => !value)}>Ofertas ({items.filter((item) => item.featured).length})</button>
      </div>
      {filtered.length ? <div className="product-grid catalog-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="catalog-empty"><h2>No encontramos ese producto.</h2><p>Prueba con otro término o escríbenos para buscar la licencia que necesitas.</p></div>}
    </div>
  );
}
