import { PasswordResetRequestForm } from "@/components/admin/password-reset-forms";

export default function PasswordResetRequestPage() {
  return (
    <main id="contenido" className="admin-route ad-login-page">
      <section className="ad-login-brand-panel">
        <div className="ad-login-brand"><span className="ad-brand-mark">W</span><span><strong>wilo</strong><small>OS</small></span></div>
        <div className="ad-login-statement"><span>Acceso protegido</span><h2>Vuelve.<br />Con seguridad.</h2><p>Un enlace temporal permite recuperar el acceso sin revelar ni reutilizar tu contraseña anterior.</p></div>
        <div className="ad-login-grid" aria-hidden="true" /><div className="ad-login-orbit orbit-one" aria-hidden="true" /><div className="ad-login-orbit orbit-two" aria-hidden="true" />
      </section>
      <section className="ad-login-form-panel"><PasswordResetRequestForm /><footer><span>Wilo OS</span><span>Token de un solo uso</span></footer></section>
    </main>
  );
}
