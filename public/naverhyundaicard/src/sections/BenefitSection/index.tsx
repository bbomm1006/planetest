import { BenefitContent } from "@/sections/BenefitSection/components/BenefitContent";
import { AccordionDisclaimer } from "@/components/AccordionDisclaimer";

export const BenefitSection = () => {
  return (
    <section className="bg-lime-400 box-border caret-transparent tracking-[-0.8px] md:tracking-[-1.2px]">
      <div className="box-border caret-transparent tracking-[-0.8px] text-center md:tracking-[-1.2px]">
        <BenefitContent />
      </div>
      <AccordionDisclaimer
        outerVariantClass="bg-lime-400"
        innerContentClass="before:bg-lime-500"
        buttonClass="text-neutral-700 after:bg-[position:-1427px_-489px] after:text-neutral-700 after:h-2 after:tracking-[-0.45px] after:leading-[18px] after:md:bg-[position:-1473px_-444px]"
        buttonText="유의 사항"
      >
        <>
          <strong className="text-zinc-700 text-xs font-bold box-border caret-transparent block tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]">
            네이버 현대카드 Edition2 최대 7% 네이버페이 포인트 적립
          </strong>
          <ul className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] list-none mt-1.5 pl-0 md:text-lg md:tracking-[-0.3px] md:leading-[29px]">
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              전월 이용 금액 50만원 이상 시 혜택 제공
            </li>
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              네이버플러스 멤버십 회원이 네이버플러스 멤버십 적립 대상* 결제 시
              7% 네이버페이 포인트 적립
            </li>
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              네이버플러스 멤버십 비회원이 네이버플러스 멤버십 적립 대상* 결제
              시 0.7% 네이버페이 포인트 적립
            </li>
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:hidden before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              *네이버플러스 멤버십 회원/비회원의 적립 한도는 월2만/2천
              네이버페이 포인트
            </li>
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:hidden before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              *네이버플러스 멤버십 적립 대상이란, 네이버를 통해 네이버페이로
              결제한 상품·서비스 중 결제하기 페이지에 네이버플러스 멤버십 적립
              대상 아이콘이 있는 주문 건을 말함
            </li>
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              결제하기 페이지에 네이버플러스 멤버십 적립 대상 아이콘이 있어도
              현금성 유가증권(상품권, 기프티콘, 외식상품권 등), 선불 카드 충전
              금액은 적립 제외
            </li>
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              네이버플러스 멤버십 해지 시, 해지일 기준 다음 날 승인 건부터는
              네이버플러스 멤버십 적립 대상 상품 구매 시에도 0.7% 적립
            </li>
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              네이버 현대카드 Edition2 발급한 네이버 계정으로 적립(이후 다른
              계정으로 적립 불가)
            </li>
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              매달 1일~말일 이용 대금에 대한 네이버페이 포인트는 다음 달 15일에
              적립(비영업일인 경우 다음 영업일에 제공)
            </li>
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              네이버플러스 멤버십 MY페이지, 스마트스토어, 주문서 등에 노출되는
              예상 적립금은 반영에 1일 이상 소요될 수 있으며, 자세한 금액은
              현대카드에서 확인
            </li>
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              카드 적립 내역 상세 페이지에 보여지는 예상 적립금 및 결제 내역에
              취소된 내역은 업데이트되지 않으며, 자세한 내용은 현대카드에서 확인
            </li>
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              현대카드의 모든 할인 및 무이자 할부 이용 금액은 적립 혜택 제외
            </li>
          </ul>
          <strong className="text-zinc-700 text-xs font-bold box-border caret-transparent block tracking-[-0.2px] leading-[19px] mt-5 md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-[34px]">
            네이버플러스 멤버십 최대 5% 네이버페이 포인트 적립
          </strong>
          <ul className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] list-none mt-1.5 pl-0 md:text-lg md:tracking-[-0.3px] md:leading-[29px]">
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              네이버플러스 적립 대상 아이콘{" "}
              
              이 있는 상품에 한해 월 이용 금액 20만원까지 5% 적립, 300만원까지
              2% 적립
            </li>
            <li className="relative text-stone-500 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-stone-500 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              네이버플러스 멤버십은 네이버에서 운영하는 서비스로, 멤버십 적립
              혜택에 대한 자세한 내용은 네이버플러스 멤버십
              고객센터(1599-1399)로 문의
            </li>
          </ul>
        </>
      </AccordionDisclaimer>
    </section>
  );
};
