import type { DpiBand, Orientation, PosterSize } from "@/lib/types";

const CM_PER_INCH = 2.54;
// Mirrors app.services.custom_upload_service.compute_dpi / dpi_band on the
// backend, which is authoritative (it re-validates on submit) — this is
// instant client-side feedback only. Keep in sync with app/core/config.py's
// CUSTOM_DPI_OK / CUSTOM_DPI_MIN.
const DPI_OK = 150;
const DPI_MIN = 100;

export function computeDpi(
  size: PosterSize,
  orientation: Orientation,
  cropWidthPx: number,
  cropHeightPx: number,
): number {
  // PosterSize.width_cm/height_cm are stored portrait-first; landscape swaps
  // which physical dimension is "width" vs "height".
  let widthCm = size.width_cm;
  let heightCm = size.height_cm;
  if (orientation === "landscape") {
    [widthCm, heightCm] = [heightCm, widthCm];
  }
  const widthIn = widthCm / CM_PER_INCH;
  const heightIn = heightCm / CM_PER_INCH;
  return Math.floor(Math.min(cropWidthPx / widthIn, cropHeightPx / heightIn));
}

export function dpiBand(dpi: number): DpiBand {
  if (dpi >= DPI_OK) return "ok";
  if (dpi >= DPI_MIN) return "warning";
  return "blocked";
}

export function sizeAspect(size: PosterSize, orientation: Orientation): number {
  return orientation === "portrait" ? size.width_cm / size.height_cm : size.height_cm / size.width_cm;
}
