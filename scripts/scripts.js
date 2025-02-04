import { initializeTheme } from './theme.js';
import { initializeMobileMenu, createMenuBar } from './menu.js';
import { initializeHeroImages, startHeroCarousel, updateHeroSection } from './carousel.js';
import { initializeProductFilters } from './products.js';
import { displayProductDetails } from './productDetails.js';
import { fetchReviews } from './reviews.js';

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Insert navigation bar
    const menuContainer = document.getElementById('menu-container');
    const nav = createMenuBar();
    
    if (menuContainer) {
        menuContainer.appendChild(nav);
    } else {
        document.body.insertBefore(nav, document.body.firstChild);
    }
    
    initializeTheme();
    initializeMobileMenu();

    const homeLink = document.getElementById('home-link');
    if (homeLink) {
        homeLink.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (window.location.pathname.includes('products.html')) {
        initializeProductFilters();
    } else if (window.location.pathname.includes('product-details.html')) {
        displayProductDetails();
    } else {
        initializeHeroImages();
        Promise.all([
            updateHeroSection(),
            fetchReviews()
        ]).then(() => {
            startHeroCarousel();
        });
    }
});
