export function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

export function createMenuBar() {
    const nav = document.createElement('nav');
    nav.className = 'fixed w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm z-50 transition-colors duration-200';
    nav.innerHTML = `
        // ...existing menu bar HTML...
    `;
    return nav;
}
