"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { X } from "lucide-react";

import { Button, Spinner } from "@/components/ui";
import { cropImageToBlob } from "@/lib/crop-image";

// Gallery images are locked to 3:4 (matches the storefront gallery box) so the
// vertical thumbnail rail / main image stay visually uniform — see DESIGN.md.
const GALLERY_ASPECT = 3 / 4;

export function ImageCropModal({
  file,
  onCancel,
  onConfirm,
}: {
  file: File;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  // Create/revoke the blob URL inside the same effect (not split across a
  // useState initializer + a cleanup) so React 18 Strict Mode's dev-only
  // mount→cleanup→mount cycle doesn't revoke a URL the <img> hasn't loaded yet.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  const confirm = async () => {
    if (!croppedArea || !src) return;
    setProcessing(true);
    try {
      const blob = await cropImageToBlob(src, croppedArea);
      onConfirm(blob);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/60 p-4">
      <div className="w-full max-w-md border border-ink/10 bg-paper p-6 shadow-lift">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-ink">Crop image</h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
            aria-label="Cancel crop"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-4 h-80 w-full bg-ink/5">
          {src ? (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={GALLERY_ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <Spinner />
            </div>
          )}
        </div>

        <label className="mt-4 block text-xs font-medium uppercase tracking-[0.08em] text-muted">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="mt-1.5 w-full accent-brand-600"
            aria-label="Zoom"
          />
        </label>

        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={confirm} loading={processing} disabled={!croppedArea}>
            Use this crop
          </Button>
        </div>
      </div>
    </div>
  );
}
