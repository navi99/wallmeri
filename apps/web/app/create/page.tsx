"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import Cropper, { type Area, type MediaSize, type Point } from "react-easy-crop";
import { toast } from "sonner";

import { SizePicker } from "@/components/custom/size-picker";
import { UploadDropzone } from "@/components/custom/upload-dropzone";
import { Button, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useCart } from "@/lib/store/cart";
import { computeDpi, dpiBand, sizeAspect } from "@/lib/custom-dpi";
import type { Orientation, UploadResult } from "@/lib/types";
import { formatINR } from "@/lib/utils";

type Step = "upload" | "design";

export default function CreatePage() {
  const router = useRouter();
  const cartAdd = useCart((s) => s.add);

  const [step, setStep] = useState<Step>("upload");
  const [asset, setAsset] = useState<UploadResult | null>(null);
  const [sizeCode, setSizeCode] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  // The cropper displays the *web* derivative (downscaled to at most ~1600px
  // by the upload pipeline), not the full-resolution original — so its
  // onCropComplete pixels are in that smaller image's coordinate space.
  // naturalWidth is the displayed image's true pixel width (from Cropper's
  // onMediaLoaded); scaling by asset.width/naturalWidth maps crop coordinates
  // back to the original's space, which is what DPI math and the server
  // (which crops the original) both need.
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null);

  const sizesQuery = useQuery({ queryKey: ["poster-sizes"], queryFn: () => api.posterSizes() });

  useEffect(() => {
    if (!sizeCode && sizesQuery.data && sizesQuery.data.length > 0) {
      setSizeCode(sizesQuery.data[0].code);
    }
  }, [sizesQuery.data, sizeCode]);

  // Aspect only changes with orientation (all launch sizes share a ratio) —
  // reset the crop view so the new box isn't a stretched leftover.
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, [orientation]);

  const selectedSize = sizesQuery.data?.find((s) => s.code === sizeCode) ?? null;
  const aspect = selectedSize ? sizeAspect(selectedSize, orientation) : 3 / 4;

  // Crop rect mapped from the displayed (web-derivative) image's pixel space
  // back to the original's — see the naturalWidth comment above.
  const scale = asset && naturalWidth ? asset.width / naturalWidth : 1;
  const originalCrop =
    croppedAreaPixels && scale
      ? {
          x: croppedAreaPixels.x * scale,
          y: croppedAreaPixels.y * scale,
          width: croppedAreaPixels.width * scale,
          height: croppedAreaPixels.height * scale,
        }
      : null;

  const dpi =
    selectedSize && originalCrop
      ? computeDpi(selectedSize, orientation, originalCrop.width, originalCrop.height)
      : 0;
  const band = dpi > 0 ? dpiBand(dpi) : null;

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.customUpload(file),
    onSuccess: (result) => {
      setNaturalWidth(null);
      setAsset(result);
      setStep("design");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Upload failed"),
  });

  const handleFile = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please upload a JPEG, PNG or WebP image");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image is too large (max 15 MB)");
      return;
    }
    uploadMutation.mutate(file);
  };

  const addMutation = useMutation({
    mutationFn: () => {
      if (!asset || !selectedSize || !originalCrop) {
        throw new Error("Finish cropping your photo first");
      }
      return api.customCreateItem({
        media_id: asset.id,
        size_code: selectedSize.code,
        orientation,
        crop: {
          x: Math.round(originalCrop.x),
          y: Math.round(originalCrop.y),
          width: Math.round(originalCrop.width),
          height: Math.round(originalCrop.height),
        },
      });
    },
    onSuccess: (item) => {
      cartAdd({
        kind: "custom",
        custom_upload_id: item.custom_upload_id,
        title: `Custom poster — ${item.size_label}`,
        image_url: item.preview_url,
        price_inr: item.price_inr,
        size_label: item.size_label,
        dpi_band: item.dpi_band,
      });
      toast.success("Added to cart");
      router.push("/cart");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't add to cart"),
  });

  return (
    <div className="bg-cream">
      <div className="container-page py-8 md:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-600">
            Custom Poster
          </div>
          <h1 className="mt-2 font-sans text-[32px] sm:text-[40px] lg:text-[48px] font-bold uppercase leading-[50px] tracking-tight text-ink">
            Your photo,{" "}
            <em className="font-display font-medium normal-case italic tracking-normal text-brand-600">
              on metal.
            </em>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted">
            Upload a photo, crop it to size, and we&apos;ll turn it into a museum-quality metal
            poster — reviewed by our team before it goes to print.
          </p>
        </div>

        <div className="mt-8">
          {step === "upload" && (
            <div className="mx-auto max-w-2xl">
              <UploadDropzone uploading={uploadMutation.isPending} onFile={handleFile} />
            </div>
          )}

          {step === "design" && asset && (
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div>
                <div className="relative h-[420px] w-full bg-ink/5 sm:h-[520px]">
                  <Cropper
                    image={asset.image_url}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_area, pixels) => setCroppedAreaPixels(pixels)}
                    onMediaLoaded={(mediaSize: MediaSize) => setNaturalWidth(mediaSize.naturalWidth)}
                  />
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
                <button
                  type="button"
                  onClick={() => {
                    setAsset(null);
                    setCroppedAreaPixels(null);
                    setNaturalWidth(null);
                    setStep("upload");
                  }}
                  className="mt-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted hover:text-ink"
                >
                  ← Choose a different photo
                </button>
              </div>

              <aside className="h-fit border border-ink/10 bg-paper p-6">
                {sizesQuery.isLoading ? (
                  <div className="grid place-items-center py-10">
                    <Spinner />
                  </div>
                ) : !sizesQuery.data || sizesQuery.data.length === 0 ? (
                  <p className="text-sm text-muted">
                    Custom printing is temporarily unavailable — check back soon.
                  </p>
                ) : (
                  <>
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                      Size
                    </div>
                    <div className="mt-2">
                      <SizePicker sizes={sizesQuery.data} selected={sizeCode} onSelect={setSizeCode} />
                    </div>

                    <div className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                      Orientation
                    </div>
                    <div className="mt-2 flex gap-2">
                      {(["portrait", "landscape"] as const).map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setOrientation(o)}
                          aria-pressed={orientation === o}
                          className={`flex-1 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.05em] transition-colors ${
                            orientation === o
                              ? "border-ink bg-ink text-cream"
                              : "border-ink/20 text-ink hover:border-ink"
                          }`}
                        >
                          {o === "portrait" ? "Portrait" : "Landscape"}
                        </button>
                      ))}
                    </div>

                    {band && (
                      <div className="mt-5 border border-ink/10 bg-cream px-3 py-2.5 text-xs leading-relaxed">
                        {band === "ok" && (
                          <p className="text-ink">
                            Print quality: <span className="font-semibold">Excellent</span> (~{dpi} DPI)
                          </p>
                        )}
                        {band === "warning" && (
                          <p className="text-brand-700">
                            May look soft when printed (~{dpi} DPI) — try zooming out or a smaller size.
                          </p>
                        )}
                        {band === "blocked" && (
                          <p className="font-semibold text-brand-700">
                            Too low-resolution for {selectedSize?.code} (~{dpi} DPI) — zoom out or pick
                            a smaller size.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-5 flex items-baseline justify-between border-t border-ink/10 pt-4">
                      <span className="text-sm font-semibold text-ink">Total</span>
                      <span className="text-xl font-bold text-ink">
                        {selectedSize ? formatINR(selectedSize.price_inr) : "—"}
                      </span>
                    </div>

                    <Button
                      size="lg"
                      className="mt-4 w-full"
                      onClick={() => addMutation.mutate()}
                      loading={addMutation.isPending}
                      disabled={!selectedSize || band === "blocked" || !originalCrop}
                    >
                      Add to cart
                    </Button>
                    <p className="mt-3 text-xs leading-relaxed text-muted">
                      By continuing you confirm you own the rights to this image. Every custom
                      design is reviewed before printing — no returns for customer-error content.
                    </p>
                  </>
                )}
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
