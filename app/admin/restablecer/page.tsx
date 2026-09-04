import { PasswordResetConfirmForm } from "@/components/admin/password-reset-forms";

export default async function PasswordResetConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <main id="contenido" className="admin-route ad-login-page">
      <section className="ad-login-brand-panel">
        <div className="ad-login-brand"><span className="ad-brand-mark">W</span><span><strong>wilo</strong><small>OS</small></span></div>
        <div className="ad-login-statement"><span>Sesión segura</span><h2>Renueva.<br />Y continúa.</h2><p>Al terminar, cualquier sesión administrativa anterior dejará de ser válida.</p></div>
        <div className="ad-login-grid" aria-hidden="true" /><div className="ad-login-orbit orbit-one" aria-hidden="true" /><div className="ad-login-orbit orbit-two" aria-hidden="true" />
      </section>
      <section className="ad-login-form-panel"><PasswordResetConfirmForm token={token} /><footer><span>Wilo OS</span><span>Acceso seguro</span></footer></section>
    </main>
  );
}
