"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Shield, X, Plus, FileImage, Import, Terminal, Images } from "lucide-react";

const adminMenuItems = [
  { label: "Import Product", href: "/admin/products/import", icon: Import },
  { label: "New Product", href: "/admin/products/new", icon: Plus },
  { label: "Upload Image", href: "/admin/images/new", icon: FileImage },
  { label: "Scraper Log", href: "/admin/scraper-log", icon: Terminal },
  { label: "Manage Images", href: "/admin/images/manage", icon: Images },
];

export default function AdminPopup() {
  const { isAdmin, mounted } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Don't render until mounted (avoids hydration mismatch) or if not admin
  if (!mounted || !isAdmin) return null;

  const handleNav = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <nav
          className="absolute bottom-14 right-0 mb-2 w-52 bg-surface-700 border border-white/[0.06] rounded-xl shadow-card overflow-hidden animate-slide-up"
          role="menu"
          aria-label="Admin actions"
        >
          {adminMenuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              role="menuitem"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-600 transition-colors cursor-pointer"
            >
              <item.icon size={16} className="text-accent/60" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>
      )}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close admin menu" : "Open admin menu"}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
          open
            ? "bg-danger/20 text-danger rotate-0"
            : "bg-accent/15 text-accent hover:bg-accent/25"
        }`}
      >
        {open ? <X size={20} /> : <Shield size={20} />}
      </button>
    </div>
  );
}
