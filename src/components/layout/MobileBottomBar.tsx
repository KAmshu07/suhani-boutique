"use client";

import { useTranslation } from "@/lib/i18n";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { businessInfo } from "@/data/business-info";
import { WhatsAppIcon, PhoneIcon } from "@/components/icons";

export default function MobileBottomBar() {
  const { t, language } = useTranslation();

  const whatsappUrl = getWhatsAppUrl(
    businessInfo.whatsappGreeting[language as keyof typeof businessInfo.whatsappGreeting],
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-3 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden">
      {/* WhatsApp button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-whatsapp px-4 py-3 font-body text-sm font-medium text-white transition-all duration-300 active:scale-95"
      >
        <WhatsAppIcon className="h-5 w-5" />
        {t("common.whatsapp")}
      </a>

      {/* Call button */}
      <a
        href={`tel:${businessInfo.phone}`}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-body text-sm font-medium text-cream transition-all duration-300 active:scale-95"
      >
        <PhoneIcon className="h-5 w-5" />
        {t("common.call")}
      </a>
    </div>
  );
}
