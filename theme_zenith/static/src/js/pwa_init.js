/** @odoo-module **/

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = '/theme_zenith/static/src/js/service-worker.js';
        navigator.serviceWorker.register(swPath).then((registration) => {
            // console.log('Zenith Zenith PWA: registered', registration.scope);
        }).catch((err) => {
            console.error('Zenith Zenith PWA: registration failed', err);
        });
    });
}
