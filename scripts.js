// DOM Elements
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const themeToggle = document.getElementById('theme-toggle');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

// Hero carousel data
const heroSlides = [
    {
        title: "Starry Mountain Playmat",
        description: "Transform your gaming experience with our premium playmats featuring stunning artwork",
        image: "https://i.etsystatic.com/54979645/r/il/4af290/6525855154/il_fullxfull.6525855154_7xqn.jpg",
        link: "https://www.etsy.com/shop/themanamarket"
    },
    {
        title: "Enchanted Forest Playmat",
        description: "Immerse yourself in a mystical realm with our enchanted forest themed playmat",
        image: "https://i.etsystatic.com/54979645/r/il/581bc4/6393034325/il_fullxfull.6393034325_1rvz.jpg",
        link: "https://www.etsy.com/shop/themanamarket"
    },
    {
        title: "Cosmic Constellation Playmat",
        description: "Experience the wonders of the cosmos with our celestial-themed playmat design",
        image: "https://i.etsystatic.com/54979645/r/il/4af290/6525855154/il_fullxfull.6525855154_7xqn.jpg",
        link: "https://www.etsy.com/shop/themanamarket"
    },
    {
        title: "Ancient Ruins Playmat",
        description: "Battle among the remnants of a forgotten civilization with this atmospheric playmat",
        image: "https://i.etsystatic.com/54979645/r/il/581bc4/6393034325/il_fullxfull.6393034325_1rvz.jpg",
        link: "https://www.etsy.com/shop/themanamarket"
    },
    {
        title: "Mystic Garden Playmat",
        description: "Enter a world of wonder with our beautifully detailed garden-themed playmat",
        image: "https://i.etsystatic.com/54979645/r/il/4af290/6525855154/il_fullxfull.6525855154_7xqn.jpg",
        link: "https://www.etsy.com/shop/themanamarket"
    }
];

// Featured products data
const featuredProducts = [
    {
        title: "Starry Mountain Playmat",
        price: "$25.00",
        description: "A breathtaking design featuring a mesmerizing nightscape with a vibrant starry sky swirling above majestic mountains.",
        image: "https://i.etsystatic.com/54979645/r/il/4af290/6525855154/il_fullxfull.6525855154_7xqn.jpg",
        link: "https://www.etsy.com/shop/themanamarket"
    },
    {
        title: "The Mana Market Hooded Sweatshirt",
        price: "$35.57",
        description: "Premium cotton-poly blend hoodie with a classic fit, spacious kangaroo pocket, and color-matched drawcord.",
        image: "https://i.etsystatic.com/54979645/r/il/581bc4/6393034325/il_fullxfull.6393034325_1rvz.jpg",
        link: "https://www.etsy.com/shop/themanamarket"
    },
    {
        title: "Enchanted Forest Deck Box",
        description: "A beautifully crafted deck box featuring an enchanted forest design, perfect for protecting your favorite deck.",
        image: "https://i.etsystatic.com/54979645/r/il/4af290/6525855154/il_fullxfull.6525855154_7xqn.jpg",
        link: "https://www.etsy.com/shop/themanamarket"
    }
];

// Reviews data
let reviews = [];

