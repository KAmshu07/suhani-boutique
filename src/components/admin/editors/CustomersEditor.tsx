"use client";

import { useState } from "react";
import { listCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/lib/admin/orders-admin";
import { useAsyncData } from "@/lib/admin/use-admin-rows";
import { getContactUrl } from "@/lib/whatsapp";
import { ADMIN_BTN, ADMIN_FIELD } from "@/data/constants";
import { isErrorNotice, friendlyError } from "@/lib/admin/notice";
import { PhoneIcon, WhatsAppIcon, TrashIcon } from "@/components/icons";
import SaveButton from "@/components/admin/SaveButton";
import EmptyState from "@/components/admin/EmptyState";
import { useConfirm } from "@/components/admin/ConfirmDialog";

type Customer = { id: string; phone: string; name: string | null; notes: string | null };

const input = ADMIN_FIELD;

export default function CustomersEditor() {
  const confirm = useConfirm();
  const { data, setData, status, setStatus, reload } = useAsyncData<Customer[]>(listCustomers, []);
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");

  function patch(id: string, p: Partial<Customer>) {
    setData((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)));
  }
  async function add() {
    if (!newPhone.trim()) {
      setStatus("Enter a phone number first.");
      return;
    }
    try {
      await createCustomer({ phone: newPhone.trim(), name: newName.trim() || null });
      setNewPhone("");
      setNewName("");
      setAdding(false);
      await reload();
      setStatus("Added ✓");
    } catch (e) {
      setStatus(friendlyError(e, "add the customer"));
    }
  }
  async function remove(c: Customer) {
    const ok = await confirm({
      title: "Delete this customer?",
      body: (
        <>
          {c.name || "(no name)"} — {c.phone}
        </>
      ),
      danger: true,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      await deleteCustomer(c.id);
      await reload();
    } catch {
      setStatus("Can't delete — this customer has orders.");
    }
  }

  const filtered = data.filter((c) => `${c.name ?? ""} ${c.phone}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Customers</h2>
        {status && <span className={`text-base ${isErrorNotice(status) ? "text-red-600" : "text-green-700"}`}>{status}</span>}
      </div>

      {adding ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gold/50 p-3">
          <input className={`${input} w-44`} placeholder="Phone number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <input className={`${input} w-48`} placeholder="Name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button onClick={add} className={ADMIN_BTN.PRIMARY}>
            Add
          </button>
          <button onClick={() => setAdding(false)} className={ADMIN_BTN.SECONDARY}>
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className={`mt-3 ${ADMIN_BTN.PRIMARY}`}>
          + Add customer
        </button>
      )}

      <input className={`${input} mt-4 w-full`} placeholder="Search by name or phone…" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="mt-4 flex flex-col gap-2">
        {filtered.map((c) => (
          <div key={c.id} className="flex flex-col gap-2 rounded-lg border border-brown-light/15 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                className={`${input} min-w-[9rem] flex-1`}
                placeholder="Name"
                value={c.name ?? ""}
                onChange={(e) => patch(c.id, { name: e.target.value })}
              />
              <input
                className={`${input} w-40`}
                placeholder="Phone"
                value={c.phone}
                onChange={(e) => patch(c.id, { phone: e.target.value })}
              />
              {c.phone && (
                <>
                  <a href={`tel:${c.phone}`} title="Call" aria-label="Call" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-cream-alt hover:bg-gold/20">
                    <PhoneIcon className="h-5 w-5 text-gold" />
                  </a>
                  <a href={getContactUrl(c.phone)} target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-cream-alt hover:bg-gold/20">
                    <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
                  </a>
                </>
              )}
            </div>
            <input
              className={input}
              placeholder="Notes (preferences, sizes, anything to remember…)"
              value={c.notes ?? ""}
              onChange={(e) => patch(c.id, { notes: e.target.value })}
            />
            <div className="flex items-center justify-between">
              <SaveButton
                variant="secondary"
                onSave={() => updateCustomer(c.id, { name: c.name, phone: c.phone, notes: c.notes })}
              >
                Save
              </SaveButton>
              <button
                onClick={() => remove(c)}
                className="flex min-h-[44px] items-center gap-1 text-base font-medium text-red-600 hover:underline"
              >
                <TrashIcon className="h-5 w-5" /> Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && status === "" && (
          <EmptyState message="No customers yet.">
            <button onClick={() => setAdding(true)} className={ADMIN_BTN.PRIMARY}>
              + Add customer
            </button>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
