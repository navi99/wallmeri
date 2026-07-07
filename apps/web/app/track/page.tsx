"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PackageSearch } from "lucide-react";

import { Button, Card, FieldError, Input, Label } from "@/components/ui";

const schema = z.object({
  order_id: z.coerce.number().int().positive("Enter your order number"),
  email: z.string().email("Enter the email you used at checkout"),
});
type FormValues = z.infer<typeof schema>;

export default function TrackPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    router.push(`/order/${values.order_id}?email=${encodeURIComponent(values.email)}`);
  };

  return (
    <div className="container-page flex justify-center py-16">
      <Card className="w-full max-w-md p-8">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <PackageSearch className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink">Track your order</h1>
        <p className="mt-1 text-sm text-muted">
          No account needed — use your order number and the email from checkout.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="order_id">Order number</Label>
            <Input id="order_id" type="number" inputMode="numeric" placeholder="e.g. 42" {...register("order_id")} />
            <FieldError>{errors.order_id?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Find my order
          </Button>
        </form>
      </Card>
    </div>
  );
}
