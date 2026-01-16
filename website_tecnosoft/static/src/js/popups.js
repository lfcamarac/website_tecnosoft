/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.TecnosoftPopups = publicWidget.Widget.extend({
    selector: '#wrapwrap',

    /**
     * @override
     */
    start() {
        this._initExitIntentPopup();
        return this._super.apply(this, arguments);
    },

    /**
     * Show popup based on exit intent or time delay
     */
    async _initExitIntentPopup() {
        // Wait for bootstrap to be available (up to 5 seconds)
        let tries = 0;
        while (!window.bootstrap && tries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            tries++;
        }

        if (!window.bootstrap) {
            console.warn("Tecnosoft: Bootstrap not found, skipping popup init.");
            return;
        }

        const popupEl = document.getElementById('tecnosoft_popup');
        if (!popupEl) return;

        const modal = new window.bootstrap.Modal(popupEl);

        // Check if already shown in this session
        if (sessionStorage.getItem('tecnosoft_popup_shown')) return;

        // Exit intent logic (mouse leaves top of window)
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 0 && !sessionStorage.getItem('tecnosoft_popup_shown')) {
                this._showPopup(modal);
            }
        });

        // Fallback: Show after 20 seconds anyway
        setTimeout(() => {
            if (!sessionStorage.getItem('tecnosoft_popup_shown')) {
                this._showPopup(modal);
            }
        }, 20000);
    },

    _showPopup(modal) {
        modal.show();
        sessionStorage.setItem('tecnosoft_popup_shown', 'true');
    },
});
