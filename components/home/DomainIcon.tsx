import type { DomainTone } from "@/lib/design/colors";

type DomainIconProps = {
  tone: DomainTone;
};

export default function DomainIcon({ tone }: DomainIconProps) {
  const commonProps = {
    className: "h-9 w-9 text-white",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  } as const;

  if (tone === "work") {
    return <svg {...commonProps}><rect x="3.5" y="7.5" width="17" height="12" rx="2" /><path d="M8 7.5V5.75c0-.69.56-1.25 1.25-1.25h5.5c.69 0 1.25.56 1.25 1.25V7.5M3.5 12h17M10 12v2h4v-2" /></svg>;
  }

  if (tone === "personal") {
    return <svg {...commonProps}><path strokeLinecap="round" strokeLinejoin="round" d="m3.5 10 8.5-6.5 8.5 6.5v9a1 1 0 0 1-1 1h-5.5v-5.5h-3V20H4.5a1 1 0 0 1-1-1v-9Z" /></svg>;
  }

  if (tone === "research") {
    return <svg {...commonProps}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M5.99 5.99l2.12 2.12M15.89 15.89l2.12 2.12M18.01 5.99l-2.12 2.12M8.11 15.89l-2.12 2.12" /><circle cx="12" cy="12" r="3.5" /></svg>;
  }

  return <svg {...commonProps}><path strokeLinecap="round" strokeLinejoin="round" d="M13.1 3.75c2.89.47 5.19 2.77 5.66 5.66l.34 2.08-4.18 4.18-2.08-.34a6.83 6.83 0 0 1-5.66-5.66l-.34-2.08 4.18-4.18 2.08.34ZM8.25 15.75l-2.5 2.5M14.75 9.25h.01" /></svg>;
}
