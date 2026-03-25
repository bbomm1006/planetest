export type ReviewCardProps = {
  variant?: "review" | "cta";
  // Review variant props
  avatarSrc?: string;
  reviewerName?: string;
  reviewerInfo?: string;
  tags?: string[];
  title?: React.ReactNode;
  body?: React.ReactNode;
  readMoreButtonText?: string;
  // CTA variant props
  ctaText?: string;
  ctaLinkHref?: string;
  ctaButtonText?: string;
};

export const ReviewCard = (props: ReviewCardProps) => {
  const {
    variant = "review",
    avatarSrc,
    reviewerName,
    reviewerInfo,
    tags = [],
    title,
    body,
    readMoreButtonText = "이어서 읽기",
    ctaText,
    ctaLinkHref = "/reviews",
    ctaButtonText = "후기 모두 보기",
  } = props;

  if (variant === "cta") {
    return (
      <div className="relative box-border caret-transparent shrink-0 h-full min-h-[auto] min-w-[auto] break-words w-[294.696px] mr-3.5 md:w-[310px] md:mr-[30px]">
        <div className="shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent flex flex-col h-80 break-words mb-2.5 p-5 rounded-2xl md:shadow-none md:h-[590px] md:mb-0 md:p-[30px] items-center bg-white/40 gap-x-2.5 justify-center gap-y-2.5">
          <p className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words text-xl font-bold leading-[30px] md:text-[25px] md:leading-[37.5px]">
            {ctaText}
          </p>
          <a
            href={ctaLinkHref}
            className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words"
          >
            <button
              type="button"
              className="relative appearance-none text-black text-base font-semibold items-center bg-amber-300 caret-transparent inline-flex h-10 justify-center leading-[19.2px] min-w-10 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-4 py-0 rounded-full md:text-lg md:h-12 md:leading-[21.6px] md:min-w-12 md:px-6"
            >
              {ctaButtonText}
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative box-border caret-transparent shrink-0 h-full min-h-[auto] min-w-[auto] break-words w-[294.696px] mr-3.5 md:w-[310px] md:mr-[30px]">
      <div className="shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent flex flex-col h-80 break-words mb-2.5 p-5 rounded-2xl md:shadow-none md:h-[590px] md:mb-0 md:p-[30px] relative bg-white">
        <div className="items-center box-border caret-transparent gap-x-2.5 flex min-h-[auto] min-w-[auto] break-words gap-y-2.5 md:gap-x-5 md:gap-y-5">
          <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words overflow-hidden rounded-full">
            <div className="box-border caret-transparent break-words w-[50px] md:w-[65px]">
              <img
                alt=""
                src={avatarSrc}
                className="text-transparent aspect-[auto_50_/_50] box-border max-w-full break-words align-baseline w-[50px] md:aspect-[auto_65_/_65] md:w-[65px]"
              />
            </div>
          </div>
          <div className="box-border caret-transparent flex flex-col min-h-[auto] min-w-[auto] break-words">
            <p className="text-base font-bold box-border caret-transparent leading-6 min-h-[auto] min-w-[auto] break-words md:text-xl md:leading-[30px]">
              {reviewerName}
            </p>
            <p className="text-sm font-medium box-border caret-transparent leading-[21px] min-h-[auto] min-w-[auto] break-words md:text-base md:leading-6">
              {reviewerInfo}
            </p>
          </div>
        </div>
        <div className="box-border caret-transparent ml-[-3px] min-h-[auto] min-w-[auto] break-words mt-2.5 md:mt-[22px]">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="text-green-800 text-xs font-semibold bg-green-100 box-border caret-transparent inline-block leading-[18px] break-words m-[3px] px-2 py-px rounded-md md:text-sm md:leading-[21px]"
            >
              {tag}
            </div>
          ))}
        </div>
        <h4 className="text-lg font-bold box-border caret-transparent leading-[27px] min-h-[auto] min-w-[auto] break-words mt-2.5 md:text-[22px] md:leading-[33px] md:mt-[15px]">
          {title}
        </h4>
        <p className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words relative text-slate-500 text-[13px] basis-[0%] grow leading-[19.5px] overflow-hidden mt-2.5 md:text-[15px] md:leading-[22.5px] after:accent-auto after:bg-[linear-gradient(to_top,rgb(255,255,255),rgba(255,255,255,0))] after:caret-transparent after:text-slate-500 after:block after:text-[13px] after:not-italic after:normal-nums after:font-normal after:h-[100px] after:tracking-[-0.64px] after:leading-[19.5px] after:list-outside after:list-none after:break-words after:pointer-events-auto after:absolute after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:border-separate after:bottom-0 after:inset-x-0 after:font-pretendard after:md:text-[15px] after:md:leading-[22.5px]">
          {body}
        </p>
        <div className="absolute items-center box-border caret-transparent flex justify-center break-words bottom-5 inset-x-0 md:bottom-10">
          <button
            type="button"
            className="relative appearance-none text-white text-sm font-semibold items-center bg-green-600 caret-transparent flex h-8 justify-center leading-[16.8px] min-h-[auto] min-w-8 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-3 py-0 rounded-full md:text-base md:h-10 md:leading-[19.2px] md:min-w-10 md:px-4"
          >
            {readMoreButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
