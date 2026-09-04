"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LoaderCircle, MessageSquarePlus, Send } from "lucide-react";

type Note = {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string | null; email: string };
};

type Activity = {
  id: string;
  action: string;
  createdAt: string;
  actor: { name: string | null; email: string } | null;
};

export function RecordNotes({ entityType, entityId }: { entityType: "LEAD" | "CLIENT" | "PROJECT" | "QUOTE"; entityId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const parameters = new URLSearchParams({ entityType, entityId });
      const response = await fetch(`/api/admin/notes?${parameters}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as { data?: Note[]; activity?: Activity[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudieron cargar las notas.");
      setNotes(payload.data || []);
      setActivity(payload.activity || []);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las notas.");
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  useEffect(() => { void load(); }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, body }),
      });
      const payload = (await response.json().catch(() => ({}))) as { data?: Note; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error || "No se pudo guardar la nota.");
      setNotes((current) => [payload.data!, ...current]);
      setBody("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar la nota.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="ad-record-notes" aria-labelledby={`notes-${entityId}`}>
      <div className="ad-record-notes-heading"><MessageSquarePlus size={17} /><h3 id={`notes-${entityId}`}>Notas del equipo</h3></div>
      <form onSubmit={submit}>
        <label htmlFor={`note-body-${entityId}`} className="sr-only">Nueva nota</label>
        <textarea id={`note-body-${entityId}`} value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} rows={3} placeholder="Registra contexto, acuerdos o el siguiente paso…" />
        <button type="submit" disabled={saving || !body.trim()}>{saving ? <LoaderCircle className="is-spinning" size={15} /> : <Send size={15} />} Guardar nota</button>
      </form>
      {error && <p className="ad-notes-error">{error}</p>}
      {loading ? <div className="ad-notes-loading"><LoaderCircle className="is-spinning" size={17} /> Cargando notas…</div> : (
        <>
          <div className="ad-notes-list">
            {notes.map((note) => <article key={note.id}><p>{note.body}</p><small>{note.author.name || note.author.email} · {new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" }).format(new Date(note.createdAt))}</small></article>)}
            {!notes.length && <p className="ad-notes-empty">Aún no hay notas para este registro.</p>}
          </div>
          {activity.length > 0 && <div className="ad-record-timeline"><strong>Historial</strong>{activity.slice(0, 8).map((item) => <span key={item.id}><i /> <b>{item.action.replaceAll("_", " ")}</b><small>{item.actor?.name || item.actor?.email || "Sistema"} · {new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short", timeZone: "America/Lima" }).format(new Date(item.createdAt))}</small></span>)}</div>}
        </>
      )}
    </section>
  );
}
