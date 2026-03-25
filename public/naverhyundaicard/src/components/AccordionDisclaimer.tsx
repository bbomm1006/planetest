export type AccordionDisclaimerProps = {
  outerVariantClass: string;
  innerContentClass: string;
  buttonClass: string;
  buttonText: string;
  accordionInnerClass?: string;
  children: React.ReactNode;
};

export const AccordionDisclaimer = (props: AccordionDisclaimerProps) => {
  return (
    <div
      className={`relative box-border caret-transparent tracking-[-0.8px] text-left overflow-hidden md:tracking-[-1.2px] ${props.outerVariantClass}`}
    >
      <div className="relative box-border caret-transparent tracking-[-0.8px] max-w-full mx-auto px-5 md:tracking-[-1.2px] md:max-w-[750px] md:px-[30px]">

        <div
          className={`text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] pb-8 md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:pb-12 ${props.accordionInnerClass ?? ""}`}
        >
          <div
            className={`relative text-xs box-border caret-transparent tracking-[-0.2px] leading-[19px] pt-6 md:text-lg md:tracking-[-0.3px] md:leading-[29px] md:pt-9 before:accent-auto before:caret-transparent before:text-black before:block before:text-xs before:not-italic before:normal-nums before:font-normal before:h-px before:left-[-200%] before:tracking-[-0.2px] before:leading-[19px] before:list-outside before:list-disc before:pointer-events-auto before:absolute before:right-[-200%] before:text-left before:no-underline before:indent-[0px] before:normal-case before:visible before:border-separate before:top-0 before:font-nanumsquareneo before:md:text-lg before:md:tracking-[-0.3px] before:md:leading-[29px] ${props.innerContentClass}`}
          >
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
};
