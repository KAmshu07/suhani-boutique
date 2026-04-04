import { businessInfo } from "@/data/business-info";
import { EXTERNAL } from "@/data/constants";

export function getWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `${EXTERNAL.WHATSAPP_BASE}/${businessInfo.whatsappNumber}?text=${encoded}`;
}
