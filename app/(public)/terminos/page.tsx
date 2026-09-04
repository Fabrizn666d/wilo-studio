import type { Metadata } from "next";
import Link from "next/link";
import { PublicHero } from "@/components/public-routes/route-ui";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Condiciones generales para usar el sitio, contratar servicios y comprar productos de Wilo Studio.",
  alternates: { canonical: "/terminos" },
  openGraph: { title: "Términos y condiciones | Wilo Studio", description: "Condiciones generales para usar el sitio, contratar servicios y comprar productos de Wilo Studio.", url: "/terminos", images: [{ url: "/brand/portfolio-showcase.webp", alt: "Wilo Studio" }] },
  twitter: { card: "summary_large_image", title: "Términos y condiciones | Wilo Studio", description: "Condiciones generales para usar el sitio, contratar servicios y comprar productos de Wilo Studio.", images: ["/brand/portfolio-showcase.webp"] },
};

// TODO: validar la versión final con asesoría legal peruana antes de producción.
export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const settings = await getPublicSiteSettings();
  return (
    <main id="contenido" className="pr-page pr-legal-page">
      <PublicHero description="Estas condiciones explican las reglas generales de uso del sitio, contratación de proyectos y compra de productos. Una propuesta, cotización o ficha puede incluir condiciones específicas adicionales." eyebrow="Información legal" tone="cream" title={<>Términos y <em>condiciones.</em></>} />
      <article className="pr-section pr-section--cream"><div className="pr-shell pr-legal-copy">
        <p className="pr-legal-date">Última actualización: 11 de agosto de 2026</p>
        <section><span>01</span><div><h2>Identificación</h2><p>Este sitio corresponde a <strong>{settings.name}</strong>, cuyo titular es {settings.legalName}, RUC {settings.ruc}, con atención desde {settings.location}. Puedes escribir a <a href={`mailto:${settings.email}`}>{settings.email}</a> o al WhatsApp {settings.phoneDisplay}.</p></div></section>
        <section><span>02</span><div><h2>Uso del sitio</h2><p>El contenido del sitio permite conocer servicios, productos, proyectos y canales de contacto. Al usar formularios, debes proporcionar información verdadera, contar con autorización para los datos de terceros y abstenerte de intentar alterar, interrumpir o acceder sin permiso a los sistemas.</p></div></section>
        <section><span>03</span><div><h2>Servicios y propuestas</h2><p>Todos los proyectos son personalizados. El precio final puede variar según funcionalidades, secciones, integraciones y complejidad. Antes de iniciar, Wilo Studio comunica alcance, entregables, cronograma e inversión mediante una propuesta o cotización.</p><p>La forma de pago general para proyectos es {settings.paymentTerms}, salvo que la propuesta aceptada indique una distribución distinta.</p></div></section>
        <section><span>04</span><div><h2>Precios, IGV y comprobantes</h2><p>Los planes web publicados indican el IGV por separado. Los productos de tienda deben señalar en su ficha si el precio incluye IGV. Wilo Studio emite boleta y factura electrónica; el cliente debe proporcionar los datos correctos para el comprobante solicitado.</p></div></section>
        <section><span>05</span><div><h2>Productos y licencias digitales</h2><p>La modalidad, vigencia, compatibilidad, stock y plazo de entrega aplicables son los que aparecen en la ficha del producto o en la confirmación del pedido. No se considera definitivo un dato marcado como pendiente de confirmar. Las claves de licencia se entregan tras validar el pago conforme al flujo informado en la compra.</p></div></section>
        <section><span>06</span><div><h2>Pagos y verificación</h2><p>Para pagos manuales usa únicamente las cuentas de <Link href="/medios-de-pago">medios de pago oficiales</Link>. Los pedidos con voucher quedan pendientes de verificación hasta que el equipo confirme su recepción y correspondencia.</p></div></section>
        <section><span>07</span><div><h2>Cambios, cancelaciones y observaciones</h2><p>Las condiciones de cambios o cancelación dependen del tipo de producto, del avance del servicio y de las condiciones específicas aceptadas. Si necesitas corregir un pedido o tienes una observación, comunícala cuanto antes y antes de usar o activar un producto digital.</p></div></section>
        <section><span>08</span><div><h2>Propiedad intelectual</h2><p>Las marcas, piezas y materiales del sitio pertenecen a sus respectivos titulares. El cliente declara contar con derechos o autorizaciones sobre el contenido que entrega. La titularidad y licencias de uso de cada entregable se rigen por la propuesta o contrato del proyecto.</p></div></section>
        <section><span>09</span><div><h2>Disponibilidad y enlaces</h2><p>Trabajamos para mantener el sitio disponible y actualizado, pero pueden existir interrupciones por mantenimiento, infraestructura o servicios de terceros. Los enlaces externos se ofrecen como referencia y se rigen por sus propios términos.</p></div></section>
        <section><span>10</span><div><h2>Consultas y reclamos</h2><p>Para una consulta, usa nuestros canales de contacto. Para registrar formalmente una disconformidad, accede al <Link href="/libro-de-reclamaciones">Libro de Reclamaciones</Link>. El tratamiento de datos se explica en la <Link href="/privacidad">Política de Privacidad</Link>.</p></div></section>
      </div></article>
    </main>
  );
}
