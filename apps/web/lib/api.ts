import type {
  Artist,
  ArtistAdmin,
  ArtistApplication,
  AuthResponse,
  Category,
  CreatePaymentResponse,
  MyReview,
  Order,
  Product,
  ProductList,
  Quote,
  Review,
  ReviewAdmin,
  ReviewEligibility,
  ShippingAddress,
  TokenPair,
  UploadResult,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export const TOKEN_KEY = "wallmeri.access_token";
export const REFRESH_KEY = "wallmeri.refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setTokens(tokens: TokenPair | null) {
  if (typeof window === "undefined") return;
  if (tokens) {
    window.localStorage.setItem(TOKEN_KEY, tokens.access_token);
    window.localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };
  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const detail =
      (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    const message = Array.isArray(detail)
      ? detail.map((d: any) => d.msg).join(", ")
      : String(detail);
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export const api = {
  // Catalog
  listProducts: (params: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    });
    return request<ProductList>(`/products?${qs.toString()}`);
  },
  getProduct: (slug: string) => request<Product>(`/products/${slug}`),
  listCategories: () => request<Category[]>(`/categories`),

  // Artists
  listArtists: () => request<Artist[]>(`/artists`),
  getArtist: (slug: string) => request<Artist>(`/artists/${slug}`),
  artistProducts: (slug: string) => request<Product[]>(`/artists/${slug}/products`),
  submitArtistApplication: (body: {
    name: string;
    email: string;
    phone: string;
    portfolio_url: string;
    pitch: string;
    website: string; // honeypot, keep empty
  }) =>
    request<{ ok: boolean }>(`/artist-applications`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Reviews
  listReviews: (slug: string) => request<Review[]>(`/products/${slug}/reviews`),
  reviewEligibility: (slug: string) =>
    request<ReviewEligibility>(`/products/${slug}/reviews/eligibility`, { auth: true }),
  submitReview: (slug: string, body: { rating: number; title: string; body: string }) =>
    request<MyReview>(`/products/${slug}/reviews`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  // Auth
  register: (body: { email: string; password: string; full_name: string }) =>
    request<AuthResponse>(`/auth/register`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  googleLogin: (credential: string) =>
    request<AuthResponse>(`/auth/google`, {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  // Checkout
  quote: (items: { product_id: number; qty: number }[]) =>
    request<Quote>(`/checkout/quote`, {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
  createPayment: (body: {
    email: string;
    items: { product_id: number; qty: number }[];
    shipping_address: ShippingAddress;
  }) =>
    request<CreatePaymentResponse>(`/checkout/create-payment`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),
  verifyPayment: (body: {
    order_id: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    request<{ status: string; order_id: number }>(`/checkout/verify`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Orders
  myOrders: () => request<Order[]>(`/orders`, { auth: true }),
  getOrder: (id: number, email?: string) => {
    const qs = email ? `?email=${encodeURIComponent(email)}` : "";
    return request<Order>(`/orders/${id}${qs}`, { auth: true });
  },

  // Admin
  adminListProducts: () => request<Product[]>(`/admin/products`, { auth: true }),
  adminCreateProduct: (body: Record<string, unknown>) =>
    request<Product>(`/admin/products`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),
  adminUpdateProduct: (id: number, body: Record<string, unknown>) =>
    request<Product>(`/admin/products/${id}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(body),
    }),
  adminDeleteProduct: (id: number) =>
    request<void>(`/admin/products/${id}`, { method: "DELETE", auth: true }),
  adminListOrders: () => request<Order[]>(`/admin/orders`, { auth: true }),
  adminUpdateOrderStatus: (
    id: number,
    body: { status: string; courier_name?: string; tracking_number?: string },
  ) =>
    request<Order>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(body),
    }),

  adminUpload: async (
    file: File,
    kind: "product" | "avatar" = "product",
  ): Promise<UploadResult> => {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    const token = getAccessToken();
    const res = await fetch(`${BASE_URL}/admin/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(
        (data && (data.detail || data.message)) || `Upload failed (${res.status})`,
        res.status,
      );
    }
    return data as UploadResult;
  },

  adminListCategories: () => request<Category[]>(`/admin/categories`, { auth: true }),
  adminCreateCategory: (body: { name: string }) =>
    request<Category>(`/admin/categories`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),
  adminUpdateCategory: (id: number, body: { name?: string; is_active?: boolean }) =>
    request<Category>(`/admin/categories/${id}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(body),
    }),

  adminListArtists: () => request<ArtistAdmin[]>(`/admin/artists`, { auth: true }),
  adminCreateArtist: (body: Record<string, unknown>) =>
    request<ArtistAdmin>(`/admin/artists`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),
  adminUpdateArtist: (id: number, body: Record<string, unknown>) =>
    request<ArtistAdmin>(`/admin/artists/${id}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(body),
    }),

  adminListApplications: () =>
    request<ArtistApplication[]>(`/admin/artist-applications`, { auth: true }),
  adminUpdateApplication: (id: number, body: { status?: string; admin_note?: string }) =>
    request<ArtistApplication>(`/admin/artist-applications/${id}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(body),
    }),

  adminListReviews: (statusFilter: string) =>
    request<ReviewAdmin[]>(`/admin/reviews?status_filter=${statusFilter}`, { auth: true }),
  adminModerateReview: (id: number, body: { status: string; reject_reason?: string }) =>
    request<ReviewAdmin>(`/admin/reviews/${id}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(body),
    }),
};
