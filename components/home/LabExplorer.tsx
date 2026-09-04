"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import styles from "./lab-explorer.module.css";

type LabModule = {
  key: string;
  label: string;
  description: string;
};

type DemoPanelProps = {
  active: boolean;
  children: ReactNode;
  className: string;
  eyebrow: string;
  label: string;
  onActivate: () => void;
  panelKey: string;
};

const PANEL_FOR_MODULE: Record<string, string> = {
  admin: "dashboard",
  api: "api",
  crm: "crm",
  dashboard: "dashboard",
  quote: "quote",
  tracking: "tracking",
};

function WindowDots() {
  return <span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span>;
}

function DemoPanel({ active, children, className, eyebrow, label, onActivate, panelKey }: DemoPanelProps) {
  return (
    <article
      className={`${styles.demoPanel} ${className}`}
      data-active={active ? "true" : "false"}
      data-panel={panelKey}
    >
      <button
        aria-controls="wilo-lab-active-description"
        aria-label={`Mostrar el módulo ${label}`}
        aria-pressed={active}
        className={styles.panelToggle}
        onClick={onActivate}
        type="button"
      />
      <div className={styles.panelChrome} aria-hidden="true">
        <WindowDots />
        <span>{eyebrow}</span>
        <i>DEMO</i>
      </div>
      <div className={styles.panelBody} aria-hidden="true">{children}</div>
    </article>
  );
}

