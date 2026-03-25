import { ServiceIconGrid } from "@/sections/AllInOneSection/components/ServiceIconGrid";

export const AllInOneSection = () => {
  return (
    <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words w-full">
      <div className="box-border caret-transparent flex flex-col max-w-none min-h-[360px] min-w-[auto] break-words w-full overflow-hidden p-5 rounded-[17px] md:flex-row md:max-w-[2000px] md:min-h-[700px] md:p-[100px] md:rounded-[33px]">
        <h2 className="static text-[25px] font-bold box-border caret-transparent leading-[33.25px] min-h-[auto] min-w-[auto] break-words text-center z-[2] mb-2 md:absolute md:text-[50px] md:leading-[60px] md:min-h-0 md:min-w-0 md:text-start md:mb-[15px]">
          쉽고 빠른 채무해결을 위한
          <br className="text-[25px] box-border caret-transparent leading-[33.25px] break-words text-center md:text-[50px] md:leading-[60px] md:text-start" />
          올인원 서비스 제공
        </h2>
        <div className="self-stretch box-border caret-transparent basis-[0%] grow justify-self-stretch min-h-[auto] min-w-[auto] break-words"></div>
        <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] break-words">
          <ServiceIconGrid />
        </div>
      </div>
    </div>
  );
};
