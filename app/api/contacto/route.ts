import type { NextRequest } from "next/server";
import { POST as createLead } from "@/app/api/leads/route";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return createLead(request);
}
