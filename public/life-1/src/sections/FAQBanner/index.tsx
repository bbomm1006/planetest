import { useEffect, useRef, useState } from "react";

export const FAQBanner = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  const texts = [
    '"새집증후군 제거, 옵션 추가 없이 가능한가요?"',
    '"당일 현장에서 갑자기 추가 비용을 요구하지 않나요?"',
    '"오래된 기름때나 욕실 물때도 완벽하게 제거가 가능한가요?"',
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((i) => (i + 1) % texts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div ref={ref} className={`items-center box-border caret-transparent flex justify-center break-words w-full transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <a
        href="https://plead.notion.site/691c7660f2e240529f000d6d6e9223a9"
        className="box-border caret-transparent contents break-words"
      >
        <div className="items-center backdrop-blur bg-blue-700/20 box-border caret-transparent flex min-h-[auto] min-w-[auto] break-words w-full rounded-none hover:bg-blue-700/30 transition-colors duration-200 md:w-[800px] md:rounded-full md:mx-[34px]">
          <div className="text-blue-700 text-[15px] font-semibold box-border caret-transparent basis-[0%] grow h-[50px] leading-[50px] min-h-[auto] min-w-[auto] break-words text-center overflow-hidden md:text-2xl md:h-16 md:leading-[64px]">
            <div
              key={textIndex}
              className="text-[15px] leading-[50px] animate-fade-in md:text-2xl md:leading-[64px] px-2 truncate"
            >
              {texts[textIndex]}
            </div>
          </div>
          <button
            type="button"
            className="btn-press relative appearance-none text-blue-700 text-sm font-bold items-center bg-white caret-transparent flex h-8 justify-center leading-[16.8px] min-h-[auto] min-w-8 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle mr-2.5 px-3 py-0 rounded-full md:text-lg md:h-10 md:leading-[21.6px] md:min-w-10 md:mr-3 md:px-4"
          >
            답변 보기
          </button>
        </div>
      </a>
    </div>
  );
};
