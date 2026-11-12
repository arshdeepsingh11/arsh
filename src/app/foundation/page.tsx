import type { Metadata } from "next";
import { FoundationView } from "@/components/views/FoundationView";

export const metadata: Metadata = { title: "The Foundation", description: "Software Development Diploma, Southern Alberta Institute of Technology (SAIT), Calgary." };

export default function Page() {
  return <FoundationView />;
}
