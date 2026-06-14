import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-white">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">
              W
            </span>
            <span className="text-lg font-extrabold text-ink">Wallmeri</span>
          </div>
          <p className="mt-3 text-sm text-muted">
            Premium metal wall art, crafted and shipped across India.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/catalog" className="text-muted hover:text-brand-700">
                All posters
              </Link>
            </li>
            <li>
              <Link href="/catalog?sort=price_asc" className="text-muted hover:text-brand-700">
                Best value
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-muted hover:text-brand-700">
                Your cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink">Account</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/login" className="text-muted hover:text-brand-700">
                Login
              </Link>
            </li>
            <li>
              <Link href="/register" className="text-muted hover:text-brand-700">
                Create account
              </Link>
            </li>
            <li>
              <Link href="/orders" className="text-muted hover:text-brand-700">
                Order history
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink">Help</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Free shipping over ₹2,999</li>
            <li>Secure Razorpay checkout</li>
            <li>Made in India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-100 py-5">
        <p className="container-page text-center text-xs text-muted">
          © {new Date().getFullYear()} Wallmeri. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
