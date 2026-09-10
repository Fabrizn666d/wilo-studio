export type AdminRecord = Record<string, unknown> & { id: string };

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "url"
  | "textarea"
  | "number"
  | "money"
  | "percent"
  | "checkbox"
  | "select"
  | "date"
  | "list"
  | "json"
  | "lineItems";

export type ColumnType = "text" | "status" | "money" | "date" | "boolean" | "image" | "link" | "count";

export type AdminOption = { label: string; value: string };

export type AdminField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  required?: boolean;
  requiredOnCreate?: boolean;
  wide?: boolean;
  defaultValue?: string | number | boolean;
  options?: AdminOption[];
  optionsFrom?: { resource: string; labelField: string; valueField?: string };
  allowEmpty?: boolean;
  emptyLabel?: string;
  omitEmptyOnUpdate?: boolean;
  lockUnknownOption?: boolean;
  min?: number;
  step?: number;
};

export type AdminColumn = {
  key: string;
  label: string;
  type?: ColumnType;
  secondaryKey?: string;
  statusLabels?: Record<string, string>;
};

export type AdminFilter = {
  key: string;
  label: string;
  type?: "select" | "date" | "text";
  options?: AdminOption[];
  placeholder?: string;
};

export type AdminDetail = {
  key: string;
  label: string;
  type?: ColumnType | "longText" | "items" | "related" | "email" | "phone" | "whatsapp" | "projectPreview";
};

export type AdminRowAction = {
  label: string;
  endpoint: string;
  method?: "POST" | "PATCH";
  confirm: string;
  success: string;
  visibleWhen?: { key: string; values: string[] };
  visibleWhenEmpty?: { key: string; empty: boolean };
  adminOnly?: boolean;
};

export type AdminResourceConfig = {
  resource: string;
  title: string;
  singular: string;
  description: string;
  searchPlaceholder: string;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  adminOnly?: boolean;
  roles?: string[];
  columns: AdminColumn[];
  fields: AdminField[];
  filters?: AdminFilter[];
  details?: AdminDetail[];
  actions?: AdminRowAction[];
};

const yesNo: AdminOption[] = [
  { label: "Sí", value: "true" },
  { label: "No", value: "false" },
];

const publishLabels = { true: "Publicado", false: "Borrador" };
const activeLabels = { true: "Activo", false: "Inactivo" };
const imagePathHelp = "Ruta local con extensión JPG, PNG o WebP.";
const complaintRecordTypeLabels = { RECLAMO: "Reclamo", QUEJA: "Queja" };

export const orderStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  VERIFYING: "Verificando",
  PAID: "Pagado",
  DELIVERING: "Entregando",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const leadStatusLabels: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  MEETING: "Reunión",
  PROPOSAL: "Propuesta",
  NEGOTIATION: "Negociación",
  WON: "Ganado",
  LOST: "Perdido",
};

export const leadSourceLabels: Record<string, string> = {
  STUDIO: "Wilo Studio",
  EVENTS: "Wilo Events",
  EDUCATION: "Wilo Education",
  EXPRESS: "Wilo Express",
  MANUAL: "Registro manual",
};

export const projectStatusLabels: Record<string, string> = {
  PLANNING: "Planificación",
  ACTIVE: "En curso",
  ON_HOLD: "En pausa",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

export const quoteStatusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  VIEWED: "Vista",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  EXPIRED: "Vencida",
  CANCELLED: "Cancelada",
};

export const referralStatusLabels: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  CONVERTED: "Convertido",
  REWARDED: "Beneficio otorgado",
  CLOSED: "Cerrado",
};

export const complaintStatusLabels: Record<string, string> = {
  RECEIVED: "Recibido",
  IN_REVIEW: "En revisión",
  RESPONDED: "Respondido",
  CLOSED: "Cerrado",
};

const commonOrder = { key: "sortOrder", label: "Orden", type: "number" as const, defaultValue: 0, step: 1 };
const slugField = { key: "slug", label: "Slug", type: "text" as const, required: true, placeholder: "nombre-amigable" };
const archiveFilter: AdminFilter = { key: "archived", label: "Archivo", options: [{ label: "Activos", value: "false" }, { label: "Archivados", value: "true" }] };
const archiveActions = (resource: string): AdminRowAction[] => [
  {
    label: "Archivar",
    endpoint: `/api/admin/archive/${resource}/{id}`,
    confirm: "El registro dejará de aparecer en las vistas activas, pero conservará todo su historial. ¿Continuar?",
    success: "Registro archivado correctamente.",
    visibleWhenEmpty: { key: "archivedAt", empty: true },
    adminOnly: true,
  },
  {
    label: "Restaurar",
    endpoint: `/api/admin/archive/${resource}/{id}?restore=true`,
    confirm: "El registro volverá a las vistas activas. ¿Continuar?",
    success: "Registro restaurado correctamente.",
    visibleWhenEmpty: { key: "archivedAt", empty: false },
    adminOnly: true,
  },
];

