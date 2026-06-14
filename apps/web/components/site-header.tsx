"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Search, ShoppingCart, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui";
import { useAuth } from "@/lib/store/auth";
import { useCart } from "@/lib/store/cart";

export function SiteHeader() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [mounted, setMounted] = useState(false);

  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const items = useCart((s) => s.items);
  const cartCount = items.reduce((n, i) => n + i.qty, 0);

  useEffect(() => setMounted(true), []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/catalog?q=${encodeURIComponent(query)}` : "/catalog");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-bold text-white">
            W
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink">
            Wallmeri
          </span>
        </Link>

        <form onSubmit={submitSearch} className="relative hidden flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search metal posters..."
            aria-label="Search products"
            className="h-10 w-full rounded-xl border border-brand-200 bg-cream pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-brand-400 focus-visible:outline-none"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/catalog"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-brand-50 sm:block"
          >
            Shop
          </Link>

          {mounted && user ? (
            <>
              {user.is_admin && (
                <Link
                  href="/admin"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-brand-50 sm:block"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/orders"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-brand-50"
              >
                Orders
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-brand-50"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="gap-1.5">
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}

          <Link
            href="/cart"
            className="relative rounded-lg p-2.5 text-ink hover:bg-brand-50"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
