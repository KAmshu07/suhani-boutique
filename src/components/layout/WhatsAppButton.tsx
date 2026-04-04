"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { businessInfo } from "@/data/business-info";
import { ANIMATION } from "@/data/constants";
import { WhatsAppIcon } from "@/components/icons";

export default function WhatsAppButton() {
  const { language } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), ANIMATION.WHATSAPP_BOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const whatsappUrl = getWhatsAppUrl(
    businessInfo.whatsappGreeting[language as keyof typeof businessInfo.whatsappGreeting],
  );

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={`fixed z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-whatsapp shadow-lg transition-all duration-300 hover:scale-110 right-4 bottom-20 md:right-6 md:bottom-6 md:flex ${
        visible
          ? "scale-100 opacity-100"
          : "scale-0 opacity-0"
      }`}
      style={{
        transitionTimingFunction: visible ? "cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
      }}
    >
      <WhatsAppIcon className="h-7 w-7 text-white" />
    </a>
  );
}
