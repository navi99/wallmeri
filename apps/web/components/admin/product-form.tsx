"use client";

import Image from "@/components/app-image";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";

import { ImageCropModal } from "@/components/admin/image-crop-modal";
import { OriginalPaintingEditor } from "@/components/admin/original-painting-editor";
import { Button, FieldError, Input, Label, Select, Spinner, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { ArtistAdmin, Category, Product } from "@/lib/types";

const MAX_GALLERY_IMAGES = 6;

const galleryImageSchema = z.object({
  image_id: z.number().int(),
  image_url: z.string(),
  thumb_url: z.string(),
});

const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  price_inr: z.coerce.number().int().positive("Enter a price in ₹"),
  description: z.string().optional(),
  // Pasted external URL — the legacy single-image fallback, only used when
  // `images` (the uploaded gallery) is empty. See _apply_product_images.
  image_url: z.string().url("Upload an image or paste a valid URL").or(z.literal("")),
  images: z.array(galleryImageSchema).max(MAX_GALLERY_IMAGES, "Up to 6 images per poster"),
  material: z.string().optional(),
  artist_id: z.coerce.number().int().optional(),
  category_ids: z.array(z.coerce.number().int()).min(1, "Pick at least one category"),
  is_active: z.boolean(),
  is_featured: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

// What the parent actually submits to the API — images[] collapses to an
// ordered list of asset ids (images[0] becomes the main image server-side).
export type ProductFormValues = Omit<FormValues, "images"> & { image_ids: number[] };

export function ProductForm({
  product,
  categories,
  artists,
  onSubmit,
  onClose,
  submitting,
}: {
  product: Product | null;
  categories: Category[];
  artists: ArtistAdmin[];
  onSubmit: (values: ProductFormValues) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product?.title ?? "",
      price_inr: product?.price_inr ?? 1499,
      description: product?.description ?? "",
      // Only prefill the pasted-URL fallback for legacy products that have
      // no managed gallery yet — once a gallery exists it's the source of
      // truth and this field stays hidden (see the `fields.length === 0` gate below).
      image_url: product && product.images.length === 0 ? product.image_url : "",
      images: product?.images.map((i) => ({
        image_id: i.image_id,
        image_url: i.image_url,
        thumb_url: i.thumb_url,
      })) ?? [],
      material: product?.material ?? "Brushed Metal",
      artist_id: product?.artist?.id ?? undefined,
      category_ids: product?.categories.map((c) => c.id) ?? [],
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
    },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "images" });

  const selectedCategories = watch("category_ids");

  const toggleCategory = (id: number) => {
    const current = selectedCategories ?? [];
    setValue(
      "category_ids",
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
      { shouldValidate: true },
    );
  };

  const onFilePicked = (file: File | undefined) => {
    if (!file) return;
    setPendingFile(file);
  };

  const onCropConfirm = async (blob: Blob) => {
    setUploading(true);
    try {
      const file = new File([blob], "gallery.jpg", { type: "image/jpeg" });
      const res = await api.adminUpload(file, "product");
      append({ image_id: res.id, image_url: res.image_url, thumb_url: res.thumb_url });
      toast.success("Image added");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  };

  const submit = (values: FormValues) => {
    const { images, ...rest } = values;
    onSubmit({
      ...rest,
      image_ids: images.map((i) => i.image_id),
      // The gallery is the source of truth once it has images — clear the
      // pasted-URL fallback so the backend doesn't resurrect a stale paste.
      image_url: images.length > 0 ? "" : rest.image_url,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4">
      <div className="w-full max-w-lg border border-ink/10 bg-paper p-6 shadow-lift">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-[0.04em] text-ink">
            {product ? "Edit poster" : "Add poster"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(submit)}
          className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-1"
        >
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            <FieldError>{errors.title?.message}</FieldError>
          </div>

          {/* Image gallery: 1 main (first) + up to 5 more */}
          <div>
            <Label>Images</Label>
            <div className="flex flex-wrap gap-3">
              {fields.map((field, index) => (
                <div key={field.id} className="w-24 shrink-0">
                  <div className="relative aspect-[3/4] w-24 overflow-hidden border border-ink/15 bg-cream">
                    <Image
                      src={field.thumb_url}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                    {index === 0 && (
                      <span className="absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-cream">
                        Main
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => move(index, index - 1)}
                        disabled={index === 0}
                        aria-label="Move image earlier"
                        className="p-1 text-muted transition-colors hover:text-ink disabled:opacity-25"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, index + 1)}
                        disabled={index === fields.length - 1}
                        aria-label="Move image later"
                        className="p-1 text-muted transition-colors hover:text-ink disabled:opacity-25"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label="Remove image"
                      className="p-1 text-muted transition-colors hover:text-brand-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {fields.length < MAX_GALLERY_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="grid aspect-[3/4] w-24 shrink-0 place-items-center border border-dashed border-ink/25 bg-cream text-muted transition-colors hover:border-ink disabled:opacity-60"
                  aria-label="Add image"
                >
                  {uploading ? <Spinner /> : <ImagePlus className="h-6 w-6" />}
                </button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted">
              JPEG, PNG or WebP, up to 15 MB. First image is the main photo — reorder with the arrows.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                onFilePicked(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            {fields.length === 0 && (
              <div className="mt-3">
                <Input placeholder="…or paste an image URL" {...register("image_url")} />
                <FieldError>{errors.image_url?.message}</FieldError>
              </div>
            )}
          </div>

          {pendingFile && (
            <ImageCropModal
              file={pendingFile}
              onCancel={() => setPendingFile(null)}
              onConfirm={onCropConfirm}
            />
          )}

          <div>
            <Label htmlFor="price_inr">Price (₹, for A4)</Label>
            <Input id="price_inr" type="number" {...register("price_inr")} />
            <FieldError>{errors.price_inr?.message}</FieldError>
          </div>

          {/* Category tags */}
          <div>
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = selectedCategories?.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    className={`border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                      active
                        ? "border-ink bg-ink text-cream"
                        : "border-ink/20 bg-paper text-ink hover:border-ink"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
            <FieldError>{errors.category_ids?.message}</FieldError>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="artist_id">Artist</Label>
              <Select id="artist_id" {...register("artist_id")}>
                <option value="">Wallmeri Original</option>
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="material">Material</Label>
              <Input id="material" {...register("material")} />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={7} className="resize-y" {...register("description")} />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input type="checkbox" {...register("is_active")} className="h-4 w-4 accent-brand-600" />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input type="checkbox" {...register("is_featured")} className="h-4 w-4 accent-brand-600" />
              Featured
            </label>
          </div>

          {/* Only once the poster itself has an id to attach the original to. */}
          {product && <OriginalPaintingEditor product={product} />}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting || uploading}>
              {product ? "Save changes" : "Create poster"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
