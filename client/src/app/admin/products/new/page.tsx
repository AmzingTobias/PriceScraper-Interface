"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { cacheDelete, CacheKeys } from "@/lib/cache";
import PageShell from "@/components/ui/page-shell";
import Btn from "@/components/ui/btn";
import Input from "@/components/ui/input";
import { TextArea } from "@/components/ui/input";
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";

export default function NewProductPage() {
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [siteLinks, setSiteLinks] = useState<string[]>([]);
  const [newSite, setNewSite] = useState("");
  const [imageData, setImageData] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (mounted && !isAdmin) router.push("/");
  }, [mounted, isAdmin, router]);

  useEffect(() => {
    if (imageData) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(imageData);
    } else {
      setImagePreview(null);
    }
  }, [imageData]);

  const addSite = () => {
    if (newSite) {
      setSiteLinks((prev) => [...prev, newSite]);
      setNewSite("");
    }
  };

  const removeSite = (i: number) => {
    setSiteLinks((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast("Product name is required", "error");
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          name: productName,
          description: productDesc,
          site_links: siteLinks,
        }),
      });

      if (!res.ok) {
        toast("Failed to create product", "error");
        return;
      }

      const productData = await res.json();

      if (imageData && productData.Id) {
        const formData = new FormData();
        formData.append("image", imageData);
        const imgRes = await fetch("/api/images/", {
          method: "POST",
          body: formData,
        });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          await fetch(`/api/images/product/${productData.Id}`, {
            method: "PATCH",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ ImageId: imgData.Id }),
          });
        }
      }

      for (const link of siteLinks) {
        await fetch("/api/sites", {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ "Site Link": link, ProductId: productData.Id }),
        });
      }

      cacheDelete(CacheKeys.allProducts());
      cacheDelete(CacheKeys.productCards());

      toast("Product created successfully", "success");
      router.push(`/product/${productData.Id}`);
    } catch {
      toast("An error occurred", "error");
    }
  };

  if (!mounted || !isAdmin) return null;

  return (
    <PageShell title="New Product">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <Input
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              aria-label="Product name"
            />
            <TextArea
              className="h-48 sm:h-56"
              placeholder="Product description"
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              aria-label="Product description"
            />
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-40 h-56 rounded-xl overflow-hidden bg-surface-700 flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <ImageIcon size={24} className="text-text-muted" />
              )}
            </div>
            <Btn variant="warn" onClick={() => document.getElementById("img-upload")?.click()}>
              Select Image
            </Btn>
            <input
              id="img-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageData(e.target.files?.[0])}
              aria-label="Select product image"
            />
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />

        <div>
          <h2 className="font-display text-lg font-bold mb-3">Sites</h2>
          <div className="space-y-2 mb-3">
            {siteLinks.map((link, i) => (
              <div key={i} className="flex gap-2">
                <Input value={link} disabled className="opacity-60" aria-label={`Site URL ${i + 1}`} />
                <button
                  type="button"
                  onClick={() => removeSite(i)}
                  className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                  aria-label={`Remove site ${i + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Site URL"
              type="url"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              aria-label="New site URL"
            />
            <Btn variant="ghost" onClick={addSite} aria-label="Add site">
              <Plus size={16} />
            </Btn>
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />

        <Btn fullWidth onClick={handleSubmit}>Create</Btn>
      </div>
    </PageShell>
  );
}
