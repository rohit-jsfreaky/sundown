// The studio's draft: what the person edits. The notice sent to the templates is built from it.
import { sendOnFor, shift, type Stage } from "@templates/_shared/dates";
import type { Operation, Spec } from "./spec";

export type Draft = {
  apiName: string;
  team: string;
  accent: string;
  stage: Stage;
  deprecatedOn: string;
  sunsetOn: string;
  guideUrl: string;
  contactEmail: string;
  reason: string;
  steps: string[];
  before: string;
  after: string;
  selected: string[]; // operation keys, "GET /v1/charges"
  replacements: Record<string, string>;
};

export const ACCENTS = ["#C2410C", "#1D4ED8", "#0B6E4F", "#6D28D9", "#BE123C", "#0E1116"];
export const MAX_ENDPOINTS = 12;

const today = () => new Date().toISOString().slice(0, 10);

/** Larkpay, the sample: the same notice as notices/larkpay.json, so the app and the CLI agree. */
export const LARKPAY: Omit<Draft, "selected"> = {
  apiName: "Larkpay API",
  team: "The Larkpay API team",
  accent: "#C2410C",
  stage: "announce",
  deprecatedOn: "2026-12-01",
  sunsetOn: "2027-03-31",
  guideUrl: "https://docs.larkpay.example/migrate/charges-to-payments",
  contactEmail: "api@larkpay.example",
  reason:
    "Charges were built for card payments only. The Payments API handles cards, bank debits and wallets with one object, and it is where every new feature now ships.",
  steps: [
    "Create payments with POST /v2/payments. The amount and currency fields are unchanged.",
    "Read the payment's status field instead of the charge's paid and refunded flags.",
    "Move refunds to POST /v2/refunds with the payment_id.",
    "Watch your logs for the Deprecation header: any response that has it is still on v1.",
  ],
  before: 'curl https://api.larkpay.example/v1/charges \\\n  -u "$LARKPAY_KEY:" \\\n  -d amount=2500 -d currency=eur -d source=tok_visa',
  after:
    'curl https://api.larkpay.example/v2/payments \\\n  -u "$LARKPAY_KEY:" \\\n  -d amount=2500 -d currency=eur \\\n  -d "payment_method[type]=card" \\\n  -d "payment_method[token]=tok_visa"',
  replacements: {
    "POST /v1/charges": "POST /v2/payments",
    "GET /v1/charges/{charge_id}": "GET /v2/payments/{payment_id}",
    "POST /v1/charges/{charge_id}/refund": "POST /v2/refunds",
  },
};

/** A fresh draft for a spec someone loaded: its deprecated operations picked, its x-sunset used when it has one. */
export function draftFor(spec: Spec): Draft {
  const deprecated = spec.operations.filter((o) => o.deprecated);
  if (spec.title === LARKPAY.apiName) return { ...LARKPAY, selected: deprecated.map((o) => o.key) };
  const picked = deprecated.slice(0, 3);
  const sunset = picked.find((o) => o.sunset)?.sunset;
  const start = today();
  return {
    apiName: spec.title.slice(0, 40),
    team: `The ${spec.title.slice(0, 30)} team`,
    accent: ACCENTS[0],
    stage: "announce",
    deprecatedOn: start,
    sunsetOn: sunset && sunset > start ? sunset : shift(start, 120),
    guideUrl: "https://docs.example.com/migrate",
    contactEmail: "api@example.com",
    reason: "We're replacing these endpoints with newer ones we can keep improving. Everything they did is still possible.",
    steps: [],
    before: "",
    after: "",
    selected: picked.map((o) => o.key),
    replacements: Object.fromEntries(picked.map((o) => [o.key, guessReplacement(o)])),
  };
}

/** GitHub-style descriptions often say what to use instead ("Use GET /x instead"): take it when it's there. */
function guessReplacement(op: Operation) {
  const m = op.description.match(/\b(GET|POST|PUT|PATCH|DELETE)\s+(\/[\w{}\-/.]+)/);
  return m && `${m[1]} ${m[2]}` !== op.key ? `${m[1]} ${m[2]}` : "";
}

/** The notice the templates take. */
export function noticeFrom(d: Draft, ops: Map<string, Operation>) {
  return {
    apiName: d.apiName,
    team: d.team,
    accent: d.accent,
    stage: d.stage,
    sendOn: sendOnFor(d.stage, d.deprecatedOn, d.sunsetOn),
    deprecatedOn: d.deprecatedOn,
    sunsetOn: d.sunsetOn,
    guideUrl: d.guideUrl,
    contactEmail: d.contactEmail,
    reason: d.reason,
    endpoints: d.selected
      .map((k) => ops.get(k))
      .filter((o): o is Operation => !!o)
      .map((o) => ({ method: o.method, path: o.path, summary: o.summary || undefined, replacement: d.replacements[o.key]?.trim() || undefined })),
    steps: d.steps.map((s) => s.trim()).filter(Boolean),
    before: d.before.trim() || undefined,
    after: d.after.trim() || undefined,
  };
}
