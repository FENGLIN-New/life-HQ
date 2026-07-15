export const colors = {
  canvas: "#ffffff",
  foreground: "#171717",
  inverse: "#ffffff",
} as const;

export const colorClasses = {
  homeOverlay: "bg-[#07111f]/55",
  inverseText: "text-white",
  mutedInverseText: "text-white/85",
  secondaryInverseText: "text-white/95",
  translucentNavigation: "border border-white/10 bg-[#07111f]",
} as const;

export const domainCardClasses = {
  work: "border-[#9bb8f6]/25 bg-[#3f62ac]/75 hover:bg-[#496db8]/80",
  personal: "border-[#8ccfc3]/25 bg-[#1f655f]/75 hover:bg-[#28736b]/80",
  research: "border-[#c3a8e4]/25 bg-[#69508e]/75 hover:bg-[#755c9d]/80",
  startup: "border-[#efbf96]/25 bg-[#a36538]/75 hover:bg-[#b27140]/80",
} as const;

export type DomainTone = keyof typeof domainCardClasses;
