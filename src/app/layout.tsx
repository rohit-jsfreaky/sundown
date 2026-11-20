import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sans = localFont({
  src: [
    { path: "../../fonts/SchibstedGrotesk-400.woff", weight: "400" },
    { path: "../../fonts/SchibstedGrotesk-500.woff", weight: "500" },
    { path: "../../fonts/SchibstedGrotesk-700.woff", weight: "700" },
  ],
  variable: "--font-schibsted",
});
const mono = localFont({
  src: [
    { path: "../../fonts/IBMPlexMono-400.woff", weight: "400" },
    { path: "../../fonts/IBMPlexMono-500.woff", weight: "500" },
  ],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Sundown · Retire an API endpoint without breaking anyone",
  description: "Load your OpenAPI spec. Sundown writes the deprecation emails, the migration guide, the changelog card and the Sunset headers. Built with Hyper Elements.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
