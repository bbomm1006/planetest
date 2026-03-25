import { CaseCard } from "@/sections/CasesSection/components/CaseCard";

export const CaseGrid = () => {
  return (
    <div className="box-border caret-transparent gap-x-[15px] grid grid-cols-[repeat(2,minmax(0px,1fr))] min-h-[auto] min-w-[auto] break-words gap-y-[15px] md:gap-x-[25px] md:grid-cols-[repeat(4,minmax(0px,1fr))] md:gap-y-[25px]">
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/142.png"
        label="오래된 찌든 때"
        innerDivClassName="scale-[1.3]"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/137.png"
        label="곰팡이/결로 제거"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/155.png"
        label="반려동물 털/냄새"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/166.png"
        label="원룸/오피스텔"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/125.png"
        label="프리미엄 가전 세척"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/190.png"
        label="당일 급행 청소"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/123.png"
        label="입주/이사 청소"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/122.png"
        label="정기 구독 서비스"
      />
    </div>
  );
};
