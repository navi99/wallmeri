import Link from "next/link";
import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  Palette,
  Share2,
  Building2,
} from "lucide-react";

// TODO: replace the placeholder social handles and the studio address below
// with the real ones. Everything else on this panel (WhatsApp number, support
// address) matches what the policy pages already publish.
const SOCIALS = [
  { icon: Instagram, label: "Instagram", handle: "@wallmeri", href: "https://instagram.com/wallmeri" },
  { icon: Facebook, label: "Facebook", handle: "/wallmeri", href: "https://facebook.com/wallmeri" },
];

const STUDIO_ADDRESS = ["WallMeri", "Bengaluru, Karnataka", "India"];

const WHATSAPP_URL = "https://wa.me/916363882696";
const SUPPORT_EMAIL = "support@wallmeri.in";

const cardBase = "flex flex-col border border-line bg-cream p-6 sm:p-7";

export function ConnectPanel() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <p className="max-w-[65ch] text-sm leading-[1.75] text-muted">
        A small team in Bengaluru, reachable directly. Pick whichever suits you - all of
        these reach the same people.
      </p>

      <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={cardBase}>
          <MessageCircle className="h-6 w-6 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="mt-4 title-xs">WhatsApp</h3>
          <p className="mt-1 text-sm text-muted">+91 63638 82696</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Quickest for order updates and delivery questions.
          </p>
        </a>

        <a href={`mailto:${SUPPORT_EMAIL}`} className={cardBase}>
          <Mail className="h-6 w-6 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="mt-4 title-xs">Email</h3>
          <p className="mt-1 text-sm text-muted">{SUPPORT_EMAIL}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Best when you have photos, files or a longer question.
          </p>
        </a>

        <div className={cardBase}>
          <Clock className="h-6 w-6 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="mt-4 title-xs">When we&apos;re around</h3>
          <p className="mt-1 text-sm text-muted">Mon-Sat, 10am - 7pm IST</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Most enquiries are answered within one business day.
          </p>
        </div>

        <div className={cardBase}>
          <Building2 className="h-6 w-6 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="mt-4 title-xs">Studio</h3>
          <address className="mt-1 not-italic text-sm leading-relaxed text-muted">
            {STUDIO_ADDRESS.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>

        <div className={cardBase}>
          <Share2 className="h-6 w-6 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="mt-4 title-xs">Follow along</h3>
          <div className="mt-3 flex flex-col gap-2">
            {SOCIALS.map(({ icon: Icon, label, handle, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                <span>{label}</span>
                <span className="text-muted">{handle}</span>
              </a>
            ))}
          </div>
        </div>

        <div className={cardBase}>
          <Palette className="h-6 w-6 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="mt-4 title-xs">Work with us</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Artists and bulk buyers have their own routes in.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/artists/join"
              className="text-sm font-semibold text-premium-600 hover:underline"
            >
              Sell your art with us
            </Link>
            <Link
              href="/contact?tab=contactus&category=wholesale"
              className="text-sm font-semibold text-premium-600 hover:underline"
            >
              Bulk &amp; corporate gifting
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
