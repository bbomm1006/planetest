import { BottomCTA } from "@/sections/BottomCTA";
import { Main } from "@/sections/Main";
import { BottomBanner } from "@/sections/BottomBanner";

export const App = () => {
  return (
    <body className="relative text-gray-900 text-base not-italic normal-nums font-normal accent-auto bg-background box-border caret-transparent block tracking-[-0.64px] leading-6 list-outside list-disc min-h-full break-words pointer-events-auto text-start indent-[0px] normal-case visible border-separate font-pretendard overflow-x-hidden">
      <div className="box-border caret-transparent break-words">
        <BottomCTA />
        <Main />
        <BottomBanner />
      </div>
    </body>
  );
};
