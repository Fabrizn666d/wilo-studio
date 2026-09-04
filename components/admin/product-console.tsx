"use client";

import { ArrowLeft, ArrowRight, Check, KeyRound, Layers3, LoaderCircle, PackageSearch, Plus, RefreshCw, ShieldCheck, Trash2, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAdminSession } from "./admin-shell";
import { ResourceManager } from "./resource-manager";

type Product = { id: string; name: string; sku?: string | null; digital: boolean };
type License = {
  id: string;
  productId: string;
  status: string;
  orderItemId?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  product: Product;
};

type Pagination = { page: number; limit: number; total: number; pages: number };

async function readApi<T>(responseRequest: Response | Promise<Response>): Promise<T & { ok?: boolean; error?: string; fields?: Array<{ path: string; message: string }> }> {
  const response = await responseRequest;
  const body = (await response.json().catch(() => ({}))) as T & { ok?: boolean; error?: string; fields?: Array<{ path: string; message: string }> };
  if (response.status === 401) window.location.assign("/admin/login");
  if (!response.ok || body.ok === false) {
    const details = body.fields?.map((field) => `${field.path}: ${field.message}`).join(" · ");
    throw new Error([body.error || "No se pudo completar la operación.", details].filter(Boolean).join(" "));
  }
  return body;
}

