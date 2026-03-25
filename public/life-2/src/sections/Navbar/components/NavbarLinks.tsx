export const NavbarLinks = () => {
  return (
    <ul className="items-center box-border caret-transparent gap-x-0.5 flex h-[60px] list-none max-w-[2000px] min-h-[auto] min-w-[auto] break-words gap-y-0.5 w-full pl-0 md:gap-x-[15px] md:h-20 md:gap-y-[15px]">
      <a
        href="#hero"
        className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words"
      >
        <div className="text-red-400 text-[15px] font-bold bg-blue-700/10 box-border caret-transparent leading-[22.5px] break-words px-2.5 py-[5px] rounded-[10px] nav-link md:text-xl md:leading-[30px] md:px-[15px] md:py-2">
          레드존렌트카 소개
        </div>
      </a>
      <a
        href="#pricing"
        className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words"
      >
        <div className="text-black text-[15px] font-bold box-border caret-transparent leading-[22.5px] break-words px-2.5 py-[5px] rounded-[10px] nav-link md:text-xl md:leading-[30px] md:px-[15px] md:py-2">
          이용료 안내
        </div>
      </a>
      <div className="text-black text-[15px] font-bold box-border caret-transparent leading-[22.5px] min-h-[auto] min-w-[auto] break-words px-2.5 py-[5px] rounded-[10px] nav-link cursor-pointer md:text-xl md:leading-[30px] md:px-[15px] md:py-2">
        <span className="text-[15px] box-border caret-transparent grow leading-[22.5px] break-words md:text-xl md:leading-[30px]">
          유용한 정보
        </span>
      </div>
      <div className="self-stretch box-border caret-transparent basis-[0%] grow justify-self-stretch min-h-[auto] min-w-[auto] break-words"></div>
      <a
        href="#team"
        className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words"
      >
        <div className="text-black text-[15px] font-bold box-border caret-transparent leading-[22.5px] break-words px-2.5 py-[5px] rounded-[10px] nav-link md:text-xl md:leading-[30px] md:px-[15px] md:py-2">
          💙 만든이들
        </div>
      </a>
    </ul>
  );
};
