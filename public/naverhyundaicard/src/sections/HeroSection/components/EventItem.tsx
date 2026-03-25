export type EventItemProps = {
  eventNumber: string;
  liExtraClass?: string;
  subTitle?: string;
  description: React.ReactNode;
  href?: string;
};

export const EventItem = (props: EventItemProps) => {
  return (
    <li
      className={`box-border caret-transparent tracking-[-0.8px] align-top md:tracking-[-1.2px]${props.liExtraClass ? ` ${props.liExtraClass}` : ""}`}
    >
      <a
        href={props.href ?? "#"}
        className="items-center bg-lime-400 box-border caret-transparent flex justify-center tracking-[-0.8px] min-h-20 py-[18px] rounded-[15px] md:tracking-[-1.2px] md:min-h-[120px] md:py-5"
      >
        <span className="text-xs box-border caret-transparent block min-h-[auto] min-w-[auto] w-20 border py-2 rounded-[60px] border-solid md:text-xl md:w-[130px] md:py-3">
          {props.eventNumber}
        </span>
        <div className="box-border caret-transparent min-h-[auto] min-w-[auto] text-left w-[201px] ml-3.5 md:w-80 md:ml-10">
          {props.subTitle && (
            <span className="text-sm font-medium box-border caret-transparent block tracking-[-0.6px] leading-[23px] mb-[3px] md:text-lg md:tracking-[normal] md:leading-7 md:mb-[7px]">
              {props.subTitle}
            </span>
          )}
          <p className="text-lg font-black box-border caret-transparent leading-[23px] md:text-[27px] md:leading-[33px]">
            {props.description}
          </p>
        </div>
      </a>
    </li>
  );
};
