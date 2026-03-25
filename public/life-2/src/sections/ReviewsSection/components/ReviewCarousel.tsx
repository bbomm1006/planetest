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
          reviewerName="유○○"
          reviewerInfo="30대 / 여성 / 프리랜서"
          tags={["꼼꼼한 차량 관리", "시간 약속 준수", "친절한 응대", "가성비 좋음"]}
          title="차량 상태가 너무 좋아서 처음 받았을 때 기분이 좋았어요"
          body="처음에는 반신반의했는데 막상 차량을 받아보니 깜짝 놀랐어요. 구석구석 꼼꼼하게 관리되어 있어서 안심하고 이용할 수 있었습니다. 특히 시간 약속도 정확하게 지켜주셔서 믿음이 갔고, 가격 대비 퀄리티가 너무 좋아서 주변에도 추천하고 있습니다."
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/128.png"
          reviewerName="김○○"
          reviewerInfo="20대 / 남성 / 대학생"
          tags={["빠른 예약", "깔끔한 차량", "친절 안내", "편리한 이용"]}
          title="렌트카 이용했는데 기대 이상으로 만족합니다"
          body="앱으로 간편하게 예약할 수 있어서 좋았고, 담당자분이 진행 과정을 친절히 안내해주셔서 처음 이용했는데도 전혀 불편함이 없었어요. 차량 상태도 깔끔해서 기분 좋게 이용했습니다."
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/156.png"
          reviewerName="박○○"
          reviewerInfo="30대 / 남성 / 자영업"
          tags={["빠른 출고", "전문적인 차량 관리", "체계적인 진행", "신뢰감"]}
          title="업무용 차량 렌트했는데 전문가 느낌이 나네요"
          body="영업용 차량을 렌트했는데 속도도 빠르고 체계적으로 진행해주셔서 업무에 전혀 지장이 없었습니다. 손이 잘 닿지 않는 부분까지 꼼꼼히 관리해주셔서 다음에도 꼭 이용할 예정입니다."
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/133.png"
          reviewerName="최○○"
          reviewerInfo="40대 / 여성 / 주부"
          tags={["세심한 관리", "합리적 가격", "전문 장비", "깔끔한 차량"]}
          title="차량 상태가 특히 만족스러웠고 전체적으로 깨끗했어요"
          body="차량 내부 청결이 걱정되었는데 전문 장비로 말끔하게 관리해주셨습니다. 일반 렌트카에서는 볼 수 없는 세심한 서비스 덕분에 감동했습니다. 가격도 합리적이라 부담 없이 이용했습니다."
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/124.png"
          reviewerName="정○○"
          reviewerInfo="20대 / 여성 / 직장인"
          tags={["친절 상담", "빠른 진행", "정확한 시간", "깔끔한 차량"]}
          title="처음 이용했는데 응대도 좋고 결과도 만족스러워요"
          body="렌트카 서비스를 처음 이용했는데 상담부터 차량 수령까지 친절하게 안내해주셔서 편하게 이용했습니다. 정해진 시간에 정확히 차량을 받을 수 있었고, 상태도 깔끔해서 다음에도 꼭 이용할 것 같아요."
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/145.png"
          reviewerName="이○○"
          reviewerInfo="50대 / 남성 / 개인사업자"
          tags={["체계적인 서비스", "믿을 수 있는 업체", "확실한 관리", "높은 만족도"]}
          title="다음에도 재이용할 생각입니다. 믿고 맡길 수 있네요"
          body="여러 렌트카 업체를 이용해봤는데 이렇게 체계적으로 운영하는 곳은 처음이에요. 진행 상황도 꼼꼼히 알려주고 결과물도 확실해서 신뢰가 생겼습니다. 바쁜 사업 특성상 빠르고 정확한 서비스가 필요했는데 딱 맞게 해주셔서 정말 만족합니다."
          cardWidth={cardW}
          cardGap={cardGap}
        />
      </div>
    </div>
  );
};
