import type { DomainId } from "./types";

export interface DomainMeta {
  id: DomainId;
  label: string;
  bgImage: string;
  overlay: string;
  accent: string;
  accentBg: string;
  chip: string;
  border: string;
}

export const DOMAINS: DomainMeta[] = [
  {
    id: "work",
    label: "工作",
    bgImage: "/images/domain-work.jpg",
    overlay: "rgba(7,89,133,0.7), rgba(7,89,133,0.1)",
    accent: "text-sky-600",
    accentBg: "bg-sky-500",
    chip: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
    border: "border-sky-200",
  },
  {
    id: "personal",
    label: "生活",
    bgImage: "/images/domain-personal.jpg",
    overlay: "rgba(159,18,57,0.7), rgba(159,18,57,0.1)",
    accent: "text-rose-600",
    accentBg: "bg-rose-500",
    chip: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    border: "border-rose-200",
  },
  {
    id: "startup",
    label: "創業",
    bgImage: "/images/domain-startup.jpg",
    overlay: "rgba(76,29,149,0.7), rgba(76,29,149,0.1)",
    accent: "text-violet-600",
    accentBg: "bg-violet-500",
    chip: "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
    border: "border-violet-200",
  },
];

export function domainMeta(id: string): DomainMeta {
  return DOMAINS.find((d) => d.id === id) ?? DOMAINS[0];
}

export function isDomainId(id: string): id is DomainId {
  return DOMAINS.some((d) => d.id === id);
}
