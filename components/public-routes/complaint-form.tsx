"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";

type SubmitState = { kind: "idle" | "loading" | "success" | "error"; message?: string; code?: string };

function field(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

export function ComplaintForm() {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const amount = field(form, "amount");
    const recordType = field(form, "recordType");
    setState({ kind: "loading" });

    try {
      const response = await fetch("/api/reclamaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consumerName: field(form, "consumerName"),
          documentType: field(form, "documentType"),
          documentNumber: field(form, "documentNumber"),
          email: field(form, "email"),
          phone: field(form, "phone"),
          address: field(form, "address"),
          recordType,
          goodType: field(form, "goodType"),
          amountCents: amount ? Math.round(Number(amount) * 100) : undefined,
          description: field(form, "description"),
          requestedAction: field(form, "requestedAction"),
          website: field(form, "website"),
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; complaint?: { code?: string } };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "No pudimos registrar la hoja.");
      formElement.reset();
      setState({ kind: "success", code: payload.complaint?.code, message: "Tu hoja fue registrada correctamente. Guarda el código para cualquier seguimiento." });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "No pudimos registrar la hoja." });
    }
  }

  return (
    <form className="pr-form pr-complaint-form" onSubmit={submit}>
      <div className="pr-form__heading">
        <span>01</span><div><h2>Identificación del consumidor</h2><p>Completa tus datos para poder responderte por escrito.</p></div>
      </div>
      <div className="pr-form__grid">
        <label className="is-wide">Nombre o razón social<input autoComplete="name" maxLength={160} name="consumerName" required /></label>
        <label>Tipo de documento<select name="documentType" required defaultValue="DNI"><option value="DNI">DNI</option><option value="CE">Carné de extranjería</option><option value="PASSPORT">Pasaporte</option><option value="RUC">RUC</option></select></label>
        <label>Número de documento<input inputMode="text" maxLength={20} minLength={6} name="documentNumber" required /></label>
        <label>Correo electrónico<input autoComplete="email" maxLength={254} name="email" required type="email" /></label>
        <label>Teléfono / WhatsApp<input autoComplete="tel" inputMode="tel" maxLength={30} name="phone" required /></label>
        <label className="is-wide">Domicilio<input autoComplete="street-address" maxLength={300} name="address" required /></label>
      </div>

      <div className="pr-form__heading">
        <span>02</span><div><h2>Detalle de la hoja</h2><p>Describe el producto o servicio y la solución que solicitas.</p></div>
      </div>
      <div className="pr-form__grid">
        <label>Tipo de registro<select name="recordType" required defaultValue="RECLAMO"><option value="RECLAMO">Reclamo</option><option value="QUEJA">Queja</option></select></label>
        <label>Relacionado con<select name="goodType" required defaultValue="SERVICE"><option value="PRODUCT">Producto</option><option value="SERVICE">Servicio</option></select></label>
        <label className="is-wide">Monto reclamado en soles <span>(opcional)</span><input inputMode="decimal" min="0" name="amount" step="0.01" type="number" /></label>
        <label className="is-wide">Detalle del reclamo o queja<textarea maxLength={5000} minLength={10} name="description" required rows={6} /></label>
        <label className="is-wide">Pedido concreto del consumidor<textarea maxLength={3000} minLength={5} name="requestedAction" required rows={4} /></label>
      </div>
      <label className="pr-honeypot" aria-hidden="true">No completar<input autoComplete="off" name="website" tabIndex={-1} /></label>
      <label className="pr-consent"><input required type="checkbox" /> Declaro que la información registrada es verdadera y autorizo el contacto necesario para atender esta hoja.</label>
      <p className="pr-form__legal-note">La presentación de esta hoja no impide acudir a otros mecanismos de solución de controversias ni es requisito previo para presentar una denuncia ante Indecopi.</p>

      <div className="pr-form__submit">
        <button className="pr-button pr-button--dark" disabled={state.kind === "loading"} type="submit">
          {state.kind === "loading" ? <LoaderCircle className="pr-spin" aria-hidden="true" size={18} /> : <Send aria-hidden="true" size={18} />}
          {state.kind === "loading" ? "Registrando…" : "Enviar hoja"}
        </button>
        <div className={`pr-form__status is-${state.kind}`} role="status" aria-live="polite">
          {state.kind === "success" ? <CheckCircle2 aria-hidden="true" size={20} /> : null}
          <span>{state.message}{state.code ? <><br /><strong>Código: {state.code}</strong></> : null}</span>
        </div>
      </div>
    </form>
  );
}
