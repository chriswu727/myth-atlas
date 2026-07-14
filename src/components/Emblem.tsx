import type { EntryType } from "@/lib/types";

/* Engraved line glyphs, one per entry type — used as the seal on the typographic
   plate that stands in for entries with no public-domain artwork. */
const GLYPHS: Record<EntryType, React.ReactNode> = {
  deity: (
    <>
      <circle cx="24" cy="24" r="9" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={i}
            x1={24 + Math.cos(a) * 13}
            y1={24 + Math.sin(a) * 13}
            x2={24 + Math.cos(a) * 18}
            y2={24 + Math.sin(a) * 18}
          />
        );
      })}
    </>
  ),
  creature: (
    <>
      <path d="M13 34 C11 22 15 13 22 9" />
      <path d="M35 34 C37 22 33 13 26 9" />
      <path d="M24 22 L29 28 L24 34 L19 28 Z" />
    </>
  ),
  hero: (
    <>
      <path d="M24 7 L21 13 M24 7 L27 13 M24 7 L24 31" />
      <line x1="16" y1="27" x2="32" y2="27" />
      <circle cx="24" cy="36" r="2.5" />
    </>
  ),
  spirit: (
    <>
      <path d="M24 9 C31 17 33 24 24 37 C15 24 17 17 24 9 Z" />
      <circle cx="24" cy="25" r="2" />
    </>
  ),
  place: (
    <>
      <path d="M6 36 L18 14 L25 27 L31 18 L42 36" />
      <line x1="6" y1="36" x2="42" y2="36" />
      <circle cx="37" cy="11" r="2.5" />
    </>
  ),
  artifact: (
    <>
      <ellipse cx="24" cy="11" rx="6" ry="2" />
      <path d="M18 11 C18 21 15 26 20 32 C22 34.5 26 34.5 28 32 C33 26 30 21 30 11" />
      <path d="M18 14 C12.5 15 12.5 20 18 21" />
      <path d="M30 14 C35.5 15 35.5 20 30 21" />
      <line x1="20" y1="37" x2="28" y2="37" />
    </>
  ),
  tale: (
    <>
      <path d="M24 14 C20 10 12 10 8 12 V34 C12 32 20 32 24 36 C28 32 36 32 40 34 V12 C36 10 28 10 24 14 Z" />
      <line x1="24" y1="14" x2="24" y2="36" />
    </>
  ),
};

/* A name set on the plate has to hold its own at card size, so the type scale
   steps down as the string gets longer instead of shrinking to fit. */
function nameScale(len: number): string {
  if (len <= 2) return "clamp(2.2rem, 26cqw, 5rem)";
  if (len <= 4) return "clamp(1.6rem, 19cqw, 3.6rem)";
  if (len <= 7) return "clamp(1.1rem, 13cqw, 2.4rem)";
  return "clamp(0.85rem, 9.5cqw, 1.7rem)";
}

export default function Emblem({
  type,
  color,
  name,
  className = "",
}: {
  type: EntryType;
  color: string;
  /** Shown large on the plate. Prefer the original-script name. */
  name?: string;
  className?: string;
}) {
  const id = `hatch-${type}`;

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden ${className}`}
      style={{ containerType: "inline-size" }}
    >
      {/* engraved ground: fine hatching, fading toward the centre */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" stroke={color} strokeWidth="0.9" opacity="0.5" />
          </pattern>
          <radialGradient id={`${id}-fade`}>
            <stop offset="35%" stopColor="#000" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.5" />
          </radialGradient>
          <mask id={`${id}-mask`}>
            <rect width="100%" height="100%" fill={`url(#${id}-fade)`} />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} opacity="0.14" mask={`url(#${id}-mask)`} />
      </svg>

      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 45%, ${color}22 0%, transparent 70%)` }}
      />

      {/* type seal */}
      <svg
        viewBox="0 0 48 48"
        className="relative w-[16%] min-w-6"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {GLYPHS[type]}
      </svg>

      {/* the name itself is the plate */}
      {name && (
        <>
          <span
            className="relative mt-[6%] block max-w-[86%] text-center leading-[1.15] font-[family-name:var(--font-cjk),var(--font-display-stack)]"
            style={{
              fontSize: nameScale([...name].length),
              color: "var(--vellum)",
              opacity: 0.82,
              textShadow: `0 1px 0 rgba(0,0,0,0.5), 0 0 22px ${color}55`,
              wordBreak: "break-word",
            }}
          >
            {name}
          </span>
          <span
            className="relative mt-[5%] block h-px w-[22%]"
            style={{ background: color, opacity: 0.5 }}
          />
        </>
      )}
    </div>
  );
}
