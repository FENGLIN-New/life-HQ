import Button from "@/components/ui/Button";
import DomainIcon from "./DomainIcon";
import { colorClasses, domainCardClasses, type DomainTone } from "@/lib/design/colors";
import { spacing } from "@/lib/design/spacing";

type DomainCardProps = {
  label: string;
  tone: DomainTone;
};

export default function DomainCard({ label, tone }: DomainCardProps) {
  return (
    <Button
      type="button"
      className={`flex-col items-start justify-between ${domainCardClasses[tone]} ${spacing.domainCard}`}
      aria-label={`Enter ${label}`}
    >
      <DomainIcon tone={tone} />
      <span className={`text-[28px] font-medium leading-none tracking-[-0.03em] ${colorClasses.inverseText}`}>
        {label}
      </span>
    </Button>
  );
}
