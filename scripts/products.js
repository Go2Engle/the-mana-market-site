import { fetchEtsyListings, truncateText, getEtsySearchUrl } from './utils.js';

let allProducts = [];
let filteredProducts = [];

export async function initializeProductFilters() {
    try {
        allProducts = await fetchEtsyListings();
        filteredProducts = [...allProducts];
        const categories = [...new Set(allProducts.map(item => {
            const title = item.TITLE.toLowerCase();
            if (title.includes('playmat')) return 'Playmats';
            if (title.includes('deck box')) return 'Deck Boxes';
            if (title.includes('shirt') || title.includes('hoodie')) return 'Apparel';
            return 'Other';
        }))].filter(Boolean);
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
        setupFilterEventListeners();
        renderProducts();
    } catch (error) {
        console.error('Error initializing product filters:', error);
    }
}

function setupFilterEventListeners() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    const categoryFilters = document.querySelectorAll('#category-filters input');
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
    const minPrice = document.getElementById('min-price');
    const maxPrice = document.getElementById('max-price');
    if (minPrice && maxPrice) {
        minPrice.addEventListener('input', applyFilters);
        maxPrice.addEventListener('input', applyFilters);
    }
    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }
    const clearButton = document.getElementById('clear-filters');
    if (clearButton) {
        clearButton.addEventListener('click', clearFilters);
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const selectedCategories = Array.from(document.querySelectorAll('#category-filters input:checked')).map(input => input.value);
    const minPrice = parseFloat(document.getElementById('min-price')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price')?.value) || Infinity;
    const sortBy = document.getElementById('sort')?.value || 'featured';
    filteredProducts = allProducts.filter(product => {
        const title = product.TITLE.replace('The Mana Market: ', '').toLowerCase();
        const description = product.DESCRIPTION.toLowerCase();
        const price = parseFloat(product.PRICE);
        let category = 'Other';
        if (title.includes('playmat')) category = 'Playmats';
        if (title.includes('deck box')) category = 'Deck Boxes';
        if (title.includes('shirt') || title.includes('hoodie')) category = 'Apparel';
        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);
        const matchesPrice = price >= minPrice && price <= maxPrice;
        return matchesSearch && matchesCategory && matchesPrice;
    });
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
    renderProducts();
}

function clearFilters() {
    const searchInput = document.getElementById('search');
    if (searchInput) searchInput.value = '';
    const categoryFilters = document.querySelectorAll('#category-filters input');
    categoryFilters.forEach(filter => filter.checked = false);
    const minPrice = document.getElementById('min-price');
    const maxPrice = document.getElementById('max-price');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    const sortSelect = document.getElementById('sort');
    if (sortSelect) sortSelect.value = 'featured';
    filteredProducts = [...allProducts];
    renderProducts();
}

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
