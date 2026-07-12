"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { Select, Spinner } from "@/components/ui";
import { api } from "@/lib/api";

function CategoryContent({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const sort = params.get("sort") ?? "newest";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });
  const productsQuery = useQuery({
    queryKey: ["products", { category: slug, sort, page }],
    queryFn: () => api.listProducts({ category: slug, sort, page, page_size: 12 }),
  });

  const category = categoriesQuery.data?.find((c) => c.slug === slug);
  const data = productsQuery.data;

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    if (!("page" in patch)) next.delete("page");
    router.push(`/category/${slug}?${next.toString()}`);
  };

  return (
    <div className="container-page py-8">
      <Link
        href="/catalog"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand-600"
      >
        <ChevronLeft className="h-4 w-4" /> All posters
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-ink">
            {category?.name ?? slug}
          </h1>
          <p className="text-sm text-muted">
            {data ? `${data.total} ${data.total === 1 ? "design" : "designs"}` : "Loading…"}
          </p>
        </div>
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
      </div>

      {/* Other categories */}
      {categoriesQuery.data && (
        <div className="mt-5 flex flex-wrap gap-2">
          {categoriesQuery.data.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                c.slug === slug
                  ? "border-brand-600 bg-brand-600 text-cream"
                  : "border-brand-200 bg-paper text-ink hover:border-brand-400 hover:bg-brand-50"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

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
          <p className="text-lg font-semibold text-ink">Nothing here yet</p>
          <Link
            href="/catalog"
            className="mt-3 inline-block font-semibold text-brand-600 hover:underline"
          >
            View all posters
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense
      fallback={
        <div className="container-page py-24 text-center">
          <Spinner />
        </div>
      }
    >
      <CategoryContent slug={params.slug} />
    </Suspense>
  );
}
