import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Code01, FileCode01, Globe01, Image01, Mail01, Terminal } from "@untitledui/icons";
import { Wordmark } from "@/components/Logo";

const GITHUB_SPEC = "https://github.com/github/rest-api-description";

export default function Home() {
  return (
    <div className="bg-canvas text-ink">
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <Outputs />
      <Faq />
      <Standards />
      <Footer />
    </div>
  );
}

/* ---------- 0. nav ---------- */

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center gap-8">
        <Link href="/">
          <Wordmark />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium text-muted">
          <a href="#problem" className="hover:text-ink">Why</a>
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#outputs" className="hover:text-ink">What you get</a>
          <a href="#standards" className="hover:text-ink">Standards</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <div className="flex-1" />
        <Link href="/studio" className="btn btn-primary">
          Open the studio <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}

/* ---------- 1. hero ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 dots opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1200px] px-6 pt-16 md:pt-20 pb-0 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper px-3 py-1 text-[12.5px] font-medium text-ink-2 shadow-[0_1px_2px_rgb(14_17_22/0.06)]">
          <span className="size-1.5 rounded-full bg-accent" /> For API teams retiring an endpoint
        </span>
        <h1 className="mt-6 mx-auto max-w-[820px] text-[44px] md:text-[64px] leading-[1.02] font-bold tracking-[-0.035em]">
          Retire an endpoint without breaking anyone.
        </h1>
        <p className="mt-5 mx-auto max-w-[620px] text-[17px] md:text-[19px] leading-relaxed text-muted">
          Load your OpenAPI spec. Sundown finds the deprecated operations and writes everything you send about them: four emails, a migration
          guide, a changelog card and the Sunset headers.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/studio" className="btn btn-accent !px-5 !py-3 !text-[15px]">
            Open the studio <ArrowRight size={17} />
          </Link>
          <a href="#how" className="btn btn-ghost !px-5 !py-3 !text-[15px]">
            See how it works
          </a>
        </div>
        <p className="mt-4 font-mono text-[12px] text-faint">Free · runs locally · your spec never leaves your machine</p>

        <div className="mt-14 mx-auto max-w-[1120px] rounded-t-2xl border border-b-0 border-line-strong bg-paper p-2 pb-0 shadow-[0_-12px_60px_-20px_rgb(14_17_22/0.25)]">
          <Image
            src="/landing/studio.png"
            alt="The Sundown studio: deprecated endpoints from a spec on the left, the notice in the middle, the rendered email on the right"
            width={1440}
            height={900}
            priority
            className="rounded-t-xl border border-b-0 border-line w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- 2. the problem ---------- */

const QUOTES = [
  {
    text: "You don't know how many of those emails land in inboxes of people who don't care, understand or are simply swamped. I ran into so many hard sunsets…",
    who: "r/developers · Feb 2026",
    href: "https://www.reddit.com/r/developers/comments/1rgddud/",
  },
  {
    text: "Most teams only find out about breaking changes when something fails downstream and someone opens a bug ticket.",
    who: "r/developers · Feb 2026",
    href: "https://www.reddit.com/r/developers/comments/1rgddud/",
  },
  {
    text: "Alerts weren't sent until Friday afternoon… Major impacts for so many orgs.",
    who: "r/salesforce · Jan 2026",
    href: "https://www.reddit.com/r/salesforce/comments/1qp0q1y/",
  },
];

