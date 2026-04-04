"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/use-scroll-animation";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { SECTION_ID } from "@/data/constants";
import { businessInfo } from "@/data/business-info";
import { MessageIcon, PhoneIcon, MapPinIcon, ClockIcon } from "@/components/icons";

export default function Contact() {
  const { t, language } = useTranslation();
  const ref = useScrollReveal();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

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
        className="scroll-reveal max-w-6xl mx-auto"
      >
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold uppercase tracking-widest text-brown">
            {t("contact.heading")}
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
              <MessageIcon className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
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
              <PhoneIcon className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
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
              <MapPinIcon className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <span className="text-sm text-brown-light">{businessInfo.fullAddress}</span>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-3">
              <ClockIcon className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
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
            <MapPinIcon className="w-16 h-16 text-gold/30" />
            <span className="font-heading uppercase tracking-widest text-brown-light/30 text-sm">
              {t("contact.mapPlaceholder")}
            </span>
          </div>

          {/* Column 3: Quick contact form */}
          <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1"
                >
                  {t("booking.name")}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1"
                >
                  {t("booking.phone")}
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1"
                >
                  {t("booking.notes")}
                </label>
                <textarea
                  id="contact-message"
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
                  {t("contact.messageSent")}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
