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

export interface Product {
  id: number;
  slug: string;
  title: string;
  description: string;
  price_inr: number;
  image_url: string;
  material: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  artist: ArtistBrief | null;
  categories: Category[];
  rating_avg: number | null;
  rating_count: number;
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
  product_id: number;
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
}

export type OrderStatus =
  | "pending"
  | "paid"
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
  created_at: string;
  items: OrderItem[];
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
  image_url: string;
  thumb_url: string;
}
