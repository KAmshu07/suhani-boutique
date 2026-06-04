"use client";

import {
  listLeads,
  updateLead,
  findOrCreateCustomer,
  createOrder,
} from "@/lib/admin/orders-admin";
import { useAsyncData } from "@/lib/admin/use-admin-rows";

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

const STATUS_COLORS: Record<string, string> = {
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
      setStatus("Failed: " + errMsg(e));
    }
  }

  async function convert(lead: Lead) {
    if (!window.confirm(`Create a customer and a new order for ${lead.name || lead.phone}?`)) return;
    setStatus("Converting…");
    try {
      const customer = await findOrCreateCustomer(lead.phone, lead.name || "");
      await createOrder(customer.id);
      await updateLead(lead.id, { status: "contacted" });
      await reload();
      setStatus(`Order created for ${customer.name || lead.phone}. Open the Orders tab to fill in the garments. ✓`);
    } catch (e) {
      setStatus("Convert failed: " + errMsg(e));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Leads</h2>
        {status && <span className="text-xs text-brown-light">{status}</span>}
      </div>
      <p className="mt-2 text-sm text-brown-light">Booking &amp; contact-form enquiries from the website.</p>

      <div className="mt-4 flex flex-col gap-3">
        {leads.map((lead) => (
          <div key={lead.id} className="border border-brown-light/15 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-brown">
                {lead.name || "(no name)"} · {lead.phone}
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-heading uppercase tracking-wider ${
                  STATUS_COLORS[lead.status] ?? "bg-brown-light/10 text-brown-light"
                }`}
              >
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
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => convert(lead)}
                className="bg-gold text-cream px-4 py-1.5 text-xs font-heading uppercase tracking-wider hover:bg-brown transition-colors"
              >
                Convert to order
              </button>
              {lead.status !== "contacted" && (
                <button
                  onClick={() => setLeadStatus(lead.id, "contacted")}
                  className="text-xs font-heading uppercase tracking-wider text-brown-light hover:text-gold"
                >
                  Mark contacted
                </button>
              )}
              {lead.status !== "archived" && (
                <button
                  onClick={() => setLeadStatus(lead.id, "archived")}
                  className="text-xs font-heading uppercase tracking-wider text-brown-light hover:text-gold"
                >
                  Archive
                </button>
              )}
            </div>
          </div>
        ))}
        {leads.length === 0 && status === "" && (
          <p className="text-sm text-brown-light">No leads yet.</p>
        )}
      </div>
    </div>
  );
}
