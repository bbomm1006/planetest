import { CaseCard } from "@/sections/CasesSection/components/CaseCard";

export const CaseGrid = () => {
  return (
    <div className="box-border caret-transparent gap-x-[15px] grid grid-cols-[repeat(2,minmax(0px,1fr))] min-h-[auto] min-w-[auto] break-words gap-y-[15px] md:gap-x-[25px] md:grid-cols-[repeat(4,minmax(0px,1fr))] md:gap-y-[25px]">
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/142.png"
        label="코인 실패"
        innerDivClassName="scale-[1.3]"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/137.png"
        label="주식 실패"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/155.png"
        label="도박 빚"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/166.png"
        label="아르바이트"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/125.png"
        label="명품 소비"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/190.png"
        label="일용직근무자"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/123.png"
        label="여행 빚"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/122.png"
        label="프리랜서"
      />
    </div>
  );
};
