export const HeroContent = () => {
  return (
    <div className="relative box-border caret-transparent tracking-[-0.8px] max-w-full mx-auto pt-10 px-5 md:tracking-[-1.2px] md:max-w-[750px] md:pt-14 md:px-0">
      <h3 className="text-[18.72px] box-border caret-transparent tracking-[-0.8px] md:tracking-[-1.2px]">
        <span className="text-xl font-medium box-border caret-transparent block tracking-[-0.8px] leading-[29px] md:text-3xl md:tracking-[-1.2px] md:leading-[44px]">
          네이버플러스 멤버십 회원의 특권
        </span>
        <span className="text-3xl font-black box-border caret-transparent block tracking-[-0.8px] leading-[39px] mt-2 md:text-[45px] md:tracking-[-1.2px] md:leading-[57px]">
          <em className="text-[33px] box-border caret-transparent tracking-[-0.8px] leading-[39px] md:text-[50px] md:tracking-[-1.2px] md:leading-[57px]">
            최대 12%
          </em>
          <br className="text-3xl box-border caret-transparent tracking-[-0.8px] leading-[39px] md:text-[45px] md:tracking-[-1.2px] md:leading-[57px]" />
          네이버페이 포인트 적립
        </span>
        <em className="text-yellow-400 text-[23px] font-bold bg-neutral-500 box-border caret-transparent inline-block tracking-[-0.8px] leading-[25px] mt-[5px] px-[5px] py-[3px] md:text-[35px] md:tracking-[-1.2px] md:leading-[38px] md:mt-2 md:px-2 md:py-[5px]">
          네이버 현대카드 Edition 2
        </em>
      </h3>
      <div className="box-border caret-transparent h-[230px] tracking-[-0.8px] mt-6 mx-auto md:h-[290px] md:tracking-[-1.2px] md:mt-7">
        <video
          loop=""
          autoplay=""
          playsinline=""
          muted=""
          preload=""
          poster="https://c.animaapp.com/mn5bxx3lWy8QQl/assets/pc_video_poster.png"
          className="box-border caret-transparent hidden h-full tracking-[-0.8px] object-cover align-top w-[234px] mx-auto md:block md:tracking-[-1.2px] md:w-[296px]"
        >
          <source
            src="https://mkt-cdn.pstatic.net/mkt/2024/12/naverhyundaicard2/assets/video/pc_spot_video.mp4"
            className="box-border caret-transparent text-start font-times_new_roman"
          />
        </video>
        <video
          loop=""
          autoplay=""
          playsinline=""
          muted=""
          preload=""
          poster="https://c.animaapp.com/mn5bxx3lWy8QQl/assets/mo_video_poster.png"
          className="box-border caret-transparent block h-full tracking-[-0.8px] object-cover align-top w-[234px] mx-auto md:hidden md:tracking-[-1.2px] md:w-[296px]"
        >
          <source
            src="https://mkt-cdn.pstatic.net/mkt/2024/12/naverhyundaicard2/assets/video/mo_spot_video.mp4"
            className="box-border caret-transparent text-start font-times_new_roman"
          />
        </video>
      </div>
    </div>
  );
};
