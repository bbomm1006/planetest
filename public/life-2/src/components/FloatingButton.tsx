import { useState, useEffect } from "react";

export const FloatingButton = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed flex z-50 right-6 bottom-24 transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="맨 위로 이동"
        className="btn-press relative items-center backdrop-blur-[30px] flex h-14 justify-center w-14 rounded-3xl"
      >
        <div className="absolute items-center bg-[linear-gradient(rgb(0,187,53)_0%,rgb(0,187,84)_100%)] shadow-[rgba(255,255,255,0.2)_0px_0px_0px_1px_inset,rgba(0,0,0,0.1)_0px_4px_6px_0px,rgba(0,0,0,0.15)_0px_8px_30px_0px] flex h-full justify-center w-full rounded-3xl">
          <img
            src="https://c.animaapp.com/mn4j4i5rMNHjkT/assets/icon-3.svg"
            alt="Icon"
            className="text-white h-9 align-baseline w-9"
          />
        </div>
      </button>
    </div>
  );
};
