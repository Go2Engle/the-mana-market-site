const STORE_URL = 'https://www.etsy.com/shop/themanamarket';
let allProducts = [];

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const cleanTitle = (title = '') => title.replace(/^The Mana Market:\s*/i, '').trim();
const productUrl = item => `product-details.html?title=${encodeURIComponent(item.TITLE)}`;
const etsyUrl = item => item.url || item.URL || `${STORE_URL}/search?search_query=${encodeURIComponent(cleanTitle(item.TITLE))}`;
const getCategory = item => {
    const title = (item.TITLE || '').toLowerCase();
    if (title.includes('deck box')) return 'Deck Boxes';
    if (title.includes('bag')) return 'Carry Gear';
    if (title.includes('shirt') || title.includes('hoodie') || title.includes('sweatshirt')) return 'Apparel';
    if (title.includes('playmat') || title.includes('play mat')) return 'Playmats';
    return 'Accessories';
};

function parseCSV(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i += 1) {
        const char = text[i], next = text[i + 1];
        if (char === '"' && quoted && next === '"') { field += '"'; i += 1; }
        else if (char === '"') quoted = !quoted;
        else if (char === ',' && !quoted) { row.push(field); field = ''; }
        else if ((char === '\n' || char === '\r') && !quoted) {
            if (char === '\r' && next === '\n') i += 1;
            row.push(field); field = '';
            if (row.some(cell => cell.trim())) rows.push(row);
            row = [];
        } else field += char;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    const headers = rows.shift().map(header => header.trim());
    return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()])));
}

async function fetchProducts() {
    if (allProducts.length) return allProducts;
    const response = await fetch('EtsyListings.csv');
    if (!response.ok) throw new Error('Unable to load product catalog');
    allProducts = parseCSV(await response.text()).filter(item => item.TITLE && item.IMAGE1);
    return allProducts;
}

function createHeader() {
    const path = window.location.pathname;
    const shopActive = path.includes('products') || path.includes('product-details');
    return `
        <header class="site-header">
            <div class="nav-row shell">
                <a class="brand" href="index.html" aria-label="The Mana Market home"><span class="brand-mark">M</span><span>The Mana Market</span></a>
                <nav class="desktop-nav" aria-label="Main navigation"><a class="${shopActive ? '' : 'active'}" href="index.html">Home</a><a class="${shopActive ? 'active' : ''}" href="products.html">Products</a><a href="index.html#testimonials">Reviews</a></nav>
                <div class="nav-actions"><a class="shop-button" href="${STORE_URL}" target="_blank" rel="noopener">Shop on Etsy</a><button id="menu-toggle" class="menu-button" aria-label="Open menu" aria-expanded="false">☰</button></div>
            </div>
            <nav id="mobile-menu" class="mobile-menu" aria-label="Mobile navigation"><a href="index.html">Home</a><a href="products.html">Products</a><a href="index.html#testimonials">Reviews</a><a href="${STORE_URL}" target="_blank" rel="noopener">Shop on Etsy</a></nav>
        </header>`;
}

function createFooter() {
    return `<footer class="site-footer"><div class="shell"><div class="footer-main"><a class="brand" href="index.html"><span class="brand-mark">M</span><span>The Mana Market</span></a><nav class="footer-links" aria-label="Footer navigation"><a href="products.html">Products</a><a href="index.html#testimonials">Reviews</a><a href="${STORE_URL}" target="_blank" rel="noopener">Etsy shop</a></nav><div class="footer-contact" aria-label="Contact information"><a href="mailto:chris@themanamarket.com"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg><span>chris@themanamarket.com</span></a><a href="https://www.instagram.com/themanamarketoffical/" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r=".75"></circle></svg><span>themanamarketoffical</span></a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} The Mana Market</span><span>TCG accessories sold through Etsy</span></div></div></footer>`;
}

function initializeChrome() {
    document.getElementById('menu-container').innerHTML = createHeader();
    document.getElementById('footer-container').innerHTML = createFooter();
    const menuButton = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    menuButton.addEventListener('click', () => {
        const open = mobileMenu.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.textContent = open ? '×' : '☰';
        document.body.classList.toggle('menu-open', open);
    });
}

function productCard(item) {
    const title = cleanTitle(item.TITLE);
    const category = getCategory(item);
    return `<article class="product-card"><a class="product-image-wrap" href="${productUrl(item)}"><img src="${escapeHtml(item.IMAGE1)}" alt="${escapeHtml(title)}" loading="lazy"></a><div class="product-meta"><span class="product-category">${category}</span><a class="product-name" href="${productUrl(item)}">${escapeHtml(title)}</a><div class="product-bottom"><span class="product-price">$${Number(item.PRICE).toFixed(2)}</span></div></div></article>`;
}

