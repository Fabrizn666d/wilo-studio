import type { Metadata } from "next";
import Link from "next/link";
import { PublicHero } from "@/components/public-routes/route-ui";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo Wilo Studio recopila, utiliza y protege los datos personales enviados mediante wilostudio.site.",
  alternates: { canonical: "/privacidad" },
  openGraph: { title: "Política de privacidad | Wilo Studio", description: "Cómo Wilo Studio recopila, utiliza y protege los datos personales enviados mediante wilostudio.site.", url: "/privacidad", images: [{ url: "/brand/portfolio-showcase.webp", alt: "Wilo Studio" }] },
  twitter: { card: "summary_large_image", title: "Política de privacidad | Wilo Studio", description: "Cómo Wilo Studio recopila, utiliza y protege los datos personales enviados mediante wilostudio.site.", images: ["/brand/portfolio-showcase.webp"] },
};

// TODO: validar bancos de datos, proveedores y plazos efectivos con asesoría legal antes de producción.
export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const settings = await getPublicSiteSettings();
  return (
    <main id="contenido" className="pr-page pr-legal-page">
      <PublicHero description="Queremos que sepas qué datos recibimos cuando nos contactas, compras, refieres a una persona o registras una reclamación, y para qué los usamos." eyebrow="Protección de datos" tone="cream" title={<>Política de <em>privacidad.</em></>} />
      <article className="pr-section pr-section--cream"><div className="pr-shell pr-legal-copy">
        <p className="pr-legal-date">Última actualización: 11 de agosto de 2026</p>
        <section><span>01</span><div><h2>Responsable del tratamiento</h2><p>{settings.legalName}, RUC {settings.ruc}, titular de {settings.name}, es responsable de los datos enviados mediante este sitio. El punto de contacto es <a href={`mailto:${settings.email}`}>{settings.email}</a>, WhatsApp {settings.phoneDisplay}, {settings.location}.</p></div></section>
        <section><span>02</span><div><h2>Datos que podemos recibir</h2><p>Dependiendo del flujo, podemos recibir nombre, empresa, correo, teléfono, documento, dirección, datos de facturación, contenido de mensajes, información del proyecto, datos del pedido, voucher de pago, referencias y datos incluidos en una hoja de reclamación.</p><p>En el programa de referidos, quien registra la información debe contar con autorización de la persona referida.</p></div></section>
        <section><span>03</span><div><h2>Para qué los usamos</h2><p>Usamos los datos para responder consultas y cotizaciones; preparar y ejecutar servicios; procesar pedidos, pagos y comprobantes; entregar productos digitales; dar soporte; gestionar referidos; atender hojas de reclamación; prevenir abuso de formularios; y cumplir obligaciones aplicables.</p><p>No usamos los datos de contacto para prospección publicitaria sin la autorización exigible.</p></div></section>
        <section><span>04</span><div><h2>Conservación</h2><p>Conservamos la información durante el tiempo necesario para atender la finalidad que motivó su entrega y, cuando corresponda, durante los plazos requeridos para obligaciones contractuales, tributarias, de consumo o de defensa ante controversias. Luego se elimina, anonimiza o restringe según corresponda.</p></div></section>
        <section><span>05</span><div><h2>Proveedores y destinatarios</h2><p>La información puede ser tratada por proveedores que sostienen funciones necesarias —como hosting, base de datos, correo, pagos o soporte— bajo instrucciones y medidas de confidencialidad. También puede comunicarse cuando exista una obligación legal o requerimiento válido de autoridad competente.</p></div></section>
        <section><span>06</span><div><h2>Seguridad</h2><p>Aplicamos controles técnicos y organizativos razonables para proteger la información, limitar accesos y reducir riesgos. Ningún sistema conectado a internet puede garantizar seguridad absoluta; ante un incidente actuaremos conforme a las obligaciones aplicables.</p></div></section>
        <section><span>07</span><div><h2>Tus derechos</h2><p>Puedes solicitar acceso, rectificación, cancelación u oposición respecto de tus datos personales —derechos ARCO— escribiendo al correo de contacto e identificando tu solicitud. Si no estás conforme con la respuesta, puedes acudir a la Autoridad Nacional de Protección de Datos Personales.</p><p><a href="https://www.gob.pe/9270" rel="noreferrer" target="_blank">Conoce los derechos ARCO en la fuente oficial ↗</a></p></div></section>
        <section id="cookies"><span>08</span><div><h2>Cookies e información técnica</h2><p>El sitio puede usar almacenamiento local o de sesión estrictamente necesario para funciones como el carrito, preferencias de interfaz o el preloader. Si se incorporan tecnologías adicionales de medición o publicidad que requieran información específica o consentimiento, esta política y el mecanismo correspondiente deberán actualizarse.</p><p>El mapa de Google Maps solo se carga cuando eliges abrirlo. Al activarlo, el contenido se obtiene directamente de Google y se aplican sus políticas de privacidad.</p></div></section>
        <section><span>09</span><div><h2>Actualizaciones y contacto</h2><p>Podemos actualizar esta política si cambian los flujos del sitio o la normativa. La fecha visible al inicio indica la versión vigente. Para cualquier consulta de privacidad, usa el correo señalado arriba o nuestro <Link href="/contacto">formulario de contacto</Link>.</p></div></section>
      </div></article>
    </main>
  );
}
