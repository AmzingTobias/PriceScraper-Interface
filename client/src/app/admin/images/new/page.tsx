"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { uploadImage } from "@/lib/api";
import PageShell from "@/components/ui/page-shell";
import Btn from "@/components/ui/btn";
import { Image as ImageIcon, Upload } from "lucide-react";

export default function ImageUploadPage() {
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [imageData, setImageData] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (mounted && !isAdmin) router.push("/");
  }, [mounted, isAdmin, router]);

  useEffect(() => {
    if (imageData) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(imageData);
    } else {
      setPreview(null);
    }
  }, [imageData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageData) return;
    const ok = await uploadImage(imageData);
    if (ok) {
      toast("Image uploaded successfully", "success");
      setImageData(undefined);
      setPreview(null);
    } else {
      toast("Upload failed — please try again", "error");
    }
  };

  if (!mounted || !isAdmin) return null;

  return (
    <PageShell title="Upload Image">
      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        <div className="w-48 h-64 rounded-xl overflow-hidden bg-surface-700 flex items-center justify-center shrink-0">
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <ImageIcon size={32} className="text-text-muted" />
          )}
        </div>

        <div className="flex flex-col gap-4 flex-1 w-full">
          <Btn
            variant="warn"
            fullWidth
            onClick={() => document.getElementById("img-file")?.click()}
          >
            <span className="flex items-center gap-2 justify-center">
              <ImageIcon size={14} />
              Select Image
            </span>
          </Btn>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="img-file"
            onChange={(e) => setImageData(e.target.files?.[0])}
            aria-label="Select image file"
          />

          <Btn fullWidth disabled={!imageData} onClick={handleSubmit}>
            <span className="flex items-center gap-2 justify-center">
              <Upload size={14} />
              Upload
            </span>
          </Btn>
        </div>
      </div>
    </PageShell>
  );
}
