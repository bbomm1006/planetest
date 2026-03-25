export const ReviewHeader = () => {
  return (
    <div className="relative flex items-center justify-between box-border caret-transparent break-words mb-6 px-[17px] md:mb-[36px] md:px-[60px]">
      <div className="flex items-center gap-x-2.5 min-w-0">
        <span className="text-2xl flex-shrink-0 md:text-3xl">⭐</span>
        <div>
          <h2 className="text-[20px] font-bold caret-transparent leading-[1.4] break-words md:text-[28px]">
            실제 고객의 소감은?
          </h2>
          <p className="text-sky-500 text-[13px] font-semibold caret-transparent leading-[1.5] break-words md:text-[15px]">
            고객님 의향에 의해 직접 작성해 주신 후기 입니다
          </p>
        </div>
      </div>
      <button
        type="button"
        className="flex-shrink-0 ml-4 appearance-none text-black text-xs font-bold bg-amber-300 caret-transparent flex items-center justify-center h-8 px-4 rounded-full whitespace-nowrap hover:bg-amber-400 transition-colors md:text-sm md:h-9 md:px-5"
      >
        모두보기
      </button>
    </div>
  );
};
