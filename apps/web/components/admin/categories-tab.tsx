"use client";

import Image from "@/components/app-image";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Card, Input, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { Category } from "@/lib/types";

// Small square upload control shared by the create form and each category
// row — lets an admin attach/replace/remove the display poster shown on the
// storefront's "shop by category" tiles. No poster is a valid, common state
// (ShopByCategory falls back to a gradient tile), so this never blocks save.
function PosterPicker({
  imageUrl,
  onChange,
}: {
  imageUrl: string;
  onChange: (next: { poster_image_id: number | null; poster_image_url: string }) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.adminUpload(file, "category");
      onChange({ poster_image_id: res.id, poster_image_url: res.image_url });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="relative h-14 w-14 shrink-0">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative grid h-14 w-14 place-items-center overflow-hidden border border-dashed border-ink/25 bg-cream text-muted transition-colors hover:border-ink"
        aria-label={imageUrl ? "Change display poster" : "Upload display poster"}
      >
        {uploading ? (
          <Spinner />
        ) : imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="56px" />
        ) : (
          <ImagePlus className="h-5 w-5" />
        )}
      </button>
      {imageUrl && !uploading && (
        <button
          type="button"
          onClick={() => onChange({ poster_image_id: null, poster_image_url: "" })}
          className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-cream"
          aria-label="Remove display poster"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}

export function CategoriesTab() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [posterId, setPosterId] = useState<number | null>(null);
  const [posterUrl, setPosterUrl] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.adminListCategories(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      api.adminCreateCategory({
        name: name.trim(),
        poster_image_id: posterId,
        poster_image_url: posterUrl,
      }),
    onSuccess: () => {
      toast.success("Category created");
      setName("");
      setPosterId(null);
      setPosterUrl("");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Create failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.adminUpdateCategory(id, body),
    onSuccess: invalidate,
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Update failed"),
  });

  if (categoriesQuery.isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length >= 2) createMutation.mutate();
        }}
        className="flex items-start gap-2"
      >
        <PosterPicker
          imageUrl={posterUrl}
          onChange={({ poster_image_id, poster_image_url }) => {
            setPosterId(poster_image_id);
            setPosterUrl(poster_image_url);
          }}
        />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          aria-label="New category name"
        />
        <Button type="submit" loading={createMutation.isPending} disabled={name.trim().length < 2}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </form>

      <div className="mt-4 space-y-2">
        {(categoriesQuery.data ?? []).map((c: Category) => (
          <Card key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <PosterPicker
                imageUrl={c.poster_image_url ?? ""}
                onChange={(body) => updateMutation.mutate({ id: c.id, body })}
              />
              <div className="flex items-center gap-2">
                <span className="font-medium text-ink">{c.name}</span>
                <span className="text-xs text-muted">/{c.slug}</span>
                {c.is_active === false && <Badge tone="inert">Hidden</Badge>}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                updateMutation.mutate({ id: c.id, body: { is_active: !(c.is_active ?? true) } })
              }
            >
              {(c.is_active ?? true) ? "Hide" : "Show"}
            </Button>
          </Card>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        Hiding a category removes it from the storefront navigation; posters keep the tag. The
        thumbnail sets the display poster shown on the storefront&apos;s category tile — leave it
        empty for a plain gradient tile.
      </p>
    </div>
  );
}
