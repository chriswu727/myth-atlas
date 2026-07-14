"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/types";

export default function SetLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    window.localStorage.setItem("myth-atlas-locale", locale);
  }, [locale]);
  return null;
}
