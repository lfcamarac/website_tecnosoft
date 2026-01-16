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
    _initExitIntentPopup() {
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
