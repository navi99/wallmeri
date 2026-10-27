/**
 * FAQ copy for the Contact page's FAQ tab.
 *
 * Every factual claim below is drawn from a shipped surface so the two can
 * never disagree:
 * - delivery windows and coverage: app/shipping-policy/page.tsx
 * - the 48-hour, 24-hour and 7-10 business day windows: app/refund-policy/page.tsx
 * - pricing, tax and rights: app/terms/page.tsx
 * - data handling: app/privacy-policy/page.tsx
 * - accepted payment brands: components/payment-icons.tsx (all via Razorpay)
 * - shipping charge: apps/api/app/services/pricing.py (shipping = 0)
 * - sizes and prices: poster_sizes, seeded in alembic 0006 - 30 x 40 cm is the
 *   only size enabled at launch - with catalog deltas from 0009
 * - upload formats and the 15 MB cap: app/create/page.tsx
 * - print-quality bands: lib/custom-dpi.ts (CUSTOM_DPI_OK 150 / CUSTOM_DPI_MIN 50)
 * - custom review turnaround and rejection refunds: custom_upload_service.py
 * - support channels and hours: components/contact/connect-panel.tsx
 *
 * Where no shipped surface backs an answer - metal gauge, box contents,
 * durability, artist payout rates, uploaded-photo retention - the answer says
 * what is true today and invites a message rather than inventing a promise.
 * Answers summarise and then link out; they never restate a policy in
 * different words.
 */

export type Faq = {
  q: string;
  /** Plain sentences; the last one may carry the policy link. */
  a: string;
  link?: { href: string; label: string };
};

export type FaqSection = { id: string; title: string; items: Faq[] };

/** A top-level audience band - buying, orders, custom posters, artists. */
export type FaqBand = { title: string; sections: FaqSection[] };

const CONTACT_ORDER = {
  href: "/contact?tab=contactus&category=order",
  label: "Message us about an order",
};
const CONTACT_PRODUCT = {
  href: "/contact?tab=contactus&category=product",
  label: "Ask about the product",
};
const CONTACT_RETURNS = {
  href: "/contact?tab=contactus&category=returns",
  label: "Report it now",
};
const CONTACT_ARTIST = {
  href: "/contact?tab=contactus&category=artist",
  label: "Ask the artist team",
};

