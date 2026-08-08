import { NextRequest, NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

type Lead = {
  id: string;
  nombre: string;
  correo: string;
  tipo_solicitud: "consultoria" | "cotizacion";
  servicio_interes: string | null;
  fecha_creacion: string;
};

const dataDir = path.join(process.cwd(), "data");
const leadsFile = path.join(dataDir, "leads.json");

async function readLeads(): Promise<Lead[]> {
  try {
    const content = await readFile(leadsFile, "utf8");
    return JSON.parse(content) as Lead[];
  } catch {
    return [];
  }
}

async function writeLeads(leads: Lead[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(leadsFile, JSON.stringify(leads, null, 2), "utf8");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const nombre = String(body.nombre || "").trim();
  const correo = String(body.correo || "").trim();
  const tipo = body.tipo_solicitud === "cotizacion" ? "cotizacion" : "consultoria";
  const servicio = body.servicio_interes ? String(body.servicio_interes).trim() : null;

  if (!nombre || !correo) {
    return NextResponse.json({ error: "Nombre y correo son obligatorios." }, { status: 400 });
  }

  const leads = await readLeads();
  const lead: Lead = {
    id: crypto.randomUUID(),
    nombre,
    correo,
    tipo_solicitud: tipo,
    servicio_interes: servicio,
    fecha_creacion: new Date().toISOString(),
  };

  leads.unshift(lead);
  await writeLeads(leads);

  return NextResponse.json({ ok: true, lead });
}
