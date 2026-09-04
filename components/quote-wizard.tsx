"use client";

import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { formatSoles } from "@/lib/content";

const projectTypes = [
  { id: "landing", label: "Landing Page", base: 500, plan: "landing-page-presencia-rapida" },
  { id: "catalog", label: "Catálogo + Panel", base: 800, plan: "catalogo-web-panel" },
  { id: "corporate", label: "Web Corporativa", base: 1070, plan: "pagina-corporativa" },
  { id: "store", label: "Tienda Virtual", base: 1420, plan: "tienda-virtual" },
  { id: "app", label: "App móvil", base: 2500, plan: "" },
  { id: "api-sunat", label: "API SUNAT", base: 1500, plan: "" },
];

const features = [
  { id: "payments", label: "Pasarela de pago" },
  { id: "sunat", label: "Integración SUNAT" },
  { id: "social", label: "Login social" },
  { id: "catalog", label: "Catálogo administrable" },
  { id: "whatsapp", label: "WhatsApp Business" },
  { id: "analytics", label: "Analítica avanzada" },
];

export function QuoteWizard({ initialPlan }: { initialPlan?: string }) {
  const initial = projectTypes.find((item) => item.plan === initialPlan)?.id ?? "";
  const [step, setStep] = useState(1);
  const [project, setProject] = useState(initial);
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const startedAt = useRef(Date.now());

  const estimate = useMemo(() => {
    const base = projectTypes.find((item) => item.id === project)?.base ?? 0;
    return { min: base };
  }, [project]);

  function toggleFeature(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const projectInfo = projectTypes.find((item) => item.id === project);
    const notes = String(form.get("notes") || "").trim();
    form.delete("notes");
    const payload = {
      ...Object.fromEntries(form.entries()),
      projectType: projectInfo?.label,
      planSlug: projectInfo?.plan || undefined,
      features: features.filter((item) => selected.includes(item.id)).map((item) => item.label),
      consent: form.get("consent") === "yes",
      clientElapsedMs: Math.max(0, Date.now() - startedAt.current),
      message: [
        `Inversión base referencial: desde ${formatSoles(estimate.min)} (IGV y funciones adicionales por cotizar).`,
        notes,
      ].filter(Boolean).join("\n\n"),
    };
    try {
      const response = await fetch("/api/cotizador", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No pudimos registrar la cotización.");
      setStatus("success");
      setFeedback("¡Listo! Revisaremos los detalles y te escribiremos con una propuesta precisa.");
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "No pudimos enviar la cotización.");
    }
  }

  return (
    <div className="quote-wizard">
      <div className="wizard-head"><div><span className="eyebrow">Cotizador inteligente</span><h2>Cuéntanos qué quieres construir.</h2></div><div className="wizard-progress"><span style={{ width: `${(step / 3) * 100}%` }} /><small>Paso {step} de 3</small></div></div>
      {status === "success" ? <div className="wizard-success"><CheckCircle2 /><h3>Tu proyecto ya está en nuestro radar.</h3><p>{feedback}</p></div> : (
        <form onSubmit={submit}>
          {step === 1 && <fieldset><legend>1. Elige el tipo de proyecto</legend><div className="choice-grid">{projectTypes.map((item) => <button aria-pressed={project === item.id} type="button" className={project === item.id ? "is-selected" : ""} key={item.id} onClick={() => setProject(item.id)}><span>{item.label}</span><small>Desde {formatSoles(item.base)}</small>{project === item.id && <Check aria-hidden="true" />}</button>)}</div></fieldset>}
          {step === 2 && <fieldset><legend>2. ¿Qué funciones necesitas?</legend><div className="choice-grid feature-choices">{features.map((item) => <button aria-pressed={selected.includes(item.id)} type="button" className={selected.includes(item.id) ? "is-selected" : ""} key={item.id} onClick={() => toggleFeature(item.id)}><span>{item.label}</span><small>Se cotiza según alcance</small>{selected.includes(item.id) && <Check aria-hidden="true" />}</button>)}</div><div className="estimate-card"><Sparkles /><div><span>Inversión base referencial</span><strong>Desde {formatSoles(estimate.min)}</strong><small>Antes de IGV. Las funciones adicionales y el precio final se confirman en la propuesta.</small></div></div></fieldset>}
          {step === 3 && <fieldset><legend>3. ¿Cómo te contactamos?</legend><div className="form-grid"><label><span>Nombre *</span><input required name="name" /></label><label><span>Empresa</span><input name="company" /></label><label><span>WhatsApp *</span><input required name="phone" inputMode="tel" /></label><label><span>Correo *</span><input required name="email" type="email" /></label></div><label><span>Algo más que debamos saber</span><textarea name="notes" rows={4} /></label><label className="form-consent"><input required name="consent" type="checkbox" value="yes" /><span>Autorizo a Wilo Studio a usar estos datos para preparar y responder mi solicitud. Consulta la <Link href="/privacidad">política de privacidad</Link>.</span></label><input className="honeypot" name="website" tabIndex={-1} autoComplete="off" /></fieldset>}
          <div className="wizard-actions">{step > 1 && <button type="button" className="button button-ghost" onClick={() => setStep((value) => value - 1)}><ArrowLeft /> Atrás</button>}<div />{step < 3 ? <button type="button" className="button button-dark" disabled={!project} onClick={() => setStep((value) => value + 1)}>Continuar <ArrowRight /></button> : <button className="button button-yellow" disabled={status === "loading"} type="submit">{status === "loading" ? <Loader2 className="spin" /> : <Sparkles />} Recibir propuesta</button>}</div>
          {feedback && <p className={`form-status ${status}`} role="status">{feedback}</p>}
        </form>
      )}
    </div>
  );
}
