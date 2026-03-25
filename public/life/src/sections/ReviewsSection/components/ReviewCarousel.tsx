import { useRef, useState, useEffect, useCallback } from "react";
import { ReviewCard } from "@/sections/ReviewsSection/components/ReviewCard";

const CARD_WIDTH_MOBILE = 300;
const CARD_GAP_MOBILE = 14;
const CARD_WIDTH_DESKTOP = 380;
const CARD_GAP_DESKTOP = 20;

type Props = {
  activeIndex: number;
  onIndexChange: (i: number) => void;
  total: number;
};

export const ReviewCarousel = ({ activeIndex, onIndexChange, total }: Props) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef(0);
  const dragDelta = useRef(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const cardW = isDesktop ? CARD_WIDTH_DESKTOP : CARD_WIDTH_MOBILE;
  const cardGap = isDesktop ? CARD_GAP_DESKTOP : CARD_GAP_MOBILE;
  const offsetPx = isDesktop ? 60 : 17;
  const baseTranslate = -(activeIndex * (cardW + cardGap)) + offsetPx;
  const translateX = baseTranslate + dragOffset;

  const clamp = (v: number) => Math.max(0, Math.min(total - 1, v));

  // ─── Pointer (mouse / stylus) ───────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragDelta.current = 0;
    setDragOffset(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX.current;
    dragDelta.current = delta;
    setDragOffset(delta);
  };

  const commitDrag = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragOffset(0);
    const threshold = cardW * 0.2;
    if (dragDelta.current < -threshold) onIndexChange(clamp(activeIndex + 1));
    else if (dragDelta.current > threshold) onIndexChange(clamp(activeIndex - 1));
    dragDelta.current = 0;
  }, [isDragging, cardW, activeIndex, onIndexChange, total]);

  const onPointerUp = commitDrag;
  const onPointerCancel = useCallback(() => {
    setIsDragging(false);
    setDragOffset(0);
    dragDelta.current = 0;
  }, []);

  // ─── Touch (mobile finger swipe) ───────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragDelta.current = 0;
    setDragOffset(0);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - dragStartX.current;
    // only prevent horizontal scroll hijacking; allow vertical page scroll
    if (Math.abs(delta) > 8) e.preventDefault();
    dragDelta.current = delta;
    setDragOffset(delta);
  };

  const onTouchEnd = commitDrag;

  return (
    <div className="overflow-hidden w-full caret-transparent cursor-grab active:cursor-grabbing select-none">
      <div
        ref={trackRef}
        className="flex caret-transparent"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 300ms ease-out",
          touchAction: "pan-y",
          willChange: "transform",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/138.png"
          reviewerName="오○○"
          reviewerInfo="30대 / 여성 / 프리랜서"
          tags={["정확한 초정밀 진단", "변호사의 유연한 대응", "빠른 고객대응", "높은 탕감률"]}
          title="다른 사무실들은 불가능하다고 했는데 똑생은 약속한 6만원대로 받아냈어요"
          body={<>실제 신청 전에 예상 월 변제금 조회가 가능하고 분납 회차도 길어서 부담이 적습니다.<br /><br />그리고 월 변제금도 6만 원대로 예상하고 진행해 주셨는데 실제로 6만 원으로 인가받았고 높은 탕감률로 진행되었습니다.<br /><br />중간에 보정서 제출이 몇 번 있었고 3개월 이상의 시간이 걸려서 이게 제대로 진행되는 게 맞나 걱정했습니다만, 확실히 변호사님들이 대응을 잘해주셔서 제출 서류들을 준비하는 귀찮음은 있지만 개시 결과를 받은 지금은 만족합니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/128.png"
          reviewerName="정○○"
          reviewerInfo="20대 / 여성 / 직장인"
          tags={["시간에 구애받지 않는 온라인 접수", "깔끔한 일처리", "친절한 안내", "변호사의 꼼꼼함"]}
          title="비대면인데도 이렇게 물심양면인 변호사님들은 못 찾으실 겁니다"
          body={<>어린 나이에 판단력이 흐려져 순간의 입발린 소리를 이겨내지 못하고 계속해서 갚고 막으려고 해 봤지만, 결국 큰 빚을 지게 되었는데, 가족들에게도 도움을 청하거나 말을 하지 못하고 끙끙대고 있던 찰나, 회생과 판산이라는 제도를 알게 되고 전문 변호사 사무실에 찾아가는 것이 너무나 부담스러웠는데, 비대면으로 개인회생 진행을 도와주시는 똑생 변호사님들을 알게 되고 고민하다 신청했습니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/156.png"
          reviewerName="문○○"
          reviewerInfo="30대 / 남성 / 직장인"
          tags={["빠른 피드백", "책임감 있는 변호사", "쉽고 간편한 자료안내", "1:1 맞춤 진행"]}
          title="간편하게 자료 확보하는 법부터 다르다는 생각이 들었어요"
          body={<>2월 말에 수임신청 드려서 드디어 4개월 만에 개시결정까지 나왔습니다.<br /><br />처음에 뭘 어떻게 해야 할지 몰라 당황했을 때 간편하게 자료 확보하는 법부터 다르다는 생각이 들었어요.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/133.png"
          reviewerName="맹○○"
          reviewerInfo="40대 / 여성 / 직장인"
          tags={["예상 탕감액 서비스", "합리적인 수임료", "변호사 상담", "웹을 통한 비대면 서류 제출"]}
          title="똑생은 보완이 필요하면 바로 알려주고 부족한 부분을 딱 짚어주는 게 좋았어요"
          body={<>저는 3월 21일 날 똑생에 개인회생을 신청해 6월 3일 날 개시 결정을 받았습니다. 두 달가량 걸렸네요.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/124.png"
          reviewerName="윤○○"
          reviewerInfo="20대 / 남성 / 직장인"
          tags={["빠른 개시결정", "친절한 상담", "상세한 서류제출 안내", "높은 탕감률"]}
          title="전화 상담을 많이 하였는데 그때마다 항상 친절하게 응해주셨습니다"
          body={<>적은 월급이라 다소 힘든 케이스일 수도 있었는데 의뢰 맡아주셔서 감사하게 생각하고 있습니다.<br /><br />처음에는 조금 믿어도 될까 불안하였는데 금지결정도 문제없이 빨리 나와 독촉전화등 추심이 빠르게 멈추어져 정말 한시름 놓았습니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/145.png"
          reviewerName="이○○"
          reviewerInfo="40대 / 여성 / 직장인 및 개인사업자"
          tags={["체계적인 자동화 시스템", "부담없는 수임료", "빠른 개시결정", "높은 탕감률"]}
          title={<>비대면에 대한 불안이 무색하게<br />오히려 더 빠르게 개시결정이 났습니다</>}
          body={<>개인회생을 준비하면서 정말 많이 알아본 거 같습니다. 알아볼수록 그 많고 복잡한 서류를 혼자 준비한다는 게 엄두가 나질 않았습니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/189.png"
          reviewerName="고○○"
          reviewerInfo="20대 / 여성 / 직장인"
          tags={["AI를 통한 정확한 결과 도출", "적은 수임료 부담", "체계적 진행", "빠르고 정확한 피드백"]}
          title="똑생만큼 전문적이고 ai를 쓰는 사무실이 없습니다"
          body={<>처음엔 정말 막막했습니다. 다른 변호사사무실 상담을 받아봤지만 마음 한구석엔 늘 찝찝한 마음만 있었고요.<br /><br />근데 똑생을 알아보고 상담받으니 방문하지 않아도 진행이 가능한 점 매달 납부로 금액부담이 적고 무엇보다 체계적으로 진행하는 점이 가장 맘에 들었습니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/126.png"
          reviewerName="노○○"
          reviewerInfo="20대 / 여성 / 직장인"
          tags={["성실한 직원응대", "상세한 서류제출 안내", "개인별 최적화 계획안", "확실한 업무진행"]}
          title="생각했던 결과보다 더 좋게 나와서 앞으로도 잊지 못할 거 같애요ㅠㅠ"
          body={<>처음에 불안하고 독촉되는 문자들 보면서 마음 졸이면서 고정적인 월급에 하루 가지나 가도 초조하는 생활이 반복이었는데 우연찮게 광고를 보고 문의드렸다가 믿어도 되나... 싶었는데 비대면으로 진행되는 것도 너무 좋았습니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/168.png"
          reviewerName="김○○"
          reviewerInfo="20대 / 남성 / 직장인"
          tags={["빠르고 자세한 안내", "쉬운 서류 안내", "불리한 상황 해결", "비대면 변호사 선임"]}
          title="궁금한 점이 너무나 많았는데 그때마다 너무나 친절하게 알려주셔서 감사했습니다"
          body={<>코인, 주식 등 무리한 투자로 인해 큰 빛을 부담하게 되어 살아가기 너무나 힘들었을 때 개인회생 제도를 알게 되어 인터넷 검색을 하던 중 직접 방문하지 않아도 상담도 받을 수 있고 변호사님 선임도 할 수 있는 똑생을 알게 되어 진행하게 되었습니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/181.png"
          reviewerName="문○○"
          reviewerInfo="40대 / 남성 / 직장인"
          tags={["편리한 비대면", "장기 분할납부", "빠른 금지명령", "빠른 답변"]}
          title="직장인이어서 통화가 힘들었는데 메신저만으로도 가능해서 마음에 들었습니다~~"
          body="저는 개인회생은 절대 생각하지 않고 있던 사람이었습니다~~ 어머니의 사업자금을 빌려드리며 이미 큰 대출을 받고 대출이자와 모자란 생활비에 다시 다른 대출~~ 이렇게 하다 보니 저도 모르게 많은 대출과 현금서비스 카드값에 괴로운 나날을 보내고 있었습니다~~"
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/177.png"
          reviewerName="이○○"
          reviewerInfo="30대 / 남성 / 직장인"
          tags={["도움되는 수임료 장기 분납", "만족스러운 탕감률", "지속적인 피드백", "빠른 인가결정"]}
          title="이곳저곳 카페도 알아보고, 경험자 리뷰들도 읽어봤을 때, 어떤 사무실은..."
          body={<>이곳저곳 카페도 알아보고, 경험자 리뷰들도 읽어봤을 때, 어떤 사무실은 나중에 뭐가 안된다 뭐가 잘 처리가 안된다는 스트레스를 주는 글들이 많았습니다.<br /><br />사실 대면으로 진행되는 것이 아니라 조금 망설여지기는 했지만, 제가 변제하려는 금액과 의지가 있다면 똑생은 정말 최고의 선택이 아닌가 싶습니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/162.png"
          reviewerName="정○○"
          reviewerInfo="20대 / 여성 / 직장인"
          tags={["비대면 상담", "친절한 응대", "부담없는 월 분납", "높은 탕감률"]}
          title={<>탕감율이 높아서<br />똑생에서 하길 잘했다고 생각했습니다</>}
          body={<>친절하게 상담해 주시고 빠르게 개시결정받을 수 있게 도와주셔서 감사드립니다. 카톡 상담이 가능해서 업무에 방해되지 않고 간편하게 절차를 진행할 수 있었습니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/172.png"
          reviewerName="염○○"
          reviewerInfo="20대 / 남성 / 직장인"
          tags={["다양한 변제계획", "빠른 피드백", "명확하고 상세한 안내", "빠른 금지명령 및 개시결정"]}
          title={<>상세하게 알려주셔서<br />그대로 진행했을 뿐인데 개인회생이 되었습니다</>}
          body={<>생활비 및 기타 비용으로 인한 과도한 채무증가로 생활이 너무 힘들어 여려 방면을 알아보았으나 해결되지 않아 고민이 많았던 와중에 똑생이란 개인회생 진행을 해주는 사이트를 확인하게 되었습니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/161.png"
          reviewerName="정○○"
          reviewerInfo="20대 / 여성 / 직장인"
          tags={["체계적으로 정리된 자료", "빠른 추심금지 명령", "친절한 서류안내", "저렴한 수임료"]}
          title="솔직히 가능하다고 말씀해주셨지만 정말 다 통과가 될지 의문이었습니다"
          body={<>변호사 수임료도 한 번에 지불하기 어려운 막막한 상황이던 차에 똑생 광고를 보게 되어 여기까지 왔습니다.<br /><br />월 19만 원이라는 지금 상황에서 부담적은 금액으로 개시 결정까지 도와주셔서 감사합니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/182.png"
          reviewerName="조○○"
          reviewerInfo="20대 / 남성 / 일용직"
          tags={["다양한 채무 탕감", "빠른 개시결정", "친절한 응대", "꼼꼼하고 빠른 업무진행"]}
          title="꼼꼼하게 빠르게 빈틈없이 체크해 주시는 똑생에서 꼭 진행하시길 추천드려요"
          body={<>오랫동안 가지고 있었던 고금리 대출과 카드빚 그리고 할부요금 휴대폰요금 다 원금 탕감도 해주시고 짧은 변제기간 변제계획으로 신청부터 개시결정까지 얼마 걸리지 않고 금방 좋은 결과가 나왔어요.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/152.png"
          reviewerName="양○○"
          reviewerInfo="30대 / 남성 / 직장인"
          tags={["변제액 미리 확인", "편리한 채팅상담", "상세한 준비안내", "변제율 최적화 제안"]}
          title="실제로 내가 어떻게 진행되고 탕감되는지 직접 예상해 볼 수 있는 서비스를 제공하는 곳은 똑생이 유일했다"
          body={<>사실 개인회생이 좋은 마음으로 신청하는 것이 아니라 부담스럽고 창피한 마음이 든다.<br /><br />그래도 실제로 내가 어떻게 진행을 하게 되고 얼마나 탕감되는지 직접 예상해 볼 수 있는 서비스를 제공하는 곳은 똑생이 유일했다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/158.png"
          reviewerName="박○○"
          reviewerInfo="30대 / 여성 / 직장인"
          tags={["합리적인 수임료", "빠른 진행", "친절한 응대", "빠른 인가결정"]}
          title="비싼 수임료인데도 상담연락도 안되는 지인에게 알려드렸으면 좋았겠다고 생각했어요"
          body={<>너무나 갑작스럽게 벌어진 일이라 혼자 어떻게 해야 할지 고민도 많고 너무너무 힘든 시간을 보내고 있었는데 여기저기 상담도 많이 받아보았지만 제입장에서는 너무 부담스러운 수임료로 걱정을 하고 있었던 찰나에 알고리즘 덕분인지 똑생사이트를 방문하게 되었습니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/184.png"
          reviewerName="조○○"
          reviewerInfo="30대 / 남성 / 직장인"
          tags={["편리한 시스템", "만족스러운 비용", "친절한 안내", "높은 탕감률"]}
          title="탕감률 변제금 다 너무 잘 나와서 너무 감사합니다!!"
          body={<>빚이 쌓여가면서 점점 생활이 힘들어지고 스트레스도 너무 많이 받아서 몸도 마음도 너무 지쳐가는 상황이었습니다.<br /><br />그러다가 개인회생을 알게 되어서 여기저기 알아보다 똑생을 찾게 되었습니다.</>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          variant="cta"
          ctaText="다른 후기들도 많아요!"
          ctaLinkHref="/reviews"
          ctaButtonText="후기 모두 보기"
          cardWidth={cardW}
          cardGap={cardGap}
        />
      </div>
    </div>
  );
};
