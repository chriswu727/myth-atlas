"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { safeReturnPath } from "@/lib/navigation";
import type { Locale } from "@/lib/types";

export default function ReturnLink({ locale }: { locale: Locale }) {
  const target = safeReturnPath(useSearchParams().get("returnTo"), locale);
  if (!target) return null;
  return (
    <Link className="return-context" href={target}>
      {locale === "zh" ? "返回刚才的探索" : "Back to your exploration"}
    </Link>
  );
}
