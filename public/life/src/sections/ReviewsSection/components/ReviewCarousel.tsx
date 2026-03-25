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
          body={<></>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/128.png"
          reviewerName="김○○"
          reviewerInfo="20대 / 남성 / 대학생"
          tags={["빠른 예약", "깔끔한 마무리", "친절한 안내", "편한 진행"]}
          title="자취방 맡겼는데 기대 이상으로 깨끗해져서 만족합니다"
          body={<></>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/156.png"
          reviewerName="박○○"
          reviewerInfo="30대 / 남성 / 자영업"
          tags={["빠른 작업", "전문적인 청소", "체계적인 진행", "신뢰감"]}
          title="가게 청소 맡겼는데 확실히 전문가 느낌이 나네요"
          body={<></>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/133.png"
          reviewerName="최○○"
          reviewerInfo="40대 / 여성 / 주부"
          tags={["꼼꼼한 디테일", "합리적인 가격", "전문 장비", "깔끔한 결과"]}
          title="주방이 특히 만족스러웠고 전체적으로 정말 깨끗해졌어요"
          body={<></>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/124.png"
          reviewerName="정○○"
          reviewerInfo="20대 / 여성 / 직장인"
          tags={["친절한 상담", "빠른 진행", "정확한 시간", "깔끔한 마무리"]}
          title="처음 맡겨봤는데 응대도 좋고 결과도 만족입니다"
          body={<></>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
        <ReviewCard
          avatarSrc="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/145.png"
          reviewerName="이○○"
          reviewerInfo="50대 / 남성 / 개인사업자"
          tags={["체계적인 서비스", "믿을 수 있는 업체", "확실한 결과", "만족도 높음"]}
          title="다음에도 재이용할 생각입니다. 믿고 맡길 수 있네요"
          body={<></>}
          cardWidth={cardW}
          cardGap={cardGap}
        />
      </div>
    </div>
  );
};
