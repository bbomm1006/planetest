import { EventSectionContent } from "@/components/EventSectionContent";
import { EventSectionDisclaimer } from "@/components/EventSectionDisclaimer";
import { AccordionDisclaimer } from "@/components/AccordionDisclaimer";

export const EventSection03 = () => {
  return (
    <section className="bg-black box-border caret-transparent tracking-[-0.8px] md:tracking-[-1.2px]">
      <div className="box-border caret-transparent tracking-[-0.8px] text-center md:tracking-[-1.2px]">
        <EventSectionContent
          spanClassName="bg-orange-500"
          eventNumber="EVENT 03"
          descriptionClassName="text-white text-[22px] leading-[30px] md:text-[33px] md:mt-6"
          descriptionContent="펫/육아용품 쇼핑할 때"
          headingClassName="mt-1 -mx-2.5 md:mx-0"
          headingContent={
            <>
              <em className="text-lime-400 text-3xl box-border caret-transparent tracking-[-1.9px] leading-10 break-words break-keep md:text-[45px] md:tracking-[-2.85px] md:leading-[60px]">
                5%
              </em>
              {" 즉시할인"}
              <span className="text-white text-sm font-bold box-border caret-transparent block tracking-[-1.2px] leading-[22px] break-words break-keep mt-1.5 md:text-xl md:leading-[33px]">
                (펫/베이비 바우처 제휴 브랜드 대상)
              </span>
            </>
          }
          desktopImageSrc="https://c.animaapp.com/mn5bxx3lWy8QQl/assets/event08_v2.png"
          desktopImageAlt="즉시 할인"
          mobileImageSrc="https://c.animaapp.com/mn5bxx3lWy8QQl/assets/mo_event08_v2.png"
          mobileImageAlt="즉시 할인"
        />
      </div>
      <EventSectionDisclaimer
        items={[
          "기간 : 2026.03.01 ~ 2026.03.31",
          "대상 카드 : 네이버페이에 등록된 네이버 현대카드, 네이버 현대카드 Edition2",
          "대상 : 대상 카드 보유 회원",
          "혜택 : 펫, 베이비 2만원 이상 결제 시 5% 즉시 할인 (결제 건당 최대 3만원 한도)",
          <>
            조건 : 기간 내 대상 카드로 네이버플러스 스토어 내 대상 상품 결제 시
            <br className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]" />
            - 펫 5% 즉시 할인 : 마이 멤버십 &gt; 펫 바우처 페이지에서 대상 상품
            확인 가능
            <br className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]" />
            - 베이비 5% 즉시 할인 : 마이 멤버십 &gt; 베이비 바우처 페이지에서
            대상 상품 확인 가능
          </>,
          "혜택 제공일 : 결제창 내 '카드사 결제할인'에서 '네이버 현대카드' 할인 선택 후 즉시 적용",
          "EVENT 항목별 상세 및 공통 유의사항은 하단 '꼭 알아두세요' 확인",
        ]}
      />
      <AccordionDisclaimer
        outerVariantClass="bg-neutral-800 border-t-zinc-700 border-t"
        innerContentClass="before:bg-zinc-700"
        buttonClass="text-white after:bg-[position:-1261px_-502px] after:bg-[position:-1448px_-444px] after:text-white after:h-[9px] after:-scale-100"
        buttonText="꼭 알아두세요"
      >
        <>
          <strong className="text-stone-300 text-xs font-bold box-border caret-transparent block tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]">
            EVENT 01. 네이버플러스 멤버십 연간 이용권 제공 + 15만 네이버페이
            포인트 적립
          </strong>
          <ul className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] list-none mt-1.5 pl-0 md:text-lg md:tracking-[-0.3px] md:leading-[29px]">
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              혜택은 네이버 현대카드 Edition2 본인 회원에 한해 최초 1회 제공
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              혜택을 받기 위한 최소 결제 금액은 기간 내 승인 건에 한하며, 본인
              명의 네이버 현대카드 Edition2의 누적 이용 금액(일시불 및 할부
              합산) 기준
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              네이버플러스 멤버십 적립 대상이란, 네이버를 통해 네이버페이로
              결제한 상품·서비스 중 결제하기 페이지에 네이버플러스 멤버십 적립
              대상 아이콘이 있는 주문 건을 말함
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              네이버플러스 멤버십 적립 대상 아이콘이 있어도 도서정가제 대상
              상품, 디지털 콘텐츠, e쿠폰 및 환금성 카테고리 상품은 이용 금액
              합산에서 제외
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              혜택 제공일 전 결제 취소로 이용 금액 미충족 시 혜택 제공 불가
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              이벤트 대상 및 적립 예정 포인트 금액은 상품 결제창에서 확인 불가
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              네이버플러스 멤버십 연간이용권은 네이버 톡톡으로 발송되는 안내에
              따라 등록 완료 시, 이용 중인 멤버십 기간이 끝나는 시점에 자동 적용
              <br className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]" />
              - 네이버플러스 멤버십 연간이용권 제공을 위해 혜택 제공 시점에
              멤버십 가입 유지 필수
            </li>
          </ul>
          <strong className="text-stone-300 text-xs font-bold box-border caret-transparent block tracking-[-0.2px] leading-[19px] mt-5 md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-[34px]">
            EVENT 02. 네이버플러스 스토어 쇼핑할 때 최대 12% 즉시할인
          </strong>
          <ul className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] list-none mt-1.5 pl-0 md:text-lg md:tracking-[-0.3px] md:leading-[29px]">
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              대상 카테고리 내 즉시 할인 적용 가능한 상품에 한하며, 결제창에서
              카드사 결제 할인 선택 후 네이버페이에 등록된 네이버 현대카드,
              네이버 현대카드 Edition2로 결제 시 혜택 적용(혜택 적용 가능 상품은
              상세페이지에서 확인 가능)
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              혜택을 받기 위한 최소 결제 금액은 10만원 이상 단일 결제 건
              기준(결제 금액 합산 불가)
              <br className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]" />
              - 할인, 포인트 등 혜택 적용 완료된 최종 결제 금액 기준
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              최소 결제 금액 10만원은 가전 카테고리 기준이며, 카테고리 상품별로
              금액 및 할인율이 다를 수 있음
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              결제 취소·환불 시 즉시 할인 한도가 자동 복원되며, 당일 재결제 시
              혜택 적용 가능(단, 취소 승인 문자메시지 수신 후 재결제 완료 건에
              한함)
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              이벤트 종료 후 결제 취소·환불하는 경우 즉시 할인 횟수는 복원되지
              않음
            </li>
          </ul>
          <strong className="text-stone-300 text-xs font-bold box-border caret-transparent block tracking-[-0.2px] leading-[19px] mt-5 md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-[34px]">
            EVENT 03. 펫/육아용품 쇼핑할 때 5% 즉시 할인
          </strong>
          <ul className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] list-none mt-1.5 pl-0 md:text-lg md:tracking-[-0.3px] md:leading-[29px]">
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              혜택은 ‘마이 멤버십 &gt; 펫/베이비 파우처 페이지’ 내 상품에
              한하며, 네이버페이에 등록된 네이버 현대카드, 네이버 현대카드
              Edition2로 결제 시 제공
            </li>
          </ul>
          <strong className="text-stone-300 text-xs font-bold box-border caret-transparent block tracking-[-0.2px] leading-[19px] mt-5 md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-[34px]">
            공통
          </strong>
          <ul className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] list-none mt-1.5 pl-0 md:text-lg md:tracking-[-0.3px] md:leading-[29px]">
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              EVENT 01, 02, 03는 중복 제공 가능
              <br className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]" />
              - EVENT 02과 EVENT 03 혜택은 한 결제 건에 중복 적용 불가
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              EVENT 01 혜택을 제공받은 달부터 13개월 내 대상 카드 해지 또는 탈회
              시 받은 혜택은 현금으로 청구되거나, 등록된 본인 명의 결제 계좌에서
              자동 출금될 수 있음(1 포인트=1원으로 환산)
              <br className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px]" />
              - 예시 : 2026년 4월에 혜택을 제공받은 후, 2027년 4월 30일 이전에
              대상 카드 해지 또는 탈회 시 제공받은 혜택 금액만큼 청구
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              혜택 제공월 포함 12개월 내 이벤트 채널에 관계 없이 현대카드의 다른
              이벤트 혜택(캐시백, 포인트, 할인 쿠폰 등)을 받은 이력이 있는 경우,
              조건을 충족하더라도 혜택 제외
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              이벤트 시작일 직전 6개월 동안의 결제 이력은 본인 명의의
              현대카드(대상 카드, 가족·체크·후불하이패스카드, 정기결제, 수수료
              결제 등 포함)의 모든 결제 건입니다.
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              혜택 제공 시점에 네이버 현대카드 Edition2 해지, 교체(재발급 등),
              정지(연체 등), 탈회 등의 경우 혜택 제공 불가 (카드 상태가 정상인
              경우에 한해 제공)
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              혜택 제공 일정은 네이버 또는 현대카드 사정에 따라 변경 또는 중단될
              수 있음
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              이벤트 일정 및 혜택은 현대카드 및 제휴사 사정에 따라 변경 또는
              조기 종료될 수 있음
            </li>
            <li className="relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]">
              자세한 내용은 현대카드 고객센터(1577-6000)로 문의
            </li>
          </ul>
        </>
      </AccordionDisclaimer>
    </section>
  );
};
