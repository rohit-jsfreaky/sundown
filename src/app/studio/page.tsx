import type { Metadata } from "next";
import { Studio } from "@/components/Studio";

export const metadata: Metadata = { title: "Studio · Sundown" };

export default function StudioPage() {
  return <Studio />;
}
