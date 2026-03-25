import { useState } from "react";
import { ReviewHeader } from "@/sections/ReviewsSection/components/ReviewHeader";
import { ReviewCarousel } from "@/sections/ReviewsSection/components/ReviewCarousel";
import { CarouselDots } from "@/sections/ReviewsSection/components/CarouselDots";

const TOTAL_CARDS = 19;

export const ReviewsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
      <div className="relative bg-[#eef7ee] box-border caret-transparent max-w-none min-h-[auto] min-w-[auto] break-words w-full overflow-hidden pt-[28px] pb-[44px] rounded-[17px] md:max-w-[1400px] md:pt-[52px] md:pb-[64px] md:rounded-[33px]">
        <ReviewHeader />
        <ReviewCarousel activeIndex={activeIndex} onIndexChange={setActiveIndex} total={TOTAL_CARDS} />
        <CarouselDots total={TOTAL_CARDS} activeIndex={activeIndex} onDotClick={setActiveIndex} />
      </div>
    </div>
  );
};