function Problem() {
  return (
    <section id="problem" className="border-b border-line">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-28">
        <SectionHead eyebrow="Why" title="Deprecation emails get ignored. Then things break.">
          Every API retires endpoints. The notice is usually written in a hurry, once, by whoever drew the short straw. It doesn&apos;t say what to do,
          nobody gets reminded, and the first real warning is a 410 in production.
        </SectionHead>
        <div className="mt-12 grid md:grid-cols-4 gap-px bg-line border border-line rounded-2xl overflow-hidden">
          <div className="bg-ink text-white p-7 flex flex-col justify-between min-h-56">
            <span className="eyebrow !text-white/60">GitHub&apos;s own REST spec</span>
            <div>
              <p className="text-[52px] font-bold leading-none tracking-tight">38</p>
              <p className="mt-2 text-[14px] text-white/75 leading-snug">
                deprecated operations out of 1,281, each one a notice someone had to write.
              </p>
              <a href={GITHUB_SPEC} className="mt-3 inline-flex items-center gap-1 font-mono text-[11.5px] text-white/60 hover:text-white">
                github/rest-api-description <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
          {QUOTES.map((q) => (
            <figure key={q.text} className="bg-paper p-7 flex flex-col justify-between gap-6 min-h-56">
              <blockquote className="text-[15.5px] leading-relaxed text-ink-2">&ldquo;{q.text}&rdquo;</blockquote>
              <figcaption>
                <a href={q.href} className="inline-flex items-center gap-1 font-mono text-[11.5px] text-muted hover:text-ink">
                  {q.who} <ArrowUpRight size={12} />
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. how it works ---------- */

const STEPS = [
  {
    n: "01",
    title: "Load your spec",
    body: "Paste a URL or drop a JSON/YAML file. Sundown lists every operation marked deprecated: true, and reads x-sunset when it's there.",
    icon: <FileCode01 size={20} />,
  },
  {
    n: "02",
    title: "Fill in the gaps",
    body: "Pick the endpoints, set the sunset date, say what replaces each one, and add the steps and before/after code. Checks run as you type.",
    icon: <Code01 size={20} />,
  },
  {
    n: "03",
    title: "Send the sequence",
    body: "Export the email for each send, the migration guide, the card and the headers. Or hand the notice to the CLI and render it in CI.",
    icon: <Mail01 size={20} />,
  },
];
const SENDS = [
  ["Announce", "T−120", "On deprecation day"],
  ["Reminder", "T−30", "To keys still calling"],
  ["Final notice", "T−7", "Last chance"],
  ["Retired", "410", "The day it's gone"],
];

function HowItWorks() {
  return (
    <section id="how" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-28">
        <SectionHead eyebrow="How it works" title="From the spec you already have to the notices you should send." />
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-line bg-canvas p-7">
              <div className="flex items-center justify-between">
                <span className="grid place-items-center size-10 rounded-xl bg-paper border border-line text-ink">{s.icon}</span>
                <span className="font-mono text-[12px] text-faint">{s.n}</span>
              </div>
              <h3 className="mt-6 text-[19px] font-bold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-line p-6 md:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow">One notice, four sends</p>
            <p className="hidden md:block text-[13px] text-muted">Each send repeats the facts with more urgency, so the swamped still see it.</p>
          </div>
          <ol className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 relative">
            <span className="hidden md:block absolute left-0 right-0 top-[7px] h-px bg-line-strong" aria-hidden="true" />
            {SENDS.map(([name, t, note], i) => (
              <li key={name} className="relative md:pr-6">
                <span className={`relative block size-[15px] rounded-full border-2 ${i === 3 ? "bg-accent border-accent" : "bg-paper border-ink"}`} />
                <p className="mt-4 font-mono text-[12px] text-accent-ink">{t}</p>
                <p className="mt-1 text-[16px] font-bold">{name}</p>
                <p className="text-[13.5px] text-muted">{note}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. outputs ---------- */

function Outputs() {
  return (
    <section id="outputs" className="border-b border-line">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-28">
        <SectionHead eyebrow="What you get" title="Everything a deprecation needs, from one notice." />
        <div className="mt-12 grid md:grid-cols-6 gap-4">
          <Tile className="md:col-span-3 md:row-span-2" icon={<Mail01 size={16} />} name="The emails" note="Email HTML + plain text · checked for Outlook, Gmail, Apple Mail">
            <div className="h-[420px] md:h-auto md:flex-1 overflow-hidden rounded-xl border border-line bg-canvas">
              <Image src="/landing/email.png" alt="The announcement email" width={665} height={1328} className="w-full h-auto" />
            </div>
          </Tile>
          <Tile className="md:col-span-3" icon={<Globe01 size={16} />} name="The migration guide" note="A web page · the rel=&quot;deprecation&quot; link target">
            <div className="h-[236px] overflow-hidden rounded-xl border border-line bg-canvas">
              <Image src="/landing/guide.png" alt="The migration guide page" width={1185} height={1826} className="w-full h-auto" />
            </div>
          </Tile>
          <Tile className="md:col-span-3" icon={<Image01 size={16} />} name="The changelog card" note="1200 × 630 PNG · also the guide's OG image">
            <Image src="/landing/card.png" alt="The changelog card" width={1200} height={630} className="w-full h-auto rounded-xl border border-line" />
          </Tile>
          <Tile className="md:col-span-3" icon={<Code01 size={16} />} name="The headers" note="For your gateway or middleware">
            <pre className="rounded-xl bg-code text-[#e6e8ec] p-4 font-mono text-[12px] leading-[1.75] overflow-x-auto">
              <span className="text-[#fdba74]">Deprecation</span>: @1796083200{"\n"}
              <span className="text-[#fdba74]">Sunset</span>: Wed, 31 Mar 2027 23:59:59 GMT{"\n"}
              <span className="text-[#fdba74]">Link</span>: &lt;https://docs.larkpay.example/migrate/…&gt;;{"\n"}
              {"      "}rel=&quot;deprecation&quot;; type=&quot;text/html&quot;
            </pre>
          </Tile>
          <Tile className="md:col-span-3" icon={<Terminal size={16} />} name="The CLI" note="Same templates, no browser: render notices in CI">
            <pre className="rounded-xl bg-code text-[#e6e8ec] p-4 font-mono text-[12px] leading-[1.75] overflow-x-auto">
              <span className="text-[#9aa3af]">$</span> npx hyper-elements design new templates/email.tsx \{"\n"}
              {"    "}-o notices/v1.email.values.json --values notice.json{"\n"}
              <span className="text-[#9aa3af]">$</span> npx hyper-elements render notices/{"\n"}
              <span className="text-[#86efac]">✓</span> notices/v1.email.values.json → out/…/v1.email.html
            </pre>
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ className = "", icon, name, note, children }: { className?: string; icon: ReactNode; name: string; note: string; children: ReactNode }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-line bg-paper p-5 flex flex-col gap-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center size-7 rounded-lg bg-canvas border border-line">{icon}</span>
          <h3 className="text-[15.5px] font-bold">{name}</h3>
        </div>
        <p className="text-right font-mono text-[11px] leading-snug text-muted max-w-[60%]">{note}</p>
      </div>
      {children}
    </div>
  );
}

/* ---------- FAQ ---------- */

const FAQ = [
  ["Does my spec leave my computer?", "The spec is read in your browser. Only the notice you build (the picked endpoints, dates and text) goes to the app's own render route, which runs Hyper Elements and sends the email, page or card back. There are no accounts and nothing is stored on a server."],
  ["Which specs work?", "OpenAPI 3.x and Swagger 2, in JSON or YAML, from a URL or a file. A URL has to allow cross-origin requests; raw.githubusercontent.com does, which is how GitHub's 14 MB spec loads."],
  ["Where does the sunset date come from?", "If an operation has x-sunset in the spec, Sundown uses it. Otherwise you pick the date. The four sends are then dated for you: on deprecation, 30 days before the sunset, 7 days before, and on the day."],
  ["Does Sundown send the emails?", "No. Export the HTML and plain text and send them with whatever you already use, to the owners of API keys that called the endpoints. Or render the notice in CI with npx hyper-elements and hand the files to your email service."],
  ["Why four emails instead of one?", "Because one gets missed. Developers say deprecation emails land with people who are swamped, so each send repeats the facts (what, when, what to use instead) with more urgency as the date gets close."],
  ["What do I do with the headers?", "Add them to every response from the deprecated endpoints, in your gateway or middleware. Clients and logs can then find each call that still needs to move, before the sunset turns it into a 410."],
  ["Can the notices use our brand colour?", "Yes. Pick a colour and the email, the guide and the card follow it. The email's contrast check tells you if a colour is too light for text."],
] as const;

function Faq() {
  return (
    <section id="faq" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-28 grid md:grid-cols-[360px_1fr] gap-12">
        <div className="md:sticky md:top-28 self-start">
          <SectionHead eyebrow="FAQ" title="Questions API teams ask." />
        </div>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-semibold">
                {q}
                <span className="grid place-items-center size-7 shrink-0 rounded-full border border-line-strong text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-6 pr-12 text-[15px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 6. standards + Hyper Elements ---------- */

const RULES = [
  {
    src: "Zalando RESTful API Guidelines",
    href: "https://github.com/zalando/restful-api-guidelines/blob/main/chapters/deprecation.adoc",
    rule: "MUST reflect deprecation in API specifications… provide a sunset date and document in details what consumers should use instead and how to migrate.",
  },
  {
    src: "RFC 9745 · The Deprecation HTTP Response Header Field",
    href: "https://www.rfc-editor.org/rfc/rfc9745.html",
    rule: "Deprecation: @<timestamp>, and a Link with rel=\"deprecation\" to the page that explains it.",
  },
  {
    src: "RFC 8594 · The Sunset HTTP Header Field",
    href: "https://www.rfc-editor.org/rfc/rfc8594.html",
    rule: "Sunset: <HTTP-date>: when the resource is expected to stop responding.",
  },
];

function Standards() {
  return (
    <section id="standards" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-28 grid md:grid-cols-2 gap-14">
        <div>
          <SectionHead eyebrow="Standards" title="Follows the rules API teams already agree on." />
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {RULES.map((r) => (
              <li key={r.src} className="py-5">
                <a href={r.href} className="inline-flex items-center gap-1 text-[14px] font-semibold hover:text-accent-ink">
                  {r.src} <ArrowUpRight size={14} />
                </a>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{r.rule}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHead eyebrow="Built with Hyper Elements" title="Three templates. The app and the CLI share them." />
          <ul className="mt-10 space-y-4 text-[14.5px] leading-relaxed text-ink-2">
            {[
              ["template()", "Each output is a Hyper Elements template with typed fields: a path must start with /, an email must be an email, 1 to 12 endpoints."],
              ["<Email> <Page> <Canvas>", "The notice email, the migration guide, and the card drawn to PNG with renderImage()."],
              ["Checks", "Lint's contrast, link-text and lang rules, email client checks, and the card's overflow, fit and glyph checks. Their messages show up in the studio."],
              ["Values files", "Export a notice and render it with npx hyper-elements, in CI, without the app."],
            ].map(([k, v]) => (
              <li key={k} className="flex gap-4">
                <span className="shrink-0 w-44 font-mono text-[12.5px] text-accent-ink pt-0.5">{k}</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-6 pb-24">
        <div className="rounded-2xl bg-ink text-white p-10 md:p-14 flex flex-col md:flex-row md:items-center gap-8 justify-between relative overflow-hidden">
          <svg className="absolute -right-10 -bottom-24 opacity-90" width="360" height="240" viewBox="0 0 360 240" aria-hidden="true">
            <path d="M40 200a140 140 0 0 1 280 0z" fill="var(--accent)" />
            <path d="M0 204h360M50 222h260M110 238h140" stroke="#ffffff" strokeOpacity=".25" strokeWidth="3" />
          </svg>
          <div className="relative">
            <h2 className="text-[32px] md:text-[40px] font-bold leading-tight tracking-tight max-w-[560px]">Your next sunset, done properly.</h2>
            <p className="mt-3 text-white/70 text-[16px] max-w-[480px]">Try it on the Larkpay sample, or on GitHub&apos;s real spec with its 38 deprecated operations.</p>
          </div>
          <Link href="/studio" className="relative btn bg-white text-ink hover:bg-white/90 !px-5 !py-3 !text-[15px]">
            Open the studio <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-[720px]">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-[32px] md:text-[42px] leading-[1.08] font-bold tracking-[-0.03em]">{title}</h2>
      {children ? <p className="mt-4 text-[16.5px] leading-relaxed text-muted">{children}</p> : null}
    </div>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-[1200px] px-6 py-10 flex flex-col md:flex-row gap-4 md:items-center justify-between text-[13px] text-muted">
      <Wordmark />
      <p>
        Built with <a href="https://github.com/hyper-elements/hyper-elements" className="underline underline-offset-2 hover:text-ink">Hyper Elements</a>. Larkpay is a made-up
        API used as the sample.
      </p>
    </footer>
  );
}
