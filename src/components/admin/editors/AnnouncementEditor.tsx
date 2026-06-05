"use client";

import { upsertSetting } from "@/lib/admin/content-admin";
import { useAdminSetting } from "@/lib/admin/use-admin-rows";
import LocalizedInput from "@/components/admin/LocalizedInput";
import SaveButton from "@/components/admin/SaveButton";
import Toggle from "@/components/admin/Toggle";
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
        A banner across the top of your website (for example &ldquo;Closed today&rdquo; or &ldquo;Diwali offers on now&rdquo;). Turn it off to hide it.
      </p>
      <Toggle checked={value.active} onChange={(v) => setValue((s) => ({ ...s, active: v }))} label="Show the banner" />
      <LocalizedInput label="Message" value={value.message} onChange={(m) => setValue((v) => ({ ...v, message: m }))} />
      <div>
        <SaveButton onSave={save}>Save</SaveButton>
      </div>
    </div>
  );
}
