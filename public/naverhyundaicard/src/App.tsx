import { HeroSection } from "@/sections/HeroSection";
import { BenefitSection } from "@/sections/BenefitSection";
import { CardBenefitSection } from "@/sections/CardBenefitSection";
import { EventSection01 } from "@/sections/EventSection01";
import { EventSection02 } from "@/sections/EventSection02";
import { EventSection03 } from "@/sections/EventSection03";
import { DisclaimerSection } from "@/sections/DisclaimerSection";

export const App = () => {
  return (
    <body className="text-black text-base not-italic normal-nums font-normal accent-auto bg-white box-border caret-transparent block h-full tracking-[normal] leading-[normal] list-outside list-disc pointer-events-auto text-start indent-[0px] normal-case visible w-full border-separate font-times_new_roman">
      <div className="box-border caret-transparent">
        <div className="box-border caret-transparent tracking-[-0.8px] min-h-full min-w-80 font-nanumsquareneo md:tracking-[-1.2px]">
          <HeroSection />
          <BenefitSection />
          <CardBenefitSection />
          <EventSection01 />
          <EventSection02 />
          <EventSection03 />
          <section className="bg-black box-border caret-transparent tracking-[-0.8px] md:tracking-[-1.2px]"></section>
          <DisclaimerSection />
        </div>
      </div>
    </body>
  );
};
