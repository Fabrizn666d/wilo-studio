import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ExternalLink } from "lucide-react";
import { requireStaff } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

function list(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch { return []; }
}

export default async function ProjectPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { client: { select: { name: true } }, assignedTo: { select: { name: true, email: true } } },
  });
  if (!project || (user.role === "COMMERCIAL" && project.assignedToId !== user.id)) notFound();
  const services = list(project.services);
  const deliverables = list(project.deliverables);

  return (
    <section className="ad-project-preview">
      <header>
        <Link href="/admin/proyectos"><ArrowLeft size={16} /> Volver a proyectos</Link>
        <span>Vista previa privada · {project.contentStatus}</span>
      </header>
      <div className="ad-preview-hero">
        <div>
          <span>{[project.category, project.client?.name, project.year].filter(Boolean).join(" · ")}</span>
          <h1>{project.title}</h1>
          <p>{project.summary || "Este proyecto todavía no tiene un resumen público."}</p>
          <div>{services.map((service) => <b key={service}>{service}</b>)}</div>
        </div>
        <figure>{project.coverImage ? <Image src={project.coverImage} alt={`Portada de ${project.title}`} fill sizes="(max-width: 800px) 100vw, 48vw" /> : <span>Falta portada</span>}</figure>
      </div>
      <div className="ad-preview-copy">
        <article><span>01</span><h2>El reto</h2><p>{project.challenge || "Pendiente de redactar."}</p></article>
        <article><span>02</span><h2>La solución</h2><p>{project.solution || "Pendiente de redactar."}</p></article>
      </div>
      <div className="ad-preview-deliverables">
        <h2>Entregables</h2>
        <ul>{deliverables.length ? deliverables.map((item) => <li key={item}><Check size={16} /> {item}</li>) : <li>Pendientes de registrar.</li>}</ul>
      </div>
      <footer>
        <span>Responsable: {project.assignedTo?.name || project.assignedTo?.email || "Sin asignar"}</span>
        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Abrir producción <ExternalLink size={15} /></a>}
      </footer>
    </section>
  );
}
