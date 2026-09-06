"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";

import { SORT_OPTIONS } from "@/components/catalog-filter-rail";
import { FilterMenu } from "@/components/filter-menu";
import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import { Spinner } from "@/components/ui";
import { api } from "@/lib/api";

function CategoryContent({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const artist = params.get("artist") ?? "";
  const sort = params.get("sort") ?? "newest";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });
  const artistsQuery = useQuery({
    queryKey: ["artists"],
    queryFn: () => api.listArtists(),
  });
  const productsQuery = useQuery({
    queryKey: ["products", { category: slug, artist, sort, page }],
    queryFn: () =>
      api.listProducts({ category: slug, artist, sort, page, page_size: 12 }),
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

  // Category is fixed by the route here, so the facet navigates rather than
  // patching the query string.
  const categoryOptions = [
    { value: "", label: "All categories", href: "/catalog" },
    ...(categoriesQuery.data ?? []).map((c) => ({
      value: c.slug,
      label: c.name,
      href: `/category/${c.slug}`,
    })),
  ];

  const artistOptions = [
    { value: "", label: "All artists" },
    ...(artistsQuery.data ?? []).map((a) => ({
      value: a.slug,
      label: a.name,
      count: a.product_count,
    })),
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
        <Link href="/catalog" className="transition-colors hover:text-brand-600">
          Gallery
        </Link>
        <span aria-hidden className="px-2 text-muted">
          /
        </span>
        <span className="text-ink">{category?.name ?? slug}</span>
      </nav>

      <div className="mt-5 border-b border-line pb-6">
        <h1 className="title-lg">
          {category?.name ?? slug}
        </h1>
      </div>

      {/* Category and Artist left, Sort right - same toolbar placement as
          the gallery page, sitting directly above the grid it acts on. */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <FilterMenu label="Category" options={categoryOptions} selected={slug} />
          <FilterMenu
            label="Artist"
            options={artistOptions}
            selected={artist}
            onSelect={(value) => update({ artist: value })}
          />
        </div>
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
              Nothing here yet
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
