"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  FileText,
  FolderOpen,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Livres", href: "/admin/livres", icon: BookOpen },
  { name: "Commandes", href: "/admin/commandes", icon: ShoppingCart },
  { name: "Chat", href: "/admin/chat", icon: MessageCircle },
  { name: "Blog", href: "/admin/blog", icon: FileText },
  { name: "Catégories", href: "/admin/categories", icon: FolderOpen },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-royal-blue text-white">
      <div className="container-custom py-4 lg:max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/admin/dashboard"
              className="text-xl font-heading font-bold"
            >
              Royal Editions Admin
            </Link>

            <div className="hidden lg:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "bg-gold text-royal-blue" : "hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm hover:text-gold transition-colors"
              target="_blank"
            >
              Voir le site
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
}
