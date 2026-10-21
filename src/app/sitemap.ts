import type { MetadataRoute } from "next";
import { pages } from "@/config/pages";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL;
  return base ? pages.map(page => ({ url: new URL(page.path, base).toString() })) : [];
}
