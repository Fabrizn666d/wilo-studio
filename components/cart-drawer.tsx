"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { formatSoles } from "@/lib/content";
import { useCart } from "./cart-provider";

export function CartDrawer() {
  const { items, total, open, setOpen, removeItem, updateQuantity } = useCart();
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.tabIndex >= 0);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [open, setOpen]);

  return (
    <>
      <button className={`cart-backdrop ${open ? "is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" tabIndex={-1} />
      <aside
        aria-hidden={!open}
        aria-labelledby="cart-drawer-title"
        aria-modal="true"
        className={`cart-drawer ${open ? "is-open" : ""}`}
        id="cart-drawer"
        inert={!open}
        ref={dialogRef}
        role="dialog"
      >
        <div className="cart-head">
          <div><span className="eyebrow">Tu selección</span><h2 id="cart-drawer-title">Carrito</h2></div>
          <button className="icon-button" onClick={() => setOpen(false)} aria-label="Cerrar carrito" ref={closeButtonRef}><X /></button>
        </div>
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart"><ShoppingBag size={35} /><h3>Tu carrito está esperando.</h3><p>Elige una licencia original o un kit educativo.</p><Link className="button button-dark" href="/tienda" onClick={() => setOpen(false)}>Explorar tienda</Link></div>
          ) : items.map(({ product, quantity }) => (
            <article className="cart-line" key={product.id}>
              <div className="cart-line-image"><Image src={product.image} alt="" fill sizes="84px" /></div>
              <div><span>{product.brand}</span><h3>{product.name}</h3><strong>{product.price === null ? "Precio por confirmar" : formatSoles(product.price)}</strong><div className="quantity"><button onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="Restar"><Minus size={14} /></button><span>{quantity}</span><button onClick={() => updateQuantity(product.id, quantity + 1)} aria-label="Sumar"><Plus size={14} /></button></div></div>
              <button className="remove-line" onClick={() => removeItem(product.id)} aria-label={`Quitar ${product.name}`}><Trash2 size={17} /></button>
            </article>
          ))}
        </div>
        {items.length > 0 && <div className="cart-summary"><div><span>{items.some((item) => item.product.price === null) ? "Total por confirmar" : "Total"}</span><strong>{items.some((item) => item.product.price === null) ? "Cotización" : formatSoles(total)}</strong></div><p>La disponibilidad, vigencia y precio final se confirman antes del pago.</p><Link className="button button-yellow" href="/checkout" onClick={() => setOpen(false)}>Continuar al checkout</Link></div>}
      </aside>
    </>
  );
}
