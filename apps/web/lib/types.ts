export interface Category {
  id: number;
  name: string;
  slug: string;
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
  category: Category | null;
}

export interface ProductList {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
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

export interface Order {
  id: number;
  email: string;
  status: string;
  subtotal_inr: number;
  shipping_inr: number;
  total_inr: number;
  shipping_address: Record<string, string>;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
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
