"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { SORT_OPTIONS } from "@/components/catalog-filter-rail";
import { FilterMenu } from "@/components/filter-menu";
import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import { Spinner } from "@/components/ui";
import { api } from "@/lib/api";

function CatalogContent() {
  const router = useRouter();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  // No facet sets this any more - the roster at /artists and each artist's own
  // page cover browsing by artist - but existing ?artist= links still filter.
  const artist = params.get("artist") ?? "";
  const sort = params.get("sort") ?? "newest";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });

  const productsQuery = useQuery({
    queryKey: ["products", { q, category, artist, sort, page }],
    queryFn: () => api.listProducts({ q, category, artist, sort, page, page_size: 12 }),
  });

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    if (!("page" in patch)) next.delete("page");
    router.push(`/catalog?${next.toString()}`);
  };

  const data = productsQuery.data;
  const heading = q
    ? `Results for “${q}”`
    : category
      ? categoryName(category, categoriesQuery.data)
      : "Gallery";

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...(categoriesQuery.data ?? []).map((c) => ({ value: c.slug, label: c.name })),
  ];

  return (
    <div className="container-page py-12 lg:py-16">
      <nav
        aria-label="Breadcrumb"
        className="label text-xs text-muted"
      >
        <Link href="/" className="transition-colors hover:text-brand-600">
          Home
        </Link>
        <span aria-hidden className="px-2 text-muted">
          /
        </span>
        <span className="text-ink">Gallery</span>
      </nav>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b border-line pb-6">
        <h1 className="title-xl">
          {heading}
        </h1>
        <p className="label text-xs text-muted">
          {data ? `${data.total} ${data.total === 1 ? "design" : "designs"}` : "Loading…"}
        </p>
      </div>

      {/* Create-your-own callout - a quiet band under the title: it answers
          "nothing here fits" before the browsing starts, without competing
          with the artwork. */}
      <div className="mt-6 flex flex-col gap-3 border border-line bg-paper px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div>
          <p className="text-sm font-medium leading-5 text-ink">
            Don&apos;t see what you&apos;re after?
          </p>
          <p className="mt-1.5 text-sm leading-5 text-muted">
            Upload your own photo and we&apos;ll print it on aluminium.
          </p>
        </div>
        <Link
          href="/create"
          className="shrink-0 label text-xs text-brand-600 hover:underline"
        >
          Create your own →
        </Link>
      </div>

      {/* Category left, Sort right - the whole filter set now, at every width,
          sitting directly above the grid it acts on. */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <FilterMenu
          label="Category"
          options={categoryOptions}
          selected={category}
          onSelect={(value) => update({ category: value })}
        />
        <FilterMenu
          label="Sort"
          options={SORT_OPTIONS}
          selected={sort}
          align="end"
          onSelect={(value) => update({ sort: value })}
        />
      </div>

      <div className="mt-8">
        {productsQuery.isLoading ? (
          <div className="grid place-items-center py-24">
            <Spinner />
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-4">
              {data.items.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  imageSizes="(max-width: 1024px) 50vw, 25vw"
                />
              ))}
            </div>

            <Pagination
              page={page}
              pages={data.pages}
              onPage={(next) => update({ page: String(next) })}
            />
          </>
        ) : (
          <div className="border border-line bg-paper p-12 text-center">
            <p className="title-xs">
              No designs found
            </p>
            <p className="mt-2 text-sm text-muted">
              Try a different search or clear your filters.
            </p>
            <Link
              href="/catalog"
              className="mt-5 inline-block label text-xs text-brand-600 hover:underline"
            >
              View all designs →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function categoryName(
  slug: string,
  cats?: { slug: string; name: string }[],
): string {
  return cats?.find((c) => c.slug === slug)?.name ?? "Catalog";
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="container-page py-24 text-center"><Spinner /></div>}>
      <CatalogContent />
    </Suspense>
  );
}