export const adminResourceConfigs: Record<string, AdminResourceConfig> = {
  projects: {
    resource: "projects",
    title: "Proyectos",
    singular: "proyecto",
    description: "Gestión interna, entregables y publicación controlada de casos de éxito.",
    searchPlaceholder: "Buscar por proyecto, slug o resumen…",
    columns: [
      { key: "coverImage", label: "Portada", type: "image" },
      { key: "title", label: "Proyecto", secondaryKey: "client.name" },
      { key: "status", label: "Operación", type: "status", statusLabels: projectStatusLabels },
      { key: "assignedTo.name", label: "Responsable" },
      { key: "contentStatus", label: "Contenido", type: "status", statusLabels: { DRAFT: "Borrador", REVIEW: "En revisión", PUBLISHED: "Publicado" } },
      { key: "targetDate", label: "Entrega", type: "date" },
    ],
    filters: [
      { key: "status", label: "Operación", options: Object.entries(projectStatusLabels).map(([value, label]) => ({ value, label })) },
      { key: "contentStatus", label: "Contenido", options: [{ label: "Borrador", value: "DRAFT" }, { label: "En revisión", value: "REVIEW" }, { label: "Publicado", value: "PUBLISHED" }] },
      { key: "publicCaseStudy", label: "Caso público", options: yesNo },
      archiveFilter,
    ],
    details: [
      { key: "id", label: "Vista previa", type: "projectPreview" },
      { key: "client.name", label: "Cliente" },
      { key: "assignedTo.name", label: "Responsable" },
      { key: "quotes", label: "Cotizaciones relacionadas", type: "related" },
      { key: "internalNotes", label: "Contexto interno", type: "longText" },
    ],
    fields: [
      { key: "title", label: "Nombre del proyecto", type: "text", required: true },
      slugField,
      { key: "category", label: "Categoría", type: "select", required: true, options: [{ label: "Tecnología", value: "Tecnología" }, { label: "Audiovisual", value: "Audiovisual" }, { label: "Infraestructura", value: "Infraestructura" }, { label: "Education", value: "Education" }] },
      { key: "clientId", label: "Cliente", type: "select", allowEmpty: true, emptyLabel: "Sin cliente asociado", optionsFrom: { resource: "clients", labelField: "name" } },
      { key: "assignedToId", label: "Responsable", type: "select", allowEmpty: true, emptyLabel: "Sin responsable", optionsFrom: { resource: "staff", labelField: "name" } },
      { key: "status", label: "Estado operativo", type: "select", required: true, defaultValue: "PLANNING", options: Object.entries(projectStatusLabels).map(([value, label]) => ({ value, label })) },
      { key: "startDate", label: "Inicio", type: "date" },
      { key: "targetDate", label: "Entrega estimada", type: "date" },
      { key: "completedAt", label: "Finalizado", type: "date" },
      { key: "year", label: "Año", type: "number", min: 2000, step: 1 },
      { key: "summary", label: "Resumen", type: "textarea", wide: true },
      { key: "description", label: "Descripción completa", type: "textarea", wide: true },
      { key: "challenge", label: "Reto", type: "textarea", wide: true },
      { key: "solution", label: "Solución", type: "textarea", wide: true },
      { key: "services", label: "Servicios aplicados", type: "list", wide: true, help: "Uno por línea." },
      { key: "deliverables", label: "Entregables", type: "list", wide: true, help: "Uno por línea." },
      { key: "coverImage", label: "Ruta de portada", type: "text", placeholder: "/uploads/media/….webp", help: `${imagePathHelp} La URL absoluta se reserva para el sitio en vivo.` },
      { key: "logoUrl", label: "Logo del caso", type: "text", placeholder: "/uploads/media/….webp", help: imagePathHelp },
      { key: "videoUrl", label: "Video del caso", type: "text", placeholder: "/videos/proyecto.webm" },
      { key: "liveUrl", label: "Sitio en vivo", type: "url", placeholder: "https://" },
      { key: "stagingUrl", label: "Staging", type: "url", placeholder: "https://", help: "Solo visible dentro de Wilo OS." },
      { key: "repositoryUrl", label: "Repositorio", type: "url", placeholder: "https://", help: "Solo visible dentro de Wilo OS." },
      { key: "gallery", label: "Galería", type: "list", wide: true, placeholder: "/uploads/media/….webp", help: `${imagePathHelp} Una por línea.` },
      { key: "internalNotes", label: "Notas internas", type: "textarea", wide: true },
      { key: "seoTitle", label: "Título SEO", type: "text", wide: true },
      { key: "seoDescription", label: "Descripción SEO", type: "textarea", wide: true },
      { key: "featured", label: "Proyecto destacado", type: "checkbox", defaultValue: false },
      { key: "publicCaseStudy", label: "Habilitar como caso público", type: "checkbox", defaultValue: false },
      { key: "contentStatus", label: "Flujo editorial", type: "select", required: true, defaultValue: "DRAFT", options: [{ label: "Borrador", value: "DRAFT" }, { label: "En revisión", value: "REVIEW" }, { label: "Publicado", value: "PUBLISHED" }] },
      { key: "published", label: "Publicar en el sitio", type: "checkbox", defaultValue: false, help: "El caso solo será visible si también está habilitado y su flujo editorial está en Publicado." },
      commonOrder,
    ],
    actions: archiveActions("projects"),
  },
  services: {
    resource: "services",
    title: "Servicios",
    singular: "servicio",
    description: "Oferta comercial, contenido e importes de referencia.",
    searchPlaceholder: "Buscar un servicio…",
    columns: [
      { key: "title", label: "Servicio", secondaryKey: "slug" },
      { key: "category", label: "Línea" },
      { key: "priceFromCents", label: "Desde", type: "money" },
      { key: "published", label: "Estado", type: "status", statusLabels: publishLabels },
    ],
    filters: [
      { key: "category", label: "Línea", options: [{ label: "Tecnología", value: "TECHNOLOGY" }, { label: "Audiovisual", value: "AUDIOVISUAL" }, { label: "Infraestructura", value: "INFRASTRUCTURE" }, { label: "Education", value: "EDUCATION" }] },
      { key: "published", label: "Publicación", options: yesNo },
    ],
    fields: [
      { key: "title", label: "Nombre", type: "text", required: true },
      slugField,
      { key: "category", label: "Línea", type: "select", required: true, options: [{ label: "Tecnología", value: "TECHNOLOGY" }, { label: "Audiovisual", value: "AUDIOVISUAL" }, { label: "Infraestructura", value: "INFRASTRUCTURE" }, { label: "Education", value: "EDUCATION" }] },
      { key: "summary", label: "Resumen", type: "textarea", required: true, wide: true },
      { key: "description", label: "Descripción", type: "textarea", wide: true },
      { key: "icon", label: "Nombre del ícono", type: "text", placeholder: "Monitor" },
      { key: "imageUrl", label: "Ruta de imagen", type: "text", placeholder: "/uploads/media/….webp", help: imagePathHelp },
      { key: "priceFromCents", label: "Precio desde (S/)", type: "money", min: 0, step: 0.01 },
      { key: "currency", label: "Moneda", type: "select", required: true, defaultValue: "PEN", options: [{ label: "Soles (PEN)", value: "PEN" }, { label: "Dólares (USD)", value: "USD" }] },
      { key: "published", label: "Publicado", type: "checkbox", defaultValue: true },
      commonOrder,
    ],
  },
  plans: {
    resource: "plans",
    title: "Planes y precios",
    singular: "plan",
    description: "Planes visibles en la página principal y sus características.",
    searchPlaceholder: "Buscar un plan…",
    columns: [
      { key: "title", label: "Plan", secondaryKey: "subtitle" },
      { key: "category", label: "Categoría" },
      { key: "priceCents", label: "Precio", type: "money" },
      { key: "taxCents", label: "IGV", type: "money" },
      { key: "published", label: "Estado", type: "status", statusLabels: publishLabels },
    ],
    filters: [
      { key: "category", label: "Categoría", options: [{ label: "Web", value: "WEB" }, { label: "Desarrollo a medida", value: "CUSTOM_DEVELOPMENT" }, { label: "Infraestructura", value: "INFRASTRUCTURE" }] },
      { key: "published", label: "Publicación", options: yesNo },
      { key: "featured", label: "Destacado", options: yesNo },
    ],
    fields: [
      { key: "title", label: "Nombre", type: "text", required: true },
      slugField,
      { key: "subtitle", label: "Subtítulo", type: "text" },
      { key: "category", label: "Categoría", type: "select", required: true, defaultValue: "WEB", options: [{ label: "Web", value: "WEB" }, { label: "Desarrollo a medida", value: "CUSTOM_DEVELOPMENT" }, { label: "Infraestructura", value: "INFRASTRUCTURE" }] },
      { key: "priceCents", label: "Precio (S/)", type: "money", required: true, min: 0, step: 0.01 },
      { key: "taxCents", label: "IGV (S/)", type: "money", required: true, defaultValue: 0, min: 0, step: 0.01 },
      { key: "includesTax", label: "El precio incluye IGV", type: "checkbox", defaultValue: false },
      { key: "currency", label: "Moneda", type: "select", required: true, defaultValue: "PEN", options: [{ label: "Soles (PEN)", value: "PEN" }, { label: "Dólares (USD)", value: "USD" }] },
      { key: "billingCycle", label: "Periodo", type: "text", placeholder: "mes / único" },
      { key: "features", label: "Características", type: "list", wide: true, required: true, help: "Una por línea." },
      { key: "note", label: "Nota comercial", type: "textarea", wide: true },
      { key: "featured", label: "Plan destacado", type: "checkbox", defaultValue: false },
      { key: "published", label: "Publicado", type: "checkbox", defaultValue: true },
      commonOrder,
    ],
  },
  productCategories: {
    resource: "productCategories",
    title: "Categorías de producto",
    singular: "categoría",
    description: "Organiza licencias y kits Wilo Education.",
    searchPlaceholder: "Buscar categoría…",
    columns: [
      { key: "imageUrl", label: "Imagen", type: "image" },
      { key: "name", label: "Categoría", secondaryKey: "slug" },
      { key: "active", label: "Estado", type: "status", statusLabels: activeLabels },
      { key: "sortOrder", label: "Orden" },
    ],
    filters: [{ key: "active", label: "Estado", options: yesNo }],
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      slugField,
      { key: "description", label: "Descripción", type: "textarea", wide: true },
      { key: "imageUrl", label: "Ruta de imagen", type: "text", placeholder: "/uploads/media/….webp", help: imagePathHelp },
      { key: "active", label: "Activa", type: "checkbox", defaultValue: true },
      commonOrder,
    ],
  },
  products: {
    resource: "products",
    title: "Productos",
    singular: "producto",
    description: "Catálogo de licencias originales y kits educativos.",
    searchPlaceholder: "Buscar por producto, SKU o slug…",
    columns: [
      { key: "images", label: "Imagen", type: "image" },
      { key: "name", label: "Producto", secondaryKey: "sku" },
      { key: "category.name", label: "Categoría" },
      { key: "priceCents", label: "Precio", type: "money" },
      { key: "stock", label: "Stock" },
      { key: "active", label: "Estado", type: "status", statusLabels: activeLabels },
    ],
    filters: [
      { key: "active", label: "Estado", options: yesNo },
      { key: "featured", label: "Destacado", options: yesNo },
      { key: "education", label: "Wilo Education", options: yesNo },
    ],
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      slugField,
      { key: "sku", label: "SKU", type: "text" },
      { key: "categoryId", label: "Categoría", type: "select", required: true, optionsFrom: { resource: "productCategories", labelField: "name" } },
      { key: "description", label: "Descripción", type: "textarea", wide: true },
      { key: "specifications", label: "Especificaciones", type: "json", wide: true, help: "JSON válido: lista u objeto." },
      { key: "images", label: "Imágenes", type: "list", wide: true, placeholder: "/uploads/media/….webp", help: `${imagePathHelp} Una por línea; la primera será la portada.` },
      { key: "licenseType", label: "Tipo de licencia", type: "text", placeholder: "Original / ESD" },
      { key: "licenseDuration", label: "Duración", type: "text", placeholder: "1 año / perpetua" },
      { key: "priceCents", label: "Precio (S/)", type: "money", required: true, min: 0, step: 0.01 },
      { key: "currency", label: "Moneda", type: "select", required: true, defaultValue: "PEN", options: [{ label: "Soles (PEN)", value: "PEN" }] },
      { key: "stock", label: "Stock físico", type: "number", min: 0, step: 1, help: "Déjalo vacío si se gestiona mediante claves." },
      { key: "includesTax", label: "Precio incluye IGV", type: "checkbox", defaultValue: true },
      { key: "digital", label: "Entrega digital", type: "checkbox", defaultValue: true },
      { key: "education", label: "Producto Wilo Education", type: "checkbox", defaultValue: false },
      { key: "featured", label: "Destacado", type: "checkbox", defaultValue: false },
      { key: "active", label: "Activo", type: "checkbox", defaultValue: true },
    ],
  },
  clients: {
    resource: "clients",
    title: "Clientes",
    singular: "cliente",
    description: "Directorio comercial, datos de contacto y relación con proyectos y cotizaciones.",
    searchPlaceholder: "Buscar cliente…",
    columns: [
      { key: "name", label: "Cliente", secondaryKey: "contactName" },
      { key: "email", label: "Contacto", secondaryKey: "phone" },
      { key: "source", label: "Fuente", type: "status", statusLabels: leadSourceLabels },
      { key: "city", label: "Ciudad" },
      { key: "active", label: "Estado", type: "status", statusLabels: activeLabels },
    ],
    filters: [
      { key: "active", label: "Estado", options: yesNo },
      { key: "source", label: "Fuente", options: Object.entries(leadSourceLabels).map(([value, label]) => ({ value, label })) },
      archiveFilter,
    ],
    details: [
      { key: "email", label: "Correo", type: "email" },
      { key: "phone", label: "Teléfono", type: "phone" },
      { key: "whatsapp", label: "WhatsApp", type: "whatsapp" },
      { key: "leads", label: "Leads relacionados", type: "related" },
      { key: "projects", label: "Proyectos relacionados", type: "related" },
      { key: "quotes", label: "Cotizaciones relacionadas", type: "related" },
      { key: "createdAt", label: "Cliente desde", type: "date" },
    ],
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      slugField,
      { key: "contactName", label: "Persona de contacto", type: "text" },
      { key: "email", label: "Correo", type: "email" },
      { key: "phone", label: "Teléfono", type: "text" },
      { key: "whatsapp", label: "WhatsApp", type: "text" },
      { key: "taxId", label: "RUC / identificación fiscal", type: "text" },
      { key: "city", label: "Ciudad", type: "text" },
      { key: "country", label: "País", type: "text", defaultValue: "PE", required: true },
      { key: "source", label: "Fuente", type: "select", defaultValue: "MANUAL", required: true, options: Object.entries(leadSourceLabels).map(([value, label]) => ({ value, label })) },
      { key: "notes", label: "Notas internas", type: "textarea", wide: true },
      { key: "logoUrl", label: "Ruta del logo", type: "text", placeholder: "/uploads/media/….webp", help: imagePathHelp },
      { key: "website", label: "Sitio web", type: "url" },
      { key: "featured", label: "Destacado", type: "checkbox", defaultValue: false },
      { key: "active", label: "Activo", type: "checkbox", defaultValue: true },
      commonOrder,
    ],
    actions: archiveActions("clients"),
  },
  testimonials: {
    resource: "testimonials",
    title: "Testimonios",
    singular: "testimonio",
    description: "Opiniones verificadas que se publican en la web.",
    searchPlaceholder: "Buscar por persona, empresa o texto…",
    columns: [
      { key: "avatarUrl", label: "Foto", type: "image" },
      { key: "name", label: "Persona", secondaryKey: "company" },
      { key: "quote", label: "Testimonio" },
      { key: "published", label: "Estado", type: "status", statusLabels: publishLabels },
    ],
    filters: [{ key: "published", label: "Publicación", options: yesNo }],
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "company", label: "Empresa", type: "text", required: true },
      { key: "role", label: "Cargo", type: "text" },
      { key: "clientId", label: "Cliente asociado", type: "select", allowEmpty: true, emptyLabel: "Sin asociación", optionsFrom: { resource: "clients", labelField: "name" } },
      { key: "quote", label: "Testimonio", type: "textarea", required: true, wide: true },
      { key: "avatarUrl", label: "Ruta de foto", type: "text", placeholder: "/uploads/media/….webp", help: imagePathHelp },
      { key: "published", label: "Publicado", type: "checkbox", defaultValue: true },
      commonOrder,
    ],
  },
  promotions: {
    resource: "promotions",
    title: "Promociones",
    singular: "promoción",
    description: "Campañas, vigencias y beneficios que aparecen en la web.",
    searchPlaceholder: "Buscar promoción…",
    columns: [
      { key: "imageUrl", label: "Arte", type: "image" },
      { key: "title", label: "Promoción", secondaryKey: "slug" },
      { key: "code", label: "Cupón" },
      { key: "startAt", label: "Inicio", type: "date" },
      { key: "endAt", label: "Fin", type: "date" },
      { key: "active", label: "Estado", type: "status", statusLabels: activeLabels },
    ],
    filters: [{ key: "active", label: "Estado", options: yesNo }, { key: "featured", label: "Destacada", options: yesNo }],
    fields: [
      { key: "title", label: "Título", type: "text", required: true },
      slugField,
      { key: "summary", label: "Resumen", type: "textarea", wide: true },
      { key: "details", label: "Beneficios / detalles", type: "list", wide: true, help: "Uno por línea." },
      { key: "imageUrl", label: "Ruta del arte", type: "text", placeholder: "/uploads/media/….webp", help: imagePathHelp },
      { key: "referralBenefit", label: "Beneficio por referidos", type: "textarea", wide: true },
      { key: "code", label: "Código de cupón", type: "text", placeholder: "WILO10", help: "Opcional. Usa letras mayúsculas, números, guion o guion bajo." },
      { key: "discountType", label: "Tipo de descuento", type: "select", allowEmpty: true, emptyLabel: "Solo promoción editorial", options: [{ label: "Porcentaje", value: "PERCENT" }, { label: "Monto fijo", value: "FIXED" }] },
      { key: "discountValue", label: "Valor", type: "number", min: 1, help: "Porcentaje entero (ej. 10) o monto en céntimos (ej. 5000 = S/ 50)." },
      { key: "minimumCents", label: "Compra mínima", type: "money", min: 0, defaultValue: 0 },
      { key: "maxUses", label: "Usos máximos", type: "number", min: 1 },
      { key: "categorySlugs", label: "Categorías permitidas", type: "list", wide: true, help: "Slugs, uno por línea. Vacío aplica a todas." },
      { key: "productIds", label: "IDs de productos permitidos", type: "list", wide: true, help: "IDs, uno por línea. Vacío aplica a todos." },
      { key: "startAt", label: "Inicio", type: "date" },
      { key: "endAt", label: "Fin", type: "date" },
      { key: "active", label: "Activa", type: "checkbox", defaultValue: false },
      { key: "featured", label: "Destacada", type: "checkbox", defaultValue: false },
    ],
  },
  referrals: {
    resource: "referrals",
    title: "Referidos",
    singular: "referido",
    description: "Seguimiento de recomendaciones y beneficios otorgados.",
    searchPlaceholder: "Buscar por referente o referido…",
    create: false,
    columns: [
      { key: "referrerName", label: "Refiere", secondaryKey: "referrerPhone" },
      { key: "referredName", label: "Referido", secondaryKey: "referredPhone" },
      { key: "status", label: "Estado", type: "status", statusLabels: referralStatusLabels },
      { key: "createdAt", label: "Fecha", type: "date" },
    ],
    filters: [{ key: "status", label: "Estado", options: Object.entries(referralStatusLabels).map(([value, label]) => ({ value, label })) }],
    details: [
      { key: "referrerEmail", label: "Correo del referente" },
      { key: "referredEmail", label: "Correo del referido" },
      { key: "client.name", label: "Cliente asociado" },
      { key: "createdAt", label: "Registrado", type: "date" },
    ],
    fields: [
      { key: "status", label: "Estado", type: "select", required: true, options: Object.entries(referralStatusLabels).map(([value, label]) => ({ value, label })) },
      { key: "clientId", label: "Cliente asociado", type: "select", allowEmpty: true, emptyLabel: "Sin asociación", optionsFrom: { resource: "clients", labelField: "name" } },
      { key: "benefit", label: "Beneficio otorgado", type: "textarea", wide: true },
      { key: "notes", label: "Notas internas", type: "textarea", wide: true },
    ],
  },
  leads: {
    resource: "leads",
    title: "Leads",
    singular: "lead",
    description: "Pipeline comercial unificado de Studio, Events, Education y Express.",
    searchPlaceholder: "Buscar por nombre, empresa, correo o servicio…",
    delete: false,
    columns: [
      { key: "name", label: "Contacto", secondaryKey: "company" },
      { key: "source", label: "Fuente", type: "status", statusLabels: leadSourceLabels },
      { key: "priority", label: "Prioridad", type: "status", statusLabels: { LOW: "Baja", NORMAL: "Normal", HIGH: "Alta", URGENT: "Urgente" } },
      { key: "status", label: "Estado", type: "status", statusLabels: leadStatusLabels },
      { key: "assignedTo.name", label: "Responsable" },
      { key: "nextFollowUpAt", label: "Próximo seguimiento", type: "date" },
    ],
    filters: [
      { key: "status", label: "Estado", options: Object.entries(leadStatusLabels).map(([value, label]) => ({ value, label })) },
      { key: "source", label: "Fuente", options: Object.entries(leadSourceLabels).map(([value, label]) => ({ value, label })) },
      { key: "service", label: "Servicio", type: "text", placeholder: "Filtrar servicio" },
      { key: "priority", label: "Prioridad", options: [{ label: "Baja", value: "LOW" }, { label: "Normal", value: "NORMAL" }, { label: "Alta", value: "HIGH" }, { label: "Urgente", value: "URGENT" }] },
      { key: "from", label: "Desde", type: "date" },
      { key: "to", label: "Hasta", type: "date" },
      { key: "sort", label: "Ordenar", options: [{ label: "Fecha de alta", value: "createdAt" }, { label: "Última edición", value: "updatedAt" }, { label: "Próximo seguimiento", value: "nextFollowUpAt" }, { label: "Estado", value: "status" }, { label: "Prioridad", value: "priority" }] },
      { key: "direction", label: "Dirección", options: [{ label: "Más recientes / Z–A", value: "desc" }, { label: "Más antiguos / A–Z", value: "asc" }] },
      archiveFilter,
    ],
    details: [
      { key: "email", label: "Correo", type: "email" },
      { key: "phone", label: "Teléfono", type: "phone" },
      { key: "service", label: "Interés" },
      { key: "client.name", label: "Cliente vinculado" },
      { key: "message", label: "Mensaje", type: "longText" },
      { key: "details", label: "Datos del formulario", type: "longText" },
      { key: "estimatedMinCents", label: "Estimado mínimo", type: "money" },
      { key: "estimatedMaxCents", label: "Estimado máximo", type: "money" },
      { key: "createdAt", label: "Registrado", type: "date" },
      { key: "quotes", label: "Cotizaciones vinculadas", type: "related" },
    ],
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "company", label: "Empresa", type: "text" },
      { key: "email", label: "Correo", type: "email", required: true },
      { key: "phone", label: "Teléfono", type: "text" },
      { key: "type", label: "Tipo de solicitud", type: "select", required: true, defaultValue: "CONTACT", options: [{ label: "Contacto", value: "CONTACT" }, { label: "Cotización", value: "QUOTE" }, { label: "Consultoría", value: "CONSULTATION" }] },
      { key: "service", label: "Servicio de interés", type: "text" },
      { key: "clientId", label: "Cliente vinculado", type: "select", allowEmpty: true, emptyLabel: "Sin cliente vinculado", optionsFrom: { resource: "clients", labelField: "name" } },
      { key: "assignedToId", label: "Responsable", type: "select", allowEmpty: true, emptyLabel: "Sin responsable", optionsFrom: { resource: "staff", labelField: "name" } },
      { key: "status", label: "Estado", type: "select", required: true, options: Object.entries(leadStatusLabels).map(([value, label]) => ({ value, label })) },
      { key: "priority", label: "Prioridad", type: "select", required: true, defaultValue: "NORMAL", options: [{ label: "Baja", value: "LOW" }, { label: "Normal", value: "NORMAL" }, { label: "Alta", value: "HIGH" }, { label: "Urgente", value: "URGENT" }] },
      { key: "budgetRange", label: "Rango de presupuesto", type: "text" },
      { key: "launchTimeframe", label: "Plazo de lanzamiento", type: "text" },
      { key: "estimatedMinCents", label: "Estimado mínimo", type: "money", min: 0 },
      { key: "estimatedMaxCents", label: "Estimado máximo", type: "money", min: 0 },
      { key: "lastContactAt", label: "Último contacto", type: "date" },
      { key: "nextFollowUpAt", label: "Próximo seguimiento", type: "date" },
      { key: "message", label: "Mensaje recibido", type: "textarea", wide: true },
      { key: "followUpNote", label: "Nota de seguimiento", type: "textarea", wide: true },
      { key: "lostReason", label: "Motivo de pérdida", type: "textarea", wide: true, help: "Obligatorio al marcar el lead como Perdido." },
    ],
    actions: [
      {
        label: "Crear cliente desde lead",
        endpoint: "/api/admin/leads/{id}/convert",
        confirm: "Se creará o vinculará un cliente usando los datos de este lead ganado. ¿Continuar?",
        success: "Lead vinculado a cliente correctamente.",
        visibleWhen: { key: "status", values: ["WON"] },
        visibleWhenEmpty: { key: "clientId", empty: true },
      },
      ...archiveActions("leads"),
    ],
  },
  quotes: {
    resource: "quotes",
    title: "Cotizaciones",
    singular: "cotización",
    description: "Propuestas comerciales con partidas, impuestos y totales calculados en servidor.",
    searchPlaceholder: "Buscar por número o nota…",
    delete: false,
    columns: [
      { key: "number", label: "Número", secondaryKey: "client.name" },
      { key: "status", label: "Estado", type: "status", statusLabels: quoteStatusLabels },
      { key: "totalCents", label: "Total", type: "money" },
      { key: "expiresAt", label: "Vence", type: "date" },
      { key: "createdBy.name", label: "Creada por" },
    ],
    filters: [
      { key: "status", label: "Estado", options: Object.entries(quoteStatusLabels).map(([value, label]) => ({ value, label })) },
      { key: "currency", label: "Moneda", options: [{ label: "Soles", value: "PEN" }, { label: "Dólares", value: "USD" }] },
      archiveFilter,
    ],
    details: [
      { key: "items", label: "Partidas", type: "items" },
      { key: "subtotalCents", label: "Subtotal", type: "money" },
      { key: "taxCents", label: "Impuesto", type: "money" },
      { key: "totalCents", label: "Total", type: "money" },
      { key: "lead.name", label: "Lead vinculado" },
      { key: "project.title", label: "Proyecto vinculado" },
      { key: "sentAt", label: "Enviada", type: "date" },
      { key: "acceptedAt", label: "Aceptada", type: "date" },
    ],
    fields: [
      { key: "clientId", label: "Cliente", type: "select", required: true, optionsFrom: { resource: "clients", labelField: "name" } },
      { key: "leadId", label: "Lead", type: "select", allowEmpty: true, emptyLabel: "Sin lead vinculado", optionsFrom: { resource: "leads", labelField: "name" } },
      { key: "projectId", label: "Proyecto", type: "select", allowEmpty: true, emptyLabel: "Sin proyecto vinculado", optionsFrom: { resource: "projects", labelField: "title" } },
      { key: "status", label: "Estado", type: "select", required: true, defaultValue: "DRAFT", options: Object.entries(quoteStatusLabels).map(([value, label]) => ({ value, label })) },
      { key: "currency", label: "Moneda", type: "select", required: true, defaultValue: "PEN", options: [{ label: "Soles (PEN)", value: "PEN" }, { label: "Dólares (USD)", value: "USD" }] },
      { key: "taxRateBps", label: "Impuesto (%)", type: "percent", required: true, defaultValue: 18, min: 0, step: 0.01 },
      { key: "issueDate", label: "Fecha de emisión", type: "date" },
      { key: "expiresAt", label: "Fecha de vencimiento", type: "date" },
      { key: "items", label: "Partidas", type: "lineItems", required: true, wide: true },
      { key: "notes", label: "Notas y condiciones", type: "textarea", wide: true },
    ],
    actions: [
      {
        label: "Enviar por correo",
        endpoint: "/api/admin/quotes/{id}/send",
        confirm: "Se enviará la cotización al correo del cliente y solo entonces cambiará a Enviada. ¿Continuar?",
        success: "Cotización enviada y registrada correctamente.",
        visibleWhen: { key: "status", values: ["DRAFT"] },
      },
      ...archiveActions("quotes"),
    ],
  },
  activity: {
    resource: "activity",
    title: "Actividad",
    singular: "evento",
    description: "Registro inmutable de acciones comerciales y operativas dentro de Wilo OS.",
    searchPlaceholder: "Buscar acción o entidad…",
    create: false,
    edit: false,
    delete: false,
    columns: [
      { key: "createdAt", label: "Fecha", type: "date" },
      { key: "actor.name", label: "Usuario", secondaryKey: "actor.email" },
      { key: "action", label: "Acción", type: "status" },
      { key: "entityType", label: "Entidad", secondaryKey: "entityId" },
    ],
    filters: [
      { key: "entityType", label: "Entidad", options: [{ label: "Lead", value: "LEAD" }, { label: "Cliente", value: "CLIENT" }, { label: "Proyecto", value: "PROJECT" }, { label: "Cotización", value: "QUOTE" }] },
    ],
    details: [{ key: "metadata", label: "Detalle", type: "longText" }],
    fields: [],
  },
  complaints: {
    resource: "complaints",
    title: "Reclamaciones",
    singular: "reclamación",
    description: "Solicitudes del Libro de Reclamaciones, conservadas para auditoría.",
    searchPlaceholder: "Buscar código, consumidor o documento…",
    create: false,
    delete: false,
    columns: [
      { key: "code", label: "Código" },
      { key: "consumerName", label: "Consumidor", secondaryKey: "email" },
      { key: "recordType", label: "Registro", type: "status", statusLabels: complaintRecordTypeLabels },
      { key: "goodType", label: "Bien" },
      { key: "status", label: "Estado", type: "status", statusLabels: complaintStatusLabels },
      { key: "createdAt", label: "Fecha", type: "date" },
    ],
    filters: [
      { key: "status", label: "Estado", options: Object.entries(complaintStatusLabels).map(([value, label]) => ({ value, label })) },
      { key: "recordType", label: "Registro", options: Object.entries(complaintRecordTypeLabels).map(([value, label]) => ({ value, label })) },
      { key: "goodType", label: "Bien", options: [{ label: "Producto", value: "PRODUCT" }, { label: "Servicio", value: "SERVICE" }] },
    ],
    details: [
      { key: "documentNumber", label: "Documento" },
      { key: "recordType", label: "Tipo de registro" },
      { key: "phone", label: "Teléfono" },
      { key: "address", label: "Dirección" },
      { key: "amountCents", label: "Monto", type: "money" },
      { key: "description", label: "Detalle", type: "longText" },
      { key: "requestedAction", label: "Pedido del consumidor", type: "longText" },
    ],
    fields: [
      { key: "status", label: "Estado", type: "select", required: true, options: Object.entries(complaintStatusLabels).map(([value, label]) => ({ value, label })) },
      { key: "response", label: "Respuesta", type: "textarea", wide: true },
      { key: "respondedAt", label: "Fecha de respuesta", type: "date" },
    ],
  },
  orders: {
    resource: "orders",
    title: "Pedidos",
    singular: "pedido",
    description: "Pagos, vouchers, comprobantes y finalización controlada de entregas.",
    searchPlaceholder: "Buscar número, cliente, correo o RUC…",
    create: false,
    delete: false,
    columns: [
      { key: "number", label: "Pedido", secondaryKey: "customerName" },
      { key: "paymentMethod", label: "Pago" },
      { key: "totalCents", label: "Total", type: "money" },
      { key: "status", label: "Estado", type: "status", statusLabels: orderStatusLabels },
      { key: "createdAt", label: "Fecha", type: "date" },
    ],
    filters: [
      { key: "status", label: "Estado", options: Object.entries(orderStatusLabels).map(([value, label]) => ({ value, label })) },
      { key: "paymentMethod", label: "Método de pago", options: [{ label: "Pago manual", value: "MANUAL" }, { label: "Pago online", value: "ONLINE" }, { label: "WhatsApp", value: "WHATSAPP" }] },
    ],
    details: [
      { key: "email", label: "Correo" },
      { key: "phone", label: "Teléfono" },
      { key: "documentType", label: "Comprobante" },
      { key: "documentNumber", label: "Documento" },
      { key: "companyName", label: "Razón social" },
      { key: "companyRuc", label: "RUC" },
      { key: "voucherUrl", label: "Voucher", type: "link" },
      { key: "items", label: "Productos", type: "items" },
    ],
    fields: [
      { key: "status", label: "Estado", type: "select", required: true, lockUnknownOption: true, help: "La entrega se confirma únicamente con la acción «Completar entrega».", options: Object.entries(orderStatusLabels).filter(([value]) => !["DELIVERED", "DELIVERING"].includes(value)).map(([value, label]) => ({ value, label })) },
      { key: "paymentReference", label: "Referencia de pago", type: "text" },
      { key: "notes", label: "Notas internas", type: "textarea", wide: true },
    ],
    actions: [{
      label: "Completar entrega",
      endpoint: "/api/admin/orders/{id}/deliver",
      confirm: "Confirma que los productos físicos ya fueron entregados. Las licencias digitales se enviarán por correo y el pedido quedará cerrado. ¿Continuar?",
      success: "Entrega completada; las licencias digitales fueron procesadas.",
      visibleWhen: { key: "status", values: ["PAID", "DELIVERING", "DELIVERED"] },
      adminOnly: true,
    }],
  },
  media: {
    resource: "media",
    title: "Biblioteca de medios",
    singular: "archivo",
    description: "Archivos reutilizables del sitio y sus textos alternativos.",
    searchPlaceholder: "Buscar archivo…",
    create: false,
    columns: [
      { key: "url", label: "Vista", type: "image" },
      { key: "originalName", label: "Archivo", secondaryKey: "alt" },
      { key: "mimeType", label: "Tipo" },
      { key: "sizeBytes", label: "Tamaño" },
      { key: "createdAt", label: "Fecha", type: "date" },
    ],
    fields: [{ key: "alt", label: "Texto alternativo", type: "textarea", wide: true }],
  },
  settings: {
    resource: "settings",
    title: "Ajustes del sitio",
    singular: "ajuste",
    description: "Datos de contacto, redes, cuentas y textos globales sin tocar código.",
    searchPlaceholder: "Buscar clave o descripción…",
    columns: [
      { key: "key", label: "Clave", secondaryKey: "description" },
      { key: "value", label: "Valor" },
      { key: "type", label: "Tipo" },
      { key: "public", label: "Público", type: "boolean" },
      { key: "updatedAt", label: "Actualizado", type: "date" },
    ],
    filters: [
      { key: "type", label: "Tipo", options: [{ label: "Texto", value: "text" }, { label: "URL", value: "url" }, { label: "JSON", value: "json" }] },
      { key: "public", label: "Visibilidad", options: yesNo },
    ],
    fields: [
      { key: "key", label: "Clave", type: "text", required: true, placeholder: "contact.whatsapp" },
      { key: "value", label: "Valor", type: "textarea", required: true, wide: true },
      { key: "type", label: "Tipo", type: "select", required: true, defaultValue: "text", options: [{ label: "Texto", value: "text" }, { label: "URL", value: "url" }, { label: "JSON", value: "json" }] },
      { key: "public", label: "Disponible para la web pública", type: "checkbox", defaultValue: false },
      { key: "description", label: "Descripción interna", type: "textarea", wide: true },
    ],
  },
  users: {
    resource: "users",
    title: "Equipo y usuarios",
    singular: "usuario",
    description: "Accesos del equipo y permisos del panel administrativo.",
    searchPlaceholder: "Buscar por nombre o correo…",
    delete: false,
    columns: [
      { key: "name", label: "Usuario", secondaryKey: "email" },
      { key: "role", label: "Rol", type: "status", statusLabels: { SUPER_ADMIN: "Superadministrador", ADMIN: "Administrador", COMMERCIAL: "Comercial", EDITOR: "Editor" } },
      { key: "active", label: "Estado", type: "status", statusLabels: activeLabels },
      { key: "lastLoginAt", label: "Último acceso", type: "date" },
    ],
    filters: [
      { key: "role", label: "Rol", options: [{ label: "Superadministrador", value: "SUPER_ADMIN" }, { label: "Administrador", value: "ADMIN" }, { label: "Comercial", value: "COMMERCIAL" }, { label: "Editor", value: "EDITOR" }] },
      { key: "active", label: "Estado", options: yesNo },
    ],
    fields: [
      { key: "name", label: "Nombre", type: "text" },
      { key: "email", label: "Correo", type: "email", required: true },
      { key: "password", label: "Contraseña", type: "password", requiredOnCreate: true, omitEmptyOnUpdate: true, help: "Mínimo 12 caracteres. En edición, déjala vacía para conservarla." },
      { key: "role", label: "Rol", type: "select", required: true, defaultValue: "EDITOR", options: [{ label: "Superadministrador", value: "SUPER_ADMIN" }, { label: "Administrador", value: "ADMIN" }, { label: "Comercial", value: "COMMERCIAL" }, { label: "Editor", value: "EDITOR" }] },
      { key: "active", label: "Activo", type: "checkbox", defaultValue: true },
    ],
  },
};
