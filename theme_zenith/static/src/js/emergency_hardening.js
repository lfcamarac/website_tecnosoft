/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

/**
 * Zenith Emergency Hardening
 * This script provides safety rails for Odoo 18 legacy widgets to prevent 
 * global crashes caused by "Bad Gateway" server errors or missing legacy services.
 */

// 1. Patches publicWidget to prevent "Cannot read properties of undefined (reading 'subscribe')"
const originalCall = publicWidget.Widget.prototype.call;
if (originalCall) {
    publicWidget.Widget.prototype.call = function (service) {
        try {
            const res = originalCall.apply(this, arguments);
            if (service === 'bus' && !res) {
                console.warn("Zenith: 'bus' service not found in current context. Using stub to prevent crash.");
                return {
                    subscribe: () => { console.log("Zenith: Stubbed bus.subscribe called (doing nothing)"); },
                    unsubscribe: () => {},
                    trigger: () => {},
                    on: () => {},
                    off: () => {}
                };
            }
            return res;
        } catch (e) {
            console.error("Zenith: Error in legacy call bridge", e);
            if (service === 'bus') {
                return { subscribe: () => {}, unsubscribe: () => {}, trigger: () => {} };
            }
            throw e;
        }
    };
}

// 2. Global listener for unhandled rejections (usually RPC Bad Gateways)
window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason && (reason.message?.includes('Bad Gateway') || reason.message?.includes('Unexpected token B'))) {
        console.error("Zenith Hardening: Intercepted Bad Gateway from server. Suppressing crash to keep UI alive.");
        event.preventDefault(); // Prevent standard crash dialog if possible
    }
});

console.log("Zenith Hardening: Legacy stability rails initialized.");