function OverviewPanel({ adminMode }: { adminMode: boolean }) {
  return (
    <div className={styles.overviewLayout}>
      <aside className={styles.miniSidebar}>
        <b>W</b><i className={styles.sidebarActive} /><i /><i /><i /><i />
      </aside>
      <div className={styles.overviewMain}>
        <header className={styles.uiHeading}>
          <div><small>WILO OS</small><strong>{adminMode ? "Administración" : "Dashboard"}</strong></div>
          <span>Este mes⌄</span>
        </header>
        {adminMode ? (
          <div className={styles.adminPreview}>
            <div className={styles.adminToolbar}><strong>Contenido</strong><span>+ Nuevo</span></div>
            <ul>
              <li><i /><b>Página principal</b><em>Publicado</em></li>
              <li><i /><b>Proyectos</b><em>En revisión</em></li>
              <li><i /><b>Servicios</b><em>Actualizado</em></li>
            </ul>
          </div>
        ) : (
          <>
            <div className={styles.metricStrip}>
              <div><small>OPERACIÓN</small><strong>En línea</strong><i /></div>
              <div><small>FLUJOS</small><strong>Activos</strong><i /></div>
              <div><small>REVISIÓN</small><strong>Al día</strong><i /></div>
            </div>
            <div className={styles.dashboardGrid}>
              <div className={styles.lineChart}>
                <span>ACTIVIDAD DEL SISTEMA</span>
                <svg viewBox="0 0 330 105" preserveAspectRatio="none">
                  <defs><linearGradient id="lab-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2b900" stopOpacity=".28" /><stop offset="1" stopColor="#f2b900" stopOpacity="0" /></linearGradient></defs>
                  <path className={styles.chartFill} d="M0 89 C32 82 42 62 72 68 S112 85 138 51 S176 20 200 53 S242 80 265 39 S306 24 330 9 L330 105 L0 105Z" />
                  <path className={styles.chartLine} d="M0 89 C32 82 42 62 72 68 S112 85 138 51 S176 20 200 53 S242 80 265 39 S306 24 330 9" />
                </svg>
              </div>
              <div className={styles.statusRing}><i><b>OK</b></i><span>Sistema<br />operativo</span></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CrmPanel() {
  return (
    <div className={styles.compactUi}>
      <header className={styles.uiHeading}><div><small>RELACIONES</small><strong>CRM</strong></div><span>+ Contacto</span></header>
      <div className={styles.searchBar}>Buscar contacto… <i>⌕</i></div>
      <div className={styles.crmTable}>
        <div><small>CONTACTO</small><small>ETAPA</small><small>ACTIVIDAD</small></div>
        <div><b>Cliente demo A</b><em>En conversación</em><span>Hoy</span></div>
        <div><b>Cliente demo B</b><em>Propuesta</em><span>Reciente</span></div>
        <div><b>Cliente demo C</b><em>Seguimiento</em><span>Programado</span></div>
      </div>
    </div>
  );
}

function QuotePanel() {
  return (
    <div className={styles.compactUi}>
      <header className={styles.uiHeading}><div><small>FLUJO GUIADO</small><strong>Cotizador</strong></div><span>Borrador</span></header>
      <div className={styles.steps}><b>1</b><i /><b>2</b><i /><b>3</b><i /><b>4</b></div>
      <div className={styles.quoteProduct}>
        <span className={styles.productThumb}>W</span>
        <div><strong>Solución digital</strong><small>Configuración demostrativa</small></div>
        <em>Editar</em>
      </div>
      <div className={styles.quoteBottom}>
        <ul><li><i />Alcance seleccionado</li><li><i />Entrega planificada</li></ul>
        <div><small>ESTADO</small><strong>Estimación preparada</strong><span>Generar propuesta</span></div>
      </div>
    </div>
  );
}

function TrackingPanel() {
  return (
    <div className={styles.compactUi}>
      <header className={styles.uiHeading}><div><small>SEGUIMIENTO</small><strong>Tracking</strong></div><span>En curso</span></header>
      <div className={styles.trackingSteps}><div className={styles.done}><i>✓</i><b>Recibido</b></div><span /><div className={styles.done}><i>✓</i><b>Proceso</b></div><span /><div><i>3</i><b>Revisión</b></div><span /><div><i>4</i><b>Entrega</b></div></div>
      <div className={styles.routeMap}><i /><i /><i /><svg viewBox="0 0 300 70" preserveAspectRatio="none"><path d="M8 53 C67 10 96 66 142 35 S218 18 292 45" /></svg></div>
    </div>
  );
}

function ApiPanel() {
  return (
    <div className={styles.apiUi}>
      <header className={styles.uiHeading}><div><small>CONEXIONES</small><strong>API & Integraciones</strong></div><span>Documentación ↗</span></header>
      <div className={styles.apiFlow}>
        <div><small>TU SISTEMA</small><b>DATA</b></div><i>···</i><div className={styles.apiCore}><small>WILO API</small><b>W</b></div><i>···</i><div><small>SERVICIOS</small><b>CRM · ERP · WEB</b></div>
      </div>
    </div>
  );
}

export function LabExplorer({ modules }: { modules: readonly LabModule[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const selectorRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useHydratedReducedMotion();
  const active = modules[activeIndex] ?? modules[0];
  if (!active) return null;

  const activePanel = PANEL_FOR_MODULE[active.key] ?? active.key;
  const activateKey = (key: string) => {
    const index = modules.findIndex((module) => module.key === key);
    if (index >= 0) setActiveIndex(index);
  };
  const activatePanel = (key: string) => {
    if (key === "dashboard" && active.key === "admin") return;
    activateKey(key);
  };
  const moveSelection = (index: number) => {
    const nextIndex = (index + modules.length) % modules.length;
    setActiveIndex(nextIndex);
    const buttons = selectorRef.current?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[nextIndex]?.focus();
  };

  return (
    <div className={styles.explorer}>
      <div className={styles.intro}>
        <p className={styles.labTitle}>WILO <em>LAB</em></p>
        <p className={styles.manifesto}>No todo termina en la página que ves. También construimos herramientas y flujos internos que hacen funcionar <strong>negocios reales.</strong></p>
        <div aria-label="Módulos de Wilo Lab" className={styles.selector} ref={selectorRef} role="group">
          {modules.map((module, index) => (
            <button
              aria-controls="wilo-lab-stage"
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? styles.active : undefined}
              key={module.key}
              onClick={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                  event.preventDefault();
                  moveSelection(index + 1);
                }
                if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveSelection(index - 1);
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  moveSelection(0);
                }
                if (event.key === "End") {
                  event.preventDefault();
                  moveSelection(modules.length - 1);
                }
              }}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{module.label}</strong>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            aria-live="polite"
            className={styles.copy}
            id="wilo-lab-active-description"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -5 }}
            key={active.key}
            transition={{ duration: reducedMotion ? 0 : 0.24 }}
          >
            <span>EN FOCO · {active.label}</span>
            <p>{active.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.stage} id="wilo-lab-stage" aria-label={`Vista demostrativa: ${active.label}`}>
        <div className={styles.stageGlow} aria-hidden="true" />
        <DemoPanel active={activePanel === "dashboard"} className={styles.dashboardPanel} eyebrow={active.key === "admin" ? "ADMIN" : "DASHBOARD"} label={active.key === "admin" ? "Admin" : "Dashboard"} onActivate={() => activatePanel("dashboard")} panelKey="dashboard">
          <OverviewPanel adminMode={active.key === "admin"} />
        </DemoPanel>
        <DemoPanel active={activePanel === "crm"} className={styles.crmPanel} eyebrow="CLIENTES" label="CRM" onActivate={() => activatePanel("crm")} panelKey="crm"><CrmPanel /></DemoPanel>
        <DemoPanel active={activePanel === "quote"} className={styles.quotePanel} eyebrow="PROPUESTAS" label="Cotizador" onActivate={() => activatePanel("quote")} panelKey="quote"><QuotePanel /></DemoPanel>
        <DemoPanel active={activePanel === "tracking"} className={styles.trackingPanel} eyebrow="OPERACIÓN" label="Tracking" onActivate={() => activatePanel("tracking")} panelKey="tracking"><TrackingPanel /></DemoPanel>
        <DemoPanel active={activePanel === "api"} className={styles.apiPanel} eyebrow="INFRAESTRUCTURA" label="API" onActivate={() => activatePanel("api")} panelKey="api"><ApiPanel /></DemoPanel>
      </div>

      <div className={styles.featureRail} aria-label="Principios de Wilo Lab">
        <div><i aria-hidden="true">&lt;/&gt;</i><span><strong>Interfaces reales</strong><small>Herramientas que tu equipo puede usar.</small></span></div>
        <div><i aria-hidden="true">⌘</i><span><strong>Flujos inteligentes</strong><small>Procesos conectados con menos fricción.</small></span></div>
        <div><i aria-hidden="true">◇</i><span><strong>Herramientas a medida</strong><small>Lo que necesita tu operación, sin ruido.</small></span></div>
      </div>
    </div>
  );
}
