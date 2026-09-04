"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import styles from "./ecosystem-lead-form.module.css";

const interests = ["Kits individuales", "Pack para aula", "Talleres", "Capacitación docente"] as const;
type FieldName = "name" | "phone" | "email" | "organizationType" | "interests" | "consent";
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
  if (name.length < 2) errors.name = "Escribe tu nombre.";
  if (phone.length < 6 || !phonePattern.test(phone)) errors.phone = "Ingresa un WhatsApp válido.";
  if (!emailPattern.test(email) || email.length > 254) errors.email = "Ingresa un correo válido.";
  if (!valueFrom(data, "organizationType")) errors.organizationType = "Selecciona el tipo de consulta.";
  if (!data.getAll("interests").length) errors.interests = "Selecciona al menos una opción.";
  if (data.get("consent") !== "yes") errors.consent = "Necesitamos tu autorización para responderte.";
  return errors;
}

export function EducationLeadForm() {
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

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setState({ kind: "error", message: "Revisa los campos señalados antes de enviar." });
      const firstInvalid = (["name", "phone", "email", "organizationType", "interests", "consent"] as const).find((field) => nextErrors[field]);
      if (firstInvalid) requestAnimationFrame(() => formElement.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus());
      return;
    }

    setErrors({});
    setState({ kind: "loading", message: "Enviando tu consulta…" });
    const payload = {
      name: valueFrom(data, "name"),
      company: valueFrom(data, "organization"),
      phone: valueFrom(data, "phone"),
      email: valueFrom(data, "email"),
      type: "CONSULTATION",
      service: "Wilo Education",
      message: valueFrom(data, "message"),
      source: "education-page",
      website: valueFrom(data, "website"),
      details: {
        schemaVersion: "education-lead-v1",
        pagePath: "/education",
        clientStartedAt: new Date(startedAt.current).toISOString(),
        clientElapsedMs: Math.max(0, Date.now() - startedAt.current),
        consent: true,
        education: {
          organizationType: valueFrom(data, "organizationType"),
          city: valueFrom(data, "city") || null,
          estimatedStudents: valueFrom(data, "students") || null,
          interests: data.getAll("interests").map(String),
        },
      },
    };

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error || "No pudimos enviar la consulta.");
      formElement.reset();
      startedAt.current = Date.now();
      setState({ kind: "success", message: "Consulta recibida. Revisaremos la información y te contactaremos." });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "No pudimos enviar la consulta." });
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <div className={styles.heading}>
        <span>Consulta Education</span>
        <h2>Diseñemos el próximo reto.</h2>
        <p>Cuéntanos para quién es la experiencia. Te ayudaremos a definir el kit, pack o programa adecuado.</p>
      </div>

      <div className={styles.sectionLabel}><span>01</span> Datos de contacto</div>
      <div className={styles.grid}>
        <label className={styles.field}><span>Nombre y apellido <b aria-hidden="true">*</b></span><input aria-describedby={errors.name ? "edu-name-error" : undefined} aria-invalid={Boolean(errors.name)} autoComplete="name" maxLength={120} name="name" onChange={() => clearError("name")} placeholder="¿Cómo te llamas?" />{errors.name ? <small className={styles.error} id="edu-name-error">{errors.name}</small> : null}</label>
        <label className={styles.field}><span>Institución <i>(opcional)</i></span><input autoComplete="organization" maxLength={160} name="organization" placeholder="Colegio, taller u organización" /></label>
        <label className={styles.field}><span>WhatsApp <b aria-hidden="true">*</b></span><input aria-describedby={errors.phone ? "edu-phone-error" : undefined} aria-invalid={Boolean(errors.phone)} autoComplete="tel" inputMode="tel" maxLength={30} name="phone" onChange={() => clearError("phone")} placeholder="+51 999 999 999" />{errors.phone ? <small className={styles.error} id="edu-phone-error">{errors.phone}</small> : null}</label>
        <label className={styles.field}><span>Correo <b aria-hidden="true">*</b></span><input aria-describedby={errors.email ? "edu-email-error" : undefined} aria-invalid={Boolean(errors.email)} autoComplete="email" maxLength={254} name="email" onChange={() => clearError("email")} placeholder="nombre@institucion.com" type="email" />{errors.email ? <small className={styles.error} id="edu-email-error">{errors.email}</small> : null}</label>
      </div>

      <div className={styles.sectionLabel}><span>02</span> La experiencia</div>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Tipo de consulta <b aria-hidden="true">*</b></span>
          <select aria-describedby={errors.organizationType ? "edu-type-error" : undefined} aria-invalid={Boolean(errors.organizationType)} defaultValue="" name="organizationType" onChange={() => clearError("organizationType")}>
            <option disabled value="">Selecciona una opción</option><option>Familia</option><option>Colegio</option><option>Taller o academia</option><option>Empresa u organización</option>
          </select>
          {errors.organizationType ? <small className={styles.error} id="edu-type-error">{errors.organizationType}</small> : null}
        </label>
        <label className={styles.field}><span>Ciudad <i>(opcional)</i></span><input autoComplete="address-level2" maxLength={120} name="city" placeholder="Ciudad o distrito" /></label>
        <label className={`${styles.field} ${styles.wide}`}><span>Cantidad estimada de estudiantes <i>(opcional)</i></span><input inputMode="numeric" max="5000" min="1" name="students" placeholder="Ej. 24" type="number" /></label>
      </div>

      <fieldset aria-describedby={errors.interests ? "edu-interests-error" : "edu-interests-help"} className={styles.services}>
        <legend>¿Qué te interesa? <b aria-hidden="true">*</b></legend><p id="edu-interests-help">Puedes elegir más de una opción.</p>
        <div className={styles.serviceGrid}>{interests.map((interest) => <label key={interest}><input name="interests" onChange={() => clearError("interests")} type="checkbox" value={interest} /><span>{interest}</span></label>)}</div>
        {errors.interests ? <small className={styles.error} id="edu-interests-error">{errors.interests}</small> : null}
      </fieldset>

      <label className={`${styles.field} ${styles.message}`}><span>Detalles <i>(opcional)</i></span><textarea maxLength={4000} name="message" placeholder="Edades, objetivo del programa, fechas u otra información útil." rows={5} /></label>
      <label className={styles.honeypot} aria-hidden="true">No completar<input aria-hidden="true" autoComplete="off" name="website" tabIndex={-1} /></label>
      <label className={styles.consent}><input aria-describedby={errors.consent ? "edu-consent-error" : undefined} aria-invalid={Boolean(errors.consent)} name="consent" onChange={() => clearError("consent")} type="checkbox" value="yes" /><span>Autorizo a Wilo Studio a usar estos datos para atender mi solicitud. Consulta la <Link href="/privacidad">política de privacidad</Link>.</span></label>
      {errors.consent ? <small className={styles.error} id="edu-consent-error">{errors.consent}</small> : null}

      <div className={styles.submitRow}>
        <button disabled={state.kind === "loading"} type="submit">{state.kind === "loading" ? <LoaderCircle className={styles.spinner} aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}{state.kind === "loading" ? "Enviando…" : "Enviar consulta"}</button>
        <p aria-live="polite" className={`${styles.status} ${state.kind === "success" ? styles.success : ""} ${state.kind === "error" ? styles.statusError : ""}`} role={state.kind === "error" ? "alert" : "status"}>{state.kind === "success" ? <CheckCircle2 aria-hidden="true" /> : null}{state.kind === "error" ? <CircleAlert aria-hidden="true" /> : null}{state.message}</p>
      </div>
    </form>
  );
}
