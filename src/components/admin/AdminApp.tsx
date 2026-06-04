"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { businessInfo } from "@/data/business-info";

// Admin shell. Two layers of protection: (1) the database RLS only lets the
// 'admin' role read/write real data, and (2) this UI only shows the dashboard
// when the logged-in user's profile role is 'admin'. A logged-in non-admin sees
// "not authorized", never the dashboard. (Admin UI is English-only for now.)
export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load(next: Session | null) {
      if (!next) {
        if (alive) {
          setSession(null);
          setRole(null);
          setChecked(true);
        }
        return;
      }
      // Read our own profile role (RLS allows reading your own row).
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", next.user.id)
        .maybeSingle();
      if (!alive) return;
      setSession(next);
      setRole((data?.role as string) ?? null);
      setChecked(true);
    }

    supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setChecked(false);
      load(next);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!checked) return <Centered>Loading…</Centered>;
  if (!session) return <Login />;
  if (role !== "admin") return <NotAuthorized email={session.user.email ?? ""} />;
  return <Dashboard email={session.user.email ?? ""} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-6 text-brown">
      {children}
    </main>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    setBusy(false);
  }

  const input =
    "w-full bg-cream-alt border border-brown-light/20 px-4 py-3 text-brown focus:border-gold focus:outline-none transition-colors font-body";

  return (
    <Centered>
      <form onSubmit={onSubmit} className="w-full max-w-sm flex flex-col gap-5">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-semibold uppercase tracking-widest">
            {businessInfo.name}
          </h1>
          <p className="text-sm text-brown-light mt-1">Admin</p>
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-heading uppercase tracking-wider text-brown-light mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            className={input}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-heading uppercase tracking-wider text-brown-light mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className={input}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="bg-gold text-cream px-8 py-3 font-heading uppercase tracking-wider text-sm hover:bg-brown transition-colors disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </Centered>
  );
}

function NotAuthorized({ email }: { email: string }) {
  return (
    <Centered>
      <div className="text-center max-w-sm">
        <h1 className="font-heading text-xl font-semibold uppercase tracking-widest">Not authorized</h1>
        <p className="text-sm text-brown-light mt-3">
          The account {email} does not have admin access.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-6 text-sm font-heading uppercase tracking-wider text-gold hover:text-brown transition-colors"
        >
          Log out
        </button>
      </div>
    </Centered>
  );
}

function Dashboard({ email }: { email: string }) {
  return (
    <main className="min-h-screen bg-cream text-brown">
      <header className="flex items-center justify-between border-b border-brown-light/15 px-6 py-4">
        <h1 className="font-heading text-lg font-semibold uppercase tracking-widest">
          {businessInfo.name} Admin
        </h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm font-heading uppercase tracking-wider text-brown-light hover:text-gold transition-colors"
        >
          Log out
        </button>
      </header>
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <p className="text-sm text-brown-light">Signed in as {email}</p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Placeholder title="Site Control" desc="Edit photos, services, prices, and announcements." />
          <Placeholder title="Order Book" desc="Manage customers and orders." />
        </div>
      </div>
    </main>
  );
}

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-cream-alt border border-brown-light/15 p-6">
      <h2 className="font-heading text-base font-semibold uppercase tracking-wider">{title}</h2>
      <p className="text-sm text-brown-light mt-2">{desc}</p>
      <span className="inline-block mt-4 text-xs font-heading uppercase tracking-wider text-gold">
        Coming soon
      </span>
    </div>
  );
}
