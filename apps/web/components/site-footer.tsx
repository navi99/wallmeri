import Link from "next/link";

const colHeading =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-cream";
const colLink = "text-[13px] text-cream/65 transition-colors hover:text-cream";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-cream">
      <div className="container-page flex flex-wrap items-start justify-between gap-12 py-14">
        <div className="flex flex-col gap-3.5">
          <div className="text-lg font-bold tracking-[0.24em]">WALLMERI</div>
          <p className="max-w-[280px] text-[13px] leading-relaxed text-cream/50">
            Premium metal posters, crafted and shipped across India. Designed
            to be collected.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-16 gap-y-10">
          <div className="flex flex-col gap-3">
            <div className={`${colHeading} mb-1`}>Shop</div>
            <Link href="/catalog" className={colLink}>
              All posters
            </Link>
            <Link href="/catalog?sort=price_asc" className={colLink}>
              Best value
            </Link>
            <Link href="/artists" className={colLink}>
              Artists
            </Link>
            <Link href="/cart" className={colLink}>
              Your cart
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <div className={`${colHeading} mb-1`}>Account</div>
            <Link href="/login" className={colLink}>
              Login
            </Link>
            <Link href="/register" className={colLink}>
              Create account
            </Link>
            <Link href="/orders" className={colLink}>
              Order history
            </Link>
            <Link href="/track" className={colLink}>
              Track an order
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <div className={`${colHeading} mb-1`}>Wallmeri</div>
            <Link href="/about" className={colLink}>
              About us
            </Link>
            <Link href="/artists/join" className={colLink}>
              Become a Wallmeri artist
            </Link>
            <span className="text-[13px] text-cream/65">
              Free shipping over ₹2,999
            </span>
            <span className="text-[13px] text-cream/65">
              Secure Razorpay checkout
            </span>
            <span className="text-[13px] text-cream/65">Made in India</span>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5">
        <p className="container-page text-center text-[11px] text-cream/35">
          © {new Date().getFullYear()} Wallmeri. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
