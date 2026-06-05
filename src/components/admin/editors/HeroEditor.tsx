"use client";

import { upsertSetting } from "@/lib/admin/content-admin";
import { useAdminSetting } from "@/lib/admin/use-admin-rows";
import { isErrorNotice, friendlyError } from "@/lib/admin/notice";
import ImageUpload from "@/components/admin/ImageUpload";

const HERO_DEFAULT = {
  image_url: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=1920&q=80",
};

export default function HeroEditor() {
  const { value, setValue, status, setStatus } = useAdminSetting<{ image_url: string }>("hero", HERO_DEFAULT);

  async function onUploaded(url: string) {
    setValue({ image_url: url });
    setStatus("Saving…");
    try {
      await upsertSetting("hero", { image_url: url });
      setStatus("Saved ✓");
    } catch (e) {
      setStatus(friendlyError(e, "save"));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Hero Image</h2>
        {status && <span className={`text-base ${isErrorNotice(status) ? "text-red-600" : "text-green-700"}`}>{status}</span>}
      </div>
      <p className="text-base text-brown-light">
        The big background image at the very top of the site. Uploading a new one saves it right away.
      </p>
      <ImageUpload folder="hero" currentUrl={value.image_url} onUploaded={onUploaded} />
    </div>
  );
}
