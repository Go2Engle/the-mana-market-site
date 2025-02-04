// carousel.js
export const heroSlides = [
    // ...existing heroSlides data...
];

let currentSlide = 0;
let slideInterval;
let activeImageElement = 1;

export function initializeHeroImages() {
    const image1 = document.getElementById('hero-image-1');
    const image2 = document.getElementById('hero-image-2');
    if (heroSlides.length > 0) {
        image1.style.backgroundImage = `url('${heroSlides[0].image}')`;
        image1.style.opacity = '1';
        image2.style.opacity = '0';
    }
}

export function updateHeroContent() {
    // ...existing updateHeroContent function...
}

export function nextSlide() {
    currentSlide = (currentSlide + 1) % heroSlides.length;
    updateHeroContent();
}

export function prevSlide() {
    currentSlide = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
    updateHeroContent();
}

export function startHeroCarousel() {
    updateHeroContent();
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    slideInterval = setInterval(nextSlide, 5000);
    const prevButton = document.getElementById('prev-slide');
    const nextButton = document.getElementById('next-slide');
    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            prevSlide();
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        });
        nextButton.addEventListener('click', () => {
            nextSlide();
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
}
