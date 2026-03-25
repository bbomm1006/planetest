import { HeroContent } from "@/sections/HeroSection/components/HeroContent";
import { HeroEvents } from "@/sections/HeroSection/components/HeroEvents";
import { HeroDisclaimer } from "@/sections/HeroSection/components/HeroDisclaimer";

export const HeroSection = () => {
  return (
    <section className="relative box-border caret-transparent tracking-[-0.8px] text-center md:tracking-[-1.2px]">
      <HeroContent />
      <HeroEvents />
      <HeroDisclaimer />
    </section>
  );
};