// Fetch reviews from JSON file
async function fetchReviews() {
    try {
        const response = await fetch('reviews.json');
        reviews = await response.json();
        populateTestimonials();
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Function to populate testimonials
function populateTestimonials() {
    const container = document.getElementById('reviews-container');
    if (!container || !reviews.length) return;

    // Clear existing content
    container.innerHTML = '';

    // Create a wrapper for the continuous scroll
    const scrollWrapper = document.createElement('div');
    scrollWrapper.className = 'reviews-scroll-wrapper flex gap-6';

    // Create review cards
    const createReviewCards = () => {
        reviews.forEach((review) => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card flex-shrink-0 w-72 transform';
            
            // Truncate message if it's too long (150 characters)
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

    // Create two sets of review cards for seamless scrolling
    createReviewCards();
    createReviewCards();

    container.appendChild(scrollWrapper);

    // Set up the continuous scroll animation
    let scrollPosition = 0;
    const speed = 0.2; // Pixels per frame
    const gap = 24; // Gap between cards (matches gap-6 class)
    const cardWidth = 288 + gap; // w-72 (288px) + gap
    const totalWidth = cardWidth * reviews.length;

    let isMouseDown = false;
    let startX;
    let scrollLeft;
    let animationFrameId;
    let isPaused = false;

    function animate() {
        if (!isPaused) {
            scrollPosition += speed;
            
            // Reset position when we've scrolled through one set of reviews
            if (scrollPosition >= totalWidth) {
                scrollPosition = 0;
            }
            
            scrollWrapper.style.transform = `translateX(${-scrollPosition}px)`;
        }
        animationFrameId = requestAnimationFrame(animate);
    }

    // Start animation
    animationFrameId = requestAnimationFrame(animate);

    // Mouse and touch event handlers
    function handleDragStart(e) {
        isPaused = true;
        isMouseDown = true;
        startX = (e.pageX || e.touches[0].pageX) - container.offsetLeft;
        scrollLeft = scrollPosition;
        
        // Change cursor style
        scrollWrapper.style.cursor = 'grabbing';
    }

    function handleDragEnd() {
        isMouseDown = false;
        isPaused = false;
        
        // Restore cursor style
        scrollWrapper.style.cursor = 'grab';
    }

    function handleDragMove(e) {
        if (!isMouseDown) return;
        e.preventDefault();
        
        const x = (e.pageX || e.touches[0].pageX) - container.offsetLeft;
        const walk = (x - startX) * 1.5; // Multiply by 1.5 to make scrolling more responsive
        scrollPosition = scrollLeft - walk;
        
        // Ensure scrollPosition stays within bounds
        if (scrollPosition < 0) {
            scrollPosition = totalWidth + (scrollPosition % totalWidth);
        } else if (scrollPosition >= totalWidth) {
            scrollPosition = scrollPosition % totalWidth;
        }
        
        scrollWrapper.style.transform = `translateX(${-scrollPosition}px)`;
    }

    // Add mouse event listeners
    container.addEventListener('mousedown', handleDragStart);
    container.addEventListener('mouseleave', handleDragEnd);
    container.addEventListener('mouseup', handleDragEnd);
    container.addEventListener('mousemove', handleDragMove);

    // Add touch event listeners
    container.addEventListener('touchstart', handleDragStart);
    container.addEventListener('touchend', handleDragEnd);
    container.addEventListener('touchmove', handleDragMove);

    // Update cursor style
    scrollWrapper.style.cursor = 'grab';
}

// Reviews carousel state
let currentReviewScroll = 0;
let isAnimating = false;

// Current slide index
let currentSlide = 0;
let slideInterval;

// Function to initialize mobile menu
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Function to update hero content
function updateHeroContent() {
    const slide = heroSlides[currentSlide];
    const carousel = document.getElementById('hero-carousel');
    const content = document.getElementById('hero-content');
    
    if (!carousel || !content) return;

    // Update background image
    carousel.style.backgroundImage = `url(${slide.image})`;
    carousel.style.backgroundSize = 'cover';
    carousel.style.backgroundPosition = 'center';

    // Update content
    content.innerHTML = `
        <h1 class="text-4xl md:text-6xl font-bold mb-4">${slide.title}</h1>
        <p class="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">${slide.description}</p>
        <a href="${slide.link}" target="_blank" rel="noopener noreferrer" 
           class="inline-block px-8 py-3 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition">
            Shop Now
        </a>
    `;
}

// Function to go to next slide
function nextSlide() {
    currentSlide = (currentSlide + 1) % heroSlides.length;
    updateHeroContent();
}

// Function to go to previous slide
function prevSlide() {
    currentSlide = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
    updateHeroContent();
}

// Function to start hero carousel
function startHeroCarousel() {
    updateHeroContent(); // Show initial slide
    
    // Clear any existing interval
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    
    // Set up automatic slide transition every 5 seconds
    slideInterval = setInterval(nextSlide, 5000);
    
    // Add navigation buttons event listeners
    const prevButton = document.getElementById('prev-slide');
    const nextButton = document.getElementById('next-slide');
    
    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            prevSlide();
            // Reset interval after manual navigation
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        });
        
        nextButton.addEventListener('click', () => {
            nextSlide();
            // Reset interval after manual navigation
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
    
    // Add smooth transition effect
    const carousel = document.getElementById('hero-carousel');
    if (carousel) {
        carousel.style.transition = 'background-image 0.5s ease-in-out';
    }
}

// Initialize theme
function initializeTheme() {
    // Set initial theme based on localStorage or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Function to toggle theme
    function toggleTheme() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    }

    // Add event listeners to theme toggle buttons if they exist
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
    }
}

// Function to populate featured products
function populateFeaturedProducts() {
    const container = document.querySelector('#featured .grid');
    if (!container) return;

    featuredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200';
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">${product.title}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">${product.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-lg font-bold text-primary-light dark:text-primary-dark">${product.price}</span>
                    <a href="${product.link}" target="_blank" rel="noopener noreferrer" 
                       class="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition">
                        View on Etsy
                    </a>
                </div>
            </div>
        `;
        
        container.appendChild(productCard);
    });
}

// Function to fetch and parse CSV data
async function fetchEtsyListings() {
    try {
        const response = await fetch('EtsyListings.csv');
        const text = await response.text();
        
        // Parse CSV with proper handling of quoted fields containing newlines
        const parseCSV = (str) => {
            const arr = [];
            let quote = false;  // true means we're inside a quoted field
            let col = '';
            let row = [];

            for (let c = 0; c < str.length; c++) {
                const cc = str[c];
                const nc = str[c + 1]; // next character

                if (cc === '"' && quote && nc === '"') { 
                    // Quote inside quoted field
                    col += cc;
                    c++;
                } else if (cc === '"') { 
                    // Start/end quote
                    quote = !quote;
                } else if (cc === ',' && !quote) { 
                    // End of column (not within quote)
                    row.push(col.trim());
                    col = '';
                } else if (cc === '\n' && !quote) { 
                    // End of line (not within quote)
                    row.push(col.trim());
                    if (row.length > 1) { // Skip empty rows
                        arr.push(row);
                    }
                    row = [];
                    col = '';
                } else { 
                    // Regular character - add to column
                    col += cc;
                }
            }

            // Handle last column
            if (col.length > 0) {
                row.push(col.trim());
            }
            if (row.length > 0) {
                arr.push(row);
            }

            return arr;
        };

        const rows = parseCSV(text);
        const headers = rows[0].map(header => header.trim()); // Make sure to trim headers
        const data = rows.slice(1);

        // Convert to array of objects
        return data.map(row => {
            const item = {};
            headers.forEach((header, index) => {
                // Remove any remaining quotes and trim
                const value = row[index] || '';
                item[header] = value.replace(/^"|"$/g, '').trim();
            });
            return item;
        });
    } catch (error) {
        console.error('Error fetching Etsy listings:', error);
        return [];
    }
}

// Function to update hero section
async function updateHeroSection() {
    try {
        const listings = await fetchEtsyListings();
        const playmatListings = listings.filter(item => 
            item.TITLE && 
            item.TITLE.toLowerCase().includes('playmat') && 
            item.IMAGE1
        );

        if (playmatListings.length > 0) {
            // Update heroSlides with Etsy listings
            heroSlides.length = 0; // Clear existing slides
            playmatListings.forEach(product => {
                const title = product.TITLE.replace('The Mana Market: ', '');
                const description = product.DESCRIPTION.split('\n')[0];
                
                heroSlides.push({
                    title: title,
                    description: description,
                    image: product.IMAGE1,
                    link: getEtsySearchUrl(product) // This will now use the direct URL from CSV
                });
            });

            // Start the carousel with the new slides
            startHeroCarousel();
        }
    } catch (error) {
        console.error('Error updating hero section:', error);
    }
}

// Function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// Function to get Etsy URL
function getEtsySearchUrl(item) {
    // If we have a direct URL in the CSV, use it
    if (item.url || item.URL) {
        return item.url || item.URL;
    }
    
    // Fallback to shop search if no direct URL is available
    const title = (item.title || item.TITLE || '').replace(/The\s+Mana\s+Market:?\s*/i, '');
    const searchTitle = encodeURIComponent(title);
    return `https://www.etsy.com/shop/themanamarket/search?search_query=${searchTitle}&utm_source=manamarket&utm_medium=shop_link&utm_campaign=share`;
}

// Function to update featured items
async function updateFeaturedItems() {
    try {
        const listings = await fetchEtsyListings();
        const featuredContainer = document.getElementById('featured-items');
        
        if (!featuredContainer) return;

        // Get 6 featured items
        const featuredItems = listings.slice(0, 6);
        
        let html = '';
        featuredItems.forEach(item => {
            const title = item.TITLE.replace('The Mana Market: ', '');
            const description = truncateText(item.DESCRIPTION.split('\n')[0], 100);
            const searchUrl = getEtsySearchUrl(item);
            const detailsUrl = `product-details.html?title=${encodeURIComponent(item.TITLE)}`;
            
            html += `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
                    <div class="block h-full flex flex-col">
                        <a href="${detailsUrl}" class="block">
                            <img src="${item.IMAGE1}" alt="${title}" class="w-full h-64 object-cover">
                            <div class="p-6 flex-1">
                                <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">${title}</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-4">${description}</p>
                            </div>
                        </a>
                        <div class="p-6 pt-0 mt-auto flex justify-between items-center">
                            <span class="text-2xl font-bold text-primary-light dark:text-primary-dark">$${item.PRICE}</span>
                            <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" 
                               class="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition">
                                View on Etsy
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        featuredContainer.innerHTML = html;
    } catch (error) {
        console.error('Error updating featured items:', error);
    }
}

// Function to render products
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    let html = '';
    filteredProducts.forEach(item => {
        const title = item.TITLE.replace('The Mana Market: ', '');
        const description = truncateText(item.DESCRIPTION.split('\n')[0], 100);
        const searchUrl = getEtsySearchUrl(item);
        const detailsUrl = `product-details.html?title=${encodeURIComponent(item.TITLE)}`;
        
        html += `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
                <div class="block h-full flex flex-col">
                    <a href="${detailsUrl}" class="block">
                        <img src="${item.IMAGE1}" alt="${title}" class="w-full h-64 object-cover">
                        <div class="p-6 flex-1">
                            <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">${title}</h3>
                            <p class="text-gray-600 dark:text-gray-400 mb-4">${description}</p>
                        </div>
                    </a>
                    <div class="p-6 pt-0 mt-auto flex justify-between items-center">
                        <span class="text-2xl font-bold text-primary-light dark:text-primary-dark">$${item.PRICE}</span>
                        <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" 
                           class="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition">
                            View on Etsy
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    productsGrid.innerHTML = html || '<p class="text-gray-600 dark:text-gray-400 text-center col-span-full">No products found matching your criteria.</p>';
}

// Product filtering functions
let allProducts = [];
let filteredProducts = [];

// Function to initialize product filters
async function initializeProductFilters() {
    try {
        // Get all products
        allProducts = await fetchEtsyListings();
        filteredProducts = [...allProducts];
        
        // Get unique categories
        const categories = [...new Set(allProducts.map(item => {
            const title = item.TITLE.toLowerCase();
            if (title.includes('playmat')) return 'Playmats';
            if (title.includes('deck box')) return 'Deck Boxes';
            if (title.includes('shirt') || title.includes('hoodie')) return 'Apparel';
            return 'Other';
        }))].filter(Boolean);
        
        // Populate category filters
        const categoryFilters = document.getElementById('category-filters');
        if (categoryFilters) {
            categories.forEach(category => {
                const div = document.createElement('div');
                div.className = 'flex items-center';
                div.innerHTML = `
                    <input type="checkbox" id="category-${category.toLowerCase()}" value="${category}"
                           class="rounded border-gray-300 dark:border-gray-600 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark">
                    <label for="category-${category.toLowerCase()}" class="ml-2 text-gray-700 dark:text-gray-300">
                        ${category}
                    </label>
                `;
                categoryFilters.appendChild(div);
            });
        }
        
        // Add event listeners
        setupFilterEventListeners();
        
        // Initial render
        renderProducts();
    } catch (error) {
        console.error('Error initializing product filters:', error);
    }
}

// Function to setup filter event listeners
function setupFilterEventListeners() {
    // Search
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    // Category filters
    const categoryFilters = document.querySelectorAll('#category-filters input');
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
    
    // Price range
    const minPrice = document.getElementById('min-price');
    const maxPrice = document.getElementById('max-price');
    if (minPrice && maxPrice) {
        minPrice.addEventListener('input', applyFilters);
        maxPrice.addEventListener('input', applyFilters);
    }
    
    // Sort
    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }
    
    // Clear filters
    const clearButton = document.getElementById('clear-filters');
    if (clearButton) {
        clearButton.addEventListener('click', clearFilters);
    }
}

// Function to apply filters
function applyFilters() {
    // Get filter values
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const selectedCategories = Array.from(document.querySelectorAll('#category-filters input:checked')).map(input => input.value);
    const minPrice = parseFloat(document.getElementById('min-price')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price')?.value) || Infinity;
    const sortBy = document.getElementById('sort')?.value || 'featured';
    
    // Filter products
    filteredProducts = allProducts.filter(product => {
        const title = product.TITLE.replace('The Mana Market: ', '').toLowerCase();
        const description = product.DESCRIPTION.toLowerCase();
        const price = parseFloat(product.PRICE);
        
        // Get product category
        let category = 'Other';
        if (title.includes('playmat')) category = 'Playmats';
        if (title.includes('deck box')) category = 'Deck Boxes';
        if (title.includes('shirt') || title.includes('hoodie')) category = 'Apparel';
        
        // Apply filters
        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);
        const matchesPrice = price >= minPrice && price <= maxPrice;
        
        return matchesSearch && matchesCategory && matchesPrice;
    });
    
    // Sort products
    switch (sortBy) {
        case 'price-asc':
            filteredProducts.sort((a, b) => parseFloat(a.PRICE) - parseFloat(b.PRICE));
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => parseFloat(b.PRICE) - parseFloat(a.PRICE));
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.TITLE.localeCompare(b.TITLE));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.TITLE.localeCompare(a.TITLE));
            break;
    }
    
    // Render filtered products
    renderProducts();
}

// Function to clear all filters
function clearFilters() {
    // Reset search
    const searchInput = document.getElementById('search');
    if (searchInput) searchInput.value = '';
    
    // Reset categories
    const categoryFilters = document.querySelectorAll('#category-filters input');
    categoryFilters.forEach(filter => filter.checked = false);
    
    // Reset price range
    const minPrice = document.getElementById('min-price');
    const maxPrice = document.getElementById('max-price');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    
    // Reset sort
    const sortSelect = document.getElementById('sort');
    if (sortSelect) sortSelect.value = 'featured';
    
    // Reset filtered products
    filteredProducts = [...allProducts];
    
    // Re-render products
    renderProducts();
}

// Function to get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
}

// Function to display product details
async function displayProductDetails() {
    const productDetails = document.getElementById('product-details');
    const productBreadcrumb = document.getElementById('product-breadcrumb');
    if (!productDetails) return;

    try {
        const { title } = getUrlParams();
        if (!title) {
            productDetails.innerHTML = '<p class="text-center text-gray-900 dark:text-white">Product not found</p>';
            if (productBreadcrumb) productBreadcrumb.textContent = 'Product Not Found';
            return;
        }

        const listings = await fetchEtsyListings();
        const product = listings.find(item => item.TITLE === title);
        
        if (!product) {
            productDetails.innerHTML = '<p class="text-center text-gray-900 dark:text-white">Product not found</p>';
            if (productBreadcrumb) productBreadcrumb.textContent = 'Product Not Found';
            return;
        }

        // Update breadcrumb
        const displayTitle = product.TITLE.replace('The Mana Market: ', '');
        if (productBreadcrumb) {
            productBreadcrumb.textContent = displayTitle;
        }

        // Get all available images
        const images = [];
        for (let i = 1; i <= 10; i++) {
            const img = product[`IMAGE${i}`];
            if (img) images.push(img);
        }

        // Get variations if they exist
        const variations = [];
        if (product['VARIATION 1 TYPE']) {
            variations.push({
                type: product['VARIATION 1 TYPE'],
                name: product['VARIATION 1 NAME'],
                values: product['VARIATION 1 VALUES']?.split(',') || []
            });
        }
        if (product['VARIATION 2 TYPE']) {
            variations.push({
                type: product['VARIATION 2 TYPE'],
                name: product['VARIATION 2 NAME'],
                values: product['VARIATION 2 VALUES']?.split(',') || []
            });
        }

        const searchUrl = getEtsySearchUrl(product);

        let html = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Image Gallery -->
                <div class="space-y-4">
                    <div class="aspect-w-1 aspect-h-1">
                        <img src="${images[0]}" alt="${displayTitle}" class="w-full h-96 object-cover rounded-lg" id="main-image">
                    </div>
                    <div class="grid grid-cols-5 gap-2">
                        ${images.map((img, index) => `
                            <img src="${img}" alt="${displayTitle} ${index + 1}" 
                                class="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75 transition"
                                onclick="document.getElementById('main-image').src='${img}'">
                        `).join('')}
                    </div>
                </div>

                <!-- Product Info -->
                <div class="space-y-6">
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">${displayTitle}</h1>
                    <p class="text-2xl font-bold text-primary-light dark:text-primary-dark">$${product.PRICE}</p>
                    <div class="prose dark:prose-invert max-w-none">
                        ${product.DESCRIPTION.split('\n').map(line => 
                            `<p class="text-gray-600 dark:text-gray-300">${line}</p>`
                        ).join('')}
                    </div>

                    ${variations.length > 0 ? `
                        <div class="space-y-4">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Options</h3>
                            ${variations.map(variation => `
                                <div>
                                    <h4 class="font-medium mb-2 text-gray-900 dark:text-white">${variation.name}</h4>
                                    <div class="flex flex-wrap gap-2">
                                        ${variation.values.map(value => `
                                            <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded">
                                                ${value.trim()}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div class="space-y-4">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Tags</h3>
                        <div class="flex flex-wrap gap-2">
                            ${product.TAGS.split(',').map(tag => `
                                <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded">
                                    ${tag.trim().replace(/_/g, ' ')}
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" 
                       class="inline-block px-8 py-3 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition">
                        View on Etsy
                    </a>
                </div>
            </div>
        `;

        productDetails.innerHTML = html;
    } catch (error) {
        console.error('Error displaying product details:', error);
        productDetails.innerHTML = '<p class="text-center text-gray-900 dark:text-white">Error loading product details</p>';
    }

    // Image modal functionality
    if (document.getElementById('main-image')) {
        const mainImage = document.getElementById('main-image');
        const thumbnailContainer = document.getElementById('thumbnail-container');
        const imageModal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const closeModal = document.getElementById('close-modal');

        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            const product = listings.find(p => p.id === parseInt(productId));
            if (product) {
                // Update page title
                document.title = `${product.name} - The Mana Market`;
                
                // Update breadcrumb
                document.getElementById('product-name').textContent = product.name;
                
                // Update main product details
                document.getElementById('product-title').textContent = product.name;
                document.getElementById('product-price').textContent = `$${product.price.toFixed(2)}`;
                document.getElementById('product-description').textContent = product.description;
                
                // Set main image
                mainImage.src = product.images[0];
                mainImage.alt = product.name;
                
                // Create thumbnails
                product.images.forEach((image, index) => {
                    const thumbnail = document.createElement('div');
                    thumbnail.className = 'aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer hover:opacity-90 transition';
                    
                    const img = document.createElement('img');
                    img.src = image;
                    img.alt = `${product.name} - View ${index + 1}`;
                    img.className = 'w-full h-full object-cover';
                    
                    thumbnail.appendChild(img);
                    thumbnailContainer.appendChild(thumbnail);
                    
                    // Add click event to thumbnail
                    thumbnail.addEventListener('click', () => {
                        mainImage.src = image;
                        mainImage.alt = `${product.name} - View ${index + 1}`;
                    });
                });

                // Modal functionality
                mainImage.addEventListener('click', () => {
                    modalImage.src = mainImage.src;
                    modalImage.alt = mainImage.alt;
                    imageModal.classList.remove('hidden');
                    imageModal.classList.add('flex');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
                });

                closeModal.addEventListener('click', () => {
                    imageModal.classList.add('hidden');
                    imageModal.classList.remove('flex');
                    document.body.style.overflow = ''; // Restore scrolling
                });

                // Close modal when clicking outside the image
                imageModal.addEventListener('click', (e) => {
                    if (e.target === imageModal) {
                        imageModal.classList.add('hidden');
                        imageModal.classList.remove('flex');
                        document.body.style.overflow = '';
                    }
                });

                // Close modal with escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && !imageModal.classList.contains('hidden')) {
                        imageModal.classList.add('hidden');
                        imageModal.classList.remove('flex');
                        document.body.style.overflow = '';
                    }
                });
            }
        }
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeMobileMenu();
    
    // Check if we're on the products page
    if (window.location.pathname.includes('products.html')) {
        initializeProductFilters();
    } else if (window.location.pathname.includes('product-details.html')) {
        displayProductDetails();
    } else {
        // Homepage initialization
        Promise.all([
            updateHeroSection(),
            updateFeaturedItems(),
            fetchReviews()
        ]).then(() => {
            startHeroCarousel();
        });
    }
});
