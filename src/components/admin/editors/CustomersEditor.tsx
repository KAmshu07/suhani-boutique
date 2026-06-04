"use client";

import { useState } from "react";
import {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/lib/admin/orders-admin";
import { useAsyncData } from "@/lib/admin/use-admin-rows";

type Customer = { id: string; phone: string; name: string | null; notes: string | null };

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

const fieldClass =
  "bg-cream-alt border border-brown-light/20 px-2 py-1.5 text-brown text-sm focus:border-gold focus:outline-none";

export default function CustomersEditor() {
  const { data, setData, status, setStatus, reload } = useAsyncData<Customer[]>(listCustomers, []);
  const [q, setQ] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");

  function patch(id: string, p: Partial<Customer>) {
    setData((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)));
  }

  async function add() {
    if (!newPhone.trim()) {
      setStatus("Phone is required");
      return;
    }
    setStatus("Saving…");
    try {
      await createCustomer({ phone: newPhone.trim(), name: newName.trim() || null });
      setNewPhone("");
      setNewName("");
      await reload();
      setStatus("Added ✓");
    } catch (e) {
      setStatus("Add failed: " + errMsg(e));
    }
  }

  async function save(c: Customer) {
    setStatus("Saving…");
    try {
      await updateCustomer(c.id, { name: c.name, phone: c.phone, notes: c.notes });
      setStatus("Saved ✓");
    } catch (e) {
      setStatus("Save failed: " + errMsg(e));
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
      await reload();
    } catch {
      setStatus("Cannot delete — this customer has orders. Delete their orders first.");
    }
  }

  const filtered = data.filter((c) =>
    `${c.name ?? ""} ${c.phone}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Customers</h2>
        {status && <span className="text-xs text-brown-light">{status}</span>}
      </div>

      {/* Add */}
      <div className="mt-4 flex flex-wrap items-end gap-2 border border-dashed border-brown-light/25 p-3">
        <input
          className={`${fieldClass} w-40`}
          placeholder="Phone"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
        />
        <input
          className={`${fieldClass} w-44`}
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          onClick={add}
          className="bg-gold text-cream px-4 py-1.5 text-xs font-heading uppercase tracking-wider hover:bg-brown transition-colors"
        >
          + Add customer
        </button>
      </div>

      {/* Search */}
      <input
        className={`${fieldClass} w-full mt-4`}
        placeholder="Search by name or phone…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="mt-4 flex flex-col gap-3">
        {filtered.map((c) => (
          <div key={c.id} className="border border-brown-light/15 p-3 flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <input
                className={`${fieldClass} w-44`}
                value={c.name ?? ""}
                placeholder="Name"
                onChange={(e) => patch(c.id, { name: e.target.value })}
              />
              <input
                className={`${fieldClass} w-40`}
                value={c.phone}
                placeholder="Phone"
                onChange={(e) => patch(c.id, { phone: e.target.value })}
              />
            </div>
            <input
              className={fieldClass}
              value={c.notes ?? ""}
              placeholder="Notes (preferences, etc.)"
              onChange={(e) => patch(c.id, { notes: e.target.value })}
            />
            <div className="flex gap-4">
              <button
                onClick={() => save(c)}
                className="bg-gold text-cream px-4 py-1.5 text-xs font-heading uppercase tracking-wider hover:bg-brown transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => remove(c.id)}
                className="text-xs font-heading uppercase tracking-wider text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && status === "" && (
          <p className="text-sm text-brown-light">No customers yet.</p>
        )}
      </div>
    </div>
  );
}
