"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ApplicationsTab } from "@/components/admin/applications-tab";
import { ArtistsTab } from "@/components/admin/artists-tab";
import { CategoriesTab } from "@/components/admin/categories-tab";
import { OrdersTab } from "@/components/admin/orders-tab";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { ReviewsTab } from "@/components/admin/reviews-tab";
import { Badge, Button, Card, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/store/auth";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const TABS = ["posters", "categories", "artists", "applications", "orders", "reviews"] as const;
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
        <h1 className="text-3xl font-bold uppercase tracking-tight text-ink">Admin</h1>
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

      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-brand-100">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold capitalize ${
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
                  <thead className="bg-cream text-left text-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Poster</th>
                      <th className="px-4 py-3 font-semibold">Artist</th>
                      <th className="px-4 py-3 font-semibold">Categories</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="px-4 py-3 font-semibold">Stock</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-50">
                    {productsQuery.data?.map((p) => (
                      <tr key={p.id} className="hover:bg-cream/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-brand-50">
                              {p.image_url && (
                                <Image
                                  src={p.image_url}
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
                        <td className="px-4 py-3 text-ink">{p.stock}</td>
                        <td className="px-4 py-3">
                          {p.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge>Hidden</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditing(p);
                                setFormOpen(true);
                              }}
                              className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-600"
                              aria-label={`Edit ${p.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate(p.id);
                              }}
                              className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-600"
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
        {tab === "reviews" && <ReviewsTab />}
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
