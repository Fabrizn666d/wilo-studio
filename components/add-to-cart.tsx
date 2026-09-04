"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { StoreProduct } from "@/lib/content";
import { useCart } from "./cart-provider";

export function AddToCart({ product, large = false }: { product: StoreProduct; large?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const unavailable = product.stock === 0;
  return (
    <button className={`button button-dark ${large ? "button-large" : ""}`} disabled={unavailable} type="button" onClick={() => { addItem(product); setAdded(true); window.setTimeout(() => setAdded(false), 1600); }}>
      {added ? <Check size={19} /> : <ShoppingBag size={19} />} {unavailable ? "Sin stock" : added ? "Agregado" : product.price === null ? "Agregar para cotizar" : "Agregar al carrito"}
    </button>
  );
}
