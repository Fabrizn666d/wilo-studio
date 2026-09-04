import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Checkout", description: "Completa tu compra en la tienda oficial de Wilo Studio.", alternates: { canonical: "/checkout" }, robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return <main id="contenido" className="inner-page checkout-page"><section className="checkout-shell section-cream"><div className="shell"><Link className="back-link" href="/tienda"><ArrowLeft /> Seguir comprando</Link><div className="checkout-title"><span className="eyebrow">Checkout seguro</span><h1>Finaliza tu compra.</h1><p>Primero confirmamos disponibilidad, modalidad y precio. Luego procesamos el pago y la entrega.</p></div><CheckoutForm /></div></section></main>;
}
