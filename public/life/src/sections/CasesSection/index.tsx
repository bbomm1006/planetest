import { useEffect, useRef, useState } from "react";
import { CaseGrid } from "@/sections/CasesSection/components/CaseGrid";

const FAQ_DATA = [
  {
    question: "어떤 서비스인가요?",
    answer: "똑생은 개인회생 전문 법무법인 현림의 비대면 법률 서비스입니다. AI 기반 초정밀 예상 탕감액 진단, 온라인 서류 관리, 실시간 채팅 상담 등을 월 19만원의 부담 없는 분납 방식으로 제공합니다.",
  },
  {
    question: "개인회생 외 다른 법률자문은 안하나요?",
    answer: "똑생은 개인회생 전문 서비스로, 현재 개인회생에만 특화되어 운영하고 있습니다. 개인파산 등 다른 채무 해결 방법에 대한 상담도 가능하오니 문의해 주세요.",
  },
  {
    question: "다른 곳보다 어떤 부분이 좋나요?",
    answer: "업계 유일 장기 분할납부(최대 9개월), 국내 3%뿐인 도산전문변호사 직접 담당, AI 기반 초정밀 진단, 비대면 전 과정 진행, 부채증명서 대리발급 등 차별화된 서비스를 제공합니다.",
  },
  {
    question: "회생? 파산? 워크아웃? 어떤게 나아요?",
    answer: "상황에 따라 다릅니다. 정기적인 수입이 있다면 개인회생이, 수입이 없거나 매우 적다면 개인파산이 적합할 수 있습니다. 워크아웃은 금융채무만 해당됩니다. 간단한 자격진단을 통해 최적 방법을 찾아드립니다.",
  },
  {
    question: "통신요금, 카드값, 사채, 개인채무도 가능한가요?",
    answer: "네, 가능합니다! 통신요금, 카드값, 사채, 개인 간 채무 모두 개인회생 대상이 됩니다. 원금의 최대 96.7%까지 탕감받은 사례도 있습니다.",
  },
  {
    question: "하면 사회생활에 지장이 없을까요?",
    answer: "개인회생은 파산이 아닙니다. 취업, 이직, 금융 거래에 직접적인 제한은 없지만 신용점수 하락이 있을 수 있습니다. 면책 결정 후 성실히 변제하면 신용도를 회복할 수 있습니다.",
  },
];

function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
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
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <li className={`bg-slate-100 box-border caret-transparent break-words rounded-[25px] overflow-hidden transition-all duration-300 md:rounded-[40px] ${open ? "bg-white shadow-[rgba(45,55,72,0.08)_0px_4px_20px_0px]" : ""}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center text-left p-5 md:p-10 group"
      >
        <p className="text-base font-semibold box-border caret-transparent leading-6 min-h-[auto] min-w-[auto] break-words flex-1 md:text-2xl md:leading-9">
          {question}
        </p>
        <span className={`ml-4 flex-shrink-0 text-slate-500 transition-transform duration-300 ${open ? "rotate-45" : ""}`} aria-hidden="true">
          <img
            src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/icon-1.svg"
            alt=""
            className={`h-[25px] w-[25px] transition-all duration-300 md:h-10 md:w-10 ${open ? "opacity-40" : ""}`}
          />
        </span>
      </button>
      <div className={`faq-answer ${open ? "open" : ""}`}>
        <p className="text-slate-600 text-sm font-medium leading-relaxed px-5 pb-5 md:text-lg md:px-10 md:pb-10">
          {answer}
        </p>
      </div>
    </li>
  );
}

function ReviewCard({ review }: { review: { img: string; name: string; meta: string; tags: string[]; title: string } }) {
  return (
    <div className="relative box-border caret-transparent shrink-0 h-full min-h-[auto] min-w-[auto] break-words w-[295px] md:w-[310px]">
      <div className="relative bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent flex flex-col h-80 break-words mb-2.5 p-5 rounded-2xl md:shadow-none md:h-[590px] md:mb-0 md:p-[30px]">
        <div className="items-center box-border caret-transparent gap-x-2.5 flex min-h-[auto] min-w-[auto] break-words gap-y-2.5 md:gap-x-5 md:gap-y-5">
          <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words overflow-hidden rounded-full w-[50px] md:w-[65px]">
            <img
              alt=""
              src={`https://c.animaapp.com/mn4j4i5rMNHjkT/assets/${review.img}`}
              className="text-transparent aspect-square box-border max-w-full break-words align-baseline w-[50px] md:w-[65px]"
            />
          </div>
          <div className="box-border caret-transparent flex flex-col min-h-[auto] min-w-[auto] break-words">
            <p className="text-base font-bold box-border caret-transparent leading-6 min-h-[auto] min-w-[auto] break-words md:text-xl md:leading-[30px]">
              {review.name}
            </p>
            <p className="text-sm font-medium box-border caret-transparent leading-[21px] min-h-[auto] min-w-[auto] break-words md:text-base md:leading-6">
              {review.meta}
            </p>
          </div>
        </div>
        <div className="box-border caret-transparent ml-[-3px] min-h-[auto] min-w-[auto] break-words mt-2.5 md:mt-[22px]">
          {review.tags.map((tag) => (
            <div key={tag} className="text-green-800 text-xs font-semibold bg-green-100 box-border caret-transparent inline-block leading-[18px] break-words m-[3px] px-2 py-px rounded-md md:text-sm md:leading-[21px]">
              {tag}
            </div>
          ))}
        </div>
        <h4 className="text-lg font-bold box-border caret-transparent leading-[27px] min-h-[auto] min-w-[auto] break-words mt-2.5 md:text-[22px] md:leading-[33px] md:mt-[15px]">
          {review.title}
        </h4>
        <div className="absolute items-center box-border caret-transparent flex justify-center break-words bottom-5 inset-x-0 md:bottom-10">
          <button
            type="button"
            className="btn-press relative appearance-none text-white text-sm font-semibold items-center bg-green-600 caret-transparent flex h-8 justify-center leading-[16.8px] min-h-[auto] min-w-8 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-3 py-0 rounded-full md:text-base md:h-10 md:leading-[19.2px] md:min-w-10 md:px-4"
          >
            이어서 읽기
          </button>
        </div>
      </div>
    </div>
  );
}

