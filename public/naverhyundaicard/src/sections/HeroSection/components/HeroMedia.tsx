export const HeroMedia = () => {
  return (
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
  );
};
