"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import LocaleSwitch from "./LocaleSwitch";
import type { Locale } from "@/lib/types";

export default function SiteNavigation({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const zh = locale === "zh";
  const links = [
    {
      href: `/${locale}#atlas`,
      path: `/${locale}`,
      label: zh ? "世界地图" : "World atlas",
    },
    {
      href: `/${locale}/cosmogony#compare`,
      path: `/${locale}/cosmogony`,
      label: zh ? "时间线对比" : "Timelines",
    },
    {
      href: `/${locale}/dex`,
      path: `/${locale}/dex`,
      label: zh ? "神话图鉴" : "Collection",
    },
  ];
  return (
    <div
      className="atlas-navigation"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <Suspense fallback={<span className="catalog-no">中文 / EN</span>}>
        <LocaleSwitch locale={locale} />
      </Suspense>
      <button
        ref={trigger}
        className="site-menu-toggle"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? (zh ? "关闭" : "Close") : zh ? "菜单" : "Menu"}
      </button>
      <nav
        id="primary-navigation"
        className="atlas-primary-navigation"
        data-open={open}
        aria-label={zh ? "主导航" : "Main navigation"}
      >
        {links.map((link) => (
          <Link
            key={link.path}
            href={link.href}
            className="site-nav-link"
            aria-current={pathname === link.path ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href={`/${locale}/about`}
          className="site-nav-link"
          aria-current={pathname === `/${locale}/about` ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          {zh ? "关于" : "About"}
        </Link>
      </nav>
    </div>
  );
}
