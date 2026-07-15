import type { HTMLAttributes } from "react";

type PageProps = HTMLAttributes<HTMLDivElement>;

export default function Page({ className, ...props }: PageProps) {
  return (
    <div
      className={`relative mx-auto flex min-h-dvh w-full max-w-md flex-col ${className ?? ""}`}
      {...props}
    />
  );
}
