import type { EntryType } from "@/lib/types";

/* Engraved line glyphs, one per entry type — the designed fallback when no
   public-domain artwork exists for an entry. Stroke-only, 48x48 grid. */
const GLYPHS: Record<EntryType, React.ReactNode> = {
  deity: (
    <>
      <circle cx="24" cy="24" r="9" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = 24 + Math.cos(a) * 13;
        const y1 = 24 + Math.sin(a) * 13;
        const x2 = 24 + Math.cos(a) * 18;
        const y2 = 24 + Math.sin(a) * 18;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
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

export default function Emblem({
  type,
  color,
  className = "",
}: {
  type: EntryType;
  color: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className}`}
      style={{
        background: `radial-gradient(ellipse at 50% 42%, ${color}26 0%, transparent 68%)`,
      }}
    >
      <svg
        viewBox="0 0 48 48"
        className="h-[38%] w-[38%]"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="22.5" opacity="0.35" strokeDasharray="2.5 3.5" />
        {GLYPHS[type]}
      </svg>
    </div>
  );
}
