import { BenefitTable } from "@/sections/BenefitSection/components/BenefitTable";

export const BenefitContent = () => {
  return (
    <div className="relative box-border caret-transparent tracking-[-0.8px] max-w-full mx-auto pt-[72px] pb-12 px-5 md:tracking-[-1.2px] md:max-w-[750px] md:pt-[108px] md:pb-[72px] md:px-0">
      <p className="text-neutral-500 text-lg font-medium box-border caret-transparent tracking-[-0.8px] leading-5 underline underline-offset-[5px] md:text-[27px] md:tracking-[-1.2px] md:leading-[30px]">
        네이버 현대카드 Ed2 카드 혜택 알아보기
      </p>
      <h4 className="text-2xl font-bold box-border caret-transparent tracking-[-0.8px] leading-[30px] mt-9 md:text-4xl md:tracking-[-1.2px] md:leading-[45px] md:mt-[54px]">
        네이버에서 쇼핑할 때마다{" "}
        <br className="text-2xl box-border caret-transparent tracking-[-0.8px] leading-[30px] md:text-4xl md:tracking-[-1.2px] md:leading-[45px]" />
        멤버십 회원은{" "}
        <br className="text-2xl box-border caret-transparent tracking-[-0.8px] leading-[30px] md:text-4xl md:tracking-[-1.2px] md:leading-[45px]" />
        <em className="text-3xl font-black box-border caret-transparent block tracking-[-0.8px] leading-10 md:text-[45px] md:tracking-[-1.2px] md:leading-[60px]">
          최대 12% 적립
        </em>
      </h4>
      <p className="text-stone-500 text-[15px] font-medium box-border caret-transparent tracking-[-0.8px] leading-[17px] mt-3 md:text-[23px] md:tracking-[-1.2px] md:leading-[25px] md:mt-[18px]">
        카드 최대 7% + 멤버십 최대 5%
      </p>
      <BenefitTable />
      
      <p className="text-stone-500 text-[13px] font-medium box-border caret-transparent tracking-[-0.3px] leading-[18px] mt-14 md:text-xl md:tracking-[-0.45px] md:leading-[27px] md:mt-[84px]">
        <em className="relative text-[13px] font-semibold box-border caret-transparent tracking-[-0.3px] leading-[18px] md:text-xl md:tracking-[-0.45px] md:leading-[27px] before:accent-auto before:bg-neutral-700 before:caret-transparent before:text-stone-500 before:block before:text-[13px] before:not-italic before:normal-nums before:font-semibold before:h-0.5 before:tracking-[-0.3px] before:leading-[18px] before:list-outside before:list-disc before:pointer-events-auto before:absolute before:text-center before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:-left-1.5 before:top-1.5 before:font-nanumsquareneo before:md:text-xl before:md:h-[3px] before:md:left-[-9px] before:md:tracking-[-0.45px] before:md:leading-[27px] before:md:w-[3px] before:md:top-[9px]">
          네이버플러스 멤버십 적립대상이용금액 기준
        </em>
        <br className="text-[13px] box-border caret-transparent tracking-[-0.3px] leading-[18px] md:text-xl md:tracking-[-0.45px] md:leading-[27px]" />
        28만 5천원까지 카드 7% 적립, 20만원까지 멤버십 5% 적립
        <br className="text-[13px] box-border caret-transparent tracking-[-0.3px] leading-[18px] md:text-xl md:tracking-[-0.45px] md:leading-[27px]" />
        * 멤버십 5% 적립은 네이버가 제공하는 혜택으로 제휴사 사정에 따라 혜택
        변동 가능
      </p>
    </div>
  );
};
