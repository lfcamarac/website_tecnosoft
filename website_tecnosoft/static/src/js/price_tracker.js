/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.TecnosoftPriceTracker = publicWidget.Widget.extend({
    selector: '.tecnosoft-price-tracker-trigger',
    events: {
        'click': '_onSubscribeClick',
    },

    async _onSubscribeClick(ev) {
        const btn = ev.currentTarget;
        const productId = btn.dataset.productId;

        try {
            const result = await rpc('/website_tecnosoft/subscribe_price_tracker', {
                product_id: productId,
            });

            if (result.status === 'success') {
                btn.innerHTML = '<i class="fa fa-check me-2"></i>¡Suscrito!';
                btn.classList.replace('btn-outline-primary', 'btn-success');
                btn.disabled = true;
            }
        } catch (error) {
            console.error("Price Tracker Error:", error);
        }
    },
});
