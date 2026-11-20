/**
 * The deprecation email, in four sends from one notice: the announcement, the 30-day reminder, the final week and the
 * retired-today note. Every send puts the action, the deadline and the link first, because "many of those emails land
 * in inboxes of people who don't care, understand or are simply swamped".
 */
import { Button, Column, Email, Heading, LineBreak, Link, List, ListItem, Row, Section, Span, Table, TableCell, TableRow, Text, token } from "@hyper-elements/react";
import { lint } from "@hyper-elements/lint";
import { template } from "@hyper-elements/react/template";
import { Code, FONT_URLS, METHOD_COLORS, MONO, MUTED, daysLeft, example, fields, href, longDate, stageCopy, themeFor, type Notice } from "./_shared/notice";

const EYEBROW = { fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: 1.2, textTransform: "uppercase", color: MUTED } as const;

export default template({
  id: "sundown.Email",
  version: "1.0.0",
  label: "API deprecation email",
  guidance: "Send to the owners of API keys that called the endpoints in the last 90 days, not to every user.",
  root: "Email",
  fields,
  rules: { plugins: { lint: lint() }, require: { lint: ["link-text", "lang", "contrast"] }, links: { schemes: ["mailto"] }, root: { previewText: true } },
  example,
  render(v) {
    const n = v as unknown as Notice;
    const copy = stageCopy(n);
    const retired = n.stage === "retired";
    const left = daysLeft(n);
    const guide = href(n.guideUrl);

    return (
      <Email theme={themeFor(n)} lang="en" width={600} fonts={FONT_URLS} title={copy.subject} previewText={copy.lead} style={{ gap: 0 }}>
        <Section style={{ padding: [28, 24, 16] }}>
          <Row stackOnMobile={false} style={{ alignItems: "center" }}>
            <Column>
              <Text style={{ fontWeight: 700, fontSize: 17 }}>{n.apiName}</Text>
            </Column>
            <Column>
              <Text style={{ apply: ["eyebrow"], textAlign: "right", color: n.stage === "announce" ? token("colors.muted") : token("colors.primary") }}>{copy.tag}</Text>
            </Column>
          </Row>
        </Section>

        <Column style={{ apply: ["card"] }}>
          <Heading level={1}>{copy.subject}</Heading>
          <Text>{copy.lead}</Text>

          {/* The deadline, as a fact block: three numbers anyone can read in two seconds. */}
          <Row style={{ gap: 0, border: { width: 1, style: "solid", color: token("colors.border") }, borderRadius: 10 }}>
            <Column style={{ padding: [14, 16], gap: 2 }}>
              <Text style={{ apply: ["eyebrow"] }}>Deprecated</Text>
              <Text style={{ fontWeight: 700 }}>{longDate(n.deprecatedOn)}</Text>
            </Column>
            <Column style={{ padding: [14, 16], gap: 2, border: { left: { width: 1, style: "solid", color: token("colors.border") } } }}>
              <Text style={{ apply: ["eyebrow"] }}>Sunset</Text>
              <Text style={{ fontWeight: 700, color: token("colors.primary") }}>{longDate(n.sunsetOn)}</Text>
            </Column>
            <Column style={{ padding: [14, 16], gap: 2, border: { left: { width: 1, style: "solid", color: token("colors.border") } } }}>
              <Text style={{ apply: ["eyebrow"] }}>{retired ? "Status" : "Time left"}</Text>
              <Text style={{ fontWeight: 700 }}>{retired ? "410 Gone" : `${left} days`}</Text>
            </Column>
          </Row>

          <Table style={{ cellPadding: [10, 0], rowBorder: { width: 1, style: "solid", color: token("colors.border") } }}>
            <TableRow header>
              <TableCell style={EYEBROW}>Endpoint</TableCell>
              <TableCell style={EYEBROW}>Use instead</TableCell>
            </TableRow>
            {n.endpoints.map((e, i) => (
              <TableRow key={i}>
                <TableCell style={{ fontFamily: MONO, fontSize: 14, lineHeight: 1.5, verticalAlign: "top", padding: [10, 12, 10, 0] }}>
                  <Span style={{ fontSize: 12, fontWeight: 500, color: METHOD_COLORS[e.method] }}>{e.method}</Span>
                  <LineBreak />
                  {e.path}
                </TableCell>
                <TableCell style={{ fontFamily: MONO, fontSize: 14, lineHeight: 1.5, verticalAlign: "top" }}>{e.replacement || "No replacement"}</TableCell>
              </TableRow>
            ))}
          </Table>

          {!retired && n.steps.length ? (
            <Column style={{ gap: 8 }}>
              <Heading level={2}>What to do</Heading>
              <List type="number" style={{ gap: 6 }}>
                {n.steps.map((s, i) => (
                  <ListItem key={i}>{s}</ListItem>
                ))}
              </List>
            </Column>
          ) : null}

          {n.stage === "announce" && n.after ? <Code label="After" code={n.after} /> : null}

          <Button href={guide}>Read the migration guide</Button>
          {n.stage === "announce" ? <Text style={{ fontSize: 15, color: token("colors.muted") }}>Why: {n.reason}</Text> : null}
        </Column>

        <Section style={{ padding: [20, 24, 32], gap: 10 }}>
          <Text style={{ fontSize: 14, color: token("colors.muted") }}>
            You’re getting this because your API keys called these endpoints. Questions? Reply, or write to{" "}
            <Link href={`mailto:${n.contactEmail}`}>{n.contactEmail}</Link>. {n.team}.
          </Text>
          <Text style={{ fontSize: 14, color: token("colors.muted") }}>
            Responses from these endpoints carry the Deprecation and Sunset headers (RFC 9745, RFC 8594), so your logs can find every call.
          </Text>
        </Section>
      </Email>
    );
  },
});

