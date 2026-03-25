import { useState, useEffect } from "react";
import { NavbarLinks } from "@/sections/Navbar/components/NavbarLinks";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setMobileOpen(false);

  return (
    <>
      <nav
        aria-label="메인 네비게이션"
        className={`sticky items-center backdrop-blur-[10px] bg-white/80 box-border caret-transparent flex justify-center break-words z-50 px-[17px] top-0 md:px-[34px] transition-shadow duration-300 ${scrolled ? "shadow-[0_2px_16px_0_rgba(0,0,0,0.08)]" : ""}`}
      >
        <div className="flex items-center w-full max-w-[2000px]">
          <NavbarLinks />
          {/* Hamburger — mobile only */}
          <button
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-2 flex flex-col justify-center items-center gap-[5px] p-2 rounded-lg md:hidden btn-press"
            aria-expanded={mobileOpen}
          >
            <span className={`block w-5 h-0.5 bg-gray-800 rounded transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-800 rounded transition-all duration-300 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-800 rounded transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden animate-fade-in"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col pt-20 px-6 gap-2 md:hidden transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          aria-label="닫기"
          onClick={close}
          className="absolute top-4 right-4 p-2 text-gray-500 text-2xl font-bold btn-press"
        >
          ✕
        </button>
        {[
          { href: "#hero", label: "클린메이트 소개", active: true },
          { href: "#pricing", label: "이용료 안내" },
          { href: "#info", label: "유용한 정보" },
          { href: "#team", label: "💙 만든이들" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={close}
            className={`text-lg font-bold px-4 py-3 rounded-xl nav-link ${item.active ? "text-blue-700 bg-blue-700/10" : "text-black"}`}
          >
            {item.label}
          </a>
        ))}
        <div className="mt-6 flex flex-col gap-3">
          <a
            href="https://app.ddok.life/intake/wep/diagnosis"
            onClick={close}
            className="btn-press text-center text-white text-sm font-semibold bg-sky-500 h-12 flex items-center justify-center rounded-full"
          >
            예상 비용 확인하기
          </a>
          <a
            href="https://app.ddok.life/intake/wep/apply"
            onClick={close}
            className="btn-press text-center text-green-700 text-sm font-semibold bg-green-200 h-12 flex items-center justify-center rounded-full"
          >
            지금 바로 예약하기
          </a>
        </div>
      </div>
    </>
  );
};
