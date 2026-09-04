import type { Metadata } from "next";
import { Gift, MessageCircle, UserRoundPlus } from "lucide-react";
import { ReferralForm } from "@/components/public-routes/referral-form";
import { ReferralRule } from "@/components/public-routes/referral-rule";
import { PublicHero, SectionHeading } from "@/components/public-routes/route-ui";

export const metadata: Metadata = {
  title: "Programa de referidos",
  description: "Recomienda Wilo Studio a otro negocio y accede al beneficio vigente del programa de referidos.",
  alternates: { canonical: "/referidos" },
  openGraph: { title: "Programa de referidos | Wilo Studio", description: "Una buena recomendación merece volver convertida en valor.", url: "/referidos", images: [{ url: "/brand/wilo-mascot-cutout.webp", alt: "Programa de referidos de Wilo Studio" }] },
  twitter: { card: "summary_large_image", title: "Programa de referidos | Wilo Studio", description: "Una buena recomendación merece volver convertida en valor.", images: ["/brand/wilo-mascot-cutout.webp"] },
};

export default function ReferralsPage() {
  return (
    <main id="contenido" className="pr-page">
      <PublicHero
        badge="Beneficios para clientes"
        description="Si conoces a una empresa que necesita una web, app o solución digital, preséntanos. Registraremos la recomendación y te mantendremos al tanto."
        eyebrow="Programa de referidos"
        tone="yellow"
        title={<>Una buena recomendación <em>crea valor para todos.</em></>}
      >
        <a className="pr-button pr-button--dark" href="#referir">Registrar un referido</a>
        <a className="pr-button pr-button--line" href="#como-funciona">Cómo funciona</a>
      </PublicHero>

      <section className="pr-section pr-section--dark" id="como-funciona">
        <div className="pr-shell">
          <SectionHeading eyebrow="La regla vigente" inverse title={<>Hoy, recomendar suma <em>nuevas posibilidades.</em></>} />
          <div className="pr-referral-rule"><Gift aria-hidden="true" /><p><ReferralRule /></p></div>
          <div className="pr-referral-steps">
            <article><span>01</span><UserRoundPlus aria-hidden="true" /><h3>Registra</h3><p>Comparte tus datos y los de la persona interesada usando el formulario.</p></article>
            <article><span>02</span><MessageCircle aria-hidden="true" /><h3>Conversamos</h3><p>Contactamos al referido para conocer su necesidad y preparar una propuesta.</p></article>
            <article><span>03</span><Gift aria-hidden="true" /><h3>Reconocemos</h3><p>Cuando se cumpla la regla publicada, coordinamos contigo la aplicación del beneficio.</p></article>
          </div>
        </div>
      </section>

      <section className="pr-section pr-section--cream" id="referir">
        <div className="pr-shell pr-form-layout">
          <div><span className="pr-kicker">Formulario</span><h2>¿A quién podemos ayudar?</h2><p>Completa solo los datos necesarios. Usa el campo de nota para contarnos brevemente qué servicio podría necesitar.</p></div>
          <ReferralForm />
        </div>
      </section>

      <section className="pr-section pr-section--paper pr-simple-terms"><div className="pr-shell"><h2>Condiciones simples</h2><div><p>El registro no garantiza una venta ni activa automáticamente un beneficio.</p><p>La regla vigente puede actualizarse desde el administrador y se aplica según las condiciones coordinadas con el cliente.</p><p>Los datos del referido deben compartirse con su autorización y solo se usarán para atender esta recomendación.</p><p>Wilo Studio confirmará directamente cuándo se cumple la condición y cómo se aplicará el beneficio.</p></div></div></section>
    </main>
  );
}
