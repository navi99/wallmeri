"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-cream hover:bg-brand-600 active:bg-brand-700",
  outline:
    "border border-ink bg-transparent text-ink hover:bg-ink hover:text-cream",
  ghost: "text-ink hover:bg-ink/5",
  danger: "bg-transparent text-brand-700 border border-brand-700 hover:bg-brand-700 hover:text-cream",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[11px]",
  md: "h-11 px-6 text-xs",
  lg: "h-[52px] px-9 text-xs",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full border border-ink/20 bg-paper px-3.5 text-sm text-ink placeholder:text-muted/70 focus:border-ink focus-visible:outline-none",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full border border-ink/20 bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-ink focus-visible:outline-none",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-11 w-full border border-ink/20 bg-paper px-3 text-sm text-ink focus:border-ink focus-visible:outline-none",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-ink", className)}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-sm text-brand-700">{children}</p>;
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border border-ink/10 bg-paper shadow-card",
        className,
      )}
      {...props}
    />
  );
}

/* Status tones. The tone encodes *urgency* — what the operator has to do about
   the row — while the label text carries the identity. That's why "paid" is the
   loudest chip on the orders table (it's the ship queue) and "delivered" is
   merely solid. Filled-vs-outlined does the scanning work a rainbow used to. */
export type BadgeTone =
  | "neutral" // default chip
  | "attention" // needs an operator action
  | "progress" // in flight, no action yet
  | "done" // terminal, positive
  | "inert" // dormant, hidden, closed
  | "danger"; // error

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-ink/5 text-brand-700",
  attention: "bg-brand-600 text-cream",
  progress: "bg-ink/10 text-ink",
  done: "bg-ink text-cream",
  inert: "border border-ink/25 text-muted",
  danger: "bg-brand-700 text-cream",
};

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-brand-600", className)} />;
}
