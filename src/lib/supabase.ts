"use client";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Singleton browser client. Import only from client components so it never
// evaluates during static prerender. Security is enforced by RLS, not this key
// (the publishable key is designed to ship to the browser).
export const supabase = createClient(url, key);
