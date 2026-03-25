export type BenefitSummaryProps = {
  variant: "description" | "summary" | "note";
  descriptionText?: string;
  maxPoints?: string;
  months?: string;
  annualPoints?: string;
  conditionText?: string;
  noteContent?: React.ReactNode;
};

export const BenefitSummary = (props: BenefitSummaryProps) => {
  if (props.variant === "description") {
    return (
      <p className="font-medium box-border caret-transparent text-neutral-500 text-lg tracking-[-0.8px] leading-5 underline underline-offset-[5px] md:text-[27px] md:tracking-[-1.2px] md:leading-[30px]">
        {props.descriptionText}
      </p>
    );
  }

  if (props.variant === "summary") {
    return (
      <div className="box-border caret-transparent tracking-[-0.8px] mt-8 md:tracking-[-1.2px] md:mt-[49px] before:accent-auto before:bg-[url('https://mkt-cdn.pstatic.net/mkt/2025/06/naverhyundaicard2/assets/img/sp_card_v3.png')] before:bg-[position:-1380px_-741px] before:bg-size-[1505px_1046px] before:caret-transparent before:text-black before:inline-block before:text-base before:not-italic before:normal-nums before:font-normal before:h-[30px] before:tracking-[-0.8px] before:leading-[normal] before:list-outside before:list-disc before:pointer-events-auto before:text-center before:no-underline before:indent-[0px] before:normal-case before:visible before:w-[30px] before:border-separate before:font-nanumsquareneo before:md:bg-[position:-1422px_-516px] before:md:h-11 before:md:tracking-[-1.2px] before:md:w-11">
        <strong className="text-xl font-medium box-border caret-transparent block tracking-[-0.8px] leading-[35px] mt-[7px] md:text-3xl md:tracking-[-1.2px] md:leading-[51px] md:mt-3">
          월 최대{" "}
          <em className="text-xl font-black box-border caret-transparent tracking-[-0.8px] leading-[35px] md:text-3xl md:tracking-[-1.2px] md:leading-[51px]">
            {props.maxPoints}
          </em>{" "}
          X {props.months} 개월{" "}
          <br className="text-xl box-border caret-transparent tracking-[-0.8px] leading-[35px] md:text-3xl md:tracking-[-1.2px] md:leading-[51px]" />
          <em className="text-2xl font-black box-border caret-transparent tracking-[-0.8px] leading-[35px] md:text-4xl md:tracking-[-1.2px] md:leading-[51px]">
            = 연 최대 {props.annualPoints} 적립 가능!
          </em>
        </strong>
        <ul className="box-border caret-transparent tracking-[-0.8px] list-none pl-0 md:tracking-[-1.2px]">
          <li className="text-[13px] box-border caret-transparent tracking-[-0.45px] leading-[18px] align-top mt-2 md:text-xl md:leading-[27px] md:mt-3 before:accent-auto before:bg-black before:caret-transparent before:text-black before:inline-block before:text-[13px] before:not-italic before:normal-nums before:font-normal before:h-[3px] before:tracking-[-0.45px] before:leading-[18px] before:list-outside before:list-none before:pointer-events-auto before:text-center before:no-underline before:indent-[0px] before:normal-case before:align-top before:visible before:w-[3px] before:mr-1 before:mt-2 before:rounded-[100%] before:border-separate before:font-nanumsquareneo before:md:text-xl before:md:leading-[27px] before:md:mr-[9px] before:md:mt-3">
            {props.conditionText}
          </li>
        </ul>
      </div>
    );
  }

  if (props.variant === "note") {
    return (
      <p className="font-medium box-border caret-transparent text-stone-500 text-[13px] tracking-[-0.3px] leading-[18px] mt-14 md:text-xl md:tracking-[-0.45px] md:leading-[27px] md:mt-[84px]">
        {props.noteContent}
      </p>
    );
  }

  return null;
};
