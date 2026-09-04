"use client";

import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AdminLoginForm({ callbackUrl = "/admin" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });
      if (!result?.ok || result.error) {
        setError("Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.");
        return;
      }
      router.push(result.url || callbackUrl);
      router.refresh();
    } catch {
      setError("No se pudo iniciar sesión. Inténtalo nuevamente en unos segundos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ad-login-form" onSubmit={submit}>
      <div className="ad-login-heading"><span>Acceso privado</span><h1>Bienvenido de vuelta.</h1><p>Ingresa con las credenciales de tu equipo.</p></div>
      <label className="ad-login-field">
        <span>Correo electrónico</span>
        <div><Mail size={18} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" autoComplete="email" required autoFocus /></div>
      </label>
      <label className="ad-login-field">
        <span>Contraseña</span>
        <div><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••••" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
      </label>
      {error && <div className="ad-login-error" role="alert"><AlertCircle size={18} /><span>{error}</span></div>}
      <button className="ad-login-submit" type="submit" disabled={loading}>{loading ? <LoaderCircle className="is-spinning" size={19} /> : <>Entrar al panel <ArrowRight size={18} /></>}</button>
      <Link className="ad-login-secondary-link" href="/admin/recuperar">¿Olvidaste tu contraseña?</Link>
      <p className="ad-login-help">El acceso está protegido y limitado a usuarios autorizados.</p>
    </form>
  );
}
