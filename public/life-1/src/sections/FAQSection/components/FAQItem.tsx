export type FAQItemProps = {
  question: string;
};

export const FAQItem = (props: FAQItemProps) => {
  return (
    <li className="items-center bg-slate-100 box-border caret-transparent flex min-h-[auto] min-w-[auto] break-words p-5 rounded-[25px] md:p-10 md:rounded-[40px]">
      <p className="text-base font-semibold box-border caret-transparent leading-6 min-h-[auto] min-w-[auto] break-words md:text-2xl md:leading-9">
        {props.question}
      </p>
      <div className="self-stretch box-border caret-transparent basis-[0%] grow justify-self-stretch min-h-[auto] min-w-[auto] break-words"></div>
      <button
        type="button"
        aria-label="답변 열기"
        className="relative appearance-none text-slate-500 text-[25px] font-semibold items-center bg-transparent caret-transparent flex h-10 justify-center leading-[30px] min-h-[auto] min-w-10 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle -m-2 p-0 rounded-lg md:text-[40px] md:leading-[48px]"
      >
        <img
          src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/icon-1.svg"
          alt="Icon"
          className="text-[25px] box-border caret-transparent h-[25px] leading-[30px] text-nowrap align-baseline w-[25px] md:text-[40px] md:h-10 md:leading-[48px] md:w-10"
        />
      </button>
    </li>
  );
};
