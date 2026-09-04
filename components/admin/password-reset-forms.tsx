"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/password-reset/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo procesar la solicitud.");
      setSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo procesar la solicitud.");
    } finally { setLoading(false); }
  };

  return (
    <form className="ad-login-form" onSubmit={submit}>
      <div className="ad-login-heading"><span>Recuperación segura</span><h1>Recupera tu acceso.</h1><p>Te enviaremos un enlace de un solo uso si tu cuenta está habilitada.</p></div>
      {sent ? <div className="ad-login-success" role="status"><CheckCircle2 size={20} /><div><strong>Revisa tu correo</strong><span>Si la cuenta existe y SMTP está configurado, el enlace llegará en unos minutos y vencerá en 30 minutos.</span></div></div> : (
        <>
          <label className="ad-login-field"><span>Correo electrónico</span><div><Mail size={18} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" autoComplete="email" required autoFocus /></div></label>
          {error && <div className="ad-login-error" role="alert"><AlertCircle size={18} /><span>{error}</span></div>}
          <button className="ad-login-submit" type="submit" disabled={loading}>{loading ? <LoaderCircle className="is-spinning" size={19} /> : <>Enviar enlace <ArrowRight size={18} /></>}</button>
        </>
      )}
      <Link className="ad-login-secondary-link" href="/admin/login"><ArrowLeft size={15} /> Volver al inicio de sesión</Link>
    </form>
  );
}

export function PasswordResetConfirmForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmation) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/password-reset/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo actualizar la contraseña.");
      setComplete(true);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "No se pudo actualizar la contraseña.");
    } finally { setLoading(false); }
  };

  if (!token) return <div className="ad-login-form"><div className="ad-login-heading"><span>Enlace inválido</span><h1>Falta el token.</h1><p>Solicita un enlace nuevo para continuar.</p></div><Link className="ad-login-secondary-link" href="/admin/recuperar"><ArrowLeft size={15} /> Solicitar otro enlace</Link></div>;

  return (
    <form className="ad-login-form" onSubmit={submit}>
      <div className="ad-login-heading"><span>Nueva contraseña</span><h1>Crea un acceso nuevo.</h1><p>Usa al menos 12 caracteres. Al guardar, se cerrarán las sesiones anteriores.</p></div>
      {complete ? <div className="ad-login-success" role="status"><CheckCircle2 size={20} /><div><strong>Contraseña actualizada</strong><span>Las sesiones anteriores fueron revocadas.</span></div></div> : (
        <>
          <label className="ad-login-field"><span>Nueva contraseña</span><div><LockKeyhole size={18} /><input type={show ? "text" : "password"} minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required autoFocus /><button type="button" onClick={() => setShow((current) => !current)} aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          <label className="ad-login-field"><span>Confirmar contraseña</span><div><LockKeyhole size={18} /><input type={show ? "text" : "password"} minLength={12} maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" required /></div></label>
          {error && <div className="ad-login-error" role="alert"><AlertCircle size={18} /><span>{error}</span></div>}
          <button className="ad-login-submit" type="submit" disabled={loading}>{loading ? <LoaderCircle className="is-spinning" size={19} /> : <>Guardar contraseña <ArrowRight size={18} /></>}</button>
        </>
      )}
      <Link className="ad-login-secondary-link" href="/admin/login"><ArrowLeft size={15} /> Ir al inicio de sesión</Link>
    </form>
  );
}
