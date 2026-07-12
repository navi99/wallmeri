"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Card, Input, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";

export function CategoriesTab() {
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.adminListCategories(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const createMutation = useMutation({
    mutationFn: () => api.adminCreateCategory({ name: name.trim() }),
    onSuccess: () => {
      toast.success("Category created");
      setName("");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Create failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name?: string; is_active?: boolean } }) =>
      api.adminUpdateCategory(id, body),
    onSuccess: invalidate,
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Update failed"),
  });

  if (categoriesQuery.isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length >= 2) createMutation.mutate();
        }}
        className="flex gap-2"
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          aria-label="New category name"
        />
        <Button type="submit" loading={createMutation.isPending} disabled={name.trim().length < 2}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </form>

      <div className="mt-4 space-y-2">
        {(categoriesQuery.data ?? []).map((c) => (
          <Card key={c.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-ink">{c.name}</span>
              <span className="text-xs text-muted">/{c.slug}</span>
              {c.is_active === false && <Badge tone="inert">Hidden</Badge>}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                updateMutation.mutate({ id: c.id, body: { is_active: !(c.is_active ?? true) } })
              }
            >
              {(c.is_active ?? true) ? "Hide" : "Show"}
            </Button>
          </Card>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        Hiding a category removes it from the storefront navigation; posters keep the tag.
      </p>
    </div>
  );
}
