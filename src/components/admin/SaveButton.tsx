"use client";

import { useEffect, useRef, useState } from "react";
import { ADMIN_BTN } from "@/data/constants";
import { CheckIcon } from "@/components/icons";

// The one async-action button for the admin. Performs onSave(), then SHOWS the
// result at the point of the tap: a spinner while saving, a prominent green
// "✓ Saved" for ~2s on success, and friendly plain copy on failure. Used for
// both per-card saves and discrete actions so feedback is identical everywhere.

type Variant = "primary" | "secondary" | "danger";

const CLASS: Record<Variant, string> = {
  primary: ADMIN_BTN.PRIMARY,
  secondary: ADMIN_BTN.SECONDARY,
  danger: ADMIN_BTN.DANGER,
};

const SAVED_MS = 2000;

export default function SaveButton({
  onSave,
  children,
  variant = "primary",
  savedLabel = "Saved",
  className,
}: {
  onSave: () => Promise<void>;
  children: React.ReactNode;
  variant?: Variant;
  savedLabel?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  async function handle() {
    setState("saving");
    try {
      await onSave();
      setState("saved");
      timer.current = window.setTimeout(() => setState("idle"), SAVED_MS);
    } catch {
      setState("error");
    }
  }

  if (state === "saved") {
    return (
      <span className={`${ADMIN_BTN.PRIMARY} pointer-events-none bg-green-700 hover:bg-green-700 ${className ?? ""}`}>
        <CheckIcon className="h-5 w-5" /> {savedLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button onClick={handle} disabled={state === "saving"} className={`${CLASS[variant]} ${className ?? ""}`}>
        {state === "saving" ? "…" : children}
      </button>
      {state === "error" && (
        <span className="text-sm text-red-600">Could not save — check your internet and try again.</span>
      )}
    </span>
  );
}
