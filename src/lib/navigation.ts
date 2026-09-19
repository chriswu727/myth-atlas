import type { Locale } from "./types";

export function atlasUrl(
  locale: Locale,
  realm?: string,
  view?: { k: number; x: number; y: number },
) {
  const params = new URLSearchParams();
  if (realm) params.set("realm", realm);
  if (view) {
    params.set("z", view.k.toFixed(3));
    params.set("x", view.x.toFixed(1));
    params.set("y", view.y.toFixed(1));
  }
  return `/${locale}${params.size ? `?${params}` : ""}#atlas`;
}

export function safeReturnPath(value: string | null, locale: Locale) {
  if (!value || !value.startsWith(`/${locale}`) || /[\\\r\n]/.test(value))
    return null;
  const url = new URL(value, "https://myth-atlas.invalid");
  return url.origin === "https://myth-atlas.invalid" &&
    (url.pathname === `/${locale}` || url.pathname.startsWith(`/${locale}/`))
    ? value
    : null;
}

export function localizedUrl(
  pathname: string,
  search: string,
  locale: Locale,
  hash = "",
) {
  const params = new URLSearchParams(search);
  const back = params.get("returnTo");
  if (back && /^\/(zh|en)(?=[/?#]|$)/.test(back)) {
    params.set("returnTo", back.replace(/^\/(zh|en)/, `/${locale}`));
  }
  return (
    pathname.replace(/^\/(zh|en)(?=\/|$)/, `/${locale}`) +
    (params.size ? `?${params}` : "") +
    hash
  );
}
