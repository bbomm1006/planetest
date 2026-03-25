type Props = {
  total: number;
  activeIndex: number;
  onDotClick: (i: number) => void;
};

export const CarouselDots = ({ total, activeIndex, onDotClick }: Props) => {
  return (
    <div className="flex items-center justify-center gap-[5px] mt-5 md:mt-8">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onDotClick(i)}
          className={`rounded-full transition-all duration-250 ${
            i === activeIndex
              ? "w-[18px] h-[7px] bg-blue-500"
              : "w-[7px] h-[7px] bg-gray-300 hover:bg-gray-400"
          }`}
          aria-label={`후기 ${i + 1}`}
        />
      ))}
    </div>
  );
};
