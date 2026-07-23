"use client";

import Image from "@/components/app-image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ApplicationsTab } from "@/components/admin/applications-tab";
import { ArtistsTab } from "@/components/admin/artists-tab";
import { CategoriesTab } from "@/components/admin/categories-tab";
import { CustomReviewTab } from "@/components/admin/custom-review-tab";
import { OrdersTab } from "@/components/admin/orders-tab";
import { OriginalInquiriesTab } from "@/components/admin/original-inquiries-tab";
import { PosterSizesTab } from "@/components/admin/poster-sizes-tab";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { ReviewsTab } from "@/components/admin/reviews-tab";
import { SiteImagesTab } from "@/components/admin/site-images-tab";
import { Badge, Button, Card, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/store/auth";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const TABS = [
  "posters",
  "categories",
  "artists",
  "applications",
  "orders",
  "custom review",
  "poster sizes",
  "reviews",
  "site content",
  "original inquiries",
] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("posters");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    if (hydrated && (!user || !user.is_admin)) router.replace("/login?next=/admin");
  }, [hydrated, user, router]);

  const isAdmin = !!user?.is_admin;
  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.adminListProducts(),
    enabled: isAdmin && tab === "posters",
  });
  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.adminListCategories(),
    enabled: isAdmin,
  });
  const artistsQuery = useQuery({
    queryKey: ["admin-artists"],
    queryFn: () => api.adminListArtists(),
    enabled: isAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const body = { ...values, artist_id: values.artist_id || null };
      return editing
        ? api.adminUpdateProduct(editing.id, body)
        : api.adminCreateProduct(body);
    },
    onSuccess: () => {
      toast.success(editing ? "Poster updated" : "Poster created");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.adminDeleteProduct(id),
    onSuccess: () => {
      toast.success("Poster deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Delete failed"),
  });

  if (!hydrated || !user?.is_admin) {
    return (
      <div className="grid place-items-center py-32">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold uppercase tracking-[0.03em] text-ink">Admin</h1>
        {tab === "posters" && (
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add poster
          </Button>
        )}
      </div>

      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-ink/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors ${
              tab === t
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "posters" && (
          <Card className="overflow-hidden">
            {productsQuery.isLoading ? (
              <div className="grid place-items-center py-16">
                <Spinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-ink/10 bg-cream text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted">
                    <tr>
                      <th className="px-4 py-3">Poster</th>
                      <th className="px-4 py-3">Artist</th>
                      <th className="px-4 py-3">Categories</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {productsQuery.data?.map((p) => (
                      <tr key={p.id} className="hover:bg-cream/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-ink/5">
                              {p.thumb_url && (
                                <Image
                                  src={p.thumb_url}
                                  alt={p.title}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              )}
                            </div>
                            <span className="font-medium text-ink">{p.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {p.artist?.name ?? "Wallmeri Original"}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {p.categories.map((c) => c.name).join(", ") || "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-ink">
                          {formatINR(p.price_inr)}
                        </td>
                        <td className="px-4 py-3">
                          {p.is_active ? (
                            <Badge tone="progress">Active</Badge>
                          ) : (
                            <Badge tone="inert">Hidden</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditing(p);
                                setFormOpen(true);
                              }}
                              className="p-2 text-muted transition-colors hover:bg-ink/5 hover:text-brand-600"
                              aria-label={`Edit ${p.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate(p.id);
                              }}
                              className="p-2 text-muted transition-colors hover:bg-ink/5 hover:text-brand-600"
                              aria-label={`Delete ${p.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {tab === "categories" && <CategoriesTab />}
        {tab === "artists" && <ArtistsTab />}
        {tab === "applications" && <ApplicationsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "custom review" && <CustomReviewTab />}
        {tab === "poster sizes" && <PosterSizesTab />}
        {tab === "reviews" && <ReviewsTab />}
        {tab === "site content" && <SiteImagesTab />}
        {tab === "original inquiries" && <OriginalInquiriesTab />}
      </div>

      {formOpen && categoriesQuery.data && artistsQuery.data && (
        <ProductForm
          product={editing}
          categories={categoriesQuery.data}
          artists={artistsQuery.data}
          submitting={saveMutation.isPending}
          onSubmit={(values) => saveMutation.mutate(values)}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
