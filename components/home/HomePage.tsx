import Image from "next/image";
import Page from "@/components/ui/Page";
import Section from "@/components/ui/Section";
import { colorClasses } from "@/lib/design/colors";
import { spacing } from "@/lib/design/spacing";
import DomainCard from "./DomainCard";
import HomeNavigation from "./HomeNavigation";

const domains = [
  { label: "Work", tone: "work" },
  { label: "Personal", tone: "personal" },
  { label: "Research", tone: "research" },
  { label: "Startup", tone: "startup" },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-[#07111f]">
      <Page className="overflow-x-hidden bg-[#07111f]">
        <Image
          src="/home-background.png"
          alt=""
          fill
          priority
          className="object-cover opacity-30"
          sizes="(max-width: 480px) 100vw, 480px"
        />
        <div className={`absolute inset-0 ${colorClasses.homeOverlay}`} />

        <main className={`relative z-10 flex flex-1 flex-col ${spacing.page}`}>
          <header className="flex flex-col">
            <p className={`text-[15px] font-medium tracking-[0.01em] ${colorClasses.secondaryInverseText}`}>
              Good morning.
            </p>
            <h1 className="mt-2 text-[46px] font-semibold leading-[1.03] tracking-[-0.045em] text-white sm:text-5xl">
              Life HQ
            </h1>
            <p className={`mt-4 max-w-[17rem] text-[15px] leading-relaxed ${colorClasses.mutedInverseText}`}>
              Your life, at your own pace.
            </p>
          </header>

          <Section className={spacing.domainList}>
            {domains.map((domain) => (
              <DomainCard key={domain.label} {...domain} />
            ))}
          </Section>
        </main>

        <HomeNavigation />
      </Page>
    </div>
  );
}
