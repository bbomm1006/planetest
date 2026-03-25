import { EventSectionContent } from "@/components/EventSectionContent";
import { EventSectionDisclaimer } from "@/components/EventSectionDisclaimer";

export const EventSection01 = () => {
  return (
    <section className="bg-black box-border caret-transparent tracking-[-0.8px] md:tracking-[-1.2px]">
      <div className="box-border caret-transparent tracking-[-0.8px] text-center md:tracking-[-1.2px]">
        <EventSectionContent
          spanClassName="bg-lime-400"
          eventNumber="EVENT 01"
          descriptionClassName="text-neutral-400 text-lg leading-6 md:text-2xl md:leading-[34px] md:mt-7"
          descriptionIconClassName="text-lg h-[18px] w-16 bg-[position:-1438px_-667px] mr-0 md:h-[26px] md:w-[90px] md:bg-[position:-1344px_top] md:mr-1"
          descriptionContent={
            <>
              가맹점에서
              <br className="text-lg box-border caret-transparent tracking-[-0.8px] leading-6 md:text-2xl md:tracking-[-1.2px] md:leading-[34px]" />
              누적 20만원 이상 결제 시
            </>
          }
          headingClassName="mt-2 md:mt-3.5"
          headingContent={
            <>
              멤버십
              <em className="text-orange-500 text-3xl box-border caret-transparent tracking-[-1.9px] leading-10 break-words break-keep md:text-[45px] md:tracking-[-2.85px] md:leading-[60px]">
                연간 이용권{" "}
                <br className="text-3xl box-border caret-transparent tracking-[-1.9px] leading-10 break-words break-keep md:text-[45px] md:tracking-[-2.85px] md:leading-[60px]" />
                + 15만 포인트
              </em>
              드려요
            </>
          }
          desktopImageSrc="https://c.animaapp.com/mn5bxx3lWy8QQl/assets/event02.png"
          desktopImageAlt="7%"
          mobileImageSrc="https://c.animaapp.com/mn5bxx3lWy8QQl/assets/mo_event02.png"
          mobileImageAlt="7%"
        />
      </div>
      <EventSectionDisclaimer
        items={[
          "기간 : 2026.03.01 ~ 2026.03.31",
          "대상 카드 : 네이버 현대카드 Edition2",
          "대상 : 이벤트 시작일 직전 6개월간(2025.09.01 ~ 2026.02.28) 모든 현대카드 결제 이력이 없는 대상 카드 보유 회원",
          "혜택 : 네이버플러스 멤버십 연간 이용권(46,800원 상당) 제공 + 15만 네이버페이 포인트 적립",
          "조건 : 기간 내 네이버 현대카드 Ed2로 네이버플러스 멤버십 대상 가맹점에서 누적 20만원 이상 결제 시 혜택 제공",
          <>
            혜택 제공일
            <br className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]" />
            - 멤버십 연간이용권 : 다음 달 16일 멤버십 계정의 네이버 알림으로
            연간이용권 바우처 코드 안내
            <br className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]" />
            - 포인트 : 2026년 4월 중 본인 명의 네이버페이 계정으로 적립
            <br className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]" />
          </>,
          "EVENT 항목별 상세 및 공통 유의사항은 하단 '꼭 알아두세요' 확인",
        ]}
      />
    </section>
  );
};
