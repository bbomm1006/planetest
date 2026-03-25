export type EventSectionDisclaimerProps = {
  items: React.ReactNode[];
};

export const EventSectionDisclaimer = (props: EventSectionDisclaimerProps) => {
  return (
    <div className="relative bg-neutral-800 box-border caret-transparent tracking-[-0.8px] text-left overflow-hidden md:tracking-[-1.2px]">
      <div className="relative box-border caret-transparent tracking-[-0.8px] max-w-full mx-auto px-5 md:tracking-[-1.2px] md:max-w-[750px] md:px-[30px]">
        <strong className="relative text-white text-[13px] font-medium box-border caret-transparent block tracking-[-0.45px] leading-[18px] pointer-events-none w-full py-3 md:text-xl md:leading-[27px] md:py-[18px] after:accent-auto after:bg-[url('https://mkt-cdn.pstatic.net/mkt/2025/06/naverhyundaicard2/assets/img/sp_card_v3.png')] after:bg-[position:-1261px_-502px] after:bg-size-[1505px_1046px] after:caret-transparent after:text-white after:hidden after:text-[13px] after:not-italic after:normal-nums after:font-medium after:h-[9px] after:tracking-[-0.45px] after:leading-[18px] after:list-outside after:list-disc after:pointer-events-none after:absolute after:text-left after:no-underline after:indent-[0px] after:normal-case after:visible after:w-3.5 after:border-separate after:right-0 after:top-4 after:font-nanumsquareneo after:md:bg-[position:-1448px_-444px] after:md:text-xl after:md:h-3 after:md:leading-[27px] after:md:w-5 after:md:top-[26px]"></strong>
        <div className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] pb-8 md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:pb-12">
          <div className="relative text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] before:accent-auto before:bg-zinc-700 before:caret-transparent before:text-black before:hidden before:text-xs before:not-italic before:normal-nums before:font-normal before:h-px before:left-[-200%] before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-disc before:pointer-events-auto before:absolute before:right-[-200%] before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:border-separate before:top-0 before:font-nanumsquareneo before:md:text-lg before:md:tracking-[-0.3px] before:md:leading-[29px]">
            <ul className="text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] list-none pl-0 md:text-lg md:tracking-[-0.3px] md:leading-[29px]">
              {props.items.map((item, index) => (
                <li
                  key={index}
                  className={
                    index === 0
                      ? "relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]"
                      : "relative text-neutral-400 text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] align-top mt-1 pl-[9px] md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:mt-2 md:pl-3 before:accent-auto before:bg-neutral-400 before:caret-transparent before:text-neutral-400 before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-0.5 before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-none before:pointer-events-auto before:absolute before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:w-0.5 before:rounded-[50%] before:border-separate before:left-0 before:top-[9px] before:font-nanumsquareneo before:md:text-lg before:md:h-[3px] before:md:tracking-[-0.3px] before:md:leading-[29px] before:md:w-[3px] before:md:top-[13px]"
                  }
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
