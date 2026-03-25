export type ReviewCardProps = {
  variant?: "review" | "cta";
  avatarSrc?: string;
  reviewerName?: string;
  reviewerInfo?: string;
  tags?: string[];
  title?: React.ReactNode;
  body?: React.ReactNode;
  readMoreButtonText?: string;
  ctaText?: string;
  ctaLinkHref?: string;
  ctaButtonText?: string;
  cardWidth?: number;
  cardGap?: number;
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
    cardWidth = 380,
    cardGap = 20,
  } = props;

  const style = { width: `${cardWidth}px`, marginRight: `${cardGap}px`, flexShrink: 0 };

  if (variant === "cta") {
    return (
      <div style={style} className="relative box-border caret-transparent min-h-[auto] min-w-[auto] break-words">
        <div className="box-border caret-transparent flex flex-col h-[520px] break-words p-6 rounded-2xl items-center bg-white/50 gap-3 justify-center md:h-[560px] md:p-[30px]">
          <p className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words text-xl font-bold leading-[30px] text-center md:text-[22px]">
            {ctaText}
          </p>
          <a href={ctaLinkHref} className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words">
            <button
              type="button"
              className="relative appearance-none text-black text-sm font-bold items-center bg-amber-300 caret-transparent inline-flex h-10 justify-center outline-none break-words text-center whitespace-nowrap align-middle px-5 py-0 rounded-full hover:bg-amber-400 transition-colors md:text-base md:h-11 md:px-7"
            >
              {ctaButtonText}
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={style} className="relative box-border caret-transparent min-h-[auto] min-w-[auto] break-words">
      <div className="shadow-[0_2px_16px_rgba(0,0,0,0.07)] box-border caret-transparent flex flex-col h-[520px] break-words px-5 pt-6 pb-5 rounded-2xl relative bg-white md:h-[560px] md:px-[28px] md:pt-[28px] md:pb-[24px]">
        {/* Avatar + Name row */}
        <div className="items-center box-border caret-transparent flex gap-x-3 mb-3 md:gap-x-4 md:mb-4">
          <div className="box-border caret-transparent overflow-hidden rounded-full flex-shrink-0 bg-gray-100">
            <img
              alt=""
              src={avatarSrc}
              className="text-transparent box-border max-w-full break-words align-baseline w-[52px] h-[52px] object-cover md:w-[60px] md:h-[60px]"
            />
          </div>
          <div className="box-border caret-transparent flex flex-col">
            <p className="text-[15px] font-bold box-border caret-transparent leading-[1.4] break-words md:text-[17px]">
              {reviewerName}
            </p>
            <p className="text-[13px] font-medium text-gray-400 box-border caret-transparent leading-[1.4] break-words md:text-[14px]">
              {reviewerInfo}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="box-border caret-transparent ml-[-2px] break-words mb-3 md:mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-white text-[11px] font-semibold bg-red-50 border border-red-200 box-border caret-transparent inline-block leading-[1.4] break-words m-[2px] px-2 py-0.5 rounded-md md:text-[12px]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h4 className="text-[15px] font-bold box-border caret-transparent leading-[1.55] break-words mb-2.5 md:text-[17px] md:mb-3">
          {title}
        </h4>

        {/* Body with gradient fade */}
        <div className="relative box-border caret-transparent break-words text-gray-500 text-[12.5px] basis-0 grow leading-[1.65] overflow-hidden md:text-[13.5px]">
          <div className="break-words">{body}</div>
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        </div>

        {/* Read more button */}
        <div className="flex items-center justify-center pt-3 md:pt-4">
          <button
            type="button"
            className="relative appearance-none text-white text-[13px] font-bold items-center bg-red-500 caret-transparent flex h-9 justify-center outline-none break-words text-center whitespace-nowrap align-middle px-5 py-0 rounded-full hover:bg-red-600 active:scale-95 transition-all md:text-sm md:h-10 md:px-6"
          >
            {readMoreButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
