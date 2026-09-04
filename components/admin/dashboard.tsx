"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  FileClock,
  FileWarning,
  FolderKanban,
  Inbox,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminSession } from "./admin-shell";

type Metrics = {
  newLeads: number | null;
  followUpsDue: number | null;
  openQuotes: number | null;
  acceptedQuoteValueCents: number | null;
  activeProjects: number;
  draftCases: number | null;
  reviewCases: number | null;
  publishedCases: number | null;
};

type RecentLead = {
  id: string;
  name: string;
  company: string | null;
  status: string;
  source: string;
  createdAt: string;
  nextFollowUpAt: string | null;
};

type Activity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor: { name: string | null; email: string } | null;
};

type DashboardResponse = {
  ok?: boolean;
  error?: string;
  metrics?: Metrics;
  pipeline?: Record<string, number> | null;
  recentLeads?: RecentLead[];
  recentActivity?: Activity[];
};

const initialMetrics: Metrics = {
  newLeads: null,
  followUpsDue: null,
  openQuotes: null,
  acceptedQuoteValueCents: null,
  activeProjects: 0,
  draftCases: null,
  reviewCases: null,
  publishedCases: null,
};

const pipelineLabels: Record<string, string> = {
  NEW: "Nuevos",
  CONTACTED: "Contactados",
  MEETING: "Reunión",
  PROPOSAL: "Propuesta",
  NEGOTIATION: "Negociación",
  WON: "Ganados",
  LOST: "Perdidos",
};

const sourceLabels: Record<string, string> = {
  STUDIO: "Studio",
  EVENTS: "Events",
  EDUCATION: "Education",
  EXPRESS: "Express",
  MANUAL: "Manual",
};

function money(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(value / 100);
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" }).format(new Date(value));
}

