document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // 부드러운 스크롤 (Lenis)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    // 가로 스크롤 애니메이션
    const horizontalSections = gsap.utils.toArray('.horizontal-panel');

    gsap.to(horizontalSections, {
        xPercent: -100 * (horizontalSections.length - 1),
        ease: 'none',
        scrollTrigger: {
            trigger: '#horizontal-scroll',
            pin: true,
            scrub: 1,
            snap: 1 / (horizontalSections.length - 1),
            end: () => `+=${document.querySelector('#horizontal-scroll').offsetWidth}`
        }
    });

    // 각 패널의 콘텐츠 애니메이션
    gsap.utils.toArray('.panel').forEach(panel => {
        gsap.from(panel.querySelectorAll('h1, h2, p, .calender-grid, .premium-grid, .landscape-gallery, .contact-info, .two-column'), {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            scrollTrigger: {
                trigger: panel,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });
});