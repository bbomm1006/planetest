export const HeroButtons = () => {
  return (
    <div className="items-center box-border caret-transparent gap-x-2.5 flex flex-col min-h-[auto] min-w-[auto] break-words gap-y-2.5 mt-[65px] md:gap-x-5 md:flex-row md:gap-y-5 md:mt-[73px]">
      <a
        href="https://app.ddok.life/intake/wep/diagnosis"
        className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words"
      >
        <button
          type="button"
          className="btn-press relative appearance-none text-white text-base font-semibold items-center bg-sky-500 caret-transparent inline-flex h-12 justify-center leading-[19.2px] min-w-12 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-6 py-0 rounded-full md:text-lg md:h-[60px] md:leading-[21.6px] md:min-w-[60px] md:px-7 before:accent-auto before:bg-blue-700/10 before:caret-transparent before:text-blue-700 before:block before:text-xs before:not-italic before:normal-nums before:font-semibold before:tracking-[-0.64px] before:leading-6 before:list-outside before:list-disc before:break-words before:pointer-events-auto before:absolute before:text-center before:no-underline before:indent-[0px] before:normal-case before:text-nowrap before:top-[-34px] before:visible before:px-2.5 before:rounded-full before:border-separate before:font-pretendard before:md:text-sm after:accent-auto "
        >
          예상 비용 확인하기
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
          지금 바로 예약하기
        </button>
      </a>
    </div>
  );
};
