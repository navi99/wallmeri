"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Palette, Truck, Wallet } from "lucide-react";

import { Button, Card, FieldError, Input, Label, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(20).optional().or(z.literal("")),
  portfolio_url: z.string().url("Enter a valid link").or(z.literal("")),
  pitch: z.string().max(4000).optional().or(z.literal("")),
  website: z.string().optional(), // honeypot
});
type FormValues = z.infer<typeof schema>;

export default function ArtistJoinPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await api.submitArtistApplication({
        name: values.name,
        email: values.email,
        phone: values.phone ?? "",
        portfolio_url: values.portfolio_url ?? "",
        pitch: values.pitch ?? "",
        website: values.website ?? "",
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not send your application");
    }
  };

  if (submitted) {
    return (
      <div className="container-page flex justify-center py-20">
        <Card className="w-full max-w-lg p-10 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
          <h1 className="mt-4 text-2xl font-bold uppercase tracking-tight text-ink">Application received!</h1>
          <p className="mt-2 text-muted">
            Thanks for reaching out. The Wallmeri team reviews every application personally
            and will get back to you by email.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-ink">Become a Wallmeri artist</h1>
        <p className="mt-3 max-w-lg leading-relaxed text-muted">
          Wallmeri is a curated gallery — we work with a small set of artists we love.
          You send us your art; we take care of everything else and you earn on every sale.
        </p>
        <ul className="mt-8 space-y-5">
          {[
            {
              icon: Palette,
              title: "You create, we manage",
              desc: "Our team handles image preparation, uploads, product pages and presentation.",
            },
            {
              icon: Truck,
              title: "Printing, sales & shipping covered",
              desc: "We print on premium metal, run the store, and ship across India.",
            },
            {
              icon: Wallet,
              title: "Attribution & earnings",
              desc: "Your own artist page, your name on every poster, and a share of every sale.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-ink">{title}</p>
                <p className="text-sm text-muted">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted">
          <span className="font-semibold text-ink">How selection works:</span> we review your
          portfolio, talk to you about your work, verify your identity, and sign a simple
          licensing agreement before your art goes live.
        </p>
      </div>

      <Card className="h-fit p-8">
        <h2 className="text-xl font-bold text-ink">Tell us about yourself</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
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
          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
            <FieldError>{errors.phone?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="portfolio_url">Portfolio link</Label>
            <Input
              id="portfolio_url"
              placeholder="https://instagram.com/you or your site"
              {...register("portfolio_url")}
            />
            <FieldError>{errors.portfolio_url?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="pitch">About your art (optional)</Label>
            <Textarea
              id="pitch"
              rows={4}
              placeholder="What do you create? What would you love to see on metal?"
              {...register("pitch")}
            />
          </div>
          {/* Honeypot — hidden from humans, bots fill it in. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
            {...register("website")}
          />
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Send application
          </Button>
        </form>
      </Card>
    </div>
  );
}
