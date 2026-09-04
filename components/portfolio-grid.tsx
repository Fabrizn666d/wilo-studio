"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { PublicProject } from "@/lib/public-data";

const categories = ["Todos", "Tecnología", "Audiovisual", "Infraestructura", "Education"];

function displayDomain(url?: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function PortfolioGrid({ items }: { items: PublicProject[] }) {
  const [category, setCategory] = useState("Todos");
  const filtered = useMemo(() => category === "Todos" ? items : items.filter((item) => item.category === category), [category, items]);
  return (
    <div className="portfolio-catalog">
      <div className="filter-chips portfolio-filters" role="group" aria-label="Filtrar proyectos por categoría">{categories.map((item) => <button aria-pressed={category === item} key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}<span>{item === "Todos" ? items.length : items.filter((project) => project.category === item).length}</span></button>)}</div>
      {filtered.length ? <div className="portfolio-grid-full">{filtered.map((project, index) => <article className={index % 5 === 0 ? "is-wide" : ""} key={project.slug}><Link href={`/portafolio/${project.slug}`}><div className="portfolio-card-image"><div className="browser-chrome"><span className="browser-dots"><i /><i /><i /></span><span className="browser-url">{displayDomain(project.liveUrl) || "Vista previa"}</span></div><div className="browser-viewport"><Image src={project.image} alt={`${project.title}: ${project.service}`} fill sizes="(max-width: 768px) 100vw, 46vw" /><span className={`project-status status-${project.status.toLowerCase().replaceAll(" ", "-")}`}>{project.status}</span></div></div><div className="portfolio-card-copy"><span>{project.category}</span><h2>{project.title}</h2><p>{project.service}</p><i><ArrowUpRight /></i></div></Link></article>)}</div> : <div className="catalog-empty"><h2>Esta categoría está en preparación.</h2><p>Publicaremos los proyectos cuando el material haya sido validado por el cliente.</p></div>}
    </div>
  );
}
