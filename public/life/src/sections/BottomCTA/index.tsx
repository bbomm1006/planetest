export const BottomCTA = () => {
  return (
    <div className="fixed items-center box-border caret-transparent flex justify-center break-words animate-cta-slide-up z-40 bottom-0 inset-x-0 md:inset-x-2/4">
      <div className="relative box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-full md:w-auto">
        <div className="items-center backdrop-blur-[10px] bg-white/50 border-b-slate-200 border-l-slate-200 border-r-slate-200 shadow-[rgba(0,0,0,0.1)_0px_-10px_20px_0px] box-border caret-transparent gap-x-2.5 flex h-20 justify-center break-words gap-y-2.5 w-full px-5 py-5 rounded-t-[20px] border-t-white/70 border-t border-solid md:gap-x-5 md:h-[100px] md:gap-y-5 md:px-5">
          
          <button
            type="button"
            className="btn-press relative appearance-none text-white text-base font-semibold items-center bg-green-600/90 border-l-slate-200 border-r-slate-200 shadow-[rgba(0,0,0,0.15)_0px_5px_10px_0px] caret-transparent flex h-12 justify-center leading-[19.2px] min-h-[auto] min-w-12 outline-transparent outline-offset-2 outline outline-2 break-words text-center text-nowrap align-middle px-6 py-0 rounded-full border-y-white/40 border-b border-t md:text-lg md:h-[60px] md:leading-[21.6px] md:min-w-[60px] md:px-7"
          >
            초간단 청소 견적 받기
          </button>
        </div>
      </div>
    </div>
  );
};