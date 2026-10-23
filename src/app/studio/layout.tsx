import type { Metadata } from "next";
import Link from "next/link";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "North Mob Studio", robots: { index: false, follow: false } };
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <div className="studio-shell"><header className="studio-header"><Link href="/studio" className="eyebrow">North Mob Studio</Link><Link href="/" className="text-link">View website ↗</Link></header>{children}</div>;
}
