import { HeroSection } from "@/sections/HeroSection";
import { FAQBanner } from "@/sections/FAQBanner";
import { CasesSection } from "@/sections/CasesSection";

export const Main = () => {
  return (
    <main className="box-border caret-transparent break-words">
      <HeroSection />
      <FAQBanner />
      <CasesSection />
    </main>
  );
};
