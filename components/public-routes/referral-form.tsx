"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";

type SubmitState = { kind: "idle" | "loading" | "success" | "error"; message?: string };

function field(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

export function ReferralForm() {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setState({ kind: "loading" });

    try {
      const response = await fetch("/api/referidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerName: field(form, "referrerName"),
          referrerEmail: field(form, "referrerEmail") || undefined,
          referrerPhone: field(form, "referrerPhone"),
          referredName: field(form, "referredName"),
          referredEmail: field(form, "referredEmail") || undefined,
          referredPhone: field(form, "referredPhone"),
          notes: field(form, "notes") || undefined,
          website: field(form, "website"),
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "No pudimos registrar el referido.");
      formElement.reset();
      setState({ kind: "success", message: "¡Gracias! El referido quedó registrado y nuestro equipo hará el seguimiento." });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "No pudimos registrar el referido." });
    }
  }

  return (
    <form className="pr-form" onSubmit={submit}>
      <div className="pr-form__heading">
        <span>01</span>
        <div><h2>Tus datos</h2><p>Así podremos reconocer quién realizó la recomendación.</p></div>
      </div>
      <div className="pr-form__grid">
        <label>Nombre y apellido<input autoComplete="name" maxLength={120} name="referrerName" required /></label>
        <label>WhatsApp<input autoComplete="tel" inputMode="tel" maxLength={30} name="referrerPhone" required /></label>
        <label className="is-wide">Correo <span>(opcional)</span><input autoComplete="email" maxLength={254} name="referrerEmail" type="email" /></label>
      </div>

      <div className="pr-form__heading">
        <span>02</span>
        <div><h2>Datos del referido</h2><p>Contactaremos a la persona con respeto y solo por esta recomendación.</p></div>
      </div>
      <div className="pr-form__grid">
        <label>Nombre y apellido<input maxLength={120} name="referredName" required /></label>
        <label>WhatsApp<input inputMode="tel" maxLength={30} name="referredPhone" required /></label>
        <label className="is-wide">Correo <span>(opcional)</span><input maxLength={254} name="referredEmail" type="email" /></label>
        <label className="is-wide">¿Qué podría necesitar? <span>(opcional)</span><textarea maxLength={2000} name="notes" rows={4} /></label>
      </div>
      <label className="pr-honeypot" aria-hidden="true">No completar<input autoComplete="off" name="website" tabIndex={-1} /></label>
      <label className="pr-consent"><input required type="checkbox" /> Confirmo que cuento con autorización para compartir estos datos de contacto.</label>

      <div className="pr-form__submit">
        <button className="pr-button pr-button--dark" disabled={state.kind === "loading"} type="submit">
          {state.kind === "loading" ? <LoaderCircle className="pr-spin" aria-hidden="true" size={18} /> : <ArrowRight aria-hidden="true" size={18} />}
          {state.kind === "loading" ? "Registrando…" : "Registrar referido"}
        </button>
        <p className={`pr-form__status is-${state.kind}`} role="status" aria-live="polite">
          {state.kind === "success" ? <CheckCircle2 aria-hidden="true" size={18} /> : null}{state.message}
        </p>
      </div>
    </form>
  );
}

