"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, BadgePercent, Banknote, CheckCircle2, ChevronRight, CreditCard, FileUp, Loader2, MessageCircle, ReceiptText, Send, ShieldCheck, Truck } from "lucide-react";
import { formatSoles, whatsappLinkFor } from "@/lib/content";
import { useCart } from "./cart-provider";
import { useSiteSettings } from "./site-settings-provider";

export function CheckoutForm() {
  const settings = useSiteSettings();
  const { items, total, clear, refresh } = useCart();
  const [documentType, setDocumentType] = useState<"BOLETA" | "FACTURA">("BOLETA");
  const [payment, setPayment] = useState<"ONLINE" | "MANUAL" | "WHATSAPP">("WHATSAPP");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [voucherRetry, setVoucherRetry] = useState<{ number: string; email: string; token: string } | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoState, setPromoState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [promoFeedback, setPromoFeedback] = useState("");
  const [promotion, setPromotion] = useState<{ code: string; discountCents: number; totalCents: number; title: string } | null>(null);
  const startedAt = useRef(Date.now());
  const requiresQuote = items.some((item) => item.product.price === null || !/^c[a-z0-9]{20,}$/i.test(item.product.id));
  const summary = useMemo(() => items.map((item) => `• ${item.product.name} x${item.quantity}${item.product.price === null ? " (precio por confirmar)" : ` — ${formatSoles(item.product.price * item.quantity)}`}`).join("\n"), [items]);
  const payableTotal = promotion ? promotion.totalCents / 100 : total;
  const whatsapp = whatsappLinkFor(settings.phone, `Hola Wilo Studio, quiero comprar:\n${summary}\n${promotion ? `Cupón: ${promotion.code}\nDescuento: -${formatSoles(promotion.discountCents / 100)}\n` : ""}${requiresQuote ? "Por favor confirmen precio y disponibilidad." : `Total: ${formatSoles(payableTotal)}`}`);

  async function applyCoupon() {
    if (!promoCode.trim() || requiresQuote) return;
    setPromoState("loading");
    setPromoFeedback("");
    try {
      const response = await fetch("/api/cupones/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })) }),
      });
      const data = await response.json();
      if (!response.ok || !data.promotion) throw new Error(data.error || "No pudimos validar el cupón.");
      setPromotion(data.promotion);
      setPromoCode(data.promotion.code);
      setPromoState("success");
      setPromoFeedback(`${data.promotion.title}: descuento aplicado.`);
    } catch (error) {
      setPromotion(null);
      setPromoState("error");
      setPromoFeedback(error instanceof Error ? error.message : "No pudimos validar el cupón.");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setState("loading");
    setFeedback("");
    try {
      if (requiresQuote) {
        const response = await fetch("/api/cotizador", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.get("customerName"), company: form.get("companyName") || undefined,
            phone: form.get("phone"), email: form.get("email"), projectType: "Compra en tienda",
            features: items.map((item) => `${item.product.name} x${item.quantity}`),
            message: "Solicitud de precio, vigencia y disponibilidad desde el carrito.",
            consent: form.get("consent") === "yes",
            clientElapsedMs: Math.max(1_000, Date.now() - startedAt.current),
            website: form.get("website"),
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No pudimos registrar la solicitud.");
        setState("success");
        setFeedback("Recibimos tu carrito. Te contactaremos para confirmar precio, vigencia y disponibilidad antes de cualquier pago.");
        clear();
        return;
      }

      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("customerName"), email: form.get("email"), phone: form.get("phone"),
          documentType, documentNumber: form.get("documentNumber") || undefined,
          companyName: form.get("companyName") || undefined, companyRuc: form.get("companyRuc") || undefined,
          department: form.get("department") || undefined, province: form.get("province") || undefined,
          district: form.get("district") || undefined, address: form.get("address") || undefined,
          addressReference: form.get("addressReference") || undefined,
          promoCode: promotion?.code,
          paymentMethod: payment, notes: form.get("notes") || undefined, website: form.get("website"),
          expectedTotalCents: Math.round(payableTotal * 100),
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          await refresh().catch(() => undefined);
          throw new Error("Actualizamos el carrito con el precio y stock vigentes. Revísalo y vuelve a intentarlo.");
        }
        throw new Error(data.error || "No pudimos crear el pedido.");
      }
      const number = data.order.number as string;
      setOrderNumber(number);
      if (payment === "WHATSAPP") {
        const location = [form.get("department"), form.get("province"), form.get("district")].filter(Boolean).join(" · ");
        const message = [
          `Hola Wilo Studio, acabo de registrar el pedido ${number}.`,
          "",
          "PRODUCTOS",
          summary,
          "",
          `Subtotal: ${formatSoles(total)}`,
          promotion ? `Cupón ${promotion.code}: -${formatSoles(promotion.discountCents / 100)}` : "",
          `Total: ${formatSoles(payableTotal)}`,
          "",
          "CLIENTE",
          `Nombre: ${form.get("customerName")}`,
          `Correo: ${form.get("email")}`,
          `Teléfono: ${form.get("phone")}`,
          location ? `Ubicación: ${location}` : "",
          form.get("address") ? `Dirección: ${form.get("address")}` : "",
          form.get("addressReference") ? `Referencia: ${form.get("addressReference")}` : "",
          form.get("notes") ? `Observaciones: ${form.get("notes")}` : "",
        ].filter(Boolean).join("\n");
        clear();
        window.location.assign(whatsappLinkFor(settings.phone, message));
        return;
      }
      if (payment === "ONLINE") {
        const checkoutUrl = data.payment?.checkoutUrl;
        if (typeof checkoutUrl !== "string" || !/^https:\/\//i.test(checkoutUrl)) {
          throw new Error("El pedido se creó, pero no recibimos un enlace de pago válido. Contáctanos con tu número de pedido.");
        }
        clear();
        window.location.assign(checkoutUrl);
        return;
      }
      const voucher = form.get("voucher");
      clear();
      if (payment === "MANUAL" && voucher instanceof File && voucher.size > 0 && data.voucherAccessToken) {
        const upload = new FormData();
        upload.append("orderNumber", number); upload.append("email", String(form.get("email"))); upload.append("token", data.voucherAccessToken); upload.append("file", voucher);
        const voucherResponse = await fetch("/api/pedidos/voucher", { method: "POST", body: upload });
        if (!voucherResponse.ok) {
          setVoucherRetry({ number, email: String(form.get("email")), token: data.voucherAccessToken });
          setState("error");
          setFeedback("El pedido quedó creado, pero no pudimos subir el voucher. Intenta adjuntarlo nuevamente sin crear otro pedido.");
          return;
        }
      }
      setState("success");
      setFeedback(payment === "MANUAL" ? "Pedido recibido. Verificaremos tu comprobante y te avisaremos por correo." : "Pedido recibido. Continúa con el pago seguro para completar la compra.");
      clear();
    } catch (error) {
      setState("error");
      setFeedback(error instanceof Error ? error.message : "No pudimos procesar el pedido.");
    }
  }

  async function retryVoucher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!voucherRetry) return;
    const form = new FormData(event.currentTarget);
    const file = form.get("voucher");
    if (!(file instanceof File) || !file.size) return;
    setState("loading");
    setFeedback("");
    try {
      const upload = new FormData();
      upload.append("orderNumber", voucherRetry.number);
      upload.append("email", voucherRetry.email);
      upload.append("token", voucherRetry.token);
      upload.append("file", file);
      const response = await fetch("/api/pedidos/voucher", { method: "POST", body: upload });
      if (!response.ok) throw new Error("No pudimos subir el voucher. Revisa el archivo e inténtalo nuevamente.");
      setVoucherRetry(null);
      setState("success");
      setFeedback("Pedido recibido. Verificaremos tu comprobante y te avisaremos por correo.");
    } catch (error) {
      setState("error");
      setFeedback(error instanceof Error ? error.message : "No pudimos subir el voucher.");
    }
  }

  if (voucherRetry) return <form className="checkout-success voucher-retry" onSubmit={retryVoucher}><FileUp /><span className="eyebrow">Pedido {voucherRetry.number}</span><h2>Tu pedido está guardado.</h2><p>{feedback}</p><label className="upload-field"><FileUp /><span>Vuelve a adjuntar el voucher<small>JPG, PNG, WebP o PDF · máximo 5 MB</small></span><input name="voucher" required type="file" accept="image/jpeg,image/png,image/webp,application/pdf" /></label><button className="button button-dark" disabled={state === "loading"} type="submit">{state === "loading" ? <Loader2 className="spin" /> : <FileUp />} Reintentar subida</button><a className="button button-whatsapp" href={settings.whatsapp} target="_blank" rel="noreferrer"><MessageCircle /> Contactar por WhatsApp</a></form>;
  if (!items.length && state !== "success") return <div className="checkout-empty"><ReceiptText /><h2>Tu carrito está vacío.</h2><p>Agrega una licencia o un kit para continuar.</p><Link href="/tienda" className="button button-dark">Volver a la tienda</Link></div>;
  if (state === "success") return <div className="checkout-success"><CheckCircle2 /><span className="eyebrow">Solicitud recibida</span><h2>{orderNumber ? `Pedido ${orderNumber}` : "Tu carrito está en nuestro radar."}</h2><p>{feedback}</p><div><Link className="button button-dark" href="/tienda">Seguir explorando</Link><a className="button button-yellow" href={settings.whatsapp} target="_blank" rel="noreferrer"><MessageCircle /> Contactar por WhatsApp</a></div></div>;

  return (
    <form className="checkout-layout" onSubmit={submit}>
      <div className="checkout-main">
        <section className="checkout-panel"><div className="panel-heading"><span>01</span><div><h2>Datos del cliente</h2><p>Usaremos estos datos para tu pedido y comprobante.</p></div></div><div className="form-grid"><label><span>Nombre completo *</span><input name="customerName" required minLength={2} autoComplete="name" /></label><label><span>WhatsApp *</span><input name="phone" required inputMode="tel" autoComplete="tel" /></label><label><span>Correo *</span><input name="email" required type="email" autoComplete="email" /></label><label><span>DNI / CE</span><input name="documentNumber" inputMode="numeric" /></label></div><input className="honeypot" name="website" tabIndex={-1} autoComplete="off" /></section>
        <section className="checkout-panel"><div className="panel-heading"><span>02</span><div><h2>Comprobante</h2><p>Emitimos boleta y factura electrónica.</p></div></div><div className="segmented" role="group" aria-label="Tipo de comprobante"><button aria-pressed={documentType === "BOLETA"} className={documentType === "BOLETA" ? "is-active" : ""} type="button" onClick={() => setDocumentType("BOLETA")}>Boleta</button><button aria-pressed={documentType === "FACTURA"} className={documentType === "FACTURA" ? "is-active" : ""} type="button" onClick={() => setDocumentType("FACTURA")}>Factura</button></div>{documentType === "FACTURA" && <div className="form-grid invoice-fields"><label><span>RUC *</span><input name="companyRuc" required inputMode="numeric" pattern="\d{11}" maxLength={11} /></label><label><span>Razón social *</span><input name="companyName" required /></label></div>}</section>
        {!requiresQuote && <section className="checkout-panel"><div className="panel-heading"><span>03</span><div><h2>Cómo finalizar</h2><p>Registra el pedido y elige cómo coordinamos el pago.</p></div></div><div className="payment-options" role="group" aria-label="Forma de pago"><button aria-pressed={payment === "WHATSAPP"} type="button" className={payment === "WHATSAPP" ? "is-active" : ""} onClick={() => setPayment("WHATSAPP")}><MessageCircle /><span>Finalizar por WhatsApp<small>Enviamos el resumen completo al equipo</small></span><i /></button><button aria-pressed={payment === "MANUAL"} type="button" className={payment === "MANUAL" ? "is-active" : ""} onClick={() => setPayment("MANUAL")}><Banknote /><span>Yape, Plin o transferencia<small>Verificamos tu comprobante</small></span><i /></button><button aria-pressed={payment === "ONLINE"} type="button" className={payment === "ONLINE" ? "is-active" : ""} onClick={() => setPayment("ONLINE")}><CreditCard /><span>Pago online<small>Disponible cuando el proveedor esté configurado</small></span><i /></button></div>{payment === "MANUAL" && <div className="manual-payment"><div className="yape-box"><strong>Yape / Plin</strong><span>{settings.yapePlin}</span><small>A nombre de {settings.legalName}</small></div><details><summary>Ver cuentas bancarias <ChevronRight /></summary>{settings.bankAccounts.map((account) => <div className="mini-account" key={`${account.bank}-${account.currency}`}><strong>{account.bank} ({account.currency})</strong><span>Cuenta: {account.account}</span><span>CCI: {account.cci}</span></div>)}</details><label className="upload-field"><FileUp /><span>Adjunta tu voucher *<small>JPG, PNG, WebP o PDF · máximo 5 MB</small></span><input name="voucher" required type="file" accept="image/jpeg,image/png,image/webp,application/pdf" /></label></div>}</section>}
        <section className="checkout-panel"><div className="panel-heading"><span>04</span><div><h2>Entrega o coordinación</h2><p>Completa estos datos si tu pedido requiere entrega física.</p></div></div><div className="form-grid delivery-fields"><label><span>Departamento</span><input name="department" autoComplete="address-level1" /></label><label><span>Provincia</span><input name="province" autoComplete="address-level2" /></label><label><span>Distrito</span><input name="district" autoComplete="address-level3" /></label><label><span>Dirección</span><input name="address" autoComplete="street-address" /></label><label className="wide-field"><span>Referencia</span><input name="addressReference" /></label></div></section>
        <label className="notes-field"><span>Nota para el pedido</span><textarea name="notes" rows={3} placeholder="Información adicional (opcional)" /></label>
        <label className="form-consent"><input required name="consent" type="checkbox" value="yes" /><span>Autorizo el uso de estos datos para procesar y responder mi solicitud. Consulta la <Link href="/privacidad">política de privacidad</Link>.</span></label>
      </div>
      <aside className="order-summary"><span className="eyebrow">Tu pedido</span><h2>Resumen</h2><div className="summary-lines">{items.map((item) => <article key={item.product.id}><div><Image src={item.product.image} alt="" fill sizes="72px" /></div><span><strong>{item.product.name}</strong><small>{item.product.license}</small><b>Cantidad: {item.quantity}</b></span><em>{item.product.price === null ? "Por confirmar" : formatSoles(item.product.price * item.quantity)}</em></article>)}</div>{!requiresQuote && <div className="coupon-box"><label htmlFor="promo-code"><BadgePercent aria-hidden="true" /><span><strong>Cupón</strong><small>Ingresa tu código promocional</small></span></label><div><input id="promo-code" value={promoCode} onChange={(event) => { setPromoCode(event.target.value.toUpperCase()); setPromotion(null); setPromoState("idle"); setPromoFeedback(""); }} maxLength={40} placeholder="WILO10" /><button type="button" onClick={applyCoupon} disabled={promoState === "loading" || promoCode.trim().length < 3}>{promoState === "loading" ? <Loader2 className="spin" /> : "Aplicar"}</button></div>{promoFeedback && <p className={promoState} role="status">{promoFeedback}</p>}</div>}<div className="summary-breakdown">{promotion && <><span>Subtotal <b>{formatSoles(total)}</b></span><span className="discount">Descuento <b>-{formatSoles(promotion.discountCents / 100)}</b></span></>}<div className="summary-total"><span>{requiresQuote ? "Precio" : "Total"}</span><strong>{requiresQuote ? "Por confirmar" : formatSoles(payableTotal)}</strong></div></div><p><ShieldCheck /> No realizaremos ningún cobro sin confirmar antes todos los datos de tu compra.</p><button className="button button-yellow button-large" disabled={state === "loading"} type="submit">{state === "loading" ? <Loader2 className="spin" /> : payment === "WHATSAPP" && !requiresQuote ? <Send /> : <BadgeCheck />} {requiresQuote ? "Solicitar cotización" : payment === "WHATSAPP" ? "Finalizar por WhatsApp" : "Crear pedido"}</button><a className="button button-whatsapp" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle /> Consultar antes de comprar</a><p className="delivery-assurance"><Truck /> Coordinamos entrega y disponibilidad antes de confirmar.</p>{feedback && <p className={`form-status ${state}`} role="status">{feedback}</p>}</aside>
    </form>
  );
}
