"use client";

import { upsertSetting } from "@/lib/admin/content-admin";
import { useAdminSetting } from "@/lib/admin/use-admin-rows";
import LocalizedInput from "@/components/admin/LocalizedInput";
import ImageUpload from "@/components/admin/ImageUpload";
import { ABOUT_DEFAULTS, type AboutContent } from "@/lib/about-defaults";

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

const fieldClass =
  "w-full bg-cream-alt border border-brown-light/20 px-3 py-2 text-brown text-sm focus:border-gold focus:outline-none";

export default function AboutEditor() {
  const { value, setValue, status, setStatus } = useAdminSetting<AboutContent>("about", ABOUT_DEFAULTS);

  function setStat(key: "experience" | "customers" | "specialties", v: string) {
    setValue((s) => ({ ...s, stats: { ...s.stats, [key]: v } }));
  }

  async function save() {
    setStatus("Saving…");
    try {
      await upsertSetting("about", value);
      setStatus("Saved ✓");
    } catch (e) {
      setStatus("Save failed: " + errMsg(e));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">About</h2>
        {status && <span className="text-xs text-brown-light">{status}</span>}
      </div>

      <LocalizedInput label="Heading" value={value.heading} onChange={(v) => setValue((s) => ({ ...s, heading: v }))} />
      <LocalizedInput label="Story" multiline value={value.story} onChange={(v) => setValue((s) => ({ ...s, story: v }))} />

      <div>
        <p className="text-xs font-heading uppercase tracking-wider text-brown-light mb-2">Photo</p>
        <ImageUpload
          folder="about"
          currentUrl={value.image_url}
          onUploaded={(url) => setValue((s) => ({ ...s, image_url: url }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="text-xs text-brown-light">
          Experience
          <input className={fieldClass} value={value.stats.experience} onChange={(e) => setStat("experience", e.target.value)} />
        </label>
        <label className="text-xs text-brown-light">
          Customers
          <input className={fieldClass} value={value.stats.customers} onChange={(e) => setStat("customers", e.target.value)} />
        </label>
        <label className="text-xs text-brown-light">
          Specialties
          <input className={fieldClass} value={value.stats.specialties} onChange={(e) => setStat("specialties", e.target.value)} />
        </label>
      </div>

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
