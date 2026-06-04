import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";

// Keep the admin area out of search engines.
export const metadata: Metadata = {
  title: "Admin — Suhani Boutique",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
