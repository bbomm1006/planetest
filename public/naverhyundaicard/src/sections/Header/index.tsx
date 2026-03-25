import { HeaderInner } from "@/sections/Header/components/HeaderInner";

export const Header = () => {
  return (
    <header className="fixed box-border caret-transparent h-16 tracking-[-0.8px] z-[1000] top-0 inset-x-0 md:h-24 md:tracking-[-1.2px]">
      <HeaderInner />
    </header>
  );
};
