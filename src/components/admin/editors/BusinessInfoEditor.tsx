"use client";

import type { ReactNode } from "react";
import { businessInfo } from "@/data/business-info";
import { upsertSetting } from "@/lib/admin/content-admin";
import { useAdminSetting } from "@/lib/admin/use-admin-rows";
import SaveButton from "@/components/admin/SaveButton";
import { ADMIN_FIELD } from "@/data/constants";

type Info = {
  name?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  hours?: { time?: string };
  mapsUrl?: string;
  fullAddress?: string;
  // Other fields (coordinates, mapEmbedSrc, whatsappGreeting…) ride along untouched.
  [k: string]: unknown;
};

const fieldClass = `w-full ${ADMIN_FIELD}`;

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-heading uppercase tracking-wider text-brown-light">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-brown-light/70">{hint}</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-brown-light/15 p-4">
      <h3 className="font-heading text-sm font-semibold uppercase tracking-widest text-gold">{title}</h3>
      {children}
    </div>
  );
}

export default function BusinessInfoEditor() {
  const { value, setValue, status } = useAdminSetting<Info>("business_info", businessInfo as unknown as Info);

  function set(key: string, v: string) {
    setValue((s) => ({ ...s, [key]: v }));
  }
  function setAddr(key: string, v: string) {
    setValue((s) => ({ ...s, address: { ...(s.address ?? {}), [key]: v } }));
  }
  function setHours(v: string) {
    setValue((s) => ({ ...s, hours: { ...(s.hours ?? {}), time: v } }));
  }

  // Throws on failure so the SaveButton shows its error state.
  function save() {
    return upsertSetting("business_info", value);
  }

  const addr = value.address ?? {};

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Business Info</h2>
        {status && <span className="text-base text-brown-light">{status}</span>}
      </div>
      <p className="text-base text-brown-light">
        Your shop&rsquo;s details — shown across the website (footer, contact section, the WhatsApp button).
      </p>

      <Section title="Contact">
        <Row label="Business name">
          <input className={fieldClass} value={value.name ?? ""} onChange={(e) => set("name", e.target.value)} />
        </Row>
        <Row label="Phone">
          <input className={fieldClass} value={value.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        </Row>
        <Row label="WhatsApp number" hint="Digits only, with country code — for example 917903734532.">
          <input className={fieldClass} value={value.whatsappNumber ?? ""} onChange={(e) => set("whatsappNumber", e.target.value)} />
        </Row>
        <Row label="Email">
          <input className={fieldClass} value={value.email ?? ""} onChange={(e) => set("email", e.target.value)} />
        </Row>
        <Row label="Opening hours" hint="For example 11:00 AM – 8:00 PM.">
          <input className={fieldClass} value={value.hours?.time ?? ""} onChange={(e) => setHours(e.target.value)} />
        </Row>
      </Section>

      <Section title="Address">
        <Row label="Address line 1">
          <input className={fieldClass} value={addr.line1 ?? ""} onChange={(e) => setAddr("line1", e.target.value)} />
        </Row>
        <Row label="Address line 2">
          <input className={fieldClass} value={addr.line2 ?? ""} onChange={(e) => setAddr("line2", e.target.value)} />
        </Row>
        <div className="grid grid-cols-3 gap-3">
          <Row label="City">
            <input className={fieldClass} value={addr.city ?? ""} onChange={(e) => setAddr("city", e.target.value)} />
          </Row>
          <Row label="State">
            <input className={fieldClass} value={addr.state ?? ""} onChange={(e) => setAddr("state", e.target.value)} />
          </Row>
          <Row label="Pincode">
            <input className={fieldClass} value={addr.pincode ?? ""} onChange={(e) => setAddr("pincode", e.target.value)} />
          </Row>
        </div>
        <Row label="Address shown on the website" hint="This exact text appears in the contact section and footer.">
          <input className={fieldClass} value={value.fullAddress ?? ""} onChange={(e) => set("fullAddress", e.target.value)} />
        </Row>
      </Section>

      <Section title="Map">
        <Row label="Google Maps link" hint="Open your shop in Google Maps, tap Share, and paste the link here.">
          <input className={fieldClass} value={value.mapsUrl ?? ""} onChange={(e) => set("mapsUrl", e.target.value)} />
        </Row>
      </Section>

      <div>
        <SaveButton onSave={save}>Save</SaveButton>
      </div>
    </div>
  );
}
