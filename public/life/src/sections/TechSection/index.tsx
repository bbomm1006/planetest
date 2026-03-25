import { useEffect, useRef, useState, useCallback } from "react";

const TEAM_VIDEOS = [
  {
    youtubeId: "D8mxrSvCZ1M",
    img: "https://c.animaapp.com/mn4j4i5rMNHjkT/assets/160.png",
    role: "청소 전문가",
  },
  {
    youtubeId: "CND-OpobQt0",
    img: "https://c.animaapp.com/mn4j4i5rMNHjkT/assets/167.png",
    role: "고객상담 전문가",
  },
  {
    youtubeId: "iJG0GB9VZks",
    img: "https://c.animaapp.com/mn4j4i5rMNHjkT/assets/150.png",
    role: "서비스 개발자",
  },
  {
    youtubeId: "ccDjysySykI",
    img: "https://c.animaapp.com/mn4j4i5rMNHjkT/assets/174.png",
    role: "청소 전문 대표 매니저",
  },
  {
    youtubeId: "nUESeu10nmM",
    img: "https://c.animaapp.com/mn4j4i5rMNHjkT/assets/178.png",
    role: "품질 관리 전문가",
  },
];

function RevealSection({ children, className = "", delay = 0, id }: { children: React.ReactNode; className?: string; delay?: number; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id={id}
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

export function TeamCarouselSection() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const cardW = isDesktop ? 500 : 280;
  const cardGap = isDesktop ? 28 : 16;

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [activeIndex, setActiveIndex] = useState(1);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const startOffset = useRef(0);

  const snapToIndex = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(TEAM_VIDEOS.length - 1, idx));
    setActiveIndex(clamped);
    setDragOffset(0);
  }, []);

  const commitDrag = useCallback((deltaX: number) => {
    const threshold = cardW * 0.25;
    if (deltaX < -threshold) snapToIndex(activeIndex + 1);
    else if (deltaX > threshold) snapToIndex(activeIndex - 1);
    else snapToIndex(activeIndex);
  }, [activeIndex, cardW, snapToIndex]);

  // Pointer events
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.clientX;
    startOffset.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 5) hasDragged.current = true;
    startOffset.current = delta;
    setDragOffset(delta);
  };
  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    commitDrag(startOffset.current);
  };

  // Touch events
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const touchLocked = useRef<"horizontal" | "vertical" | null>(null);
  const touchStartY = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    touchLocked.current = null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (touchLocked.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        touchLocked.current = Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical";
      }
    }
    if (touchLocked.current === "horizontal") {
      e.preventDefault();
      touchDeltaX.current = dx;
      setDragOffset(dx);
    }
  };
  const onTouchEnd = () => {
    if (touchLocked.current === "horizontal") {
      commitDrag(touchDeltaX.current);
    }
    touchLocked.current = null;
  };

  const [containerWidth, setContainerWidth] = useState(390);
  useEffect(() => {
    const update = () => setContainerWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const baseTranslate = containerWidth / 2 - cardW / 2 - activeIndex * (cardW + cardGap);
  const totalTranslate = baseTranslate + dragOffset;

  return (
    <RevealSection delay={100} id="team" className="items-center flex justify-center w-full">
      <div className="relative bg-slate-100 w-full overflow-hidden py-8 rounded-[17px] md:py-[80px] md:rounded-[33px]">
        <div className="text-center px-5 mb-8 md:mb-12">
          <h2 className="text-[25px] font-bold leading-[33.25px] text-center mb-2 md:text-[50px] md:leading-[60px] md:mb-[15px]">
            클린메이트를 만든<br />전문 청소팀을 만나보세요
          </h2>
          <p className="text-[13px] font-semibold leading-[19.5px] text-slate-500 text-center mt-2 md:text-xl md:leading-[30px] md:mt-[15px]">
            다양한 현장 경험을 가진 전문가들이 모여 최고의 청소 서비스를 제공합니다
          </p>
        </div>

        <div
          className="relative overflow-visible cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            ref={trackRef}
            className="flex"
            style={{
              transform: `translateX(${totalTranslate}px)`,
              transition: isDragging.current ? "none" : "transform 300ms ease-out",
              willChange: "transform",
              gap: `${cardGap}px`,
            }}
          >
            {TEAM_VIDEOS.map((video, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={video.youtubeId}
                  className="flex-shrink-0 flex flex-col items-center"
                  style={{ width: `${cardW}px` }}
                >
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    draggable={false}
                    onClick={(e) => {
                      if (hasDragged.current) e.preventDefault();
                    }}
                    className="relative w-full rounded-[14px] md:rounded-[24px] overflow-hidden group focus:outline-none block"
                    style={{
                      transition: "transform 300ms ease-out, opacity 300ms ease-out",
                      transform: isActive ? "scale(1)" : "scale(0.93)",
                      opacity: isActive ? 1 : 0.65,
                    }}
                    aria-label={`${video.role} 영상 보기`}
                  >
                    <img
                      src={video.img}
                      alt={video.role}
                      className="w-full aspect-video object-cover"
                      draggable={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors duration-200">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-800 ml-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </a>
                  <p
                    className="text-slate-500 text-sm font-semibold text-center mt-2 md:text-xl md:mt-4 transition-opacity duration-300"
                    style={{ opacity: isActive ? 1 : 0.45 }}
                  >
                    {video.role}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
          {TEAM_VIDEOS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => snapToIndex(i)}
              aria-label={`슬라이드 ${i + 1}`}
              className="rounded-full transition-all duration-300 focus:outline-none"
              style={{
                width: i === activeIndex ? "28px" : "8px",
                height: "8px",
                background: i === activeIndex ? "#475569" : "#cbd5e1",
              }}
            />
          ))}
        </div>
      </div>
    </RevealSection>
  );
}