"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import Link from "next/link";
import styles from "./ecosystem-lead-form.module.css";

const eventServices = [
  "Foto y video",
  "Drones",
  "Pantallas LED o TV",
  "Audio",
  "Iluminación",
  "Escenarios",
  "Energía",
] as const;

type FieldName = "name" | "phone" | "email" | "eventType" | "location" | "eventServices" | "consent";
type FieldErrors = Partial<Record<FieldName, string>>;
type SubmitState = { kind: "idle" | "loading" | "success" | "error"; message: string };

const initialState: SubmitState = { kind: "idle", message: "" };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d\s()-]+$/;

function valueFrom(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validate(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = valueFrom(data, "name");
  const phone = valueFrom(data, "phone");
  const email = valueFrom(data, "email");
  const eventType = valueFrom(data, "eventType");
  const location = valueFrom(data, "location");

  if (name.length < 2) errors.name = "Escribe tu nombre para saber cómo dirigirnos a ti.";
  if (phone.length < 6 || !phonePattern.test(phone)) errors.phone = "Ingresa un número de WhatsApp válido.";
  if (!emailPattern.test(email) || email.length > 254) errors.email = "Ingresa un correo válido.";
  if (eventType.length < 2) errors.eventType = "Indica qué tipo de evento estás organizando.";
  if (location.length < 2) errors.location = "Indica la ciudad o sede tentativa.";
  if (data.getAll("eventServices").length === 0) errors.eventServices = "Selecciona al menos un servicio.";
  if (data.get("consent") !== "yes") errors.consent = "Necesitamos tu autorización para responder la solicitud.";

  return errors;
}

export function EcosystemLeadForm({ source = "events-page" }: { source?: string }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<SubmitState>(initialState);
  const startedAt = useRef(Date.now());

  function clearError(field: FieldName) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (state.kind === "error") setState(initialState);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const nextErrors = validate(data);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setState({ kind: "error", message: "Revisa los campos señalados antes de enviar." });
      const firstInvalid = (["name", "phone", "email", "eventType", "location", "eventServices", "consent"] as const).find(
        (field) => nextErrors[field],
      );
      if (firstInvalid) {
        requestAnimationFrame(() => {
          formElement.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
        });
      }
      return;
    }

    setErrors({});
    setState({ kind: "loading", message: "Enviando tu solicitud…" });

    const message = valueFrom(data, "message");
    const payload = {
      name: valueFrom(data, "name"),
      company: valueFrom(data, "company"),
      phone: valueFrom(data, "phone"),
      email: valueFrom(data, "email"),
      type: "QUOTE",
      service: "Producción e infraestructura para eventos",
      message,
      source,
      details: {
        schemaVersion: "events-lead-v1",
        pagePath: "/events",
        clientStartedAt: new Date(startedAt.current).toISOString(),
        clientElapsedMs: Math.max(0, Date.now() - startedAt.current),
        consent: true,
        event: {
          type: valueFrom(data, "eventType"),
          tentativeDate: valueFrom(data, "eventDate") || null,
          location: valueFrom(data, "location"),
          services: data.getAll("eventServices").map(String),
        },
      },
      website: valueFrom(data, "website"),
    };

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseBody = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(responseBody.error || "No pudimos enviar la solicitud.");

      formElement.reset();
      startedAt.current = Date.now();
      setState({
        kind: "success",
        message: "Solicitud recibida. Revisaremos los datos de tu evento para responderte.",
      });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "No pudimos enviar la solicitud. Inténtalo nuevamente.",
      });
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <div className={styles.heading}>
        <span>Solicitud para eventos</span>
        <h2>Cuéntanos lo esencial.</h2>
        <p>Con estos datos podremos revisar qué líneas necesitas y responder con el siguiente paso.</p>
      </div>

      <div className={styles.sectionLabel}><span>01</span> Datos de contacto</div>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Nombre y apellido <b aria-hidden="true">*</b></span>
          <input
            aria-describedby={errors.name ? "events-name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            maxLength={120}
            name="name"
            onChange={() => clearError("name")}
            placeholder="¿Cómo te llamas?"
          />
          {errors.name ? <small className={styles.error} id="events-name-error">{errors.name}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Empresa <i>(opcional)</i></span>
          <input autoComplete="organization" maxLength={160} name="company" placeholder="Nombre de la organización" />
        </label>

        <label className={styles.field}>
          <span>WhatsApp <b aria-hidden="true">*</b></span>
          <input
            aria-describedby={errors.phone ? "events-phone-error" : undefined}
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
            inputMode="tel"
            maxLength={30}
            name="phone"
            onChange={() => clearError("phone")}
            placeholder="+51 999 999 999"
          />
          {errors.phone ? <small className={styles.error} id="events-phone-error">{errors.phone}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Correo <b aria-hidden="true">*</b></span>
          <input
            aria-describedby={errors.email ? "events-email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            maxLength={254}
            name="email"
            onChange={() => clearError("email")}
            placeholder="nombre@empresa.com"
            type="email"
          />
          {errors.email ? <small className={styles.error} id="events-email-error">{errors.email}</small> : null}
        </label>
      </div>

      <div className={styles.sectionLabel}><span>02</span> Datos del evento</div>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Tipo de evento <b aria-hidden="true">*</b></span>
          <input
            aria-describedby={errors.eventType ? "events-type-error" : undefined}
            aria-invalid={Boolean(errors.eventType)}
            maxLength={120}
            name="eventType"
            onChange={() => clearError("eventType")}
            placeholder="Ej. feria, presentación, evento corporativo"
          />
          {errors.eventType ? <small className={styles.error} id="events-type-error">{errors.eventType}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Fecha tentativa <i>(opcional)</i></span>
          <input name="eventDate" type="date" />
        </label>

        <label className={`${styles.field} ${styles.wide}`}>
          <span>Ciudad o sede tentativa <b aria-hidden="true">*</b></span>
          <input
            aria-describedby={errors.location ? "events-location-error" : undefined}
            aria-invalid={Boolean(errors.location)}
            autoComplete="address-level2"
            maxLength={160}
            name="location"
            onChange={() => clearError("location")}
            placeholder="Ciudad, local o ubicación por confirmar"
          />
          {errors.location ? <small className={styles.error} id="events-location-error">{errors.location}</small> : null}
        </label>
      </div>

      <fieldset
        aria-describedby={errors.eventServices ? "events-services-error" : "events-services-help"}
        className={styles.services}
      >
        <legend>¿Qué necesitas? <b aria-hidden="true">*</b></legend>
        <p id="events-services-help">Puedes elegir más de una opción.</p>
        <div className={styles.serviceGrid}>
          {eventServices.map((service) => (
            <label key={service}>
              <input name="eventServices" onChange={() => clearError("eventServices")} type="checkbox" value={service} />
              <span>{service}</span>
            </label>
          ))}
        </div>
        {errors.eventServices ? <small className={styles.error} id="events-services-error">{errors.eventServices}</small> : null}
      </fieldset>

      <label className={`${styles.field} ${styles.message}`}>
        <span>Detalles adicionales <i>(opcional)</i></span>
        <textarea
          maxLength={4000}
          name="message"
          placeholder="Comparte horarios, alcance, aforo estimado u otra información útil."
          rows={5}
        />
      </label>

      <label className={styles.honeypot} aria-hidden="true">
        No completar
        <input aria-hidden="true" autoComplete="off" name="website" tabIndex={-1} />
      </label>

      <label className={styles.consent}>
        <input
          aria-describedby={errors.consent ? "events-consent-error" : undefined}
          aria-invalid={Boolean(errors.consent)}
          name="consent"
          onChange={() => clearError("consent")}
          type="checkbox"
          value="yes"
        />
        <span>
          Autorizo a Wilo Studio a usar estos datos para atender mi solicitud. Consulta la <Link href="/privacidad">política de privacidad</Link>.
        </span>
      </label>
      {errors.consent ? <small className={styles.error} id="events-consent-error">{errors.consent}</small> : null}

      <div className={styles.submitRow}>
        <button disabled={state.kind === "loading"} type="submit">
          {state.kind === "loading" ? <LoaderCircle className={styles.spinner} aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          {state.kind === "loading" ? "Enviando…" : "Solicitar revisión"}
        </button>
        <p
          aria-live="polite"
          className={`${styles.status} ${state.kind === "success" ? styles.success : ""} ${state.kind === "error" ? styles.statusError : ""}`}
          role={state.kind === "error" ? "alert" : "status"}
        >
          {state.kind === "success" ? <CheckCircle2 aria-hidden="true" /> : null}
          {state.kind === "error" ? <CircleAlert aria-hidden="true" /> : null}
          {state.message}
        </p>
      </div>
    </form>
  );
}
