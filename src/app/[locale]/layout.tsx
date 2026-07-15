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
      default: locale === "zh" ? "寰宇神话志 — 诸神、异兽与失落世界" : "Myth Atlas — gods, monsters, and worlds lost to memory",
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

      <header className="site-header">
        <div className="site-shell flex min-h-18 flex-wrap items-center justify-between gap-x-8 gap-y-3 py-3">
          <Link href={`/${locale}`} className="group flex items-center gap-3" aria-label={SITE_NAME[locale]}>
            <span className="brand-mark">志</span>
            <span>
              <span className="block font-[family-name:var(--font-cjk)] text-lg font-black tracking-[0.13em]">
                寰宇神話誌
              </span>
              <span className="block font-[family-name:var(--font-mono-stack)] text-[0.56rem] tracking-[0.28em] text-vellum-faint">
                ARCANA MUNDI · MYTH ATLAS
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-8" aria-label={locale === "zh" ? "主导航" : "Main navigation"}>
            <Link href={`/${locale}`} className="site-nav-link">
              {dict.nav.atlas[locale]}
            </Link>
            <Link href={`/${locale}/dex`} className="site-nav-link">
              {dict.nav.dex[locale]}
            </Link>
            <Link href={`/${locale}/cosmogony`} className="site-nav-link">
              {dict.nav.cosmogony[locale]}
            </Link>
            <Link href={`/${locale}/about`} className="site-nav-link">
              {dict.nav.about[locale]}
            </Link>
            <LocaleSwitch locale={locale} />
          </nav>
        </div>
        <div className="mystic-divider" aria-hidden="true" />
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t border-[var(--line-strong)]">
        <div className="site-shell grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="font-[family-name:var(--font-cjk)] text-2xl font-black tracking-[0.13em]">寰宇神話誌</p>
            <p className="mt-2 max-w-xl text-sm text-vellum-dim">
              {SITE_NAME[locale]} — {dict.footer.rights[locale]}
            </p>
          </div>
          <p className="catalog-no border-l border-[var(--line)] pl-5 sm:text-right">
            {entryCount} {dict.home.entriesCount[locale]}<br />
            {traditionCount} {dict.home.traditionsCount[locale]} · {dict.footer.growing[locale]}
          </p>
        </div>
      </footer>
    </div>
  );
}
