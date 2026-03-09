// 轮播图逻辑

// 1. 顶部 Hero 大图轮播逻辑 (带 Dots 控制)
let heroIndex = 0;
const heroSlides = document.querySelectorAll('.hero .slide');
const dots = document.querySelectorAll('.dot');
let heroTimer; // 用于清理定时器

function showHeroSlide(index) {
    // 移除所有激活状态
    heroSlides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    // 设置当前激活项
    heroIndex = index;
    if (heroIndex >= heroSlides.length) heroIndex = 0;
    if (heroIndex < 0) heroIndex = heroSlides.length - 1;

    heroSlides[heroIndex].classList.add('active');
    dots[heroIndex].classList.add('active');
}

// 自动切换函数
function startAutoPlay() {
    heroTimer = setInterval(() => {
        showHeroSlide(heroIndex + 1);
    }, 5000);
}

// 点击点跳转函数
function currentSlide(n) {
    clearInterval(heroTimer); // 用户手动点击后，重置定时器，防止连续跳动
    showHeroSlide(n);
    startAutoPlay(); // 重新开始计时
}

// 初始化
startAutoPlay();

// 2. 产品分类图片切换逻辑 (保持不变)
function moveSlide(button, direction) {
    const container = button.parentElement.querySelector('.image-slider');
    const slides = container.querySelectorAll('.product-slide');
    let activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));

    slides[activeIndex].classList.remove('active');
    activeIndex = (activeIndex + direction + slides.length) % slides.length;
    slides[activeIndex].classList.add('active');
}




let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// 自动轮播
setInterval(nextSlide, 5000);

// 导航栏滚动变色
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(44, 62, 80, 0.95)';
    } else {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    }
});

// 平滑滚动到锚点
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    showSlide(currentSlide);
});

// 产品滑块逻辑
document.querySelectorAll('.slider-container').forEach(container => {
    const slider = container.querySelector('.image-slider');
    const slides = slider.querySelectorAll('.product-slide');
    let currentIndex = 0;

    const prevBtn = container.querySelector('.prev');
    const nextBtn = container.querySelector('.next');

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    });

    showSlide(currentIndex);
});

