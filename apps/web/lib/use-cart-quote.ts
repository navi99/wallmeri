import { useQuery } from "@tanstack/react-query";

import { api, type CheckoutLine } from "@/lib/api";
import { useCart, type CartItem } from "@/lib/store/cart";

export function cartLines(items: CartItem[]): CheckoutLine[] {
  return items.map((i) =>
    i.kind === "custom"
      ? { custom_upload_id: i.custom_upload_id!, qty: i.qty }
      : { product_id: i.product_id!, size_code: i.size_code, qty: i.qty },
  );
}

/**
 * Re-prices the cart against the server.
 *
 * The cart is persisted in localStorage with the price captured at
 * add-to-cart time, so a basket that predates a sale (or an admin reprice)
 * carries stale figures. `compute_quote` never trusts those prices - it
 * re-derives everything from current catalog and discount state - so this is
 * the only number that agrees with what Razorpay will charge.
 *
 * The payload is embedded in the query key, so editing a quantity re-quotes
 * without any manual invalidation.
 */
export function useCartQuote() {
  const items = useCart((s) => s.items);
  const lines = cartLines(items);

  return useQuery({
    queryKey: ["quote", lines],
    queryFn: () => api.quote(lines),
    enabled: lines.length > 0,
    // Prices are the one thing that must never be served stale here.
    staleTime: 0,
    refetchOnWindowFocus: true,
    // A 400 means a line is genuinely unavailable; retrying can't fix it.
    retry: false,
  });
}
