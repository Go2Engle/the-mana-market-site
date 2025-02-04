import { fetchEtsyListings, getEtsySearchUrl } from './utils.js';

export async function displayProductDetails() {
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

        const displayTitle = product.TITLE.replace('The Mana Market: ', '');
        if (productBreadcrumb) {
            productBreadcrumb.textContent = displayTitle;
        }

        const images = [];
        for (let i = 1; i <= 10; i++) {
            const img = product[`IMAGE${i}`];
            if (img) images.push(img);
        }

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

        const mainImage = document.getElementById('main-image');
        const imageModal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const closeModal = document.getElementById('close-modal');
        const productImages = document.querySelectorAll('.product-image');

        if (imageModal && modalImage && closeModal) {
            function openModal(imageSrc) {
                modalImage.src = imageSrc;
                imageModal.classList.remove('hidden');
                imageModal.classList.add('flex');
                document.body.style.overflow = 'hidden';
            }

            function closeModalHandler() {
                imageModal.classList.add('hidden');
                imageModal.classList.remove('flex');
                document.body.style.overflow = '';
            }

            mainImage.addEventListener('click', () => openModal(mainImage.src));
            closeModal.addEventListener('click', closeModalHandler);
            imageModal.addEventListener('click', (e) => {
                if (e.target === imageModal) {
                    closeModalHandler();
                }
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !imageModal.classList.contains('hidden')) {
                    closeModalHandler();
                }
            });

            const thumbnails = Array.from(productImages).filter(img => img !== mainImage);
            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', () => {
                    mainImage.src = thumbnail.src;
                    mainImage.alt = thumbnail.alt;
                });
            });

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

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
}
