"use client";

import { useState } from "react";
import { listCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/lib/admin/orders-admin";
import { useAsyncData } from "@/lib/admin/use-admin-rows";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";

type Customer = { id: string; phone: string; name: string | null; notes: string | null };

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
function waLink(phone: string) {
  const d = phone.replace(/\D/g, "");
  return `https://wa.me/${d.length === 10 ? "91" + d : d}`;
}

const input = "bg-cream-alt border border-brown-light/20 px-3 py-2 text-brown focus:border-gold focus:outline-none rounded";

export default function CustomersEditor() {
  const { data, setData, status, setStatus, reload } = useAsyncData<Customer[]>(listCustomers, []);
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");

  function patch(id: string, p: Partial<Customer>) {
    setData((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)));
  }
  async function save(c: Customer) {
    try {
      await updateCustomer(c.id, { name: c.name, phone: c.phone, notes: c.notes });
      setStatus("Saved ✓");
    } catch (e) {
      setStatus("Problem: " + errMsg(e));
    }
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
      setStatus("Problem: " + errMsg(e));
    }
  }
  async function remove(id: string) {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
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
        {status && <span className="text-xs text-brown-light">{status}</span>}
      </div>

      {adding ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gold/50 p-3">
          <input className={`${input} w-40`} placeholder="Phone number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <input className={`${input} w-44`} placeholder="Name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button onClick={add} className="rounded bg-gold px-4 py-2 text-xs font-heading uppercase tracking-wider text-cream hover:bg-brown">
            Add
          </button>
          <button onClick={() => setAdding(false)} className="text-xs font-heading uppercase tracking-wider text-brown-light hover:text-gold">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 rounded bg-gold px-5 py-2.5 text-sm font-heading uppercase tracking-wider text-cream hover:bg-brown"
        >
          + Add customer
        </button>
      )}

      <input className={`${input} w-full mt-4`} placeholder="Search by name or phone…" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="mt-4 flex flex-col gap-2">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-lg border border-brown-light/15 p-3 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                className={`${input} flex-1 min-w-[9rem]`}
                placeholder="Name"
                value={c.name ?? ""}
                onChange={(e) => patch(c.id, { name: e.target.value })}
                onBlur={() => save(c)}
              />
              <input
                className={`${input} w-36`}
                placeholder="Phone"
                value={c.phone}
                onChange={(e) => patch(c.id, { phone: e.target.value })}
                onBlur={() => save(c)}
              />
              {c.phone && (
                <>
                  <a href={`tel:${c.phone}`} title="Call" className="rounded-full bg-cream-alt p-2 hover:bg-gold/20">
                    <PhoneIcon className="h-4 w-4 text-gold" />
                  </a>
                  <a href={waLink(c.phone)} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="rounded-full bg-cream-alt p-2 hover:bg-gold/20">
                    <WhatsAppIcon className="h-4 w-4 text-whatsapp" />
                  </a>
                </>
              )}
            </div>
            <input
              className={input}
              placeholder="Notes (preferences, sizes, anything to remember…)"
              value={c.notes ?? ""}
              onChange={(e) => patch(c.id, { notes: e.target.value })}
              onBlur={() => save(c)}
            />
            <button onClick={() => remove(c.id)} className="self-start text-xs font-heading uppercase tracking-wider text-red-600 hover:underline">
              ✕ Delete
            </button>
          </div>
        ))}
        {filtered.length === 0 && status === "" && <p className="text-sm text-brown-light">No customers yet.</p>}
      </div>
    </div>
  );
}