export const FAQ_BANDS: FaqBand[] = [
  {
    title: "Buying a WallMeri poster",
    sections: [
      {
        id: "basics",
        title: "The basics",
        items: [
          {
            q: "What is WallMeri?",
            a: "Independent artists' work and your own photographs, printed on metal and ready to hang. Browse the gallery for something you connect with, or upload a photo and we'll print that instead.",
            link: { href: "/about", label: "What we're about" },
          },
          {
            q: "What is a metal poster?",
            a: "A printed aluminium panel - not paper behind glass. The image is sublimated into a matte metal surface, and the piece hangs on a magnetic mount, so there's no frame to buy and nothing drilled through the artwork.",
          },
          {
            q: "What size do you print?",
            a: "One size at launch: 30 x 40 cm, roughly 11.8 x 15.7 inches, in portrait or landscape. Measure your wall first - the dimensions sit on every product page and in the size picker.",
          },
          {
            q: "Is 30 x 40 cm the same as A3?",
            a: "Close, but not the same sheet. ISO A3 is 29.7 x 42 cm; ours is a true 3:4 at 30 x 40 cm. If you're matching an existing frame or mount, work from 30 x 40 cm.",
          },
          {
            q: "How thick is the metal?",
            a: "A rigid aluminium sheet with a backing panel behind it, so the mounted piece stands a few millimetres off the wall rather than lying flat against it. We don't publish a gauge figure yet - ask us if you need the exact specification before ordering.",
            link: CONTACT_PRODUCT,
          },
          {
            q: "Am I buying an original painting or a reproduction?",
            a: "A reproduction. You own the poster; the artist keeps the rights to the artwork. Where the physical original is also for sale, that poster's page carries a Buy Original enquiry - those are handled personally, not through checkout.",
            link: { href: "/terms", label: "Read the terms" },
          },
        ],
      },
      {
        id: "what-you-get",
        title: "What you get",
        items: [
          {
            q: "Why metal rather than a paper print?",
            a: "Sublimation puts the ink inside the surface instead of on top of it, so there's no glass to catch glare and nothing to warp or yellow the way paper does. Buying an artist piece also puts money back to the person who made it.",
            link: { href: "/catalog", label: "Browse the gallery" },
          },
          {
            q: "What comes in the box?",
            a: "Your poster with its backing panel, the magnetic mounting parts and an installation guide, packed to survive a courier. Exact contents are listed on the product page - tell us if anything is missing and we'll send it.",
            link: CONTACT_ORDER,
          },
          {
            q: "Does it come with a frame?",
            a: "No - it's designed frameless. Room photographs show surrounding decor for scale and inspiration; nothing in them is included unless the listing says so.",
          },
          {
            q: "Will the print look exactly like the image on my screen?",
            a: "Very closely, but not exactly. Screens emit light and metal reflects it, so slight variation between your display and the finished print is normal and isn't considered a defect. A print that is materially wrong is a different matter - report that.",
            link: { href: "/refund-policy", label: "Read about colour variation" },
          },
          {
            q: "Is it waterproof or scratchproof?",
            a: "Treat it as indoor artwork. We don't claim a waterproof, scratchproof, fade-proof or outdoor-rated product, so talk to us before you pick a bathroom, balcony or exposed kitchen wall.",
            link: CONTACT_PRODUCT,
          },
          {
            q: "How much does a poster cost?",
            a: "Prices sit on each product page in INR, inclusive of applicable taxes unless stated otherwise, and the total you approve at checkout is the total you pay. They vary by piece and by any offer running at the time.",
            link: { href: "/catalog", label: "See current prices" },
          },
        ],
      },
      {
        id: "mounting-care",
        title: "Mounting and care",
        items: [
          {
            q: "How do I hang one without drilling?",
            a: "Every piece ships with a magnetic mounting system - a small mount goes on the wall, the poster snaps onto it. No drilling into the poster, no frame needed.",
          },
          {
            q: "Will the mount work on any wall?",
            a: "It needs a clean, smooth, dry and solid surface. Textured, dusty, damp, flaking or freshly painted walls may not hold reliably - send us a photo of the wall if you're unsure before ordering.",
            link: CONTACT_PRODUCT,
          },
          {
            q: "How do I install it?",
            a: "Follow the guide in the box: clean and dry the spot, position the wall mount, give the adhesive the stated waiting time, then place the poster. Don't load it early - that's the step people skip.",
          },
          {
            q: "Can I move it to another wall later?",
            a: "The poster lifts off its magnet freely, but the adhesive wall part usually needs replacing once it has been removed. Ask us about spare mounting parts before you relocate a piece.",
            link: CONTACT_PRODUCT,
          },
          {
            q: "Will taking the mount off damage my paint?",
            a: "We can't promise damage-free removal on every surface - paint condition, wall preparation and technique all decide it. Follow the removal guidance that came with your piece and never pull hard.",
          },
          {
            q: "How do I clean it?",
            a: "A dry or lightly damp soft cloth. Skip solvents and abrasive cleaners, and keep it away from direct water, steam and heat.",
          },
        ],
      },
    ],
  },
  {
    title: "Orders, delivery and returns",
    sections: [
      {
        id: "ordering-payment",
        title: "Ordering and payment",
        items: [
          {
            q: "How do I place an order?",
            a: "Pick a gallery piece or start a custom poster, choose size and orientation, add it to the cart and check out - as a guest if you'd rather not make an account. Check the confirmation when it arrives and tell us straight away if anything is wrong.",
            link: CONTACT_ORDER,
          },
          {
            q: "Can I pay by UPI or card?",
            a: "Yes. Payment runs through Razorpay, so UPI apps like Google Pay, PhonePe and Paytm work, as do Visa, Mastercard and RuPay cards. Your order is confirmed once that payment succeeds.",
          },
          {
            q: "Is cash on delivery available?",
            a: "Not at the moment - we're prepaid only. Use any of the methods Razorpay shows at checkout.",
          },
          {
            q: "Is shipping free?",
            a: "Yes. Delivery anywhere in India is included in the price you see, and nothing is added at checkout.",
            link: { href: "/shipping-policy", label: "Read the shipping policy" },
          },
          {
            q: "Money left my account but I got no confirmation. What now?",
            a: "Message us with the amount, the time, the payment reference and the email or mobile number you used, and don't pay again until we've checked - a genuinely failed payment is reversed by the provider. We will never ask for your UPI PIN, OTP or full card number.",
            link: CONTACT_ORDER,
          },
          {
            q: "Can I get an invoice, or use a coupon?",
            a: "Apply any coupon before you pay and the discount shows in your total. For an invoice - including GST details for a business purchase - message us with your order number and what you need on it.",
            link: CONTACT_ORDER,
          },
          {
            q: "Do you take bulk or corporate orders?",
            a: "We do - gifting, offices, hospitality. Tell us roughly how many pieces and by when, and we'll come back with options.",
            link: {
              href: "/contact?tab=contactus&category=wholesale",
              label: "Ask about bulk orders",
            },
          },
        ],
      },
      {
        id: "delivery-updates",
        title: "Delivery and updates",
        items: [
          {
            q: "How long until my poster arrives?",
            a: "Every piece is printed after you order, so allow about 5-8 business days for preparation. From order confirmation, delivery is roughly 7-10 days in Bengaluru and 10-20 days elsewhere in India.",
            link: { href: "/shipping-policy", label: "Read the shipping policy" },
          },
          {
            q: "Why does preparation take that long?",
            a: "Because nothing is sitting in a warehouse. Printing, getting the piece to our Bengaluru fulfilment point, fitting the backing panel, checking it and packing it all happen after your order - and that time is already inside the delivery estimate.",
          },
          {
            q: "Do you ship outside India?",
            a: "Not yet. WallMeri currently delivers across India only. If your pin code is remote, check serviceability with us before ordering for a fixed date.",
          },
          {
            q: "Why is there no tracking number yet?",
            a: "Tracking is shared by email or WhatsApp once your piece is printed, quality-checked, packed and handed to the courier. It won't exist straight after you order.",
            link: { href: "/track", label: "Track an order" },
          },
          {
            q: "My order is late. What should I do?",
            a: "Delivery windows are estimates, not guaranteed dates - holidays, weather and courier delays happen. If nothing has arrived 20 days after confirmation, message us with your order number and we'll chase production and the courier. A shipment confirmed lost is replaced or refunded.",
            link: CONTACT_ORDER,
          },
          {
            q: "Can you deliver by a certain date, or change my address?",
            a: "Ask before you order if it's for an occasion, and message us the moment an address needs fixing - usually we can change it if production hasn't started. Don't count on either until we've confirmed it; once a parcel is with the courier it's hard to redirect.",
            link: CONTACT_ORDER,
          },
        ],
      },
      {
        id: "cancellations-refunds",
        title: "Cancellations, damage and refunds",
        items: [
          {
            q: "Can I cancel my order?",
            a: "Yes, for a full refund, within 24 hours of placing it and before printing begins. After that the order is in production and can't be cancelled.",
          },
          {
            q: "Can I return a piece I simply don't like?",
            a: "No - each poster is made to order, so we can't accept returns for preference or sizing regret once printing has begun. Please check the dimensions and preview carefully before ordering.",
            link: { href: "/refund-policy", label: "Read the refund policy" },
          },
          {
            q: "It arrived damaged. What now?",
            a: "Contact us within 48 hours of delivery with your order number and clear photos or an unboxing video of the damage and the packaging. Verified claims get a free replacement or a full refund - your choice.",
            link: CONTACT_RETURNS,
          },
          {
            q: "Is an unboxing video compulsory?",
            a: "No - clear photos are enough. Either way, keep the packaging until the claim is settled, because courier damage usually shows there first.",
          },
          {
            q: "I received the wrong piece.",
            a: "Tell us within 48 hours with photos. We'll arrange a free replacement and, if a return is needed, pay for it.",
            link: CONTACT_RETURNS,
          },
          {
            q: "How long do refunds take?",
            a: "Approved refunds go back to your original payment method within 7-10 business days. Your bank or card issuer may add a little time on top. None of this removes the rights you have under Indian consumer law.",
            link: { href: "/refund-policy", label: "Read the refund policy" },
          },
        ],
      },
    ],
  },
  {
    title: "Custom posters",
    sections: [
      {
        id: "custom-printing",
        title: "Printing your own photo",
        items: [
          {
            q: "Can I put my own image on metal?",
            a: "Yes. Upload your image, crop it to the size you want, and we'll print it. Every custom upload is reviewed by a person before printing - usually within 1-2 business days.",
            link: { href: "/create", label: "Create your own" },
          },
          {
            q: "Which photos work well?",
            a: "Portraits, wedding and travel shots, pets, your own paintings. What matters is a sharp original, decent light, and a bit of room around faces and details so the crop doesn't cut them.",
          },
          {
            q: "What resolution do I need?",
            a: "The uploader scores your crop as you adjust it. Around 150 DPI and up prints excellently - roughly 1800 x 2400 pixels for a 30 x 40 cm piece. Below that it warns you, and a very low-resolution crop is blocked rather than printed badly.",
            link: { href: "/create", label: "Check your photo" },
          },
          {
            q: "Can I use a WhatsApp image or a screenshot?",
            a: "You can try, but the original camera file is almost always better - WhatsApp and screenshots throw detail away. Send the photo to yourself as a file or document rather than as an image to keep the original quality.",
          },
          {
            q: "Will my photo be cropped?",
            a: "A 30 x 40 cm poster is 3:4, or 4:3 in landscape, so an image shot in another ratio has to be cropped to fit. Check the preview closely - faces, text and anything near an edge are what you lose.",
          },
          {
            q: "Which file types and sizes are accepted?",
            a: "JPEG, PNG and WebP, up to 15 MB. If your file is rejected, message us before you compress it hard - we'd rather work from the original.",
            link: CONTACT_PRODUCT,
          },
        ],
      },
      {
        id: "custom-rights",
        title: "Approval, rights and privacy",
        items: [
          {
            q: "Do I see a preview before printing?",
            a: "Yes - the crop you approve during customisation is what goes forward, and a person reviews it before anything is printed. If you want a separately prepared proof on top of that, ask before ordering; it isn't automatic.",
            link: CONTACT_PRODUCT,
          },
          {
            q: "Can you add names, text or build a collage?",
            a: "Send us the images, the wording and a rough idea of the layout before you order, and we'll tell you whether we can do it and whether it changes the price or the timeline. The uploader itself only crops a single image.",
            link: CONTACT_PRODUCT,
          },
          {
            q: "Can I change my image after ordering?",
            a: "Message us immediately with your order number. If it is still in review we can usually swap it; once it is printing we can't. Cancelling inside 24 hours and reordering is the other route.",
            link: CONTACT_ORDER,
          },
          {
            q: "What happens if my custom design isn't approved?",
            a: "You're refunded in full and we'll email you the reason. Nothing goes to print without passing review first.",
          },
          {
            q: "Can I use an image from Google, Pinterest or an artist's page?",
            a: "Only if you own it or have permission - finding an image online isn't permission, and by uploading you confirm you have the right to print it. If someone else made it, get their sign-off first.",
            link: { href: "/terms", label: "Read the terms" },
          },
          {
            q: "Will my photograph be sold or used in your advertising?",
            a: "No. Your upload is used to fulfil and support your order, we don't sell personal data, and it isn't listed for sale or used in marketing. The privacy policy covers who else processes your data - payment, courier and analytics providers - and how to ask us about yours.",
            link: { href: "/privacy-policy", label: "Read the privacy policy" },
          },
        ],
      },
    ],
  },
  {
    title: "For artists",
    sections: [
      {
        id: "artists-joining",
        title: "Joining WallMeri",
        items: [
          {
            q: "I'm an artist. How do I sell through WallMeri?",
            a: "We work with a small, curated set of artists. Send us your portfolio - we review every application personally, then talk to you about your work, agree licensing terms and verify who you are before anything goes live.",
            link: { href: "/artists/join", label: "Apply as an artist" },
          },
          {
            q: "Do I need a big following?",
            a: "No. We look at the work itself, whether it prints well on metal, and whether it fits the collection. An audience helps you, but it isn't what gets you in.",
          },
          {
            q: "What does WallMeri handle?",
            a: "Image preparation, the product pages, printing, the storefront, payments and shipping. You make the work; we run the product around it.",
          },
          {
            q: "Can I submit a photograph of a painting?",
            a: "Yes, subject to review. Shoot or scan it straight on, evenly lit, no glare and nothing distracting in the background - and you'll need the rights to reproduce it.",
            link: CONTACT_ARTIST,
          },
          {
            q: "Will I be credited?",
            a: "Yes - your work sits on your own artist page with attribution. Tell us the name or alias you want used and check it before your pieces go live.",
            link: { href: "/artists", label: "See the artists" },
          },
          {
            q: "Do you accept fan art, AI images or stock-based work?",
            a: "Tell us how the work was made and what in it came from elsewhere, and submit only work you can legitimately license for commercial reproduction. Acceptance is down to our content and rights review.",
            link: CONTACT_ARTIST,
          },
        ],
      },
      {
        id: "artists-earnings",
        title: "Earnings and partnership",
        items: [
          {
            q: "How much do I earn per sale?",
            a: "By your written artist agreement. We confirm the rate, what it is calculated on and what is deducted before your work is listed, so you know what an eligible sale pays before you commit to anything.",
            link: CONTACT_ARTIST,
          },
          {
            q: "Is this a one-time purchase of my artwork?",
            a: "No - you license the work and earn on eligible sales of it rather than taking a single fee. We can't promise any particular volume or income.",
          },
          {
            q: "When and how will I be paid?",
            a: "Your agreement sets the payout schedule, the method, the details we need from you and what happens to pending, cancelled or refunded sales. Read those clauses before you approve a listing - ask us to walk you through them.",
            link: CONTACT_ARTIST,
          },
          {
            q: "Do I keep my copyright? Can I sell elsewhere?",
            a: "You keep the copyright. Your licence decides the rest - whether a given design is exclusive, on which products, in which territory and for how long. Check that before listing the same piece somewhere else.",
            link: { href: "/terms", label: "Read the terms" },
          },
          {
            q: "How will I see my sales, discounts and returns?",
            a: "Ask us for a statement and we'll set out your eligible sales, the agreed calculation, any discounts and adjustments, and what is payable. Referral earnings apply only where we've agreed them separately and can trace them.",
            link: CONTACT_ARTIST,
          },
          {
            q: "Can I withdraw a design or end the partnership?",
            a: "Yes, on the terms in your signed agreement - notice, orders already in flight, any agreed sell-off period and anything still owed to you. Ask us to explain all of that before you sign, not after.",
            link: CONTACT_ARTIST,
          },
        ],
      },
    ],
  },
];

/** Flat section list, for the jump rail. */
export const FAQ_SECTIONS: FaqSection[] = FAQ_BANDS.flatMap((b) => b.sections);
