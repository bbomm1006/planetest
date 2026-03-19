
window.addEventListener('scroll', function() {
    const btn = document.getElementById("backToTop");
    // 400px 이상 스크롤되면 버튼 표시
    if (window.scrollY > 400) {
    btn.classList.add('show');
    } else {
    btn.classList.remove('show');
    }
});

document.getElementById("backToTop").addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 부드럽게 스크롤
    });
});