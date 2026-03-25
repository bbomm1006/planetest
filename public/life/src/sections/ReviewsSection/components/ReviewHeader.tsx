export const ReviewHeader = () => {
  return (
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
            className="absolute appearance-none text-black text-xs font-semibold items-center bg-amber-300 caret-transparent flex h-6 justify-center leading-[14.4px] min-w-6 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-2 py-0 rounded-full right-[30px] top-[35px] md:text-base md:h-10 md:leading-[19.2px] md:min-w-10 md:px-4 md:right-[60px] md:top-[65px]"
          >
            모두보기
          </button>
        </a>
      </div>
    </div>
  );
};
