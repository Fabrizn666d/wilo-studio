import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, MessageCircle, XCircle } from "lucide-react";
import { whatsappLinkFor } from "@/lib/content";
import { verifyPaymentReturnToken } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Resultado del pago",
  description: "Estado de tu pago en Wilo Studio.",
  alternates: { canonical: "/checkout/resultado" },
  robots: { index: false, follow: false },
};

type ResultState = "aprobado" | "pendiente" | "fallido";

const resultCopy: Record<ResultState, { title: string; message: string }> = {
  aprobado: {
    title: "Tu pago fue confirmado.",
    message: "El proveedor confirmó la operación. Te enviaremos la entrega y el comprobante al correo registrado.",
  },
  pendiente: {
    title: "Tu pago está pendiente.",
    message: "El proveedor aún está procesando la operación. No necesitas pagar de nuevo; te avisaremos cuando cambie el estado.",
  },
  fallido: {
    title: "El pago no se completó.",
    message: "No se confirmó ningún cobro. Puedes volver a la tienda o escribirnos para elegir otra forma de pago.",
  },
};

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string; resultado?: string; retorno?: string }>;
}) {
  const query = await searchParams;
  const settings = await getPublicSiteSettings();
  const requestedOrder = typeof query.pedido === "string" && /^WS-[A-Z0-9-]+$/.test(query.pedido) ? query.pedido : "";
  const returnToken = typeof query.retorno === "string" ? query.retorno : "";
  const outcome = ["success", "pending", "failure"].includes(query.resultado || "")
    ? (query.resultado as "success" | "pending" | "failure")
    : null;
  let state: ResultState = "fallido";
  let orderNumber = "";
  let verified = false;
  if (requestedOrder && outcome && returnToken.length >= 32 && returnToken.length <= 200) {
    try {
      const order = await prisma.order.findUnique({
        where: { number: requestedOrder },
        select: { number: true, status: true },
      });
      if (order && verifyPaymentReturnToken(order.number, outcome, returnToken)) {
        verified = true;
        orderNumber = order.number;
        state = ["PAID", "DELIVERING", "DELIVERED"].includes(order.status)
          ? "aprobado"
          : ["CANCELLED", "REFUNDED"].includes(order.status)
            ? "fallido"
            : outcome === "failure" ? "fallido" : "pendiente";
      }
    } catch {}
  }
  const copy = verified
    ? resultCopy[state]
    : { title: "No pudimos verificar este retorno.", message: "El enlace no contiene una referencia válida del pedido. No confirma ningún cobro; escríbenos si necesitas revisar la operación." };
  const Icon = state === "aprobado" ? CheckCircle2 : state === "fallido" ? XCircle : Clock3;
  const supportUrl = whatsappLinkFor(settings.phone,
    `Hola Wilo Studio, necesito ayuda con ${orderNumber ? `el pedido ${orderNumber}` : "un pago de la tienda"}.`,
  );

  return (
    <main id="contenido" className="inner-page checkout-page">
      <section className="checkout-shell section-cream">
        <div className="shell">
          <div className={`payment-result payment-result-${state}`}>
            <Icon aria-hidden="true" />
            <span className="eyebrow">Resultado del pago</span>
            <h1>{copy.title}</h1>
            {orderNumber && <strong>Pedido {orderNumber}</strong>}
            <p>{copy.message}</p>
            <div>
              <Link className="button button-dark" href="/tienda">Volver a la tienda</Link>
              <a className="button button-whatsapp" href={supportUrl} target="_blank" rel="noreferrer">
                <MessageCircle /> Hablar con soporte
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
