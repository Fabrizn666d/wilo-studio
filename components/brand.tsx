import Link from "next/link";

export function Brand({ inverted = false, compact = false }: { inverted?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className={`brand-lockup ${inverted ? "is-inverted" : ""}`} aria-label="Wilo Studio — Inicio">
      <span className="brand-word"><i>w</i>ilo</span>
      {!compact && <span className="brand-studio">STUDIO</span>}
    </Link>
  );
}
