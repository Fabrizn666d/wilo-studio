"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { Brand } from "./brand";
import { useSiteSettings } from "./site-settings-provider";

const columns = [
  { title: "Estudio", links: [["Proyectos", "/proyectos"], ["Servicios", "/servicios"], ["Nosotros", "/nosotros"], ["Contacto", "/contacto"]] },
  { title: "Ecosistema", links: [["Wilo Education", "/education"], ["Wilo Express", "/express"], ["Wilo Events", "/events"], ["Tienda", "/tienda"]] },
  { title: "Legal", links: [["Privacidad", "/privacidad"], ["Términos", "/terminos"], ["Libro de reclamaciones", "/libro-de-reclamaciones"], ["Medios de pago", "/medios-de-pago"]] },
];

export function SiteFooter() {
  const settings = useSiteSettings();
  return (
    <footer className="site-footer">
      <div className="footer-top shell">
        <div className="footer-pitch">
          <Brand inverted />
          <h2>Tu próximo proyecto puede empezar hoy.</h2>
          <p>Soluciones que hacen ver, vender y crecer tu negocio.</p>
          <Link href="/contacto" className="button button-yellow">Conversemos <ArrowUpRight size={18} /></Link>
        </div>
        <div className="footer-links">
          {columns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </div>
          ))}
        </div>
      </div>
      <div className="footer-contact shell">
        <a href={settings.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} /> {settings.phoneDisplay}</a>
        {settings.emailVerified ? <a href={`mailto:${settings.email}`}><Mail size={17} /> {settings.email}</a> : null}
        <span><MapPin size={17} /> {settings.location}</span>
      </div>
      <div className="footer-legal shell">
        <p>RUC {settings.ruc} · {settings.legalName}</p>
        <p>{settings.invoiceNote}</p>
        <p>© {new Date().getFullYear()} Wilo Studio</p>
      </div>
    </footer>
  );
}
