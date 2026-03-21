"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import {
  fetchProductDetails,
  fetchProductImage,
  fetchProductSites,
  fetchAllImages,
  updateProductName,
  updateProductDescription,
  deleteSite,
  createSite,
  linkImageToProduct,
  deleteProduct,
} from "@/lib/api";
import { tSiteEntry, tImageEntry } from "@/lib/types";
import PageShell from "@/components/ui/page-shell";
import { SkeletonBox } from "@/components/ui/skeleton";
import Btn from "@/components/ui/btn";
import Input from "@/components/ui/input";
import { TextArea } from "@/components/ui/input";
import {
  Trash2, Plus, ArrowLeft, AlertTriangle, ImageIcon, X, Check, Save,
} from "lucide-react";

export default function ManageProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [sites, setSites] = useState<tSiteEntry[]>([]);
  const [originalSites, setOriginalSites] = useState<tSiteEntry[]>([]);
  const [image, setImage] = useState<tImageEntry | undefined>();
  const [newSite, setNewSite] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Image picker state
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [allImages, setAllImages] = useState<tImageEntry[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  useEffect(() => {
    if (mounted && !isAdmin) { router.push("/"); return; }
  }, [mounted, isAdmin, router]);

  useEffect(() => {
    if (!mounted || !isAdmin || !productId) return;

    setLoading(true);
    Promise.all([
      fetchProductDetails(productId).then((d) => {
        setName(d.Name);
        setDesc(d.Description ?? "");
      }),
      fetchProductImage(productId).then((img) => {
        if (img) setImage(img);
      }),
      fetchProductSites(productId).then((s) => {
        setSites(s);
        setOriginalSites(s);
      }),
    ]).finally(() => setLoading(false));
  }, [productId, mounted, isAdmin]);

  const openImagePicker = async () => {
    setShowImagePicker(true);
    setImagesLoading(true);
    try {
      const images = await fetchAllImages();
      setAllImages(images);
    } catch {
      toast("Failed to load images", "error");
    }
    setImagesLoading(false);
  };

  const selectImage = (img: tImageEntry) => {
    setImage(img);
    setShowImagePicker(false);
  };

  const clearImage = () => {
    setImage(undefined);
  };

  const handleDeleteSite = (index: number) => {
    setSites((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSite = () => {
    if (newSite && productId) {
      setSites((prev) => [
        ...prev,
        { Id: NaN, Link: newSite, ProductId: Number(productId) },
      ]);
      setNewSite("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!productId || saving) return;

    setSaving(true);

    const nameOk = await updateProductName(productId, name);
    if (!nameOk) { toast("Failed to update name", "error"); setSaving(false); return; }

    const descOk = await updateProductDescription(productId, desc);
    if (!descOk) { toast("Failed to update description", "error"); setSaving(false); return; }

    const toDelete = originalSites.filter(
      (os) => !sites.some((s) => s.Id === os.Id)
    );
    for (const s of toDelete) {
      await deleteSite(s.Id);
    }

    const toCreate = sites.filter(
      (s) => !originalSites.some((os) => s.Id === os.Id)
    );
    for (const s of toCreate) {
      await createSite(s.Link, Number(productId));
    }

    if (image && !isNaN(image.Id)) {
      await linkImageToProduct(productId, image.Id);
    }

    setSaving(false);
    toast("Product updated successfully", "success");
    router.push(`/product/${productId}`);
  };

  const handleDelete = async () => {
    if (!productId) return;
    setDeleting(true);
    const ok = await deleteProduct(productId);
    setDeleting(false);
    if (ok) {
      toast("Product deleted", "success");
      router.push("/");
    } else {
      toast("Failed to delete product", "error");
      setShowDeleteConfirm(false);
    }
  };

  if (!mounted || !isAdmin || !productId) return null;

  return (
    <>
      <PageShell title="Manage Product">
        {loading ? (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <SkeletonBox className="h-11 w-full" />
                <SkeletonBox className="h-48 sm:h-56 w-full" />
              </div>
              <SkeletonBox className="w-48 h-64 shrink-0 mx-auto lg:mx-0" />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── Details + Cover Image ── */}
            <section>
              <h2 className="font-display text-base font-bold text-text-secondary mb-4">Product Details</h2>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Name + Description */}
                <div className="flex-1 space-y-4">
                  <Input
                    placeholder="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    aria-label="Product name"
                  />
                  <TextArea
                    className="h-48 lg:h-64"
                    placeholder="Product description"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    aria-label="Product description"
                  />
                </div>

                {/* Cover Image */}
                <div className="shrink-0 flex flex-col items-center gap-3 mx-auto lg:mx-0">
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Cover Image</p>
                  <div className="w-44 h-60 rounded-xl overflow-hidden bg-surface-700 relative group">
                    {image?.Link ? (
                      <>
                        <img
                          src={`/uploads/${image.Link}`}
                          className="w-full h-full object-cover"
                          alt="Product cover"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-surface-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={openImagePicker}
                            className="px-3 py-1.5 bg-accent/20 text-accent text-xs font-semibold rounded-lg hover:bg-accent/30 transition-colors cursor-pointer"
                            aria-label="Change cover image"
                          >
                            Change
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-text-muted">
                        <ImageIcon size={24} />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={openImagePicker}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-700 hover:bg-surface-600 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                      aria-label="Choose cover image"
                    >
                      {image ? "Change" : "Choose Image"}
                    </button>
                    {image && (
                      <button
                        onClick={clearImage}
                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-surface-700 hover:bg-danger/20 text-text-muted hover:text-danger transition-colors cursor-pointer"
                        aria-label="Remove cover image"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-white/[0.06]" />

            {/* ── Sites ── */}
            <section>
              <h2 className="font-display text-base font-bold text-text-secondary mb-4">Tracked Sites</h2>
              {sites.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {sites.map((site, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="flex-1 bg-surface-700/40 text-text-secondary text-sm rounded-xl px-4 py-2.5 truncate">
                        {site.Link}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSite(i)}
                        className="p-2.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Remove site ${i + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm mb-4">No sites linked to this product.</p>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add site URL..."
                  type="url"
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSite(); } }}
                  aria-label="New site URL"
                />
                <button
                  onClick={handleAddSite}
                  disabled={!newSite}
                  className="px-4 py-2.5 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Add site"
                >
                  <Plus size={16} />
                </button>
              </div>
            </section>

            <div className="h-px bg-white/[0.06]" />

            {/* ── Actions ── */}
            <section className="flex flex-col sm:flex-row gap-3">
              <Btn fullWidth onClick={handleSubmit} disabled={saving}>
                <span className="flex items-center gap-2 justify-center">
                  <Save size={14} />
                  {saving ? "Saving..." : "Save Changes"}
                </span>
              </Btn>
              <Btn
                variant="ghost"
                fullWidth
                onClick={() => router.push(`/product/${productId}`)}
              >
                <span className="flex items-center gap-2 justify-center">
                  <ArrowLeft size={14} />
                  Back to Product
                </span>
              </Btn>
            </section>

            <div className="h-px bg-white/[0.06]" />

            {/* ── Danger Zone ── */}
            <section>
              <h2 className="font-display text-base font-bold text-danger mb-4">Danger Zone</h2>
              {showDeleteConfirm ? (
                <div className="bg-danger/5 border border-danger/20 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        Delete &quot;{name}&quot;?
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        This permanently removes the product, all price history, and site links. This cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Btn variant="danger" onClick={handleDelete} disabled={deleting}>
                      {deleting ? "Deleting..." : "Yes, Delete"}
                    </Btn>
                    <Btn variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                      Cancel
                    </Btn>
                  </div>
                </div>
              ) : (
                <Btn variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                  <span className="flex items-center gap-2">
                    <Trash2 size={14} />
                    Delete Product
                  </span>
                </Btn>
              )}
            </section>
          </div>
        )}
      </PageShell>

      {/* ── Image Picker Modal ── */}
      {showImagePicker && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-surface-900/80 backdrop-blur-sm p-4"
          onClick={() => setShowImagePicker(false)}
        >
          <div
            className="bg-surface-800 border border-white/[0.06] rounded-2xl shadow-card w-full max-w-2xl max-h-[80vh] flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Choose cover image"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="font-display text-lg font-bold">Choose Cover Image</h3>
              <button
                onClick={() => setShowImagePicker(false)}
                className="p-1.5 rounded-lg hover:bg-surface-600 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Close image picker"
              >
                <X size={18} />
              </button>
            </div>

            {/* Image grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {imagesLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonBox key={i} className="aspect-[2/3] w-full" />
                  ))}
                </div>
              ) : allImages.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-12">
                  No images uploaded yet. Upload one from the admin menu first.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {allImages.map((img) => {
                    const isSelected = image?.Id === img.Id;
                    return (
                      <button
                        key={img.Id}
                        onClick={() => selectImage(img)}
                        className={`relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all group ${
                          isSelected
                            ? "ring-2 ring-accent ring-offset-2 ring-offset-surface-800"
                            : "hover:ring-1 hover:ring-white/20"
                        }`}
                        aria-label={`Select image ${img.Id}${isSelected ? " (currently selected)" : ""}`}
                      >
                        <img
                          src={`/uploads/${img.Link}`}
                          alt={`Image ${img.Id}`}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                              <Check size={16} className="text-surface-900" />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-surface-900/70 px-2 py-1 text-[10px] text-text-muted text-center font-mono">
                          ID: {img.Id}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
