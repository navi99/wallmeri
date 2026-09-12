"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import { Button, Card, FieldError, Input, Label, Select, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { ContactCategory } from "@/lib/types";

// Must stay in step with schemas/contact.CATEGORY_PATTERN on the API and with
// CONTACT_CATEGORY_LABELS in services/email_service, which renders these same
// topics into the notification subject line.
export const CONTACT_CATEGORIES: { value: ContactCategory; label: string }[] = [
  { value: "order", label: "Order status" },
  { value: "product", label: "Product question" },
  { value: "returns", label: "Returns & replacements" },
  { value: "wholesale", label: "Bulk & corporate" },
  { value: "artist", label: "Artist enquiry" },
  { value: "general", label: "Something else" },
];

const schema = z.object({
  category: z.enum(["order", "product", "returns", "wholesale", "artist", "general"]),
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(20).optional().or(z.literal("")),
  subject: z.string().max(200).optional().or(z.literal("")),
  // Matches the server's floor: anything shorter isn't a question anyone can
  // answer, and rejecting it here saves the customer a round trip.
  message: z.string().min(10, "Tell us a little more - at least a sentence").max(4000),
  website: z.string().optional(), // honeypot
});
type FormValues = z.infer<typeof schema>;

export function ContactForm({ defaultCategory }: { defaultCategory: ContactCategory }) {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: defaultCategory },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await api.submitContactEnquiry({
        category: values.category,
        name: values.name,
        email: values.email,
        phone: values.phone ?? "",
        subject: values.subject ?? "",
        message: values.message,
        website: values.website ?? "",
      });
      setSubmitted(true);
    } catch (err) {
      // Covers the 429 from the API's rate limiter too - its message is
      // already customer-readable.
      toast.error(err instanceof ApiError ? err.message : "Could not send your message");
    }
  };

  if (submitted) {
    return (
      <Card className="h-fit p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand-600" strokeWidth={1.25} />
        <h2 className="mt-4 title-lg">Message received</h2>
        <p className="mt-3 text-sm leading-[1.75] text-muted">
          A confirmation is on its way to your inbox. A real person reads every message -
          we reply to most enquiries within one business day.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-fit p-6 sm:p-8">
      <h2 className="title-sm">Send us a message</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <div>
          <Label htmlFor="category">What is this about?</Label>
          <Select id="category" {...register("category")}>
            {CONTACT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <FieldError>{errors.category?.message}</FieldError>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" {...register("name")} />
            <FieldError>{errors.name?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
            <FieldError>{errors.phone?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input
              id="subject"
              placeholder="Order #1234, or a short summary"
              {...register("subject")}
            />
            <FieldError>{errors.subject?.message}</FieldError>
          </div>
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            rows={6}
            placeholder="Your order number, if you have one, and what you'd like us to help with."
            {...register("message")}
          />
          <FieldError>{errors.message?.message}</FieldError>
        </div>
        {/* Honeypot - hidden from humans, bots fill it in. */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          {...register("website")}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Send message
        </Button>
        <p className="text-xs leading-relaxed text-muted">
          We use your details only to answer this enquiry. Nothing is shared with anyone else.
        </p>
      </form>
    </Card>
  );
}
