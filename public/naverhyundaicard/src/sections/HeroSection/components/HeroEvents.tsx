import { EventItem } from "@/sections/HeroSection/components/EventItem";

export const HeroEvents = () => {
  return (
    <div className="bg-black box-border caret-transparent tracking-[-0.8px] md:tracking-[-1.2px]">
      <div className="box-border caret-transparent tracking-[-0.8px] max-w-[540px] mx-auto px-5 py-[55px] md:tracking-[-1.2px] md:max-w-[750px] md:px-0 md:py-20">
        <div className="box-border caret-transparent tracking-[-0.8px] md:tracking-[-1.2px]">
          <strong className="text-lime-400 text-3xl font-black box-border caret-transparent block tracking-[-1.9px] leading-10 md:text-[45px] md:leading-[normal]">
            3월 특별 이벤트
          </strong>
          <p className="text-white text-base font-medium box-border caret-transparent tracking-[-0.8px] leading-[26px] mt-2.5 md:text-[23px] md:leading-9 md:mt-5">
            최근 6개월 내 모든 현대카드 결제 이력이 없다면
            <br className="text-base box-border caret-transparent leading-[26px] md:text-[23px] md:leading-9" />
          </p>
          <ul className="box-border caret-transparent tracking-[-0.8px] list-none mt-[30px] pl-0 md:tracking-[-1.2px] md:mt-12">
            <EventItem
              eventNumber="EVENT 01"
              description={
                <>
                  네이버 플러스 멤버십
                  <em className="text-orange-500 text-lg box-border caret-transparent block leading-[23px] mt-0.5 md:text-[27px] md:leading-[33px]">
                    연간이용권 + 15만 포인트
                  </em>
                </>
              }
            />
          </ul>
        </div>
        <a
          href="#"
          className="text-white text-xl font-bold box-border caret-transparent block tracking-[-1px] leading-[58px] text-center mt-8 md:text-3xl md:leading-[87px] md:mt-12 after:accent-auto after:caret-transparent after:text-white after:inline-block after:ml-2 after:font-bold after:content-['>']"
        >
          네이버 현대카드 자세히보기
        </a>
        <div className="box-border caret-transparent tracking-[-0.8px] mt-10 md:tracking-[-1.2px] md:mt-[65px]">
          <strong className="text-lime-400 text-3xl font-black box-border caret-transparent block tracking-[-1.9px] leading-10 md:text-[45px] md:leading-[normal]">
            3월 즉시 할인 이벤트
          </strong>
          <p className="text-white text-base font-medium box-border caret-transparent tracking-[-0.8px] leading-[26px] mt-2.5 md:text-[23px] md:leading-9 md:mt-5">
            네이버 현대카드 Ed2 이용 중이라면{" "}
            <br className="text-base box-border caret-transparent leading-[26px] md:text-[23px] md:leading-9" />
            네이버플러스 스토어에서만 누리는 즉시 할인 찬스
          </p>
          <ul className="box-border caret-transparent tracking-[-0.8px] list-none mt-[30px] pl-0 md:tracking-[-1.2px] md:mt-12">
            <EventItem
              eventNumber="EVENT 02"
              subTitle="네이버 플러스 스토어 일부 상품"
              description={
                <>
                  가전/가구 등<br />
                  <em className="text-orange-500 text-lg box-border caret-transparent block leading-[23px] mt-0.5 md:text-[27px] md:leading-[33px]">
                    최대 20만원 즉시 할인
                  </em>
                </>
              }
            />
            <EventItem
              eventNumber="EVENT 03"
              liExtraClass="mt-2.5"
              subTitle="멤버십 바우처 제휴 브랜드"
              description={
                <>
                  펫/육아용품
                  <br className="text-lg box-border caret-transparent leading-[23px] md:text-[27px] md:leading-[33px]" />
                  <em className="text-orange-500 text-lg box-border caret-transparent block leading-[23px] mt-0.5 md:text-[27px] md:leading-[33px]">
                    5% 즉시 할인
                  </em>
                </>
              }
            />
          </ul>
        </div>
      </div>
    </div>
  );
};
