"use client";

import { supabase } from "@/lib/supabase";

// ─── Orders (fetched with customer + garments + payments embedded) ──────
// One nested query per refresh; fine at this scale. Totals are computed from
// the embedded items/payments by the caller.

export async function listOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, customer:customers(*), order_items(*), payments(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createOrder(customerId: string) {
  const { data, error } = await supabase
    .from("orders")
    .insert({ customer_id: customerId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrder(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from("orders").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}

// Cascade the order's status onto every garment (the "apply to all" convenience).
export async function applyStatusToAllItems(orderId: string, status: string) {
  const { error } = await supabase.from("order_items").update({ status }).eq("order_id", orderId);
  if (error) throw error;
}

// ─── Garments (order_items) ─────────────────────────────────────────────

export async function addOrderItem(orderId: string, item: Record<string, unknown>) {
  const { error } = await supabase.from("order_items").insert({ order_id: orderId, ...item });
  if (error) throw error;
}

export async function updateOrderItem(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from("order_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteOrderItem(id: string) {
  const { error } = await supabase.from("order_items").delete().eq("id", id);
  if (error) throw error;
}

// ─── Payments (append-only) ─────────────────────────────────────────────

export async function addPayment(orderId: string, payment: Record<string, unknown>) {
  const { error } = await supabase.from("payments").insert({ order_id: orderId, ...payment });
  if (error) throw error;
}

export async function deletePayment(id: string) {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw error;
}

// ─── Customers ──────────────────────────────────────────────────────────

export async function listCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function findCustomerByPhone(phone: string) {
  const { data, error } = await supabase.from("customers").select("*").eq("phone", phone).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCustomer(customer: Record<string, unknown>) {
  const { data, error } = await supabase.from("customers").insert(customer).select().single();
  if (error) throw error;
  return data;
}

export async function updateCustomer(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from("customers").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

// Find an existing customer by phone, or create one. Never renames an existing
// customer (the caller decides what to show).
export async function findOrCreateCustomer(phone: string, name: string) {
  const existing = await findCustomerByPhone(phone);
  if (existing) return existing;
  return createCustomer({ phone, name });
}

// ─── Leads (booking_requests) ───────────────────────────────────────────

export async function listLeads() {
  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateLead(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from("booking_requests").update(patch).eq("id", id);
  if (error) throw error;
}
