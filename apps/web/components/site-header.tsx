"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, Search, ShoppingCart, User as UserIcon, X } from "lucide-react";

import { useAuth } from "@/lib/store/auth";
import { useCart } from "@/lib/store/cart";

const navLink =
  "text-xs font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:text-brand-600";

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
    "flex min-h-11 items-center px-3 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-ink hover:bg-ink/5 hover:text-brand-600";

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <p className="bg-ink px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-cream">
        Free shipping across India on orders over ₹2,999
      </p>

      <div className="container-page flex h-[72px] items-center gap-2 border-b border-ink/10 sm:gap-4">
        {/* Left: nav (desktop) / menu button (mobile) */}
        <nav className="hidden flex-1 items-center gap-7 sm:flex" aria-label="Main">
          <Link href="/catalog" className={navLink}>
            Shop
          </Link>
          <Link href="/artists" className={navLink}>
            Artists
          </Link>
          <Link href="/track" className={`${navLink} hidden md:block`}>
            Track order
          </Link>
        </nav>
        <button
          onClick={() => {
            setMenuOpen((v) => !v);
            setSearchOpen(false);
          }}
          aria-label={menuOpen ? "Close menu" : "Menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="grid h-11 w-11 place-items-center text-ink hover:text-brand-600 sm:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="flex-1 sm:hidden" />

        {/* Center: wordmark */}
        <Link
          href="/"
          onClick={closePanels}
          className="shrink-0 text-lg font-bold tracking-[0.24em] text-ink sm:text-xl"
        >
          WALLMERI
        </Link>

        {/* Right: utilities */}
        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-7">
          <button
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-controls="site-search"
            className={`hidden sm:block ${navLink}`}
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-controls="site-search"
            className="grid h-11 w-11 place-items-center text-ink hover:text-brand-600 sm:hidden"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          {mounted && user ? (
            <>
              {user.is_admin && (
                <Link href="/admin" className={`hidden md:block ${navLink}`}>
                  Admin
                </Link>
              )}
              <Link href="/orders" className={`hidden sm:block ${navLink}`}>
                Orders
              </Link>
              <button
                onClick={logout}
                aria-label="Log out"
                className={`hidden items-center gap-1.5 sm:flex ${navLink}`}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </>
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

      {searchOpen && (
        <div id="site-search" className="border-b border-ink/10">
          <form onSubmit={submitSearch} className="container-page relative py-3">
            <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search metal posters..."
              aria-label="Search products"
              className="h-11 w-full border border-ink/20 bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-ink focus-visible:outline-none"
            />
          </form>
        </div>
      )}

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
