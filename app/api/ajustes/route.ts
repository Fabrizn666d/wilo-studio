import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const runtime = "nodejs";

function parseValue(value: string, type: string) {
  if (type !== "json") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({ where: { public: true }, orderBy: { key: "asc" } });
    return NextResponse.json({
      ok: true,
      settings: Object.fromEntries(settings.map((setting) => [setting.key, parseValue(setting.value, setting.type)])),
      site: await getPublicSiteSettings(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
