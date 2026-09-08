"use client";

// Panel privado de administración de la galería (/admin/galeria).
//
// Deliberadamente fuera de la estética de las invitaciones: es una herramienta,
// no una pieza de diseño. No monta ContentProtection, ni banner de demo, ni
// música — vive fuera de app/oliva|playa|tortuga-tropical, así que no hereda
// ninguno de sus layouts.
//
// Acceso: la contraseña se valida en el servidor (POST /api/admin/login, que
// compara con ADMIN_PASSWORD y deja una cookie httpOnly). En el navegador solo
// se guarda una marca en sessionStorage para no volver a pedirla al recargar.

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { designs } from "@/lib/designs";
import { fileExt, formatBytes, kindFromUrl, type MediaKind } from "@/lib/media";

const SESSION_KEY = "admin-galeria-auth";

// globals.css pinta el <body> con el degradado oscuro de las invitaciones y lo
// centra con flex (max 430px). El panel es una herramienta aparte: recupera el
// ancho completo y un fondo claro sin tocar el CSS global.
function AdminBodyStyle() {
  return (
    <style>{`body{background:#f4f6f8;display:block;font-family:${FONT};}`}</style>
  );
}

interface MediaRow {
  id: string;
  url: string;
  uploader_name: string;
  design: string | null;
  created_at: string;
  file_size: number | null;
  file_type: MediaKind | null;
  expires_at: string | null;
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function slug(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // acentos
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "sin-nombre"
  );
}

function fileNameFromUrl(url: string): string {
  return decodeURIComponent(url.split("?")[0].split("/").pop() || "archivo");
}

