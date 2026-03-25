export type CaseCardProps = {
  imageSrc: string;
  label: string;
  innerDivClassName?: string;
};

export const CaseCard = (props: CaseCardProps) => {
  return (
    <div className="items-center bg-sky-100 box-border caret-transparent gap-x-[15px] flex flex-col h-[140px] justify-center min-h-[auto] min-w-[auto] break-words gap-y-[15px] w-[140px] rounded-[25px] md:gap-x-5 md:h-[250px] md:gap-y-5 md:w-[250px] md:rounded-[40px]">
      <div
        className={`box-border caret-transparent h-[35px] min-h-[auto] min-w-[auto] break-words w-[35px] md:h-[100px] md:w-[100px] ${props.innerDivClassName ?? ""}`.trim()}
      >
        <img
          alt=""
          src={props.imageSrc}
          className="text-transparent aspect-[auto_35_/_35] box-border h-[35px] max-w-full break-words align-baseline w-[35px] md:aspect-[auto_100_/_100] md:h-[100px] md:w-[100px]"
        />
      </div>
      <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words">
        <p className="text-[17px] font-semibold box-border caret-transparent leading-[25.5px] min-h-[auto] min-w-[auto] break-words md:text-2xl md:leading-9">
          {props.label}
        </p>
      </div>
    </div>
  );
};
