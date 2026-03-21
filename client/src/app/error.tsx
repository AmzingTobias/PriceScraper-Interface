"use client";

import { useEffect } from "react";
import Btn from "@/components/ui/btn";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-danger" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-3">
          Something went wrong
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          An unexpected error occurred. This has been logged and we&apos;ll look into it.
        </p>
        <div className="flex gap-3 justify-center">
          <Btn onClick={reset}>Try Again</Btn>
          <Btn variant="ghost" onClick={() => (window.location.href = "/")}>
            Go Home
          </Btn>
        </div>
      </div>
    </div>
  );
}
