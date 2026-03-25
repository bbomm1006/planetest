import { useEffect, useRef, useState } from "react";

export const BottomBanner = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="items-center box-border caret-transparent flex justify-center break-words w-full">
      <div className={`text-black bg-white box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden mb-[80px] py-5 rounded-[17px] transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} md:max-w-[2000px] md:min-h-[700px] md:py-[100px] md:rounded-[33px]`}>
        <div className="items-center box-border caret-transparent flex flex-col justify-center break-words">
          <h3 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] min-h-[auto] min-w-[auto] break-words my-[30px] md:text-[52px] md:leading-[62.4px]">
            처음 만나는 똑똑한 개인회생
          </h3>
          <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-[140px] mt-[30px] mb-6 md:w-80 md:mt-[75px] md:mb-[70px]">
            <img
              alt="똑생"
              src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/135.svg"
              className="text-transparent aspect-[auto_140_/_55] box-border max-w-full break-words align-baseline w-[140px] md:aspect-[auto_320_/_126] md:w-80"
            />
          </div>
          <div className="items-center box-border caret-transparent gap-x-2.5 flex flex-col min-h-[auto] min-w-[auto] break-words gap-y-2.5 mt-[65px] md:gap-x-5 md:flex-row md:gap-y-5 md:mt-[73px]">
            <a
              href="https://app.ddok.life/intake/wep/diagnosis"
              className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words"
            >
              <button
                type="button"
                className="btn-press relative appearance-none text-white text-base font-semibold items-center bg-sky-500 caret-transparent inline-flex h-12 justify-center leading-[19.2px] min-w-12 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-6 py-0 rounded-full md:text-lg md:h-[60px] md:leading-[21.6px] md:min-w-[60px] md:px-7 before:accent-auto before:bg-blue-700/10 before:caret-transparent before:text-blue-700 before:block before:text-xs before:not-italic before:normal-nums before:font-semibold before:tracking-[-0.64px] before:leading-6 before:list-outside before:list-disc before:break-words before:pointer-events-auto before:absolute before:text-center before:no-underline before:indent-[0px] before:normal-case before:text-nowrap before:top-[-34px] before:visible before:px-2.5 before:rounded-full before:border-separate before:font-pretendard before:md:text-sm after:accent-auto after:border-t-blue-700/10 after:caret-transparent after:text-white after:block after:text-base after:not-italic after:normal-nums after:font-semibold after:tracking-[-0.64px] after:leading-[19.2px] after:list-outside after:list-disc after:break-words after:pointer-events-auto after:absolute after:text-center after:no-underline after:indent-[0px] after:normal-case after:text-nowrap after:visible after:border-b-transparent after:border-x-transparent after:border-separate after:border-[6px] after:border-solid after:-top-2.5 after:font-pretendard after:md:text-lg after:md:leading-[21.6px]"
              >
                초정밀 예상 탕감액 진단
              </button>
            </a>
            <a
              href="https://app.ddok.life/intake/wep/apply"
              className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words"
            >
              <button
                type="button"
                className="btn-press relative appearance-none text-green-700 text-base font-semibold items-center bg-green-200 caret-transparent inline-flex h-12 justify-center leading-[19.2px] min-w-12 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-6 py-0 rounded-full md:text-lg md:h-[60px] md:leading-[21.6px] md:min-w-[60px] md:px-7"
              >
                지금 서비스 신청하기
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
