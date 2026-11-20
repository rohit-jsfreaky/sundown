/** The Sundown mark: a sun half under the horizon. */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 15a7 7 0 0 1 14 0z" fill="var(--accent)" />
      <path d="M2 15.5h20M5 19h14M8.5 22h7" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 font-bold tracking-tight text-[17px] text-ink">
      <Logo />
      Sundown
    </span>
  );
}
