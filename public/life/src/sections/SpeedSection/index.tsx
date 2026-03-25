export const SpeedSection = () => {
  return (
    <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
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
                <span className="text-[27px] font-extrabold box-border caret-transparent leading-[40.5px] break-words text-nowrap mr-2.5">
                  금지명령 평균
                </span>
                <span className="text-[50px] font-extrabold box-border caret-transparent leading-[75px] break-words text-nowrap">
                  4.9일
                </span>
              </div>
            </div>
            <div className="absolute box-border caret-transparent break-words translate-x-[17.6857px] translate-y-[33.8682px] rotate-[-7.999970437763044deg] scale-[0.7999994825248326]">
              <div className="text-white backdrop-blur-[10px] bg-green-500/60 box-border caret-transparent break-words text-center text-nowrap px-[30px] py-2.5 rounded-full">
                <span className="text-[27px] font-extrabold box-border caret-transparent leading-[40.5px] break-words text-nowrap mr-2.5">
                  개시결정 평균
                </span>
                <span className="text-[50px] font-extrabold box-border caret-transparent leading-[75px] break-words text-nowrap">
                  2.5개월
                </span>
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
    </div>
  );
};
