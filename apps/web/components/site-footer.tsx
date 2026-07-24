import Link from "next/link";

const colHeading =
  "text-xs font-semibold uppercase tracking-[0.06em] text-cream";
const colLink = "text-sm text-cream/65 transition-colors hover:text-cream";

const trustBadges = ["Secure Razorpay checkout", "Made in India"];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-cream">
      <div className="container-page flex flex-wrap items-start justify-between gap-12 py-14">
        <div className="flex flex-col gap-3.5">
          <div className="text-lg font-bold tracking-[0.24em]">WALLMERI</div>
        </div>

        <div className="flex flex-wrap gap-x-16 gap-y-10">
          {/* <div className="flex flex-col gap-3">
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
          </div> */}

          <div className="flex flex-col gap-3">
            <div className={`${colHeading} mb-1`}>Account</div>
            {/* <Link href="/login" className={colLink}>
              Login
            </Link>
            <Link href="/register" className={colLink}>
              Create account
            </Link> */}
            <Link href="/orders" className={colLink}>
              Order history
            </Link>
            <Link href="/track" className={colLink}>
              Track an order
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <div className={`${colHeading} mb-1`}>Company</div>
            <Link href="/about" className={colLink}>
              About us
            </Link>
            <a
              href="https://wa.me/916363882696"
              target="_blank"
              rel="noopener noreferrer"
              className={colLink}
            >
              Contact us
            </a>
            {/* <Link href="/artists/join" className={colLink}>
              Become a Wallmeri artist
            </Link> */}
          </div>

          <div className="flex flex-col gap-3">
            <div className={`${colHeading} mb-1`}>Policies</div>
            <Link href="/terms" className={colLink}>
              Terms and conditions
            </Link>
            <Link href="/refund-policy" className={colLink}>
              Refund and replacement policy
            </Link>
            <Link href="/shipping-policy" className={colLink}>
              Shipping policy
            </Link>
            <Link href="/privacy-policy" className={colLink}>
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 text-center sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2">
            {trustBadges.map((item, i) => (
              <span key={item} className="flex items-center gap-2.5">
                {i > 0 && <span className="text-premium-600">●</span>}
                <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-cream/50">
                  {item}
                </span>
              </span>
            ))}
          </div>
          <p className="text-xs text-cream/35">
            © {new Date().getFullYear()} Wallmeri. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