async function initializeHome() {
    try {
        const products = await fetchProducts();
        const hero = products[0];
        document.getElementById('hero-product-image').src = hero.IMAGE1;
        document.getElementById('hero-product-image').alt = cleanTitle(hero.TITLE);
        document.getElementById('hero-product-name').textContent = cleanTitle(hero.TITLE);
        document.getElementById('hero-product-price').textContent = `$${Number(hero.PRICE).toFixed(2)}`;
        document.getElementById('hero-product-link').href = productUrl(hero);
        document.getElementById('featured-items').innerHTML = products.slice(0, 4).map(productCard).join('');
    } catch (error) {
        document.getElementById('featured-items').innerHTML = '<p class="empty-state">The collection could not be loaded right now. Please visit our Etsy shop.</p>';
    }
    try {
        const response = await fetch('reviews.json');
        const reviews = await response.json();
        const visibleReviews = reviews.slice(0, 12);
        const reviewCard = (review, duplicate = false) => `<article class="review-card"${duplicate ? ' aria-hidden="true"' : ''}><div class="review-stars">${'★'.repeat(review.star_rating)}</div><blockquote>“${escapeHtml(review.message.length > 180 ? `${review.message.slice(0, 177)}…` : review.message)}”</blockquote><div class="review-author"><strong>${escapeHtml(review.reviewer)}</strong><span>Etsy buyer · ${escapeHtml(review.date_reviewed)}</span></div></article>`;
        document.getElementById('reviews-container').innerHTML = visibleReviews.map(review => reviewCard(review)).join('') + visibleReviews.map(review => reviewCard(review, true)).join('');
        const reviewsWindow = document.getElementById('reviews-window');
        const reviewsTrack = document.getElementById('reviews-container');
        const firstDuplicate = reviewsTrack.querySelector('[aria-hidden="true"]');
        const loopPoint = firstDuplicate.getBoundingClientRect().left - reviewsTrack.getBoundingClientRect().left;
        let isPaused = false;
        let isDragging = false;
        let dragStartX = 0;
        let dragStartScroll = 0;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const animateReviews = () => {
            if (!isPaused && !isDragging && !prefersReducedMotion) {
                reviewsWindow.scrollLeft += .7;
                if (reviewsWindow.scrollLeft >= loopPoint) reviewsWindow.scrollLeft -= loopPoint;
            }
        };
        reviewsWindow.addEventListener('mouseleave', () => { isPaused = false; isDragging = false; reviewsWindow.classList.remove('is-dragging'); });
        reviewsWindow.addEventListener('pointerdown', event => {
            if (event.pointerType !== 'mouse') return;
            isDragging = true;
            isPaused = true;
            dragStartX = event.clientX;
            dragStartScroll = reviewsWindow.scrollLeft;
            reviewsWindow.classList.add('is-dragging');
            reviewsWindow.setPointerCapture(event.pointerId);
        });
        reviewsWindow.addEventListener('pointermove', event => {
            if (!isDragging) return;
            reviewsWindow.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
        });
        const finishReviewDrag = event => {
            if (!isDragging) return;
            isDragging = false;
            reviewsWindow.classList.remove('is-dragging');
            if (reviewsWindow.hasPointerCapture(event.pointerId)) reviewsWindow.releasePointerCapture(event.pointerId);
            window.setTimeout(() => { isPaused = false; }, 800);
        };
        reviewsWindow.addEventListener('pointerup', finishReviewDrag);
        reviewsWindow.addEventListener('pointercancel', finishReviewDrag);
        reviewsWindow.addEventListener('touchstart', () => { isPaused = true; }, {passive: true});
        reviewsWindow.addEventListener('touchend', () => { window.setTimeout(() => { isPaused = false; }, 800); }, {passive: true});
        window.setInterval(animateReviews, 50);
    } catch (_) { document.getElementById('reviews-container').innerHTML = ''; }
}

function categoryCounts(products) {
    return products.reduce((counts, item) => { const key = getCategory(item); counts[key] = (counts[key] || 0) + 1; return counts; }, {});
}