function LicenseInventory() {
  const user = useAdminSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [keyProductId, setKeyProductId] = useState("");
  const [filterProductId, setFilterProductId] = useState("");
  const [status, setStatus] = useState("");
  const [licenses, setLicenses] = useState<License[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, pages: 1 });
  const [metrics, setMetrics] = useState({ available: 0, assigned: 0, delivered: 0 });
  const [keys, setKeys] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const notify = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4200);
  };

  const loadProducts = useCallback(async () => {
    const first = await readApi<{ data?: Product[]; pagination?: Pagination }>(await fetch("/api/admin/products?limit=100&page=1", { cache: "no-store" }));
    const pageCount = Math.max(1, first.pagination?.pages || 1);
    const remaining = pageCount > 1
      ? await Promise.all(Array.from({ length: pageCount - 1 }, (_, index) => readApi<{ data?: Product[] }>(fetch(`/api/admin/products?limit=100&page=${index + 2}`, { cache: "no-store" }))))
      : [];
    const allProducts = [...(first.data || []), ...remaining.flatMap((result) => result.data || [])];
    setProducts(allProducts.filter((product) => product.digital));
  }, []);

  const loadLicenses = useCallback(async () => {
    if (user?.role !== "ADMIN") return;
    setLoading(true);
    try {
      const parameters = new URLSearchParams({ limit: "25", page: String(page) });
      if (filterProductId) parameters.set("productId", filterProductId);
      if (status) parameters.set("status", status);
      const countRequest = (licenseStatus: string) => {
        const countParameters = new URLSearchParams({ limit: "1", page: "1", status: licenseStatus });
        if (filterProductId) countParameters.set("productId", filterProductId);
        return readApi<{ pagination?: Pagination }>(fetch(`/api/admin/license-keys?${countParameters}`, { cache: "no-store" }));
      };
      const [body, available, assigned, delivered] = await Promise.all([
        readApi<{ data?: License[]; pagination?: Pagination }>(fetch(`/api/admin/license-keys?${parameters}`, { cache: "no-store" })),
        countRequest("AVAILABLE"),
        countRequest("ASSIGNED"),
        countRequest("DELIVERED"),
      ]);
      setLicenses(body.data || []);
      setPagination(body.pagination || { page, limit: 25, total: 0, pages: 1 });
      setMetrics({
        available: available.pagination?.total || 0,
        assigned: assigned.pagination?.total || 0,
        delivered: delivered.pagination?.total || 0,
      });
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  }, [filterProductId, page, status, user?.role]);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    void loadProducts().catch((error) => notify("error", error instanceof Error ? error.message : "No se pudieron cargar los productos."));
  }, [loadProducts, user?.role]);
  useEffect(() => { void loadLicenses(); }, [loadLicenses]);

  if (user?.role !== "ADMIN") {
    return <section className="ad-access-denied"><span><ShieldCheck size={27} /></span><h1>Inventario protegido</h1><p>Solo un Administrador puede cargar o retirar claves de licencia.</p></section>;
  }

  const addKeys = async (event: FormEvent) => {
    event.preventDefault();
    const parsedKeys = keys.split("\n").map((key) => key.trim()).filter(Boolean);
    if (!keyProductId || parsedKeys.length === 0) {
      notify("error", "Selecciona un producto e ingresa al menos una clave.");
      return;
    }
    setSaving(true);
    try {
      const body = await readApi<{ created?: number }>(await fetch("/api/admin/license-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: keyProductId, keys: parsedKeys }) }));
      setKeys("");
      notify("success", `${body.created || parsedKeys.length} claves añadidas de forma segura.`);
      await loadLicenses();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "No se pudieron añadir las claves.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (license: License) => {
    if (!window.confirm("¿Retirar esta clave disponible del inventario?")) return;
    try {
      await readApi(await fetch(`/api/admin/license-keys/${license.id}`, { method: "DELETE" }));
      notify("success", "Clave retirada del inventario.");
      if (licenses.length === 1 && page > 1) setPage((current) => current - 1);
      else await loadLicenses();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "No se pudo retirar la clave.");
    }
  };

  return (
    <section className="ad-license-page">
      <div className="ad-page-heading"><div><span className="ad-eyebrow">Entrega digital</span><h1>Claves de licencia</h1><p>Las claves se almacenan cifradas y nunca vuelven a mostrarse en el panel.</p></div></div>
      <div className="ad-license-layout">
        <form className="ad-panel ad-key-form" onSubmit={addKeys}>
          <div className="ad-panel-heading"><div><span>Inventario seguro</span><h2>Añadir claves</h2></div><span className="ad-key-icon"><KeyRound size={20} /></span></div>
          <label className="ad-form-field"><span>Producto</span><select required value={keyProductId} onChange={(event) => setKeyProductId(event.target.value)}><option value="">Selecciona un producto digital</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}{product.sku ? ` · ${product.sku}` : ""}</option>)}</select></label>
          <label className="ad-form-field"><span>Claves</span><textarea required rows={10} value={keys} onChange={(event) => setKeys(event.target.value)} placeholder={"XXXXX-XXXXX-XXXXX\nYYYYY-YYYYY-YYYYY"} autoComplete="off" spellCheck={false} /><small>Una clave por línea. Máximo 100 por carga.</small></label>
          <div className="ad-security-note"><ShieldCheck size={18} /><span>El servidor cifra cada clave antes de almacenarla. El panel solo conserva el estado y la referencia.</span></div>
          <button className="ad-primary-button" type="submit" disabled={saving}>{saving ? <LoaderCircle className="is-spinning" size={18} /> : <Plus size={18} />}{saving ? "Protegiendo claves…" : "Añadir al inventario"}</button>
        </form>

        <div className="ad-license-content">
          <div className="ad-license-stats">
            <article><span className="is-available"><Check size={18} /></span><div><strong>{metrics.available}</strong><small>Disponibles</small></div></article>
            <article><span className="is-assigned"><KeyRound size={18} /></span><div><strong>{metrics.assigned}</strong><small>Asignadas</small></div></article>
            <article><span className="is-delivered"><ShieldCheck size={18} /></span><div><strong>{metrics.delivered}</strong><small>Entregadas</small></div></article>
          </div>
          <div className="ad-panel ad-license-list-panel">
            <div className="ad-license-toolbar"><div><select value={filterProductId} onChange={(event) => { setFilterProductId(event.target.value); setPage(1); }}><option value="">Todos los productos digitales</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Todos los estados</option><option value="AVAILABLE">Disponibles</option><option value="ASSIGNED">Asignadas</option><option value="DELIVERED">Entregadas</option></select></div><button className="ad-refresh-button" type="button" onClick={() => void loadLicenses()}><RefreshCw size={17} /></button></div>
            {loading ? <div className="ad-table-loading"><span /><span /><span /><span /></div> : licenses.length === 0 ? <div className="ad-empty-state is-compact"><div className="ad-empty-mark"><KeyRound size={22} /></div><h2>Sin claves en esta vista</h2><p>Añade claves o cambia los filtros.</p></div> : <div className="ad-key-list">{licenses.map((license) => <article key={license.id}><span className={`ad-key-state state-${license.status.toLowerCase()}`}><i />{license.status === "AVAILABLE" ? "Disponible" : license.status === "ASSIGNED" ? "Asignada" : "Entregada"}</span><div><strong>{license.product.name}</strong><small>Huella segura · {new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeZone: "America/Lima" }).format(new Date(license.createdAt))}</small></div>{license.status === "AVAILABLE" ? <button type="button" onClick={() => void remove(license)} aria-label="Eliminar clave"><Trash2 size={16} /></button> : <span className="ad-key-lock"><ShieldCheck size={15} /></span>}</article>)}</div>}
            {pagination.pages > 1 && <div className="ad-pagination"><span>{pagination.total} claves · página {page} de {pagination.pages}</span><div><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ArrowLeft size={15} /> Anterior</button><button type="button" disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)}>Siguiente <ArrowRight size={15} /></button></div></div>}
          </div>
        </div>
      </div>
      {message && <div className={`ad-toast is-${message.type}`} role="status">{message.type === "success" ? <Check size={18} /> : <X size={18} />}<span>{message.text}</span><button type="button" onClick={() => setMessage(null)}><X size={15} /></button></div>}
    </section>
  );
}

export function ProductConsole() {
  const [tab, setTab] = useState<"products" | "categories" | "licenses">("products");
  return (
    <div className="ad-product-console">
      <div className="ad-segmented" role="tablist" aria-label="Gestión del catálogo">
        <button type="button" role="tab" aria-selected={tab === "products"} className={tab === "products" ? "is-active" : ""} onClick={() => setTab("products")}><PackageSearch size={17} /> Productos</button>
        <button type="button" role="tab" aria-selected={tab === "categories"} className={tab === "categories" ? "is-active" : ""} onClick={() => setTab("categories")}><Layers3 size={17} /> Categorías</button>
        <button type="button" role="tab" aria-selected={tab === "licenses"} className={tab === "licenses" ? "is-active" : ""} onClick={() => setTab("licenses")}><KeyRound size={17} /> Licencias</button>
      </div>
      {tab === "products" ? <ResourceManager configKey="products" /> : tab === "categories" ? <ResourceManager configKey="productCategories" /> : <LicenseInventory />}
    </div>
  );
}
