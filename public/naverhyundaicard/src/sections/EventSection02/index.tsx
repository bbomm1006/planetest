import { EventSectionContent } from "@/components/EventSectionContent";
import { EventSectionDisclaimer } from "@/components/EventSectionDisclaimer";

export const EventSection02 = () => {
  return (
    <section className="bg-black box-border caret-transparent tracking-[-0.8px] md:tracking-[-1.2px]">
      <div className="box-border caret-transparent tracking-[-0.8px] text-center md:tracking-[-1.2px]">
        <EventSectionContent
          spanClassName="bg-orange-500"
          eventNumber="EVENT 02"
          descriptionClassName="text-white text-[22px] leading-[30px] md:text-[33px] md:leading-[45px] md:mt-6"
          descriptionIconClassName="text-[22px] h-[22px] w-[111px] bg-[position:-1392px_-363px] mr-[5px] md:text-[33px] md:h-8 md:w-[162px] md:bg-[position:-1261px_-465px]"
          descriptionContent="에서 쇼핑할 때"
          headingClassName="mt-1 -mx-2.5 md:mx-0"
          headingContent={
            <>
              <em className="text-lime-400 text-3xl box-border caret-transparent tracking-[-1.9px] leading-10 break-words break-keep md:text-[45px] md:tracking-[-2.85px] md:leading-[60px]">
                최대 12% 즉시할인
              </em>
              <span className="text-white text-sm font-bold box-border caret-transparent block tracking-[-1.2px] leading-[22px] break-words break-keep mt-1.5 md:text-xl md:leading-[33px]">
                가구/가전/패션 카테고리 일부 상품 한정
              </span>
            </>
          }
          desktopImageSrc="https://c.animaapp.com/mn5bxx3lWy8QQl/assets/event07.png"
          desktopImageAlt="12개월"
          mobileImageSrc="https://c.animaapp.com/mn5bxx3lWy8QQl/assets/mo_event07.png"
          mobileImageAlt="12개월"
        />
      </div>
      <EventSectionDisclaimer
        items={[
          "기간 : 2026.03.01 ~ 2026.03.31",
          "대상 카드 : 네이버페이에 등록된 네이버 현대카드, 네이버 현대카드 Edition2",
          "대상 : 대상 카드 보유 회원",
          "혜택 : 최대 12% 즉시 할인(1일 1회, 최대 20만원)",
          <>
            조건 : 기간 내 대상 카드로 네이버 쇼핑 내 대상 상품 10만원 이상 결제
            시
            <br className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]" />
            - 가전, 자동차/오토바이, 조명/인테리어, 반려동물용품, 화장품/미용
            카테고리 상품 한정
            <br className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]" />
            - 카테고리별로 즉시 할인율 상이 (최대 12% 즉시할인은 가전 카테고리
            기준)
            <br className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]" />
            - 즉시할인 대상 상품일 경우, 결제창 내 &#39;카드사 결제할인&#39;
            에서 &#39;네이버 현대카드&#39; 할인 선택 가능 (대상 상품이 아닐
            경우, 선택 화면이 보이지 않음)
          </>,
          "혜택 제공일 : 결제창 내 &#39;카드사 결제 할인&#39;에서 &#39;네이버 현대카드&#39; 할인 선택 후 즉시 적용",
          "EVENT 항목별 상세 및 공통 유의사항은 하단 &#39;꼭 알아두세요&#39; 확인",
        ]}
      />
    </section>
  );
};
