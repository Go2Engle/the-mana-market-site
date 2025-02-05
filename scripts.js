// DOM Elements
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const themeToggle = document.getElementById('theme-toggle');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

// Hero carousel data
const heroSlides = [];

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
    const titleElement = document.getElementById('hero-title');
    const descriptionElement = document.getElementById('hero-description');
    const linkElement = document.getElementById('hero-link');
    const image1 = document.getElementById('hero-image-1');
    const image2 = document.getElementById('hero-image-2');
    
    if (currentSlide >= 0 && currentSlide < heroSlides.length) {
        const slide = heroSlides[currentSlide];
        
        // Remove and re-add animation classes to restart animation
        titleElement.classList.remove('hero-fade-in');
        descriptionElement.classList.remove('hero-fade-in', 'hero-fade-in-delay');
        
        // Force a reflow to restart animations
        void titleElement.offsetWidth;
        void descriptionElement.offsetWidth;
        
        // Update content
        titleElement.textContent = slide.title;
        descriptionElement.textContent = slide.description;
        linkElement.href = slide.link;
        
        // Handle image crossfade
        const currentImage = activeImageElement === 1 ? image1 : image2;
        const nextImage = activeImageElement === 1 ? image2 : image1;
        
        // Set the new image on the hidden element
        nextImage.style.backgroundImage = `url('${slide.image}')`;
        
        // Fade out current image and fade in next image
        currentImage.style.opacity = '0';
        nextImage.style.opacity = '1';
        
        // Toggle active image for next update
        activeImageElement = activeImageElement === 1 ? 2 : 1;
        
        // Re-add animation classes
        titleElement.classList.add('hero-fade-in');
        descriptionElement.classList.add('hero-fade-in', 'hero-fade-in-delay');
    }
}

let activeImageElement = 1; // Track which image element is currently active

