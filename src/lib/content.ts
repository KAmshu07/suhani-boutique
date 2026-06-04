"use client";

import { supabase } from "@/lib/supabase";

// Fetchers for public content. Each returns DB rows with all language values
// intact; callers pick a language via getLocalizedField. Stable module-scope
// references so they can be passed straight to useLiveContent.

export async function getServices() {
  const { data, error } = await supabase
    .from("services").select("*").eq("is_visible", true).order("display_order");
  if (error) throw error;
  return data ?? [];
}

export async function getGallery() {
  const { data, error } = await supabase
    .from("gallery_images").select("*").eq("is_visible", true).order("display_order");
  if (error) throw error;
  return data ?? [];
}

export async function getTestimonials() {
  const { data, error } = await supabase
    .from("testimonials").select("*").eq("is_visible", true).order("display_order");
  if (error) throw error;
  return data ?? [];
}

export async function getSettings(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.from("settings").select("key,value");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}
