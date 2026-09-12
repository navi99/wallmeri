import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

/**
 * Discounted whole-rupee price, rounded half-up.
 *
 * Mirror of `apply()` in apps/api/app/services/discount.py - the two MUST
 * stay equivalent. Integer arithmetic on purpose: floating-point would drift
 * from the server on the exact .5 cases (110 @ 5% is 104.5), and the server
 * is what the customer is charged.
 *
 * Floored at 1 rupee for the same reason the backend does it: a zero-rupee
 * line is a free poster and, alone in a cart, an order Razorpay rejects.
 */
export function applyDiscount(price: number, percent: number): number {
  if (percent <= 0 || price <= 0) return price;
  return Math.max(1, Math.floor((price * (100 - percent) + 50) / 100));
}

/**
 * The single source of discount state for the storefront.
 *
 * `percent` is 0 until the query resolves, so the first paint shows list
 * prices and then settles - the same behaviour product cards already have
 * while ["poster-sizes"] loads.
 *
 * Note what this is NOT for: admin price inputs and the poster-size editor
 * must keep showing the undiscounted base, or an admin save would bake the
 * discount into the base price and compound it on every edit.
 */
export function useDiscount() {
  const { data } = useQuery({
    queryKey: ["discount"],
    queryFn: () => api.discount(),
    staleTime: 5 * 60_000,
  });

  const percent = data?.percent ?? 0;
  return {
    percent,
    label: data?.label ?? "",
    isActive: percent > 0,
    /** List price -> what the customer pays. Identity when no sale is on. */
    priced: (price: number) => applyDiscount(price, percent),
  };
}
