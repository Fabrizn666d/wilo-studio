export type ServiceShowcaseItem = {
  slug: string;
  number: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  rgb: string;
  image: string;
  imageAlt: string;
  features: readonly string[];
};

export const serviceShowcaseItems: readonly ServiceShowcaseItem[] = [
  {
    slug: "webs-corporativas",
    number: "01",
    name: "Webs Corporativas",
    shortName: "Webs corporativas",
    description: "Sitios empresariales e institucionales diseñados para comunicar, convertir y hacer crecer tu marca.",
    color: "#7BA7FF", rgb: "123 167 255",
    image: "/services/corporate-web/visual.webp",
    imageAlt: "Laptop y teléfono mostrando una web corporativa desarrollada por Wilo Studio",
    features: ["Diseño a medida", "Administrable", "SEO técnico"],
  },
  {
    slug: "landing-pages", number: "02", name: "Landing Pages", shortName: "Landing pages",
    description: "Páginas para campañas y lanzamientos enfocadas en leads, productos y conversión.",
    color: "#5ED8F7", rgb: "94 216 247", image: "/services/generated/landing-pages.png",
    imageAlt: "Laptop y smartphone con una landing page de campaña",
    features: ["Campañas", "Leads", "Conversión"],
  },
  {
    slug: "tiendas-catalogos-digitales", number: "03", name: "Tiendas & Catálogos Digitales", shortName: "Tiendas y catálogos digitales",
    description: "E-commerce administrable con productos, pedidos, stock, pagos y ventas online.",
    color: "#FF9E91", rgb: "255 158 145", image: "/services/ecommerce/visual.webp",
    imageAlt: "Laptop y smartphone mostrando una tienda digital administrable",
    features: ["Productos", "Pedidos", "Pagos"],
  },
  {
    slug: "apps-moviles", number: "04", name: "Apps Móviles", shortName: "Apps móviles",
    description: "Aplicaciones Android, iOS y PWA para equipos, operaciones y clientes.",
    color: "#A879FF", rgb: "168 121 255", image: "/services/generated/apps-mobile.png",
    imageAlt: "Tres smartphones mostrando una aplicación móvil premium",
    features: ["Android", "iOS", "PWA"],
  },
  {
    slug: "sistemas-plataformas-medida", number: "05", name: "Sistemas & Plataformas a Medida", shortName: "Sistemas y plataformas a medida",
    description: "Software creado alrededor de la operación real de cada empresa.",
    color: "#67DDB8", rgb: "103 221 184", image: "/services/platforms/visual.webp",
    imageAlt: "Laptop con un sistema empresarial y paneles administrativos",
    features: ["Intranets", "Paneles", "Operación"],
  },
  {
    slug: "crm-erp-saas", number: "06", name: "CRM · ERP · SaaS", shortName: "CRM, ERP y SaaS",
    description: "Clientes, ventas, inventario, personal y proyectos conectados en una sola plataforma.",
    color: "#FFC875", rgb: "255 200 117", image: "/images/wilo/generated/lab-operations-atlas.png",
    imageAlt: "Panel CRM con métricas, proyectos y operaciones conectadas",
    features: ["Clientes", "Operaciones", "SaaS"],
  },
  {
    slug: "facturacion-electronica-pos", number: "07", name: "Facturación Electrónica & POS", shortName: "Facturación electrónica y POS",
    description: "Facturas, boletas, caja, inventario y ventas integradas con SUNAT.",
    color: "#86C7FF", rgb: "134 199 255", image: "/services/generated/facturacion-pos.png",
    imageAlt: "Tablet, comprobante y terminal de punto de venta digital",
    features: ["SUNAT", "Caja", "Inventario"],
  },
  {
    slug: "cotizadores-configuradores", number: "08", name: "Cotizadores & Configuradores", shortName: "Cotizadores y configuradores",
    description: "Precios dinámicos, calculadoras y proformas generadas con precisión.",
    color: "#78D9B0", rgb: "120 217 176", image: "/services/quotes/visual.webp",
    imageAlt: "Laptop y teléfono con un configurador de cotización por pasos",
    features: ["Precios", "Calculadoras", "Proformas"],
  },
  {
    slug: "reservas-citas-turnos", number: "09", name: "Reservas · Citas · Turnos", shortName: "Reservas, citas y turnos",
    description: "Disponibilidad, pagos, confirmaciones y recordatorios en un solo flujo.",
    color: "#B9A0FF", rgb: "185 160 255", image: "/services/generated/reservas-citas.png",
    imageAlt: "Laptop y smartphone con agenda, calendario y reservas",
    features: ["Agenda", "Pagos", "Recordatorios"],
  },
  {
    slug: "tracking-logistica", number: "10", name: "Tracking & Logística", shortName: "Tracking y logística",
    description: "Rutas, GPS, vehículos, estados, evidencias y notificaciones en tiempo real.",
    color: "#31BCD4", rgb: "49 188 212", image: "/services/generated/tracking-logistics.png",
    imageAlt: "Monitor y teléfono mostrando rutas y seguimiento logístico",
    features: ["GPS", "Rutas", "Estados"],
  },
  {
    slug: "automatizacion-procesos", number: "11", name: "Automatización de Procesos", shortName: "Automatización de procesos",
    description: "Workflows y tareas automáticas que conectan y aceleran la operación.",
    color: "#5BD28B", rgb: "91 210 139", image: "/services/automation/visual.webp",
    imageAlt: "Estación de trabajo con un flujo visual de automatización",
    features: ["Workflows", "Alertas", "Documentos"],
  },
  {
    slug: "apis-sistemas-conectados", number: "12", name: "APIs & Sistemas Conectados", shortName: "APIs y sistemas conectados",
    description: "Integraciones con SUNAT, WhatsApp, pagos, Google y sistemas externos.",
    color: "#7667D9", rgb: "118 103 217", image: "/services/generated/apis-connected.png",
    imageAlt: "Laptop con nodos y paneles conectados mediante APIs",
    features: ["Integraciones", "Webhooks", "APIs"],
  },
  {
    slug: "dashboards-bi-analitica", number: "13", name: "Dashboards · BI · Analítica", shortName: "Dashboards, BI y analítica",
    description: "KPIs, reportes e indicadores para decidir con datos en tiempo real.",
    color: "#E383D3", rgb: "227 131 211", image: "/images/wilo/generated/lab-intelligence-atlas.png",
    imageAlt: "Dashboard oscuro con gráficos e indicadores empresariales",
    features: ["KPIs", "Reportes", "Monitoreo"],
  },
  {
    slug: "inteligencia-artificial", number: "14", name: "Inteligencia Artificial", shortName: "Inteligencia artificial",
    description: "Asistentes, chatbots y automatizaciones inteligentes aplicadas al negocio.",
    color: "#708BFF", rgb: "112 139 255", image: "/services/generated/artificial-intelligence.png",
    imageAlt: "Interfaz de asistente inteligente con paneles de conversación y análisis",
    features: ["Asistentes", "Chatbots", "IA generativa"],
  },
  {
    slug: "portales-clientes-autoservicio", number: "15", name: "Portales de Clientes & Autoservicio", shortName: "Portales de clientes y autoservicio",
    description: "Cuentas, documentos, pagos, solicitudes e historial en un área privada.",
    color: "#58D2E6", rgb: "88 210 230", image: "/services/support/visual.webp",
    imageAlt: "Monitor y tablet mostrando un portal privado para clientes",
    features: ["Cuentas", "Pagos", "Seguimiento"],
  },
  {
    slug: "gestion-documental-firmas", number: "16", name: "Gestión Documental & Firmas", shortName: "Gestión documental y firmas",
    description: "Contratos, expedientes, aprobaciones y firmas dentro de flujos seguros.",
    color: "#FFAAA0", rgb: "255 170 160", image: "/services/generated/document-signatures.png",
    imageAlt: "Laptop, tablet y documentos digitales dentro de un flujo de aprobación",
    features: ["Contratos", "Aprobaciones", "Firmas"],
  },
  {
    slug: "correos-corporativos", number: "17", name: "Correos Corporativos", shortName: "Correos corporativos",
    description: "Dominios y buzones profesionales con administración y seguridad empresarial.",
    color: "#4F8EFF", rgb: "79 142 255", image: "/services/corporate-email/visual.webp",
    imageAlt: "Laptop y teléfono con una bandeja de correo corporativo sincronizada",
    features: ["Dominio propio", "Buzones", "Seguridad"],
  },
];
