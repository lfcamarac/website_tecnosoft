/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc_service";
import Widget from "@web/legacy/js/core/widget";

publicWidget.registry.TecnosoftCompleteLook = Widget.extend({
    selector: '.tecnosoft-complete-look',
    events: {
        'change .js_together_check': '_updateTotal',
        'click .js_add_together_pack': '_onAddPack',
    },

    /**
     * @override
     */
    start() {
        this.$totalDisplay = this.$('#together_pack_total');
        this.basePrice = parseFloat($('span.oe_price .oe_currency_value').text().replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
        this._updateTotal();
        return this._super.apply(this, arguments);
    },

    /**
     * @private
     */
    _updateTotal() {
        let total = this.basePrice;
        this.$('.js_together_check:checked').each(function() {
            total += parseFloat($(this).data('price')) || 0;
        });
        this.$totalDisplay.text(new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total));
    },

    /**
     * @private
     */
    async _onAddPack(ev) {
        const $btn = $(ev.currentTarget);
        const products = [];
        
        // Add main product
        const mainVariantId = parseInt($('input[name="product_id"]').val());
        const mainQty = parseInt($('input[name="add_qty"]').val()) || 1;
        products.push({ 'product_id': mainVariantId, 'qty': mainQty });

        // Add checked secondary products
        this.$('.js_together_check:checked').each(function() {
            products.push({ 'product_id': $(this).data('id'), 'qty': 1 });
        });

        $btn.html('<i class="fa fa-circle-o-notch fa-spin me-2"></i> COMPRANDO...');
        
        try {
            const res = await rpc('/website_tecnosoft/bulk_add_cart', { products: products });
            if (res.success) {
                window.location.href = '/shop/cart';
            }
        } catch (e) {
            console.error(e);
            $btn.html('ERROR <i class="fa fa-times ms-2"></i>');
        }
    }
});

export default publicWidget.registry.TecnosoftCompleteLook;
