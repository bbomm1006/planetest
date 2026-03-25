import { Header } from "@/sections/Header";
import { Navbar } from "@/sections/Navbar";
import { BottomCTA } from "@/sections/BottomCTA";
import { Main } from "@/sections/Main";
import { BottomBanner } from "@/sections/BottomBanner";
import { Footer } from "@/sections/Footer";
import { FloatingButton } from "@/components/FloatingButton";

export const App = () => {
  return (
    <body className="relative text-gray-900 text-base not-italic normal-nums font-normal accent-auto bg-white box-border caret-transparent block tracking-[-0.64px] leading-6 list-outside list-disc min-h-full break-words pointer-events-auto text-start indent-[0px] normal-case visible border-separate font-pretendard overflow-x-hidden">
      <div className="box-border caret-transparent break-words">
        <Header />
        <Navbar />
        <BottomCTA />
        <Main />
        <BottomBanner />
        <Footer />
        <span className="box-border caret-transparent hidden break-words"></span>
      </div>
      <div className="box-border caret-transparent break-words"></div>
      <div className="box-border caret-transparent break-words">
        <div
          role="region"
          aria-label="Notifications-top"
          className="fixed box-border caret-transparent flex flex-col break-words pointer-events-none z-[5500] mx-auto top-0 inset-x-0"
        ></div>
        <div
          role="region"
          aria-label="Notifications-top-left"
          className="fixed box-border caret-transparent flex flex-col break-words pointer-events-none z-[5500] left-0 top-0"
        ></div>
        <div
          role="region"
          aria-label="Notifications-top-right"
          className="fixed box-border caret-transparent flex flex-col break-words pointer-events-none z-[5500] right-0 top-0"
        ></div>
        <div
          role="region"
          aria-label="Notifications-bottom-left"
          className="fixed box-border caret-transparent flex flex-col break-words pointer-events-none z-[5500] left-0 bottom-0"
        ></div>
        <div
          role="region"
          aria-label="Notifications-bottom"
          className="fixed box-border caret-transparent flex flex-col break-words pointer-events-none z-[5500] mx-auto bottom-0 inset-x-0"
        ></div>
        <div
          role="region"
          aria-label="Notifications-bottom-right"
          className="fixed box-border caret-transparent flex flex-col break-words pointer-events-none z-[5500] right-0 bottom-0"
        ></div>
      </div>
      <div className="relative box-border caret-transparent break-words z-[10000000]">
        <div className="box-border caret-transparent break-words">
          <div className="box-border caret-transparent break-words">
            <div className="text-black/90 tracking-[normal] leading-[normal] w-0 font-apple_system">
              <img
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/icon-2.svg"
                alt="Icon"
                className="hidden h-0 align-baseline w-0"
              />
              <FloatingButton />
            </div>
          </div>
        </div>
      </div>
    </body>
  );
};
