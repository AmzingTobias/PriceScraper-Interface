"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { importProduct } from "@/lib/api";
import PageShell from "@/components/ui/page-shell";
import Btn from "@/components/ui/btn";
import Input from "@/components/ui/input";

export default function ImportProductPage() {
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [importLink, setImportLink] = useState("");

  useEffect(() => {
    if (mounted && !isAdmin) router.push("/");
  }, [mounted, isAdmin, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!importLink.trim()) {
      toast("Please enter an import link", "error");
      return;
    }
    const result = await importProduct(importLink);
    if (result) {
      toast(result, "success");
      setImportLink("");
    } else {
      toast("Import request failed", "error");
    }
  };

  if (!mounted || !isAdmin) return null;

  return (
    <PageShell title="Import Product">
      <div className="space-y-4">
        <Input
          placeholder="Import Link (URL from supported site)"
          value={importLink}
          onChange={(e) => setImportLink(e.target.value)}
          required
          aria-label="Import link URL"
        />
        <Btn fullWidth onClick={handleSubmit}>Import</Btn>
      </div>
    </PageShell>
  );
}
