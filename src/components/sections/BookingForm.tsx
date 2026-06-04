"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/use-scroll-animation";
import { getWhatsAppUrl, buildWhatsAppMessage } from "@/lib/whatsapp";
import { SECTION_ID } from "@/data/constants";
import { services } from "@/data/services";
import { businessInfo } from "@/data/business-info";
import { CheckIcon, PhoneIcon, ClockIcon, MapPinIcon } from "@/components/icons";

export default function BookingForm() {
  const { t, language } = useTranslation();
  const ref = useScrollReveal();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const expectItems = [
    t("booking.expect.consultation"),
    t("booking.expect.fabric"),
    t("booking.expect.updates"),
    t("booking.expect.scheduling"),
    t("booking.expect.alterations"),
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const serviceName = service ? t(`services.${service}`) : "";
    const text = buildWhatsAppMessage(businessInfo.whatsappGreeting[language], [
      { label: t("booking.whatsappLabel.name"), value: name },
      { label: t("booking.whatsappLabel.phone"), value: phone },
      { label: t("booking.whatsappLabel.service"), value: serviceName },
      { label: t("booking.whatsappLabel.date"), value: date },
      { label: t("booking.whatsappLabel.notes"), value: message },
    ]);
    window.open(getWhatsAppUrl(text), "_blank", "noopener");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  }

  const inputClass =
    "w-full bg-cream border border-brown-light/20 px-4 py-3 text-brown focus:border-gold focus:outline-none transition-colors font-body";

  return (
    <section id={SECTION_ID.BOOKING} className="bg-cream-alt py-20 md:py-28 px-6">
      <div
        ref={ref}
        className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto"
      >
        {/* Left: Form */}
        <div>
          <h2 className="font-heading text-3xl font-semibold uppercase tracking-widest text-brown">
            {t("booking.title")}
          </h2>
          <div className="w-16 h-px bg-gold mt-4" />

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div>
              <label
                htmlFor="booking-name"
                className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1"
              >
                {t("booking.name")}
              </label>
              <input
                id="booking-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="booking-phone"
                className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1"
              >
                {t("booking.phone")}
              </label>
              <input
                id="booking-phone"
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
                htmlFor="booking-service"
                className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1"
              >
                {t("booking.service")}
              </label>
              <select
                id="booking-service"
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
              <label
                htmlFor="booking-date"
                className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1"
              >
                {t("booking.date")}
              </label>
              <input
                id="booking-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="booking-notes"
                className="block text-sm font-heading uppercase tracking-wider text-brown-light mb-1"
              >
                {t("booking.notes")}
              </label>
              <textarea
                id="booking-notes"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Submit — opens WhatsApp pre-filled with the details above */}
            <div className="mt-6">
              <button
                type="submit"
                className="bg-whatsapp text-white px-8 py-3 font-heading uppercase tracking-wider text-sm hover:opacity-90 transition-opacity"
              >
                {t("booking.submit")}
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
            {t("booking.expectHeading")}
          </h2>
          <div className="w-16 h-px bg-gold mt-4" />

          {/* Checklist */}
          <div className="mt-8 flex flex-col gap-4">
            {expectItems.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
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
              <PhoneIcon className="w-5 h-5 text-gold flex-shrink-0" />
              <span>{businessInfo.phone}</span>
            </a>

            <div className="flex items-start gap-3 text-brown-light text-sm">
              <ClockIcon className="w-5 h-5 text-gold flex-shrink-0" />
              <span>
                {t("footer.openDaily")}: {businessInfo.hours.time}
              </span>
            </div>

            <div className="flex items-start gap-3 text-brown-light text-sm">
              <MapPinIcon className="w-5 h-5 text-gold flex-shrink-0" />
              <span>{businessInfo.fullAddress}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
