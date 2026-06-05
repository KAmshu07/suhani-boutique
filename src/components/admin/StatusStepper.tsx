"use client";

import { useState } from "react";
import { ORDER_STAGE_SEQUENCE } from "@/data/constants";
import { useTranslation } from "@/lib/i18n";
import {
  CheckIcon,
  MessageIcon,
  RulerIcon,
  ScissorsIcon,
  HangerIcon,
} from "@/components/icons";

// One status display for the whole admin (replaces the tappable raw progress
// bar, the per-garment <select>, and the colour-only lead badge). State is
// shown with icon + word + position, never colour alone. Labels come from the
// canonical translations.ts status.* keys (single source).
//
// - "bar":    full segmented indicator + big label (order detail). VIEW-ONLY;
//             if onSelect is given, each ≥44px segment calls it (caller confirms).
// - "mini":   the thin bar only (list cards). Never interactive.
// - "inline": current stage as an icon+word badge; with onSelect it expands to
//             nine big stage buttons (garment / lead).

type Variant = "bar" | "mini" | "inline";

const STAGE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  booked: CheckIcon,
  consulted: MessageIcon,
  measured: RulerIcon,
  fabric_selected: ScissorsIcon,
  in_progress: ScissorsIcon,
  ready_for_fitting: HangerIcon,
  alterations: ScissorsIcon,
  completed: CheckIcon,
  delivered: CheckIcon,
};

const STAGES: readonly string[] = ORDER_STAGE_SEQUENCE;

export default function StatusStepper({
  current,
  onSelect,
  variant = "bar",
}: {
  current: string;
  onSelect?: (key: string) => void;
  variant?: Variant;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const idx = Math.max(0, STAGES.indexOf(current));
  const label = (key: string) => t("status." + key);
  const CurrentIcon = STAGE_ICON[current] ?? CheckIcon;

  if (variant === "mini") {
    return (
      <div className="flex gap-0.5" aria-label={label(current)}>
        {STAGES.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-gold" : "bg-brown-light/15"}`}
          />
        ))}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onSelect && setExpanded((v) => !v)}
          className="flex min-h-[44px] items-center gap-2 self-start rounded-lg bg-cream-alt px-3 py-2 text-base text-brown"
        >
          <CurrentIcon className="h-5 w-5 text-gold" />
          <span>{label(current)}</span>
          {onSelect && <span className="text-brown-light">▾</span>}
        </button>
        {expanded && onSelect && (
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => {
              const StageIcon = STAGE_ICON[s] ?? CheckIcon;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setExpanded(false);
                    onSelect(s);
                  }}
                  className={`flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${
                    s === current ? "border-gold bg-gold/10" : "border-brown-light/20"
                  }`}
                >
                  <StageIcon className="h-4 w-4 text-gold" /> {label(s)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // variant === "bar"
  return (
    <div>
      <div className="flex gap-1">
        {STAGES.map((s, i) => {
          const seg = (
            <span
              className={`block h-3 w-full rounded-full ${i <= idx ? "bg-gold" : "bg-brown-light/20"}`}
            />
          );
          return onSelect ? (
            <button
              key={s}
              type="button"
              title={label(s)}
              aria-label={label(s)}
              onClick={() => onSelect(s)}
              className="flex min-h-[44px] flex-1 items-center"
            >
              {seg}
            </button>
          ) : (
            <span key={s} className="flex-1">
              {seg}
            </span>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-2 text-brown">
        <CurrentIcon className="h-6 w-6 text-gold" />
        <span className="font-heading text-lg font-semibold">{label(current)}</span>
        <span className="text-sm text-brown-light">
          ({idx + 1} of {STAGES.length})
        </span>
      </div>
    </div>
  );
}
