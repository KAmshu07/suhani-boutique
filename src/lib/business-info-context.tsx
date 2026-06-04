"use client";

import { createContext, useContext, type ReactNode } from "react";
import { businessInfo as fallback } from "@/data/business-info";
import { getSettings } from "@/lib/content";
import { useLiveContent } from "@/lib/use-content";
import { getWhatsAppUrl } from "@/lib/whatsapp";

type Info = typeof fallback;

async function fetchInfo(): Promise<Info> {
  const s = await getSettings();
  return (s.business_info as Info) ?? fallback;
}

// Provides the business info (phone, address, hours, WhatsApp…) app-wide, fetched
// once from the DB with the static data as the fallback. Consumers read it via
// useBusinessInfo() / useWhatsAppUrl() so a change Mom makes shows up everywhere.
const Ctx = createContext<Info>(fallback);

export function BusinessInfoProvider({ children }: { children: ReactNode }) {
  const { data } = useLiveContent(fetchInfo, fallback);
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export function useBusinessInfo(): Info {
  return useContext(Ctx);
}

// Builds a WhatsApp URL with the live shop number.
export function useWhatsAppUrl() {
  const info = useBusinessInfo();
  return (message: string) => getWhatsAppUrl(message, info.whatsappNumber);
}
