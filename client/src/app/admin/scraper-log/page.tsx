"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getScraperLog } from "@/lib/api";
import PageShell from "@/components/ui/page-shell";
import Btn from "@/components/ui/btn";
import { RefreshCw } from "lucide-react";

export default function ScraperLogPage() {
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    getScraperLog()
      .then(setLogs)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (mounted && !isAdmin) { router.push("/"); return; }
    if (mounted && isAdmin) fetchLogs();
  }, [mounted, isAdmin, router]);

  if (!mounted || !isAdmin) return null;

  return (
    <PageShell
      title="PriceScraper Log"
      actions={
        <Btn variant="ghost" onClick={fetchLogs} disabled={loading}>
          <span className="flex items-center gap-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </span>
        </Btn>
      }
    >
      <div className="bg-surface-900 rounded-xl border border-white/[0.04] p-4 max-h-[65vh] overflow-y-auto font-mono text-xs leading-relaxed">
        {loading && logs.length === 0 ? (
          <p className="text-text-muted text-center py-8">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-text-muted text-center py-8">No log entries.</p>
        ) : (
          logs.map((line, i) => (
            <div
              key={i}
              className={`py-0.5 ${
                line.includes("ERROR")
                  ? "text-danger"
                  : line.includes("INFO")
                  ? "text-accent/70"
                  : "text-text-secondary"
              }`}
            >
              {line}
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
}
