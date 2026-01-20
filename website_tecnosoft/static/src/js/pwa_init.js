/** @odoo-module **/

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = '/website_tecnosoft/static/src/js/service-worker.js';
        navigator.serviceWorker.register(swPath).then((registration) => {
            // console.log('Tecnosoft Zenith PWA: registered', registration.scope);
        }).catch((err) => {
            console.error('Tecnosoft Zenith PWA: registration failed', err);
        });
    });
}
