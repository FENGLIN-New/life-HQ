import type { ButtonHTMLAttributes } from "react";
import { radius } from "@/lib/design/radius";
import { shadow } from "@/lib/design/shadow";
import { transition } from "@/lib/design/transition";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "domain";
};

const variantClasses = {
  domain: [
    "flex min-h-[156px] w-full items-center text-left border focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
    radius.card,
    shadow.card,
    shadow.cardHover,
    transition.interactive,
    transition.cardInteraction,
  ].join(" "),
} as const;

export default function Button({
  className,
  variant = "domain",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
