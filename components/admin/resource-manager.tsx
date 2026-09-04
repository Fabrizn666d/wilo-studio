"use client";
/* eslint-disable @next/next/no-img-element -- compact admin previews use user-uploaded URLs */

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  FilePenLine,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAdminSession } from "./admin-shell";
import { canAccessAdminResource } from "@/lib/auth/permissions";
import { RecordNotes } from "./record-notes";
import {
  adminResourceConfigs,
  type AdminDetail,
  type AdminField,
  type AdminOption,
  type AdminRecord,
  type AdminResourceConfig,
} from "./resource-config";

type ApiResponse = {
  ok?: boolean;
  data?: AdminRecord[] | AdminRecord;
  error?: string;
  fields?: Array<{ path: string; message: string }>;
  pagination?: { page: number; limit: number; total: number; pages: number };
};

type FormValue = string | number | boolean;
type FormState = Record<string, FormValue>;
type Toast = { type: "success" | "error"; message: string };
type FormFeedback = { message: string; fields: Array<{ label: string; message: string }> };
type ConfirmState = {
  title: string;
  body: string;
  label: string;
  danger?: boolean;
  run: () => Promise<void>;
};

const PAGE_SIZE = 20;
const WILO_TIME_ZONE = "America/Lima";

class AdminApiError extends Error {
  constructor(message: string, public fields: Array<{ path: string; message: string }> = []) {
    super(message);
    this.name = "AdminApiError";
  }
}

function getValue(record: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[key];
  }, record);
}

function textValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatMoney(value: unknown, currency = "PEN") {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("es-PE", { style: "currency", currency, minimumFractionDigits: 2 }).format(value / 100);
}

function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: WILO_TIME_ZONE }).format(date);
}

