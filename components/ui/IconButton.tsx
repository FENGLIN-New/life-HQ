import type { ButtonHTMLAttributes } from "react";
import { colorClasses } from "@/lib/design/colors";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export default function IconButton({
  active = false,
  className,
  ...props
}: IconButtonProps) {
  const colorClass = active
    ? colorClasses.inverseText
    : colorClasses.mutedInverseText;

  return (
    <button
      className={`flex min-h-11 min-w-12 flex-col items-center justify-center gap-1 rounded-2xl transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${colorClass} ${className ?? ""}`}
      {...props}
    />
  );
}