async function initializeCatalog() {
    const grid = document.getElementById('products-grid');
    try {
        const products = await fetchProducts();
        const categories = categoryCounts(products);
        const params = new URLSearchParams(location.search);
        const requestedCategory = params.get('category');
        document.getElementById('search').value = params.get('search') || '';
        document.getElementById('category-filters').innerHTML = Object.keys(categories).sort().map(category => `<label class="filter-option"><div><input type="checkbox" value="${escapeHtml(category)}" ${requestedCategory === category ? 'checked' : ''}><span>${escapeHtml(category)}</span></div><b>${categories[category]}</b></label>`).join('');
        const applyFilters = () => {
            const search = document.getElementById('search').value.toLowerCase().trim();
            const selected = [...document.querySelectorAll('#category-filters input:checked')].map(input => input.value);
            const min = Number(document.getElementById('min-price').value || 0);
            const max = Number(document.getElementById('max-price').value || Infinity);
            let filtered = products.filter(item => (!search || `${item.TITLE} ${item.TAGS}`.toLowerCase().includes(search)) && (!selected.length || selected.includes(getCategory(item))) && Number(item.PRICE) >= min && Number(item.PRICE) <= max);
            const sort = document.getElementById('sort').value;
            if (sort === 'price-asc') filtered.sort((a,b) => Number(a.PRICE)-Number(b.PRICE));
            if (sort === 'price-desc') filtered.sort((a,b) => Number(b.PRICE)-Number(a.PRICE));
            if (sort === 'name-asc') filtered.sort((a,b) => cleanTitle(a.TITLE).localeCompare(cleanTitle(b.TITLE)));
            if (sort === 'name-desc') filtered.sort((a,b) => cleanTitle(b.TITLE).localeCompare(cleanTitle(a.TITLE)));
            document.getElementById('product-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'}`;
            grid.innerHTML = filtered.length ? filtered.map(productCard).join('') : '<div class="empty-state"><h2>No gear found.</h2><p>Try clearing a filter or searching for something broader.</p></div>';
        };
        document.querySelectorAll('#filters input, #sort').forEach(control => control.addEventListener(control.type === 'search' || control.type === 'number' ? 'input' : 'change', applyFilters));
        document.getElementById('clear-filters').addEventListener('click', () => { document.querySelectorAll('#filters input').forEach(input => { input.type === 'checkbox' ? input.checked = false : input.value = ''; }); document.getElementById('sort').value = 'featured'; applyFilters(); });
        const toggle = document.getElementById('toggle-filters');
        toggle.addEventListener('click', () => { const open = document.getElementById('filters').classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); toggle.querySelector('span').textContent = open ? '−' : '＋'; });
        applyFilters();
    } catch (error) { grid.innerHTML = '<div class="empty-state"><h2>We could not load the collection.</h2><p>Please try again or visit our Etsy shop.</p></div>'; }
}

function descriptionMarkup(description = '') {
    const featureLine = line => {
        const text = line.replace(/^-\s*/, '').trim();
        const colon = text.indexOf(':');
        if (colon > 0 && colon < 80) return `<strong>${escapeHtml(text.slice(0, colon + 1))}</strong>${escapeHtml(text.slice(colon + 1))}`;
        return escapeHtml(text);
    };
    return description.trim().split(/\n\s*\n/).filter(Boolean).map(block => {
        const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
        const bulletLines = lines.filter(line => line.startsWith('-'));
        if (bulletLines.length === lines.length) return `<ul>${bulletLines.map(line => `<li>${featureLine(line)}</li>`).join('')}</ul>`;
        if (lines[0]?.endsWith(':') && bulletLines.length) {
            return `<h3>${escapeHtml(lines[0].slice(0, -1))}</h3><ul>${bulletLines.map(line => `<li>${featureLine(line)}</li>`).join('')}</ul>`;
        }
        if (lines.length === 1 && lines[0].endsWith(':')) return `<h3>${escapeHtml(lines[0].slice(0, -1))}</h3>`;
        return `<p>${escapeHtml(lines.join(' '))}</p>`;
    }).join('');
}

async function initializeProductDetail() {
    const container = document.getElementById('product-details');
    try {
        const products = await fetchProducts();
        const titleParam = new URLSearchParams(location.search).get('title');
        const item = products.find(product => product.TITLE === titleParam);
        if (!item) throw new Error('Product not found');
        const title = cleanTitle(item.TITLE);
        const images = Array.from({length:10}, (_, index) => item[`IMAGE${index + 1}`]).filter(Boolean);
        const variations = [1,2].map(index => ({name:item[`VARIATION ${index} NAME`], values:(item[`VARIATION ${index} VALUES`] || '').split(',').filter(Boolean)})).filter(variation => variation.name && variation.values.length);
        const canonicalUrl = `https://themanamarket.com/product-details?title=${encodeURIComponent(item.TITLE)}`;
        const metaDescription = item.DESCRIPTION.replace(/\s+/g, ' ').trim().slice(0, 155);
        const encodedShareUrl = encodeURIComponent(canonicalUrl);
        const encodedShareText = encodeURIComponent(`${title} | The Mana Market`);
        document.title = `${title} | The Mana Market`;
        document.querySelector('meta[name="description"]').content = metaDescription;
        document.querySelector('meta[name="keywords"]').content = `${title}, ${getCategory(item)}, MTG accessories, Magic The Gathering, The Mana Market`;
        document.querySelector('meta[property="og:title"]').content = `${title} | The Mana Market`;
        document.querySelector('meta[property="og:description"]').content = metaDescription;
        document.querySelector('meta[property="og:url"]').content = canonicalUrl;
        document.querySelector('meta[property="og:image"]').content = images[0];
        document.querySelector('link[rel="canonical"]').href = canonicalUrl;
        document.getElementById('productSchema').textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: title,
            description: item.DESCRIPTION,
            image: images,
            sku: item.SKU || undefined,
            brand: {'@type': 'Brand', name: 'The Mana Market'},
            offers: {
                '@type': 'Offer',
                url: etsyUrl(item),
                priceCurrency: item.CURRENCY_CODE || 'USD',
                price: Number(item.PRICE).toFixed(2),
                availability: Number(item.QUANTITY) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
            }
        });
        document.getElementById('product-breadcrumb').textContent = title;
        container.innerHTML = `
            <div class="detail-layout">
                <div class="detail-gallery">
                    <div class="thumb-list">
                        ${images.map((image,index) => `<button class="thumb-button ${index === 0 ? 'active' : ''}" data-image="${escapeHtml(image)}" aria-label="View product image ${index + 1}"><img src="${escapeHtml(image)}" alt=""></button>`).join('')}
                    </div>
                    <div class="main-image-wrap">
                        <img id="main-product-image" src="${escapeHtml(images[0])}" alt="${escapeHtml(title)}">
                    </div>
                </div>
                <div class="detail-info">
                    <span class="detail-kicker">${getCategory(item)}</span>
                    <h1>${escapeHtml(title)}</h1>
                    <div class="detail-price">$${Number(item.PRICE).toFixed(2)}</div>
                    <div class="product-share">
                        <strong>Share:</strong>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}" target="_blank" rel="noopener" aria-label="Share this product on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-.7.3-1 1-1Z"/></svg></a>
                        <a href="https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedShareText}" target="_blank" rel="noopener" aria-label="Share this product on X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 4 14 16M19 4 5 20"/></svg></a>
                        <button id="copy-product-link" type="button" aria-label="Copy product link"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg></button>
                        <span id="share-status" aria-live="polite"></span>
                    </div>
                    <div class="detail-description">${descriptionMarkup(item.DESCRIPTION)}</div>
                    ${variations.map((variation,index) => `<div class="variation"><label for="variation-${index}">${escapeHtml(variation.name)}</label><select id="variation-${index}">${variation.values.map(value => `<option>${escapeHtml(value)}</option>`).join('')}</select></div>`).join('')}
                    <a class="button etsy-button" href="${escapeHtml(etsyUrl(item))}" target="_blank" rel="noopener">View and purchase on Etsy</a>
                </div>
            </div>`;
        const mainImage = document.getElementById('main-product-image');
        const thumbnailButtons = Array.from(document.querySelectorAll('.thumb-button'));
        thumbnailButtons.forEach(button => button.addEventListener('click', () => {
            mainImage.src = button.dataset.image;
            thumbnailButtons.forEach(thumb => thumb.classList.remove('active'));
            button.classList.add('active');
            button.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }));
        const modal = document.getElementById('image-modal');
        document.querySelector('.main-image-wrap').addEventListener('click', () => { document.getElementById('modal-image').src = mainImage.src; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); });
        const closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); };
        document.getElementById('close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
        document.getElementById('copy-product-link').addEventListener('click', async () => {
            const status = document.getElementById('share-status');
            try {
                await navigator.clipboard.writeText(canonicalUrl);
                status.textContent = 'Link copied';
            } catch (_) {
                status.textContent = 'Unable to copy';
            }
            window.setTimeout(() => { status.textContent = ''; }, 2000);
        });
        const similar = products.filter(product => product !== item).sort((a,b) => Number(getCategory(b) === getCategory(item)) - Number(getCategory(a) === getCategory(item))).slice(0,4);
        document.getElementById('similar-items').innerHTML = similar.map(product => productCard(product)).join('');
    } catch (error) { container.innerHTML = '<div class="empty-state"><h2>That item slipped out of the binder.</h2><p><a class="text-link" href="products.html">Return to the collection</a></p></div>'; document.querySelector('.similar-section').hidden = true; }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeChrome();
    if (document.getElementById('featured-items')) initializeHome();
    if (document.getElementById('products-grid')) initializeCatalog();
    if (document.getElementById('product-details')) initializeProductDetail();
});
