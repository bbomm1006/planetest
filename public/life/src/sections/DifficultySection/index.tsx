export const DifficultySection = () => {
  return (
    <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
      <div className="relative bg-green-200 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden pt-10 pb-5 px-5 rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:p-[100px] md:rounded-[33px]">
        <h2 className="relative text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center z-[1] mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
          진짜 실력의 차이는
          <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[50px] md:leading-[60px] md:text-start" />
          어려운 상황에서 나옵니다
        </h2>
        <div className="static items-center box-border caret-transparent flex flex-col justify-center break-words transform-none origin-[50%_50%] mt-5 right-auto md:absolute md:origin-[100%_50%] md:mt-0 md:scale-[2.2] md:right-[5%]">
          <p className="text-black/40 text-sm font-bold box-border caret-transparent leading-[21px] min-h-[auto] min-w-[auto] break-words mb-2.5">
            실제 해결한 사례 입니다
          </p>
          <div className="box-border caret-transparent h-[220px] min-h-[auto] min-w-[auto] break-words w-80">
            <div className="absolute items-center bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent flex blur-[2px] h-[90px] justify-center opacity-0 break-words translate-y-[-89.1px] w-80 z-[5] rounded-[10px] scale-110 md:opacity-100 md:transform-none md:z-[4]"></div>
            <div className="absolute items-center bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent flex h-[90px] justify-center opacity-100 break-words transform-none w-80 z-[4] rounded-[10px] md:blur-[2px] md:opacity-60 md:translate-y-[72.9px] md:z-[3] md:scale-90"></div>
            <div className="absolute items-center bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent flex blur-[2px] h-[90px] justify-center opacity-60 break-words translate-y-[72.9px] w-80 z-[3] rounded-[10px] scale-90 md:blur-[3px] md:opacity-30 md:translate-y-[129.6px] md:z-[2] md:scale-[0.8]"></div>
            <div className="absolute items-center bg-white shadow-[rgba(45,55,72,0.05)_0px_0px_1px_0px,rgba(45,55,72,0.1)_0px_4px_8px_0px] box-border caret-transparent flex blur-[3px] h-[90px] justify-center opacity-30 break-words translate-y-[129.6px] w-80 z-[2] rounded-[10px] scale-[0.8] md:blur-sm md:opacity-0 md:translate-y-[170.1px] md:z-[1] md:scale-[0.7]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
