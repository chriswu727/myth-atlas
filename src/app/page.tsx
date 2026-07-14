"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const saved = window.localStorage.getItem("myth-atlas-locale");
    const locale =
      saved === "zh" || saved === "en"
        ? saved
        : navigator.language.toLowerCase().startsWith("zh")
          ? "zh"
          : "en";
    router.replace(`/${locale}`);
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <p className="font-[family-name:var(--font-display-stack)] text-2xl tracking-wide">
          寰宇神話誌 · MYTH ATLAS
        </p>
        <p className="mt-6 space-x-6 text-sm text-vellum-dim">
          <Link href="/zh" className="underline underline-offset-4 hover:text-brass">
            中文
          </Link>
          <Link href="/en" className="underline underline-offset-4 hover:text-brass">
            English
          </Link>
        </p>
      </div>
    </div>
  );
}
