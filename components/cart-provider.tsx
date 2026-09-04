"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { StoreProduct } from "@/lib/content";

export type CartProduct = StoreProduct;
export type CartItem = { product: CartProduct; quantity: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  refresh: () => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "wilo-cart-v1";

type ApiProduct = {
  id: string;
  slug: string;
  sku?: string | null;
  name: string;
  description?: string | null;
  priceCents: number;
  includesTax: boolean;
  currency?: string;
  digital: boolean;
  stock?: number | null;
  licenseType?: string | null;
  licenseDuration?: string | null;
  images?: string[];
  specifications?: string[];
  category?: { name?: string };
};

function freshProduct(product: ApiProduct): CartProduct {
  const priceCents = product.includesTax ? product.priceCents : product.priceCents + Math.round(product.priceCents * 0.18);
  const category = product.category?.name || "Tienda";
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    category,
    brand: product.licenseType || category,
    license: [product.licenseType, product.licenseDuration].filter(Boolean).join(" · ") || "Detalle en la ficha",
    price: priceCents / 100,
    currency: product.currency,
    image: product.images?.[0] || "/images/icon-sistemas.png",
    images: product.images?.length ? product.images : ["/images/icon-sistemas.png"],
    stock: product.stock,
    delivery: product.stock === 0 ? "Sin stock" : product.digital ? "Entrega digital" : "Entrega coordinada",
    description: product.description || "Producto original con soporte de Wilo Studio.",
    specs: product.specifications || [],
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, ready]);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/productos");
    if (!response.ok) throw new Error("No pudimos actualizar el catálogo.");
    const payload = (await response.json()) as { products?: ApiProduct[] };
    if (!Array.isArray(payload.products)) throw new Error("No pudimos actualizar el catálogo.");
    const currentProducts = payload.products;
    setItems((current) => current.flatMap((item) => {
      const match = currentProducts.find((product) => product.id === item.product.id || product.slug === item.product.slug);
      if (!match || match.stock === 0) return [];
      const quantity = match.stock == null ? item.quantity : Math.min(item.quantity, match.stock);
      return quantity > 0 ? [{ product: freshProduct(match), quantity }] : [];
    }));
  }, []);

  useEffect(() => {
    if (ready) void refresh().catch(() => undefined);
  }, [ready, refresh]);

  const addItem = useCallback((product: CartProduct, quantity = 1) => {
    setItems((current) => {
      const found = current.find((item) => item.product.id === product.id);
      if (found) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...current, { product, quantity }];
    });
    setOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.product.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return removeItem(id);
    setItems((current) => current.map((item) => (item.product.id === id ? { ...item, quantity } : item)));
  }, [removeItem]);

  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0);

  const value = useMemo(
    () => ({ items, count, total, addItem, removeItem, updateQuantity, clear, refresh, open, setOpen }),
    [items, count, total, addItem, removeItem, updateQuantity, clear, refresh, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart debe usarse dentro de CartProvider");
  return value;
}
