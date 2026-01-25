/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.TecnosoftSalesTriggers = publicWidget.Widget.extend({
    selector: '#wrapwrap',

    /**
     * @override
     */
    start() {
        this._initStickyCTA();
        return this._super ? this._super(...arguments) : Promise.resolve();
    },

    /**
     * Show sticky CTA on product page after scrolling past add-to-cart
     */
    _initStickyCTA() {
        const stickyCTA = document.querySelector('.tecnosoft-sticky-cta');
        const mainAddToCart = document.querySelector('#add_to_cart_container');

        if (stickyCTA && mainAddToCart) {
            window.addEventListener('scroll', () => {
                const rect = mainAddToCart.getBoundingClientRect();
                if (rect.bottom < 0) {
                    stickyCTA.classList.add('show-cta');
                } else {
                    stickyCTA.classList.remove('show-cta');
                }
            });
        }
    },

    /**
     * Show a social proof notification after a delay (Demo)
     */
    _initSocialProof() {
        const proof = document.querySelector('.tecnosoft-social-proof');
        if (proof) {
            setTimeout(() => {
                proof.classList.remove('d-none');
                setTimeout(() => {
                    proof.classList.add('show-proof');
                }, 100);

                // Auto hide after 5 seconds
                setTimeout(() => {
                    proof.classList.remove('show-proof');
                }, 6000);
            }, 3000); // Show after 3 seconds
        }
    },
});
