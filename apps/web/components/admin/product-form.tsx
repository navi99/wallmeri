"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";

import { Button, FieldError, Input, Label, Select, Textarea } from "@/components/ui";
import type { Category, Product } from "@/lib/types";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  price_inr: z.coerce.number().int().positive("Enter a price in ₹"),
  description: z.string().optional(),
  image_url: z.string().url("Enter a valid image URL").or(z.literal("")),
  material: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  category_id: z.coerce.number().int().optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
});
export type ProductFormValues = z.infer<typeof schema>;

export function ProductForm({
  product,
  categories,
  onSubmit,
  onClose,
  submitting,
}: {
  product: Product | null;
  categories: Category[];
  onSubmit: (values: ProductFormValues) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const {
    register,
    handleSubmit,
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
      category_id: product?.category?.id ?? undefined,
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
    },
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">
            {product ? "Edit product" : "Add product"}
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

          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" placeholder="https://…" {...register("image_url")} />
            <FieldError>{errors.image_url?.message}</FieldError>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select id="category_id" {...register("category_id")}>
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
            <Button type="submit" loading={submitting}>
              {product ? "Save changes" : "Create product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
