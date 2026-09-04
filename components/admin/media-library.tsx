"use client";
/* eslint-disable @next/next/no-img-element -- admin previews use arbitrary user-uploaded dimensions */

import { Check, Copy, FileText, ImageIcon, LoaderCircle, Plus, RefreshCw, Search, Trash2, UploadCloud, X } from "lucide-react";
import { ChangeEvent, DragEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";

type MediaRecord = {
  id: string;
  originalName: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  alt?: string | null;
  createdAt: string;
};

type MediaResponse = {
  ok?: boolean;
  data?: MediaRecord[];
  media?: MediaRecord;
  error?: string;
  fields?: Array<{ path: string; message: string }>;
  pagination?: { page: number; total: number; pages: number };
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function mediaResponse(response: Response) {
  const body = (await response.json().catch(() => ({}))) as MediaResponse;
  if (response.status === 401) window.location.assign("/admin/login");
  if (!response.ok || body.ok === false) {
    const details = body.fields?.map((field) => `${field.path}: ${field.message}`).join(" · ");
    throw new Error([body.error || "No se pudo completar la operación.", details].filter(Boolean).join(" "));
  }
  return body;
}

export function MediaLibrary() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<MediaRecord | null>(null);
  const [alt, setAlt] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const notify = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const parameters = new URLSearchParams({ page: String(page), limit: "36" });
      if (query) parameters.set("q", query);
      const body = await mediaResponse(await fetch(`/api/admin/media?${parameters}`, { cache: "no-store" }));
      setFiles(body.data || []);
      setPages(Math.max(1, body.pagination?.pages || 1));
      setTotal(body.pagination?.total || 0);
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "No se pudieron cargar los archivos.");
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => { void load(); }, [load]);

  const upload = async (fileList: FileList | File[]) => {
    const file = Array.from(fileList)[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify("error", "El archivo supera el máximo de 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("alt", file.type.startsWith("image/") ? file.name.replace(/\.[^.]+$/, "") : "");
      await mediaResponse(await fetch("/api/admin/uploads", { method: "POST", body: form }));
      notify("success", "Archivo subido correctamente.");
      setPage(1);
      await load();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "No se pudo subir el archivo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const openDetails = (record: MediaRecord) => {
    setSelected(record);
    setAlt(record.alt || "");
  };

  const saveAlt = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await mediaResponse(await fetch(`/api/admin/media/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alt: alt.trim() || null }) }));
      setFiles((current) => current.map((record) => record.id === selected.id ? { ...record, alt: alt.trim() || null } : record));
      setSelected((current) => current ? { ...current, alt: alt.trim() || null } : null);
      notify("success", "Texto alternativo actualizado.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected || !window.confirm(`¿Eliminar “${selected.originalName}” de la biblioteca?`)) return;
    setSaving(true);
    try {
      await mediaResponse(await fetch(`/api/admin/media/${selected.id}`, { method: "DELETE" }));
      setSelected(null);
      notify("success", "Archivo retirado de la biblioteca.");
      await load();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "No se pudo eliminar.");
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      notify("success", "URL copiada al portapapeles.");
    } catch {
      notify("error", "No se pudo copiar la URL.");
    }
  };

  const onFiles = (event: ChangeEvent<HTMLInputElement>) => event.target.files && void upload(event.target.files);
  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) void upload(event.dataTransfer.files);
  };

  return (
    <section className="ad-resource-page ad-media-page">
      <div className="ad-page-heading">
        <div><span className="ad-eyebrow">Contenido visual</span><h1>Biblioteca de medios</h1><p>Reutiliza imágenes en el sitio y conserva los PDF como documentos.</p></div>
        <button className="ad-primary-button" type="button" onClick={() => inputRef.current?.click()} disabled={uploading}><Plus size={18} /> Subir archivo</button>
      </div>

      <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={onFiles} />
      <button
        className={`ad-upload-zone ${dragging ? "is-dragging" : ""}`}
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={uploading}
      >
        <span>{uploading ? <LoaderCircle className="is-spinning" size={25} /> : <UploadCloud size={25} />}</span>
        <div><strong>{uploading ? "Subiendo archivo…" : "Arrastra una imagen o PDF"}</strong><small>JPG, PNG, WebP o PDF · máximo 5 MB</small></div>
        <b>Seleccionar</b>
      </button>

      <div className="ad-panel ad-media-panel">
        <div className="ad-table-toolbar">
          <form className="ad-search" onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(queryDraft.trim()); }}><Search size={17} /><input value={queryDraft} onChange={(event) => setQueryDraft(event.target.value)} placeholder="Buscar por nombre o texto alternativo…" aria-label="Buscar archivo" />{queryDraft && <button type="button" onClick={() => { setQueryDraft(""); setQuery(""); }}><X size={15} /></button>}</form>
          <div className="ad-media-count"><span>{total} archivos</span><button className="ad-refresh-button" type="button" onClick={() => void load()} aria-label="Actualizar"><RefreshCw size={17} /></button></div>
        </div>
        {loading ? <div className="ad-media-grid">{Array.from({ length: 8 }).map((_, index) => <i className="ad-media-skeleton" key={index} />)}</div> : files.length === 0 ? (
          <div className="ad-empty-state"><div className="ad-empty-mark"><ImageIcon size={25} /></div><h2>No hay archivos</h2><p>Sube el primer recurso para empezar tu biblioteca.</p></div>
        ) : (
          <div className="ad-media-grid">
            {files.map((record) => (
              <article key={record.id} className="ad-media-card">
                <button className="ad-media-preview" type="button" onClick={() => openDetails(record)}>
                  {record.mimeType === "application/pdf" ? <span><FileText size={31} /><small>PDF</small></span> : <img src={record.url} alt={record.alt || ""} loading="lazy" />}
                </button>
                <div><button type="button" onClick={() => openDetails(record)}><strong>{record.originalName}</strong><small>{formatSize(record.sizeBytes)} · {record.mimeType.replace("image/", "").toUpperCase()}</small></button><button type="button" onClick={() => void copyUrl(record.url)} aria-label="Copiar URL" title="Copiar URL"><Copy size={15} /></button></div>
              </article>
            ))}
          </div>
        )}
        {pages > 1 && <div className="ad-pagination"><span>Página {page} de {pages}</span><div><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Anterior</button><button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>Siguiente</button></div></div>}
      </div>

      {selected && (
        <div className="ad-drawer-layer">
          <button className="ad-drawer-backdrop" type="button" onClick={() => setSelected(null)} aria-label="Cerrar" />
          <aside className="ad-drawer ad-media-drawer" role="dialog" aria-modal="true" aria-labelledby="media-title">
            <div className="ad-drawer-head"><div><span>Archivo</span><h2 id="media-title">Detalles del medio</h2></div><button className="ad-icon-button" type="button" onClick={() => setSelected(null)}><X size={20} /></button></div>
            <div className="ad-media-detail-preview">{selected.mimeType === "application/pdf" ? <span><FileText size={50} />Documento PDF</span> : <img src={selected.url} alt={selected.alt || ""} />}</div>
            <form className="ad-media-detail-form" onSubmit={saveAlt}>
              <div className="ad-file-facts"><dl><dt>Nombre</dt><dd>{selected.originalName}</dd></dl><dl><dt>Tamaño</dt><dd>{formatSize(selected.sizeBytes)}</dd></dl><dl className="is-wide"><dt>URL pública</dt><dd><code>{selected.url}</code><button type="button" onClick={() => void copyUrl(selected.url)}><Copy size={14} /> Copiar</button></dd></dl></div>
              <label className="ad-form-field"><span>Texto alternativo</span><textarea rows={4} value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Describe brevemente lo que muestra la imagen" /><small>Ayuda a la accesibilidad y al SEO.</small></label>
              <div className="ad-form-actions"><button className="ad-danger-ghost" type="button" onClick={() => void remove()} disabled={saving}><Trash2 size={16} /> Eliminar</button><button className="ad-primary-button" type="submit" disabled={saving}>{saving ? <LoaderCircle className="is-spinning" size={17} /> : <Check size={17} />} Guardar</button></div>
            </form>
          </aside>
        </div>
      )}
      {message && <div className={`ad-toast is-${message.type}`} role="status">{message.type === "success" ? <Check size={18} /> : <X size={18} />}<span>{message.text}</span><button type="button" onClick={() => setMessage(null)}><X size={15} /></button></div>}
    </section>
  );
}
