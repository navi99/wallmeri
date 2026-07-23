"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import Image from "@/components/app-image";
import { Button, Card, FieldError, Input, Label, Spinner, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatINR } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(20).optional().or(z.literal("")),
  message: z.string().max(4000).optional().or(z.literal("")),
  website: z.string().optional(), // honeypot
});
type FormValues = z.infer<typeof schema>;

export default function OriginalPaintingPage({ params }: { params: { slug: string } }) {
  const [submitted, setSubmitted] = useState(false);

  const { data: product } = useQuery({
    queryKey: ["product", params.slug],
    queryFn: () => api.getProduct(params.slug),
    retry: false,
  });

  const {
    data: original,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["original", params.slug],
    queryFn: () => api.getOriginal(params.slug),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await api.submitOriginalInquiry(params.slug, {
        name: values.name,
        email: values.email,
        phone: values.phone ?? "",
        message: values.message ?? "",
        website: values.website ?? "",
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not send your interest");
    }
  };

  if (isLoading) {
    return (
      <div className="grid place-items-center py-32">
        <Spinner />
      </div>
    );
  }

  if (error || !original) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-ink">
          {notFound ? "No original for this poster" : "Something went wrong"}
        </h1>
        <Link
          href={`/product/${params.slug}`}
          className="mt-4 inline-block font-semibold text-brand-600 hover:underline"
        >
          Back to poster
        </Link>
      </div>
    );
  }

  const title = product ? `${product.title} — Original` : "Original painting";
  const dimensions = `${Number(original.width_cm)} × ${Number(original.height_cm)} cm`;

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link href={`/product/${params.slug}`} className="hover:text-brand-600">
          {product?.title ?? "Poster"}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink">Original</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative aspect-[3/4] overflow-hidden bg-ink p-[5px] shadow-lift">
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={original.image_url || product?.image_url || ""}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-600">
            One of a kind
          </div>
          <h1 className="mt-2.5 text-3xl font-bold uppercase leading-[1.1] tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 font-display text-base italic text-muted">
            {product?.artist ? (
              <>
                by{" "}
                <Link href={`/artist/${product.artist.slug}`} className="text-brand-600 hover:text-ink">
                  {product.artist.name}
                </Link>
              </>
            ) : (
              "A Wallmeri Original"
            )}
          </p>

          <p className="mt-4 text-3xl font-bold text-brand-600">{formatINR(original.price_inr)}</p>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted">
            {original.medium && (
              <div>
                <dt className="text-xs uppercase tracking-[0.08em]">Medium</dt>
                <dd className="text-ink">{original.medium}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-[0.08em]">Dimensions</dt>
              <dd className="text-ink">{dimensions}</dd>
            </div>
            {original.year_created && (
              <div>
                <dt className="text-xs uppercase tracking-[0.08em]">Year</dt>
                <dd className="text-ink">{original.year_created}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-[0.08em]">Status</dt>
              <dd className="text-ink capitalize">{original.status}</dd>
            </div>
          </dl>

          {original.story && (
            <p className="mt-5 whitespace-pre-wrap font-display text-lg italic leading-relaxed text-ink">
              {original.story}
            </p>
          )}

          <Card className="mt-8 p-6">
            {submitted ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
                <h2 className="mt-3 text-lg font-bold uppercase tracking-tight text-ink">
                  Interest received
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Thanks — our team will reach out by email or phone to follow up.
                </p>
              </div>
            ) : original.status === "sold" ? (
              <p className="text-center text-sm text-muted">
                This original has already sold. Explore more from{" "}
                {product?.artist ? (
                  <Link href={`/artist/${product.artist.slug}`} className="text-brand-600 hover:underline">
                    {product.artist.name}
                  </Link>
                ) : (
                  "Wallmeri"
                )}
                .
              </p>
            ) : (
              <>
                <h2 className="text-lg font-bold uppercase tracking-tight text-ink">
                  Send your interest
                </h2>
                {original.status === "reserved" && (
                  <p className="mt-1 text-sm text-muted">
                    This piece is currently reserved — we&rsquo;re still taking backup interest.
                  </p>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" autoComplete="name" {...register("name")} />
                    <FieldError>{errors.name?.message}</FieldError>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" autoComplete="email" {...register("email")} />
                    <FieldError>{errors.email?.message}</FieldError>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
                    <FieldError>{errors.phone?.message}</FieldError>
                  </div>
                  <div>
                    <Label htmlFor="message">Message (optional)</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      placeholder="Tell us anything relevant — where it'll hang, questions about the piece…"
                      {...register("message")}
                    />
                  </div>
                  {/* Honeypot — hidden from humans, bots fill it in. */}
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                    {...register("website")}
                  />
                  <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                    Send Interest
                  </Button>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
