export const CTASection = () => {
  return (
    <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
      <div className="relative items-center bg-[radial-gradient(circle,rgb(255,255,255)_40%,rgb(229,229,255)_100%)] shadow-[rgba(0,0,255,0.3)_0px_0px_30px_0px_inset] box-border caret-transparent flex justify-center max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden rounded-[17px] md:shadow-[rgba(0,0,255,0.3)_0px_0px_110px_0px_inset] md:max-w-[1400px] md:min-h-[700px] md:rounded-[33px]">
        <div className="absolute box-border caret-transparent h-full break-words w-full overflow-hidden left-0 top-0">
          <div className="absolute box-border caret-transparent h-[800px] ml-[-400px] mt-[-400px] break-words w-[800px] left-2/4 top-2/4 md:h-[2000px] md:ml-[-1000px] md:mt-[-1000px] md:w-[2000px]">
            <img
              src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/image-2.png"
              className="aspect-[auto_1400_/_1400] box-border caret-transparent h-full max-w-full break-words align-baseline w-full"
            />
          </div>
        </div>
        <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words">
          <p className="text-[21px] font-bold box-border caret-transparent leading-[31.5px] break-words text-center md:text-[44px] md:leading-[66px]">
            완성도를 높인 클린메이트 청소 서비스
          </p>
          <div className="box-border caret-transparent inline-block break-words w-[297px] mt-2.5 md:w-[637px] md:mt-5">
            <img
              alt="클린메이트 V2"
              src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/173.svg"
              className="text-transparent aspect-[auto_297_/_88] box-border max-w-full break-words align-baseline w-[297px] md:aspect-[auto_637_/_190] md:w-[637px]"
            />
          </div>
          <div className="items-center box-border caret-transparent flex justify-center break-words">
            <a
              href="/product"
              className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words"
            >
              <button
                type="button"
                className="relative appearance-none text-white text-lg font-semibold items-center bg-blue-700 shadow-[rgba(0,0,255,0.3)_0px_10px_15px_0px] caret-transparent inline-flex h-[60px] justify-center leading-[21.6px] min-w-[60px] outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle mt-[15px] px-7 py-0 rounded-full md:text-3xl md:shadow-[rgba(0,0,255,0.3)_0px_15px_20px_0px] md:h-20 md:leading-9 md:min-w-0 md:mt-[30px] md:px-10"
              >
                서비스 소개 보기
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
