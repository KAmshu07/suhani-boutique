"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { businessInfo } from "@/data/business-info";
import GalleryEditor from "@/components/admin/editors/GalleryEditor";
import ServicesEditor from "@/components/admin/editors/ServicesEditor";
import AnnouncementEditor from "@/components/admin/editors/AnnouncementEditor";
import BusinessInfoEditor from "@/components/admin/editors/BusinessInfoEditor";
import AboutEditor from "@/components/admin/editors/AboutEditor";
import HeroEditor from "@/components/admin/editors/HeroEditor";
import TestimonialsEditor from "@/components/admin/editors/TestimonialsEditor";
import OrdersEditor from "@/components/admin/editors/OrdersEditor";
import CustomersEditor from "@/components/admin/editors/CustomersEditor";
import LeadsEditor from "@/components/admin/editors/LeadsEditor";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";

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

const NAV_GROUPS = [
  {
    group: "Order Book",
    items: [
      { key: "orders", label: "Orders" },
      { key: "customers", label: "Customers" },
      { key: "leads", label: "Leads" },
    ],
  },
  {
    group: "Site Control",
    items: [
      { key: "gallery", label: "Gallery" },
      { key: "services", label: "Services" },
      { key: "testimonials", label: "Reviews" },
      { key: "announcement", label: "Announcement" },
      { key: "business", label: "Business Info" },
      { key: "about", label: "About" },
      { key: "hero", label: "Hero Image" },
    ],
  },
] as const;

function Dashboard({ email }: { email: string }) {
  const [section, setSection] = useState<string>("orders");
  return (
    <ConfirmProvider>
      <main className="min-h-screen bg-cream text-brown">
        <header className="flex items-center justify-between border-b border-brown-light/15 px-6 py-4">
          <h1 className="font-heading text-lg font-semibold uppercase tracking-widest">
            {businessInfo.name} Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-brown-light">{email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium text-brown transition-colors hover:bg-cream-alt"
            >
              Log out
            </button>
          </div>
        </header>
        <div className="flex flex-col md:flex-row">
          <nav className="flex md:flex-col gap-3 overflow-x-auto border-b border-brown-light/15 p-3 md:w-56 md:shrink-0 md:border-b-0 md:border-r">
            {NAV_GROUPS.map((g) => (
              <div key={g.group} className="flex md:flex-col gap-1.5">
                <span className="hidden md:block px-3 pt-1 text-xs font-heading uppercase tracking-widest text-brown-light/60">
                  {g.group}
                </span>
                {g.items.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSection(s.key)}
                    className={`min-h-[44px] whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                      section === s.key ? "bg-brown text-cream" : "text-brown hover:bg-cream-alt"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="flex-1 p-6 max-w-3xl">
            <SectionView section={section} />
          </div>
        </div>
      </main>
    </ConfirmProvider>
  );
}

function SectionView({ section }: { section: string }) {
  switch (section) {
    case "orders":
      return <OrdersEditor />;
    case "customers":
      return <CustomersEditor />;
    case "leads":
      return <LeadsEditor />;
    case "gallery":
      return <GalleryEditor />;
    case "services":
      return <ServicesEditor />;
    case "announcement":
      return <AnnouncementEditor />;
    case "business":
      return <BusinessInfoEditor />;
    case "about":
      return <AboutEditor />;
    case "hero":
      return <HeroEditor />;
    case "testimonials":
      return <TestimonialsEditor />;
    default:
      return <p className="text-sm text-brown-light">This editor is coming up next.</p>;
  }
}
