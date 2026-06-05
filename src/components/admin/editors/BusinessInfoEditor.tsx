"use client";

import type { ReactNode } from "react";
import { businessInfo } from "@/data/business-info";
import { upsertSetting } from "@/lib/admin/content-admin";
import { useAdminSetting } from "@/lib/admin/use-admin-rows";
import SaveButton from "@/components/admin/SaveButton";

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

const fieldClass =
  "w-full bg-cream-alt border border-brown-light/20 px-3 py-2 text-base text-brown focus:border-gold focus:outline-none rounded";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-heading uppercase tracking-wider text-brown-light">{label}</span>
      {children}
    </label>
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

      <Row label="Business name">
        <input className={fieldClass} value={value.name ?? ""} onChange={(e) => set("name", e.target.value)} />
      </Row>
      <Row label="Phone">
        <input className={fieldClass} value={value.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
      </Row>
      <Row label="WhatsApp number (digits only, e.g. 917903734532)">
        <input className={fieldClass} value={value.whatsappNumber ?? ""} onChange={(e) => set("whatsappNumber", e.target.value)} />
      </Row>
      <Row label="Email">
        <input className={fieldClass} value={value.email ?? ""} onChange={(e) => set("email", e.target.value)} />
      </Row>
      <Row label="Hours">
        <input className={fieldClass} value={value.hours?.time ?? ""} onChange={(e) => setHours(e.target.value)} />
      </Row>
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
      <Row label="Full address (shown on the site)">
        <input className={fieldClass} value={value.fullAddress ?? ""} onChange={(e) => set("fullAddress", e.target.value)} />
      </Row>
      <Row label="Google Maps link">
        <input className={fieldClass} value={value.mapsUrl ?? ""} onChange={(e) => set("mapsUrl", e.target.value)} />
      </Row>

      <div>
        <SaveButton onSave={save}>Save</SaveButton>
      </div>
    </div>
  );
}
