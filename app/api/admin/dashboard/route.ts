import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { requireStaff } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const leadPipeline = ["NEW", "CONTACTED", "MEETING", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const;

export async function GET() {
  try {
    const user = await requireStaff();
    const now = new Date();
    const canSeeCommercial = ["SUPER_ADMIN", "ADMIN", "COMMERCIAL"].includes(user.role);
    const canSeeContent = ["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(user.role);
    const isManagement = ["SUPER_ADMIN", "ADMIN"].includes(user.role);

    const commercial = canSeeCommercial
      ? await Promise.all([
          prisma.lead.count({ where: { status: "NEW", archivedAt: null } }),
          prisma.lead.count({ where: { archivedAt: null, status: { notIn: ["WON", "LOST"] }, nextFollowUpAt: { lte: now } } }),
          prisma.quote.count({ where: { archivedAt: null, status: { in: ["DRAFT", "SENT", "VIEWED"] } } }),
          prisma.quote.aggregate({ where: { archivedAt: null, status: "ACCEPTED" }, _sum: { totalCents: true } }),
          prisma.lead.groupBy({ by: ["status"], where: { archivedAt: null }, _count: { _all: true } }),
          prisma.lead.findMany({
            where: { archivedAt: null },
            select: { id: true, name: true, company: true, status: true, source: true, createdAt: true, nextFollowUpAt: true },
            orderBy: { createdAt: "desc" },
            take: 6,
          }),
        ])
      : null;

    const projectScope = user.role === "COMMERCIAL" ? { assignedToId: user.id } : {};
    const projects = await Promise.all([
      prisma.project.count({ where: { ...projectScope, archivedAt: null, status: "ACTIVE" } }),
      canSeeContent ? prisma.project.count({ where: { archivedAt: null, contentStatus: "DRAFT" } }) : Promise.resolve(0),
      canSeeContent ? prisma.project.count({ where: { archivedAt: null, contentStatus: "REVIEW" } }) : Promise.resolve(0),
      canSeeContent
        ? prisma.project.count({ where: { archivedAt: null, published: true, publicCaseStudy: true, contentStatus: "PUBLISHED" } })
        : Promise.resolve(0),
    ]);

    const recentActivity = isManagement
      ? await prisma.activity.findMany({
          include: { actor: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
          take: 8,
        })
      : [];

    const pipeline: Record<string, number> = Object.fromEntries(leadPipeline.map((status) => [status, 0]));
    commercial?.[4].forEach((item) => {
      if (item.status in pipeline) pipeline[item.status] = item._count._all;
    });

    return NextResponse.json({
      ok: true,
      role: user.role,
      metrics: {
        newLeads: commercial?.[0] ?? null,
        followUpsDue: commercial?.[1] ?? null,
        openQuotes: commercial?.[2] ?? null,
        acceptedQuoteValueCents: commercial?.[3]._sum.totalCents ?? null,
        activeProjects: projects[0],
        draftCases: canSeeContent ? projects[1] : null,
        reviewCases: canSeeContent ? projects[2] : null,
        publishedCases: canSeeContent ? projects[3] : null,
      },
      pipeline: canSeeCommercial ? pipeline : null,
      recentLeads: commercial?.[5] ?? [],
      recentActivity: recentActivity.map((item) => ({
        ...item,
        metadata: (() => { try { return JSON.parse(item.metadata) as unknown; } catch { return {}; } })(),
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
