import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { chromium } from "playwright";

if (!process.env.DATABASE_URL?.includes("wilo-os-qa.db")) {
  throw new Error("Wilo OS QA refuses to run outside the disposable wilo-os-qa.db database.");
}

const prisma = new PrismaClient();
const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:3105";
const runId = `${Date.now()}-${randomBytes(3).toString("hex")}`;
const password = `Qa-${randomBytes(18).toString("base64url")}`;
let checks = 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
  checks += 1;
}

function cookieJar() {
  const cookies = new Map();
  return {
    capture(headers) {
      const values = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [headers.get("set-cookie")].filter(Boolean);
      for (const value of values) {
        const pair = value.split(";", 1)[0];
        const separator = pair.indexOf("=");
        if (separator > 0) cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
      }
    },
    header() { return [...cookies].map(([key, value]) => `${key}=${value}`).join("; "); },
  };
}

async function login(email) {
  const jar = cookieJar();
  const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
  jar.capture(csrfResponse.headers);
  const { csrfToken } = await csrfResponse.json();
  const response = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: jar.header(), Origin: baseUrl },
    body: new URLSearchParams({ csrfToken, email, password, callbackUrl: `${baseUrl}/admin`, json: "true" }),
  });
  jar.capture(response.headers);
  assert(response.status === 200 || response.status === 302, `Login failed for ${email}: ${response.status}`);
  assert(jar.header().includes("session-token"), `No session cookie for ${email}`);
  return jar;
}

async function api(path, { jar, method = "GET", body, origin = baseUrl, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    redirect: "manual",
    headers: {
      ...(jar ? { Cookie: jar.header() } : {}),
      ...(!["GET", "HEAD"].includes(method) ? { Origin: origin } : {}),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

async function publicPage(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  return { response, text: await response.text() };
}

async function browserSmoke(commercialEmail, projectSlug) {
  const bundledChromium = "C:\\Users\\FAbri\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : existsSync(bundledChromium) ? { executablePath: bundledChromium } : {}),
  });
  const browserEmail = `browser.${runId}@example.invalid`;
  const browserName = `QA Browser Lead ${runId}`;
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/contacto`, { waitUntil: "networkidle" });
    await page.locator('input[name="name"]').fill(browserName);
    await page.locator('input[name="company"]').fill("QA Browser Company");
    await page.locator('input[name="phone"]').fill("+51666666666");
    await page.locator('input[name="email"]').fill(browserEmail);
    await page.locator('select[name="service"]').selectOption({ label: "Web o producto digital" });
    await page.locator('textarea[name="message"]').fill("Solicitud creada desde el smoke test real del formulario público.");
    await page.locator('input[name="consent"]').check();
    await page.waitForTimeout(1_100);
    const contactResponsePromise = page.waitForResponse(
      (response) => response.url().endsWith("/api/contacto") && response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    const contactResponse = await contactResponsePromise;
    assert(contactResponse.status() === 201, `browser contact form returned ${contactResponse.status()}: ${await contactResponse.text()}`);
    await page.getByText("Recibimos tu mensaje. Te contactaremos con el siguiente paso.").waitFor({ timeout: 15_000 });

    await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.locator('input[type="email"]').fill(commercialEmail);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole("button", { name: "Entrar al panel" }).click();
    await page.waitForURL(/\/admin(?:\?.*)?$/, { timeout: 15_000 });

    await page.goto(`${baseUrl}/admin/leads?q=${encodeURIComponent(browserEmail)}`, { waitUntil: "domcontentloaded" });
    const row = page.getByRole("row", { name: new RegExp(browserName) });
    await row.waitFor({ timeout: 15_000 });
    await row.getByRole("button", { name: "Editar lead" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.locator('select[name="status"]').selectOption("CONTACTED");
    await dialog.getByRole("button", { name: "Guardar cambios" }).click();
    await page.getByText("lead actualizado correctamente.").waitFor({ timeout: 15_000 });

    const browserLead = await prisma.lead.findFirst({ where: { email: browserEmail }, select: { status: true, source: true, consentAt: true } });
    assert(browserLead?.status === "CONTACTED" && browserLead.source === "STUDIO" && browserLead.consentAt, "browser lead did not complete the public form to CRM workflow");

    const projectResponse = await page.goto(`${baseUrl}/proyectos/${projectSlug}`, { waitUntil: "domcontentloaded" });
    assert(projectResponse?.status() === 200 && (await page.locator("body").innerText()).includes("Caso QA publicado desde Wilo OS"), "browser smoke could not render the published CMS project");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/admin/leads`, { waitUntil: "domcontentloaded" });
    const mobileOverflow = await page.evaluate(() => {
      window.scrollTo(document.documentElement.scrollWidth, 0);
      const rootScroll = window.scrollX;
      window.scrollTo(0, 0);
      const app = document.querySelector(".admin-app");
      return Math.max(rootScroll, app ? app.scrollWidth - app.clientWidth : 0);
    });
    assert(mobileOverflow <= 2, `admin leads overflows mobile viewport by ${mobileOverflow}px`);
    await context.close();
  } finally {
    await browser.close();
  }
}

