import { ReviewHeader } from "@/sections/ReviewsSection/components/ReviewHeader";
import { ReviewCarousel } from "@/sections/ReviewsSection/components/ReviewCarousel";
import { CarouselDots } from "@/sections/ReviewsSection/components/CarouselDots";

export const ReviewsSection = () => {
  return (
    <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
      <div className="relative bg-green-100 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden py-[30px] rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:py-[60px] md:rounded-[33px]">
        <ReviewHeader />
        <ReviewCarousel />
        <CarouselDots />
      </div>
    </div>
  );
};
