"use client";

import { renderLocal } from "@/lib/render-local";
import NextLink from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Code01,
  Copy01,
  Download01,
  FileCode01,
  Globe01,
  Image01,
  Link01,
  Mail01,
  Plus,
  SearchMd,
  Trash01,
  Upload01,
  XClose,
} from "@untitledui/icons";
import { STAGES, daysLeft, headersFor, sendOnFor, type Stage } from "@templates/_shared/dates";
import { ACCENTS, MAX_ENDPOINTS, draftFor, noticeFrom, type Draft } from "@/lib/draft";
import { readSpec, type Spec } from "@/lib/spec";
import { Wordmark } from "./Logo";

type Tab = "email" | "page" | "card" | "headers";
type Diagnostic = { severity: string; code: string; message: string; path?: string };
type Preview = { html?: string; text?: string; png?: string; diagnostics: Diagnostic[]; error?: string };

const SAMPLES = [
  { label: "Larkpay", note: "sample spec · 3 deprecated", url: "/samples/larkpay.openapi.yaml" },
  {
    label: "GitHub REST API",
    note: "real spec · 14 MB · 38 deprecated",
    url: "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json",
  },
];
const STAGE_LABEL: Record<Stage, string> = { announce: "Announce", reminder: "30-day reminder", final: "Final week", retired: "Retired" };
const STORE = "sundown:v1";

const longDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function Studio() {
  const [spec, setSpec] = useState<Spec | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("email");
  const [preview, setPreview] = useState<Preview>({ diagnostics: [] });
  const [rendering, setRendering] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const ops = useMemo(() => new Map(spec?.operations.map((o) => [o.key, o]) ?? []), [spec]);
  const notice = useMemo(() => (draft && spec ? noticeFrom(draft, ops) : null), [draft, spec, ops]);
  const headers = useMemo(() => (notice ? headersFor(notice) : []), [notice]);

  /* ---------- loading a spec ---------- */

  async function load(source: string, text?: string, keep?: Draft) {
    setLoading(source);
    setLoadError(null);
    try {
      const body: string = text ?? (await fetch(source).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`${r.status} ${r.statusText}`)))));
      const next = readSpec(body, source);
      setSpec(next);
      setDraft(keep && keep.selected.every((k) => next.operations.some((o) => o.key === k)) ? keep : draftFor(next));
      setShowAll(!next.operations.some((o) => o.deprecated));
      try {
        localStorage.setItem(STORE, JSON.stringify({ source, text: text && text.length < 2_000_000 ? text : undefined }));
      } catch {}
    } catch (e) {
      setLoadError(`${source}: ${(e as Error).message}`);
    } finally {
      setLoading(null);
    }
  }

  // Come back to where you were: the spec's source and the draft.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "null");
      const savedDraft = JSON.parse(localStorage.getItem(`${STORE}:draft`) ?? "null");
      if (saved?.source) void load(saved.source, saved.text, savedDraft ?? undefined);
    } catch {}
  }, []);
  useEffect(() => {
    if (!draft) return;
    try {
      localStorage.setItem(`${STORE}:draft`, JSON.stringify(draft));
    } catch {}
  }, [draft]);

  /* ---------- rendering with Hyper Elements (server route) ---------- */

  const seq = useRef(0);
  useEffect(() => {
    if (!notice || tab === "headers") return;
    const id = ++seq.current;
    const timer = setTimeout(async () => {
      setRendering(true);
      try {
        const res = await renderLocal({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ output: tab, notice }) });
        if (id !== seq.current) return;
        if (res.headers.get("Content-Type")?.startsWith("image/png")) {
          const blob = await res.blob();
          const diagnostics = JSON.parse(decodeURIComponent(res.headers.get("X-Diagnostics") ?? "%5B%5D"));
          setPreview((prev) => {
            if (prev.png) URL.revokeObjectURL(prev.png);
            return { png: URL.createObjectURL(blob), diagnostics };
          });
        } else {
          const json = await res.json();
          setPreview((prev) => ({ ...(res.ok ? { html: json.html, text: json.text } : { html: prev.html, png: prev.png }), diagnostics: json.diagnostics ?? [], error: json.error }));
        }
      } catch (e) {
        if (id === seq.current) setPreview((p) => ({ ...p, error: (e as Error).message }));
      } finally {
        if (id === seq.current) setRendering(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [notice, tab]);

  useEffect(() => setPreview({ diagnostics: [] }), [tab]);

  /* ---------- helpers ---------- */

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));
  const toggle = (key: string) =>
    setDraft((d) => {
      if (!d) return d;
      if (d.selected.includes(key)) return { ...d, selected: d.selected.filter((k) => k !== key) };
      return d.selected.length >= MAX_ENDPOINTS ? d : { ...d, selected: [...d.selected, key] };
    });

  const save = (name: string, data: BlobPart, type: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const exportOutput = async (output: "email" | "page" | "card", as?: "text") => {
    const res = await renderLocal({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ output, notice }) });
    if (!res.ok) return setTab(output);
    const slug = `${draft!.apiName}-${draft!.stage}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (output === "card") return save(`${slug}-card.png`, await res.blob(), "image/png");
    const json = await res.json();
    if (as === "text") return save(`${slug}-email.txt`, json.text, "text/plain");
    save(`${slug}-${output === "email" ? "email" : "migration-guide"}.html`, json.html, "text/html");
  };
  const copy = async (what: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 1400);
  };

  const errors = preview.diagnostics.filter((d) => d.severity === "error");
  const localIssues = draft
    ? [
        ...(draft.sunsetOn <= draft.deprecatedOn ? ["The sunset has to come after the deprecation date."] : []),
        ...(draft.selected.length === 0 ? ["Pick at least one endpoint on the left."] : []),
      ]
    : [];
  const issues = [...localIssues, ...errors.map((d) => `${d.path ? `${d.path.replace(/^values\./, "")}: ` : ""}${d.message}`)];

  /* ---------- empty state: load a spec ---------- */

  if (!spec || !draft || !notice) {
    return <Loader loading={loading} error={loadError} onLoad={load} />;
  }

  const visible = spec.operations
    .filter((o) => showAll || o.deprecated || draft.selected.includes(o.key))
    .filter((o) => !query || `${o.key} ${o.summary}`.toLowerCase().includes(query.toLowerCase()));
  const deprecatedCount = spec.operations.filter((o) => o.deprecated).length;
  const subject = preview.html?.match(/<title>([^<]*)<\/title>/)?.[1]?.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'");

  return (
    <div className="h-dvh flex flex-col bg-canvas text-ink">
      {/* Top bar */}
      <header className="h-14 shrink-0 border-b border-line bg-paper flex items-center gap-4 px-4">
        <NextLink href="/" className="shrink-0">
          <Wordmark />
        </NextLink>
        <div className="h-6 w-px bg-line" />
        <button onClick={() => setSpec(null)} className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-canvas min-w-0" title="Load another spec">
          <FileCode01 size={16} className="text-muted shrink-0" />
          <span className="truncate text-[13.5px] font-semibold">{spec.title}</span>
          {spec.version ? <span className="font-mono text-[11.5px] text-muted shrink-0">v{spec.version}</span> : null}
          <span className="text-[12px] text-faint group-hover:text-accent shrink-0">Change</span>
        </button>
        <div className="flex-1" />
        <div className="flex items-center rounded-full border border-line-strong bg-canvas p-0.5" role="tablist" aria-label="Which send">
          {STAGES.map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={draft.stage === s}
              onClick={() => set("stage", s)}
              className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${draft.stage === s ? "bg-paper text-ink shadow-[0_1px_2px_rgb(14_17_22/0.12)]" : "text-muted hover:text-ink"}`}
            >
              {STAGE_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <ExportMenu
          onEmail={() => exportOutput("email")}
          onText={() => exportOutput("email", "text")}
          onPage={() => exportOutput("page")}
          onCard={() => exportOutput("card")}
          onJson={() => save(`${draft.apiName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.notice.json`, JSON.stringify(notice, null, 2), "application/json")}
        />
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-[300px_380px_1fr]">
        {/* Endpoints */}
        <aside className="min-h-0 flex flex-col border-r border-line bg-paper">
          <div className="p-4 pb-3 space-y-3 border-b border-line">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[13.5px] font-bold">Endpoints</h2>
              <span className="font-mono text-[11.5px] text-muted">
                {draft.selected.length}/{MAX_ENDPOINTS} picked
              </span>
            </div>
            <div className="relative">
              <SearchMd size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search path or summary" className="field pl-8" />
            </div>
            <div className="flex gap-1.5 text-[12px] font-semibold">
              <Chip on={!showAll} onClick={() => setShowAll(false)}>
                Deprecated · {deprecatedCount}
              </Chip>
              <Chip on={showAll} onClick={() => setShowAll(true)}>
                All · {spec.operations.length.toLocaleString("en")}
              </Chip>
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto scroll-thin py-1">
            {visible.slice(0, 300).map((o) => {
              const on = draft.selected.includes(o.key);
              return (
                <li key={o.key}>
                  <button
                    onClick={() => toggle(o.key)}
                    className={`w-full text-left px-4 py-2.5 flex gap-2.5 items-start border-l-2 transition-colors ${on ? "border-accent bg-accent-soft" : "border-transparent hover:bg-canvas"}`}
                  >
                    <span className={`mt-0.5 size-4 shrink-0 rounded border grid place-items-center ${on ? "bg-accent border-accent text-white" : "border-line-strong bg-paper"}`}>
                      {on ? <CheckIcon /> : null}
                    </span>
                    <span className="min-w-0 space-y-1">
                      <span className="flex items-center gap-1.5">
                        <span className={`method m-${o.method}`}>{o.method}</span>
                        {o.deprecated ? <span className="text-[10.5px] font-mono uppercase tracking-wider text-accent-ink">deprecated</span> : null}
                      </span>
                      <span className="block font-mono text-[12px] leading-snug break-all">{o.path}</span>
                      {o.summary ? <span className="block text-[12px] text-muted leading-snug truncate">{o.summary}</span> : null}
                    </span>
                  </button>
                </li>
              );
            })}
            {visible.length > 300 ? <li className="px-4 py-3 text-[12px] text-muted">{visible.length - 300} more. Search to narrow them down.</li> : null}
            {visible.length === 0 ? <li className="px-4 py-6 text-[12.5px] text-muted">Nothing matches.</li> : null}
          </ul>
        </aside>

        {/* Notice */}
        <section className="min-h-0 overflow-y-auto scroll-thin border-r border-line bg-paper">
          <Group title="The API">
            <Field label="API name">
              <input className="field" value={draft.apiName} onChange={(e) => set("apiName", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Signed by">
                <input className="field" value={draft.team} onChange={(e) => set("team", e.target.value)} />
              </Field>
              <Field label="Reply-to email">
                <input className="field" value={draft.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
              </Field>
            </div>
            <Field label="Brand colour">
              <div className="flex items-center gap-2">
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => set("accent", c)}
                    aria-label={c}
                    className={`size-6 rounded-full ring-offset-2 ring-offset-paper transition ${draft.accent.toLowerCase() === c.toLowerCase() ? "ring-2 ring-ink" : "hover:ring-2 hover:ring-line-strong"}`}
                    style={{ background: c }}
                  />
                ))}
                <input className="field field-mono w-24 ml-auto" value={draft.accent} onChange={(e) => set("accent", e.target.value)} aria-label="Hex colour" />
              </div>
            </Field>
          </Group>

          <Group title="Dates">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Deprecated on">
                <input type="date" className="field field-mono" value={draft.deprecatedOn} onChange={(e) => set("deprecatedOn", e.target.value)} />
              </Field>
              <Field label="Sunset on">
                <input type="date" className="field field-mono" value={draft.sunsetOn} onChange={(e) => set("sunsetOn", e.target.value)} />
              </Field>
            </div>
            <Timeline draft={draft} />
            <Field label="Migration guide URL">
              <input className="field field-mono" value={draft.guideUrl} onChange={(e) => set("guideUrl", e.target.value)} />
            </Field>
          </Group>

          <Group title="Use instead" hint="What replaces each endpoint. Leave it empty if nothing does.">
            {draft.selected.length === 0 ? <p className="text-[12.5px] text-muted">Pick endpoints on the left.</p> : null}
            {draft.selected.map((k) => {
              const o = ops.get(k);
              if (!o) return null;
              return (
                <div key={k} className="rounded-lg border border-line p-2.5 space-y-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`method m-${o.method}`}>{o.method}</span>
                    <span className="font-mono text-[12px] truncate">{o.path}</span>
                    <button onClick={() => toggle(k)} className="ml-auto text-faint hover:text-ink" aria-label={`Remove ${k}`}>
                      <XClose size={14} />
                    </button>
                  </div>
                  <input
                    className="field field-mono"
                    placeholder="POST /v2/payments"
                    value={draft.replacements[k] ?? ""}
                    onChange={(e) => set("replacements", { ...draft.replacements, [k]: e.target.value })}
                  />
                </div>
              );
            })}
          </Group>

          <Group title="Why" hint="One or two plain sentences. People forgive a change they understand.">
            <textarea className="field min-h-20 leading-relaxed" value={draft.reason} onChange={(e) => set("reason", e.target.value)} />
          </Group>

          <Group title="How to move">
            {draft.steps.map((s, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="font-mono text-[11.5px] text-muted pt-2 w-4">{i + 1}</span>
                <textarea
                  rows={2}
                  className="field leading-snug"
                  value={s}
                  onChange={(e) => set("steps", draft.steps.map((x, j) => (j === i ? e.target.value : x)))}
                />
                <button onClick={() => set("steps", draft.steps.filter((_, j) => j !== i))} className="pt-2 text-faint hover:text-ink" aria-label={`Remove step ${i + 1}`}>
                  <Trash01 size={15} />
                </button>
              </div>
            ))}
            {draft.steps.length < 6 ? (
              <button onClick={() => set("steps", [...draft.steps, ""])} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-accent hover:text-accent-ink">
                <Plus size={15} /> Add a step
              </button>
            ) : null}
            <Field label="Code before">
              <textarea spellCheck={false} className="field field-mono min-h-20 leading-relaxed" value={draft.before} onChange={(e) => set("before", e.target.value)} />
            </Field>
            <Field label="Code after">
              <textarea spellCheck={false} className="field field-mono min-h-24 leading-relaxed" value={draft.after} onChange={(e) => set("after", e.target.value)} />
            </Field>
          </Group>
        </section>

        {/* Preview */}
        <main className="min-h-0 flex flex-col">
          <div className="h-12 shrink-0 flex items-center gap-1 px-4 border-b border-line bg-paper">
            <TabButton on={tab === "email"} onClick={() => setTab("email")} icon={<Mail01 size={15} />}>
              Email
            </TabButton>
            <TabButton on={tab === "page"} onClick={() => setTab("page")} icon={<Globe01 size={15} />}>
              Migration guide
            </TabButton>
            <TabButton on={tab === "card"} onClick={() => setTab("card")} icon={<Image01 size={15} />}>
              Changelog card
            </TabButton>
            <TabButton on={tab === "headers"} onClick={() => setTab("headers")} icon={<Code01 size={15} />}>
              Headers
            </TabButton>
            <div className="flex-1" />
            <Checks issues={issues} rendering={rendering} />
          </div>

          <div className="flex-1 min-h-0 overflow-auto dots scroll-thin p-6">
            {tab === "headers" ? (
              <HeadersView headers={headers} copied={copied === "headers"} onCopy={() => copy("headers", headers.join("\n"))} />
            ) : tab === "card" ? (
              <div className="max-w-[920px] mx-auto">
                {preview.png ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview.png} alt="The changelog card" className="w-full rounded-xl border border-line shadow-[0_12px_32px_-12px_rgb(14_17_22/0.25)] bg-paper" />
                ) : (
                  <Placeholder ratio="1200 / 630" />
                )}
                <p className="mt-3 text-[12px] text-muted font-mono">1200 × 630 PNG · drawn by Hyper Elements renderImage()</p>
              </div>
            ) : tab === "email" ? (
              <Window
                bar={
                  <div className="space-y-0.5 text-[12.5px]">
                    <div className="flex gap-2">
                      <span className="text-muted w-14">From</span>
                      <span className="font-semibold">{draft.team}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted w-14">Subject</span>
                      <span className="font-semibold truncate">{subject ?? "…"}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted w-14">Send on</span>
                      <span className="font-mono">{longDate(sendOnFor(draft.stage, draft.deprecatedOn, draft.sunsetOn))}</span>
                    </div>
                  </div>
                }
                html={preview.html}
                width={680}
              />
            ) : (
              <Window
                bar={
                  <div className="flex items-center gap-2">
                    <span className="flex gap-1.5">
                      <i className="size-2.5 rounded-full bg-line-strong" />
                      <i className="size-2.5 rounded-full bg-line-strong" />
                      <i className="size-2.5 rounded-full bg-line-strong" />
                    </span>
                    <span className="flex-1 flex items-center gap-1.5 rounded-md bg-canvas border border-line px-2.5 py-1 font-mono text-[11.5px] text-muted truncate">
                      <Link01 size={12} /> {draft.guideUrl}
                    </span>
                  </div>
                }
                html={preview.html}
                width={1080}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- pieces ---------- */

function Loader({ loading, error, onLoad }: { loading: string | null; error: string | null; onLoad: (source: string, text?: string) => void }) {
  const [url, setUrl] = useState("");
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="min-h-dvh dots grid place-items-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-line bg-paper shadow-[0_24px_48px_-24px_rgb(14_17_22/0.25)]">
        <div className="p-7 pb-5 border-b border-line">
          <NextLink href="/">
            <Wordmark />
          </NextLink>
          <h1 className="mt-6 text-[26px] leading-tight font-bold tracking-tight">Load your OpenAPI spec</h1>
          <p className="mt-2 text-[14.5px] text-muted leading-relaxed">
            Sundown lists the operations marked <code className="font-mono text-[13px] text-ink">deprecated: true</code> and writes everything you send about them.
            Your spec stays in your browser.
          </p>
        </div>
        <div className="p-7 space-y-5">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (url.trim()) onLoad(url.trim());
            }}
          >
            <div className="relative flex-1">
              <Link01 size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
              <input className="field field-mono pl-8 py-2" placeholder="https://…/openapi.json" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <button className="btn btn-primary" disabled={!!loading}>
              Load
            </button>
          </form>
          <button onClick={() => file.current?.click()} className="w-full rounded-xl border border-dashed border-line-strong hover:border-accent hover:bg-accent-soft transition-colors p-5 flex items-center justify-center gap-2 text-[13.5px] font-semibold">
            <Upload01 size={17} /> Upload a .json or .yaml file
          </button>
          <input
            ref={file}
            type="file"
            accept=".json,.yaml,.yml,application/json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) onLoad(f.name, await f.text());
            }}
          />
          <div>
            <p className="eyebrow mb-2">Or try one</p>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLES.map((s) => (
                <button key={s.url} onClick={() => onLoad(s.url)} className="text-left rounded-xl border border-line hover:border-line-strong hover:bg-canvas p-3.5 transition-colors">
                  <span className="block text-[13.5px] font-semibold">{s.label}</span>
                  <span className="block mt-0.5 font-mono text-[11.5px] text-muted">{s.note}</span>
                </button>
              ))}
            </div>
          </div>
          {loading ? <p className="text-[13px] text-muted font-mono truncate">Reading {loading}…</p> : null}
          {error ? (
            <p className="text-[13px] text-[#b42318] flex gap-2 items-start">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Timeline({ draft }: { draft: Draft }) {
  const sends = STAGES.map((s) => ({ s, on: sendOnFor(s, draft.deprecatedOn, draft.sunsetOn) }));
  return (
    <ol className="rounded-lg border border-line divide-y divide-line">
      {sends.map(({ s, on }) => (
        <li key={s} className={`flex items-center gap-3 px-3 py-2 text-[12.5px] ${draft.stage === s ? "bg-accent-soft" : ""}`}>
          <span className={`size-1.5 rounded-full ${s === "retired" ? "bg-accent" : "bg-line-strong"}`} />
          <span className="font-semibold w-28">{STAGE_LABEL[s]}</span>
          <span className="font-mono text-muted">{longDate(on)}</span>
          <span className="ml-auto font-mono text-[11.5px] text-faint">{s === "retired" ? "410 Gone" : `T−${daysLeft({ sendOn: on, sunsetOn: draft.sunsetOn })}d`}</span>
        </li>
      ))}
    </ol>
  );
}

function HeadersView({ headers, copied, onCopy }: { headers: string[]; copied: boolean; onCopy: () => void }) {
  return (
    <div className="max-w-[860px] mx-auto space-y-5">
      <div className="rounded-xl bg-code text-[#e6e8ec] shadow-[0_12px_32px_-12px_rgb(14_17_22/0.4)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
          <span className="font-mono text-[11.5px] tracking-wider uppercase text-[#9aa3af]">Response headers on every deprecated call</span>
          <button onClick={onCopy} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#e6e8ec] hover:text-white">
            {copied ? <CheckCircle size={14} /> : <Copy01 size={14} />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="p-4 font-mono text-[13px] leading-[1.8] overflow-x-auto">
          <span className="text-[#9aa3af]">HTTP/1.1 200 OK{"\n"}</span>
          {headers.map((h) => {
            const [name, ...rest] = h.split(": ");
            return (
              <span key={name}>
                <span className="text-[#fdba74]">{name}</span>: {rest.join(": ")}
                {"\n"}
              </span>
            );
          })}
        </pre>
      </div>
      <div className="grid grid-cols-3 gap-3 text-[13px] leading-relaxed">
        <Explain name="Deprecation" rfc="RFC 9745">
          When the endpoint was deprecated, as a Unix timestamp. Clients and gateways can warn on it.
        </Explain>
        <Explain name="Sunset" rfc="RFC 8594">
          When it stops working. An HTTP date, the end of the sunset day in UTC.
        </Explain>
        <Explain name="Link" rfc="RFC 9745 §3">
          Points to the migration guide, with <span className="font-mono text-[12px]">rel=&quot;deprecation&quot;</span>.
        </Explain>
      </div>
    </div>
  );
}

function Explain({ name, rfc, children }: { name: string; rfc: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[12.5px] font-medium">{name}</span>
        <span className="eyebrow !text-[10px]">{rfc}</span>
      </div>
      <p className="mt-2 text-muted">{children}</p>
    </div>
  );
}

function Window({ bar, html, width }: { bar: ReactNode; html?: string; width: number }) {
  return (
    <div className="mx-auto rounded-xl border border-line bg-paper shadow-[0_12px_32px_-12px_rgb(14_17_22/0.25)] overflow-hidden" style={{ maxWidth: width }}>
      <div className="px-4 py-3 border-b border-line bg-paper">{bar}</div>
      {html ? <iframe title="Preview" srcDoc={html} className="w-full h-[calc(100dvh-230px)] min-h-[520px] bg-canvas block" /> : <Placeholder ratio="4 / 3" />}
    </div>
  );
}

function Placeholder({ ratio }: { ratio: string }) {
  return <div className="w-full animate-pulse bg-canvas rounded-lg" style={{ aspectRatio: ratio }} />;
}

function Checks({ issues, rendering }: { issues: string[]; rendering: boolean }) {
  const [open, setOpen] = useState(false);
  const ok = issues.length === 0;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold border ${ok ? "border-[#abefc6] bg-[#ecfdf3] text-[#067647]" : "border-[#fecdca] bg-[#fef3f2] text-[#b42318]"}`}
      >
        {ok ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
        {rendering ? "Checking…" : ok ? "All checks pass" : `${issues.length} to fix`}
      </button>
      {open && !ok ? (
        <div className="absolute right-0 top-10 z-10 w-96 rounded-xl border border-line bg-paper p-3 shadow-[0_16px_40px_-12px_rgb(14_17_22/0.3)] space-y-2">
          <p className="eyebrow">From the templates&apos; own checks</p>
          {issues.map((m, i) => (
            <p key={i} className="text-[12.5px] leading-snug text-ink-2 flex gap-2">
              <span className="text-[#b42318]">•</span> {m}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ExportMenu(p: { onEmail: () => void; onText: () => void; onPage: () => void; onCard: () => void; onJson: () => void }) {
  const [open, setOpen] = useState(false);
  const items: Array<[string, string, () => void]> = [
    ["Email HTML", ".html", p.onEmail],
    ["Email plain text", ".txt", p.onText],
    ["Migration guide", ".html", p.onPage],
    ["Changelog card", ".png", p.onCard],
    ["Notice for the CLI", ".json", p.onJson],
  ];
  return (
    <div className="relative">
      <button className="btn btn-accent" onClick={() => setOpen((o) => !o)}>
        <Download01 size={16} /> Export
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-20 w-64 rounded-xl border border-line bg-paper p-1.5 shadow-[0_16px_40px_-12px_rgb(14_17_22/0.3)]" onMouseLeave={() => setOpen(false)}>
          {items.map(([label, ext, run]) => (
            <button
              key={label}
              onClick={() => {
                run();
                setOpen(false);
              }}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium hover:bg-canvas"
            >
              {label} <span className="font-mono text-[11.5px] text-muted">{ext}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="p-4 space-y-3 border-b border-line">
      <div>
        <h3 className="eyebrow !text-ink">{title}</h3>
        {hint ? <p className="mt-1 text-[12px] text-muted leading-snug">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-2.5 py-1 border transition-colors ${on ? "bg-ink text-white border-ink" : "border-line-strong text-muted hover:text-ink"}`}>
      {children}
    </button>
  );
}

function TabButton({ on, onClick, icon, children }: { on: boolean; onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${on ? "bg-canvas text-ink" : "text-muted hover:text-ink"}`}
    >
      {icon}
      {children}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 6.5l2.2 2.2 4.8-5.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
