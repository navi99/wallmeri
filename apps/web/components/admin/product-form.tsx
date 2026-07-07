"use client";

import Image from "next/image";
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
  material: z.string().optional(),
  stock: z.coerce.number().int().min(0),
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
      material: product?.material ?? "Brushed Metal",
      stock: product?.stock ?? 50,
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
      const res = await api.adminUpload(file);
      setValue("image_url", res.image_url, { shouldValidate: true });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-paper p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">
            {product ? "Edit poster" : "Add poster"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-brand-50" aria-label="Close">
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
                className="relative grid h-28 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-dashed border-brand-200 bg-cream text-muted hover:border-brand-400"
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
                <Input placeholder="…or paste an image URL" {...register("image_url")} />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_inr">Price (₹)</Label>
              <Input id="price_inr" type="number" {...register("price_inr")} />
              <FieldError>{errors.price_inr?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" {...register("stock")} />
              <FieldError>{errors.stock?.message}</FieldError>
            </div>
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
                    className={`rounded-full border px-3 py-1 text-sm font-medium ${
                      active
                        ? "border-brand-600 bg-brand-600 text-cream"
                        : "border-brand-200 bg-paper text-ink hover:bg-brand-50"
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
