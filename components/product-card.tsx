"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { formatSoles, type StoreProduct } from "@/lib/content";
import { useCart } from "./cart-provider";

export function ProductCard({ product, compact = false }: { product: StoreProduct; compact?: boolean }) {
  const { addItem } = useCart();
  const unavailable = product.stock === 0;
  return (
    <article className={`product-card ${compact ? "is-compact" : ""}`}>
      <Link href={`/tienda/${product.slug}`} className="product-image">
        <Image src={product.image} alt={`${product.name} — ${product.brand}`} fill sizes={compact ? "(max-width: 768px) 80vw, 30vw" : "(max-width: 768px) 100vw, 25vw"} />
        <span>{product.delivery}</span>
      </Link>
      <div className="product-copy">
        <span className="product-brand">{product.brand}</span>
        <Link href={`/tienda/${product.slug}`}><h3>{product.name}</h3></Link>
        <p>{product.license}</p>
        <div className="product-bottom">
          <strong>{product.price === null ? "Cotizar" : formatSoles(product.price)}</strong>
          <button disabled={unavailable} type="button" onClick={() => addItem(product)} aria-label={unavailable ? `${product.name} sin stock` : `Agregar ${product.name} al carrito`}><ShoppingBag aria-hidden="true" size={18} /><span>{unavailable ? "Sin stock" : "Agregar"}</span></button>
        </div>
      </div>
      <Link className="product-arrow" href={`/tienda/${product.slug}`} aria-label={`Ver ${product.name}`}><ArrowUpRight size={18} /></Link>
    </article>
  );
}
