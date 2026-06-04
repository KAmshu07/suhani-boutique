"use client";

import { supabase } from "@/lib/supabase";

// Admin-side data helpers. The admin reads ALL rows (including hidden ones) and
// writes them; RLS restricts every one of these to the admin role.

export async function listAll(table: string) {
  const { data, error } = await supabase.from(table).select("*").order("display_order");
  if (error) throw error;
  return data ?? [];
}

export async function upsertRow(table: string, row: Record<string, unknown>) {
  const { error } = await supabase.from(table).upsert(row);
  if (error) throw error;
}

export async function deleteRow(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function getSettingValue(key: string) {
  const { data, error } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}

export async function upsertSetting(key: string, value: unknown) {
  const { error } = await supabase.from("settings").upsert({ key, value });
  if (error) throw error;
}
