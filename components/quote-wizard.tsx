"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import { formatSoles } from "@/lib/content";
import { getPublicCalendarProvider } from "@/lib/calendar-provider";
import { useSiteSettings } from "@/components/site-settings-provider";
import {
  findQuoteService,
  quoteBudgets,
  quoteNeeds,
  quoteScopes,
  quoteServices,
  quoteTimeframes,
} from "@/data/quote-config";

const TOTAL_STEPS = 8;
const STORAGE_KEY = "wilo-quote-draft-v2";

type QuoteDraft = {
  service: string;
  needs: string[];
  needDetails: string;
  functions: string[];
  scope: string;
  audience: string;
  budget: string;
  timeframe: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  notes: string;
  consent: boolean;
};

const emptyDraft: QuoteDraft = {
  service: "",
  needs: [],
  needDetails: "",
  functions: [],
  scope: "",
  audience: "",
  budget: "",
  timeframe: "",
  name: "",
  company: "",
  phone: "",
  email: "",
  notes: "",
  consent: false,
};

function toggle(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function QuoteWizard({ initialPlan, initialService }: { initialPlan?: string; initialService?: string }) {
  const settings = useSiteSettings();
  const requestedService = findQuoteService(initialService || initialPlan)?.slug || "";
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<QuoteDraft>({ ...emptyDraft, service: requestedService });
  const [storageReady, setStorageReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const startedAt = useRef(Date.now());
  const calendar = getPublicCalendarProvider();

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<QuoteDraft> | { draft?: Partial<QuoteDraft>; step?: number };
        const restored = "draft" in parsed && parsed.draft ? parsed.draft : parsed as Partial<QuoteDraft>;
        const restoredStep = "step" in parsed && typeof parsed.step === "number" ? parsed.step : 1;
        const serviceChanged = Boolean(requestedService && restored.service && requestedService !== restored.service);
        setDraft((current) => ({ ...current, ...restored, service: requestedService || restored.service || "" }));
        setStep(serviceChanged ? 1 : Math.max(1, Math.min(TOTAL_STEPS, restoredStep)));
      }
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setStorageReady(true);
    }
  }, [requestedService]);

  useEffect(() => {
    if (!storageReady) return;
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, step })); } catch {}
  }, [draft, step, storageReady]);

  const selectedService = useMemo(() => findQuoteService(draft.service), [draft.service]);
  const summary = useMemo(() => [
    "Hola Wilo Studio. Quiero cotizar:",
    `Servicio: ${selectedService?.shortName || "Por definir"}`,
    `Necesidades: ${draft.needs.join(", ") || draft.needDetails || "Por definir"}`,
    `Funciones: ${draft.functions.join(", ") || "Por definir"}`,
    `Alcance: ${draft.scope || "Por definir"}${draft.audience ? ` · ${draft.audience}` : ""}`,
    `Presupuesto: ${draft.budget || "Por definir"}`,
    `Plazo: ${draft.timeframe || "Por definir"}`,
    `Empresa: ${draft.company || "No indicada"}`,
    `Contacto: ${draft.name || "Por indicar"} · ${draft.phone || ""} · ${draft.email || ""}`,
    draft.notes ? `Notas: ${draft.notes}` : "",
  ].filter(Boolean).join("\n"), [draft, selectedService]);
  const whatsappHref = `https://wa.me/${settings.phone}?text=${encodeURIComponent(summary)}`;
  const meetingHref = calendar.bookingUrl || `https://wa.me/${settings.phone}?text=${encodeURIComponent(`${summary}\n\nTambién quisiera coordinar una reunión.`)}`;

  const update = <K extends keyof QuoteDraft>(key: K, value: QuoteDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (status === "error") { setStatus("idle"); setFeedback(""); }
  };

  const canContinue = (() => {
    if (step === 1) return Boolean(draft.service);
    if (step === 2) return draft.needs.length > 0 || draft.needDetails.trim().length >= 4;
    if (step === 3) return draft.functions.length > 0;
    if (step === 4) return Boolean(draft.scope);
    if (step === 5) return Boolean(draft.budget);
    if (step === 6) return Boolean(draft.timeframe);
    if (step === 7) return draft.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email) && draft.phone.trim().length >= 6 && draft.consent;
    return true;
  })();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== TOTAL_STEPS || !canContinue || !selectedService) return;
    setStatus("loading");
    setFeedback("");
    const details = [
      `Necesidades: ${draft.needs.join(", ") || draft.needDetails}`,
      draft.needDetails && draft.needs.length ? `Contexto: ${draft.needDetails}` : "",
      `Alcance: ${draft.scope}${draft.audience ? ` · ${draft.audience}` : ""}`,
      `Presupuesto: ${draft.budget}`,
      `Plazo: ${draft.timeframe}`,
      draft.notes ? `Observaciones: ${draft.notes}` : "",
      selectedService.estimateFrom ? `Referencia pública: desde ${formatSoles(selectedService.estimateFrom)}; precio final sujeto a evaluación.` : "Requiere evaluación y propuesta a medida.",
    ].filter(Boolean).join("\n\n");
    try {
      const response = await fetch("/api/cotizador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          company: draft.company,
          phone: draft.phone,
          email: draft.email,
          projectType: selectedService.shortName,
          features: [...draft.needs, ...draft.functions].slice(0, 30),
          consent: draft.consent,
          clientElapsedMs: Math.max(1_000, Date.now() - startedAt.current),
          message: details,
          website: "",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No pudimos registrar la solicitud.");
      setStatus("success");
      setFeedback("Recibimos el alcance. Nuestro equipo lo revisará antes de confirmar precio, plazo o disponibilidad.");
      try { window.sessionStorage.removeItem(STORAGE_KEY); } catch {}
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "No pudimos enviar la solicitud.");
    }
  }

  const next = () => {
    if (!canContinue) return;
    setStep((current) => Math.min(TOTAL_STEPS, current + 1));
  };

  return (
    <div className="quote-wizard">
      <div className="wizard-head">
        <div><span className="eyebrow">Cotizador inteligente</span><h2>Convirtamos tu necesidad en un alcance claro.</h2></div>
        <div className="wizard-progress" aria-label={`Paso ${step} de ${TOTAL_STEPS}`}><span style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} /><small>Paso {step} de {TOTAL_STEPS}</small></div>
      </div>
      {status === "success" ? (
        <div className="wizard-success"><CheckCircle2 /><h3>Tu proyecto ya está en nuestro radar.</h3><p>{feedback}</p><div className="wizard-final-actions"><a className="button button-yellow" href={meetingHref} target="_blank" rel="noreferrer"><CalendarDays />{calendar.configured ? "Agendar reunión" : "Coordinar reunión"}</a><a className="button button-ghost" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle />Hablar por WhatsApp</a></div></div>
      ) : (
        <form onSubmit={submit}>
          {step === 1 && <fieldset><legend>1. ¿Qué solución necesitas?</legend><div className="choice-grid choice-grid--services">{quoteServices.map((item) => <button aria-pressed={draft.service === item.slug} type="button" className={draft.service === item.slug ? "is-selected" : ""} key={item.slug} onClick={() => { update("service", item.slug); update("functions", []); }}><span>{item.number} · {item.shortName}</span><small>{item.description}</small>{draft.service === item.slug && <Check aria-hidden="true" />}</button>)}</div></fieldset>}
          {step === 2 && <fieldset><legend>2. ¿Qué necesitas resolver?</legend><div className="choice-grid">{quoteNeeds.map((item) => <button aria-pressed={draft.needs.includes(item)} type="button" className={draft.needs.includes(item) ? "is-selected" : ""} key={item} onClick={() => update("needs", toggle(draft.needs, item))}><span>{item}</span><small>Selecciona todas las que correspondan</small>{draft.needs.includes(item) && <Check aria-hidden="true" />}</button>)}</div><label className="wizard-textarea"><span>Cuéntanos el contexto con tus palabras</span><textarea value={draft.needDetails} onChange={(event) => update("needDetails", event.target.value)} rows={4} /></label></fieldset>}
          {step === 3 && <fieldset><legend>3. Funciones para {selectedService?.shortName || "tu solución"}</legend><div className="choice-grid">{selectedService?.functions.map((item) => <button aria-pressed={draft.functions.includes(item)} type="button" className={draft.functions.includes(item) ? "is-selected" : ""} key={item} onClick={() => update("functions", toggle(draft.functions, item))}><span>{item}</span><small>Se evaluará dentro del alcance</small>{draft.functions.includes(item) && <Check aria-hidden="true" />}</button>)}</div></fieldset>}
          {step === 4 && <fieldset><legend>4. ¿Qué alcance imaginas?</legend><div className="choice-grid">{quoteScopes.map((item) => <button aria-pressed={draft.scope === item} type="button" className={draft.scope === item ? "is-selected" : ""} key={item} onClick={() => update("scope", item)}><span>{item}</span><small>Podremos precisarlo juntos</small>{draft.scope === item && <Check aria-hidden="true" />}</button>)}</div><label className="wizard-textarea"><span>Usuarios, sedes, productos o volumen aproximado</span><textarea value={draft.audience} onChange={(event) => update("audience", event.target.value)} rows={3} placeholder="Ej.: 15 usuarios, 2 sedes y 600 productos" /></label></fieldset>}
          {step === 5 && <fieldset><legend>5. ¿Qué rango de inversión estás evaluando?</legend><div className="choice-grid">{quoteBudgets.map((item) => <button aria-pressed={draft.budget === item} type="button" className={draft.budget === item ? "is-selected" : ""} key={item} onClick={() => update("budget", item)}><span>{item}</span><small>No fija el precio final</small>{draft.budget === item && <Check aria-hidden="true" />}</button>)}</div><div className="estimate-card"><Sparkles /><div><span>Estimación responsable</span><strong>{selectedService?.estimateFrom ? `Referencia desde ${formatSoles(selectedService.estimateFrom)}` : "Requiere evaluación"}</strong><small>El monto final depende del alcance validado y se confirma en una propuesta formal.</small></div></div></fieldset>}
          {step === 6 && <fieldset><legend>6. ¿Cuándo necesitas ponerlo en marcha?</legend><div className="choice-grid">{quoteTimeframes.map((item) => <button aria-pressed={draft.timeframe === item} type="button" className={draft.timeframe === item ? "is-selected" : ""} key={item} onClick={() => update("timeframe", item)}><span>{item}</span><small>Validaremos disponibilidad real</small>{draft.timeframe === item && <Check aria-hidden="true" />}</button>)}</div></fieldset>}
          {step === 7 && <fieldset><legend>7. ¿Cómo te contactamos?</legend><div className="form-grid"><label><span>Nombre *</span><input required value={draft.name} onChange={(event) => update("name", event.target.value)} /></label><label><span>Empresa</span><input value={draft.company} onChange={(event) => update("company", event.target.value)} /></label><label><span>WhatsApp *</span><input required inputMode="tel" value={draft.phone} onChange={(event) => update("phone", event.target.value)} /></label><label><span>Correo *</span><input required type="email" value={draft.email} onChange={(event) => update("email", event.target.value)} /></label></div><label><span>Observaciones</span><textarea value={draft.notes} onChange={(event) => update("notes", event.target.value)} rows={4} /></label><label className="form-consent"><input checked={draft.consent} onChange={(event) => update("consent", event.target.checked)} required type="checkbox" /><span>Autorizo el uso de estos datos para preparar y responder mi solicitud. Consulta la <Link href="/privacidad">política de privacidad</Link>.</span></label></fieldset>}
          {step === 8 && <fieldset><legend>8. Resumen del proyecto</legend><div className="quote-summary"><div><span>Solución</span><strong>{selectedService?.shortName}</strong></div><div><span>Necesidad</span><strong>{draft.needs.join(", ") || draft.needDetails}</strong></div><div><span>Funciones</span><strong>{draft.functions.join(", ")}</strong></div><div><span>Alcance</span><strong>{draft.scope}{draft.audience ? ` · ${draft.audience}` : ""}</strong></div><div><span>Presupuesto</span><strong>{draft.budget}</strong></div><div><span>Plazo</span><strong>{draft.timeframe}</strong></div><div><span>Contacto</span><strong>{draft.name}{draft.company ? ` · ${draft.company}` : ""}<br />{draft.phone} · {draft.email}</strong></div></div><p className="quote-summary-note">Esto es un resumen de alcance, no una promesa de precio ni de fecha. Wilo validará la información antes de enviar una propuesta.</p><div className="wizard-secondary-actions"><a href={meetingHref} target="_blank" rel="noreferrer"><CalendarDays />{calendar.configured ? "Ver horarios reales" : "Coordinar reunión por WhatsApp"}</a><a href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle />Enviar resumen por WhatsApp</a></div></fieldset>}
          <div className="wizard-actions">{step > 1 && <button type="button" className="button button-ghost" onClick={() => setStep((value) => value - 1)}><ArrowLeft /> Atrás</button>}<div />{step < TOTAL_STEPS ? <button type="button" className="button button-yellow" disabled={!canContinue} onClick={(event) => { event.preventDefault(); next(); }}>Continuar <ArrowRight /></button> : <button className="button button-yellow" disabled={status === "loading" || !canContinue} type="submit">{status === "loading" ? <Loader2 className="spin" /> : <Send />} Enviar solicitud a Wilo</button>}</div>
          {feedback && <p className={`form-status ${status}`} role="status">{feedback}</p>}
        </form>
      )}
    </div>
  );
}
