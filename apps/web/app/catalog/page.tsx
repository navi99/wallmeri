"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ProductCard } from "@/components/product-card";
import { Select, Spinner } from "@/components/ui";
import { api } from "@/lib/api";

function CatalogContent() {
  const router = useRouter();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "newest";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });

  const productsQuery = useQuery({
    queryKey: ["products", { q, category, sort, page }],
    queryFn: () => api.listProducts({ q, category, sort, page, page_size: 12 }),
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

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-ink">
          {q ? `Results for “${q}”` : category ? categoryName(category, categoriesQuery.data) : "All metal posters"}
        </h1>
        <p className="text-sm text-muted">
          {data ? `${data.total} ${data.total === 1 ? "design" : "designs"}` : "Loading…"}
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Select
          value={category}
          onChange={(e) => update({ category: e.target.value })}
          className="w-auto"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categoriesQuery.data?.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="w-auto"
          aria-label="Sort products"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="title">Name: A–Z</option>
        </Select>

        {(q || category) && (
          <Link
            href="/catalog"
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            Clear filters
          </Link>
        )}
      </div>

      {/* Create-your-own callout — modest, off to the side of the browsing flow */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-ink/10 bg-paper px-5 py-4">
        <p className="text-sm text-ink">
          <span className="font-semibold">Don&apos;t see what you&apos;re after?</span>{" "}
          <span className="text-muted">Upload your own photo and we&apos;ll print it on aluminium.</span>
        </p>
        <Link
          href="/create"
          className="shrink-0 text-xs font-semibold uppercase tracking-[0.06em] text-brand-600 hover:underline"
        >
          Create your own →
        </Link>
      </div>

      {/* Grid */}
      {productsQuery.isLoading ? (
        <div className="grid place-items-center py-24">
          <Spinner />
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {data.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => update({ page: String(page - 1) })}
                className="rounded-lg border border-brand-200 bg-paper px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-2 text-sm text-muted">
                Page {data.page} of {data.pages}
              </span>
              <button
                disabled={page >= data.pages}
                onClick={() => update({ page: String(page + 1) })}
                className="rounded-lg border border-brand-200 bg-paper px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 rounded-2xl border border-brand-100 bg-paper p-12 text-center">
          <p className="text-lg font-semibold text-ink">No posters found</p>
          <p className="mt-1 text-muted">Try a different search or clear your filters.</p>
          <Link
            href="/catalog"
            className="mt-4 inline-block font-semibold text-brand-600 hover:underline"
          >
            View all posters
          </Link>
        </div>
      )}
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
