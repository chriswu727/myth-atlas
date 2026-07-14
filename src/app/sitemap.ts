import type { MetadataRoute } from "next";
import { getEntries, getTraditions } from "@/lib/data";
import { LOCALES } from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://myth-atlas.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    urls.push({ url: `${BASE}/${locale}`, changeFrequency: "weekly", priority: 1 });
    urls.push({ url: `${BASE}/${locale}/dex`, changeFrequency: "weekly", priority: 0.9 });
    urls.push({ url: `${BASE}/${locale}/about`, changeFrequency: "monthly", priority: 0.3 });
    for (const t of getTraditions()) {
      urls.push({ url: `${BASE}/${locale}/tradition/${t.id}`, changeFrequency: "weekly", priority: 0.7 });
    }
    for (const e of getEntries()) {
      urls.push({ url: `${BASE}/${locale}/entry/${e.id}`, changeFrequency: "monthly", priority: 0.6 });
    }
  }
  return urls;
}
