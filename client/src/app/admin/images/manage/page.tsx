"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { fetchAllImages, deleteImage as apiDeleteImage } from "@/lib/api";
import { tImageEntry } from "@/lib/types";
import PageShell from "@/components/ui/page-shell";
import { SkeletonBox } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";

export default function ManageImagesPage() {
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [images, setImages] = useState<tImageEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mounted && !isAdmin) { router.push("/"); return; }
    if (mounted && isAdmin) {
      fetchAllImages()
        .then(setImages)
        .catch(() => setImages([]))
        .finally(() => setLoading(false));
    }
  }, [mounted, isAdmin, router]);

  const handleDelete = async (id: number) => {
    const ok = await apiDeleteImage(id);
    if (ok) {
      setImages((prev) => prev.filter((img) => img.Id !== id));
      toast("Image deleted", "success");
    } else {
      toast("Failed to delete image", "error");
    }
  };

  if (!mounted || !isAdmin) return null;

  return (
    <PageShell title="Manage Images">
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBox key={i} className="aspect-[2/3] w-full" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <p className="text-text-muted text-center py-12">No images found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.Id}
              className="group relative rounded-xl overflow-hidden bg-surface-700 aspect-[2/3]"
            >
              <img
                src={`/uploads/${image.Link}`}
                alt={`Image ${image.Id}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-surface-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <span className="text-text-secondary text-xs font-mono">
                  ID: {image.Id}
                </span>
                <button
                  onClick={() => handleDelete(image.Id)}
                  className="p-2.5 bg-danger/20 hover:bg-danger/40 rounded-full text-danger transition-colors cursor-pointer"
                  aria-label={`Delete image ${image.Id}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
