// Renders a notice with the same Hyper Elements templates the CLI uses (templates/*.tsx).
// POST { output: "email" | "page" | "card", notice } -> { html, text, diagnostics } or a PNG.
// A notice a template refuses comes back as 422 with the template's own diagnostics, for the studio's checks panel.
import { createElement } from "react";
import { ElementsError, render } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";
import Card from "@templates/card";
import EmailTemplate from "@templates/email";
import PageTemplate from "@templates/page";

// In the browser: fonts and the resvg WebAssembly come from /public; Buffer (used for base64) from the buffer package.
let ready: Promise<void> | undefined;
async function fontFile(file: string) {
  ready ??= (async () => {
    const { Buffer } = await import("buffer");
    (globalThis as { Buffer?: unknown }).Buffer ??= Buffer;
    const { initWasm } = await import("@resvg/resvg-wasm");
    await initWasm(fetch("/resvg.wasm"));
  })();
  await ready;
  return new Uint8Array(await (await fetch(`/fonts/${file}`)).arrayBuffer());
}


type Diagnostic = { severity: string; code: string; message: string; path?: string; field?: string };

const FONT_FILES: Array<[string, string, number]> = [
  ["Schibsted Grotesk", "SchibstedGrotesk-400.woff", 400],
  ["Schibsted Grotesk", "SchibstedGrotesk-500.woff", 500],
  ["Schibsted Grotesk", "SchibstedGrotesk-700.woff", 700],
  ["IBM Plex Mono", "IBMPlexMono-400.woff", 400],
  ["IBM Plex Mono", "IBMPlexMono-500.woff", 500],
];
let fonts: Promise<Array<{ family: string; src: Uint8Array; weight: number }>> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all(FONT_FILES.map(async ([family, file, weight]) => ({ family, weight, src: await fontFile(file) }))));

const brief = (list: readonly unknown[] = []): Diagnostic[] =>
  (list as Diagnostic[])
    .filter((d) => d.severity === "error" || d.severity === "warning")
    .map(({ severity, code, message, path, field }) => ({ severity, code, message, path, field }));

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { output?: string; notice?: Record<string, unknown> } | null;
  if (!body?.notice || !["email", "page", "card"].includes(body.output ?? "")) {
    return Response.json({ error: 'Send { output: "email" | "page" | "card", notice }' }, { status: 400 });
  }
  const { output, notice } = body;
  try {
    if (output === "card") {
      const { image, diagnostics } = await renderImage(createElement(Card as never, { ...notice, format: "og" }), { fonts: await loadFonts() });
      return new Response(new Uint8Array(image), {
        headers: { "Content-Type": "image/png", "X-Diagnostics": encodeURIComponent(JSON.stringify(brief(diagnostics))) },
      });
    }
    const Template = output === "email" ? EmailTemplate : PageTemplate;
    const { html, text, diagnostics } = await render(createElement(Template as never, notice));
    return Response.json({ html, text, diagnostics: brief(diagnostics) });
  } catch (e) {
    if (e instanceof ElementsError) return Response.json({ diagnostics: brief(e.diagnostics) }, { status: 422 });
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