async function expectStatus(result, status, label) {
  assert(result.response.status === status, `${label}: expected ${status}, received ${result.response.status} (${JSON.stringify(result.payload)})`);
  return result.payload;
}

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);
  const users = Object.fromEntries(await Promise.all(["SUPER_ADMIN", "ADMIN", "COMMERCIAL", "EDITOR"].map(async (role) => {
    const email = `${role.toLowerCase()}.${runId}@example.invalid`;
    const user = await prisma.user.create({ data: { email, name: `QA ${role}`, role, passwordHash, active: true } });
    return [role, user];
  })));

  const sessions = {
    SUPER_ADMIN: await login(users.SUPER_ADMIN.email),
    ADMIN: await login(users.ADMIN.email),
    COMMERCIAL: await login(users.COMMERCIAL.email),
    EDITOR: await login(users.EDITOR.email),
  };

  await expectStatus(await api("/api/admin/leads"), 401, "anonymous admin API");
  await expectStatus(await api("/api/admin/leads", { jar: sessions.ADMIN, method: "POST", origin: "https://attacker.invalid", body: {} }), 403, "cross-origin mutation");
  await expectStatus(await api("/api/admin/leads", { jar: sessions.EDITOR }), 403, "editor commercial isolation");
  await expectStatus(await api("/api/admin/projects", { jar: sessions.EDITOR }), 200, "editor project access");
  await expectStatus(await api("/api/admin/services", { jar: sessions.COMMERCIAL }), 403, "commercial content isolation");
  await expectStatus(await api("/api/admin/users", { jar: sessions.ADMIN }), 403, "admin team isolation");
  await expectStatus(await api("/api/admin/users", { jar: sessions.SUPER_ADMIN }), 200, "super admin team access");

  const clientPayload = await expectStatus(await api("/api/admin/clients", {
    jar: sessions.COMMERCIAL,
    method: "POST",
    body: { slug: `qa-client-${runId}`, name: "QA Client", contactName: "QA Contact", email: `client.${runId}@example.invalid`, phone: "+51999999999", country: "PE", source: "MANUAL", active: true, featured: false, sortOrder: 0, logoUrl: null, website: null, whatsapp: null, taxId: null, city: null, notes: null },
  }), 201, "create client");
  const clientId = clientPayload.data.id;

  const publicLeadPayload = await expectStatus(await api("/api/leads", {
    method: "POST",
    body: { name: "QA Public Lead", email: `public.${runId}@example.invalid`, source: "manual", details: { consent: true, clientElapsedMs: 1500 }, message: "QA integration request" },
  }), 201, "public lead creation");
  const publicLeadId = publicLeadPayload.lead.id;
  const publicLead = await prisma.lead.findUniqueOrThrow({ where: { id: publicLeadId } });
  assert(publicLead.source === "STUDIO" && publicLead.consentAt, "public lead was not normalized or consent was not stored");
  assert(await prisma.activity.count({ where: { entityType: "LEAD", entityId: publicLeadId, action: "LEAD_CREATED" } }) === 1, "public lead activity missing");
  await expectStatus(await api("/api/cotizador", {
    method: "POST",
    body: { name: "QA Quote Wizard", company: "QA", phone: "+51777777777", email: `wizard.${runId}@example.invalid`, projectType: "Landing Page", features: [], message: "QA wizard", consent: false, clientElapsedMs: 1500 },
  }), 422, "quote wizard consent guard");
  const wizardPayload = await expectStatus(await api("/api/cotizador", {
    method: "POST",
    body: { name: "QA Quote Wizard", company: "QA", phone: "+51777777777", email: `wizard.${runId}@example.invalid`, projectType: "Landing Page", features: [], message: "QA wizard", consent: true, clientElapsedMs: 1500 },
  }), 201, "quote wizard lead creation");
  const wizardLead = await prisma.lead.findUniqueOrThrow({ where: { id: wizardPayload.leadId } });
  assert(wizardLead.source === "STUDIO" && wizardLead.consentAt, "quote wizard attribution or consent was not stored");

  const leadPayload = await expectStatus(await api("/api/admin/leads", {
    jar: sessions.COMMERCIAL,
    method: "POST",
    body: { name: "QA Won Lead", company: "QA Won Company", email: `won.${runId}@example.invalid`, phone: "+51888888888", type: "QUOTE", service: "Plataforma", status: "NEW", priority: "HIGH", source: "MANUAL", message: "QA", clientId: null, assignedToId: users.COMMERCIAL.id, budgetRange: null, launchTimeframe: null, estimatedMinCents: null, estimatedMaxCents: null, lastContactAt: null, nextFollowUpAt: null, followUpNote: null, lostReason: null },
  }), 201, "manual lead creation");
  const leadId = leadPayload.data.id;
  const filteredLeads = await expectStatus(await api("/api/admin/leads?service=Plataforma&from=2020-01-01&sort=createdAt&direction=asc", { jar: sessions.COMMERCIAL }), 200, "lead filters and sorting");
  assert(filteredLeads.data.some((lead) => lead.id === leadId), "lead service/date filter omitted the matching lead");
  await expectStatus(await api("/api/admin/leads?sort=passwordHash", { jar: sessions.COMMERCIAL }), 400, "sort allowlist");
  await expectStatus(await api(`/api/admin/leads/${leadId}`, { jar: sessions.COMMERCIAL, method: "PATCH", headers: { "X-Record-Updated-At": leadPayload.data.updatedAt }, body: { status: "CONTACTED" } }), 200, "lead contacted transition");
  const contacted = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
  const wonPayload = await expectStatus(await api(`/api/admin/leads/${leadId}`, { jar: sessions.COMMERCIAL, method: "PATCH", headers: { "X-Record-Updated-At": contacted.updatedAt.toISOString() }, body: { status: "WON" } }), 200, "lead won transition");
  assert(wonPayload.data.status === "WON", "lead did not become won");
  await expectStatus(await api(`/api/admin/leads/${leadId}/convert`, { jar: sessions.COMMERCIAL, method: "POST" }), 200, "lead conversion");
  assert((await prisma.lead.findUniqueOrThrow({ where: { id: leadId } })).clientId, "won lead was not linked to a client");

  await expectStatus(await api("/api/admin/notes", { jar: sessions.COMMERCIAL, method: "POST", body: { entityType: "LEAD", entityId: leadId, body: "QA follow-up note" } }), 201, "lead note");
  const notes = await expectStatus(await api(`/api/admin/notes?entityType=LEAD&entityId=${leadId}`, { jar: sessions.COMMERCIAL }), 200, "lead timeline");
  assert(notes.data.length === 1 && notes.activity.length >= 3, "note or lead timeline missing");

  const quotePayload = await expectStatus(await api("/api/admin/quotes", {
    jar: sessions.COMMERCIAL,
    method: "POST",
    body: { clientId, leadId: null, projectId: null, status: "DRAFT", currency: "PEN", taxRateBps: 1800, issueDate: null, expiresAt: null, notes: "QA quote", items: [{ name: "Diseño", description: "QA", quantity: 2, unitPriceCents: 10000 }, { name: "Desarrollo", description: null, quantity: 1, unitPriceCents: 5000 }] },
  }), 201, "quote creation");
  const quote = quotePayload.data;
  assert(/^WILO-\d{4}-\d{4,}$/.test(quote.number), "quote number format invalid");
  assert(quote.subtotalCents === 25000 && quote.taxCents === 4500 && quote.totalCents === 29500, "authoritative quote totals invalid");
  await expectStatus(await api(`/api/admin/quotes/${quote.id}`, { jar: sessions.COMMERCIAL, method: "PATCH", headers: { "X-Record-Updated-At": quote.updatedAt }, body: { notes: "QA updated" } }), 200, "quote update");
  await expectStatus(await api(`/api/admin/quotes/${quote.id}`, { jar: sessions.COMMERCIAL, method: "PATCH", headers: { "X-Record-Updated-At": quote.updatedAt }, body: { notes: "stale" } }), 409, "quote optimistic conflict");
  let currentQuote = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } });
  await expectStatus(await api(`/api/admin/quotes/${quote.id}`, { jar: sessions.COMMERCIAL, method: "PATCH", headers: { "X-Record-Updated-At": currentQuote.updatedAt.toISOString() }, body: { status: "SENT" } }), 409, "quote delivery guard");
  await expectStatus(await api(`/api/admin/quotes/${quote.id}/send`, { jar: sessions.COMMERCIAL, method: "POST" }), 503, "quote SMTP guard");
  const failedDeliveryQuote = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } });
  assert(failedDeliveryQuote.status === "DRAFT" && failedDeliveryQuote.deliveryStartedAt === null, "failed delivery changed state or retained its delivery lock");
  const quoteSearch = await expectStatus(await api("/api/admin/quotes?q=QA%20Client", { jar: sessions.COMMERCIAL }), 200, "quote search by client");
  assert(quoteSearch.data.some((item) => item.id === quote.id), "quote client relation was not searched");

  currentQuote = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } });
  const concurrentWrites = await Promise.all([
    api(`/api/admin/quotes/${quote.id}`, { jar: sessions.COMMERCIAL, method: "PATCH", headers: { "X-Record-Updated-At": currentQuote.updatedAt.toISOString() }, body: { notes: "concurrent A" } }),
    api(`/api/admin/quotes/${quote.id}`, { jar: sessions.COMMERCIAL, method: "PATCH", headers: { "X-Record-Updated-At": currentQuote.updatedAt.toISOString() }, body: { notes: "concurrent B" } }),
  ]);
  assert(concurrentWrites.map(({ response }) => response.status).sort().join(",") === "200,409", "concurrent quote writes were not resolved with one winner");

  const incompleteProject = { slug: `qa-incomplete-${runId}`, title: "QA Incomplete", category: "Tecnología", clientId, assignedToId: users.EDITOR.id, summary: "Resumen", description: "Descripción", challenge: null, solution: null, services: ["Diseño"], deliverables: [], coverImage: null, videoUrl: null, logoUrl: null, gallery: [], liveUrl: null, stagingUrl: null, repositoryUrl: null, internalNotes: null, year: 2026, status: "ACTIVE", startDate: null, targetDate: null, completedAt: null, publicCaseStudy: true, contentStatus: "PUBLISHED", seoTitle: null, seoDescription: null, featured: false, published: true, sortOrder: 99 };
  await expectStatus(await api("/api/admin/projects", { jar: sessions.EDITOR, method: "POST", body: incompleteProject }), 422, "project publishing checklist");
  const draftPayload = await expectStatus(await api("/api/admin/projects", { jar: sessions.EDITOR, method: "POST", body: { ...incompleteProject, slug: `qa-case-${runId}`, publicCaseStudy: false, contentStatus: "DRAFT", published: false } }), 201, "draft project creation");
  const projectId = draftPayload.data.id;
  const commercialProjectOptions = await expectStatus(await api("/api/admin/options/projects", { jar: sessions.COMMERCIAL }), 200, "commercial project options");
  assert(!commercialProjectOptions.data.some((project) => project.id === projectId), "commercial user saw a project assigned to another role");
  await expectStatus(await api(`/api/admin/archive/projects/${projectId}`, { jar: sessions.ADMIN, method: "POST" }), 200, "project archive");
  const activeProjects = await expectStatus(await api(`/api/admin/projects?q=QA%20Incomplete`, { jar: sessions.ADMIN }), 200, "active project list");
  assert(!activeProjects.data.some((project) => project.id === projectId), "archived project leaked into active list");
  const archivedProjects = await expectStatus(await api(`/api/admin/projects?archived=true`, { jar: sessions.ADMIN }), 200, "archived project list");
  assert(archivedProjects.data.some((project) => project.id === projectId), "archived project missing from archive view");
  await expectStatus(await api(`/api/admin/archive/projects/${projectId}?restore=true`, { jar: sessions.ADMIN, method: "POST" }), 200, "project restore");

  const restoredProject = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  const publishedPayload = await expectStatus(await api(`/api/admin/projects/${projectId}`, {
    jar: sessions.EDITOR,
    method: "PATCH",
    headers: { "X-Record-Updated-At": restoredProject.updatedAt.toISOString() },
    body: {
      summary: "Caso QA publicado desde Wilo OS.",
      description: "Validación integral del puente entre el CMS privado y el portafolio público.",
      challenge: "Comprobar que un borrador nunca aparezca y que la publicación sea atómica.",
      solution: "Aplicar las tres compuertas editoriales, el checklist y la invalidación del contenido público.",
      services: ["Diseño web", "Desarrollo"],
      deliverables: ["Caso de estudio", "Página pública"],
      coverImage: "/brand/portfolio-showcase.webp",
      seoTitle: "Caso QA Wilo OS",
      seoDescription: "Caso temporal para validar la publicación CMS de Wilo OS.",
      publicCaseStudy: true,
      contentStatus: "PUBLISHED",
      published: true,
    },
  }), 200, "complete project publication");
  assert(publishedPayload.data.contentStatus === "PUBLISHED", "project did not reach published state");

  const publicProject = await publicPage(`/proyectos/${publishedPayload.data.slug}`);
  assert(publicProject.response.status === 200 && publicProject.text.includes("Caso QA publicado desde Wilo OS"), "published CMS project is not visible publicly");
  await browserSmoke(users.COMMERCIAL.email, publishedPayload.data.slug);
  const sitemap = await publicPage("/sitemap.xml");
  assert(sitemap.response.status === 200 && sitemap.text.includes(`/proyectos/${publishedPayload.data.slug}`), "published CMS project is missing from sitemap");

  await expectStatus(await api(`/api/admin/archive/projects/${projectId}`, { jar: sessions.ADMIN, method: "POST" }), 200, "published project archive");
  const archivedPublicProject = await publicPage(`/proyectos/${publishedPayload.data.slug}`);
  assert(archivedPublicProject.response.status === 404, "archived CMS project remained publicly reachable");
  const archivedSitemap = await publicPage("/sitemap.xml");
  assert(!archivedSitemap.text.includes(`/proyectos/${publishedPayload.data.slug}`), "archived CMS project remained in sitemap");

  const staticOverride = await expectStatus(await api("/api/admin/projects", {
    jar: sessions.EDITOR,
    method: "POST",
    body: { ...incompleteProject, slug: "tecnova-peru", title: "Tecnova CMS override", publicCaseStudy: false, contentStatus: "DRAFT", published: false },
  }), 201, "code-backed project CMS override");
  assert(staticOverride.data.slug === "tecnova-peru", "static project override was not created");
  const suppressedFallback = await publicPage("/proyectos/tecnova-peru");
  assert(suppressedFallback.response.status === 404, "unpublished CMS override leaked through the code fallback");

  const servicePayload = await expectStatus(await api("/api/admin/services", {
    jar: sessions.EDITOR,
    method: "POST",
    body: { slug: `qa-service-${runId}`, title: "QA Service", category: "TECHNOLOGY", summary: "Servicio temporal de auditoría.", description: null, icon: null, imageUrl: null, priceFromCents: null, currency: "PEN", published: false, sortOrder: 99 },
  }), 201, "audited content creation");
  const serviceId = servicePayload.data.id;
  await expectStatus(await api(`/api/admin/services/${serviceId}`, {
    jar: sessions.EDITOR,
    method: "PATCH",
    headers: { "X-Record-Updated-At": servicePayload.data.updatedAt },
    body: { summary: "Servicio temporal actualizado." },
  }), 200, "audited content update");
  await expectStatus(await api(`/api/admin/services/${serviceId}`, { jar: sessions.ADMIN, method: "DELETE" }), 200, "audited content deletion");
  const serviceActions = await prisma.activity.findMany({ where: { entityType: "SERVICE", entityId: serviceId }, select: { action: true } });
  assert(["SERVICE_CREATED", "SERVICE_UPDATED", "SERVICE_DELETED"].every((action) => serviceActions.some((item) => item.action === action)), "content CRUD audit trail is incomplete");

  const publicClientBeforeArchive = await publicPage("/clientes");
  assert(publicClientBeforeArchive.response.status === 200 && publicClientBeforeArchive.text.includes("QA Client"), "active CMS client was not publicly visible");
  await expectStatus(await api(`/api/admin/archive/clients/${clientId}`, { jar: sessions.ADMIN, method: "POST" }), 200, "client archive");
  const publicClientAfterArchive = await publicPage("/clientes");
  assert(!publicClientAfterArchive.text.includes("QA Client"), "archived client remained publicly visible");

  await prisma.user.update({ where: { id: users.ADMIN.id }, data: { sessionVersion: { increment: 1 } } });
  await expectStatus(await api("/api/admin/dashboard", { jar: sessions.ADMIN }), 401, "session revocation");

  console.log(JSON.stringify({ ok: true, checks, quoteNumber: quote.number, quoteTotalCents: quote.totalCents }));
}

main().finally(() => prisma.$disconnect());
