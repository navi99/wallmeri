export interface Category {
  id: number;
  name: string;
  slug: string;
  is_active?: boolean;
}

export interface ArtistBrief {
  id: number;
  slug: string;
  name: string;
  avatar_url: string;
}

export interface Artist extends ArtistBrief {
  bio: string;
  website_url: string;
  instagram_url: string;
  product_count: number;
}

export interface ArtistAdmin extends Artist {
  identity_verified: boolean;
  agreement_received: boolean;
  contact_verified: boolean;
  is_active: boolean;
  created_at: string;
  // Set only when avatar_url came from the admin uploader — round-tripped so
  // the edit form can preserve it across saves that don't touch the avatar.
  avatar_id: number | null;
}

export interface ArtistApplication {
  id: number;
  name: string;
  email: string;
  phone: string;
  portfolio_url: string;
  pitch: string;
  status: "new" | "contacted" | "onboarded" | "rejected";
  admin_note: string;
  created_at: string;
}

export interface ProductImage {
  id: number;
  image_id: number;
  image_url: string;
  thumb_url: string;
  position: number;
}

export interface Product {
  id: number;
  slug: string;
  title: string;
  description: string;
  price_inr: number;
  image_url: string;
  thumb_url: string;
  // Set only when image_url came from the admin uploader — round-tripped so
  // the edit form can preserve it across saves that don't touch the image.
  image_id: number | null;
  // Ordered gallery (up to 6). images[0] is always the main image and stays
  // in sync with image_url/image_id.
  images: ProductImage[];
  material: string;
  is_active: boolean;
  is_featured: boolean;
  artist: ArtistBrief | null;
  categories: Category[];
  rating_avg: number | null;
  rating_count: number;
}

export interface PosterSize {
  id: number;
  code: string;
  label: string;
  width_cm: number;
  height_cm: number;
  // Absolute price for a "Create your own" custom upload at this size.
  price_inr: number;
  // Adjustment applied to a catalog product's price_inr (quoted for A4) to
  // get its price at this size — 0 at A4, negative below, positive above.
  delta_inr: number;
  is_enabled: boolean;
  position: number;
}

export type Orientation = "portrait" | "landscape";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// "ok": clean print. "warning": may look soft but allowed. "blocked": rejected server-side.
export type DpiBand = "ok" | "warning" | "blocked";

export interface CustomItem {
  custom_upload_id: number;
  preview_url: string;
  size_code: string;
  size_label: string;
  orientation: Orientation;
  price_inr: number;
  dpi: number;
  dpi_band: DpiBand;
}

export interface ProductList {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface Review {
  id: number;
  rating: number;
  title: string;
  body: string;
  author_name: string;
  created_at: string;
}

export interface MyReview extends Review {
  status: "pending" | "approved" | "rejected";
  reject_reason: string;
}

export interface ReviewEligibility {
  can_review: boolean;
  reason: "" | "not_purchased" | "not_delivered" | "already_reviewed";
  my_review: MyReview | null;
}

export interface ReviewAdmin {
  id: number;
  product_id: number;
  product_title: string;
  product_slug: string;
  author_name: string;
  author_email: string;
  rating: number;
  title: string;
  body: string;
  status: string;
  reject_reason: string;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface QuoteLine {
  kind: "product" | "custom";
  product_id: number | null;
  custom_upload_id: number | null;
  size_code: string | null;
  slug: string;
  title: string;
  image_url: string;
  price_inr: number;
  qty: number;
  line_total_inr: number;
}

export interface Quote {
  lines: QuoteLine[];
  subtotal_inr: number;
  shipping_inr: number;
  total_inr: number;
}

export interface CreatePaymentResponse {
  order_id: number;
  razorpay_order_id: string | null;
  razorpay_key_id: string;
  amount_inr: number;
  amount_paise: number;
  currency: string;
  mock: boolean;
}

export interface OrderItem {
  title_snapshot: string;
  slug_snapshot: string;
  image_snapshot: string;
  price_inr: number;
  qty: number;
  is_custom: boolean;
  custom_upload_id: number | null;
  size_code: string | null;
}

export type OrderStatus =
  | "pending"
  | "paid"
  // Held for admin moderation — set only on a paid order with a custom line.
  | "in_review"
  | "shipped"
  | "delivered"
  | "failed"
  | "cancelled"
  | "refunded";

export interface Order {
  id: number;
  email: string;
  status: OrderStatus;
  subtotal_inr: number;
  shipping_inr: number;
  total_inr: number;
  shipping_address: Record<string, string>;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  courier_name: string;
  tracking_number: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  review_note: string;
  reviewed_at: string | null;
  has_custom_items: boolean;
  created_at: string;
  items: OrderItem[];
}

export interface CustomReviewLine {
  order_item_id: number;
  custom_upload_id: number;
  title: string;
  preview_url: string;
  size_code: string;
  orientation: Orientation;
  dpi: number;
  dpi_band: DpiBand;
  crop: CropRect;
  qty: number;
  price_inr: number;
}

export interface CustomReviewOrder {
  id: number;
  email: string;
  status: OrderStatus;
  total_inr: number;
  created_at: string;
  shipping_address: Record<string, string>;
  custom_lines: CustomReviewLine[];
  other_lines: OrderItem[];
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface UploadResult {
  id: number;
  image_url: string;
  thumb_url: string;
  width: number;
  height: number;
}
