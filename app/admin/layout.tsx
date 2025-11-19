import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { AdminNav } from "@/components/admin/admin-nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Royal Editions",
  description: "Dashboard administration pour Royal Editions",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={frFR}>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="container-custom py-8">{children}</main>
      </div>
    </ClerkProvider>
  );
}
