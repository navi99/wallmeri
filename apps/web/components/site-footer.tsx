import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-cream">
      <div className="container-page grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-display text-lg font-bold text-cream">
              W
            </span>
            <span className="font-display text-xl font-semibold tracking-wide">Wallmeri</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-cream/60">
            Premium metal wall art, crafted and shipped across India.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream/60">
            Shop
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/catalog" className="text-cream/75 hover:text-cream">
                All posters
              </Link>
            </li>
            <li>
              <Link href="/catalog?sort=price_asc" className="text-cream/75 hover:text-cream">
                Best value
              </Link>
            </li>
            <li>
              <Link href="/artists" className="text-cream/75 hover:text-cream">
                Our artists
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-cream/75 hover:text-cream">
                Your cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream/60">
            Account
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/login" className="text-cream/75 hover:text-cream">
                Login
              </Link>
            </li>
            <li>
              <Link href="/register" className="text-cream/75 hover:text-cream">
                Create account
              </Link>
            </li>
            <li>
              <Link href="/orders" className="text-cream/75 hover:text-cream">
                Order history
              </Link>
            </li>
            <li>
              <Link href="/track" className="text-cream/75 hover:text-cream">
                Track an order
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream/60">
            Help
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/75">
            <li>
              <Link href="/artists/join" className="hover:text-cream">
                Become a Wallmeri artist
              </Link>
            </li>
            <li>Free shipping over ₹2,999</li>
            <li>Secure Razorpay checkout</li>
            <li>Made in India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <p className="container-page text-center text-xs text-cream/50">
          © {new Date().getFullYear()} Wallmeri. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
