export type PepeVariant = "visor" | "antenna" | "headset" | "chip" | "core";

type PepeProps = {
  variant: PepeVariant;
  size?: number;
  /** Accessible name. Omit for a decorative avatar beside a visible author name. */
  title?: string;
  className?: string;
};

/*
 * One Pepe face, drawn once, with an AI "armament" layered on by variant:
 * a HUD visor, a signal antenna, a comms headset, a circuit implant or a
 * hand-held AI core. Art colours are fixed (they are the character, not UI),
 * glow lines reuse the page's accent so the mascot and the controls agree.
 */
export function Pepe({ variant, size = 48, title, className }: PepeProps) {
  const decorative = !title;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={title}
      focusable="false"
    >
      <Face />
      {variant === "visor" && <Visor />}
      {variant === "antenna" && <Antenna />}
      {variant === "headset" && <Headset />}
      {variant === "chip" && <Chip />}
      {variant === "core" && <Core />}
    </svg>
  );
}

const INK = "#1b4a2b";
const SKIN = "#3c9a5b";
const LIP = "#2f7a47";
const GLOW = "#8fe3a8";
const DARK = "#0d2117";

function Face() {
  return (
    <g>
      <ellipse cx="60" cy="70" rx="46" ry="40" fill={SKIN} stroke={INK} strokeWidth="3" />
      {/* eyes */}
      <ellipse cx="40" cy="48" rx="17" ry="12" fill="#f3f7ef" stroke={INK} strokeWidth="3" />
      <ellipse cx="80" cy="50" rx="18" ry="13" fill="#f3f7ef" stroke={INK} strokeWidth="3" />
      <circle cx="44" cy="50" r="5" fill="#101a12" />
      <circle cx="84" cy="52" r="5" fill="#101a12" />
      {/* heavy lids */}
      <path d="M24 44 A17 12 0 0 1 56 44 Z" fill={SKIN} stroke={INK} strokeWidth="3" />
      <path d="M63 46 A18 13 0 0 1 97 46 Z" fill={SKIN} stroke={INK} strokeWidth="3" />
      {/* nostrils */}
      <circle cx="56" cy="68" r="1.8" fill={INK} />
      <circle cx="66" cy="68" r="1.8" fill={INK} />
      {/* lips */}
      <path d="M18 80 Q60 92 102 78 Q62 100 18 80 Z" fill={LIP} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 81 Q60 88 98 79" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

function Visor() {
  return (
    <g>
      <rect x="18" y="38" width="84" height="22" rx="7" fill={DARK} opacity="0.88" stroke={GLOW} strokeWidth="2.5" />
      <rect x="24" y="48" width="72" height="2.5" rx="1" fill={GLOW} opacity="0.9" />
      <circle cx="92" cy="43" r="2.5" fill={GLOW} />
      <path d="M102 49 h10" stroke={GLOW} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Antenna() {
  return (
    <g>
      <path d="M60 31 V12" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="9" r="5.5" fill={GLOW} stroke={INK} strokeWidth="2.5" />
      <path d="M48 16 A14 14 0 0 1 48 2" fill="none" stroke={GLOW} strokeWidth="2.5" strokeLinecap="round" transform="translate(4 7)" />
      <path d="M72 16 A14 14 0 0 0 72 2" fill="none" stroke={GLOW} strokeWidth="2.5" strokeLinecap="round" transform="translate(-4 7)" />
    </g>
  );
}

function Headset() {
  return (
    <g>
      <path d="M17 62 A43 43 0 0 1 103 62" fill="none" stroke={DARK} strokeWidth="6" strokeLinecap="round" />
      <rect x="9" y="56" width="13" height="22" rx="5" fill={DARK} stroke={GLOW} strokeWidth="2.5" />
      <rect x="98" y="56" width="13" height="22" rx="5" fill={DARK} stroke={GLOW} strokeWidth="2.5" />
      <path d="M22 76 Q26 96 44 94" fill="none" stroke={GLOW} strokeWidth="3" strokeLinecap="round" />
      <circle cx="47" cy="94" r="4" fill={GLOW} />
    </g>
  );
}

function Chip() {
  return (
    <g>
      <rect x="84" y="64" width="12" height="12" rx="2" fill={DARK} stroke={GLOW} strokeWidth="2.5" />
      <path d="M90 64 V56 M96 70 H106 M90 76 V86 M84 70 H76" stroke={GLOW} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="90" cy="54" r="2.2" fill={GLOW} />
      <circle cx="108" cy="70" r="2.2" fill={GLOW} />
      <circle cx="90" cy="88" r="2.2" fill={GLOW} />
    </g>
  );
}

function Core() {
  return (
    <g>
      <ellipse cx="94" cy="104" rx="18" ry="12" fill={SKIN} stroke={INK} strokeWidth="3" />
      <circle cx="96" cy="94" r="15" fill={DARK} stroke={GLOW} strokeWidth="2.5" />
      <circle className="pepe-core-pulse" cx="96" cy="94" r="7" fill={GLOW} />
      <path d="M96 76 V72 M96 112 V116 M78 94 H74 M114 94 H118" stroke={GLOW} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

/** The hero mascot: visor, implant and a hand-held core in one figure. */
export function HeroPepe({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Pepe wearing an AI visor and holding a glowing AI core"
      focusable="false"
    >
      <Face />
      <Chip />
      <Visor />
      <Core />
    </svg>
  );
}