// Initialize hero images
function initializeHeroImages() {
    const image1 = document.getElementById('hero-image-1');
    const image2 = document.getElementById('hero-image-2');
    
    if (heroSlides.length > 0) {
        image1.style.backgroundImage = `url('${heroSlides[0].image}')`;
        image1.style.opacity = '1';
        image2.style.opacity = '0';
    }
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
                    <div class="aspect-w-1 aspect-h-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <img src="${images[0]}" alt="${displayTitle}" class="w-full h-96 object-cover cursor-pointer product-image hover:scale-105 transition-transform duration-300" id="main-image">
                    </div>
                    <div class="grid grid-cols-5 gap-4">
                        ${images.map((img, index) => `
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                <img src="${img}" alt="${displayTitle} ${index + 1}" 
                                    class="w-full h-20 object-cover cursor-pointer hover:opacity-75 transition-all duration-300 transform hover:scale-110 product-image">
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Product Info -->
                <div class="space-y-8">
                    <div class="space-y-4">
                        <h1 class="text-4xl font-bold bg-gradient-to-br from-gray-900 to-primary-light dark:from-white dark:to-primary-dark bg-clip-text text-transparent leading-tight hover:scale-[1.01] transform transition-all duration-300">${displayTitle}</h1>
                        <p class="text-3xl font-bold bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">$${product.PRICE}</p>
                    </div>

                    <div class="prose dark:prose-invert max-w-none space-y-4">
                        ${product.DESCRIPTION.split('\n').map(line => 
                            `<p class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">${line}</p>`
                        ).join('')}
                    </div>

                    ${variations.length > 0 ? `
                        <div class="space-y-6">
                            <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">Options</h3>
                            ${variations.map(variation => `
                                <div class="space-y-3">
                                    <h4 class="font-medium text-lg text-gray-900 dark:text-white">${variation.name}</h4>
                                    <div class="flex flex-wrap gap-3">
                                        ${variation.values.map(value => `
                                            <span class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                                ${value.trim()}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div class="space-y-4">
                        <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">Tags</h3>
                        <div class="flex flex-wrap gap-3">
                            ${product.TAGS.split(',').map(tag => `
                                <span class="group relative px-4 py-2 bg-gradient-to-br from-gray-100 to-white dark:from-gray-700 dark:to-gray-600 text-gray-900 dark:text-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
                                    <span class="relative z-10 inline-block group-hover:translate-x-1 transition-transform duration-300">${tag.trim().replace(/_/g, ' ')}</span>
                                    <div class="absolute inset-0 bg-gradient-to-r from-primary-light/10 to-primary-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary-light to-primary-dark group-hover:w-full transition-all duration-300"></div>
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <div class="pt-6">
                        <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" 
                           class="group w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#F1641E] to-[#FF8A3D] text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
                            <i class="fab fa-etsy text-2xl mr-3 group-hover:scale-110 transition-transform duration-300"></i>
                            <span class="text-lg font-semibold">View on Etsy</span>
                        </a>
                    </div>
                </div>
            </div>
        `;

        productDetails.innerHTML = html;

        // Set up image modal functionality
        const mainImage = document.getElementById('main-image');
        const imageModal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const closeModal = document.getElementById('close-modal');
        const productImages = document.querySelectorAll('.product-image');

        if (imageModal && modalImage && closeModal) {
            // Function to open modal
            function openModal(imageSrc) {
                modalImage.src = imageSrc;
                imageModal.classList.remove('hidden');
                imageModal.classList.add('flex');
                document.body.style.overflow = 'hidden';
            }

            // Function to close modal
            function closeModalHandler() {
                imageModal.classList.add('hidden');
                imageModal.classList.remove('flex');
                document.body.style.overflow = '';
            }

            // Add click event only to main image for modal
            mainImage.addEventListener('click', () => openModal(mainImage.src));

            // Close modal when clicking close button
            closeModal.addEventListener('click', closeModalHandler);

            // Close modal when clicking outside the image
            imageModal.addEventListener('click', (e) => {
                if (e.target === imageModal) {
                    closeModalHandler();
                }
            });

            // Close modal with escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !imageModal.classList.contains('hidden')) {
                    closeModalHandler();
                }
            });

            // Set up thumbnail functionality (only updates main image)
            const thumbnails = Array.from(productImages).filter(img => img !== mainImage);
            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', () => {
                    mainImage.src = thumbnail.src;
                    mainImage.alt = thumbnail.alt;
                });
            });

            // Add zoom functionality to modal image
            let isZoomed = false;
            modalImage.addEventListener('click', () => {
                if (isZoomed) {
                    modalImage.style.transform = 'scale(1)';
                    modalImage.style.cursor = 'zoom-in';
                } else {
                    modalImage.style.transform = 'scale(2)';
                    modalImage.style.cursor = 'zoom-out';
                }
                isZoomed = !isZoomed;
            });
        }

    } catch (error) {
        console.error('Error displaying product details:', error);
        productDetails.innerHTML = '<p class="text-center text-gray-900 dark:text-white">Error loading product details</p>';
    }
}

// Function to create menu bar for consistency across pages
function createMenuBar() {
    const nav = document.createElement('nav');
    nav.className = 'fixed w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm z-50 transition-colors duration-200';
    
    nav.innerHTML = `
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <div id="home-link" class="text-2xl font-bold text-gradient cursor-pointer">The Mana Market</div>
            
            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center space-x-8">
                <a href="index.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition">Home</a>
                <a href="products.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition">Products</a>
                <a href="index.html#testimonials" class="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition">Reviews</a>
                <a href="index.html#about" class="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition">About</a>
                <button id="theme-toggle" class="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition">
                    <i class="fas fa-moon dark:hidden"></i>
                    <i class="fas fa-sun hidden dark:inline"></i>
                </button>
            </div>
            
            <!-- Mobile Menu Button -->
            <div class="md:hidden flex items-center">
                <button id="mobile-theme-toggle" class="mr-4 text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition">
                    <i class="fas fa-moon dark:hidden"></i>
                    <i class="fas fa-sun hidden dark:inline"></i>
                </button>
                <button id="mobile-menu-button" class="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="md:hidden hidden bg-white dark:bg-gray-800 transition-colors duration-200">
            <div class="container mx-auto px-4 py-4 space-y-4">
                <a href="index.html" class="block text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition">Home</a>
                <a href="products.html" class="block text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition">Products</a>
                <a href="index.html#testimonials" class="block text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition">Reviews</a>
                <a href="index.html#about" class="block text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition">About</a>
            </div>
        </div>
    `;
    
    return nav;
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Insert navigation bar
    const menuContainer = document.getElementById('menu-container');
    const nav = createMenuBar();
    
    if (menuContainer) {
        // If menu-container exists, insert into it
        menuContainer.appendChild(nav);
    } else {
        // Otherwise, insert at the start of body
        document.body.insertBefore(nav, document.body.firstChild);
    }
    
    initializeTheme();
    initializeMobileMenu();

    // Add event listener to "The Mana Market" text
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
        homeLink.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Check if we're on the products page
    if (window.location.pathname.includes('products.html')) {
        initializeProductFilters();
    } else if (window.location.pathname.includes('product-details.html')) {
        displayProductDetails();
    } else {
        // Homepage initialization
        initializeHeroImages();
        Promise.all([
            updateHeroSection(),
            updateFeaturedItems(),
            fetchReviews()
        ]).then(() => {
            startHeroCarousel();
        });
    }
});
