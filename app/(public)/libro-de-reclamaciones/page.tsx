import type { Metadata } from "next";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ComplaintForm } from "@/components/public-routes/complaint-form";
import { PublicHero } from "@/components/public-routes/route-ui";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones",
  description: "Registra virtualmente un reclamo o queja relacionado con un producto o servicio de Wilo Studio.",
  alternates: { canonical: "/libro-de-reclamaciones" },
  openGraph: { title: "Libro de Reclamaciones | Wilo Studio", description: "Registra virtualmente un reclamo o queja relacionado con un producto o servicio de Wilo Studio.", url: "/libro-de-reclamaciones", images: [{ url: "/brand/portfolio-showcase.webp", alt: "Wilo Studio" }] },
  twitter: { card: "summary_large_image", title: "Libro de Reclamaciones | Wilo Studio", description: "Registra virtualmente un reclamo o queja relacionado con un producto o servicio de Wilo Studio.", images: ["/brand/portfolio-showcase.webp"] },
  robots: { index: true, follow: true },
};

// TODO: contrastar el formulario final con el formato oficial que corresponda al canal de venta antes de producción.
export const dynamic = "force-dynamic";

export default async function ComplaintsBookPage() {
  const settings = await getPublicSiteSettings();
  return (
    <main id="contenido" className="pr-page">
      <PublicHero description="Registra aquí una disconformidad relacionada con un producto, servicio o atención. Al finalizar recibirás un código para identificar tu hoja." eyebrow="Atención al consumidor" tone="cream" title={<>Libro de <em>Reclamaciones.</em></>} />
      <section className="pr-section pr-section--cream">
        <div className="pr-shell pr-complaint-layout">
          <aside>
            <span className="pr-kicker">Proveedor</span>
            <h2>{settings.name}</h2>
            <dl><div><dt>Titular</dt><dd>{settings.legalName}</dd></div><div><dt>RUC</dt><dd>{settings.ruc}</dd></div><div><dt>Ubicación</dt><dd>{settings.location}</dd></div><div><dt>Correo</dt><dd>{settings.email}</dd></div></dl>
            <div className="pr-definition"><AlertCircle aria-hidden="true" /><p><strong>Reclamo:</strong> disconformidad relacionada con un producto o servicio.<br /><strong>Queja:</strong> malestar relacionado con la atención, sin referirse directamente al producto o servicio.</p></div>
            <div className="pr-response-note"><CheckCircle2 aria-hidden="true" /><p>Responderemos por escrito en un plazo máximo de 15 días hábiles, conforme a la información oficial vigente de Indecopi.</p></div>
            <a className="pr-text-link" href="https://www.gob.pe/institucion/indecopi/campa%C3%B1as/119031-no-estas-solo-resolvemos-tus-problemas-de-consumo" rel="noreferrer" target="_blank">Orientación oficial de Indecopi ↗</a>
          </aside>
          <ComplaintForm />
        </div>
      </section>
    </main>
  );
}
