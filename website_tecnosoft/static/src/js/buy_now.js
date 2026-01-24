/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.TecnosoftBuyNow = publicWidget.Widget.extend({
    selector: '.js_buy_now',
    events: {
        'click': '_onBuyNow',
    },

    /**
     * @private
     */
    async _onBuyNow(ev) {
        ev.preventDefault();
        const $btn = $(ev.currentTarget);
        
        // Find the closest product details container or form
        const $form = $btn.closest('form');
        let productId, qty;

        if ($form.length) {
            productId = parseInt($form.find('input[name="product_id"]').val());
            qty = parseInt($form.find('input[name="add_qty"]').val()) || 1;
        } else {
            // Fallback for sticky CTA or other non-form contexts
            productId = parseInt($('.js_main_product input[name="product_id"]').val());
            qty = parseInt($('.js_main_product input[name="add_qty"]').val()) || 1;
        }

        if (!productId) {
            console.error("Product ID not found for Buy Now");
            return;
        }

        $btn.addClass('disabled').html('<i class="fa fa-spinner fa-spin me-2"></i> Procesando...');

        try {
            // Use bulk_add_cart or simple cart update
            // Using rpc directly for simplicity
            const res = await rpc('/website_tecnosoft/bulk_add_cart', {
                products: [{ 'product_id': productId, 'qty': qty }]
            });

            if (res.success) {
                // Redirect directly to checkout
                window.location.href = '/shop/checkout';
            } else {
                window.location.href = '/shop/cart'; // Fallback
            }
        } catch (e) {
            console.error(e);
            window.location.href = '/shop/cart'; // Fallback on error
        }
    }
});

export default publicWidget.registry.TecnosoftBuyNow;
