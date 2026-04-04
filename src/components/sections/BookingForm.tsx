"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useScrollAnimation } from "@/lib/use-scroll-animation";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { SECTION_ID } from "@/data/constants";
import { services } from "@/data/services";
import { businessInfo } from "@/data/business-info";

export default function BookingForm() {
  const { t, language } = useTranslation();
  const { ref, isVisible } = useScrollAnimation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const expectHeading =
    language === "hi"
      ? "क्या उम्मीद करें"
      : language === "cg"
        ? "का उम्मीद करव"
        : "What to Expect";

  const expectItems =
    language === "hi"
      ? [
          "मुफ्त परामर्श और माप",
          "कपड़ा चयन मार्गदर्शन",
          "WhatsApp पर नियमित प्रगति अपडेट",
          "लचीला शेड्यूलिंग",
          "अल्टरेशन शामिल",
        ]
      : language === "cg"
        ? [
            "मुफ्त परामर्श अउ माप",
            "कपड़ा चयन मार्गदर्शन",
            "WhatsApp म नियमित प्रगति अपडेट",
            "लचीला शेड्यूलिंग",
            "अल्टरेशन शामिल",
          ]
        : [
            "Free consultation and measurements",
            "Fabric selection guidance",
            "Regular progress updates via WhatsApp",
            "Flexible scheduling",
            "Alterations included",
          ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  }

  function handleWhatsApp() {
    const serviceName = service ? t(`services.${service}`) : "";
    const parts = [
      name && `Name: ${name}`,
      phone && `Phone: ${phone}`,
      serviceName && `Service: ${serviceName}`,
      date && `Date: ${date}`,
      message && `Notes: ${message}`,
    ].filter(Boolean);

    const text = parts.length
      ? `${businessInfo.whatsappGreeting[language]}\n\n${parts.join("\n")}`
      : businessInfo.whatsappGreeting[language];

    window.open(getWhatsAppUrl(text), "_blank", "noopener");
  }

  const inputClass =
    "w-full bg-cream border border-brown-light/20 px-4 py-3 text-brown focus:border-gold focus:outline-none transition-colors font-body";

  const fullAddress = `${businessInfo.address.line1}, ${businessInfo.address.line2} - ${businessInfo.address.pincode}`;

  return (
    <section id={SECTION_ID.BOOKING} className="bg-cream-alt py-20 md:py-28 px-6">
      <div
        ref={ref}
        className={`grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Left: Form */}
        <div>
          <h2 className="font-heading text-3xl font-semibold uppercase tracking-widest text-brown">
            {t("booking.title")}
          </h2>
          <div className="w-16 h-px bg-gold mt-4" />

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
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
                {t("booking.service")}
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className={inputClass}
              >
                <option value="" />
                {services.map((s) => (
                  <option key={s.key} value={s.key}>
                    {t(`services.${s.key}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1">
                {t("booking.date")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1">
                {t("booking.notes")}
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Submit buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="bg-gold text-cream px-8 py-3 font-heading uppercase tracking-wider text-sm hover:bg-brown transition-colors"
              >
                {t("booking.submit")}
              </button>
              <button
                type="button"
                onClick={handleWhatsApp}
                className="bg-whatsapp text-white px-8 py-3 font-heading uppercase tracking-wider text-sm hover:opacity-90 transition-opacity"
              >
                {t("common.whatsapp")}
              </button>
            </div>

            {success && (
              <div className="bg-gold/10 text-gold p-4 mt-4 text-center">
                {t("booking.success")}
              </div>
            )}
          </form>
        </div>

        {/* Right: Business info */}
        <div>
          <h2 className="font-heading text-3xl font-semibold uppercase tracking-widest text-brown">
            {expectHeading}
          </h2>
          <div className="w-16 h-px bg-gold mt-4" />

          {/* Checklist */}
          <div className="mt-8 flex flex-col gap-4">
            {expectItems.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-gold flex-shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-brown-light">{item}</span>
              </div>
            ))}
          </div>

          {/* Contact info */}
          <div className="mt-10 flex flex-col gap-4">
            <a
              href={`tel:${businessInfo.phone}`}
              className="flex items-start gap-3 text-brown-light text-sm hover:text-gold transition-colors"
            >
              <svg
                className="w-5 h-5 text-gold flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              <span>{businessInfo.phone}</span>
            </a>

            <div className="flex items-start gap-3 text-brown-light text-sm">
              <svg
                className="w-5 h-5 text-gold flex-shrink-0"
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
              <span>
                {t("footer.weekdays")}: {businessInfo.hours.weekdays}
                <br />
                {t("footer.sunday")}: {businessInfo.hours.sunday}
              </span>
            </div>

            <div className="flex items-start gap-3 text-brown-light text-sm">
              <svg
                className="w-5 h-5 text-gold flex-shrink-0"
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
              <span>{fullAddress}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
