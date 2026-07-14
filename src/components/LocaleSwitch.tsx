"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/types";

export default function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`;
  const rest = pathname.replace(/^\/(zh|en)(?=\/|$)/, "");
  return (
    <span className="font-[family-name:var(--font-mono-stack)] text-xs tracking-widest">
      <Link
        href={`/zh${rest}`}
        aria-current={locale === "zh" ? "true" : undefined}
        className={locale === "zh" ? "text-brass" : "text-vellum-faint hover:text-vellum"}
      >
        中文
      </Link>
      <span className="mx-2 text-vellum-faint">/</span>
      <Link
        href={`/en${rest}`}
        aria-current={locale === "en" ? "true" : undefined}
        className={locale === "en" ? "text-brass" : "text-vellum-faint hover:text-vellum"}
      >
        EN
      </Link>
    </span>
  );
}
