"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useScrollAnimation } from "@/lib/use-scroll-animation";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { SECTION_ID } from "@/data/constants";
import { businessInfo } from "@/data/business-info";

export default function Contact() {
  const { t, language } = useTranslation();
  const { ref, isVisible } = useScrollAnimation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const heading =
    language === "hi"
      ? "संपर्क करें"
      : language === "cg"
        ? "संपर्क करव"
        : "Get in Touch";

  const fullAddress = `${businessInfo.address.line1}, ${businessInfo.address.line2} - ${businessInfo.address.pincode}`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  }

  const inputClass =
    "w-full bg-cream border border-brown-light/20 px-4 py-3 text-brown focus:border-gold focus:outline-none transition-colors font-body";

  return (
    <section id={SECTION_ID.CONTACT} className="bg-cream py-20 md:py-28 px-6">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold uppercase tracking-widest text-brown">
            {heading}
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-4" />
        </div>

        {/* Three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Column 1: Contact info */}
          <div className="flex flex-col gap-5">
            {/* WhatsApp */}
            <a
              href={getWhatsAppUrl(businessInfo.whatsappGreeting[language])}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 group"
            >
              <svg
                className="w-5 h-5 text-gold flex-shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
              <div>
                <div className="text-sm font-heading uppercase tracking-wider text-brown group-hover:text-gold transition-colors">
                  {t("common.whatsapp")}
                </div>
                <div className="text-sm text-brown-light mt-0.5">
                  {businessInfo.whatsappNumber}
                </div>
              </div>
            </a>

            {/* Phone */}
            <a
              href={`tel:${businessInfo.phone}`}
              className="flex items-start gap-3 group"
            >
              <svg
                className="w-5 h-5 text-gold flex-shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              <div>
                <div className="text-sm font-heading uppercase tracking-wider text-brown group-hover:text-gold transition-colors">
                  {t("common.call")}
                </div>
                <div className="text-sm text-brown-light mt-0.5">
                  {businessInfo.phone}
                </div>
              </div>
            </a>

            {/* Address */}
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-gold flex-shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-sm text-brown-light">{fullAddress}</span>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-gold flex-shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div className="text-sm text-brown-light">
                <div>
                  {t("footer.weekdays")}: {businessInfo.hours.weekdays}
                </div>
                <div>
                  {t("footer.sunday")}: {businessInfo.hours.sunday}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Map placeholder */}
          <div className="aspect-square md:aspect-auto md:h-full bg-cream-alt border border-brown-light/10 flex flex-col items-center justify-center gap-4">
            <svg
              className="w-16 h-16 text-gold/30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="font-heading uppercase tracking-widest text-brown-light/30 text-sm">
              Map Coming Soon
            </span>
          </div>

          {/* Column 3: Quick contact form */}
          <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1">
                  {t("booking.name")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1">
                  {t("booking.phone")}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1">
                  {t("booking.notes")}
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gold text-cream px-8 py-3 font-heading uppercase tracking-wider text-sm hover:bg-brown transition-colors"
              >
                {t("booking.submit")}
              </button>

              {sent && (
                <div className="bg-gold/10 text-gold p-4 text-center text-sm">
                  {t("booking.success")}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
