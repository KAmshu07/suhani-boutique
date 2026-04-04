"use client";

import { useTranslation } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/use-scroll-animation";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { SECTION_ID } from "@/data/constants";
import { services } from "@/data/services";

function ServiceIcon({ name }: { name: string }) {
  const cls = "w-10 h-10 text-gold stroke-current";

  switch (name) {
    case "scissors":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      );
    case "ruler":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.73 18l-8-14a2 2 0 00-3.48 0l-8 14A2 2 0 004 21h16a2 2 0 001.73-3z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="10" y1="11" x2="14" y2="11" />
        </svg>
      );
    case "crown":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20h20" />
          <path d="M4 17l2-12 4 5 2-6 2 6 4-5 2 12" />
        </svg>
      );
    case "fabric":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6c4-2 6 2 10 0s6-2 10 0" />
          <path d="M2 12c4-2 6 2 10 0s6-2 10 0" />
          <path d="M2 18c4-2 6 2 10 0s6-2 10 0" />
        </svg>
      );
    case "shirt":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a1 1 0 001 1h10a1 1 0 001-1V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
        </svg>
      );
    case "sparkles":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
          <path d="M19 15l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Services() {
  const { t } = useTranslation();
  const ref = useScrollReveal();

  return (
    <section id={SECTION_ID.SERVICES} className="bg-cream-alt py-20 md:py-28 px-6">
      <div
        ref={ref}
        className="scroll-reveal"
      >
        {/* Section heading */}
        <h2 className="font-heading text-3xl md:text-4xl font-semibold uppercase tracking-widest text-brown text-center">
          {t("services.title")}
        </h2>
        <div className="w-16 h-px bg-gold mx-auto mt-4 mb-12" />

        {/* Service cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service) => {
            const serviceName = t(`services.${service.key}`);
            const whatsappUrl = getWhatsAppUrl(
              t("services.whatsappInquiry") + " " + serviceName
            );

            return (
              <div
                key={service.key}
                className="stagger-child bg-cream rounded-none p-8 hover:shadow-lg transition-shadow"
              >
                <ServiceIcon name={service.icon} />
                <h3 className="font-heading text-lg font-semibold uppercase tracking-wider text-brown mt-4">
                  {serviceName}
                </h3>
                <p className="text-sm text-brown-light mt-2">
                  {`\u20B9${service.priceRange}`}
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-gold font-heading uppercase tracking-wider text-sm hover:text-brown transition-colors"
                >
                  {t("services.enquire")}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
