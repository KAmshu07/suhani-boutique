"use client";

import { listLeads, updateLead, findOrCreateCustomer, createOrder } from "@/lib/admin/orders-admin";
import { useAsyncData } from "@/lib/admin/use-admin-rows";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";

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
function waLink(phone: string) {
  const d = phone.replace(/\D/g, "");
  return `https://wa.me/${d.length === 10 ? "91" + d : d}`;
}

const BADGE: Record<string, string> = {
  new: "bg-gold text-cream",
  contacted: "bg-brown-light/20 text-brown",
  archived: "bg-brown-light/10 text-brown-light",
};

export default function LeadsEditor() {
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
    if (!window.confirm(`Create a customer and a new order for ${lead.name || lead.phone}?`)) return;
    try {
      const customer = await findOrCreateCustomer(lead.phone, lead.name || "");
      await createOrder(customer.id);
      await updateLead(lead.id, { status: "contacted" });
      await reload();
      setStatus(`Order started for ${customer.name || lead.phone} — see the Orders tab ✓`);
    } catch (e) {
      setStatus("Problem: " + errMsg(e));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Leads</h2>
        {status && <span className="text-xs text-brown-light">{status}</span>}
      </div>
      <p className="mt-2 text-sm text-brown-light">Enquiries that came in from the website.</p>

      <div className="mt-4 flex flex-col gap-2">
        {leads.map((lead) => (
          <div key={lead.id} className="rounded-lg border border-brown-light/15 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-brown">{lead.name || "(no name)"}</span>
                <span className="text-sm text-brown-light">{lead.phone}</span>
                <a href={`tel:${lead.phone}`} title="Call" className="rounded-full bg-cream-alt p-1.5 hover:bg-gold/20">
                  <PhoneIcon className="h-4 w-4 text-gold" />
                </a>
                <a href={waLink(lead.phone)} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="rounded-full bg-cream-alt p-1.5 hover:bg-gold/20">
                  <WhatsAppIcon className="h-4 w-4 text-whatsapp" />
                </a>
              </div>
              <span className={`rounded px-2 py-0.5 text-[10px] font-heading uppercase tracking-wider ${BADGE[lead.status] ?? "bg-brown-light/10 text-brown-light"}`}>
                {lead.status}
              </span>
            </div>
            {(lead.service_slug || lead.requested_date) && (
              <div className="text-xs text-brown-light">
                {lead.service_slug ? `Service: ${lead.service_slug}` : ""}
                {lead.requested_date ? `  ·  Date: ${lead.requested_date}` : ""}
              </div>
            )}
            {lead.message && <div className="text-sm text-brown-light">{lead.message}</div>}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => convert(lead)}
                className="rounded bg-gold px-4 py-2 text-xs font-heading uppercase tracking-wider text-cream hover:bg-brown"
              >
                Convert to order
              </button>
              {lead.status !== "contacted" && (
                <button onClick={() => setLeadStatus(lead.id, "contacted")} className="text-xs font-heading uppercase tracking-wider text-brown-light hover:text-gold">
                  Mark contacted
                </button>
              )}
              {lead.status !== "archived" && (
                <button onClick={() => setLeadStatus(lead.id, "archived")} className="text-xs font-heading uppercase tracking-wider text-brown-light hover:text-gold">
                  Archive
                </button>
              )}
            </div>
          </div>
        ))}
        {leads.length === 0 && status === "" && <p className="text-sm text-brown-light">No leads yet.</p>}
      </div>
    </div>
  );
}
