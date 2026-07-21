"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, Search, ShoppingCart, User as UserIcon, X } from "lucide-react";

import { useAuth } from "@/lib/store/auth";
import { useCart } from "@/lib/store/cart";

const navLink =
  "text-xs font-medium uppercase tracking-[0.05em] text-ink transition-colors hover:text-brand-600";

export function SiteHeader() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const items = useCart((s) => s.items);
  const cartCount = items.reduce((n, i) => n + i.qty, 0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closePanels = () => setMenuOpen(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    closePanels();
    router.push(query ? `/catalog?q=${encodeURIComponent(query)}` : "/catalog");
  };

  const mobileLink =
    "flex min-h-11 items-center px-3 py-2.5 text-xs font-medium uppercase tracking-[0.05em] text-ink hover:bg-ink/5 hover:text-brand-600";

  return (
    <header className="sticky top-0 z-40">
      {/* Blur lives on its own layer so the sticky header's text isn't
          co-rasterized with the GPU-composited backdrop-filter surface. */}
      <div className="absolute inset-0 -z-10 bg-cream/95 backdrop-blur" aria-hidden="true" />

      <div className="container-page flex h-[72px] items-center gap-2 border-b border-ink/10 sm:gap-4">
        {/* Left: wordmark (desktop) / menu button + wordmark (mobile) */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="grid h-11 w-11 place-items-center text-ink hover:text-brand-600 sm:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link
          href="/"
          onClick={closePanels}
          className="shrink-0 text-lg font-semibold tracking-[0.08em] text-ink sm:text-xl"
        >
          WALLMERI
        </Link>

        {/* Left of search: nav (desktop) */}
        <nav className="hidden items-center gap-6 sm:flex" aria-label="Main">
          <Link href="/catalog" className={navLink}>
            Shop
          </Link>
          <Link href="/artists" className={navLink}>
            Artists
          </Link>
          <Link href="/create" className={navLink}>
            Custom Poster
          </Link>
          {mounted && user?.is_admin && (
            <Link href="/admin" className={`hidden md:block ${navLink}`}>
              Admin
            </Link>
          )}
        </nav>

        {/* Center: search (desktop) */}
        <form
          onSubmit={submitSearch}
          role="search"
          className="relative mx-auto hidden w-full max-w-md flex-1 sm:block"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search metal posters..."
            aria-label="Search products"
            className="h-11 w-full border border-ink/20 bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-ink focus-visible:outline-none"
          />
        </form>
        <div className="flex-1 sm:hidden" />

        {/* Right of search: login/logout + cart */}
        <div className="flex items-center justify-end gap-1 sm:gap-6">
          {mounted && user ? (
            <button
              onClick={logout}
              aria-label="Log out"
              className={`hidden items-center gap-1.5 sm:flex ${navLink}`}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          ) : (
            <Link href="/login" className={`hidden sm:block ${navLink}`}>
              Login
            </Link>
          )}

          <Link
            href="/cart"
            onClick={closePanels}
            aria-label={
              mounted && cartCount > 0
                ? `Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`
                : "Cart"
            }
            className={`hidden sm:block ${navLink}`}
          >
            Cart ({mounted ? cartCount : 0})
          </Link>
          <Link
            href="/cart"
            onClick={closePanels}
            aria-label={
              mounted && cartCount > 0
                ? `Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`
                : "Cart"
            }
            className="relative grid h-11 w-11 place-items-center text-ink hover:text-brand-600 sm:hidden"
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-xs font-bold text-cream"
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile: always-visible search row */}
      <div className="border-b border-ink/10 sm:hidden">
        <form onSubmit={submitSearch} role="search" className="container-page relative py-3">
          <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search metal posters..."
            aria-label="Search products"
            className="h-11 w-full border border-ink/20 bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-ink focus-visible:outline-none"
          />
        </form>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Main menu"
          className="border-b border-ink/10 sm:hidden"
        >
          <div className="container-page flex flex-col gap-0.5 py-3">
            <Link href="/catalog" onClick={closePanels} className={mobileLink}>
              Shop
            </Link>
            <Link href="/artists" onClick={closePanels} className={mobileLink}>
              Artists
            </Link>
            <Link href="/create" onClick={closePanels} className={mobileLink}>
              Custom Poster
            </Link>
            {mounted && user ? (
              <>
                {user.is_admin && (
                  <Link href="/admin" onClick={closePanels} className={mobileLink}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    closePanels();
                    logout();
                  }}
                  className={`${mobileLink} justify-start gap-2 text-left`}
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={closePanels} className={mobileLink}>
                <UserIcon className="mr-2 h-4 w-4" /> Login
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
