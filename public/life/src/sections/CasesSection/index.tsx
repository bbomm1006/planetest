import { useEffect, useRef, useState } from "react";
import { CaseGrid } from "@/sections/CasesSection/components/CaseGrid";
import { TeamCarouselSection } from "@/sections/CasesSection/components/TeamCarouselSection";

const FAQ_DATA = [
  {
    question: "어떤 청소 서비스인가요?",
    answer: "클린메이트는 입주청소, 이사청소, 정기청소를 전문으로 하는 청소 서비스입니다. 전문 장비와 친환경 세제를 사용하여 고객님의 공간을 깨끗하고 쾌적하게 만들어드립니다.",
  },
  {
    question: "정기 청소 외 다른 서비스도 있나요?",
    answer: "네, 가능합니다. 입주청소, 이사청소, 원룸청소, 사무실청소 등 다양한 맞춤형 서비스를 제공하고 있습니다. 고객님의 상황에 맞춰 최적의 청소를 진행해드립니다.",
  },
  {
    question: "다른 업체보다 어떤 점이 좋나요?",
    answer: "경험 많은 전문 인력, 체계적인 청소 프로세스, 친환경 세제 사용, 그리고 사후 관리까지 책임지는 서비스로 높은 만족도를 제공합니다.",
  },
  {
    question: "입주청소? 이사청소? 뭐가 다른가요?",
    answer: "입주청소는 새로 입주하기 전 공간을 깨끗하게 정리하는 것이고, 이사청소는 기존 거주 흔적을 제거하고 다음 입주자를 위해 청소하는 서비스입니다. 상황에 맞게 선택하시면 됩니다.",
  },
  {
    question: "욕실, 주방, 에어컨 등 특수청소도 되나요?",
    answer: "네, 가능합니다. 욕실, 주방, 베란다, 에어컨 등 오염이 심한 공간도 전문 장비를 활용해 꼼꼼하게 청소해드립니다.",
  },
  {
    question: "청소 후 하자가 생기면 어떻게 하나요?",
    answer: "청소 완료 후 미흡한 부분이 있을 경우 일정 기간 내 무상 A/S를 제공해드립니다. 고객 만족을 최우선으로 책임지고 처리해드립니다.",
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

function ReviewCard({ review }: { review: { img: string; name: string; meta: string; tags: string[]; title: string; body: string } }) {
  return (
    <div className="relative box-border caret-transparent shrink-0 h-full min-h-[auto] min-w-[auto] break-words w-[320px] md:w-[548px]">
      <div className="relative bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent flex flex-col break-words mb-2.5 p-5 rounded-2xl aspect-square md:shadow-none md:mb-0 md:p-[40px]">
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

        {/* 본문 + 그라디언트 페이드 */}
        <div className="relative flex-1 overflow-hidden mt-2.5 md:mt-4">
          <p className="text-sm text-gray-500 leading-relaxed md:text-base md:leading-7">
            {review.body}
          </p>
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="items-center box-border caret-transparent flex justify-center break-words mt-4">
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
        <div className="box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden py-[30px] rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:py-[110px] md:rounded-[33px]">
          <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:mb-[15px]">
            어떤 공간이든, 어떤 상황이든
            <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words md:text-[50px] md:leading-[60px]" />
            전문가의 손길이 가능해요
          </h2>
          <div className="items-center box-border caret-transparent flex justify-center break-words">
            <a href="https://app.ddok.life/intake/wep/diagnosis">
              <button
                type="button"
                className="btn-press relative appearance-none text-white text-base font-semibold items-center bg-green-600 caret-transparent flex h-12 justify-center leading-[19.2px] min-h-[auto] min-w-12 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-6 py-0 rounded-full md:text-lg md:h-[60px] md:leading-[21.6px] md:min-w-[60px] md:px-7"
              >
                초간단 청소 견적 받기
              </button>
            </a>
          </div>
          <div className="items-center box-border caret-transparent flex justify-center break-words mt-[30px] md:mt-[77px]">
            <CaseGrid />
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:rounded-[33px]">
          <div className="absolute items-center box-border caret-transparent flex h-full justify-center break-words w-full left-0 top-0 after:accent-auto after:bg-emerald-600/90 after:caret-transparent after:text-gray-900 after:block after:text-base after:not-italic after:normal-nums after:font-normal after:h-full after:tracking-[-0.64px] after:leading-6 after:list-outside after:list-disc after:break-words after:pointer-events-auto after:absolute after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:w-full after:border-separate after:left-0 after:top-0 after:font-pretendard">
            <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words rotate-[-19.99995654637864deg] w-[300px] scale-[1.8000029963852837] md:w-[500px]">
              <img
                alt="클린메이트은 청결입니다"
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/164.png"
                className="text-transparent aspect-[auto_300_/_273] box-border max-w-full break-words align-baseline w-[300px] md:aspect-[auto_500_/_454] md:w-[500px]"
              />
            </div>
          </div>
          <div className="absolute text-white items-center box-border caret-transparent flex flex-col h-full justify-center break-words text-center w-full left-0 top-0">

            <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] min-h-[auto] min-w-[auto] break-words mt-[5px] mb-2 md:text-[50px] md:leading-[60px] md:mt-5 md:mb-[15px]">
              기준이 다른 청소,
              <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words md:text-[50px] md:leading-[60px]" />
              클린메이트
            </h2>
            <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] min-h-[auto] min-w-[auto] break-words mt-2 md:text-xl md:leading-[30px] md:mt-[15px]">
              디테일까지 놓치지 않는
              <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words md:text-xl md:leading-[30px]" />
              프리미엄 클리닝 서비스를 경험해보세요
            </p>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={150} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-green-100 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden py-[30px] rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:py-[60px] md:rounded-[33px]">
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
                  왜 클린메이트?
                </h2>
                <p className="text-indigo-400 text-sm font-semibold box-border caret-transparent leading-[21px] break-words md:text-lg md:leading-[27px]">
                  고객님들의 리얼 후기로 확인해보세요.
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
                { img: "138.png", name: "유○○", meta: "30대 / 여성 / 프리랜서", tags: ["꼼꼼한 청소", "시간 약속 준수", "친절한 응대", "가성비 좋음"], title: "집 상태가 너무 깔끔해져서 처음 들어왔을 때 기분이 정말 좋았어요", body: "처음에는 반신반의했는데 막상 결과를 보고 깜짝 놀랐어요. 구석구석 정말 꼼꼼하게 청소해주셔서 집이 새것처럼 바뀌었습니다. 특히 시간 약속도 칼같이 지켜주셔서 믿음이 갔어요. 가격 대비 퀄리티가 너무 좋아서 주변에도 추천하고 있습니다." },
                { img: "128.png", name: "김○○", meta: "20대 / 남성 / 대학생", tags: ["빠른 예약", "깔끔한 마무리", "친절한 안내", "편한 진행"], title: "자취방 맡겼는데 기대 이상으로 깨끗해져서 만족합니다", body: "예약도 앱으로 간편하게 할 수 있어서 좋았고, 담당자분이 진행 과정을 친절하게 안내해주셔서 처음 이용했는데도 전혀 불편함이 없었어요. 자취방이라 좁고 어수선했는데 끝나고 나서 보니 진짜 깨끗해져서 기분이 좋았습니다." },
                { img: "156.png", name: "박○○", meta: "30대 / 남성 / 자영업", tags: ["빠른 작업", "전문적인 청소", "체계적인 진행", "신뢰감"], title: "가게 청소 맡겼는데 확실히 전문가 느낌이 나네요", body: "영업 전 가게 청소를 맡겼는데 작업 속도도 빠르고 체계적으로 진행해주셔서 영업 준비에 전혀 지장이 없었습니다. 일반 청소업체랑은 확실히 다른 전문성이 느껴졌고, 손이 잘 안 닿는 곳까지 꼼꼼하게 해주셔서 다음에도 꼭 이용할 예정입니다." },
                { img: "133.png", name: "최○○", meta: "40대 / 여성 / 주부", tags: ["꼼꼼한 디테일", "합리적인 가격", "전문 장비", "깔끔한 결과"], title: "주방이 특히 만족스러웠고 전체적으로 정말 깨끗해졌어요", body: "주방 기름때가 너무 심해서 걱정했는데 전문 장비로 말끔하게 제거해주셨어요. 일반 청소로는 절대 안 될 것 같았던 부분들도 다 깨끗하게 해주셔서 정말 감동받았습니다. 가격도 다른 곳에 비해 합리적이라 부담 없이 이용할 수 있었어요." },
                { img: "124.png", name: "정○○", meta: "20대 / 여성 / 직장인", tags: ["친절한 상담", "빠른 진행", "정확한 시간", "깔끔한 마무리"], title: "처음 맡겨봤는데 응대도 좋고 결과도 만족입니다", body: "청소 서비스를 처음 이용해봐서 많이 낯설었는데 상담부터 마무리까지 친절하게 안내해주셔서 편하게 진행할 수 있었어요. 정해진 시간에 정확히 오셔서 믿음이 갔고, 마무리도 깔끔하게 해주셔서 다음에도 꼭 이용할 것 같아요." },
                { img: "145.png", name: "이○○", meta: "50대 / 남성 / 개인사업자", tags: ["체계적인 서비스", "믿을 수 있는 업체", "확실한 결과", "만족도 높음"], title: "다음에도 재이용할 생각입니다. 믿고 맡길 수 있네요", body: "여러 청소 업체를 써봤는데 이렇게 체계적으로 운영하는 곳은 처음이었어요. 진행 상황을 중간중간 알려주시고 결과물도 확실해서 신뢰가 생겼습니다. 바쁜 사업장 특성상 빠르고 정확한 서비스가 필요했는데 딱 맞게 해주셔서 정말 만족합니다." },
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
        <div className="box-border caret-transparent flex max-w-none min-h-[360px] min-w-[auto] break-words w-full rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:rounded-[33px]">
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
        <div className="box-border caret-transparent flex flex-col max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden p-5 rounded-[17px] md:flex-row md:max-w-[1400px] md:min-h-[700px] md:p-[100px] md:rounded-[33px]">
          <h2 className="static text-[25px] font-bold box-border caret-transparent leading-[33.25px] min-h-[auto] min-w-[auto] break-words text-center z-[2] mb-2 md:absolute md:text-[50px] md:leading-[60px] md:min-h-0 md:min-w-0 md:text-start md:mb-[15px]">
            쉽고 빠르게 끝내는
            <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[50px] md:leading-[60px] md:text-start" />
            올인원 청소 서비스
          </h2>
          <div className="self-stretch box-border caret-transparent basis-[0%] grow justify-self-stretch min-h-[auto] min-w-[auto] break-words"></div>
          <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words">
            <div className="relative box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-auto overflow-hidden mt-[30px] md:w-[900px] md:mt-0 before:accent-auto before:bg-[linear-gradient(to_right,rgb(255,255,255),rgba(255,255,255,0))] before:caret-transparent before:text-gray-900 before:block before:text-base before:not-italic before:normal-nums before:font-normal before:tracking-[-0.64px] before:leading-6 before:list-outside before:list-disc before:break-words before:pointer-events-auto before:absolute before:text-start before:no-underline before:indent-[0px] before:normal-case before:visible before:w-[30px] before:z-[1] before:border-separate before:inset-y-0 before:font-pretendard before:md:w-[100px] after:accent-auto after:bg-[linear-gradient(to_left,rgb(255,255,255),rgba(255,255,255,0))] after:caret-transparent after:text-gray-900 after:block after:text-base after:not-italic after:normal-nums after:font-normal after:tracking-[-0.64px] after:leading-6 after:list-outside after:list-disc after:break-words after:pointer-events-auto after:absolute after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:w-[30px] after:z-[1] after:border-separate after:right-0 after:inset-y-0 after:font-pretendard after:md:w-[100px]">
              <div className="animate-marquee flex gap-x-2.5 md:gap-x-[46px]" style={{width:"max-content"}}>
                {[
                  { img: "144.png", label: "청소 상세 안내서" },
                  { img: "person-running.0yi2wt8f7fvts.png", label: "청소용품 무상 제공" },
                  { img: "183.png", label: "청소 내역 온라인 관리" },
                  { img: "188.png", label: "맞춤 청소 진단" },
                  { img: "rocket.0tm7okw41dt6i.png", label: "당일 청소 완료" },
                  { img: "127.png", label: "진행상황 자동알림" },
                  { img: "147.png", label: "실시간 채팅상담" },
                  { img: "132.png", label: "청소 품질 컨설팅" },
                  { img: "spiral-calendar.0z-4n620wwoy0.png", label: "일정 미리 안내" },
                  { img: "159.png", label: "소모품 대리 구매" },
                  { img: "144.png", label: "청소 상세 안내서" },
                  { img: "person-running.0yi2wt8f7fvts.png", label: "청소용품 무상 제공" },
                  { img: "183.png", label: "청소 내역 온라인 관리" },
                  { img: "188.png", label: "맞춤 청소 진단" },
                  { img: "rocket.0tm7okw41dt6i.png", label: "당일 청소 완료" },
                  { img: "127.png", label: "진행상황 자동알림" },
                  { img: "147.png", label: "실시간 채팅상담" },
                  { img: "132.png", label: "청소 품질 컨설팅" },
                  { img: "spiral-calendar.0z-4n620wwoy0.png", label: "일정 미리 안내" },
                  { img: "159.png", label: "소모품 대리 구매" },
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
        <div className="relative bg-[url('https://www.ddok.life/_next/static/media/reduce-rate-bg.0n472h56-261o.png')] bg-cover box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden bg-center py-5 rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:py-[100px] md:rounded-[33px]">
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
              실제 고객 만족도
            </h2>
            <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-80 -mr-7 mt-[5px] md:w-[800px] md:mt-[30px]">
              <img
                alt="96.7%"
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/187.svg"
                className="text-transparent aspect-[auto_320_/_115] box-border max-w-full break-words align-baseline w-80 md:aspect-[auto_800_/_287] md:w-[800px]"
              />
            </div>
            <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] min-h-[auto] min-w-[auto] break-words text-center mt-[30px] md:text-xl md:leading-[30px] md:mt-[50px]">
              체계적인 청소 프로세스와
              <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words md:text-xl md:leading-[30px]" />
              전문 인력의 꼼꼼한 작업으로 높은 만족도를 제공합니다
            </p>
          </div>
        </div>
      </RevealSection>
     
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-[url('https://www.ddok.life/_next/static/media/document-issuance-bg.0.b-rfqye9i4p.png')] bg-cover box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden bg-center px-0 py-5 rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:p-[100px] md:rounded-[33px]">
         
          <div className="static text-green-800 box-border caret-transparent break-words my-5 md:absolute">
            <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
              번거로운 청소는 이제 그만
            </h2>
            <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
              직접 하기엔 시간도 많이 들고 힘들죠
              <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
              클린메이트가 대신 깔끔하게 해결해드립니다
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
        <div className="relative bg-amber-200 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden px-0 py-5 rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:p-[100px] md:rounded-[33px]">
          <div className="static text-green-800 box-border caret-transparent break-words my-5 md:absolute">
            <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
              전국 어디든 가능한 풍부한 청소 경험
            </h2>
            <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
              클린메이트는 전국 어디서든 OK!
              <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
              다양한 현장 경험으로 공간에 맞는 청소를 제공합니다
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
        <div className="relative bg-green-200 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden pt-10 pb-5 px-5 rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:p-[100px] md:rounded-[33px]">
          <div className="static text-green-800 box-border caret-transparent break-words my-5 md:absolute">
            <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
              전국 어디든 가능한 풍부한 청소 경험
            </h2>
            <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
              클린메이트는 전국 어디서든 OK!
              <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
              다양한 현장 경험으로 공간에 맞는 청소를 제공합니다
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
        <div className="relative bg-zinc-100 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden pt-10 pb-5 px-5 rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:p-[100px] md:rounded-[33px]">
          <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
            체계적인 청소 시스템으로
            <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[50px] md:leading-[60px] md:text-start" />
            완성된 프리미엄 클린 서비스
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
            체계적인 청소 시스템으로
            <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
            고객님의 공간을 가장 깨끗한 상태로 만들어드립니다
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
        <div className="relative bg-zinc-100 box-border caret-transparent h-[380px] max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:rounded-[33px]">
          <div className="absolute box-border caret-transparent opacity-100 break-words top-[-25px] w-[560px] right-0 md:opacity-50 md:w-[1500px] md:top-0">
            <img
              alt="클린메이트 화면"
              src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/175.png"
              className="text-transparent aspect-[auto_560_/_348] box-border max-w-full break-words align-baseline w-[560px] md:aspect-[auto_1500_/_931] md:w-[1500px]"
            />
          </div>
          <div className="absolute box-border caret-transparent break-words w-full p-5 bottom-0 md:p-[100px]">
            <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
              클릭 한 번으로 예약 끝
            </h2>
            <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
              복잡한 과정 없이
              <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
              쉽고 빠르게 청소를 예약하세요
            </p>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative bg-gray-700 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden py-5 rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:py-[100px] md:rounded-[33px]">
          <div className="items-center box-border caret-transparent flex flex-col justify-center break-words">
            <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-20 my-[30px] md:w-[330px]">
              <img
                alt="클린메이트"
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/163.svg"
                className="text-transparent aspect-[auto_80_/_117] box-border max-w-full break-words align-baseline w-20 md:aspect-[auto_330_/_482] md:w-[330px]"
              />
            </div>
            <div className="static text-white box-border caret-transparent min-h-[auto] min-w-[auto] break-words ml-0 left-2/4 bottom-5 md:absolute md:min-h-0 md:min-w-0 md:ml-[200px] md:bottom-[126px]">
              <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
                믿고 맡길 수 있는
                <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[50px] md:leading-[60px] md:text-start" />
                전문 청소 인력
              </h2>
              <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
                경험과 디테일을 갖춘 전문가들이
                <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
                <span className="text-stone-400 text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start">
                  상담부터 청소까지
                </span>
                완성도 높은 청소를 제공합니다
              </p>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection delay={100} id="pricing" className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="bg-indigo-100 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden p-[25px] rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:p-[35px] md:rounded-[33px]">
          <div className="items-center box-border caret-transparent flex justify-center break-words mt-0 md:mt-[30px]">
            <div className="box-border caret-transparent gap-x-[23px] flex flex-col max-w-[470px] min-h-[auto] min-w-[auto] break-words gap-y-[23px] w-full md:gap-x-[45px] md:max-w-[826px] md:gap-y-[45px]">
              <div className="box-border caret-transparent flex min-h-[auto] min-w-[auto] break-words">
                <div className="self-stretch box-border caret-transparent basis-[0%] grow justify-self-stretch min-h-[auto] min-w-[auto] break-words"></div>
                <div className="box-border caret-transparent gap-x-5 flex min-h-[auto] min-w-[auto] break-words gap-y-5 md:gap-x-12 md:gap-y-12">
                  <div className="relative text-blue-700 text-[15px] font-semibold bg-green-200 box-border caret-transparent leading-[22.5px] min-h-[auto] min-w-[auto] break-words p-5 rounded-[17px] md:text-3xl md:leading-[45px] md:p-10 md:rounded-[25px] after:accent-auto after:border-l-green-200 after:border-r-slate-200 after:border-t-slate-200 after:caret-transparent after:text-blue-700 after:block after:text-[15px] after:not-italic after:normal-nums after:font-semibold after:tracking-[-0.64px] after:leading-[22.5px] after:list-outside after:list-disc after:break-words after:pointer-events-auto after:absolute after:right-[-18px] after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:border-l-[18px] after:border-b-transparent after:border-b-[18px] after:border-separate after:top-5 after:font-pretendard after:md:text-3xl after:md:leading-[45px] after:md:right-[-33px] after:md:border-l-[33px] after:md:border-b-[33px] after:md:top-[26px]">
                    청소 한 번 맡기는데
                    <br className="text-[15px] box-border caret-transparent leading-[22.5px] break-words md:text-3xl md:leading-[45px]" />
                    <span className="text-green-600 text-[15px] box-border caret-transparent leading-[22.5px] break-words md:text-3xl md:leading-[45px]">
                      비용이 너무 부담
                    </span>
                    되셨나요?
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
                        src="cleanmate_logo.svg"
                        className="text-transparent aspect-[auto_55_/_55] box-border max-w-full break-words align-baseline w-[55px] md:aspect-[auto_105_/_105] md:w-[105px]"
                      />
                    </div>
                  </div>
                  <div className="relative text-black text-[15px] font-semibold bg-indigo-200 box-border caret-transparent leading-[22.5px] min-h-[auto] min-w-[auto] break-words p-5 rounded-[17px] md:text-3xl md:leading-[45px] md:p-10 md:rounded-[25px] after:accent-auto after:border-l-slate-200 after:border-r-indigo-200 after:border-t-slate-200 after:caret-transparent after:text-black after:block after:text-[15px] after:not-italic after:normal-nums after:font-semibold after:left-[-18px] after:tracking-[-0.64px] after:leading-[22.5px] after:list-outside after:list-disc after:break-words after:pointer-events-auto after:absolute after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:border-r-[18px] after:border-b-transparent after:border-b-[18px] after:border-separate after:top-5 after:font-pretendard after:md:text-3xl after:md:left-[-33px] after:md:leading-[45px] after:md:border-r-[33px] after:md:border-b-[33px] after:md:top-[26px]">
                    저희 클린메이트 에서는
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
                    alt="클린메이트 월 정기 이용료"
                    src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/157.png"
                    className="text-transparent aspect-[auto_256_/_262] box-border max-w-full break-words align-baseline w-64 md:aspect-[auto_539_/_552] md:w-[539px]"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white box-border caret-transparent flex flex-col min-h-[auto] min-w-[auto] break-words p-[25px] rounded-[15px] md:p-[70px] md:rounded-[30px]">
              <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words">
                <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[40px] md:leading-[48px] md:text-start md:mb-[15px]">
                  추가 비용 없이
                  <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[40px] md:leading-[48px] md:text-start" />
                  합리적인 가격으로 진행합니다
                </h2>
                <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
                  작업 범위에 따른 명확한 견적으로 안내드려요
                </p>
              </div>
              <div className="self-stretch box-border caret-transparent basis-[0%] grow justify-self-stretch min-h-[auto] min-w-[auto] break-words"></div>
              <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words text-center mt-5 md:text-right">
                <a href="/product#price" className="box-border caret-transparent break-words text-center md:text-right">
                  <button
                    type="button"
                    className="btn-press relative appearance-none text-white text-base font-semibold items-center bg-sky-500 caret-transparent inline-flex h-12 justify-center leading-[19.2px] min-w-12 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-6 py-0 rounded-full md:text-2xl md:h-16 md:leading-[28.8px] md:min-w-0"
                  >
                    견적 알아보기
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
      <TeamCarouselSection />
      <RevealSection delay={100} className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
        <div className="relative items-center bg-[radial-gradient(circle,rgb(255,255,255)_40%,rgb(229,229,255)_100%)] shadow-[rgba(0,0,255,0.3)_0px_0px_30px_0px_inset] box-border caret-transparent flex justify-center max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden rounded-[17px] md:shadow-[rgba(0,0,255,0.3)_0px_0px_110px_0px_inset] md:max-w-[1400px] md:min-h-[700px] md:rounded-[33px]">
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
              눈에 보이는 완성형 청소 결과
            </p>
            <div className="box-border caret-transparent inline-block break-words w-[297px] mt-2.5 md:w-[637px] md:mt-5">
              <img
                alt="클린메이트 V2"
                src="/cleanmate_logo.svg"
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
