/**
 * What every Sundown template shares: the notice's fields, the look, and the date maths.
 *
 * A notice is one deprecation: which endpoints, when they were deprecated, when they stop working (the sunset), what
 * to use instead and how to move. The fields follow Zalando's API guidelines and RFC 9745 / RFC 8594: the spec marks
 * the operation `deprecated: true`, the producer gives a sunset date and documents the replacement and the migration.
 */
import { Column, Text, defineTheme, prop } from "@hyper-elements/react";
import { formatDate } from "@hyper-elements/react/template";

export const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;

export const fields = {
  apiName: prop.text({ label: "API name", required: true, maxLength: 40 }),
  team: prop.text({ label: "Signed by", required: true, maxLength: 48, guidance: "A team people can reply to, not a no-reply robot." }),
  accent: prop.color({ label: "Brand colour", default: "#C2410C" }),
  stage: prop.choice(STAGES, {
    label: "Which send",
    default: "announce",
    guidance: "announce when you deprecate, reminder about 30 days before the sunset, final in the last week, retired on the day.",
  }),
  sendOn: prop.date({ label: "Sent on", required: true }),
  deprecatedOn: prop.date({ label: "Deprecated on", required: true }),
  sunsetOn: prop.date({ label: "Sunset on", required: true, guidance: "The day the endpoints stop answering (410 Gone)." }),
  guideUrl: prop.link({ label: "Migration guide URL", required: true, guidance: "Where the migration page lives. Also the Link rel=\"deprecation\" header target." }),
  contactEmail: prop.text({ label: "Contact email", required: true, maxLength: 80, pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" }),
  reason: prop.text({ label: "Why", required: true, maxLength: 280, guidance: "One or two plain sentences. Developers forgive a change they understand." }),
  endpoints: prop.list(
    prop.object(
      {
        method: prop.choice(METHODS, { label: "Method", required: true }),
        path: prop.text({ label: "Path", required: true, maxLength: 90, pattern: "^/" }),
        summary: prop.text({ label: "Summary", maxLength: 90 }),
        replacement: prop.text({ label: "Use instead", maxLength: 100, guidance: "\"POST /v2/payments\", or leave empty if nothing replaces it." }),
      },
      { label: "Endpoint" },
    ),
    { label: "Deprecated endpoints", required: true, min: 1, max: 12 },
  ),
  steps: prop.list(prop.text({ label: "Step", maxLength: 160 }), { label: "Migration steps", max: 6 }),
  before: prop.text({ label: "Code before", maxLength: 700 }),
  after: prop.text({ label: "Code after", maxLength: 700 }),
};

export type Endpoint = { method: (typeof METHODS)[number]; path: string; summary?: string; replacement?: string };
export type Notice = {
  apiName: string;
  team: string;
  accent: string;
  stage: (typeof STAGES)[number];
  sendOn: string;
  deprecatedOn: string;
  sunsetOn: string;
  guideUrl: string | { href: string };
  contactEmail: string;
  reason: string;
  endpoints: Endpoint[];
  steps: string[];
  before?: string;
  after?: string;
};

/** The sample: Larkpay, a made-up payments API, retiring its v1 charges endpoints. */
export const example = {
  apiName: "Larkpay API",
  team: "The Larkpay API team",
  accent: "#C2410C",
  stage: "announce",
  sendOn: "2026-12-01",
  deprecatedOn: "2026-12-01",
  sunsetOn: "2027-03-31",
  guideUrl: "https://docs.larkpay.example/migrate/charges-to-payments",
  contactEmail: "api@larkpay.example",
  reason:
    "Charges were built for card payments only. The Payments API handles cards, bank debits and wallets with one object, and it is where every new feature now ships.",
  endpoints: [
    { method: "POST", path: "/v1/charges", summary: "Create a charge", replacement: "POST /v2/payments" },
    { method: "GET", path: "/v1/charges/{charge_id}", summary: "Retrieve a charge", replacement: "GET /v2/payments/{payment_id}" },
    { method: "POST", path: "/v1/charges/{charge_id}/refund", summary: "Refund a charge", replacement: "POST /v2/refunds" },
  ],
  steps: [
    "Create payments with POST /v2/payments. The amount and currency fields are unchanged.",
    "Read the payment's status field instead of the charge's paid and refunded flags.",
    "Move refunds to POST /v2/refunds with the payment_id.",
    "Watch your logs for the Deprecation header: any response that has it is still on v1.",
  ],
  before: 'curl https://api.larkpay.example/v1/charges \\\n  -u "$LARKPAY_KEY:" \\\n  -d amount=2500 -d currency=eur -d source=tok_visa',
  after:
    'curl https://api.larkpay.example/v2/payments \\\n  -u "$LARKPAY_KEY:" \\\n  -d amount=2500 -d currency=eur \\\n  -d "payment_method[type]=card" \\\n  -d "payment_method[token]=tok_visa"',
} as const;

/* ---------- the look ---------- */

export const INK = "#0E1116";
export const MUTED = "#5B6472";
export const LINE = "#E3E6EB";
export const PAPER = "#FFFFFF";
export const MIST = "#F5F6F8";
export const CODE_BG = "#0E1116";
export const CODE_INK = "#E6E8EC";

export const SANS = "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'IBM Plex Mono', Menlo, Consolas, monospace";

/** Font files for the image (relative to a template in templates/). */
export const FONT_FILES = [
  { family: "Schibsted Grotesk", src: "../fonts/SchibstedGrotesk-400.woff", weight: 400 },
  { family: "Schibsted Grotesk", src: "../fonts/SchibstedGrotesk-500.woff", weight: 500 },
  { family: "Schibsted Grotesk", src: "../fonts/SchibstedGrotesk-700.woff", weight: 700 },
  { family: "IBM Plex Mono", src: "../fonts/IBMPlexMono-400.woff", weight: 400 },
  { family: "IBM Plex Mono", src: "../fonts/IBMPlexMono-500.woff", weight: 500 },
];
const CDN = "https://cdn.jsdelivr.net/npm/@fontsource";
/** The same fonts from a CDN, for the email and the web page. */
export const FONT_URLS = [
  { family: "Schibsted Grotesk", src: `${CDN}/schibsted-grotesk@5.3.0/files/schibsted-grotesk-latin-400-normal.woff2`, weight: 400 },
  { family: "Schibsted Grotesk", src: `${CDN}/schibsted-grotesk@5.3.0/files/schibsted-grotesk-latin-700-normal.woff2`, weight: 700 },
  { family: "IBM Plex Mono", src: `${CDN}/ibm-plex-mono@5.3.0/files/ibm-plex-mono-latin-400-normal.woff2`, weight: 400 },
  { family: "IBM Plex Mono", src: `${CDN}/ibm-plex-mono@5.3.0/files/ibm-plex-mono-latin-500-normal.woff2`, weight: 500 },
];

/** Method badge colours, as API references draw them. */
export const METHOD_COLORS: Record<string, string> = {
  GET: "#0B6E4F",
  POST: "#1D4ED8",
  PUT: "#7C3AED",
  PATCH: "#A16207",
  DELETE: "#B42318",
  HEAD: "#475467",
  OPTIONS: "#475467",
};

export const themeFor = (n: Notice) =>
  defineTheme({
    colors: { background: MIST, foreground: INK, primary: n.accent, primaryForeground: PAPER, muted: MUTED, border: LINE, paper: PAPER },
    fonts: { body: SANS, heading: SANS },
    fontSizes: { body: 16 },
    lineHeights: { body: 1.6 },
    elements: {
      Heading: { fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.2, by: { level: { 1: { fontSize: 30, mobile: { fontSize: 25 } }, 2: { fontSize: 20 } } } },
      Button: { fontWeight: 700, fontSize: 15, padding: [13, 22], borderRadius: 999 },
    },
    styles: {
      eyebrow: { fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: 1.2, textTransform: "uppercase", color: MUTED },
      card: { backgroundColor: PAPER, padding: 32, gap: 18, border: `1px solid ${LINE}`, borderRadius: 12 },
    },
  });

/* ---------- dates ---------- */

export { daysLeft, headersFor, href, shift } from "./dates";
import { STAGES, daysLeft } from "./dates";
export const longDate = (iso: string) => formatDate(iso, "en-GB", { day: "numeric", month: "long", year: "numeric" });

/** What each send says, so the four emails read as one sequence. */
export const stageCopy = (n: Notice) => {
  const left = daysLeft(n);
  const count = n.endpoints.length === 1 ? "1 endpoint" : `${n.endpoints.length} endpoints`;
  const sunset = longDate(n.sunsetOn);
  switch (n.stage) {
    case "announce":
      return { tag: "Deprecation notice", subject: `${n.apiName}: ${count} deprecated, sunset on ${sunset}`, lead: `We're retiring ${count} of the ${n.apiName}. They keep working until ${sunset}. After that they return 410 Gone.` };
    case "reminder":
      return { tag: `Reminder · ${left} days left`, subject: `${left} days left: move off ${count} of the ${n.apiName}`, lead: `${count} of the ${n.apiName} stop working on ${sunset}, in ${left} days. If you still call them, now is the time to move.` };
    case "final":
      return { tag: `Final notice · ${left} days left`, subject: `Final notice: ${count} stop working on ${sunset}`, lead: `This is the last reminder. On ${sunset}, ${count} of the ${n.apiName} start returning 410 Gone. Requests to them will fail.` };
    case "retired":
      return { tag: "Retired", subject: `Retired today: ${count} of the ${n.apiName}`, lead: `As announced on ${longDate(n.deprecatedOn)}, ${count} of the ${n.apiName} were retired today and now return 410 Gone.` };
  }
};

/** A code sample as mono lines on a dark panel. */
export const Code = ({ label, code }: { label: string; code: string }) => (
  <Column style={{ gap: 0, backgroundColor: CODE_BG, borderRadius: 10, padding: [14, 18] }}>
    <Text style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "#9AA3AF", lineHeight: 1.8 }}>{label}</Text>
    {code.split("\n").map((line, i) => (
      <Text key={i} style={{ fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: CODE_INK }}>
        {line.replace(/^ +/, (lead) => "\u00a0".repeat(lead.length)) || "\u00a0"}
      </Text>
    ))}
  </Column>
);
