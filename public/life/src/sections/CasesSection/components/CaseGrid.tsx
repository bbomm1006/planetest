import { CaseCard } from "@/sections/CasesSection/components/CaseCard";

export const CaseGrid = () => {
  return (
    <div className="box-border caret-transparent gap-x-[15px] grid grid-cols-[repeat(2,minmax(0px,1fr))] min-h-[auto] min-w-[auto] break-words gap-y-[15px] md:gap-x-[25px] md:grid-cols-[repeat(4,minmax(0px,1fr))] md:gap-y-[25px]">
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/142.png"
        label="오래된 차량 점검"
        innerDivClassName="scale-[1.3]"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/137.png"
        label="철저한 차량 안전 점검"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/155.png"
        label="실내 청결 관리"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/166.png"
        label="소형·원룸형 차량"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/125.png"
        label="프리미엄 차량 관리"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/190.png"
        label="당일 즉시 렌트"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/123.png"
        label="단기/장기 렌트"
      />
      <CaseCard
        imageSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/122.png"
        label="정기 렌트 구독 서비스"
      />
    </div>
  );
};
