"use client";

import { listLeads, updateLead, findOrCreateCustomer, createOrder } from "@/lib/admin/orders-admin";
import { useAsyncData } from "@/lib/admin/use-admin-rows";
import { getContactUrl } from "@/lib/whatsapp";
import { ADMIN_BTN } from "@/data/constants";
import { PhoneIcon, WhatsAppIcon, MessageIcon, CheckIcon } from "@/components/icons";
import EmptyState from "@/components/admin/EmptyState";
import { useConfirm } from "@/components/admin/ConfirmDialog";

type Lead = {
  id: string;
  name: string | null;
  phone: string;
  service_slug: string | null;
  requested_date: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

// Lead status carries its own icon + word (never colour alone). These are lead
// stages (new/contacted/archived), distinct from the 9 order stages.
const LEAD_BADGE: Record<
  string,
  { cls: string; Icon: React.ComponentType<{ className?: string }> | null; label: string }
> = {
  new: { cls: "bg-gold/15 text-brown", Icon: MessageIcon, label: "New" },
  contacted: { cls: "bg-green-100 text-green-800", Icon: CheckIcon, label: "Contacted" },
  archived: { cls: "bg-brown-light/10 text-brown-light", Icon: null, label: "Archived" },
};

export default function LeadsEditor({ onConverted }: { onConverted: (orderId: string) => void }) {
  const confirm = useConfirm();
  const { data: leads, status, setStatus, reload } = useAsyncData<Lead[]>(listLeads, []);

  async function setLeadStatus(id: string, s: string) {
    try {
      await updateLead(id, { status: s });
      await reload();
    } catch (e) {
      setStatus("Problem: " + errMsg(e));
    }
  }

  async function convert(lead: Lead) {
    const ok = await confirm({
      title: "Start an order from this lead?",
      body: (
        <>
          A customer and a new order will be created for <strong>{lead.name || lead.phone}</strong>.
        </>
      ),
      confirmLabel: "Create order",
    });
    if (!ok) return;
    try {
      const customer = await findOrCreateCustomer(lead.phone, lead.name || "");
      const order = await createOrder(customer.id);
      await updateLead(lead.id, { status: "contacted" });
      await reload();
      onConverted(order.id);
    } catch (e) {
      setStatus("Problem: " + errMsg(e));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Leads</h2>
        {status && <span className={`text-base ${/problem/i.test(status) ? "text-red-600" : "text-green-700"}`}>{status}</span>}
      </div>
      <p className="mt-2 text-base text-brown-light">Enquiries that came in from the website.</p>

      <div className="mt-4 flex flex-col gap-2">
        {leads.map((lead) => {
          const badge = LEAD_BADGE[lead.status] ?? LEAD_BADGE.archived;
          const Icon = badge.Icon;
          return (
            <div key={lead.id} className="flex flex-col gap-2 rounded-lg border border-brown-light/15 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-brown">{lead.name || "(no name)"}</span>
                  <span className="text-base text-brown-light">{lead.phone}</span>
                  <a href={`tel:${lead.phone}`} title="Call" aria-label="Call" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-cream-alt hover:bg-gold/20">
                    <PhoneIcon className="h-5 w-5 text-gold" />
                  </a>
                  <a href={getContactUrl(lead.phone)} target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-cream-alt hover:bg-gold/20">
                    <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
                  </a>
                </div>
                <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-sm font-medium ${badge.cls}`}>
                  {Icon && <Icon className="h-4 w-4" />}
                  {badge.label}
                </span>
              </div>
              {(lead.service_slug || lead.requested_date) && (
                <div className="text-sm text-brown-light">
                  {lead.service_slug ? `Service: ${lead.service_slug}` : ""}
                  {lead.requested_date ? `  ·  Date: ${lead.requested_date}` : ""}
                </div>
              )}
              {lead.message && <div className="text-base text-brown-light">{lead.message}</div>}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button onClick={() => convert(lead)} className={ADMIN_BTN.PRIMARY}>
                  Convert to order
                </button>
                {lead.status !== "contacted" && (
                  <button onClick={() => setLeadStatus(lead.id, "contacted")} className={ADMIN_BTN.SECONDARY}>
                    Mark contacted
                  </button>
                )}
                {lead.status !== "archived" && (
                  <button onClick={() => setLeadStatus(lead.id, "archived")} className={ADMIN_BTN.SECONDARY}>
                    Archive
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {leads.length === 0 && status === "" && <EmptyState message="No leads yet — website enquiries will appear here." />}
      </div>
    </div>
  );
}
