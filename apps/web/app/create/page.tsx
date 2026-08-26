"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import Cropper, { type Area, type MediaSize, type Point } from "react-easy-crop";
import {
  AlertTriangle,
  Crop,
  ImagePlus,
  PackageCheck,
  ShoppingBag,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { SizePicker } from "@/components/custom/size-picker";
import { UploadDropzone } from "@/components/custom/upload-dropzone";
import { SingleSiteImage } from "@/components/site-image-banner";
import { Button, Spinner } from "@/components/ui";
import { FeatureTile, type Tile } from "@/components/feature-tile";
import { api, ApiError } from "@/lib/api";
import { useCart } from "@/lib/store/cart";
import { computeDpi, dpiBand, sizeAspect } from "@/lib/custom-dpi";
import type { Orientation, UploadResult } from "@/lib/types";
import { formatINR } from "@/lib/utils";

type Step = "upload" | "design";

const processSteps: Tile[] = [
  { icon: ImagePlus, title: "1. Upload", body: "Choose artwork you love." },
  { icon: Crop, title: "2. Customize", body: "Adjust the perfect framing." },
  { icon: ShoppingBag, title: "3. Order", body: "Secure checkout in minutes." },
  { icon: PackageCheck, title: "4. Delivered", body: "Arrives ready to display." },
];

export default function CreatePage() {
  const router = useRouter();
  const cartAdd = useCart((s) => s.add);

  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [asset, setAsset] = useState<UploadResult | null>(null);
  const [sizeCode, setSizeCode] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  // The cropper displays the *web* derivative (downscaled to at most ~1600px
  // by the upload pipeline), not the full-resolution original - so its
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

  // Aspect only changes with orientation (all launch sizes share a ratio) -
  // reset the crop view so the new box isn't a stretched leftover.
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, [orientation]);

  // Modal owns the whole upload → crop → order flow; closing it (Escape,
  // backdrop, or the X) discards progress so reopening always starts fresh.
  const resetFlow = () => {
    setStep("upload");
    setAsset(null);
    setCroppedAreaPixels(null);
    setNaturalWidth(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetFlow();
  };

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  const selectedSize = sizesQuery.data?.find((s) => s.code === sizeCode) ?? null;
  const aspect = selectedSize ? sizeAspect(selectedSize, orientation) : 3 / 4;

  // Crop rect mapped from the displayed (web-derivative) image's pixel space
  // back to the original's - see the naturalWidth comment above.
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
        title: "Custom poster",
        image_url: item.preview_url,
        price_inr: item.price_inr,
        size_label: item.size_label,
        dpi_band: item.dpi_band,
      });
      toast.success("Added to cart");
      setModalOpen(false);
      router.push("/cart");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't add to cart"),
  });

  return (
    <div className="bg-cream">
      <div className="container-page py-8 md:py-12">
        <div className="flex flex-wrap items-center gap-x-16 gap-y-12">
          <div className="flex min-w-[280px] flex-1 flex-col gap-6">
            <div className="kicker">
              Custom Poster
            </div>
            <h1 className="title-display">
              Your perfect poster starts
              <br />
              <em className="font-display font-medium normal-case italic tracking-normal [word-spacing:0em] text-premium-600">
                with you.
              </em>
            </h1>
            <p className="max-w-[420px] text-[17px] leading-relaxed text-muted">
              Upload your favourite image and turn it into a premium metal poster, made just for
              you.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="label inline-flex h-14 items-center gap-3 bg-premium-600 px-9 text-cream transition-colors hover:bg-premium-700"
              >
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                Upload Your Image
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-5" style={{ minWidth: 260 }}>
            <div className="w-full max-w-[560px] shadow-[0_30px_60px_rgba(27,23,23,0.35)] sm:max-w-[640px]">
              <div className="relative aspect-[3/4]">
                <SingleSiteImage
                  slot="cyo_showcase"
                  sizes="(max-width: 640px) 90vw, 640px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16 md:mt-24">
          <h2 className="title-lg border-b border-line pb-4">Easy 4 Step Process</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((s) => (
              <FeatureTile key={s.title} {...s} />
            ))}
          </div>
        </section>

        <div className="mt-16 flex items-center gap-4 bg-ink px-8 py-5 text-cream/85 md:mt-24">
          <AlertTriangle className="h-5 w-5 flex-none text-premium-600" aria-hidden="true" />
          <p className="text-sm leading-relaxed">
            <span className="font-semibold text-cream">Important Note: </span>
            By uploading an image, you confirm that you own it or have permission to use and
            print it. WallMeri is not responsible for copyright claims arising from
            customer-uploaded content.
          </p>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-line bg-paper shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <div className="kicker">
                  Custom Poster
                </div>
                <h2 className="mt-1 title-xs">
                  {step === "upload" ? "Upload your photo" : "Customize your poster"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="grid h-9 w-9 flex-none place-items-center text-muted hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6">
              {step === "upload" && (
                <UploadDropzone uploading={uploadMutation.isPending} onFile={handleFile} />
              )}

              {step === "design" && asset && (
                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                  <div>
                    <div className="relative h-[360px] w-full bg-ink/5 sm:h-[440px]">
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
                    <label className="label mt-4 block text-xs text-muted">
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
                      onClick={resetFlow}
                      className="mt-4 label text-xs text-muted hover:text-ink"
                    >
                      ← Choose a different photo
                    </button>
                  </div>

                  <aside className="h-fit border border-line bg-cream p-6">
                    {sizesQuery.isLoading ? (
                      <div className="grid place-items-center py-10">
                        <Spinner />
                      </div>
                    ) : !sizesQuery.data || sizesQuery.data.length === 0 ? (
                      <p className="text-sm text-muted">
                        Custom printing is temporarily unavailable - check back soon.
                      </p>
                    ) : (
                      <>
                        <div className="label text-xs text-muted">
                          Size
                        </div>
                        <div className="mt-2">
                          <SizePicker sizes={sizesQuery.data} selected={sizeCode} onSelect={setSizeCode} />
                        </div>

                        <div className="mt-5 label text-xs text-muted">
                          Orientation
                        </div>
                        <div className="mt-2 flex gap-2">
                          {(["portrait", "landscape"] as const).map((o) => (
                            <button
                              key={o}
                              type="button"
                              onClick={() => setOrientation(o)}
                              aria-pressed={orientation === o}
                              className={`label flex-1 border px-3 py-2 text-xs transition-colors ${
                                orientation === o
                                  ? "border-ink bg-ink text-cream"
                                  : "border-line text-ink hover:border-ink"
                              }`}
                            >
                              {o === "portrait" ? "Portrait" : "Landscape"}
                            </button>
                          ))}
                        </div>

                        {band && (
                          <div className="mt-5 border border-line bg-paper px-3 py-2.5 text-xs leading-relaxed">
                            {band === "ok" && (
                              <p className="text-ink">
                                Print quality: <span className="font-semibold">Excellent</span> (~{dpi} DPI)
                              </p>
                            )}
                            {band === "warning" && (
                              <p className="text-brand-700">
                                May look soft when printed (~{dpi} DPI) - try zooming out or a smaller size.
                              </p>
                            )}
                            {band === "blocked" && (
                              <p className="font-semibold text-brand-700">
                                Too low-resolution for {selectedSize?.code} (~{dpi} DPI) - zoom out or pick
                                a smaller size.
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
                          <span className="text-sm font-semibold text-ink">Total</span>
                          <span className="title-sm">
                            {selectedSize ? formatINR(selectedSize.price_inr) : "-"}
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
                          design is reviewed before printing - no returns for customer-error content.
                        </p>
                      </>
                    )}
                  </aside>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
