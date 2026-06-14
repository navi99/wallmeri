"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { Badge, Button, Card, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/store/auth";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";

type Tab = "products" | "orders";

export default function AdminPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("products");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    if (hydrated && (!user || !user.is_admin)) router.replace("/login?next=/admin");
  }, [hydrated, user, router]);

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.adminListProducts(),
    enabled: !!user?.is_admin,
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
    enabled: !!user?.is_admin,
  });
  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api.adminListOrders(),
    enabled: !!user?.is_admin && tab === "orders",
  });

  const saveMutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const body = { ...values, category_id: values.category_id || null };
      return editing
        ? api.adminUpdateProduct(editing.id, body)
        : api.adminCreateProduct(body);
    },
    onSuccess: () => {
      toast.success(editing ? "Product updated" : "Product created");
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
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Delete failed"),
  });

  if (!hydrated || !user?.is_admin) {
    return <div className="grid place-items-center py-32"><Spinner /></div>;
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-ink">Admin</h1>
        {tab === "products" && (
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add product
          </Button>
        )}
      </div>

      <div className="mt-5 flex gap-2 border-b border-brand-100">
        {(["products", "orders"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold capitalize ${
              tab === t
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "products" ? (
        <Card className="mt-6 overflow-hidden">
          {productsQuery.isLoading ? (
            <div className="grid place-items-center py-16"><Spinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream text-left text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
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
                              <Image src={p.image_url} alt={p.title} fill className="object-cover" sizes="40px" />
                            )}
                          </div>
                          <span className="font-medium text-ink">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{p.category?.name ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold text-ink">{formatINR(p.price_inr)}</td>
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
                            className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-700"
                            aria-label={`Edit ${p.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate(p.id);
                            }}
                            className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-700"
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
      ) : (
        <Card className="mt-6 overflow-hidden">
          {ordersQuery.isLoading ? (
            <div className="grid place-items-center py-16"><Spinner /></div>
          ) : !ordersQuery.data || ordersQuery.data.length === 0 ? (
            <p className="p-10 text-center text-muted">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream text-left text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {ordersQuery.data.map((o) => (
                    <tr key={o.id} className="hover:bg-cream/50">
                      <td className="px-4 py-3 font-medium text-ink">#{o.id}</td>
                      <td className="px-4 py-3 text-muted">{o.email}</td>
                      <td className="px-4 py-3 text-ink">
                        {o.items.reduce((n, i) => n + i.qty, 0)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">{formatINR(o.total_inr)}</td>
                      <td className="px-4 py-3">
                        {o.status === "paid" ? (
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        ) : (
                          <Badge>{o.status}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {new Date(o.created_at).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {formOpen && categoriesQuery.data && (
        <ProductForm
          product={editing}
          categories={categoriesQuery.data}
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
