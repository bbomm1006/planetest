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
          tags={["꼼꼼한 청소", "시간 약속 준수", "친절한 응대", "가성비 좋음"]}
          title="집 상태가 너무 깔끔해져서 처음 들어왔을 때 기분이 정말 좋았어요"
          body="처음에는 반신반의했는데 막상 결과를 보고 깜짝 놀랐어요. 구석구석 정말 꼼꼼하게 청소해주셔서 집이 새것처럼 바뀌었습니다. 특히 시간 약속도 칼같이 지켜주셔서 믿음이 갔어요. 가격 대비 퀄리티가 너무 좋아서 주변에도 추천하고 있습니다."
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/128.png"
          reviewerName="김○○"
          reviewerInfo="20대 / 남성 / 대학생"
          tags={["빠른 예약", "깔끔한 마무리", "친절한 안내", "편한 진행"]}
          title="자취방 맡겼는데 기대 이상으로 깨끗해져서 만족합니다"
          body="예약도 앱으로 간편하게 할 수 있어서 좋았고, 담당자분이 진행 과정을 친절하게 안내해주셔서 처음 이용했는데도 전혀 불편함이 없었어요. 자취방이라 좁고 어수선했는데 끝나고 나서 보니 진짜 깨끗해져서 기분이 좋았습니다."
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/156.png"
          reviewerName="박○○"
          reviewerInfo="30대 / 남성 / 자영업"
          tags={["빠른 작업", "전문적인 청소", "체계적인 진행", "신뢰감"]}
          title="가게 청소 맡겼는데 확실히 전문가 느낌이 나네요"
          body="영업 전 가게 청소를 맡겼는데 작업 속도도 빠르고 체계적으로 진행해주셔서 영업 준비에 전혀 지장이 없었습니다. 일반 청소업체랑은 확실히 다른 전문성이 느껴졌고, 손이 잘 안 닿는 곳까지 꼼꼼하게 해주셔서 다음에도 꼭 이용할 예정입니다."
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/133.png"
          reviewerName="최○○"
          reviewerInfo="40대 / 여성 / 주부"
          tags={["꼼꼼한 디테일", "합리적인 가격", "전문 장비", "깔끔한 결과"]}
          title="주방이 특히 만족스러웠고 전체적으로 정말 깨끗해졌어요"
          body="주방 기름때가 너무 심해서 걱정했는데 전문 장비로 말끔하게 제거해주셨어요. 일반 청소로는 절대 안 될 것 같았던 부분들도 다 깨끗하게 해주셔서 정말 감동받았습니다. 가격도 다른 곳에 비해 합리적이라 부담 없이 이용할 수 있었어요."
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/124.png"
          reviewerName="정○○"
          reviewerInfo="20대 / 여성 / 직장인"
          tags={["친절한 상담", "빠른 진행", "정확한 시간", "깔끔한 마무리"]}
          title="처음 맡겨봤는데 응대도 좋고 결과도 만족입니다"
          body="청소 서비스를 처음 이용해봐서 많이 낯설었는데 상담부터 마무리까지 친절하게 안내해주셔서 편하게 진행할 수 있었어요. 정해진 시간에 정확히 오셔서 믿음이 갔고, 마무리도 깔끔하게 해주셔서 다음에도 꼭 이용할 것 같아요."
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/145.png"
          reviewerName="이○○"
          reviewerInfo="50대 / 남성 / 개인사업자"
          tags={["체계적인 서비스", "믿을 수 있는 업체", "확실한 결과", "만족도 높음"]}
          title="다음에도 재이용할 생각입니다. 믿고 맡길 수 있네요"
          body="여러 청소 업체를 써봤는데 이렇게 체계적으로 운영하는 곳은 처음이었어요. 진행 상황을 중간중간 알려주시고 결과물도 확실해서 신뢰가 생겼습니다. 바쁜 사업장 특성상 빠르고 정확한 서비스가 필요했는데 딱 맞게 해주셔서 정말 만족합니다."
          cardWidth={cardW}
          cardGap={cardGap}
        />
      </div>
    </div>
  );
};
