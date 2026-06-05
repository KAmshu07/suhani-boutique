"use client";

import { upsertSetting } from "@/lib/admin/content-admin";
import { useAdminSetting } from "@/lib/admin/use-admin-rows";
import LocalizedInput from "@/components/admin/LocalizedInput";
import SaveButton from "@/components/admin/SaveButton";
import type { Localized } from "@/lib/localized";

type Announcement = { active: boolean; message: Partial<Localized> };

export default function AnnouncementEditor() {
  const { value, setValue, status } = useAdminSetting<Announcement>("announcement", {
    active: false,
    message: {},
  });

  // Throws on failure so the SaveButton shows its error state.
  function save() {
    return upsertSetting("announcement", value);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Announcement</h2>
        {status && <span className="text-base text-brown-light">{status}</span>}
      </div>
      <p className="text-base text-brown-light">
        Show a banner across the top of the site (for example &ldquo;Closed today&rdquo;). Turn it off to hide it.
      </p>
      <label className="flex items-center gap-2 text-base">
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={value.active}
          onChange={(e) => setValue((v) => ({ ...v, active: e.target.checked }))}
        />
        Show the banner
      </label>
      <LocalizedInput label="Message" value={value.message} onChange={(m) => setValue((v) => ({ ...v, message: m }))} />
      <div>
        <SaveButton onSave={save}>Save</SaveButton>
      </div>
    </div>
  );
}