export const CasesSection = () => {
  return (
    <div id="cases" className="box-border caret-transparent gap-x-[17px] flex flex-col break-words gap-y-[17px] p-[17px] md:gap-x-[34px] md:gap-y-[34px] md:p-[34px]">
      <RevealSection className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden py-[30px] rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:py-[110px] md:rounded-[33px]">
          <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:mb-[15px]">
            이런 경우에도
            <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words md:text-[50px] md:leading-[60px]" />
            채무해결이 가능해요
          </h2>
          <div className="items-center box-border caret-transparent flex justify-center break-words">
            <a href="https://app.ddok.life/intake/wep/diagnosis">
              <button
                type="button"
                className="btn-press relative appearance-none text-white text-base font-semibold items-center bg-green-600 caret-transparent flex h-12 justify-center leading-[19.2px] min-h-[auto] min-w-12 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-6 py-0 rounded-full md:text-lg md:h-[60px] md:leading-[21.6px] md:min-w-[60px] md:px-7"
              >
                초간단 자격확인 하기
              </button>
            </a>
          </div>
          <div className="items-center box-border caret-transparent flex justify-center break-words mt-[30px] md:mt-[77px]">
            <CaseGrid />
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:rounded-[33px]">
          <div className="absolute items-center box-border caret-transparent flex h-full justify-center break-words w-full left-0 top-0 after:accent-auto after:bg-emerald-600/90 after:caret-transparent after:text-gray-900 after:block after:text-base after:not-italic after:normal-nums after:font-normal after:h-full after:tracking-[-0.64px] after:leading-6 after:list-outside after:list-disc after:break-words after:pointer-events-auto after:absolute after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:w-full after:border-separate after:left-0 after:top-0 after:font-pretendard">
            <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words rotate-[-19.99995654637864deg] w-[300px] scale-[1.8000029963852837] md:w-[500px]">
              <img
                alt="똑생은 열정입니다"
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/164.png"
                className="text-transparent aspect-[auto_300_/_273] box-border max-w-full break-words align-baseline w-[300px] md:aspect-[auto_500_/_454] md:w-[500px]"
              />
            </div>
          </div>
          <div className="absolute text-white items-center box-border caret-transparent flex flex-col h-full justify-center break-words text-center w-full left-0 top-0">
            <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-[200px] md:w-[300px]">
              <img
                alt="국내 3%"
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/165.png"
                className="text-transparent aspect-[auto_200_/_82] box-border max-w-full break-words align-baseline w-[200px] md:aspect-[auto_300_/_123] md:w-[300px]"
              />
            </div>
            <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] min-h-[auto] min-w-[auto] break-words mt-[5px] mb-2 md:text-[50px] md:leading-[60px] md:mt-5 md:mb-[15px]">
              개인회생 전문 도산변호사
              <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words md:text-[50px] md:leading-[60px]" />
              책임 담당 보장제
            </h2>
            <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] min-h-[auto] min-w-[auto] break-words mt-2 md:text-xl md:leading-[30px] md:mt-[15px]">
              국내 단 3%뿐인 대한변호사협회 인증 도산전문 변호사가
              <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words md:text-xl md:leading-[30px]" />
              직접 변제계획안 작성부터 상담까지 모두 책임져요
            </p>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={150} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-green-100 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden py-[30px] rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:py-[60px] md:rounded-[33px]">
          <div className="items-center box-border caret-transparent flex justify-center break-words mb-5 md:mb-[30px]">
            <div className="box-border caret-transparent gap-x-[5px] flex min-h-[auto] min-w-[auto] break-words gap-y-[5px] w-[87%] px-0 md:gap-x-2 md:gap-y-2 md:w-full md:px-[60px]">
              <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-[30px] md:w-10">
                <img
                  alt=""
                  src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/129.png"
                  className="text-transparent aspect-[auto_30_/_30] box-border max-w-full break-words align-baseline w-[30px] md:aspect-[auto_40_/_40] md:w-10"
                />
              </div>
              <div className="box-border caret-transparent basis-[0%] grow min-h-[auto] min-w-[auto] break-words">
                <h2 className="text-[22px] font-bold box-border caret-transparent leading-[33px] break-words md:text-3xl md:leading-[45px]">
                  실제 고객의 소감은?
                </h2>
                <p className="text-indigo-400 text-sm font-semibold box-border caret-transparent leading-[21px] break-words md:text-lg md:leading-[27px]">
                  고객님 의향에 의해 직접 작성해 주신 후기 입니다
                </p>
              </div>
              <a
                href="/reviews"
                className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words"
              >
                <button
                  type="button"
                  className="btn-press absolute appearance-none text-black text-xs font-semibold items-center bg-amber-300 caret-transparent flex h-6 justify-center leading-[14.4px] min-w-6 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-2 py-0 rounded-full right-[30px] top-[35px] md:text-base md:h-10 md:leading-[19.2px] md:min-w-10 md:px-4 md:right-[60px] md:top-[65px]"
                >
                  모두보기
                </button>
              </a>
            </div>
          </div>
          <div className="relative box-border caret-transparent list-none break-words overscroll-x-contain z-[1] overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing mx-auto">
            <div className="relative caret-transparent flex h-full break-words w-max px-[23px] gap-x-3.5 md:px-[60px] md:gap-x-[30px]">
              {[
                { img: "138.png", name: "오○○", meta: "30대 / 여성 / 프리랜서", tags: ["정확한 초정밀 진단","변호사의 유연한 대응","빠른 고객대응","높은 탕감률"], title: "다른 사무실들은 불가능하다고 했는데 똑생은 약속한 6만원대로 받아냈어요" },
                { img: "128.png", name: "정○○", meta: "20대 / 여성 / 직장인", tags: ["시간에 구애받지 않는 온라인 접수","깔끔한 일처리","친절한 안내","변호사의 꼼꼼함"], title: "비대면인데도 이렇게 물심양면인 변호사님들은 못 찾으실 겁니다" },
                { img: "156.png", name: "문○○", meta: "30대 / 남성 / 직장인", tags: ["빠른 피드백","책임감 있는 변호사","쉽고 간편한 자료안내","1:1 맞춤 진행"], title: "간편하게 자료 확보하는 법부터 다르다는 생각이 들었어요" },
                { img: "133.png", name: "맹○○", meta: "40대 / 여성 / 직장인", tags: ["예상 탕감액 서비스","합리적인 수임료","변호사 상담","웹을 통한 비대면 서류 제출"], title: "똑생은 보완이 필요하면 바로 알려주고 부족한 부분을 딱 짚어주는 게 좋았어요" },
                { img: "124.png", name: "윤○○", meta: "20대 / 남성 / 직장인", tags: ["빠른 개시결정","친절한 상담","상세한 서류제출 안내","높은 탕감률"], title: "전화 상담을 많이 하였는데 그때마다 항상 친절하게 응해주셨습니다" },
                { img: "145.png", name: "이○○", meta: "40대 / 여성 / 직장인 및 개인사업자", tags: ["체계적인 자동화 시스템","부담없는 수임료","빠른 개시결정","높은 탕감률"], title: "비대면에 대한 불안이 무색하게 오히려 더 빠르게 개시결정이 났습니다" },
              ].map((review, i) => (
                <ReviewCard key={i} review={review} />
              ))}
              <div className="relative box-border caret-transparent shrink-0 h-full min-h-[auto] min-w-[auto] break-words w-[295px] md:w-[310px]">
                <div className="items-center bg-white/40 shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent gap-x-2.5 flex flex-col h-80 justify-center break-words gap-y-2.5 mb-2.5 p-5 rounded-2xl md:shadow-none md:h-[590px] md:mb-0 md:p-[30px]">
                  <p className="text-xl font-bold box-border caret-transparent leading-[30px] min-h-[auto] min-w-[auto] break-words md:text-[25px] md:leading-[37.5px]">
                    다른 후기들도 많아요!
                  </p>
                  <a href="/reviews" className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words">
                    <button
                      type="button"
                      className="btn-press relative appearance-none text-black text-base font-semibold items-center bg-amber-300 caret-transparent inline-flex h-10 justify-center leading-[19.2px] min-w-10 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-4 py-0 rounded-full md:text-lg md:h-12 md:leading-[21.6px] md:min-w-12 md:px-6"
                    >
                      후기 모두 보기
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="box-border caret-transparent flex max-w-none min-h-[360px] min-w-[auto] break-words w-full rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:rounded-[33px]">
          <div className="relative box-border caret-transparent flex basis-[0%] grow min-h-[auto] min-w-[auto] break-words z-[1] overflow-hidden">
            <div className="relative items-center bg-[radial-gradient(circle,rgb(252,253,255),rgb(196,206,255))] box-border caret-transparent flex basis-[0%] grow justify-center min-h-[auto] min-w-[auto] break-words z-50 rounded-[17px] md:bg-[radial-gradient(circle,rgb(252,253,255),rgb(196,206,255),rgb(196,206,255))] md:rounded-[33px]">
              <div className="box-border caret-transparent h-[150px] min-h-[auto] min-w-[auto] break-words w-[150px] animate-float md:h-[300px] md:w-[300px]">
                <img
                  alt=""
                  src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/star.0d~z-k65.khs~.png"
                  className="text-transparent aspect-[auto_300_/_300] box-border h-full max-w-full break-words align-baseline w-full"
                />
              </div>
            </div>
            <div className="static bg-transparent shadow-none box-content caret-black opacity-100 transform-none w-auto z-auto rounded-none border-y-0 border-black left-auto top-auto md:absolute md:aspect-auto md:backdrop-blur-[10px] md:bg-white/10 md:border-l-slate-200 md:border-r-slate-200 md:shadow-[rgba(0,0,0,0.1)_0px_20px_10px_0px] md:box-border md:caret-transparent md:blur-[9.33333px] md:opacity-[0.733333] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:-translate-x-20 md:translate-y-[-367px] md:w-[350px] md:z-[14] md:[mask-position:0%] md:bg-left-top md:p-[30px] md:scroll-m-0 md:scroll-p-[auto] md:rounded-[20px] md:border-y-white/70 md:border-y-2 md:border-solid md:scale-[0.21] md:left-0 md:top-0"></div>
            <div className="static bg-transparent shadow-none box-content caret-black opacity-100 transform-none w-auto z-auto rounded-none border-y-0 border-black left-auto top-auto md:absolute md:aspect-auto md:backdrop-blur-[10px] md:bg-white/20 md:border-l-slate-200 md:border-r-slate-200 md:shadow-[rgba(0,0,0,0.1)_0px_20px_10px_0px] md:box-border md:caret-transparent md:blur-[9.16667px] md:opacity-[0.716667] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:translate-x-[529px] md:translate-y-[-368.5px] md:w-[350px] md:z-[15] md:[mask-position:0%] md:bg-left-top md:p-[30px] md:scroll-m-0 md:scroll-p-[auto] md:rounded-[20px] md:border-y-white/70 md:border-y-2 md:border-solid md:scale-[0.225] md:left-0 md:top-0"></div>
            <div className="static bg-transparent shadow-none box-content caret-black opacity-100 transform-none w-auto z-auto rounded-none border-y-0 border-black left-auto top-auto md:absolute md:aspect-auto md:backdrop-blur-[10px] md:bg-white/40 md:border-l-slate-200 md:border-r-slate-200 md:shadow-[rgba(0,0,0,0.1)_0px_20px_10px_0px] md:box-border md:caret-transparent md:blur-[5.66667px] md:opacity-[0.366667] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:translate-x-[775px] md:translate-y-[-280px] md:w-[350px] md:z-[36] md:[mask-position:0%] md:bg-left-top md:p-[30px] md:scroll-m-0 md:scroll-p-[auto] md:rounded-[20px] md:border-y-white/70 md:border-y-2 md:border-solid md:scale-[0.54] md:left-0 md:top-0"></div>
            <div className="static bg-transparent shadow-none box-content caret-black transform-none w-auto z-auto rounded-none border-y-0 border-black left-auto top-auto md:absolute md:aspect-auto md:backdrop-blur-[10px] md:bg-white/50 md:border-l-slate-200 md:border-r-slate-200 md:shadow-[rgba(0,0,0,0.1)_0px_20px_10px_0px] md:box-border md:caret-transparent md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:translate-x-[898px] md:translate-y-[-332.5px] md:w-[350px] md:z-[51] md:[mask-position:0%] md:bg-left-top md:p-[30px] md:scroll-m-0 md:scroll-p-[auto] md:rounded-[20px] md:border-y-white/70 md:border-y-2 md:border-solid md:scale-[0.765] md:left-0 md:top-0"></div>
            <div className="static bg-transparent shadow-none box-content caret-black opacity-100 transform-none w-auto z-auto rounded-none border-y-0 border-black left-auto top-auto md:absolute md:aspect-auto md:backdrop-blur-[10px] md:bg-white/10 md:border-l-slate-200 md:border-r-slate-200 md:shadow-[rgba(0,0,0,0.1)_0px_20px_10px_0px] md:box-border md:caret-transparent md:blur-[9.83333px] md:opacity-[0.783333] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:translate-x-[944px] md:translate-y-[-272.5px] md:w-[350px] md:z-[11] md:[mask-position:0%] md:bg-left-top md:p-[30px] md:scroll-m-0 md:scroll-p-[auto] md:rounded-[20px] md:border-y-white/70 md:border-y-2 md:border-solid md:scale-[0.165] md:left-0 md:top-0"></div>
            <div className="static bg-transparent shadow-none box-content caret-black opacity-100 transform-none w-auto z-auto rounded-none border-y-0 border-black left-auto top-auto md:absolute md:aspect-auto md:backdrop-blur-[10px] md:bg-white/40 md:border-l-slate-200 md:border-r-slate-200 md:shadow-[rgba(0,0,0,0.1)_0px_20px_10px_0px] md:box-border md:caret-transparent md:blur-[2.25px] md:opacity-55 md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:translate-x-[804px] md:translate-y-[-481px] md:w-[350px] md:z-[90] md:[mask-position:0%] md:bg-left-top md:p-[30px] md:scroll-m-0 md:scroll-p-[auto] md:rounded-[20px] md:border-y-white/70 md:border-y-2 md:border-solid md:scale-[1.35] md:left-0 md:top-0"></div>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="box-border caret-transparent flex flex-col max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden p-5 rounded-[17px] md:flex-row md:max-w-[2000px] md:min-h-[700px] md:p-[100px] md:rounded-[33px]">
          <h2 className="static text-[25px] font-bold box-border caret-transparent leading-[33.25px] min-h-[auto] min-w-[auto] break-words text-center z-[2] mb-2 md:absolute md:text-[50px] md:leading-[60px] md:min-h-0 md:min-w-0 md:text-start md:mb-[15px]">
            쉽고 빠른 채무해결을 위한
            <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[50px] md:leading-[60px] md:text-start" />
            올인원 서비스 제공
          </h2>
          <div className="self-stretch box-border caret-transparent basis-[0%] grow justify-self-stretch min-h-[auto] min-w-[auto] break-words"></div>
          <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words">
            <div className="relative box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-auto overflow-hidden mt-[30px] md:w-[900px] md:mt-0 before:accent-auto before:bg-[linear-gradient(to_right,rgb(255,255,255),rgba(255,255,255,0))] before:caret-transparent before:text-gray-900 before:block before:text-base before:not-italic before:normal-nums before:font-normal before:tracking-[-0.64px] before:leading-6 before:list-outside before:list-disc before:break-words before:pointer-events-auto before:absolute before:text-start before:no-underline before:indent-[0px] before:normal-case before:visible before:w-[30px] before:z-[1] before:border-separate before:inset-y-0 before:font-pretendard before:md:w-[100px] after:accent-auto after:bg-[linear-gradient(to_left,rgb(255,255,255),rgba(255,255,255,0))] after:caret-transparent after:text-gray-900 after:block after:text-base after:not-italic after:normal-nums after:font-normal after:tracking-[-0.64px] after:leading-6 after:list-outside after:list-disc after:break-words after:pointer-events-auto after:absolute after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:w-[30px] after:z-[1] after:border-separate after:right-0 after:inset-y-0 after:font-pretendard after:md:w-[100px]">
              <div className="animate-marquee flex gap-x-2.5 md:gap-x-[46px]" style={{width:"max-content"}}>
                {[
                  { img: "144.png", label: "제출 상세 매뉴얼" },
                  { img: "person-running.0yi2wt8f7fvts.png", label: "부채증명서 대리발급" },
                  { img: "183.png", label: "제출물 온라인 관리" },
                  { img: "188.png", label: "개인별 초정밀 진단" },
                  { img: "rocket.0tm7okw41dt6i.png", label: "초고속 법원제출" },
                  { img: "127.png", label: "진행상황 자동알림" },
                  { img: "147.png", label: "실시간 채팅상담" },
                  { img: "132.png", label: "채권자 대응 컨설팅" },
                  { img: "spiral-calendar.0z-4n620wwoy0.png", label: "일정 미리 안내" },
                  { img: "159.png", label: "서류 대리발급" },
                  { img: "144.png", label: "제출 상세 매뉴얼" },
                  { img: "person-running.0yi2wt8f7fvts.png", label: "부채증명서 대리발급" },
                  { img: "183.png", label: "제출물 온라인 관리" },
                  { img: "188.png", label: "개인별 초정밀 진단" },
                  { img: "rocket.0tm7okw41dt6i.png", label: "초고속 법원제출" },
                  { img: "127.png", label: "진행상황 자동알림" },
                  { img: "147.png", label: "실시간 채팅상담" },
                  { img: "132.png", label: "채권자 대응 컨설팅" },
                  { img: "spiral-calendar.0z-4n620wwoy0.png", label: "일정 미리 안내" },
                  { img: "159.png", label: "서류 대리발급" },
                ].map((item, i) => (
                  <div key={i} className="items-center bg-green-50 box-border caret-transparent gap-x-[15px] flex flex-col h-[120px] justify-center break-words gap-y-[15px] w-[120px] rounded-[20px] flex-shrink-0 hover:bg-green-100 transition-colors duration-200 md:gap-x-5 md:h-60 md:gap-y-5 md:w-60 md:rounded-[40px]">
                    <div className="box-border caret-transparent h-[50px] min-h-[auto] min-w-[auto] break-words w-[50px] md:h-[100px] md:w-[100px]">
                      <img
                        alt=""
                        src={`https://c.animaapp.com/mn4j4i5rMNHjkT/assets/${item.img}`}
                        className="text-transparent box-border h-[50px] max-w-full break-words align-baseline w-[50px] md:h-[100px] md:w-[100px]"
                      />
                    </div>
                    <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] min-h-[auto] min-w-[auto] break-words text-center md:text-2xl md:leading-9">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-[url('https://www.ddok.life/_next/static/media/reduce-rate-bg.0n472h56-261o.png')] bg-cover box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden bg-center py-5 rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:py-[100px] md:rounded-[33px]">
          <div className="absolute box-border caret-transparent h-0 opacity-30 break-words w-0 left-2/4 top-0">
            <div className="absolute box-border caret-transparent break-words right-[25px] md:right-[100px]">
              <div className="box-border caret-transparent inline-block break-words w-[244px] mb-5 md:w-[800px]">
                <img
                  alt=""
                  src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/171.svg"
                  className="text-transparent aspect-[auto_244_/_1692] box-border max-w-full break-words align-baseline w-[244px] md:aspect-[auto_800_/_5548] md:w-[800px]"
                />
              </div>
              <div className="box-border caret-transparent inline-block break-words w-[244px] md:w-[800px]">
                <img
                  alt=""
                  src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/171.svg"
                  className="text-transparent aspect-[auto_244_/_1692] box-border max-w-full break-words align-baseline w-[244px] md:aspect-[auto_800_/_5548] md:w-[800px]"
                />
              </div>
            </div>
            <div className="absolute box-border caret-transparent break-words left-[25px] md:left-[100px]">
              <div className="box-border caret-transparent inline-block break-words w-[244px] mb-5 md:w-[800px]">
                <img
                  alt=""
                  src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/136.svg"
                  className="text-transparent aspect-[auto_244_/_1692] box-border max-w-full break-words align-baseline w-[244px] md:aspect-[auto_800_/_5548] md:w-[800px]"
                />
              </div>
              <div className="box-border caret-transparent inline-block break-words w-[244px] md:w-[800px]">
                <img
                  alt=""
                  src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/136.svg"
                  className="text-transparent aspect-[auto_244_/_1692] box-border max-w-full break-words align-baseline w-[244px] md:aspect-[auto_800_/_5548] md:w-[800px]"
                />
              </div>
            </div>
          </div>
          <div className="relative items-center box-border caret-transparent flex flex-col h-[330px] justify-center break-words py-5 md:h-[500px] md:py-0">
            <h2 className="text-white text-[40px] font-extrabold box-border caret-transparent leading-[53.2px] min-h-[auto] min-w-[auto] break-words md:text-[55px] md:leading-[66px]">
              실제 최대 탕감률
            </h2>
            <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-80 -mr-7 mt-[5px] md:w-[800px] md:mt-[30px]">
              <img
                alt="96.7%"
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/187.svg"
                className="text-transparent aspect-[auto_320_/_115] box-border max-w-full break-words align-baseline w-80 md:aspect-[auto_800_/_287] md:w-[800px]"
              />
            </div>
            <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] min-h-[auto] min-w-[auto] break-words text-center mt-[30px] md:text-xl md:leading-[30px] md:mt-[50px]">
              빅데이터 기술을 이용한 치밀한 변제계획과
              <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words md:text-xl md:leading-[30px]" />
              개인회생 전문 변호사의 다각적 전략수립으로 최고의 결과를 만들어요
            </p>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-indigo-500 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden pt-5 pb-[30px] rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:rounded-[33px]">
          <div className="items-center box-border caret-transparent flex flex-col justify-center break-words">
            <div className="relative items-center box-border caret-transparent flex h-[300px] justify-center min-h-[auto] min-w-[auto] break-words transform-none w-[400px] md:translate-y-[187.5px] md:scale-[2.5]">
              <div className="absolute box-border caret-transparent break-words rotate-[-19.99998485209311deg] w-[260px]">
                <img
                  alt=""
                  src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/185.png"
                  className="text-transparent aspect-[auto_260_/_260] box-border max-w-full break-words align-baseline w-[260px]"
                />
              </div>
              <div className="absolute box-border caret-transparent break-words translate-x-[-18.1542px] translate-y-[-51.8382px] rotate-[8.999998316886215deg] z-[1] scale-[0.9299998369655771]">
                <div className="text-white backdrop-blur-[10px] bg-blue-700/50 box-border caret-transparent break-words text-center text-nowrap px-[30px] py-2.5 rounded-full">
                  <span className="text-[27px] font-extrabold box-border caret-transparent leading-[40.5px] break-words text-nowrap mr-2.5">금지명령 평균</span>
                  <span className="text-[50px] font-extrabold box-border caret-transparent leading-[75px] break-words text-nowrap">4.9일</span>
                </div>
              </div>
              <div className="absolute box-border caret-transparent break-words translate-x-[17.6857px] translate-y-[33.8682px] rotate-[-7.999970437763044deg] scale-[0.7999994825248326]">
                <div className="text-white backdrop-blur-[10px] bg-green-500/60 box-border caret-transparent break-words text-center text-nowrap px-[30px] py-2.5 rounded-full">
                  <span className="text-[27px] font-extrabold box-border caret-transparent leading-[40.5px] break-words text-nowrap mr-2.5">개시결정 평균</span>
                  <span className="text-[50px] font-extrabold box-border caret-transparent leading-[75px] break-words text-nowrap">2.5개월</span>
                </div>
              </div>
              <p className="absolute text-white/40 text-[10px] font-semibold box-border caret-transparent leading-[15px] break-words right-[20%] bottom-[8%] md:text-[8px] md:leading-3">
                2024년 4월 9일 기준
              </p>
            </div>
            <div className="static box-border caret-transparent min-h-[auto] min-w-[auto] break-words text-center right-auto bottom-auto md:absolute md:min-h-0 md:min-w-0 md:text-right md:right-10 md:bottom-10">
              <h2 className="text-white text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-right md:mb-[15px]">
                결과가 증명하는 속도
              </h2>
              <p className="text-white/80 text-xs font-semibold box-border caret-transparent leading-[18px] break-words text-center md:text-base md:leading-6 md:text-right">
                금지명령: 채권자의 강제집행을 막는 법원의 명령
                <br className="text-xs box-border caret-transparent leading-[18px] break-words text-center md:text-base md:leading-6 md:text-right" />
                개시결정: 개인회생이 본격적으로 시작되는 단계
              </p>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-[url('https://www.ddok.life/_next/static/media/document-issuance-bg.0.b-rfqye9i4p.png')] bg-cover box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden bg-center px-0 py-5 rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:p-[100px] md:rounded-[33px]">
          <div className="absolute box-border caret-transparent flex h-[185px] break-words w-full left-0 top-[30px] md:h-[370px] md:top-40">
            <div className="relative box-border caret-transparent basis-[0%] grow min-h-[auto] min-w-[auto] break-words overflow-hidden">
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[45.389px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[45.389px] md:opacity-[0.29202] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[606px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[252.371px]">
                카드회사별 거래내역
              </p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[48.5549px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[48.5549px] md:opacity-[0.189169] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[606px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[192.029px]">
                저축은행별 거래내역
              </p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[48.3295px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[48.3295px] md:opacity-[0.166655] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[606px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[234.012px]"></p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[45.3521px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[45.3521px] md:opacity-[0.166407] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[606px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[119.265px]"></p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[43.6928px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[43.6928px] md:opacity-[0.142486] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[606px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[1.89264px]">
                신용정보조회서
              </p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[41.98px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[41.98px] md:opacity-[0.208726] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[606px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[59.1941px]">
                채권자변동정보
              </p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[44.6517px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[44.6517px] md:opacity-[0.223725] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[606px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[319.503px]">
                종합소득세 확정신고서
              </p>
            </div>
            <div className="relative box-border caret-transparent basis-[0%] grow min-h-[auto] min-w-[auto] break-words overflow-hidden">
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[43.6651px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[43.6651px] md:opacity-[0.137131] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[-260px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[288.695px]">
                채권자변동정보
              </p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[46.2917px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[46.2917px] md:opacity-[0.122057] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[-276px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[201.083px]">
                신용정보조회서
              </p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[45.5999px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[45.5999px] md:opacity-[0.108544] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[-271px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[202.809px]">
                채권자변동정보
              </p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap top-auto md:absolute md:text-green-800 md:text-[41.6231px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[41.6231px] md:opacity-[0.253575] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[149.798px]"></p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[49.5759px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[49.5759px] md:opacity-[0.207167] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[-391px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[314.368px]">
                저축은행별 거래내역
              </p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[46.7596px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[46.7596px] md:opacity-[0.220133] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[-368px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[102.131px]">
                카드회사별 거래내역
              </p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[46.5422px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[46.5422px] md:opacity-[0.253461] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[-287px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[205.664px]">
                은행별 거래내역
              </p>
              <p className="static text-black text-base font-normal box-content caret-black leading-[normal] opacity-100 text-wrap transform-none top-auto md:absolute md:text-green-800 md:text-[45.731px] md:font-bold md:aspect-auto md:box-border md:caret-transparent md:leading-[45.731px] md:opacity-[0.239466] md:break-words md:overscroll-x-auto md:overscroll-y-auto md:snap-align-none md:snap-normal md:snap-none md:decoration-auto md:underline-offset-auto md:text-nowrap md:translate-x-[-447px] md:[mask-position:0%] md:bg-left-top md:scroll-m-0 md:scroll-p-[auto] md:top-[172.665px]">
                지방세 세목별 과세증명서
              </p>
            </div>
          </div>
          <div className="relative items-center box-border caret-transparent flex justify-center break-words w-full left-auto top-auto md:absolute md:left-0 md:top-[230px]">
            <div className="relative box-border caret-transparent h-56 min-h-[auto] min-w-[auto] break-words transform-none w-[180px] md:scale-[2.3]">
              <div className="absolute box-border caret-transparent ml-[-212px] mt-[-30px] break-words w-[600px]">
                <img
                  alt=""
                  src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/169.png"
                  className="text-transparent aspect-[auto_600_/_271] box-border max-w-full break-words align-baseline w-[600px]"
                />
              </div>
              <div className="absolute box-border caret-transparent break-words w-[180px]">
                <img
                  alt="대리발급 서류종류 48종 이상"
                  src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/179.svg"
                  className="text-transparent aspect-[auto_180_/_224] box-border max-w-full break-words align-baseline w-[180px]"
                />
              </div>
            </div>
          </div>
          <div className="static text-zinc-800 box-border caret-transparent opacity-80 break-words my-5 md:absolute">
            <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
              복잡한 서류걱정은 이제 그만
            </h2>
            <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
              개인회생을 위해선 정말 많은 서류가 필요해요
              <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
              하지만 똑생에서 그런 걱정은 접어두셔도 돼요!
            </p>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-amber-200 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden px-0 py-5 rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:p-[100px] md:rounded-[33px]">
          <div className="static text-green-800 box-border caret-transparent break-words my-5 md:absolute">
            <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
              전국단위의 풍부한 회생 노하우
            </h2>
            <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
              똑생은 대한민국 전 지역에서 OK!
              <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
              수많은 경험을 토대로 각 지역 회생법원 특성에 대응해요
            </p>
          </div>
          <div className="items-center box-border caret-transparent flex justify-center break-words w-full overflow-hidden my-0 md:justify-end md:-my-10">
            <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-[450px] -mx-5 md:w-[1000px]">
              <img
                alt=""
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/176.png"
                className="text-transparent aspect-[auto_450_/_281] box-border max-w-full break-words align-baseline w-[450px] md:aspect-[auto_1000_/_625] md:w-[1000px]"
              />
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-green-200 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden pt-10 pb-5 px-5 rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:p-[100px] md:rounded-[33px]">
          <h2 className="relative text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center z-[1] mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
            진짜 실력의 차이는
            <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[50px] md:leading-[60px] md:text-start" />
            어려운 상황에서 나옵니다
          </h2>
          <div className="static items-center box-border caret-transparent flex flex-col justify-center break-words transform-none origin-[50%_50%] mt-5 right-auto md:absolute md:origin-[100%_50%] md:mt-0 md:scale-[2.2] md:right-[5%]">
            <p className="text-black/40 text-sm font-bold box-border caret-transparent leading-[21px] min-h-[auto] min-w-[auto] break-words mb-2.5">
              실제 해결한 사례 입니다
            </p>
            <div className="box-border caret-transparent h-[220px] min-h-[auto] min-w-[auto] break-words w-80">
              <div className="absolute items-center bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent flex blur-[2px] h-[90px] justify-center opacity-0 break-words translate-y-[-89.1px] w-80 z-[5] rounded-[10px] scale-110 md:opacity-100 md:transform-none md:z-[4]"></div>
              <div className="absolute items-center bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent flex h-[90px] justify-center opacity-100 break-words transform-none w-80 z-[4] rounded-[10px] md:blur-[2px] md:opacity-60 md:translate-y-[72.9px] md:z-[3] md:scale-90"></div>
              <div className="absolute items-center bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent flex blur-[2px] h-[90px] justify-center opacity-60 break-words translate-y-[72.9px] w-80 z-[3] rounded-[10px] scale-90 md:blur-[3px] md:opacity-30 md:translate-y-[129.6px] md:z-[2] md:scale-[0.8]"></div>
              <div className="absolute items-center bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent flex blur-[3px] h-[90px] justify-center opacity-30 break-words translate-y-[129.6px] w-80 z-[2] rounded-[10px] scale-[0.8] md:blur-sm md:opacity-0 md:translate-y-[170.1px] md:z-[1] md:scale-[0.7]"></div>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-zinc-100 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden pt-10 pb-5 px-5 rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:p-[100px] md:rounded-[33px]">
          <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
            첨단 분석기술로
            <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[50px] md:leading-[60px] md:text-start" />
            완성된 2세대 개인회생
          </h2>
          <div className="items-center box-border caret-transparent flex justify-center break-words my-[30px] md:my-0">
            <div className="static box-border caret-transparent min-h-[auto] min-w-[auto] opacity-100 break-words top-[-130px] w-[220px] right-[10%] md:absolute md:min-h-0 md:min-w-0 md:opacity-50 md:w-[870px]">
              <img
                alt=""
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/170.png"
                className="text-transparent aspect-[auto_220_/_262] box-border max-w-full break-words align-baseline w-[220px] md:aspect-[auto_870_/_1035] md:w-[870px]"
              />
            </div>
          </div>
          <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
            개인회생 전문 변호사가 직접 개발한 알고리즘이
            <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
            고객에게 가장 유리한 변제계획을 실행할 수 있도록 도와줘요
          </p>
          <ul className="relative box-border caret-transparent gap-x-[13px] flex flex-col break-words gap-y-[13px] w-auto mt-[25px] pl-0 md:gap-x-[22px] md:gap-y-[22px] md:w-[400px] md:mt-[120px]">
            <li className="items-center bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_8px_16px_0px] box-border caret-transparent gap-x-[15px] flex h-[70px] min-h-[auto] min-w-[auto] break-words gap-y-[15px] w-auto pl-[26px] rounded-xl md:shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_16px_24px_0px] md:gap-x-6 md:h-[100px] md:gap-y-6 md:w-[500px] md:pl-[50px] md:rounded-[20px]">
              <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-[29px] md:w-[45px]">
                <img
                  alt=""
                  src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/146.png"
                  className="text-transparent aspect-[auto_29_/_29] box-border max-w-full break-words align-baseline w-[29px] md:aspect-[auto_45_/_45] md:w-[45px]"
                />
              </div>
              <p className="text-[17px] font-semibold box-border caret-transparent leading-[25.5px] min-h-[auto] min-w-[auto] break-words md:text-2xl md:leading-9">
                집요하게 찾아내는{" "}
                <span className="relative text-[17px] box-border caret-transparent leading-[25.5px] break-words md:text-2xl md:leading-9 after:accent-auto after:bg-green-300 after:caret-transparent after:text-gray-900 after:block after:text-[17px] after:not-italic after:normal-nums after:font-semibold after:h-1/5 after:tracking-[-0.64px] after:leading-[25.5px] after:list-outside after:list-disc after:break-words after:pointer-events-auto after:absolute after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:border-separate after:bottom-0 after:inset-x-0 after:font-pretendard after:md:text-2xl after:md:leading-9">
                  <u className="relative text-blue-700 text-[17px] box-border caret-transparent leading-[25.5px] break-words z-[1] md:text-2xl md:leading-9">
                    치밀한 탕감률
                  </u>
                </span>
              </p>
            </li>
            <li className="items-center bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_8px_16px_0px] box-border caret-transparent gap-x-[15px] flex h-[70px] min-h-[auto] min-w-[auto] break-words gap-y-[15px] w-auto pl-[26px] rounded-xl md:shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_16px_24px_0px] md:gap-x-6 md:h-[100px] md:gap-y-6 md:w-[500px] md:pl-[50px] md:rounded-[20px]">
              <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-[29px] md:w-[45px]">
                <img
                  alt=""
                  src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/180.png"
                  className="text-transparent aspect-[auto_29_/_29] box-border max-w-full break-words align-baseline w-[29px] md:aspect-[auto_45_/_45] md:w-[45px]"
                />
              </div>
              <p className="text-[17px] font-semibold box-border caret-transparent leading-[25.5px] min-h-[auto] min-w-[auto] break-words md:text-2xl md:leading-9">
                더 빠른 업무처리
              </p>
            </li>
            <li className="items-center bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_8px_16px_0px] box-border caret-transparent gap-x-[15px] flex h-[70px] min-h-[auto] min-w-[auto] break-words gap-y-[15px] w-auto pl-[26px] rounded-xl md:shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_16px_24px_0px] md:gap-x-6 md:h-[100px] md:gap-y-6 md:w-[500px] md:pl-[50px] md:rounded-[20px]">
              <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-[29px] md:w-[45px]">
                <img
                  alt=""
                  src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/186.png"
                  className="text-transparent aspect-[auto_29_/_29] box-border max-w-full break-words align-baseline w-[29px] md:aspect-[auto_45_/_45] md:w-[45px]"
                />
              </div>
              <p className="text-[17px] font-semibold box-border caret-transparent leading-[25.5px] min-h-[auto] min-w-[auto] break-words md:text-2xl md:leading-9">
                사람에 의한 실수 방지
              </p>
            </li>
          </ul>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-zinc-100 box-border caret-transparent h-[380px] max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:rounded-[33px]">
          <div className="absolute box-border caret-transparent opacity-100 break-words top-[-25px] w-[560px] right-0 md:opacity-50 md:w-[1500px] md:top-0">
            <img
              alt="똑생 화면"
              src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/175.png"
              className="text-transparent aspect-[auto_560_/_348] box-border max-w-full break-words align-baseline w-[560px] md:aspect-[auto_1500_/_931] md:w-[1500px]"
            />
          </div>
          <div className="absolute box-border caret-transparent break-words w-full p-5 bottom-0 md:p-[100px]">
            <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
              인터넷으로 언제 어디서든
            </h2>
            <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
              장소에 구애받지 않고 손쉽게 개인회생을 할 수 있어요.
              <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
              이제 방문상담의 고민이 필요없어요!
            </p>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-gray-700 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden py-5 rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:py-[100px] md:rounded-[33px]">
          <div className="items-center box-border caret-transparent flex flex-col justify-center break-words">
            <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-20 my-[30px] md:w-[330px]">
              <img
                alt="법무법인 현림"
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/163.svg"
                className="text-transparent aspect-[auto_80_/_117] box-border max-w-full break-words align-baseline w-20 md:aspect-[auto_330_/_482] md:w-[330px]"
              />
            </div>
            <div className="static text-white box-border caret-transparent min-h-[auto] min-w-[auto] break-words ml-0 left-2/4 bottom-5 md:absolute md:min-h-0 md:min-w-0 md:ml-[200px] md:bottom-[126px]">
              <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
                당신만을 위해 모인
                <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[50px] md:leading-[60px] md:text-start" />
                개인회생 프로페셔널
              </h2>
              <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
                똑생은 법무법인 현림의 첨단 IT역량을 가진
                <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
                <span className="text-stone-400 text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start">
                  개인회생 법률팀이 직접
                </span>
                운영하는 서비스 입니다
              </p>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} id="pricing" className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="bg-indigo-100 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden p-[25px] rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:p-[35px] md:rounded-[33px]">
          <div className="items-center box-border caret-transparent flex justify-center break-words mt-0 md:mt-[30px]">
            <div className="box-border caret-transparent gap-x-[23px] flex flex-col max-w-[470px] min-h-[auto] min-w-[auto] break-words gap-y-[23px] w-full md:gap-x-[45px] md:max-w-[826px] md:gap-y-[45px]">
              <div className="box-border caret-transparent flex min-h-[auto] min-w-[auto] break-words">
                <div className="self-stretch box-border caret-transparent basis-[0%] grow justify-self-stretch min-h-[auto] min-w-[auto] break-words"></div>
                <div className="box-border caret-transparent gap-x-5 flex min-h-[auto] min-w-[auto] break-words gap-y-5 md:gap-x-12 md:gap-y-12">
                  <div className="relative text-blue-700 text-[15px] font-semibold bg-green-200 box-border caret-transparent leading-[22.5px] min-h-[auto] min-w-[auto] break-words p-5 rounded-[17px] md:text-3xl md:leading-[45px] md:p-10 md:rounded-[25px] after:accent-auto after:border-l-green-200 after:border-r-slate-200 after:border-t-slate-200 after:caret-transparent after:text-blue-700 after:block after:text-[15px] after:not-italic after:normal-nums after:font-semibold after:tracking-[-0.64px] after:leading-[22.5px] after:list-outside after:list-disc after:break-words after:pointer-events-auto after:absolute after:right-[-18px] after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:border-l-[18px] after:border-b-transparent after:border-b-[18px] after:border-separate after:top-5 after:font-pretendard after:md:text-3xl after:md:leading-[45px] after:md:right-[-33px] after:md:border-l-[33px] after:md:border-b-[33px] after:md:top-[26px]">
                    변제금 말고도 변호사비로
                    <br className="text-[15px] box-border caret-transparent leading-[22.5px] break-words md:text-3xl md:leading-[45px]" />
                    <span className="text-green-600 text-[15px] box-border caret-transparent leading-[22.5px] break-words md:text-3xl md:leading-[45px]">
                      달달이 60만원이나
                    </span>
                    내라고요?!
                  </div>
                  <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-[70px] md:w-[125px]">
                    <img
                      alt=""
                      src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/anguished-face.14mub2s-rsqk0.png"
                      className="text-transparent aspect-[auto_70_/_70] box-border max-w-full break-words align-baseline w-[70px] md:aspect-[auto_125_/_125] md:w-[125px]"
                    />
                  </div>
                </div>
              </div>
              <div className="box-border caret-transparent flex min-h-[auto] min-w-[auto] break-words">
                <div className="box-border caret-transparent gap-x-[25px] flex min-h-[auto] min-w-[auto] break-words gap-y-[25px] md:gap-x-12 md:gap-y-12">
                  <div className="items-center bg-white box-border caret-transparent flex h-[70px] justify-center min-h-[auto] min-w-[auto] break-words w-[70px] rounded-full md:h-[125px] md:w-[125px]">
                    <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-[55px] md:w-[105px]">
                      <img
                        alt=""
                        src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/130.svg"
                        className="text-transparent aspect-[auto_55_/_55] box-border max-w-full break-words align-baseline w-[55px] md:aspect-[auto_105_/_105] md:w-[105px]"
                      />
                    </div>
                  </div>
                  <div className="relative text-black text-[15px] font-semibold bg-indigo-200 box-border caret-transparent leading-[22.5px] min-h-[auto] min-w-[auto] break-words p-5 rounded-[17px] md:text-3xl md:leading-[45px] md:p-10 md:rounded-[25px] after:accent-auto after:border-l-slate-200 after:border-r-indigo-200 after:border-t-slate-200 after:caret-transparent after:text-black after:block after:text-[15px] after:not-italic after:normal-nums after:font-semibold after:left-[-18px] after:tracking-[-0.64px] after:leading-[22.5px] after:list-outside after:list-disc after:break-words after:pointer-events-auto after:absolute after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:border-r-[18px] after:border-b-transparent after:border-b-[18px] after:border-separate after:top-5 after:font-pretendard after:md:text-3xl after:md:left-[-33px] after:md:leading-[45px] after:md:border-r-[33px] after:md:border-b-[33px] after:md:top-[26px]">
                    저희 똑생 에서는
                    <br className="text-[15px] box-border caret-transparent leading-[22.5px] break-words md:text-3xl md:leading-[45px]" />
                    <span className="text-blue-700 text-[15px] box-border caret-transparent leading-[22.5px] break-words md:text-3xl md:leading-[45px]">
                      월 19만원만
                    </span>
                    내시면 돼요:)
                  </div>
                </div>
                <div className="self-stretch box-border caret-transparent basis-[0%] grow justify-self-stretch min-h-[auto] min-w-[auto] break-words"></div>
              </div>
            </div>
          </div>
          <div className="box-border caret-transparent gap-x-[25px] flex flex-col break-words gap-y-[25px] mt-5 md:gap-x-[35px] md:gap-y-[35px] md:mt-[62px]">
            <div className="bg-white box-border caret-transparent flex basis-[0%] flex-col grow min-h-[auto] min-w-[auto] break-words p-[25px] rounded-[15px] md:flex-row md:p-[70px] md:rounded-[30px]">
              <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words">
                <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
                  생활에 부담되지 않도록,
                  <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[50px] md:leading-[60px] md:text-start" />
                  <span className="relative text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[50px] md:leading-[60px] md:text-start after:accent-auto after:bg-green-300 after:caret-transparent after:text-gray-900 after:block after:text-[25px] after:not-italic after:normal-nums after:font-bold after:h-1/5 after:tracking-[-0.64px] after:leading-[33.25px] after:list-outside after:list-disc after:break-words after:pointer-events-auto after:absolute after:text-center after:no-underline after:indent-[0px] after:normal-case after:visible after:border-separate after:bottom-0 after:inset-x-0 after:font-pretendard after:md:text-[50px] after:md:leading-[60px] after:md:text-start">
                    <u className="relative text-blue-700 text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center z-[1] md:text-[50px] md:leading-[60px] md:text-start">
                      업계 유일
                    </u>
                  </span>
                  장기 분할납부제
                </h2>
                <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
                  경제적 자립의 걸림돌인 수임료 부담을 줄였어요
                </p>
              </div>
              <div className="self-stretch box-border caret-transparent basis-[0%] grow justify-self-stretch min-h-[auto] min-w-[auto] break-words"></div>
              <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words">
                <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-64 mt-[30px] md:w-[539px]">
                  <img
                    alt="똑생 월 납부액 19만원"
                    src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/157.png"
                    className="text-transparent aspect-[auto_256_/_262] box-border max-w-full break-words align-baseline w-64 md:aspect-[auto_539_/_552] md:w-[539px]"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white box-border caret-transparent flex flex-col min-h-[auto] min-w-[auto] break-words p-[25px] rounded-[15px] md:p-[70px] md:rounded-[30px]">
              <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words">
                <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[40px] md:leading-[48px] md:text-start md:mb-[15px]">
                  채권자가 많아도
                  <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[40px] md:leading-[48px] md:text-start" />
                  수임료를 더 받지 않아요
                </h2>
                <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
                  11명부터 추가금 청구
                </p>
              </div>
              <div className="self-stretch box-border caret-transparent basis-[0%] grow justify-self-stretch min-h-[auto] min-w-[auto] break-words"></div>
              <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words text-center mt-5 md:text-right">
                <a href="/product#price" className="box-border caret-transparent break-words text-center md:text-right">
                  <button
                    type="button"
                    className="btn-press relative appearance-none text-white text-base font-semibold items-center bg-sky-500 caret-transparent inline-flex h-12 justify-center leading-[19.2px] min-w-12 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-6 py-0 rounded-full md:text-2xl md:h-16 md:leading-[28.8px] md:min-w-0"
                  >
                    수임료 알아보기
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} id="team" className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-slate-100 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden py-5 rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:py-[100px] md:rounded-[33px]">
          <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:mb-[15px]">
            똑생을 만든
            <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words md:text-[50px] md:leading-[60px]" />
            전문가들을 만나보세요
          </h2>
          <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:mt-[15px]">
            각 분야의 전문가들이 모여 만드는 새로운 개인회생 이야기
          </p>
          <div className="box-border caret-transparent break-words mt-10 mb-0 md:mb-5">
            <div className="relative box-border caret-transparent list-none break-words z-[1] overflow-hidden mx-auto">
              <div className="relative caret-transparent flex h-full break-words translate-x-[-514.222px] w-full z-[1] md:translate-x-[-1117.8px]">
                <div className="relative box-border caret-transparent shrink-0 h-full min-h-[auto] min-w-[auto] break-words w-[182.778px] mr-[15px] md:w-[466.8px] md:mr-[30px]">
                  <a href="https://youtu.be/D8mxrSvCZ1M?si=Zr7pi0QqvmHdGUw0" className="box-border caret-transparent break-words">
                    <div className="box-border caret-transparent break-words">
                      <div className="box-border caret-transparent inline-block break-words w-full overflow-hidden rounded-[10px] md:rounded-[30px]">
                        <img
                          alt="전략 전문가"
                          src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/160.png"
                          className="text-transparent aspect-[auto_700_/_394] box-border max-w-full break-words align-baseline w-full"
                        />
                      </div>
                    </div>
                    <p className="text-slate-600 text-base font-semibold box-border caret-transparent leading-6 opacity-50 break-words text-center mt-[5px] md:text-3xl md:leading-[45px] md:mt-5">
                      전략 전문가
                    </p>
                  </a>
                </div>
                <div className="relative box-border caret-transparent shrink-0 h-full min-h-[auto] min-w-[auto] break-words w-[182.778px] mr-[15px] md:w-[466.8px] md:mr-[30px]">
                  <a href="https://youtu.be/CND-OpobQt0?si=WZjjBorSfbz4wFVG" className="box-border caret-transparent break-words">
                    <div className="box-border caret-transparent break-words">
                      <div className="box-border caret-transparent inline-block break-words w-full overflow-hidden rounded-[10px] md:rounded-[30px]">
                        <img
                          alt="고객상담 전문가"
                          src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/167.png"
                          className="text-transparent aspect-[auto_700_/_394] box-border max-w-full break-words align-baseline w-full"
                        />
                      </div>
                    </div>
                    <p className="text-slate-600 text-base font-semibold box-border caret-transparent leading-6 opacity-50 break-words text-center mt-[5px] md:text-3xl md:leading-[45px] md:mt-5">
                      고객상담 전문가
                    </p>
                  </a>
                </div>
                <div className="relative box-border caret-transparent shrink-0 h-full min-h-[auto] min-w-[auto] break-words w-[182.778px] mr-[15px] md:w-[466.8px] md:mr-[30px]">
                  <a href="https://youtu.be/iJG0GB9VZks?si=xmOpp6DjNeeCj7M7" className="box-border caret-transparent break-words">
                    <div className="box-border caret-transparent break-words">
                      <div className="box-border caret-transparent inline-block break-words w-full overflow-hidden rounded-[10px] md:rounded-[30px]">
                        <img
                          alt="소프트웨어 개발자"
                          src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/150.png"
                          className="text-transparent aspect-[auto_700_/_394] box-border max-w-full break-words align-baseline w-full"
                        />
                      </div>
                    </div>
                    <p className="text-slate-600 text-base font-semibold box-border caret-transparent leading-6 opacity-50 break-words text-center mt-[5px] md:text-3xl md:leading-[45px] md:mt-5">
                      소프트웨어 개발자
                    </p>
                  </a>
                </div>
                <div className="relative box-border caret-transparent shrink-0 h-full min-h-[auto] min-w-[auto] break-words w-[182.778px] mr-[15px] md:w-[466.8px] md:mr-[30px]">
                  <a href="https://youtu.be/ccDjysySykI?si=wV20-RogDkWTpMq_" className="box-border caret-transparent break-words">
                    <div className="box-border caret-transparent break-words">
                      <div className="box-border caret-transparent inline-block break-words w-full overflow-hidden rounded-[10px] md:rounded-[30px]">
                        <img
                          alt="개인회생 전문 대표 변호사"
                          src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/174.png"
                          className="text-transparent aspect-[auto_700_/_394] box-border max-w-full break-words align-baseline w-full"
                        />
                      </div>
                    </div>
                    <p className="text-slate-600 text-base font-semibold box-border caret-transparent leading-6 break-words text-center mt-[5px] md:text-3xl md:leading-[45px] md:mt-5">
                      개인회생 전문 대표 변호사
                    </p>
                  </a>
                </div>
                <div className="relative box-border caret-transparent shrink-0 h-full min-h-[auto] min-w-[auto] break-words w-[182.778px] mr-[15px] md:w-[466.8px] md:mr-[30px]">
                  <a href="https://youtu.be/nUESeu10nmM?si=zTD4z7y4xHYAJePU" className="box-border caret-transparent break-words">
                    <div className="box-border caret-transparent break-words">
                      <div className="box-border caret-transparent inline-block break-words w-full overflow-hidden rounded-[10px] md:rounded-[30px]">
                        <img
                          alt="분석 전문가"
                          src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/178.png"
                          className="text-transparent aspect-[auto_700_/_394] box-border max-w-full break-words align-baseline w-full"
                        />
                      </div>
                    </div>
                    <p className="text-slate-600 text-base font-semibold box-border caret-transparent leading-6 opacity-50 break-words text-center mt-[5px] md:text-3xl md:leading-[45px] md:mt-5">
                      분석 전문가
                    </p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative items-center bg-[radial-gradient(circle,rgb(255,255,255)_40%,rgb(229,229,255)_100%)] shadow-[rgba(0,0,255,0.3)_0px_0px_30px_0px_inset] box-border caret-transparent flex justify-center max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden rounded-[17px] md:shadow-[rgba(0,0,255,0.3)_0px_0px_110px_0px_inset] md:max-w-[2000px] md:min-h-[700px] md:rounded-[33px]">
          <div className="absolute box-border caret-transparent h-full break-words w-full overflow-hidden left-0 top-0">
            <div className="absolute box-border caret-transparent h-[800px] ml-[-400px] mt-[-400px] break-words w-[800px] left-2/4 top-2/4 md:h-[2000px] md:ml-[-1000px] md:mt-[-1000px] md:w-[2000px]">
              <img
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/image-2.png"
                className="aspect-[auto_1400_/_1400] box-border caret-transparent h-full max-w-full break-words align-baseline w-full"
              />
            </div>
          </div>
          <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words relative z-10">
            <p className="text-[21px] font-bold box-border caret-transparent leading-[31.5px] break-words text-center md:text-[44px] md:leading-[66px]">
              더욱 강력해진 완성형 개인회생 서비스
            </p>
            <div className="box-border caret-transparent inline-block break-words w-[297px] mt-2.5 md:w-[637px] md:mt-5">
              <img
                alt="똑생 V2"
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/173.svg"
                className="text-transparent aspect-[auto_297_/_88] box-border max-w-full break-words align-baseline w-[297px] md:aspect-[auto_637_/_190] md:w-[637px]"
              />
            </div>
            <div className="items-center box-border caret-transparent flex justify-center break-words">
              <a href="/product" className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words">
                <button
                  type="button"
                  className="btn-press relative appearance-none text-white text-lg font-semibold items-center bg-blue-700 shadow-[rgba(0,0,255,0.3)_0px_10px_15px_0px] caret-transparent inline-flex h-[60px] justify-center leading-[21.6px] min-w-[60px] outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle mt-[15px] px-7 py-0 rounded-full md:text-3xl md:shadow-[rgba(0,0,255,0.3)_0px_15px_20px_0px] md:h-20 md:leading-9 md:min-w-0 md:mt-[30px] md:px-10"
                >
                  서비스 소개 보기
                </button>
              </a>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex flex-col justify-center min-h-[auto] min-w-[auto] break-words py-[60px] md:py-[150px]">
        <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] min-h-[auto] min-w-[auto] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
          혹시 이것도 궁금하세요?
        </h2>
        <ul className="box-border caret-transparent gap-x-2.5 flex flex-col max-w-[700px] min-h-[auto] min-w-[auto] break-words gap-y-2.5 w-full mt-[30px] pl-0 md:gap-x-5 md:gap-y-5 md:mt-[73px]">
          {FAQ_DATA.map((item, i) => (
            <FAQItem key={i} question={item.question} answer={item.answer} />
          ))}
        </ul>
      </RevealSection>
    </div>
  );
};
