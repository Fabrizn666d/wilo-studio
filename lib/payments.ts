import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpError } from "@/lib/api";
import { createPaymentReturnToken } from "@/lib/crypto";

type CheckoutItem = { id: string; title: string; quantity: number; unitPriceCents: number; currency: string };

type MercadoPagoPreference = {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  message?: string;
};

export async function createMercadoPagoPreference(input: {
  orderNumber: string;
  customerName: string;
  email: string;
  items: CheckoutItem[];
  expiresAt: Date;
}) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  const siteUrl = process.env.SITE_URL || process.env.NEXTAUTH_URL;
  if (!accessToken || !siteUrl || !process.env.MP_WEBHOOK_SECRET) {
    throw new HttpError(503, "Mercado Pago no está completamente configurado.", "PAYMENT_PROVIDER_UNAVAILABLE");
  }
  const baseUrl = new URL(siteUrl);
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": input.orderNumber,
    },
    body: JSON.stringify({
      items: input.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        currency_id: item.currency,
        unit_price: item.unitPriceCents / 100,
      })),
      payer: { name: input.customerName, email: input.email },
      external_reference: input.orderNumber,
      back_urls: {
        success: new URL(`/checkout/resultado?pedido=${encodeURIComponent(input.orderNumber)}&resultado=success&retorno=${encodeURIComponent(createPaymentReturnToken(input.orderNumber, "success"))}`, baseUrl).toString(),
        pending: new URL(`/checkout/resultado?pedido=${encodeURIComponent(input.orderNumber)}&resultado=pending&retorno=${encodeURIComponent(createPaymentReturnToken(input.orderNumber, "pending"))}`, baseUrl).toString(),
        failure: new URL(`/checkout/resultado?pedido=${encodeURIComponent(input.orderNumber)}&resultado=failure&retorno=${encodeURIComponent(createPaymentReturnToken(input.orderNumber, "failure"))}`, baseUrl).toString(),
      },
      notification_url: new URL("/api/pagos/mercado-pago/webhook", baseUrl).toString(),
      auto_return: "approved",
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: input.expiresAt.toISOString(),
    }),
    signal: AbortSignal.timeout(12_000),
  });
  const payload = (await response.json().catch(() => ({}))) as MercadoPagoPreference;
  if (!response.ok || !payload.id || !payload.init_point) {
    console.error("Mercado Pago preference error", { status: response.status, message: payload.message });
    throw new HttpError(502, "No pudimos iniciar el pago online. Inténtalo nuevamente.", "PAYMENT_PROVIDER_ERROR");
  }
  return {
    provider: "MERCADO_PAGO" as const,
    reference: payload.id,
    checkoutUrl: process.env.NODE_ENV === "production" ? payload.init_point : payload.sandbox_init_point || payload.init_point,
  };
}

export function verifyMercadoPagoSignature(input: {
  signature: string | null;
  requestId: string | null;
  dataId: string;
}) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret || !input.signature || !input.requestId) return false;
  const parts = Object.fromEntries(
    input.signature.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    }),
  );
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${input.dataId.toLowerCase()};request-id:${input.requestId};ts:${parts.ts};`;
  const calculated = Buffer.from(createHmac("sha256", secret).update(manifest).digest("hex"), "hex");
  const received = Buffer.from(parts.v1, "hex");
  return calculated.length === received.length && timingSafeEqual(calculated, received);
}

type MercadoPagoPayment = {
  id: number | string;
  status: string;
  external_reference: string | null;
  transaction_amount: number;
  currency_id: string;
};

export async function getMercadoPagoPayment(id: string): Promise<MercadoPagoPayment> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new HttpError(503, "Mercado Pago no está configurado.", "PAYMENT_PROVIDER_UNAVAILABLE");
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new HttpError(502, "No se pudo verificar el pago.", "PAYMENT_VERIFICATION_ERROR");
  return (await response.json()) as MercadoPagoPayment;
}
