"use client";

import { upsertSetting } from "@/lib/admin/content-admin";
import { useAdminSetting } from "@/lib/admin/use-admin-rows";
import LocalizedInput from "@/components/admin/LocalizedInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import { ABOUT_DEFAULTS, type AboutContent } from "@/lib/about-defaults";
import { ADMIN_FIELD } from "@/data/constants";

const fieldClass = `w-full ${ADMIN_FIELD}`;

export default function AboutEditor() {
  const { value, setValue, status } = useAdminSetting<AboutContent>("about", ABOUT_DEFAULTS);

  function setStat(key: "experience" | "customers" | "specialties", v: string) {
    setValue((s) => ({ ...s, stats: { ...s.stats, [key]: v } }));
  }

  // Throws on failure so the SaveButton shows its error state.
  function save() {
    return upsertSetting("about", value);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">About</h2>
        {status && <span className="text-base text-brown-light">{status}</span>}
      </div>
      <p className="text-base text-brown-light">Your &ldquo;Our Story&rdquo; section on the website.</p>

      <LocalizedInput label="Heading" value={value.heading} onChange={(v) => setValue((s) => ({ ...s, heading: v }))} />
      <LocalizedInput label="Story" multiline value={value.story} onChange={(v) => setValue((s) => ({ ...s, story: v }))} />

      <div>
        <p className="mb-2 text-sm font-heading uppercase tracking-wider text-brown-light">Photo (shown next to your story)</p>
        <ImageUpload folder="about" currentUrl={value.image_url} onUploaded={(url) => setValue((s) => ({ ...s, image_url: url }))} />
      </div>

      <div>
        <p className="mb-2 text-sm font-heading uppercase tracking-wider text-brown-light">Highlights</p>
        <p className="mb-3 text-xs text-brown-light/70">Short numbers shown as badges — for example 20+, 1000+, 6.</p>
        <div className="grid grid-cols-3 gap-3">
          <label className="text-sm text-brown-light">
            Years of experience
            <input className={`${fieldClass} mt-1`} value={value.stats.experience} onChange={(e) => setStat("experience", e.target.value)} />
          </label>
          <label className="text-sm text-brown-light">
            Happy customers
            <input className={`${fieldClass} mt-1`} value={value.stats.customers} onChange={(e) => setStat("customers", e.target.value)} />
          </label>
          <label className="text-sm text-brown-light">
            Specialties
            <input className={`${fieldClass} mt-1`} value={value.stats.specialties} onChange={(e) => setStat("specialties", e.target.value)} />
          </label>
        </div>
      </div>

      <div>
        <SaveButton onSave={save}>Save</SaveButton>
      </div>
    </div>
  );
}
