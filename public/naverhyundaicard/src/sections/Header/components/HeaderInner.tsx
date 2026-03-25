import { HeaderLogo } from "@/sections/Header/components/HeaderLogo";
import { HeaderActions } from "@/sections/Header/components/HeaderActions";

export const HeaderInner = () => {
  return (
    <div className="items-center box-border caret-transparent flex h-full tracking-[-0.8px] max-w-[1200px] mx-auto px-5 md:tracking-[-1.2px] md:px-[30px]">
      <HeaderLogo />
      <HeaderActions />
    </div>
  );
};
