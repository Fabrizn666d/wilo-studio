"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const serviceOptions = [
  "Web o producto digital",
  "Ecommerce",
  "App o sistema a medida",
  "Branding e identidad",
  "Producción audiovisual",
  "Infraestructura y eventos",
  "Wilo Education",
  "Wilo Express",
] as const;

type FieldName = "name" | "email" | "phone" | "service" | "message" | "consent";
type FieldErrors = Partial<Record<FieldName, string>>;
type SubmitState = "idle" | "loading" | "success" | "error";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d\s()-]+$/;

function valueFrom(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validate(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = valueFrom(data, "name");
  const email = valueFrom(data, "email");
  const phone = valueFrom(data, "phone");
  const service = valueFrom(data, "service");
  const message = valueFrom(data, "message");

  if (name.length < 2) errors.name = "Escribe tu nombre.";
  if (!emailPattern.test(email) || email.length > 254) errors.email = "Ingresa un correo válido.";
  if (phone && (phone.length < 6 || !phonePattern.test(phone))) errors.phone = "Ingresa un teléfono válido.";
  if (!service) errors.service = "Selecciona el tipo de proyecto.";
  if (message.length < 10) errors.message = "Cuéntanos un poco más sobre el reto.";
  if (data.get("consent") !== "yes") errors.consent = "Necesitamos tu autorización para responderte.";
  return errors;
}

export function ContactForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const startedAt = useRef(Date.now());

  function clearError(field: FieldName) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (state === "error") {
      setState("idle");
      setMessage("");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const nextErrors = validate(form);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setState("error");
      setMessage("Revisa los campos señalados antes de enviar.");
      const firstInvalid = (["name", "email", "phone", "service", "message", "consent"] as const).find(
        (field) => nextErrors[field],
      );
      if (firstInvalid) requestAnimationFrame(() => formElement.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus());
      return;
    }

    setErrors({});
    setState("loading");
    setMessage("Enviando tu mensaje…");
    const payload = {
      name: valueFrom(form, "name"),
      company: valueFrom(form, "company"),
      phone: valueFrom(form, "phone"),
      email: valueFrom(form, "email"),
      type: "CONTACT",
      service: valueFrom(form, "service"),
      message: valueFrom(form, "message"),
      source: "studio-contact",
      website: valueFrom(form, "website"),
      details: {
        schemaVersion: "studio-contact-v1",
        pagePath: "/contacto",
        consent: true,
        clientStartedAt: new Date(startedAt.current).toISOString(),
        clientElapsedMs: Math.max(0, Date.now() - startedAt.current),
      },
    };

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "No pudimos enviar el mensaje.");
      setState("success");
      setMessage("Recibimos tu mensaje. Te contactaremos con el siguiente paso.");
      formElement.reset();
      startedAt.current = Date.now();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Ocurrió un error. Inténtalo nuevamente.");
    }
  }

  return (
    <form className="contact-form" noValidate onSubmit={submit}>
      <div className="form-grid">
        <label>
          <span>Nombre *</span>
          <input aria-describedby={errors.name ? "contact-name-error" : undefined} aria-invalid={Boolean(errors.name)} autoComplete="name" maxLength={120} name="name" onChange={() => clearError("name")} placeholder="¿Cómo te llamas?" />
          {errors.name ? <small className="field-error" id="contact-name-error">{errors.name}</small> : null}
        </label>
        <label>
          <span>Empresa</span>
          <input autoComplete="organization" maxLength={160} name="company" placeholder="Nombre de tu empresa" />
        </label>
        <label>
          <span>WhatsApp / teléfono</span>
          <input aria-describedby={errors.phone ? "contact-phone-error" : undefined} aria-invalid={Boolean(errors.phone)} autoComplete="tel" inputMode="tel" maxLength={30} name="phone" onChange={() => clearError("phone")} placeholder="+51 9XX XXX XXX" />
          {errors.phone ? <small className="field-error" id="contact-phone-error">{errors.phone}</small> : null}
        </label>
        <label>
          <span>Correo *</span>
          <input aria-describedby={errors.email ? "contact-email-error" : undefined} aria-invalid={Boolean(errors.email)} autoComplete="email" maxLength={254} name="email" onChange={() => clearError("email")} placeholder="tu@empresa.com" type="email" />
          {errors.email ? <small className="field-error" id="contact-email-error">{errors.email}</small> : null}
        </label>
      </div>
      <label>
        <span>¿Qué necesitas? *</span>
        <select aria-describedby={errors.service ? "contact-service-error" : undefined} aria-invalid={Boolean(errors.service)} defaultValue="" name="service" onChange={() => clearError("service")}>
          <option value="" disabled>Selecciona una línea</option>
          {serviceOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
        {errors.service ? <small className="field-error" id="contact-service-error">{errors.service}</small> : null}
      </label>
      <label>
        <span>Cuéntanos un poco más *</span>
        <textarea aria-describedby={errors.message ? "contact-message-error" : undefined} aria-invalid={Boolean(errors.message)} maxLength={4000} name="message" onChange={() => clearError("message")} placeholder="Objetivo, fecha, funciones o cualquier detalle que debamos conocer." rows={5} />
        {errors.message ? <small className="field-error" id="contact-message-error">{errors.message}</small> : null}
      </label>
      <label className="honeypot" aria-hidden="true">No completar<input aria-hidden="true" autoComplete="off" name="website" tabIndex={-1} /></label>
      <label className="form-consent">
        <input aria-describedby={errors.consent ? "contact-consent-error" : undefined} aria-invalid={Boolean(errors.consent)} name="consent" onChange={() => clearError("consent")} type="checkbox" value="yes" />
        <span>Autorizo a Wilo Studio a usar estos datos para atender mi solicitud. Consulta la <Link href="/privacidad">política de privacidad</Link>.</span>
      </label>
      {errors.consent ? <small className="field-error" id="contact-consent-error">{errors.consent}</small> : null}
      <button className="button button-dark button-large" disabled={state === "loading"} type="submit">
        {state === "loading" ? <Loader2 className="spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />} {state === "loading" ? "Enviando…" : "Enviar mensaje"}
      </button>
      {message ? <p aria-live="polite" className={`form-status ${state}`} role={state === "error" ? "alert" : "status"}>{state === "success" ? <CheckCircle2 size={18} aria-hidden="true" /> : null}{message}</p> : null}
    </form>
  );
}
