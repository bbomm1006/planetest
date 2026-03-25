export type ServiceIconProps = {
  imageSrc: string;
  label: string;
  hasWrapper?: boolean;
};

export const ServiceIcon = (props: ServiceIconProps) => {
  const inner = (
    <div className="box-border caret-transparent break-words items-center bg-red-50 gap-x-[15px] flex flex-col h-[120px] justify-center gap-y-[15px] w-[120px] rounded-[20px] md:gap-x-5 md:h-60 md:gap-y-5 md:w-60 md:rounded-[40px]">
      <div className="box-border caret-transparent h-[50px] min-h-[auto] min-w-[auto] break-words w-[50px] md:h-[100px] md:w-[100px]">
        <img
          alt=""
          src={props.imageSrc}
          className="text-transparent aspect-[auto_50_/_50] box-border h-[50px] max-w-full break-words align-baseline w-[50px] md:aspect-[auto_100_/_100] md:h-[100px] md:w-[100px]"
        />
      </div>
      <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words">
        <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] min-h-[auto] min-w-[auto] break-words md:text-2xl md:leading-9">
          {props.label}
        </p>
      </div>
    </div>
  );

  if (props.hasWrapper) {
    return (
      <div className="box-border caret-transparent break-words min-h-[auto] min-w-[auto]">
        {inner}
      </div>
    );
  }

  return inner;
};
