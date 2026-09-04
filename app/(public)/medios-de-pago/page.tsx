import type { Metadata } from "next";
import { Building2, MessageCircle, ReceiptText, Smartphone } from "lucide-react";
import { PublicHero, SectionHeading } from "@/components/public-routes/route-ui";
import { whatsappLinkFor } from "@/lib/content";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Medios de pago",
  description: "Cuentas bancarias oficiales, Yape y Plin de Wilo Studio. Verifica siempre el titular y RUC antes de pagar.",
  alternates: { canonical: "/medios-de-pago" },
  openGraph: { title: "Medios de pago oficiales | Wilo Studio", description: "Cuentas oficiales de Wilo Studio para pagos en soles y dólares.", url: "/medios-de-pago", images: [{ url: "/brand/medios-de-pago.webp", alt: "Medios de pago oficiales de Wilo Studio" }] },
  twitter: { card: "summary_large_image", title: "Medios de pago oficiales | Wilo Studio", description: "Cuentas oficiales de Wilo Studio para pagos en soles y dólares.", images: ["/brand/medios-de-pago.webp"] },
};

export const dynamic = "force-dynamic";

export default async function PaymentMethodsPage() {
  const settings = await getPublicSiteSettings();
  return (
    <main id="contenido" className="pr-page">
      <PublicHero
        badge="Datos oficiales"
        description="Antes de realizar una transferencia, verifica que el titular y el RUC coincidan con la información publicada en esta página."
        eyebrow="Medios de pago"
        image="/brand/medios-de-pago.webp"
        imageAlt="Flyer oficial con medios de pago de Wilo Studio"
        tone="cream"
        title={<>Paga con seguridad por el canal que <em>prefieras.</em></>}
      >
        <a className="pr-button pr-button--dark" href="#cuentas">Ver cuentas</a>
        <a className="pr-button pr-button--line" href={settings.whatsapp} rel="noreferrer" target="_blank">Confirmar por WhatsApp</a>
      </PublicHero>

      <section className="pr-section pr-section--cream" id="cuentas">
        <div className="pr-shell">
          <SectionHeading description="Todas las cuentas corresponden al titular indicado debajo. No transfieras a una cuenta distinta enviada desde otro canal." eyebrow="Transferencias" title={<>Cuentas bancarias <em>oficiales.</em></>} />
          <div className="pr-account-table-wrap">
            <table className="pr-account-table">
              <caption className="pr-sr-only">Cuentas bancarias oficiales de Wilo Studio</caption>
              <thead><tr><th>Banco</th><th>Moneda</th><th>Número de cuenta</th><th>CCI</th></tr></thead>
              <tbody>{settings.bankAccounts.map((account) => <tr key={`${account.bank}-${account.currency}`}><th scope="row"><Building2 aria-hidden="true" size={18} /> {account.bank}</th><td>{account.currency}</td><td>{account.account}</td><td>{account.cci}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="pr-section pr-section--dark">
        <div className="pr-shell pr-payment-grid">
          <article><Smartphone aria-hidden="true" /><span className="pr-mini-label">Yape / Plin</span><h2>{settings.yapePlin}</h2><p>Usa el número publicado y verifica el nombre del titular antes de confirmar.</p></article>
          <article><ReceiptText aria-hidden="true" /><span className="pr-mini-label">Titular</span><h2>{settings.legalName}</h2><p>RUC {settings.ruc} · {settings.invoiceNote}</p></article>
        </div>
      </section>

      <section className="pr-section pr-section--yellow"><div className="pr-shell pr-proof-instruction"><MessageCircle aria-hidden="true" /><div><span className="pr-kicker">Después de pagar</span><h2>{settings.paymentInstructions}</h2><p>Incluye tu nombre o empresa y el proyecto o pedido al que corresponde para poder identificarlo.</p></div><a className="pr-button pr-button--dark" href={whatsappLinkFor(settings.phone, "Hola Wilo Studio, adjunto mi comprobante de pago.")} rel="noreferrer" target="_blank">Enviar comprobante</a></div></section>
    </main>
  );
}
