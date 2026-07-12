"use client";

import Image from "@/components/app-image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

import { Button, FieldError, Input, Label, Select, Spinner, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { ArtistAdmin, Category, Product } from "@/lib/types";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  price_inr: z.coerce.number().int().positive("Enter a price in ₹"),
  description: z.string().optional(),
  image_url: z.string().url("Upload an image or paste a valid URL").or(z.literal("")),
  // Set only when image_url came from the uploader below; null for a pasted
  // URL. Sent as an explicit null (not omitted) so the backend can tell
  // "cleared" apart from "untouched" — see apps/api's _apply_product_image.
  image_id: z.number().int().nullable(),
  material: z.string().optional(),
  artist_id: z.coerce.number().int().optional(),
  category_ids: z.array(z.coerce.number().int()).min(1, "Pick at least one category"),
  is_active: z.boolean(),
  is_featured: z.boolean(),
});
export type ProductFormValues = z.infer<typeof schema>;

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: product?.title ?? "",
      price_inr: product?.price_inr ?? 1499,
      description: product?.description ?? "",
      image_url: product?.image_url ?? "",
      image_id: product?.image_id ?? null,
      material: product?.material ?? "Brushed Metal",
      artist_id: product?.artist?.id ?? undefined,
      category_ids: product?.categories.map((c) => c.id) ?? [],
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
    },
  });

  const imageUrl = watch("image_url");
  const selectedCategories = watch("category_ids");

  const toggleCategory = (id: number) => {
    const current = selectedCategories ?? [];
    setValue(
      "category_ids",
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
      { shouldValidate: true },
    );
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.adminUpload(file, "product");
      setValue("image_url", res.image_url, { shouldValidate: true });
      setValue("image_id", res.id);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
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
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-1"
        >
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            <FieldError>{errors.title?.message}</FieldError>
          </div>

          {/* Image upload */}
          <div>
            <Label>Image</Label>
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative grid h-28 w-24 shrink-0 place-items-center overflow-hidden border border-dashed border-ink/25 bg-cream text-muted transition-colors hover:border-ink"
                aria-label="Upload image"
              >
                {uploading ? (
                  <Spinner />
                ) : imageUrl ? (
                  <Image src={imageUrl} alt="Poster preview" fill className="object-cover" sizes="96px" />
                ) : (
                  <ImagePlus className="h-6 w-6" />
                )}
              </button>
              <div className="flex-1">
                <Input
                  placeholder="…or paste an image URL"
                  {...register("image_url", { onChange: () => setValue("image_id", null) })}
                />
                <p className="mt-1 text-xs text-muted">JPEG, PNG or WebP, up to 15 MB.</p>
                <FieldError>{errors.image_url?.message}</FieldError>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>

          <div>
            <Label htmlFor="price_inr">Price (₹)</Label>
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
            <Textarea id="description" rows={3} {...register("description")} />
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
