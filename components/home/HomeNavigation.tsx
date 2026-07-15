import type { ReactNode } from "react";
import IconButton from "@/components/ui/IconButton";
import { colorClasses } from "@/lib/design/colors";
import { spacing } from "@/lib/design/spacing";

type NavigationItem = {
  label: string;
  active: boolean;
  icon: ReactNode;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Home",
    active: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12 3l9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11l9-8z" />
      </svg>
    ),
  },
  {
    label: "Chat",
    active: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-2.55-.33L3 21l1.33-5.45A8.96 8.96 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    active: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 1 0 8z" />
      </svg>
    ),
  },
];

export default function HomeNavigation() {
  return (
    <nav aria-label="Main navigation" className={`fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-20 w-[calc(100%-3rem)] max-w-[25rem] -translate-x-1/2 rounded-[1.5rem] ${colorClasses.translucentNavigation} ${spacing.navigation}`}>
      <ul className="flex items-center justify-around">
        {navigationItems.map(({ label, active, icon }) => (
          <li key={label}>
            <IconButton type="button" active={active} aria-current={active ? "page" : undefined}>
              {icon}
              <span className="text-[11px] font-medium">{label}</span>
            </IconButton>
          </li>
        ))}
      </ul>
    </nav>
  );
}
