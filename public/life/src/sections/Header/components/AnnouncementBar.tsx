export const AnnouncementBar = () => {
  return (
    <div className="items-center box-border caret-transparent flex justify-center break-words animate-fade-in">
      <div className="items-center bg-green-200 box-border caret-transparent flex justify-center max-w-[2000px] min-h-[auto] min-w-[auto] break-words w-full mx-0 rounded-b-none md:mx-[34px] md:rounded-b-[33px]">
        <div className="items-center box-border caret-transparent gap-x-2.5 flex min-h-[auto] min-w-[auto] break-words gap-y-2.5 p-2.5 md:gap-x-5 md:gap-y-5">
          <p className="text-black/60 text-sm font-semibold box-border caret-transparent leading-6 min-h-[auto] min-w-[auto] break-words md:text-xl md:leading-[30px]">
            지금 똑생을 이용 중이신가요?
          </p>
          <a
            href="https://app.ddok.life/"
            className="box-border caret-transparent block min-h-[auto] min-w-[auto] break-words"
          >
            <button
              type="button"
              className="relative appearance-none text-white text-sm font-semibold items-center bg-green-500 caret-transparent inline-flex h-8 justify-center leading-[16.8px] min-w-8 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-3 py-0 rounded-full btn-press md:text-base md:h-10 md:leading-[19.2px] md:min-w-10 md:px-4"
            >
              내 개인회생 관리
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};