// ─── Login ───────────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        sessionStorage.setItem(SESSION_KEY, "1");
        onSuccess();
      } else {
        setError(data.error || "Contraseña incorrecta");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={S.loginWrap}>
      <AdminBodyStyle />
      <form onSubmit={submit} style={S.loginCard}>
        <h1 style={S.loginTitle}>Panel de Galería — Admin</h1>
        <label style={S.label} htmlFor="admin-password">
          Contraseña
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          style={S.input}
        />
        {error && <p style={S.error}>{error}</p>}
        <button type="submit" disabled={busy || !password} style={S.primaryBtn}>
          {busy ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [rows, setRows] = useState<MediaRow[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [design, setDesign] = useState("todos");
  const [type, setType] = useState<"todos" | "photo" | "video">("todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [zipping, setZipping] = useState("");
  const [cleaning, setCleaning] = useState(false);
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(0);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });
    // "ahora" se fija al cargar (y no en cada render) para decidir qué venció:
    // leer Date.now() durante el render es impuro y desincroniza el markup.
    setNow(Date.now());
    if (error) {
      setLoadError(error.message);
      setRows([]);
      return;
    }
    setLoadError("");
    setRows((data || []) as MediaRow[]);
  }, []);

  // Carga inicial. load() es async: los setState ocurren después del fetch, no
  // de forma síncrona dentro del efecto.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const all = useMemo(() => rows || [], [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((r) => {
      if (design !== "todos" && (r.design || "oliva") !== design) return false;
      const kind = r.file_type || kindFromUrl(r.url);
      if (type !== "todos" && kind !== type) return false;
      if (q && !(r.uploader_name || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, design, type, search]);

  const totalBytes = all.reduce((s, r) => s + (r.file_size || 0), 0);
  const withoutSize = all.filter((r) => !r.file_size).length;
  const expiredCount = all.filter(
    (r) => r.expires_at && new Date(r.expires_at).getTime() < now
  ).length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) filtered.forEach((r) => next.delete(r.id));
      else filtered.forEach((r) => next.add(r.id));
      return next;
    });

  const downloadZip = async () => {
    const picked = all.filter((r) => selected.has(r.id));
    if (picked.length === 0) return;
    setNotice("");
    setZipping(`0/${picked.length}`);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const failures: string[] = [];
      for (let i = 0; i < picked.length; i++) {
        const row = picked[i];
        setZipping(`${i + 1}/${picked.length}`);
        try {
          const res = await fetch(row.url);
          if (!res.ok) throw new Error(String(res.status));
          const blob = await res.blob();
          const date = row.created_at.slice(0, 10);
          const name = `${slug(row.uploader_name)}_${date}_${fileNameFromUrl(row.url)}`;
          zip.file(name, blob);
        } catch {
          failures.push(fileNameFromUrl(row.url));
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `galeria-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
      setNotice(
        failures.length > 0
          ? `ZIP generado. ${failures.length} archivo(s) no se pudieron descargar: ${failures.join(", ")}`
          : `ZIP generado con ${picked.length} archivo(s).`
      );
    } catch (e) {
      setNotice(`Error al generar el ZIP: ${e instanceof Error ? e.message : "desconocido"}`);
    } finally {
      setZipping("");
    }
  };

  const cleanup = async () => {
    setCleaning(true);
    setNotice("");
    try {
      const res = await fetch("/api/admin/cleanup", { method: "POST" });
      const data = await res.json();
      if (res.status === 401) {
        setNotice("Sesión expirada. Vuelve a ingresar la contraseña.");
        onLogout();
        return;
      }
      const errs: string[] = data.errors || [];
      setNotice(
        `Eliminados: ${data.deleted ?? 0}.` + (errs.length ? ` Errores: ${errs.join(" · ")}` : "")
      );
      setSelected(new Set());
      await load();
    } catch (e) {
      setNotice(`Error al limpiar: ${e instanceof Error ? e.message : "desconocido"}`);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <main style={S.page}>
      <AdminBodyStyle />
      <header style={S.header}>
        <div style={S.headerTop}>
          <h1 style={S.h1}>Panel de Galería — Admin</h1>
          <button
            onClick={onLogout}
            style={{ ...S.ghostBtn, whiteSpace: "nowrap" }}
          >
            Salir
          </button>
        </div>
        <p style={S.stats}>
          {rows === null
            ? "Cargando…"
            : `${all.length} archivo${all.length === 1 ? "" : "s"} · ${formatBytes(totalBytes)} estimados` +
              (withoutSize > 0 ? ` (${withoutSize} sin tamaño registrado)` : "") +
              (expiredCount > 0 ? ` · ${expiredCount} vencido(s)` : "")}
        </p>
        <button onClick={cleanup} disabled={cleaning} style={S.dangerBtn}>
          {cleaning ? "Eliminando…" : "Eliminar archivos vencidos"}
        </button>
      </header>

      <section style={S.filters}>
        <label style={S.filterField}>
          <span style={S.filterLabel}>Diseño</span>
          <select value={design} onChange={(e) => setDesign(e.target.value)} style={S.select}>
            <option value="todos">Todos</option>
            {designs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </label>
        <label style={S.filterField}>
          <span style={S.filterLabel}>Tipo</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            style={S.select}
          >
            <option value="todos">Todos</option>
            <option value="photo">Fotos</option>
            <option value="video">Videos</option>
          </select>
        </label>
        <label style={{ ...S.filterField, flex: "1 1 200px" }}>
          <span style={S.filterLabel}>Invitado</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre…"
            style={S.input}
          />
        </label>
      </section>

      <section style={S.actions}>
        <button onClick={toggleAll} disabled={filtered.length === 0} style={S.ghostBtn}>
          {allFilteredSelected ? "Quitar selección" : "Seleccionar todo"}
        </button>
        <button
          onClick={downloadZip}
          disabled={selected.size === 0 || zipping !== ""}
          style={S.primaryBtn}
        >
          {zipping
            ? `Descargando ${zipping}…`
            : `Descargar seleccionados como ZIP${selected.size ? ` (${selected.size})` : ""}`}
        </button>
        <span style={S.muted}>
          {filtered.length} mostrado{filtered.length === 1 ? "" : "s"} · {selected.size}{" "}
          seleccionado{selected.size === 1 ? "" : "s"}
        </span>
      </section>

      {notice && <p style={S.notice}>{notice}</p>}
      {loadError && <p style={S.error}>No se pudieron cargar los archivos: {loadError}</p>}

      {rows !== null && filtered.length === 0 && !loadError && (
        <p style={S.muted}>No hay archivos que coincidan con los filtros.</p>
      )}

      <section style={S.grid}>
        {filtered.map((row) => {
          const kind = row.file_type || kindFromUrl(row.url);
          const expired = !!row.expires_at && new Date(row.expires_at).getTime() < now;
          const checked = selected.has(row.id);
          return (
            <article
              key={row.id}
              style={{ ...S.card, borderColor: checked ? "#2563eb" : "#d9dee5" }}
            >
              <div style={S.thumbWrap}>
                {kind === "photo" ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={row.url} alt="" loading="lazy" style={S.thumb} />
                ) : (
                  <>
                    <video
                      src={row.url}
                      preload="metadata"
                      muted
                      playsInline
                      style={S.thumb}
                    />
                    <span style={S.playIcon}>▶</span>
                  </>
                )}
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(row.id)}
                  aria-label={`Seleccionar archivo de ${row.uploader_name}`}
                  style={S.checkbox}
                />
                <span style={S.kindTag}>{kind === "photo" ? "FOTO" : "VIDEO"}</span>
              </div>
              <div style={S.cardBody}>
                <strong style={S.cardName} title={row.uploader_name}>
                  {row.uploader_name}
                </strong>
                <span style={S.cardMeta}>
                  {row.design || "oliva"} · .{fileExt(row.url.split("?")[0]) || "?"}
                </span>
                <span style={S.cardMeta}>
                  {row.file_size ? formatBytes(row.file_size) : "tamaño no registrado"}
                </span>
                <span style={S.cardMeta}>Subido: {formatDate(row.created_at)}</span>
                <span style={{ ...S.cardMeta, color: expired ? "#c02626" : "#5b6470" }}>
                  {row.expires_at
                    ? `${expired ? "Venció" : "Vence"}: ${formatDate(row.expires_at)}`
                    : "Sin fecha de expiración"}
                </span>
                <a href={row.url} target="_blank" rel="noopener noreferrer" style={S.link}>
                  Abrir original →
                </a>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function AdminGaleriaPage() {
  // `null` = todavía no sabemos (evita parpadeo y hydration mismatch al leer
  // sessionStorage, que solo existe en el navegador).
  const [authed, setAuthed] = useState<boolean | null>(null);

  // sessionStorage solo existe en el navegador: leerlo durante el render
  // rompería la hidratación, así que se lee al montar.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
  }, []);

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setAuthed(false);
  };

  if (authed === null)
    return (
      <main style={S.page}>
        <AdminBodyStyle />
      </main>
    );
  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />;
  return <AdminPanel onLogout={logout} />;
}

// ─── Estilos (simples, funcionales, responsive) ──────────────────────────────

const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    color: "#1c2430",
    fontFamily: FONT,
    padding: "20px 16px 60px",
    maxWidth: 1200,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  loginWrap: {
    minHeight: "100vh",
    background: "#f4f6f8",
    fontFamily: FONT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loginCard: {
    background: "#fff",
    border: "1px solid #d9dee5",
    borderRadius: 10,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxSizing: "border-box",
  },
  loginTitle: { fontSize: 18, margin: "0 0 10px", color: "#1c2430" },
  header: {
    background: "#fff",
    border: "1px solid #d9dee5",
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },
  headerTop: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" },
  h1: { fontSize: 20, margin: 0 },
  stats: { margin: "8px 0 12px", fontSize: 14, color: "#5b6470" },
  filters: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  filterField: { display: "flex", flexDirection: "column", gap: 4 },
  filterLabel: { fontSize: 12, color: "#5b6470" },
  actions: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 },
  label: { fontSize: 13, color: "#5b6470" },
  input: {
    padding: "8px 10px",
    border: "1px solid #c7ced6",
    borderRadius: 6,
    fontSize: 14,
    fontFamily: FONT,
    background: "#fff",
    color: "#1c2430",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    padding: "8px 10px",
    border: "1px solid #c7ced6",
    borderRadius: 6,
    fontSize: 14,
    fontFamily: FONT,
    background: "#fff",
    color: "#1c2430",
  },
  primaryBtn: {
    appearance: "none",
    border: 0,
    borderRadius: 6,
    background: "#2563eb",
    color: "#fff",
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: 600,
    padding: "9px 16px",
    cursor: "pointer",
  },
  ghostBtn: {
    appearance: "none",
    border: "1px solid #c7ced6",
    borderRadius: 6,
    background: "#fff",
    color: "#1c2430",
    fontFamily: FONT,
    fontSize: 14,
    padding: "8px 14px",
    cursor: "pointer",
  },
  dangerBtn: {
    appearance: "none",
    border: 0,
    borderRadius: 6,
    background: "#c02626",
    color: "#fff",
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: 600,
    padding: "9px 16px",
    cursor: "pointer",
  },
  error: { color: "#c02626", fontSize: 13, margin: "6px 0" },
  notice: {
    background: "#e8f0fe",
    border: "1px solid #b6ccf5",
    borderRadius: 6,
    padding: "10px 12px",
    fontSize: 13.5,
    margin: "0 0 12px",
  },
  muted: { fontSize: 13, color: "#5b6470" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 12,
  },
  card: {
    background: "#fff",
    border: "1px solid #d9dee5",
    borderRadius: 8,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  thumbWrap: { position: "relative", background: "#0c1116", aspectRatio: "1 / 1" },
  thumb: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  playIcon: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 30,
    textShadow: "0 2px 10px rgba(0,0,0,0.6)",
    pointerEvents: "none",
  },
  checkbox: { position: "absolute", top: 8, left: 8, width: 20, height: 20, cursor: "pointer" },
  kindTag: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    fontSize: 10,
    letterSpacing: "0.08em",
    padding: "3px 6px",
    borderRadius: 4,
  },
  cardBody: { padding: 10, display: "flex", flexDirection: "column", gap: 3 },
  cardName: {
    fontSize: 14,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardMeta: { fontSize: 12, color: "#5b6470" },
  link: { fontSize: 12, color: "#2563eb", marginTop: 4 },
};
