export const TeamSection = () => {
  return (
    <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
      <div className="relative bg-gray-700 box-border caret-transparent max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden py-5 rounded-[17px] md:max-w-[1400px] md:min-h-[700px] md:py-[100px] md:rounded-[33px]">
        <div className="items-center box-border caret-transparent flex flex-col justify-center break-words">
          <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-20 my-[30px] md:w-[330px]">
            <img
              alt="레드존렌트카"
              src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/163.svg"
              className="text-transparent aspect-[auto_80_/_117] box-border max-w-full break-words align-baseline w-20 md:aspect-[auto_330_/_482] md:w-[330px]"
            />
          </div>
          <div className="static text-white box-border caret-transparent min-h-[auto] min-w-[auto] break-words ml-0 left-2/4 bottom-5 md:absolute md:min-h-0 md:min-w-0 md:ml-[200px] md:bottom-[126px]">
            <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
              시간은 짧게,
              <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[50px] md:leading-[60px] md:text-start" />
              결과는 확실하게
            </h2>
            <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
              효율적인 작업으로 높은 완성도를 제공합니다
              <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
              <span className="text-stone-400 text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start">
                체계적인 프로세스로
              </span>
              프리미엄 렌트카를 완성합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
