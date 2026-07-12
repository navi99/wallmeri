"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { StarInput, Stars } from "@/components/stars";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/store/auth";

export function ReviewsSection({ slug }: { slug: string }) {
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const qc = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ["reviews", slug],
    queryFn: () => api.listReviews(slug),
  });

  const eligibilityQuery = useQuery({
    queryKey: ["review-eligibility", slug],
    queryFn: () => api.reviewEligibility(slug),
    enabled: hydrated && !!user,
    retry: false,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = useMutation({
    mutationFn: () => api.submitReview(slug, { rating, title, body }),
    onSuccess: () => {
      toast.success("Thanks! Your review is awaiting moderation.");
      setFormOpen(false);
      qc.invalidateQueries({ queryKey: ["review-eligibility", slug] });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Could not submit review"),
  });

  const reviews = reviewsQuery.data ?? [];
  const eligibility = eligibilityQuery.data;
  const myReview = eligibility?.my_review ?? null;

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-ink">Reviews</h2>
        {eligibility?.can_review && !formOpen && (
          <Button variant="outline" onClick={() => setFormOpen(true)}>
            Write a review
          </Button>
        )}
      </div>

      {/* My pending/rejected review status */}
      {myReview && myReview.status !== "approved" && (
        <Card className="mt-4 p-4 text-sm">
          {myReview.status === "pending" ? (
            <p className="text-muted">
              Your review is <span className="font-semibold text-ink">awaiting moderation</span>.
            </p>
          ) : (
            <p className="text-muted">
              Your review was not published
              {myReview.reject_reason ? `: ${myReview.reject_reason}` : "."}
            </p>
          )}
        </Card>
      )}

      {formOpen && (
        <Card className="mt-4 p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <Label>Your rating</Label>
              <StarInput value={rating} onChange={setRating} />
            </div>
            <div>
              <Label htmlFor="review-title">Title (optional)</Label>
              <Input
                id="review-title"
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sums it up in a line"
              />
            </div>
            <div>
              <Label htmlFor="review-body">Review (optional)</Label>
              <Textarea
                id="review-body"
                rows={4}
                maxLength={4000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="How does it look on your wall?"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={submit.isPending}>
                Submit review
              </Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Prompt for guests / non-buyers */}
      {hydrated && !user && (
        <p className="mt-3 text-sm text-muted">
          Bought this poster?{" "}
          <Link href={`/login?next=/product/${slug}`} className="font-semibold text-brand-600 hover:underline">
            Log in
          </Link>{" "}
          with your order email to leave a review.
        </p>
      )}
      {eligibility && !eligibility.can_review && eligibility.reason === "not_delivered" && (
        <p className="mt-3 text-sm text-muted">
          Reviews are open to customers after their order is delivered.
        </p>
      )}

      {reviewsQuery.isLoading ? null : reviews.length === 0 ? (
        <p className="mt-4 text-muted">No reviews yet — be the first once your order arrives.</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {reviews.map((r) => (
            <li key={r.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars rating={r.rating} />
                  {r.title && <span className="font-semibold text-ink">{r.title}</span>}
                </div>
                {r.body && <p className="mt-2 text-sm leading-relaxed text-muted">{r.body}</p>}
                <p className="mt-2 text-xs text-muted">
                  {r.author_name} ·{" "}
                  <span className="rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-700">
                    Verified purchase
                  </span>{" "}
                  · {new Date(r.created_at).toLocaleDateString("en-IN")}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
