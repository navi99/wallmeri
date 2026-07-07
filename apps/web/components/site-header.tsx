"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, Search, ShoppingCart, User as UserIcon, X } from "lucide-react";

import { useAuth } from "@/lib/store/auth";
import { useCart } from "@/lib/store/cart";

export function SiteHeader() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const items = useCart((s) => s.items);
  const cartCount = items.reduce((n, i) => n + i.qty, 0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, searchOpen]);

  const closePanels = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    closePanels();
    router.push(query ? `/catalog?q=${encodeURIComponent(query)}` : "/catalog");
  };

  const mobileLink =
    "flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-medium text-cream/80 hover:bg-white/10 hover:text-cream";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-cream backdrop-blur">
      <div className="container-page flex h-16 items-center gap-2 sm:gap-4">
        <Link href="/" onClick={closePanels} className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-display text-lg font-bold text-cream">
            W
          </span>
          <span className="font-display text-xl font-semibold tracking-wide text-cream">
            Wallmeri
          </span>
        </Link>

        <form onSubmit={submitSearch} className="relative hidden flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search metal posters..."
            aria-label="Search products"
            className="h-10 w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 text-sm text-cream placeholder:text-cream/50 focus:border-brand-300 focus-visible:outline-none"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-controls="mobile-search"
            className="grid h-11 w-11 place-items-center rounded-lg text-cream/80 hover:bg-white/10 hover:text-cream sm:hidden"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          <Link
            href="/catalog"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-cream/80 hover:bg-white/10 hover:text-cream sm:block"
          >
            Shop
          </Link>
          <Link
            href="/artists"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-cream/80 hover:bg-white/10 hover:text-cream sm:block"
          >
            Artists
          </Link>

          {mounted && user ? (
            <>
              {user.is_admin && (
                <Link
                  href="/admin"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-cream/80 hover:bg-white/10 hover:text-cream sm:block"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/orders"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-cream/80 hover:bg-white/10 hover:text-cream sm:block"
              >
                Orders
              </Link>
              <button
                onClick={logout}
                className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-cream/80 hover:bg-white/10 hover:text-cream sm:flex"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              aria-label="Login"
              className="hidden h-9 items-center gap-1.5 rounded-xl border border-cream/30 px-3 text-sm font-semibold text-cream hover:bg-white/10 sm:flex"
            >
              <UserIcon className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}

          <Link
            href="/cart"
            onClick={closePanels}
            className="relative grid h-11 w-11 place-items-center rounded-lg text-cream/80 hover:bg-white/10 hover:text-cream sm:h-auto sm:w-auto sm:p-2.5"
            aria-label={
              mounted && cartCount > 0
                ? `Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`
                : "Cart"
            }
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-xs font-bold text-cream sm:-right-0.5 sm:-top-0.5"
              >
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => {
              setMenuOpen((v) => !v);
              setSearchOpen(false);
            }}
            aria-label={menuOpen ? "Close menu" : "Menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="grid h-11 w-11 place-items-center rounded-lg text-cream/80 hover:bg-white/10 hover:text-cream sm:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {searchOpen && (
        <div id="mobile-search" className="border-t border-white/10 sm:hidden">
          <form onSubmit={submitSearch} className="container-page relative py-3">
            <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/50" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search metal posters..."
              aria-label="Search products"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 text-sm text-cream placeholder:text-cream/50 focus:border-brand-300 focus-visible:outline-none"
            />
          </form>
        </div>
      )}

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Main menu"
          className="border-t border-white/10 sm:hidden"
        >
          <div className="container-page flex flex-col gap-0.5 py-3">
            <Link href="/catalog" onClick={closePanels} className={mobileLink}>
              Shop
            </Link>
            <Link href="/artists" onClick={closePanels} className={mobileLink}>
              Artists
            </Link>
            <Link href="/track" onClick={closePanels} className={mobileLink}>
              Track an order
            </Link>
            {mounted && user ? (
              <>
                <Link href="/orders" onClick={closePanels} className={mobileLink}>
                  Orders
                </Link>
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
