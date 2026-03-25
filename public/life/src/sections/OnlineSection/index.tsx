export const OnlineSection = () => {
  return (
    <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
      <div className="relative bg-zinc-100 box-border caret-transparent h-[380px] max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden rounded-[17px] md:max-w-[2000px] md:min-h-[700px] md:rounded-[33px]">
        <div className="absolute box-border caret-transparent opacity-100 break-words top-[-25px] w-[560px] right-0 md:opacity-50 md:w-[1500px] md:top-0">
          <img
            alt="똑생 화면"
            src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/175.png"
            className="text-transparent aspect-[auto_560_/_348] box-border max-w-full break-words align-baseline w-[560px] md:aspect-[auto_1500_/_931] md:w-[1500px]"
          />
        </div>
        <div className="absolute box-border caret-transparent break-words w-full p-5 bottom-0 md:p-[100px]">
          <h2 className="text-[25px] font-bold box-border caret-transparent leading-[33.25px] break-words text-center mb-2 md:text-[50px] md:leading-[60px] md:text-start md:mb-[15px]">
            인터넷으로 언제 어디서든
          </h2>
          <p className="text-[13px] font-semibold box-border caret-transparent leading-[19.5px] break-words text-center mt-2 md:text-xl md:leading-[30px] md:text-start md:mt-[15px]">
            장소에 구애받지 않고 손쉽게 개인회생을 할 수 있어요.
            <br className="text-[13px] box-border caret-transparent leading-[19.5px] break-words text-center md:text-xl md:leading-[30px] md:text-start" />
            이제 방문상담의 고민이 필요없어요!
          </p>
        </div>
      </div>
    </div>
  );
};
