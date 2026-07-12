"use client";

import Image from "@/components/app-image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

import { Button, FieldError, Input, Label, Spinner, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { ArtistAdmin } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  bio: z.string().optional(),
  avatar_url: z.string().url("Upload an avatar or paste a valid URL").or(z.literal("")),
  // Set only when avatar_url came from the uploader below; null for a pasted
  // URL. Sent as an explicit null (not omitted) so the backend can tell
  // "cleared" apart from "untouched" — see apps/api's _apply_artist_avatar.
  avatar_id: z.number().int().nullable(),
  website_url: z.string().url("Enter a valid URL").or(z.literal("")),
  instagram_url: z.string().url("Enter a valid URL").or(z.literal("")),
});
export type ArtistFormValues = z.infer<typeof schema>;

export function ArtistForm({
  artist,
  onSubmit,
  onClose,
  submitting,
}: {
  artist: ArtistAdmin | null;
  onSubmit: (values: ArtistFormValues) => void;
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
  } = useForm<ArtistFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: artist?.name ?? "",
      bio: artist?.bio ?? "",
      avatar_url: artist?.avatar_url ?? "",
      avatar_id: artist?.avatar_id ?? null,
      website_url: artist?.website_url ?? "",
      instagram_url: artist?.instagram_url ?? "",
    },
  });

  const avatarUrl = watch("avatar_url");

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.adminUpload(file, "avatar");
      // Store the web-size derivative, not the 480px thumb — next/image
      // handles further downscaling for the 56-112px avatar contexts fine,
      // and this way the full-size image isn't silently discarded.
      setValue("avatar_url", res.image_url, { shouldValidate: true });
      setValue("avatar_id", res.id);
      toast.success("Avatar uploaded");
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
            {artist ? "Edit artist" : "Add artist"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-dashed border-ink/25 bg-cream text-muted transition-colors hover:border-ink"
              aria-label="Upload avatar"
            >
              {uploading ? (
                <Spinner />
              ) : avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar preview" fill className="object-cover" sizes="80px" />
              ) : (
                <ImagePlus className="h-6 w-6" />
              )}
            </button>
            <div className="flex-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              <FieldError>{errors.name?.message}</FieldError>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <FieldError>{errors.avatar_url?.message}</FieldError>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} {...register("bio")} />
          </div>
          <div>
            <Label htmlFor="website_url">Website</Label>
            <Input id="website_url" placeholder="https://…" {...register("website_url")} />
            <FieldError>{errors.website_url?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="instagram_url">Instagram</Label>
            <Input id="instagram_url" placeholder="https://instagram.com/…" {...register("instagram_url")} />
            <FieldError>{errors.instagram_url?.message}</FieldError>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting || uploading}>
              {artist ? "Save changes" : "Create artist"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
