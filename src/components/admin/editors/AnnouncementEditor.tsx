"use client";

import { upsertSetting } from "@/lib/admin/content-admin";
import { useAdminSetting } from "@/lib/admin/use-admin-rows";
import LocalizedInput from "@/components/admin/LocalizedInput";
import type { Localized } from "@/lib/localized";

type Announcement = { active: boolean; message: Partial<Localized> };

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

export default function AnnouncementEditor() {
  const { value, setValue, status, setStatus } = useAdminSetting<Announcement>("announcement", {
    active: false,
    message: {},
  });

  async function save() {
    setStatus("Saving…");
    try {
      await upsertSetting("announcement", value);
      setStatus("Saved ✓");
    } catch (e) {
      setStatus("Save failed: " + errMsg(e));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Announcement</h2>
        {status && <span className="text-xs text-brown-light">{status}</span>}
      </div>
      <p className="text-sm text-brown-light">
        Show a banner across the top of the site (for example &ldquo;Closed today&rdquo;). Turn it off to hide it.
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.active}
          onChange={(e) => setValue((v) => ({ ...v, active: e.target.checked }))}
        />
        Show the banner
      </label>
      <LocalizedInput
        label="Message"
        value={value.message}
        onChange={(m) => setValue((v) => ({ ...v, message: m }))}
      />
      <div>
        <button
          onClick={save}
          className="bg-gold text-cream px-5 py-2 text-xs font-heading uppercase tracking-wider hover:bg-brown transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}
