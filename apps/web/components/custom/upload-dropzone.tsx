"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

import { Spinner } from "@/components/ui";

export function UploadDropzone({
  uploading,
  onFile,
}: {
  uploading: boolean;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      onClick={() => !uploading && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      aria-label="Upload a photo"
      aria-disabled={uploading}
      className={`grid min-h-[360px] cursor-pointer place-items-center border-2 border-dashed p-10 text-center transition-colors ${
        dragOver ? "border-ink bg-ink/5" : "border-ink/25 bg-paper hover:border-ink/50"
      }`}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-muted">Uploading…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <UploadCloud className="h-10 w-10 text-ink/40" />
          <p className="text-sm font-semibold text-ink">Drag &amp; drop a photo, or click to browse</p>
          <p className="text-xs text-muted">JPEG, PNG or WebP — up to 15 MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
    </div>
  );
}
