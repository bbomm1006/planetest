export type EventSectionContentProps = {
  spanClassName: string;
  eventNumber: string;
  descriptionClassName: string;
  descriptionIconClassName?: string;
  descriptionContent: React.ReactNode;
  headingClassName: string;
  headingContent: React.ReactNode;
  desktopImageSrc: string;
  desktopImageAlt: string;
  mobileImageSrc: string;
  mobileImageAlt: string;
};

export const EventSectionContent = (props: EventSectionContentProps) => {
  return (
    <div className="relative box-border caret-transparent tracking-[-0.8px] max-w-full mx-auto px-5 py-[72px] md:tracking-[-1.2px] md:max-w-[750px] md:px-0 md:py-[108px]">
      <span
        className={`text-base font-medium box-border caret-transparent inline-block tracking-[-0.8px] leading-[30px] align-top mb-4 px-[15px] rounded-[100px] md:text-2xl md:tracking-[-1.2px] md:leading-[45px] md:mb-6 md:px-[23px] ${props.spanClassName}`}
      >
        3월 특별 이벤트
      </span>
      <p
        className={`text-base font-bold box-border caret-transparent tracking-[-0.8px] leading-[30px] md:text-2xl md:tracking-[-1.2px] md:leading-[45px] ${props.eventNumber === "EVENT 01" ? "text-lime-400" : "text-orange-500"}`}
      >
        {props.eventNumber}
      </p>
      <p
        className={`font-medium box-border caret-transparent tracking-[-0.8px] mt-[13px] md:tracking-[-1.2px] ${props.descriptionClassName}`}
      >
 
        {props.descriptionContent}
      </p>
      <h4
        className={`text-white text-3xl font-black box-border caret-transparent tracking-[-1.9px] leading-10 break-words break-keep md:text-[45px] md:tracking-[-2.85px] md:leading-[60px] ${props.headingClassName}`}
      >
        {props.headingContent}
      </h4>
      <div className="box-border caret-transparent tracking-[-0.8px] w-[280px] mt-10 mx-auto md:tracking-[-1.2px] md:w-[496px] md:mt-[60px]">
        <img
          src={props.desktopImageSrc}
          alt={props.desktopImageAlt}
          className="box-border caret-transparent hidden tracking-[-0.8px] align-top w-full md:block md:tracking-[-1.2px]"
        />
        <img
          src={props.mobileImageSrc}
          alt={props.mobileImageAlt}
          className="box-border caret-transparent block tracking-[-0.8px] align-top w-full md:hidden md:tracking-[-1.2px]"
        />
      </div>
    </div>
  );
};
