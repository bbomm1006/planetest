import { useEffect, useRef } from "react";
import { HeroButtons } from "@/sections/HeroSection/components/HeroButtons";

export const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>(".hero-reveal");
    items.forEach((item, i) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(28px)";
      item.style.transition = `opacity 0.7s ease-out ${i * 0.15}s, transform 0.7s ease-out ${i * 0.15}s`;
      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, 80);
    });
  }, []);

  return (
    <div id="hero" className="relative items-center box-border caret-transparent flex flex-col justify-center break-words px-0 md:px-[34px]">
      <div className="relative bg-[radial-gradient(circle,rgb(255,255,255)_40%,rgb(170,170,255)_100%)] box-border caret-transparent max-w-[2000px] min-h-[auto] min-w-[auto] break-words w-full overflow-hidden rounded-none md:rounded-[33px]">
        <div className="absolute box-border caret-transparent h-full break-words w-full overflow-hidden left-0 top-0">
          <div className="absolute box-border caret-transparent h-[900px] ml-[-450px] mt-[-450px] break-words w-[900px] left-2/4 top-2/4 md:h-[1500px] md:ml-[-750px] md:mt-[-750px] md:w-[1500px]">
            <img
              src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/image-1.png"
              className="aspect-[auto_1050_/_1050] box-border caret-transparent h-full max-w-full break-words align-baseline w-full"
            />
          </div>
        </div>
        <div ref={heroRef} className="relative items-center box-border caret-transparent flex flex-col justify-center break-words">
          <h1 className="hero-reveal box-border caret-transparent min-h-[auto] min-w-[auto] break-words mt-[60px] md:mt-[100px]">
            <img
              alt="똑생"
              src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/78.svg"
              className="text-transparent aspect-[auto_162_/_64] box-border max-w-full break-words align-baseline w-[120px] md:w-[200px]"
            />
          </h1>
          <h2 className="hero-reveal text-[34px] font-bold box-border caret-transparent leading-[45.22px] min-h-[auto] min-w-[auto] break-words text-center mt-[50px] md:text-[68px] md:leading-[81.6px] md:mt-[70px]">
            터치로 간편하게
            <br className="text-[34px] box-border caret-transparent leading-[45.22px] break-words md:text-[68px] md:leading-[81.6px]" />
            초정밀 채무해결
          </h2>
          <div className="hero-reveal w-full flex justify-center">
            <HeroButtons />
          </div>
          <div className="hero-reveal box-border caret-transparent h-[250px] min-h-[auto] min-w-[auto] break-words w-[290px] overflow-hidden mt-10 animate-float md:h-[400px] md:w-[440px] md:mt-[60px]">
            <div className="box-border caret-transparent inline-block break-words w-full">
              <img
                alt="똑생 서비스 화면"
                src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/121.png"
                className="text-transparent aspect-[auto_800_/_997] box-border max-w-full break-words align-baseline w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
