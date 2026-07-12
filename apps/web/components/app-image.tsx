import Image, { type ImageProps } from "next/image";

const LOCAL_UPLOAD_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

function isLocalUpload(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return false;
  try {
    return LOCAL_UPLOAD_HOSTNAMES.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

// In local Docker Compose dev, product/artist images uploaded to the API's
// local-disk fallback are served at http://localhost:8000/uploads/... — a URL
// that only resolves from the browser (via the published port). Next's image
// optimizer runs *inside* the web container and fetches the source image
// server-side, so "localhost" there resolves to the web container itself and
// the fetch fails with ECONNREFUSED. Skip optimization for these URLs so the
// browser loads them directly; every other source (S3/R2, Picsum, Unsplash)
// still goes through the normal optimizer.
export default function AppImage({ src, unoptimized, ...props }: ImageProps) {
  return <Image src={src} unoptimized={unoptimized ?? isLocalUpload(src)} {...props} />;
}