function limaDateTimeLocal(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WILO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}T${value.hour}:${value.minute}`;
}

function compactText(value: unknown, length = 72) {
  const text = textValue(value);
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

function imageSource(value: unknown) {
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : "";
  return typeof value === "string" ? value : "";
}

function initialForm(fields: AdminField[]): FormState {
  return Object.fromEntries(
    fields.map((field) => {
      if (field.defaultValue !== undefined) return [field.key, field.defaultValue];
      if (field.type === "checkbox") return [field.key, false];
      if (field.type === "json") return [field.key, "[]"];
      if (field.type === "lineItems") return [field.key, '[{"name":"","description":"","quantity":1,"unitPriceCents":0}]'];
      return [field.key, ""];
    }),
  );
}

function valueForForm(field: AdminField, value: unknown): FormValue {
  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "money") return typeof value === "number" ? value / 100 : "";
  if (field.type === "percent") return typeof value === "number" ? value / 100 : "";
  if (field.type === "date") {
    if (!value) return "";
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return "";
    return limaDateTimeLocal(date);
  }
  if (field.type === "list") {
    if (Array.isArray(value)) return value.map(String).join("\n");
    return typeof value === "string" ? value : "";
  }
  if (field.type === "json") {
    if (!value) return "[]";
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  }
  if (field.type === "lineItems") {
    if (!value) return "[]";
    return typeof value === "string" ? value : JSON.stringify(value);
  }
  if (value === null || value === undefined) return "";
  return typeof value === "number" ? value : String(value);
}

function serializeForm(fields: AdminField[], form: FormState, editing: boolean) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = form[field.key];
    if (editing && field.omitEmptyOnUpdate && String(raw || "").trim() === "") continue;
    if (editing && field.lockUnknownOption && field.options && !field.options.some((option) => option.value === String(raw))) continue;
    if (field.type === "checkbox") {
      payload[field.key] = Boolean(raw);
    } else if (field.type === "number") {
      payload[field.key] = raw === "" ? null : Number(raw);
    } else if (field.type === "money") {
      payload[field.key] = raw === "" ? null : Math.round(Number(raw) * 100);
    } else if (field.type === "percent") {
      payload[field.key] = raw === "" ? null : Math.round(Number(raw) * 100);
    } else if (field.type === "date") {
      payload[field.key] = raw ? new Date(`${String(raw)}:00-05:00`).toISOString() : null;
    } else if (field.type === "list") {
      payload[field.key] = String(raw || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (field.type === "json" || field.type === "lineItems") {
      payload[field.key] = String(raw || "").trim() ? JSON.parse(String(raw)) : [];
    } else if (field.type === "select" && field.allowEmpty && !raw) {
      payload[field.key] = null;
    } else {
      const value = String(raw ?? "").trim();
      payload[field.key] = value || (field.required || field.requiredOnCreate ? "" : null);
    }
  }
  return payload;
}

async function parseResponse(response: Response): Promise<ApiResponse> {
  const body = (await response.json().catch(() => ({}))) as ApiResponse;
  if (response.status === 401) {
    window.location.assign("/admin/login");
    throw new Error("Tu sesión terminó. Vuelve a iniciar sesión.");
  }
  if (!response.ok || body.ok === false) throw new AdminApiError(body.error || "No se pudo completar la operación.", body.fields || []);
  return body;
}

function StatusValue({ value, labels }: { value: unknown; labels?: Record<string, string> }) {
  const key = String(value);
  const normalized = key.toLowerCase();
  const good = ["true", "active", "published", "paid", "delivered", "won", "responded", "rewarded", "admin"].some((token) => normalized.includes(token));
  const warning = ["pending", "verifying", "new", "progress", "review", "received", "contacted", "editor"].some((token) => normalized.includes(token));
  const bad = ["false", "cancelled", "refunded", "lost", "closed", "inactive"].some((token) => normalized.includes(token));
  return <span className={`ad-status ${good ? "is-good" : warning ? "is-warning" : bad ? "is-muted" : ""}`}><i />{labels?.[key] || key}</span>;
}

function DetailValue({ detail, record }: { detail: AdminDetail; record: AdminRecord }) {
  const value = getValue(record, detail.key);
  if (detail.type === "money") return <>{formatMoney(value, String(record.currency || "PEN"))}</>;
  if (detail.type === "date") return <>{formatDate(value)}</>;
  if (detail.type === "link") {
    const href = typeof value === "string" ? value : "";
    return href ? <a className="ad-detail-link" href={href} target="_blank" rel="noreferrer">Abrir archivo <ExternalLink size={14} /></a> : <>—</>;
  }
  if (detail.type === "email") {
    const email = typeof value === "string" ? value.trim() : "";
    return email ? <a className="ad-detail-link" href={`mailto:${email}`}>{email}</a> : <>—</>;
  }
  if (detail.type === "phone") {
    const phone = typeof value === "string" ? value.trim() : "";
    return phone ? <a className="ad-detail-link" href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a> : <>—</>;
  }
  if (detail.type === "whatsapp") {
    const phone = typeof value === "string" ? value.replace(/\D/g, "") : "";
    return phone ? <a className="ad-detail-link" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">Abrir WhatsApp <ExternalLink size={14} /></a> : <>—</>;
  }
  if (detail.type === "projectPreview") {
    return typeof value === "string" ? <a className="ad-detail-link" href={`/admin/preview/proyectos/${value}`} target="_blank" rel="noreferrer">Abrir vista previa <ExternalLink size={14} /></a> : <>—</>;
  }
  if (detail.type === "items") {
    const items = Array.isArray(value) ? value : [];
    return items.length ? (
      <div className="ad-order-items">
        {items.map((item, index) => {
          const line = item as Record<string, unknown>;
          return <div key={String(line.id || index)}><span>{Number(line.quantity || 0)} × {textValue(line.productName || line.name)}</span><strong>{formatMoney(line.totalCents ?? line.subtotalCents, String(record.currency || "PEN"))}</strong></div>;
        })}
      </div>
    ) : <>—</>;
  }
  if (detail.type === "related") {
    const items = Array.isArray(value) ? value : [];
    return items.length ? (
      <div className="ad-related-list">
        {items.map((item, index) => {
          const row = item as Record<string, unknown>;
          const label = textValue(row.number || row.title || row.name || `Registro ${index + 1}`);
          const meta = [row.status, row.source].filter(Boolean).map(String).join(" · ");
          return <div key={String(row.id || index)}><span><strong>{label}</strong>{meta && <small>{meta}</small>}</span>{typeof row.totalCents === "number" && <b>{formatMoney(row.totalCents, String(row.currency || "PEN"))}</b>}</div>;
        })}
      </div>
    ) : <>—</>;
  }
  if (detail.type === "longText") {
    if (value && typeof value === "object") return <pre className="ad-detail-pre">{JSON.stringify(value, null, 2)}</pre>;
    return <span className="ad-detail-long">{textValue(value)}</span>;
  }
  return <>{textValue(value)}</>;
}

function FormField({
  field,
  value,
  onChange,
  options,
  editing,
}: {
  field: AdminField;
  value: FormValue;
  onChange: (value: FormValue) => void;
  options: AdminOption[];
  editing: boolean;
}) {
  const required = field.required || (!editing && field.requiredOnCreate);
  const id = `admin-field-${field.key}`;
  const unknownLockedOption = field.type === "select" && editing && field.lockUnknownOption && Boolean(value) && !options.some((option) => option.value === String(value));
  if (field.type === "checkbox") {
    return (
      <label className={`ad-check-field ${field.wide ? "is-wide" : ""}`} htmlFor={id}>
        <input id={id} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
        <span className="ad-switch"><i /></span>
        <span><strong>{field.label}</strong>{field.help && <small>{field.help}</small>}</span>
      </label>
    );
  }

  if (field.type === "lineItems") {
    return <QuoteLineItemsField id={id} label={field.label} value={String(value || "[]")} onChange={onChange} />;
  }

  const common = {
    id,
    name: field.key,
    value: String(value ?? ""),
    required,
    placeholder: field.placeholder,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value),
  };

  return (
    <label className={`ad-form-field ${field.wide ? "is-wide" : ""}`} htmlFor={id}>
      <span>{field.label}{required && <b aria-hidden="true">*</b>}</span>
      {field.type === "textarea" || field.type === "list" || field.type === "json" ? (
        <textarea {...common} rows={field.type === "json" ? 7 : 5} spellCheck={field.type !== "json"} />
      ) : field.type === "select" ? (
        <select {...common}>
          {unknownLockedOption && <option value={String(value)} hidden>{String(value)} · gestionado por la acción dedicada</option>}
          {(field.allowEmpty || !required) && <option value="">{field.emptyLabel || "Selecciona una opción"}</option>}
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : (
        <input
          {...common}
          type={field.type === "money" || field.type === "number" || field.type === "percent" ? "number" : field.type === "date" ? "datetime-local" : field.type}
          min={field.min}
          step={field.step ?? (field.type === "money" || field.type === "percent" ? 0.01 : undefined)}
          autoComplete={field.type === "password" ? "new-password" : undefined}
        />
      )}
      {field.help && <small>{field.help}</small>}
    </label>
  );
}

type QuoteLineItemDraft = {
  name: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
};

function parseQuoteLineItems(value: string): QuoteLineItemDraft[] {
  try {
    const parsed = JSON.parse(value) as Array<Record<string, unknown>>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      name: typeof item.name === "string" ? item.name : "",
      description: typeof item.description === "string" ? item.description : "",
      quantity: Math.max(1, Number(item.quantity) || 1),
      unitPriceCents: Math.max(0, Number(item.unitPriceCents) || 0),
    }));
  } catch {
    return [];
  }
}

function QuoteLineItemsField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: FormValue) => void }) {
  const items = parseQuoteLineItems(value);
  const safeItems = items.length ? items : [{ name: "", description: "", quantity: 1, unitPriceCents: 0 }];
  const update = (index: number, patch: Partial<QuoteLineItemDraft>) => {
    onChange(JSON.stringify(safeItems.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)));
  };
  const total = safeItems.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);

  return (
    <fieldset className="ad-line-items is-wide" id={id}>
      <legend>{label}<b aria-hidden="true">*</b></legend>
      <div className="ad-line-items-list">
        {safeItems.map((item, index) => (
          <article key={index}>
            <div className="ad-line-item-heading">
              <strong>Ítem {index + 1}</strong>
              {safeItems.length > 1 && <button type="button" onClick={() => onChange(JSON.stringify(safeItems.filter((_, itemIndex) => itemIndex !== index)))} aria-label={`Eliminar ítem ${index + 1}`}><Trash2 size={15} /></button>}
            </div>
            <label><span>Concepto</span><input required value={item.name} onChange={(event) => update(index, { name: event.target.value })} placeholder="Diseño y desarrollo web" /></label>
            <label className="is-wide"><span>Descripción</span><textarea rows={2} value={item.description} onChange={(event) => update(index, { description: event.target.value })} placeholder="Alcance o entregables incluidos" /></label>
            <label><span>Cantidad</span><input type="number" required min={1} max={10_000} step={1} value={item.quantity} onChange={(event) => update(index, { quantity: Math.max(1, Number(event.target.value) || 1) })} /></label>
            <label><span>Precio unitario</span><input type="number" required min={0} step="0.01" value={(item.unitPriceCents / 100).toFixed(2)} onChange={(event) => update(index, { unitPriceCents: Math.max(0, Math.round(Number(event.target.value) * 100) || 0) })} /></label>
            <strong className="ad-line-item-total">{formatMoney(item.quantity * item.unitPriceCents)}</strong>
          </article>
        ))}
      </div>
      <div className="ad-line-items-footer">
        <button type="button" onClick={() => onChange(JSON.stringify([...safeItems, { name: "", description: "", quantity: 1, unitPriceCents: 0 }]))}><Plus size={15} /> Añadir ítem</button>
        <span>Subtotal <strong>{formatMoney(total)}</strong></span>
      </div>
    </fieldset>
  );
}

export function ResourceManager({ configKey }: { configKey: string }) {
  const config = adminResourceConfigs[configKey];
  const session = useAdminSession();
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
  const [searchDraft, setSearchDraft] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [referenceOptions, setReferenceOptions] = useState<Record<string, AdminOption[]>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AdminRecord | null>(null);
  const [form, setForm] = useState<FormState>(() => initialForm(config?.fields || []));
  const editRequestRef = useRef(0);
  const formTouchedRef = useRef(false);
  const [formError, setFormError] = useState<FormFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [urlReady, setUrlReady] = useState(false);
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  const showToast = useCallback((next: Toast) => {
    setToast(next);
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const loadRecords = useCallback(async (soft = false) => {
    if (!config) return;
    if (soft) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const parameters = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (query) parameters.set("q", query);
      Object.entries(filters).forEach(([key, value]) => value && parameters.set(key, value));
      const response = await fetch(`/api/admin/${config.resource}?${parameters.toString()}`, { cache: "no-store" });
      const body = await parseResponse(response);
      setRecords(Array.isArray(body.data) ? body.data : []);
      if (body.pagination) setPagination(body.pagination);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la información.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  // filtersKey deliberately provides a stable dependency for the filter object.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, page, query, filtersKey]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    if (!config || typeof window === "undefined") return;
    const parameters = new URLSearchParams(window.location.search);
    const nextFilters: Record<string, string> = {};
    config.filters?.forEach((filter) => {
      const value = parameters.get(filter.key);
      if (!value) return;
      if (filter.type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(value)) nextFilters[filter.key] = value;
      else if (filter.type === "text") nextFilters[filter.key] = value.slice(0, 160);
      else if (filter.options?.some((option) => option.value === value)) nextFilters[filter.key] = value;
    });
    const nextQuery = parameters.get("q")?.trim() || "";
    const requestedPage = Number(parameters.get("page"));
    if (Object.keys(nextFilters).length) setFilters(nextFilters);
    if (Number.isInteger(requestedPage) && requestedPage > 1) setPage(requestedPage);
    if (nextQuery) {
      setSearchDraft(nextQuery);
      setQuery(nextQuery);
    }
    setUrlReady(true);
  }, [config]);

  useEffect(() => {
    if (!config || !urlReady || typeof window === "undefined") return;
    const parameters = new URLSearchParams();
    if (query) parameters.set("q", query);
    if (page > 1) parameters.set("page", String(page));
    Object.entries(filters).forEach(([key, value]) => value && parameters.set(key, value));
    const next = `${window.location.pathname}${parameters.size ? `?${parameters}` : ""}`;
    window.history.replaceState(window.history.state, "", next);
  }, [config, filters, page, query, urlReady]);

  useEffect(() => {
    if (!config) return;
    const references = [...new Map(config.fields.filter((field) => field.optionsFrom).map((field) => [field.key, field])).values()];
    if (!references.length) return;
    let cancelled = false;
    void Promise.all(
      references.map(async (field) => {
        const source = field.optionsFrom!;
        const response = await fetch(`/api/admin/options/${source.resource}`, { cache: "no-store" });
        const body = await parseResponse(response);
        const rows = Array.isArray(body.data) ? body.data : [];
        return [field.key, rows.map((row) => ({ label: textValue(getValue(row, source.labelField)), value: String(getValue(row, source.valueField || "id")) }))] as const;
      }),
    ).then((entries) => {
      if (!cancelled) setReferenceOptions(Object.fromEntries(entries));
    }).catch(() => {
      if (!cancelled) setReferenceOptions({});
    });
    return () => { cancelled = true; };
  }, [config]);

  useEffect(() => {
    if (!drawerOpen && !confirm) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const container = document.querySelector<HTMLElement>(confirm ? ".ad-confirm-dialog" : ".ad-drawer");
    const focusableSelector = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const focusFrame = window.requestAnimationFrame(() => container?.querySelector<HTMLElement>(focusableSelector)?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting && !confirmBusy) {
        setDrawerOpen(false);
        setConfirm(null);
      }
      if (event.key === "Tab" && container) {
        const focusable = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKey);
      previousFocus?.focus();
    };
  }, [drawerOpen, confirm, submitting, confirmBusy]);

  if (!config) return null;
  const canRead = Boolean(session && canAccessAdminResource(session.role, config.resource, "read"));
  const canCreate = Boolean(session && config.create !== false && canAccessAdminResource(session.role, config.resource, "create"));
  const canEdit = Boolean(session && config.edit !== false && canAccessAdminResource(session.role, config.resource, "update"));
  const canDelete = Boolean(session && config.delete !== false && canAccessAdminResource(session.role, config.resource, "delete"));
  const noteEntityType = ({ leads: "LEAD", clients: "CLIENT", projects: "PROJECT", quotes: "QUOTE" } as const)[config.resource as "leads" | "clients" | "projects" | "quotes"];
  if (!canRead) {
    return (
      <section className="ad-access-denied">
        <span><ShieldAlert size={27} /></span>
        <h1>Acceso reservado</h1>
        <p>Este módulo solo está disponible para usuarios con rol Administrador.</p>
      </section>
    );
  }

  const openCreate = () => {
    editRequestRef.current += 1;
    formTouchedRef.current = false;
    setEditingRecord(null);
    setForm(initialForm(config.fields));
    setFormError(null);
    setDrawerOpen(true);
  };

  const openEdit = (record: AdminRecord) => {
    const requestId = editRequestRef.current + 1;
    editRequestRef.current = requestId;
    formTouchedRef.current = false;
    setEditingRecord(record);
    setForm(Object.fromEntries(config.fields.map((field) => [field.key, valueForForm(field, getValue(record, field.key))])));
    setFormError(null);
    setDrawerOpen(true);
    void fetch(`/api/admin/${config.resource}/${record.id}`, { cache: "no-store" })
      .then(parseResponse)
      .then((body) => {
        if (!body.data || Array.isArray(body.data) || editRequestRef.current !== requestId || formTouchedRef.current) return;
        setEditingRecord(body.data);
        setForm(Object.fromEntries(config.fields.map((field) => [field.key, valueForForm(field, getValue(body.data as AdminRecord, field.key))])));
      })
      .catch(() => {
        // The list record remains usable if optional relationship hydration fails.
      });
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingRecord && config.resource === "leads" && form.status === "LOST" && editingRecord.status !== "LOST") {
      if (!window.confirm("Marcar este lead como perdido cerrará la oportunidad activa. Confirma que registraste el motivo de pérdida.")) return;
    }
    if (editingRecord && config.resource === "users" && form.active === false && editingRecord.active !== false) {
      if (!window.confirm("Desactivar este usuario impedirá su próximo acceso a Wilo OS. ¿Continuar?")) return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const editing = Boolean(editingRecord);
      const payload = serializeForm(config.fields, form, editing);
      const endpoint = editing ? `/api/admin/${config.resource}/${editingRecord!.id}` : `/api/admin/${config.resource}`;
      const response = await fetch(endpoint, {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(editing && editingRecord?.updatedAt ? { "X-Record-Updated-At": String(editingRecord.updatedAt) } : {}),
        },
        body: JSON.stringify(payload),
      });
      await parseResponse(response);
      setDrawerOpen(false);
      showToast({ type: "success", message: editing ? `${config.singular} actualizado correctamente.` : `${config.singular} creado correctamente.` });
      await loadRecords(true);
    } catch (submitError) {
      if (submitError instanceof SyntaxError) {
        setFormError({ message: "Revisa el campo JSON: su formato no es válido.", fields: [] });
      } else if (submitError instanceof AdminApiError) {
        setFormError({
          message: submitError.message,
          fields: submitError.fields.map((issue) => {
            const key = issue.path.split(".")[0];
            return { label: config.fields.find((field) => field.key === key)?.label || issue.path || "Formulario", message: issue.message };
          }),
        });
      } else {
        setFormError({ message: submitError instanceof Error ? submitError.message : "No se pudo guardar.", fields: [] });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const askDelete = (record: AdminRecord) => {
    setConfirm({
      title: `Eliminar ${config.singular}`,
      body: `Esta acción eliminará “${textValue(getValue(record, config.columns.find((column) => column.type !== "image")?.key || "id"))}”. No se puede deshacer.`,
      label: "Sí, eliminar",
      danger: true,
      run: async () => {
        const response = await fetch(`/api/admin/${config.resource}/${record.id}`, { method: "DELETE" });
        await parseResponse(response);
        showToast({ type: "success", message: `${config.singular} eliminado correctamente.` });
        await loadRecords(true);
      },
    });
  };

  const askAction = (record: AdminRecord, action: NonNullable<AdminResourceConfig["actions"]>[number]) => {
    setConfirm({
      title: action.label,
      body: action.confirm,
      label: action.label,
      run: async () => {
        const response = await fetch(action.endpoint.replace("{id}", record.id), { method: action.method || "POST" });
        await parseResponse(response);
        showToast({ type: "success", message: action.success });
        await loadRecords(true);
      },
    });
  };

  const runConfirmed = async () => {
    if (!confirm) return;
    setConfirmBusy(true);
    try {
      await confirm.run();
      setConfirm(null);
    } catch (actionError) {
      setConfirm(null);
      showToast({ type: "error", message: actionError instanceof Error ? actionError.message : "No se pudo completar la acción." });
    } finally {
      setConfirmBusy(false);
    }
  };

  return (
    <section className="ad-resource-page">
      <div className="ad-page-heading">
        <div>
          <span className="ad-eyebrow">Contenido y operación</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        {canCreate && (
          <button className="ad-primary-button" type="button" onClick={openCreate}>
            <Plus size={18} /> Nuevo {config.singular}
          </button>
        )}
      </div>

      <div className="ad-panel">
        <div className="ad-table-toolbar">
          <form className="ad-search" onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(searchDraft.trim()); }}>
            <Search size={17} />
            <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder={config.searchPlaceholder} aria-label="Buscar" />
            {searchDraft && <button type="button" onClick={() => { setSearchDraft(""); setQuery(""); setPage(1); }} aria-label="Limpiar búsqueda"><X size={15} /></button>}
          </form>
          <div className="ad-filters">
            {config.filters?.map((filter) => {
              const updateFilter = (value: string) => {
                setPage(1);
                setFilters((current) => ({ ...current, [filter.key]: value }));
              };
              return (
                <label key={filter.key} title={filter.label}>
                  <span className="sr-only">{filter.label}</span>
                  {filter.type === "date" ? (
                    <input type="date" value={filters[filter.key] || ""} onChange={(event) => updateFilter(event.target.value)} aria-label={filter.label} />
                  ) : filter.type === "text" ? (
                    <input type="text" maxLength={160} value={filters[filter.key] || ""} onChange={(event) => updateFilter(event.target.value)} placeholder={filter.placeholder || filter.label} aria-label={filter.label} />
                  ) : (
                    <select value={filters[filter.key] || ""} onChange={(event) => updateFilter(event.target.value)} aria-label={filter.label}>
                      <option value="">{filter.label}: todos</option>
                      {filter.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  )}
                </label>
              );
            })}
            <button className="ad-refresh-button" type="button" onClick={() => void loadRecords(true)} disabled={refreshing} aria-label="Actualizar" title="Actualizar">
              <RefreshCw size={17} className={refreshing ? "is-spinning" : ""} />
            </button>
          </div>
        </div>

        {error ? (
          <div className="ad-inline-error">
            <AlertTriangle size={22} />
            <div><strong>No pudimos cargar este módulo</strong><span>{error}</span></div>
            <button type="button" onClick={() => void loadRecords()}>Reintentar</button>
          </div>
        ) : loading ? (
          <div className="ad-table-loading" aria-label="Cargando registros">
            {[0, 1, 2, 3, 4].map((item) => <span key={item} />)}
          </div>
        ) : records.length === 0 ? (
          <div className="ad-empty-state">
            <div className="ad-empty-mark">W</div>
            <h2>{query || Object.values(filters).some(Boolean) ? "No hay coincidencias" : `Aún no hay ${config.title.toLowerCase()}`}</h2>
            <p>{query || Object.values(filters).some(Boolean) ? "Prueba con otra búsqueda o limpia los filtros." : "Los nuevos registros aparecerán aquí cuando estén disponibles."}</p>
            {canCreate && !query && !Object.values(filters).some(Boolean) && <button className="ad-secondary-button" type="button" onClick={openCreate}><Plus size={17} /> Crear el primero</button>}
          </div>
        ) : (
          <>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead><tr>{config.columns.map((column) => <th key={column.key}>{column.label}</th>)}<th><span className="sr-only">Acciones</span></th></tr></thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      {config.columns.map((column) => {
                        const value = getValue(record, column.key);
                        const secondary = column.secondaryKey ? getValue(record, column.secondaryKey) : undefined;
                        if (column.type === "image") {
                          const source = imageSource(value);
                          return <td key={column.key} data-label={column.label}><span className="ad-table-image">{source ? <img src={source} alt="" /> : <span>{textValue(getValue(record, "name") || getValue(record, "title")).slice(0, 1)}</span>}</span></td>;
                        }
                        if (column.type === "money") return <td key={column.key} data-label={column.label}><strong className="ad-money">{formatMoney(value, String(record.currency || "PEN"))}</strong></td>;
                        if (column.type === "date") return <td key={column.key} data-label={column.label}><span className="ad-date">{formatDate(value)}</span></td>;
                        if (column.type === "status") return <td key={column.key} data-label={column.label}><StatusValue value={value} labels={column.statusLabels} /></td>;
                        if (column.type === "boolean") return <td key={column.key} data-label={column.label}><span className={`ad-boolean ${value ? "is-yes" : ""}`}>{value ? <Check size={14} /> : <X size={14} />}{value ? "Sí" : "No"}</span></td>;
                        if (column.type === "link") {
                          const href = typeof value === "string" ? value : "";
                          return <td key={column.key} data-label={column.label}>{href ? <a className="ad-table-link" href={href} target="_blank" rel="noreferrer">Abrir <ExternalLink size={13} /></a> : "—"}</td>;
                        }
                        return <td key={column.key} data-label={column.label}><span className="ad-primary-cell">{compactText(value)}{secondary !== undefined && secondary !== null && secondary !== "" && <small>{compactText(secondary, 45)}</small>}</span></td>;
                      })}
                      <td className="ad-row-actions">
                        {canEdit && <button type="button" onClick={() => openEdit(record)} aria-label={`Editar ${config.singular}`} title="Editar"><FilePenLine size={17} /></button>}
                        {config.actions?.filter((action) => {
                          const roleAllowed = !action.adminOnly || (session && ["SUPER_ADMIN", "ADMIN"].includes(session.role));
                          const valueAllowed = !action.visibleWhen || action.visibleWhen.values.includes(String(getValue(record, action.visibleWhen.key)));
                          const emptyAllowed = !action.visibleWhenEmpty || ([null, undefined, ""].includes(getValue(record, action.visibleWhenEmpty.key) as null | undefined | "") === action.visibleWhenEmpty.empty);
                          return roleAllowed && valueAllowed && emptyAllowed;
                        }).map((action) => (
                          <button key={action.label} type="button" className="is-accent" onClick={() => askAction(record, action)} aria-label={action.label} title={action.label}><MoreHorizontal size={18} /></button>
                        ))}
                        {canDelete && <button className="is-danger" type="button" onClick={() => askDelete(record)} aria-label={`Eliminar ${config.singular}`} title="Eliminar"><Trash2 size={16} /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ad-pagination">
              <span>{pagination.total === 1 ? "1 registro" : `${pagination.total} registros`}</span>
              <div>
                <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}><ArrowLeft size={16} /> <span>Anterior</span></button>
                <strong>{page} / {Math.max(1, pagination.pages)}</strong>
                <button type="button" onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))} disabled={page >= pagination.pages}><span>Siguiente</span> <ArrowRight size={16} /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {drawerOpen && (
        <div className="ad-drawer-layer" role="presentation">
          <button className="ad-drawer-backdrop" type="button" onClick={() => !submitting && setDrawerOpen(false)} aria-label="Cerrar formulario" />
          <aside className="ad-drawer" role="dialog" aria-modal="true" aria-labelledby="admin-form-title">
            <div className="ad-drawer-head">
              <div><span>{editingRecord ? "Editar registro" : "Nuevo registro"}</span><h2 id="admin-form-title">{editingRecord ? `Editar ${config.singular}` : `Crear ${config.singular}`}</h2></div>
              <button className="ad-icon-button" type="button" onClick={() => setDrawerOpen(false)} disabled={submitting} aria-label="Cerrar"><X size={20} /></button>
            </div>
            {editingRecord && noteEntityType && session && canAccessAdminResource(session.role, "notes", "read") && (
              <RecordNotes entityType={noteEntityType} entityId={editingRecord.id} />
            )}
            <form onSubmit={submitForm} className="ad-resource-form">
              {editingRecord && config.details && config.details.length > 0 && (
                <div className="ad-record-details">
                  <h3>Información recibida</h3>
                  <div>{config.details.map((detail) => <dl key={detail.key} className={detail.type === "longText" || detail.type === "items" ? "is-wide" : ""}><dt>{detail.label}</dt><dd><DetailValue detail={detail} record={editingRecord} /></dd></dl>)}</div>
                </div>
              )}
              <div className="ad-form-grid">
                {config.fields.map((field) => (
                  <FormField
                    key={field.key}
                    field={field}
                    value={form[field.key] ?? ""}
                    editing={Boolean(editingRecord)}
                    options={field.optionsFrom ? referenceOptions[field.key] || [] : field.options || []}
                    onChange={(value) => {
                      formTouchedRef.current = true;
                      setForm((current) => ({ ...current, [field.key]: value }));
                    }}
                  />
                ))}
              </div>
              {formError && <div className="ad-form-error"><AlertTriangle size={17} /><div><strong>{formError.message}</strong>{formError.fields.length > 0 && <ul>{formError.fields.map((issue, index) => <li key={`${issue.label}-${index}`}><b>{issue.label}:</b> {issue.message}</li>)}</ul>}</div></div>}
              <div className="ad-form-actions">
                <button className="ad-secondary-button" type="button" onClick={() => setDrawerOpen(false)} disabled={submitting}>Cancelar</button>
                <button className="ad-primary-button" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="is-spinning" size={18} /> : <Check size={18} />}{submitting ? "Guardando…" : "Guardar cambios"}</button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {confirm && (
        <div className="ad-confirm-layer" role="presentation">
          <button className="ad-confirm-backdrop" type="button" onClick={() => !confirmBusy && setConfirm(null)} aria-label="Cerrar confirmación" />
          <div className="ad-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
            <span className={confirm.danger ? "is-danger" : ""}>{confirm.danger ? <Trash2 size={23} /> : <AlertTriangle size={23} />}</span>
            <h2 id="confirm-title">{confirm.title}</h2>
            <p>{confirm.body}</p>
            <div><button className="ad-secondary-button" type="button" onClick={() => setConfirm(null)} disabled={confirmBusy}>Cancelar</button><button className={confirm.danger ? "ad-danger-button" : "ad-primary-button"} type="button" onClick={() => void runConfirmed()} disabled={confirmBusy}>{confirmBusy && <LoaderCircle className="is-spinning" size={17} />}{confirmBusy ? "Procesando…" : confirm.label}</button></div>
          </div>
        </div>
      )}

      {toast && <div className={`ad-toast is-${toast.type}`} role="status">{toast.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}<span>{toast.message}</span><button type="button" onClick={() => setToast(null)} aria-label="Cerrar"><X size={15} /></button></div>}
    </section>
  );
}
