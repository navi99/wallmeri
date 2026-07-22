import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { SiteImage } from "@/lib/types";

// Mirrors apps/api/app/models/site_image.py:SITE_IMAGE_SLOTS. The backend is
// the source of truth for validation (unknown slot / too many images both
// 400 there); this copy only drives admin UI labels and the "add" button's
// disabled-at-max state.
export const SITE_IMAGE_SLOTS: Record<string, { label: string; maxImages: number }> = {
  home_hero: { label: "Homepage hero", maxImages: 6 },
  home_why_wallmeri: { label: 'Homepage "Why Wallmeri" image', maxImages: 1 },
  about_hero: { label: "About Us hero", maxImages: 1 },
  cyo_phone: { label: "Create Your Own — phone mockup", maxImages: 1 },
  cyo_poster: { label: "Create Your Own — poster mockup", maxImages: 1 },
};

export function useSiteImages() {
  return useQuery({
    queryKey: ["site-images"],
    queryFn: () => api.listSiteImages(),
  });
}

// Ordered images for one slot, already position-sorted server-side.
export function pickSlot(images: SiteImage[] | undefined, slot: string): SiteImage[] {
  return (images ?? []).filter((img) => img.slot === slot);
}
