/**
 * The changelog card: 1200 × 630, the size changelogs, X and LinkedIn show for a link. The migration page's Open Graph
 * image too. One look tells a developer whether it's their endpoint and how long they have.
 */
import { Canvas, Column, Path, Row, Svg, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { FONT_FILES, INK, LINE, METHOD_COLORS, MONO, MUTED, PAPER, SANS, daysLeft, example, fields, href, longDate, stageCopy, type Notice } from "./_shared/notice";

const W = 1200;
const H = 630;
const PAD = 64;

export default template({
  id: "sundown.Card",
  version: "1.0.0",
  label: "Deprecation changelog card",
  guidance: "Post it with the changelog entry. Shows up to three endpoints; the rest are counted.",
  root: "Canvas",
  formats: { og: { width: W, height: H, scale: 1 } },
  fields,
  rules: { require: { core: ["image/overflow", "image/glyph", "image/fit"] } },
  example,
  render(v) {
    const n = v as unknown as Notice;
    const copy = stageCopy(n);
    const shown = n.endpoints.slice(0, 3);
    const more = n.endpoints.length - shown.length;
    const retired = n.stage === "retired";
    const inner = W - PAD * 2;

    return (
      <Canvas width={W} height={H} fonts={FONT_FILES} style={{ backgroundColor: PAPER, fontFamily: SANS, color: INK, padding: 0, gap: 0 }}>
        <Row style={{ height: 10, backgroundColor: n.accent }} />
        <Column style={{ padding: [40, PAD, 0], gap: 22, width: W }}>
          <Row style={{ alignItems: "center", gap: 16 }}>
            <Text style={{ fontSize: 26, fontWeight: 700, width: inner - 436 }}>{n.apiName}</Text>
            <Text style={{ width: 420, fontFamily: MONO, fontSize: 20, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: n.accent, textAlign: "right" }}>
              {copy.tag}
            </Text>
          </Row>
          <Text fit={{ sizes: [52, 48, 44, 40], maxLines: 2 }} style={{ fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.1, width: inner }}>
            {retired ? "These endpoints now return 410 Gone" : `${n.endpoints.length === 1 ? "This endpoint stops" : "These endpoints stop"} working on ${longDate(n.sunsetOn).replace(/ /g, "\u00a0")}`}
          </Text>
          <Column style={{ gap: 0, width: inner, border: { top: `1px solid ${LINE}` } }}>
            {shown.map((e, i) => (
              <Row key={i} style={{ padding: [12, 0], gap: 20, alignItems: "start", border: { bottom: `1px solid ${LINE}` } }}>
                <Text style={{ width: 96, fontFamily: MONO, fontSize: 20, lineHeight: 1.5, fontWeight: 500, color: METHOD_COLORS[e.method] }}>{e.method}</Text>
                <Column style={{ gap: 2, width: inner - 116 }}>
                  <Text fit={{ sizes: [24, 22, 20, 18, 16, 14], maxLines: 1 }} style={{ width: inner - 116, fontFamily: MONO, lineHeight: 1.25 }}>
                    {e.path}
                  </Text>
                  <Row style={{ gap: 10, alignItems: "center" }}>
                    <Svg width={18} height={12} viewBox="0 0 22 14" title="becomes">
                      <Path d="M1 7h19M14 1l6 6-6 6" style={{ fill: "transparent", stroke: MUTED, strokeWidth: 2 }} />
                    </Svg>
                    <Text fit={{ sizes: [18, 16, 14], maxLines: 1 }} style={{ width: inner - 116 - 28, fontFamily: MONO, color: MUTED }}>
                      {e.replacement || "no replacement"}
                    </Text>
                  </Row>
                </Column>
              </Row>
            ))}
          </Column>
          <Row style={{ alignItems: "center", gap: 16, width: inner }}>
            <Text style={{ width: 430, fontSize: 22, color: MUTED }}>
              {more > 0 ? `and ${more} more · ` : ""}
              {retired ? `Retired ${longDate(n.sunsetOn)}` : `${daysLeft(n)} days left to move`}
            </Text>
            <Text fit={{ sizes: [20, 18, 16, 14], maxLines: 1 }} style={{ width: inner - 446, fontFamily: MONO, color: INK, textAlign: "right" }}>
              {href(n.guideUrl).replace(/^https?:\/\//, "")}
            </Text>
          </Row>
        </Column>
      </Canvas>
    );
  },
});
