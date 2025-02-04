let reviews = [];

export async function fetchReviews() {
    try {
        const response = await fetch('reviews.json');
        reviews = await response.json();
        populateTestimonials();
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

function populateTestimonials() {
    const container = document.getElementById('reviews-container');
    if (!container || !reviews.length) return;
    container.innerHTML = '';
    const scrollWrapper = document.createElement('div');
    scrollWrapper.className = 'reviews-scroll-wrapper flex gap-6';
    const createReviewCards = () => {
        reviews.forEach((review) => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card flex-shrink-0 w-72 transform';
            const truncatedMessage = review.message.length > 150 
                ? review.message.substring(0, 150).trim() + '...'
                : review.message;
            reviewCard.innerHTML = `
                <div class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg h-full flex flex-col">
                    <div class="flex items-start justify-between mb-2">
                        <div>
                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">${review.reviewer}</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400">${review.date_reviewed}</p>
                        </div>
                        <div class="flex text-yellow-400 text-sm">
                            ${Array(review.star_rating).fill('★').join('')}
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">${truncatedMessage}</p>
                </div>
            `;
            scrollWrapper.appendChild(reviewCard);
        });
    };
    createReviewCards();
    createReviewCards();
    container.appendChild(scrollWrapper);
    let scrollPosition = 0;
    const speed = 0.2;
    const gap = 24;
    const cardWidth = 288 + gap;
    const totalWidth = cardWidth * reviews.length;
    let isMouseDown = false;
    let startX;
    let scrollLeft;
    let animationFrameId;
    let isPaused = false;

    function animate() {
        if (!isPaused) {
            scrollPosition += speed;
            if (scrollPosition >= totalWidth) {
                scrollPosition = 0;
            }
            scrollWrapper.style.transform = `translateX(${-scrollPosition}px)`;
        }
        animationFrameId = requestAnimationFrame(animate);
    }
    animationFrameId = requestAnimationFrame(animate);

    function handleDragStart(e) {
        isPaused = true;
        isMouseDown = true;
        startX = (e.pageX || e.touches[0].pageX) - container.offsetLeft;
        scrollLeft = scrollPosition;
        scrollWrapper.style.cursor = 'grabbing';
    }

    function handleDragEnd() {
        isMouseDown = false;
        isPaused = false;
        scrollWrapper.style.cursor = 'grab';
    }

    function handleDragMove(e) {
        if (!isMouseDown) return;
        e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX) - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollPosition = scrollLeft - walk;
        if (scrollPosition < 0) {
            scrollPosition = totalWidth + (scrollPosition % totalWidth);
        } else if (scrollPosition >= totalWidth) {
            scrollPosition = scrollPosition % totalWidth;
        }
        scrollWrapper.style.transform = `translateX(${-scrollPosition}px)`;
    }

    container.addEventListener('mousedown', handleDragStart);
    container.addEventListener('mouseleave', handleDragEnd);
    container.addEventListener('mouseup', handleDragEnd);
    container.addEventListener('mousemove', handleDragMove);
    container.addEventListener('touchstart', handleDragStart);
    container.addEventListener('touchend', handleDragEnd);
    container.addEventListener('touchmove', handleDragMove);
    scrollWrapper.style.cursor = 'grab';
}
