"use client";

// A clear on/off switch (green = on) with a tappable label. Friendlier than a
// bare checkbox for "Show on website" and similar visibility flags.
export default function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-base text-brown"
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-green-600" : "bg-brown-light/30"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
      {label}
    </button>
  );
}
