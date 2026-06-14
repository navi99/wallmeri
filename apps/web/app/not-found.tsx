import Link from "next/link";

import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="container-page py-28 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-3 text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="mt-6 inline-block">
        <Button size="lg">Back to home</Button>
      </Link>
    </div>
  );
}
