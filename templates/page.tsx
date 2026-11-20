/**
 * The migration guide: the page every notice links to, and the target of the deprecated responses'
 * `Link: <…>; rel="deprecation"` header. Endpoint map, timeline, steps, before and after code, and how to find the
 * calls you still make (Mintlify's checklist: "an endpoint mapping, before-and-after code, and verification steps").
 */
import { Column, Heading, Link, List, ListItem, Page, Row, Section, Table, TableCell, TableRow, Text, token, LineBreak, Span } from "@hyper-elements/react";
import { lint } from "@hyper-elements/lint";
import { template } from "@hyper-elements/react/template";
import { Code, FONT_URLS, LINE, METHOD_COLORS, MONO, MUTED, example, fields, headersFor, longDate, shift, themeFor, type Notice } from "./_shared/notice";

const EYEBROW = { fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: 1.2, textTransform: "uppercase", color: MUTED } as const;


export default template({
  id: "sundown.Page",
  version: "1.0.0",
  label: "API migration guide",
  guidance: "Host it at guideUrl. It stays up after the sunset: people arrive from old logs and error messages.",
  root: "Page",
  fields,
  rules: { plugins: { lint: lint() }, require: { lint: ["link-text", "lang", "contrast"] }, links: { schemes: ["mailto"] } },
  example,
  render(v) {
    const n = v as unknown as Notice;
    const count = n.endpoints.length === 1 ? "One endpoint" : `${n.endpoints.length} endpoints`;
    const milestones: Array<[string, string, string]> = [
      ["Deprecated", n.deprecatedOn, "Still works. Responses carry the Deprecation and Sunset headers."],
      ["Reminder", shift(n.sunsetOn, -30), "We email every key that still calls these endpoints."],
      ["Final notice", shift(n.sunsetOn, -7), "Last email. One week to go."],
      ["Sunset", n.sunsetOn, "The endpoints return 410 Gone."],
    ];

    return (
      <Page theme={themeFor(n)} lang="en" width={1040} fonts={FONT_URLS} title={`Migration guide: ${n.apiName}`} description={`${count} of the ${n.apiName} are deprecated and stop working on ${longDate(n.sunsetOn)}.`} style={{ gap: 0 }}>
        <Section style={{ backgroundColor: token("colors.paper"), padding: [18, 24], border: { bottom: { width: 1, style: "solid", color: token("colors.border") } } }}>
          <Row style={{ alignItems: "center" }}>
            <Column>
              <Text style={{ fontWeight: 700 }}>{n.apiName} · Docs</Text>
            </Column>
            <Column>
              <Text style={{ ...EYEBROW, textAlign: "right" }}>Migration guide</Text>
            </Column>
          </Row>
        </Section>

        <Section style={{ backgroundColor: token("colors.paper"), padding: [56, 24, 48], gap: 20, mobile: { padding: [32, 16] } }}>
          <Text style={{ ...EYEBROW, color: token("colors.primary") }}>Deprecated · sunset {longDate(n.sunsetOn)}</Text>
          <Heading level={1} style={{ fontSize: 44, letterSpacing: -1, lineHeight: 1.1, mobile: { fontSize: 32 } }}>
            {count} of the {n.apiName} are going away. Here is how to move.
          </Heading>
          <Text style={{ fontSize: 19, lineHeight: 1.55, color: token("colors.muted") }}>{n.reason}</Text>
        </Section>

        <Section style={{ padding: [40, 24], gap: 16, mobile: { padding: [24, 16] } }}>
          <Text style={EYEBROW}>Timeline</Text>
          <Grid4 milestones={milestones} accent={n.accent} />
        </Section>

        <Section style={{ backgroundColor: token("colors.paper"), padding: [40, 24], gap: 16, mobile: { padding: [24, 16] } }}>
          <Heading level={2}>What changes</Heading>
          <Table style={{ cellPadding: [14, 12], rowBorder: { width: 1, style: "solid", color: token("colors.border") } }}>
            <TableRow header>
              <TableCell style={EYEBROW}>Deprecated</TableCell>
              <TableCell style={EYEBROW}>What it did</TableCell>
              <TableCell style={EYEBROW}>Use instead</TableCell>
            </TableRow>
            {n.endpoints.map((e, i) => (
              <TableRow key={i}>
                <TableCell style={{ fontFamily: MONO, fontSize: 14, verticalAlign: "top" }}>
                  <Span style={{ fontWeight: 500, color: METHOD_COLORS[e.method] }}>{e.method}</Span> <Span style={{ textDecoration: "line-through" }}>{e.path}</Span>
                </TableCell>
                <TableCell style={{ fontSize: 15, verticalAlign: "top" }}>{e.summary || " "}</TableCell>
                <TableCell style={{ fontFamily: MONO, fontSize: 14, verticalAlign: "top" }}>{e.replacement || "No replacement"}</TableCell>
              </TableRow>
            ))}
          </Table>
        </Section>

        {n.steps.length || n.before || n.after ? (
          <Section style={{ padding: [40, 24], gap: 20, mobile: { padding: [24, 16] } }}>
            <Heading level={2}>How to move</Heading>
            {n.steps.length ? (
              <List type="number" style={{ gap: 8 }}>
                {n.steps.map((s, i) => (
                  <ListItem key={i}>{s}</ListItem>
                ))}
              </List>
            ) : null}
            {n.before || n.after ? (
              <Row style={{ gap: 16, alignItems: "stretch" }}>
                {n.before ? (
                  <Column>
                    <Code label="Before" code={n.before} />
                  </Column>
                ) : null}
                {n.after ? (
                  <Column>
                    <Code label="After" code={n.after} />
                  </Column>
                ) : null}
              </Row>
            ) : null}
          </Section>
        ) : null}

        <Section style={{ backgroundColor: token("colors.paper"), padding: [40, 24], gap: 16, mobile: { padding: [24, 16] } }}>
          <Heading level={2}>Find the calls you still make</Heading>
          <Text>
            Until the sunset, every response from these endpoints carries these headers (RFC 9745 and RFC 8594). Search your logs or add a check in your
            HTTP client: any response with a Deprecation header is a call to move.
          </Text>
          <Code label="Response headers" code={headersFor(n).join("\n")} />
        </Section>

        <Section style={{ padding: [32, 24, 48], mobile: { padding: [24, 16] } }}>
          <Text style={{ color: token("colors.muted") }}>
            Stuck? Write to <Link href={`mailto:${n.contactEmail}`}>{n.contactEmail}</Link> and we’ll help. {n.team}.
            <LineBreak />
            Last updated {longDate(n.sendOn)}.
          </Text>
        </Section>
      </Page>
    );
  },
});

/** The four milestones in a row, the next one marked with the brand colour's top rule. */
function Grid4({ milestones, accent }: { milestones: Array<[string, string, string]>; accent: string }) {
  return (
    <Row style={{ gap: 12 }}>
      {milestones.map(([name, date, what], i) => (
        <Column
          key={name}
          style={{ backgroundColor: "#FFFFFF", padding: [16, 16, 18], gap: 4, border: { top: { width: 3, style: "solid", color: i === 3 ? accent : LINE } }, borderRadius: 4 }}
        >
          <Text style={EYEBROW}>{name}</Text>
          <Text style={{ fontWeight: 700 }}>{longDate(date)}</Text>
          <Text style={{ fontSize: 14, lineHeight: 1.5, color: MUTED }}>{what}</Text>
        </Column>
      ))}
    </Row>
  );
}
