"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { localizedUrl } from "@/lib/navigation";
import type { Locale } from "@/lib/types";

export default function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`;
  const search = useSearchParams().toString();
  return (
    <span className="locale-switch font-[family-name:var(--font-mono-stack)] text-xs tracking-widest">
      {(["zh", "en"] as const).map((language, index) => (
        <span key={language}>
          {index > 0 && (
            <span className="locale-switch-divider mx-2 text-vellum-faint">
              /
            </span>
          )}
          <Link
            href={localizedUrl(pathname, search, language)}
            aria-current={locale === language ? "true" : undefined}
            onClick={(event) => {
              if (
                window.location.hash &&
                !event.metaKey &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey
              ) {
                event.preventDefault();
                window.location.assign(
                  localizedUrl(
                    pathname,
                    search,
                    language,
                    window.location.hash,
                  ),
                );
              }
            }}
            className={`site-language-link ${locale === language ? "text-brass" : "text-vellum-faint hover:text-vellum"}`}
          >
            {language === "zh" ? "中文" : "EN"}
          </Link>
        </span>
      ))}
    </span>
  );
}
