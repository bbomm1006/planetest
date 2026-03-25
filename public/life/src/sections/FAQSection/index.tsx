import { FAQItem } from "@/sections/FAQSection/components/FAQItem";

export const FAQSection = () => {
  return (
    <div className="items-center box-border caret-transparent flex flex-col justify-center min-h-[auto] min-w-[auto] break-words py-[60px] md:py-[150px]">
      <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] min-h-[auto] min-w-[auto] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
        혹시 이것도 궁금하세요?
      </h2>
      <ul className="box-border caret-transparent gap-x-2.5 flex flex-col max-w-[700px] min-h-[auto] min-w-[auto] break-words gap-y-2.5 w-full mt-[30px] pl-0 md:gap-x-5 md:gap-y-5 md:mt-[73px]">
        <FAQItem question="어떤 서비스인가요?" />
        <FAQItem question="개인회생 외 다른 법률자문은 안하나요?" />
        <FAQItem question="다른 곳보다 어떤 부분이 좋나요?" />
        <FAQItem question="회생? 파산? 워크아웃? 어떤게 나아요?" />
        <FAQItem question="통신요금, 카드값, 사채, 개인채무도 가능한가요?" />
        <FAQItem question="하면 사회생활에 지장이 없을까요?" />
      </ul>
    </div>
  );
};
