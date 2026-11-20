/** Date maths and the HTTP headers, with no imports: the studio's browser code uses these too. */
export const STAGES = ["announce", "reminder", "final", "retired"] as const;
export type Stage = (typeof STAGES)[number];
type Link = string | { href: string };

const DAY = 86_400_000;
const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
export const shift = (iso: string, days: number) => new Date(day(iso) + days * DAY).toISOString().slice(0, 10);
export const daysLeft = (n: { sendOn: string; sunsetOn: string }) => Math.round((day(n.sunsetOn) - day(n.sendOn)) / DAY);
export const href = (link: Link) => (typeof link === "string" ? link : link.href);

/** When each send goes out: on deprecation, 30 days before the sunset, 7 days before, and on the day. */
export const sendOnFor = (stage: Stage, deprecatedOn: string, sunsetOn: string) =>
  ({ announce: deprecatedOn, reminder: shift(sunsetOn, -30), final: shift(sunsetOn, -7), retired: sunsetOn })[stage];

/** RFC 9745: `Deprecation: @<unix seconds>`. RFC 8594: `Sunset: <HTTP-date>` (end of the sunset day, UTC). */
export const headersFor = (n: { deprecatedOn: string; sunsetOn: string; guideUrl: Link }) => [
  `Deprecation: @${Math.floor(day(n.deprecatedOn) / 1000)}`,
  `Sunset: ${new Date(day(n.sunsetOn) + DAY - 1000).toUTCString()}`,
  `Link: <${href(n.guideUrl)}>; rel="deprecation"; type="text/html"`,
];
