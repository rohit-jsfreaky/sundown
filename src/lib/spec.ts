// Reads an OpenAPI 3 (or Swagger 2) description, JSON or YAML, into the list of operations the studio shows.
import { parse as parseYaml } from "yaml";

export type Operation = {
  key: string; // "GET /v1/charges"
  method: string;
  path: string;
  summary: string;
  description: string;
  deprecated: boolean;
  /** x-sunset, when the spec gives one (a common extension; OpenAPI has no sunset field). */
  sunset?: string;
  tags: string[];
};

export type Spec = { title: string; version: string; source: string; operations: Operation[] };

const METHODS = ["get", "post", "put", "patch", "delete", "head", "options"];

export function readSpec(text: string, source: string): Spec {
  const trimmed = text.trimStart();
  let doc: unknown;
  try {
    doc = trimmed.startsWith("{") ? JSON.parse(text) : parseYaml(text);
  } catch (e) {
    throw new Error(`Couldn't read it as JSON or YAML: ${(e as Error).message}`);
  }
  if (!doc || typeof doc !== "object" || !("paths" in doc) || !(doc as { paths: unknown }).paths) {
    throw new Error("This isn't an OpenAPI description: it has no paths.");
  }
  const d = doc as { info?: { title?: string; version?: string }; paths: Record<string, Record<string, unknown>> };
  const operations: Operation[] = [];
  for (const [path, item] of Object.entries(d.paths)) {
    if (!item || typeof item !== "object") continue;
    for (const method of METHODS) {
      const op = item[method] as Record<string, unknown> | undefined;
      if (!op || typeof op !== "object") continue;
      const M = method.toUpperCase();
      const sunset = typeof op["x-sunset"] === "string" ? (op["x-sunset"] as string).slice(0, 10) : undefined;
      operations.push({
        key: `${M} ${path}`,
        method: M,
        path,
        summary: String(op.summary ?? op.operationId ?? "").slice(0, 90),
        description: String(op.description ?? ""),
        deprecated: op.deprecated === true,
        sunset: sunset && /^\d{4}-\d{2}-\d{2}$/.test(sunset) ? sunset : undefined,
        tags: Array.isArray(op.tags) ? (op.tags as string[]) : [],
      });
    }
  }
  if (!operations.length) throw new Error("No operations found under paths.");
  return { title: d.info?.title ?? "Untitled API", version: d.info?.version ?? "", source, operations };
}
