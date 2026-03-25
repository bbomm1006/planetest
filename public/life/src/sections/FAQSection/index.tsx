import { FAQItem } from "@/sections/FAQSection/components/FAQItem";

export const FAQSection = () => {
  return (
    <div className="items-center box-border caret-transparent flex flex-col justify-center min-h-[auto] min-w-[auto] break-words py-[60px] md:py-[150px]">
      <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] min-h-[auto] min-w-[auto] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
        혹시 이것도 궁금하세요?
      </h2>
      <ul className="box-border caret-transparent gap-x-2.5 flex flex-col max-w-[700px] min-h-[auto] min-w-[auto] break-words gap-y-2.5 w-full mt-[30px] pl-0 md:gap-x-5 md:gap-y-5 md:mt-[73px]">
        <FAQItem question="어떤 렌트카 서비스인가요?" />
        <FAQItem question="정기 렌트카 외 다른 서비스도 있나요?" />
        <FAQItem question="다른 업체보다 어떤 점이 좋나요?" />
        <FAQItem question="입주렌트카? 이사렌트카? 뭐가 다른가요?" />
        <FAQItem question="욕실, 주방, 에어컨 등 특수렌트카도 되나요?" />
        <FAQItem question="렌트카 후 하자가 생기면 어떻게 하나요?" />
      </ul>
    </div>
  );
};
