"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

import Image from "@/components/app-image";
import { ImageCropModal } from "@/components/admin/image-crop-modal";
import { Button, FieldError, Input, Label, Select, Spinner, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

const schema = z.object({
  medium: z.string().max(160).optional(),
  width_cm: z.coerce.number().positive("Enter a width"),
  height_cm: z.coerce.number().positive("Enter a height"),
  year_created: z.coerce.number().int().optional(),
  price_inr: z.coerce.number().int().positive("Enter a price in ₹"),
  status: z.enum(["available", "reserved", "sold"]),
  story: z.string().max(4000).optional(),
});
type FormValues = z.infer<typeof schema>;

// A product's optional one-of-a-kind physical original — separate save/delete
// from the main poster form (its own PUT/DELETE /admin/products/{id}/original),
// so editing the original never risks the poster fields, and vice versa.
export function OriginalPaintingEditor({ product }: { product: Product }) {
  const qc = useQueryClient();
  const [enabled, setEnabled] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ id: number; url: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const originalQuery = useQuery({
    queryKey: ["admin-original", product.id],
    queryFn: () => api.adminGetOriginal(product.id),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "available" },
  });

  useEffect(() => {
    const o = originalQuery.data;
    if (o) {
      setEnabled(true);
      reset({
        medium: o.medium,
        width_cm: o.width_cm,
        height_cm: o.height_cm,
        year_created: o.year_created ?? undefined,
        price_inr: o.price_inr,
        status: o.status,
        story: o.story,
      });
      setImagePreview(o.image_id ? { id: o.image_id, url: o.image_url } : null);
    }
  }, [originalQuery.data, reset]);

  const invalidateEverywhere = () => {
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["product", product.slug] });
    qc.invalidateQueries({ queryKey: ["original", product.slug] });
    qc.invalidateQueries({ queryKey: ["admin-original", product.id] });
  };

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.adminUpsertOriginal(product.id, { ...values, image_id: imagePreview?.id ?? null }),
    onSuccess: () => {
      toast.success("Original painting saved");
      invalidateEverywhere();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.adminDeleteOriginal(product.id),
    onSuccess: () => {
      toast.success("Original painting removed");
      setEnabled(false);
      setImagePreview(null);
      reset({ status: "available" });
      invalidateEverywhere();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Remove failed"),
  });

  const onCropConfirm = async (blob: Blob) => {
    setUploading(true);
    try {
      const file = new File([blob], "original.jpg", { type: "image/jpeg" });
      const res = await api.adminUpload(file, "product");
      setImagePreview({ id: res.id, url: res.image_url });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  };

  return (
    <div className="border border-ink/15 p-4">
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            if (!e.target.checked && originalQuery.data) {
              if (confirm("Remove the original painting for this poster?")) deleteMutation.mutate();
              return;
            }
            setEnabled(e.target.checked);
          }}
          className="h-4 w-4 accent-brand-600"
        />
        This design also has a physical original for sale
      </label>

      {enabled && (
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-3">
            {imagePreview ? (
              <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden border border-ink/15 bg-cream">
                <Image src={imagePreview.url} alt="Original painting" fill className="object-cover" sizes="96px" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  aria-label="Remove image"
                  className="absolute right-1 top-1 bg-ink/70 p-0.5 text-cream hover:bg-ink"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="grid aspect-[3/4] w-24 shrink-0 place-items-center border border-dashed border-ink/25 bg-cream text-muted transition-colors hover:border-ink disabled:opacity-60"
                aria-label="Add original photo"
              >
                {uploading ? <Spinner /> : <ImagePlus className="h-6 w-6" />}
              </button>
            )}
            <p className="mt-1 text-xs text-muted">
              Photo of the physical original — falls back to the poster&apos;s own images if left blank.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPendingFile(f);
                e.target.value = "";
              }}
            />
          </div>

          {pendingFile && (
            <ImageCropModal file={pendingFile} onCancel={() => setPendingFile(null)} onConfirm={onCropConfirm} />
          )}

          <div>
            <Label htmlFor="medium">Medium</Label>
            <Input id="medium" placeholder="Oil on canvas" {...register("medium")} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="width_cm">Width (cm)</Label>
              <Input id="width_cm" type="number" step="0.1" {...register("width_cm")} />
              <FieldError>{errors.width_cm?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input id="height_cm" type="number" step="0.1" {...register("height_cm")} />
              <FieldError>{errors.height_cm?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="year_created">Year</Label>
              <Input id="year_created" type="number" {...register("year_created")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_inr">Asking price (₹)</Label>
              <Input id="price_inr" type="number" {...register("price_inr")} />
              <FieldError>{errors.price_inr?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register("status")}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="story">Story (optional)</Label>
            <Textarea id="story" rows={4} className="resize-y" {...register("story")} />
          </div>

          <div className="flex justify-end gap-3">
            {originalQuery.data && (
              <Button type="button" variant="danger" onClick={() => deleteMutation.mutate()} loading={deleteMutation.isPending}>
                Remove original
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSubmit((values) => saveMutation.mutate(values))}
              loading={saveMutation.isPending || uploading}
            >
              Save original
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
