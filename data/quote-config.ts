import { serviceShowcaseItems } from "@/data/services-showcase";

export type QuoteService = (typeof serviceShowcaseItems)[number] & {
  functions: readonly string[];
  estimateFrom?: number;
};

const functionsByService: Readonly<Record<string, readonly string[]>> = {
  "webs-corporativas": ["Páginas institucionales", "Catálogo", "Panel administrable", "Multiidioma", "Formularios", "Dominio y hosting", "Correos corporativos", "Integraciones"],
  "landing-pages": ["Formulario de leads", "Analítica", "Pixel publicitario", "Integración con CRM", "WhatsApp", "Pruebas A/B", "Dominio y hosting"],
  "tiendas-catalogos-digitales": ["Catálogo", "Carrito", "Pagos", "Stock", "Pedidos", "Cupones", "Facturación", "Panel administrable", "Envíos"],
  "apps-moviles": ["Android", "iOS", "PWA", "Login y roles", "Notificaciones", "GPS", "Pagos", "API", "Panel administrable"],
  "sistemas-plataformas-medida": ["Usuarios y roles", "Procesos internos", "Clientes", "Reportes", "Documentos", "Notificaciones", "Integraciones", "Panel administrable"],
  "crm-erp-saas": ["Usuarios", "Áreas", "Clientes", "Ventas", "Inventario", "Permisos", "Reportes", "Dashboards", "Integraciones", "Sedes"],
  "facturacion-electronica-pos": ["SUNAT", "Factura", "Boleta", "Productos", "POS", "Inventario", "Cajas", "Sedes", "Usuarios", "Reportes"],
  "cotizadores-configuradores": ["Reglas de precio", "Productos o servicios", "PDF de proforma", "Aprobaciones", "Firma", "Notificaciones", "CRM", "Panel administrable"],
  "reservas-citas-turnos": ["Calendario", "Disponibilidad", "Pagos", "Confirmaciones", "Recordatorios", "Profesionales", "Sedes", "Panel administrable"],
  "tracking-logistica": ["Vehículos", "Rutas", "GPS", "Estados", "Evidencias", "Notificaciones", "Portal de clientes", "Mapa"],
  "automatizacion-procesos": ["APIs", "Webhooks", "Sistemas existentes", "Procesos y triggers", "Transformación de datos", "Usuarios", "Alertas", "Documentos"],
  "apis-sistemas-conectados": ["API REST", "Webhooks", "SUNAT", "WhatsApp", "Pagos", "Google", "Sistema existente", "Monitoreo"],
  "dashboards-bi-analitica": ["KPIs", "Reportes", "Fuentes de datos", "Filtros", "Exportación", "Alertas", "Roles", "Actualización en tiempo real"],
  "inteligencia-artificial": ["Chatbot", "Documentos", "Asistentes", "WhatsApp", "Web", "Base de conocimiento", "Usuarios", "Automatización"],
  "portales-clientes-autoservicio": ["Cuentas", "Documentos", "Pagos", "Solicitudes", "Historial", "Notificaciones", "Roles", "Soporte"],
  "gestion-documental-firmas": ["Contratos", "Expedientes", "Aprobaciones", "Firma digital", "Versiones", "Permisos", "Alertas", "Auditoría"],
  "correos-corporativos": ["Dominio propio", "Buzones", "Migración", "Antispam", "Alias", "Grupos", "Respaldo", "Administración"],
};

const simpleEstimates: Readonly<Record<string, number>> = {
  "webs-corporativas": 1070,
  "landing-pages": 500,
  "tiendas-catalogos-digitales": 1420,
  "correos-corporativos": 120,
};

export const quoteServices: readonly QuoteService[] = serviceShowcaseItems.map((service) => ({
  ...service,
  functions: functionsByService[service.slug] ?? service.features,
  estimateFrom: simpleEstimates[service.slug],
}));

export const quoteNeeds = [
  "Generar más consultas o ventas",
  "Ordenar procesos internos",
  "Reducir trabajo manual",
  "Dar seguimiento a clientes",
  "Integrar sistemas existentes",
  "Lanzar una nueva solución",
] as const;

export const quoteScopes = [
  "Una primera versión esencial",
  "Solución completa para un equipo",
  "Varias áreas o sedes",
  "Aún necesito definirlo con Wilo",
] as const;

export const quoteBudgets = [
  "Menos de S/ 2,000",
  "S/ 2,000 – S/ 5,000",
  "S/ 5,000 – S/ 12,000",
  "S/ 12,000 – S/ 30,000",
  "Más de S/ 30,000",
  "Necesito orientación",
] as const;

export const quoteTimeframes = [
  "Lo antes posible",
  "En 1 a 2 meses",
  "En 3 a 6 meses",
  "Más adelante / por definir",
] as const;

export function findQuoteService(value?: string) {
  if (!value) return undefined;
  const legacyPlans: Readonly<Record<string, string>> = {
    "landing-page-presencia-rapida": "landing-pages",
    "catalogo-web-panel": "tiendas-catalogos-digitales",
    "pagina-corporativa": "webs-corporativas",
    "tienda-virtual": "tiendas-catalogos-digitales",
  };
  const slug = legacyPlans[value] ?? value;
  return quoteServices.find((service) => service.slug === slug);
}