export function AdminDashboard() {
  const user = useAdminSession();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [pipeline, setPipeline] = useState<Record<string, number> | null>(null);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as DashboardResponse;
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      if (!response.ok || !body.metrics) throw new Error(body.error || "No se pudo cargar el resumen.");
      setMetrics(body.metrics);
      setPipeline(body.pipeline ?? null);
      setRecentLeads(body.recentLeads ?? []);
      setRecentActivity(body.recentActivity ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el resumen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cards = useMemo(() => {
    const result = [
      metrics.newLeads === null ? null : { label: "Leads nuevos", value: String(metrics.newLeads), href: "/admin/leads?status=NEW", icon: Inbox, tone: "yellow", note: "Por revisar" },
      metrics.followUpsDue === null ? null : { label: "Seguimientos vencidos", value: String(metrics.followUpsDue), href: "/admin/leads", icon: Target, tone: "red", note: "Requieren acción" },
      { label: "Proyectos activos", value: String(metrics.activeProjects), href: "/admin/proyectos?status=ACTIVE", icon: FolderKanban, tone: "blue", note: "En ejecución" },
      metrics.openQuotes === null
        ? { label: "Casos publicados", value: String(metrics.publishedCases ?? 0), href: "/admin/proyectos?contentStatus=PUBLISHED", icon: Sparkles, tone: "green", note: "Visibles en web" }
        : { label: "Cotizaciones abiertas", value: String(metrics.openQuotes), href: "/admin/cotizaciones", icon: ClipboardList, tone: "green", note: "En preparación o envío" },
    ];
    return result.filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [metrics]);

  const quickLinks = [
    metrics.newLeads !== null ? { href: "/admin/leads", title: "Registrar lead", text: "Añadir una oportunidad manual", icon: Inbox } : null,
    metrics.openQuotes !== null ? { href: "/admin/cotizaciones", title: "Crear cotización", text: "Partidas y totales controlados", icon: CircleDollarSign } : null,
    { href: "/admin/proyectos", title: "Gestionar proyectos", text: "Operación y casos públicos", icon: FolderKanban },
    metrics.draftCases !== null ? { href: "/admin/contenido", title: "Editar contenido", text: "Revisar borradores del sitio", icon: Sparkles } : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <section className="ad-dashboard">
      <div className="ad-dashboard-hero">
        <div>
          <span className="ad-eyebrow">Wilo OS · Operación real</span>
          <h1>Hola, {user?.name?.split(" ")[0] || "equipo"}.</h1>
          <p>Prioridades comerciales, proyectos y contenido según tu rol.</p>
        </div>
        <button className="ad-refresh-wide" type="button" onClick={() => void load()} disabled={loading}>
          {loading ? <LoaderCircle className="is-spinning" size={17} /> : <RefreshCw size={17} />} Actualizar datos
        </button>
        <div className="ad-hero-orb" aria-hidden="true">W</div>
      </div>

      {error && <div className="ad-dashboard-error"><FileWarning size={19} /><span>{error}</span><button type="button" onClick={() => void load()}>Reintentar</button></div>}

      <div className="ad-metric-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link href={card.href} className={`ad-metric-card tone-${card.tone}`} key={card.label}>
              <div><span><Icon size={20} /></span><small>{card.note}</small></div>
              {loading ? <i className="ad-metric-skeleton" /> : <strong>{card.value}</strong>}
              <p>{card.label}</p>
              <ArrowRight className="ad-metric-arrow" size={18} />
            </Link>
          );
        })}
      </div>

      <div className="ad-dashboard-grid">
        <article className="ad-priority-panel ad-panel">
          <div className="ad-panel-heading">
            <div><span>{pipeline ? "CRM" : "CMS"}</span><h2>{pipeline ? "Pipeline comercial" : "Flujo editorial"}</h2></div>
          </div>
          <div className="ad-priority-list">
            {pipeline ? Object.entries(pipeline).map(([status, count]) => (
              <Link href={`/admin/leads?status=${status}`} key={status}>
                <span className={status === "WON" ? "tone-green" : status === "LOST" ? "tone-red" : "tone-yellow"}><Target size={18} /></span>
                <div><strong>{pipelineLabels[status] || status}</strong><small>Leads en esta etapa</small></div><b>{count}</b><ArrowRight size={16} />
              </Link>
            )) : (
              <>
                <Link href="/admin/proyectos?contentStatus=DRAFT"><span className="tone-yellow"><FileClock size={18} /></span><div><strong>Borradores</strong><small>Pendientes de edición</small></div><b>{metrics.draftCases ?? 0}</b><ArrowRight size={16} /></Link>
                <Link href="/admin/proyectos?contentStatus=REVIEW"><span className="tone-blue"><CheckCircle2 size={18} /></span><div><strong>En revisión</strong><small>Listos para validar</small></div><b>{metrics.reviewCases ?? 0}</b><ArrowRight size={16} /></Link>
                <Link href="/admin/proyectos?contentStatus=PUBLISHED"><span className="tone-green"><Sparkles size={18} /></span><div><strong>Publicados</strong><small>Casos visibles en el sitio</small></div><b>{metrics.publishedCases ?? 0}</b><ArrowRight size={16} /></Link>
              </>
            )}
          </div>
        </article>

        <article className="ad-campaign-panel ad-panel">
          <div className="ad-panel-heading"><div><span>{recentActivity.length ? "Auditoría" : recentLeads.length ? "CRM" : "Contenido"}</span><h2>{recentActivity.length ? "Actividad reciente" : recentLeads.length ? "Últimos leads" : "Estado editorial"}</h2></div></div>
          <div className="ad-priority-list">
            {recentActivity.slice(0, 5).map((item) => (
              <Link href="/admin/actividad" key={item.id}><span className="tone-blue"><FileClock size={18} /></span><div><strong>{item.action.replaceAll("_", " ")}</strong><small>{item.actor?.name || item.actor?.email || "Sistema"} · {dateTime(item.createdAt)}</small></div><ArrowRight size={16} /></Link>
            ))}
            {!recentActivity.length && recentLeads.slice(0, 5).map((lead) => (
              <Link href={`/admin/leads?q=${encodeURIComponent(lead.name)}`} key={lead.id}><span className="tone-yellow"><Inbox size={18} /></span><div><strong>{lead.name}</strong><small>{lead.company || sourceLabels[lead.source] || lead.source} · {pipelineLabels[lead.status] || lead.status}</small></div><ArrowRight size={16} /></Link>
            ))}
          </div>
          {!loading && !recentActivity.length && !recentLeads.length && <div className="ad-all-clear"><CheckCircle2 size={21} /><span><strong>Sin pendientes visibles</strong><small>La actividad aparecerá cuando el equipo trabaje en Wilo OS.</small></span></div>}
          {metrics.acceptedQuoteValueCents !== null && <p>Valor histórico aceptado: <strong>{money(metrics.acceptedQuoteValueCents)}</strong></p>}
        </article>
      </div>

      <div className="ad-quick-section">
        <div className="ad-section-heading"><div><span>Accesos rápidos</span><h2>¿Qué necesitas hacer?</h2></div></div>
        <div className="ad-quick-grid">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return <Link href={item.href} key={item.href}><span><Icon size={20} /></span><div><strong>{item.title}</strong><small>{item.text}</small></div><ArrowRight size={17} /></Link>;
          })}
        </div>
      </div>
    </section>
  );
}
