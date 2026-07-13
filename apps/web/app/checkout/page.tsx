"use client";

import Image from "@/components/app-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button, Card, FieldError, Input, Label } from "@/components/ui";
import { api, ApiError, type CheckoutLine } from "@/lib/api";
import { useAuth } from "@/lib/store/auth";
import { lineId, useCart } from "@/lib/store/cart";
import { formatINR } from "@/lib/utils";

const FREE_SHIPPING = 2999;
const FLAT_SHIPPING = 99;

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  full_name: z.string().min(2, "Enter the recipient's name"),
  phone: z.string().min(6, "Enter a valid phone number").max(20),
  line1: z.string().min(2, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(4, "Enter a valid PIN code").max(12),
});
type FormValues = z.infer<typeof schema>;

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [paying, setPaying] = useState(false);

  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const user = useAuth((s) => s.user);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (user?.email) setValue("email", user.email);
    if (user?.full_name) setValue("full_name", user.full_name);
  }, [user, setValue]);

  const subtotal = items.reduce((n, i) => n + i.price_inr * i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;
  const hasCustom = items.some((i) => i.kind === "custom");

  if (mounted && items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-ink">Your cart is empty</h1>
        <Link href="/catalog" className="mt-4 inline-block">
          <Button size="lg">Browse posters</Button>
        </Link>
      </div>
    );
  }

  const finishOrder = (orderId: number, email: string) => {
    clear();
    queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    toast.success("Payment successful!");
    router.push(`/order/${orderId}?email=${encodeURIComponent(email)}`);
  };

  const onSubmit = async (values: FormValues) => {
    setPaying(true);
    try {
      const payload = {
        email: values.email,
        items: items.map(
          (i): CheckoutLine =>
            i.kind === "custom"
              ? { custom_upload_id: i.custom_upload_id, qty: i.qty }
              : { product_id: i.product_id, size_code: i.size_code, qty: i.qty },
        ),
        shipping_address: {
          full_name: values.full_name,
          phone: values.phone,
          line1: values.line1,
          line2: values.line2 ?? "",
          city: values.city,
          state: values.state,
          pincode: values.pincode,
        },
      };

      const payment = await api.createPayment(payload);

      // Mock mode: no Razorpay keys configured — confirm directly.
      if (payment.mock) {
        await api.verifyPayment({
          order_id: payment.order_id,
          razorpay_order_id: "mock_order",
          razorpay_payment_id: `mock_pay_${payment.order_id}`,
          razorpay_signature: "mock_signature",
        });
        finishOrder(payment.order_id, values.email);
        return;
      }

      // Real Razorpay flow.
      const ok = await loadRazorpayScript();
      if (!ok) {
        toast.error("Could not load payment gateway. Please try again.");
        setPaying(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: payment.razorpay_key_id,
        amount: payment.amount_paise,
        currency: payment.currency,
        name: "Wallmeri",
        description: "Metal wall art order",
        order_id: payment.razorpay_order_id,
        prefill: {
          name: values.full_name,
          email: values.email,
          contact: values.phone,
        },
        theme: { color: "#b32624" },
        handler: async (response: any) => {
          try {
            await api.verifyPayment({
              order_id: payment.order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            finishOrder(payment.order_id, values.email);
          } catch (err) {
            const msg = err instanceof ApiError ? err.message : "Verification failed";
            toast.error(msg);
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Checkout failed";
      toast.error(msg);
      setPaying(false);
    }
  };

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold uppercase tracking-tight text-ink">Checkout</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]"
      >
        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink">Contact & shipping</h2>
          {!user && (
            <p className="mt-1 text-sm text-muted">
              Checking out as a guest.{" "}
              <Link href="/login?next=/checkout" className="font-semibold text-brand-600 hover:underline">
                Log in
              </Link>{" "}
              to save your orders.
            </p>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              <FieldError>{errors.email?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...register("full_name")} />
              <FieldError>{errors.full_name?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
              <FieldError>{errors.phone?.message}</FieldError>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="line1">Address line 1</Label>
              <Input id="line1" {...register("line1")} />
              <FieldError>{errors.line1?.message}</FieldError>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="line2">Address line 2 (optional)</Label>
              <Input id="line2" {...register("line2")} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
              <FieldError>{errors.city?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register("state")} />
              <FieldError>{errors.state?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="pincode">PIN code</Label>
              <Input id="pincode" {...register("pincode")} />
              <FieldError>{errors.pincode?.message}</FieldError>
            </div>
          </div>
        </Card>

        <aside className="h-fit rounded-2xl border border-brand-100 bg-paper p-6">
          <h2 className="text-lg font-bold text-ink">Your order</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={lineId(item)} className="flex items-center gap-3">
                <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-50">
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs text-muted">Qty {item.qty}</p>
                </div>
                <span className="text-sm font-semibold text-ink">
                  {formatINR(item.price_inr * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <dl className="mt-5 space-y-2 border-t border-brand-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-ink">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="font-semibold text-ink">
                {shipping === 0 ? "Free" : formatINR(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-brand-100 pt-2 text-base">
              <dt className="font-bold text-ink">Total</dt>
              <dd className="font-bold text-ink">{formatINR(total)}</dd>
            </div>
          </dl>

          <Button type="submit" size="lg" className="mt-5 w-full" loading={paying}>
            Pay {formatINR(total)}
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            Secured by Razorpay. UPI, cards, netbanking & wallets.
          </p>
          {hasCustom && (
            <p className="mt-3 text-center text-xs text-muted">
              Custom designs are reviewed before printing (1-2 business days) — no returns for
              customer-error content.
            </p>
          )}
        </aside>
      </form>
    </div>
  );
}
