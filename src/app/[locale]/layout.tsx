import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SetLang from "@/components/SetLang";
import LocaleSwitch from "@/components/LocaleSwitch";
import { getEntries, getTraditions } from "@/lib/data";
import { dict, isLocale, SITE_NAME } from "@/lib/i18n";
import { LOCALES } from "@/lib/types";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: {
      default: locale === "zh" ? "寰宇神话志 — 世界神话志异图鉴" : "Myth Atlas — the world's myths and legends",
      template: locale === "zh" ? "%s · 寰宇神话志" : "%s · Myth Atlas",
    },
    description: dict.tagline[locale],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const entryCount = getEntries().length;
  const traditionCount = getTraditions().filter((t) => t.entryCount > 0).length;

  return (
    <div className="flex min-h-screen flex-col">
      <SetLang locale={locale} />

      <header className="border-b hairline">
        <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between gap-6 px-5 py-4">
          <Link href={`/${locale}`} className="group flex items-baseline gap-3">
            <span className="font-[family-name:var(--font-cjk)] text-xl font-semibold tracking-[0.18em]">
              寰宇神話誌
            </span>
            <span className="hidden font-[family-name:var(--font-display-stack)] text-xs tracking-[0.32em] text-vellum-dim group-hover:text-brass sm:inline">
              MYTH ATLAS
            </span>
          </Link>
          <nav className="flex items-baseline gap-5 text-sm sm:gap-7">
            <Link href={`/${locale}`} className="text-vellum-dim transition-colors hover:text-brass">
              {dict.nav.atlas[locale]}
            </Link>
            <Link href={`/${locale}/dex`} className="text-vellum-dim transition-colors hover:text-brass">
              {dict.nav.dex[locale]}
            </Link>
            <Link href={`/${locale}/about`} className="text-vellum-dim transition-colors hover:text-brass">
              {dict.nav.about[locale]}
            </Link>
            <LocaleSwitch locale={locale} />
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t hairline">
        <div className="mx-auto w-full max-w-6xl px-5 py-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="font-[family-name:var(--font-cjk)] tracking-[0.18em]">
              寰宇神話誌 <span className="eyebrow ml-2">MYTH ATLAS</span>
            </p>
            <p className="catalog-no">
              {entryCount} {dict.home.entriesCount[locale]} · {traditionCount}{" "}
              {dict.home.traditionsCount[locale]} · {dict.footer.growing[locale]}
            </p>
          </div>
          <p className="mt-4 text-sm text-vellum-faint">
            {SITE_NAME[locale]} — {dict.footer.rights[locale]}
          </p>
        </div>
      </footer>
    </div>
  );
}
