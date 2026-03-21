"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Settings, User, Gamepad2 } from "lucide-react";

export default function NavBar() {
  const { isLoggedIn, mounted } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-900/80 border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-5">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
            <Gamepad2 size={18} className="text-violet-400" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-text-primary group-hover:text-violet-400 transition-colors">
            PriceScraper
          </span>
        </button>

        <nav>
          {/* Render a static placeholder until mounted to avoid hydration mismatch */}
          {!mounted ? (
            <div className="w-9 h-9 rounded-lg bg-surface-700/50" />
          ) : (
            <button
              onClick={() => router.push(isLoggedIn ? "/settings" : "/login")}
              className="w-9 h-9 rounded-lg bg-surface-700/50 hover:bg-surface-600 flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer text-text-secondary hover:text-text-primary"
              aria-label={isLoggedIn ? "Settings" : "Login"}
            >
              {isLoggedIn ? <Settings size={18} /> : <User size={18} />}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
