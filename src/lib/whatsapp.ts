import { businessInfo } from "@/data/business-info";
import { EXTERNAL } from "@/data/constants";

export function getWhatsAppUrl(
  message: string,
  whatsappNumber: string = businessInfo.whatsappNumber,
): string {
  const encoded = encodeURIComponent(message);
  return `${EXTERNAL.WHATSAPP_BASE}/${whatsappNumber}?text=${encoded}`;
}

// Composes a WhatsApp message from a greeting and labeled form fields,
// skipping any field the customer left blank. Shared by the booking and
// contact forms so both produce an identical, predictable message shape.
export function buildWhatsAppMessage(
  greeting: string,
  fields: Array<{ label: string; value: string }>,
): string {
  const lines = fields
    .filter((field) => field.value)
    .map((field) => `${field.label}: ${field.value}`);
  return lines.length ? `${greeting}\n\n${lines.join("\n")}` : greeting;
}
