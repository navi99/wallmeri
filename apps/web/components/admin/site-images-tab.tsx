"use client";

import Image from "@/components/app-image";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { Card, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { SITE_IMAGE_SLOTS } from "@/lib/site-images";
import type { SiteImage } from "@/lib/types";

type SlotItem = { image_id: number | null; image_url: string; alt_text: string; _key: string };

const toItems = (images: SiteImage[]): SlotItem[] =>
  images
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((img) => ({
      image_id: img.image_id,
      image_url: img.image_url,
      alt_text: img.alt_text,
      _key: String(img.id),
    }));

function SlotEditor({
  slot,
  label,
  maxImages,
  media = "image",
  images,
  onSaved,
}: {
  slot: string;
  label: string;
  maxImages: number;
  media?: "image" | "video";
  images: SiteImage[];
  onSaved: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<SlotItem[]>(() => toItems(images));

  // Re-sync from the server whenever this slot's rows change underneath us
  // (our own mutation resolving, or another admin's save landing via refetch).
  useEffect(() => {
    setItems(toItems(images));
  }, [images]);

  const saveMutation = useMutation({
    mutationFn: (next: SlotItem[]) =>
      api.adminUpdateSiteImageSlot(
        slot,
        next.map(({ image_id, image_url, alt_text }) => ({ image_id, image_url, alt_text })),
      ),
    onSuccess: onSaved,
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Save failed"),
  });

  const commit = (next: SlotItem[]) => {
    setItems(next);
    saveMutation.mutate(next);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.adminUpload(file, "site");
      commit([
        ...items,
        { image_id: res.id, image_url: res.image_url, alt_text: "", _key: `new-${res.id}` },
      ]);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = (index: number) => commit(items.filter((_, i) => i !== index));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  const setAlt = (index: number, alt_text: string) => {
    const next = items.slice();
    next[index] = { ...next[index], alt_text };
    setItems(next);
  };

  return (
    <Card className="p-5">
      <h3 className="font-bold uppercase tracking-[0.03em] text-ink">{label}</h3>
      <p className="mt-1 text-xs text-muted">
        {media === "video"
          ? "One video (MP4 or WebM, max 30MB). Leave empty to fall back to the homepage hero image."
          : maxImages > 1
            ? `Up to ${maxImages} images, shown as a crossfading slideshow. First image is main.`
            : "One image. Leave empty to fall back to a plain block."}
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        {items.map((item, index) => (
          <div key={item._key} className="w-28 shrink-0">
            <div className="relative aspect-[3/4] w-28 overflow-hidden border border-ink/15 bg-cream">
              {item.image_url && media === "video" ? (
                <video src={item.image_url} muted className="h-full w-full object-cover" />
              ) : (
                item.image_url && (
                  <Image src={item.image_url} alt="" fill className="object-cover" sizes="112px" />
                )
              )}
              {maxImages > 1 && index === 0 && (
                <span className="absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-cream">
                  Main
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move earlier"
                  className="p-1 text-muted transition-colors hover:text-ink disabled:opacity-25"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Move later"
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
            <input
              value={item.alt_text}
              onChange={(e) => setAlt(index, e.target.value)}
              onBlur={() => saveMutation.mutate(items)}
              placeholder="Alt text"
              aria-label="Alt text"
              className="mt-1 w-full border border-ink/15 bg-paper px-1.5 py-1 text-[11px] text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none"
            />
          </div>
        ))}

        {items.length < maxImages && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="grid aspect-[3/4] w-28 shrink-0 place-items-center border border-dashed border-ink/25 bg-cream text-muted transition-colors hover:border-ink disabled:opacity-60"
            aria-label="Add image"
          >
            {uploading ? <Spinner /> : <ImagePlus className="h-6 w-6" />}
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={media === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </Card>
  );
}

export function SiteImagesTab() {
  const qc = useQueryClient();
  const siteImagesQuery = useQuery({
    queryKey: ["admin-site-images"],
    queryFn: () => api.adminListSiteImages(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-site-images"] });
    qc.invalidateQueries({ queryKey: ["site-images"] });
  };

  if (siteImagesQuery.isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  const all = siteImagesQuery.data ?? [];

  return (
    <div className="max-w-2xl space-y-4">
      {Object.entries(SITE_IMAGE_SLOTS).map(([slot, def]) => (
        <SlotEditor
          key={slot}
          slot={slot}
          label={def.label}
          maxImages={def.maxImages}
          media={def.media}
          images={all.filter((img) => img.slot === slot)}
          onSaved={invalidate}
        />
      ))}
    </div>
  );
}
