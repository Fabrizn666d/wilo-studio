import type { Metadata } from "next";
import { QuoteWizard } from "@/components/quote-wizard";

export const metadata: Metadata = {
  title: "Cotiza una solución digital",
  description: "Define el alcance inicial de tu proyecto con el cotizador inteligente de Wilo Studio.",
  alternates: { canonical: "/cotizar" },
};

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ service?: string; plan?: string }> }) {
  const { service, plan } = await searchParams;
  return (
    <main id="contenido" className="inner-page contact-page">
      <section className="inner-hero section-yellow">
        <div className="shell"><span className="eyebrow">Proyecto a medida</span><h1>Un alcance claro empieza por <em>las preguntas correctas.</em></h1><p>Completa el flujo a tu ritmo. Guardamos el avance en esta sesión y revisamos cada solicitud antes de confirmar precio o plazo.</p></div>
      </section>
      <section className="section quote-section section-dark"><div className="shell"><QuoteWizard initialPlan={plan} initialService={service} /></div></section>
    </main>
  );
}
