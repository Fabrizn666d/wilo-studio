import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { QuoteWizard } from "@/components/quote-wizard";
import { getPublicSiteSettings } from "@/lib/site-settings";

const description = "Cuéntanos qué necesitas y cotiza un producto digital, producción audiovisual o experiencia con Wilo Studio.";
export const metadata: Metadata = {
  title: "Contacto y cotizador",
  description,
  alternates: { canonical: "/contacto" },
  openGraph: { title: "Contacto y cotizador | Wilo Studio", description, url: "/contacto", images: [{ url: "/brand/wilo-mascot-cutout.webp", alt: "Wilo Studio" }] },
  twitter: { card: "summary_large_image", title: "Contacto y cotizador | Wilo Studio", description, images: ["/brand/wilo-mascot-cutout.webp"] },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const [{ plan }, settings] = await Promise.all([searchParams, getPublicSiteSettings()]);
  return (
    <main id="contenido" className="inner-page contact-page">
      <section className="inner-hero contact-hero section-yellow"><div className="shell"><span className="eyebrow">Conversemos</span><h1>Tu próxima gran idea <em>empieza con un mensaje.</em></h1><p>Cuéntanos el reto. Nosotros te ayudamos a encontrar la forma más clara de resolverlo.</p></div></section>
      <section className="section section-cream"><div className="shell contact-layout"><div className="contact-info"><span className="eyebrow">Contacto directo</span><h2>Desde Arequipa, trabajamos para todo el Perú.</h2><p>Si ya tienes un brief, una referencia o simplemente una idea, envíanosla. Te responderemos con el siguiente paso.</p><div className="contact-cards"><a href={settings.whatsapp} target="_blank" rel="noreferrer"><MessageCircle /><span>WhatsApp<strong>{settings.phoneDisplay}</strong></span></a>{settings.emailVerified ? <a href={`mailto:${settings.email}`}><Mail /><span>Correo<strong>{settings.email}</strong></span></a> : null}<a href={`tel:+${settings.phone}`}><Phone /><span>Llámanos<strong>{settings.phoneDisplay}</strong></span></a><div><MapPin /><span>Ubicación<strong>{settings.location}</strong></span></div></div></div><ContactForm /></div></section>
      <section id="cotizador" className="section quote-section section-dark"><div className="shell"><QuoteWizard initialPlan={plan} /></div></section>
    </main>
  );
}
