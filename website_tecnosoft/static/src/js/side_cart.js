/** @odoo-module **/

import { publicWidget } from "@web/legacy/js/public/public_widget";

publicWidget.registry.ZenithSideCart = publicWidget.Widget.extend({
    selector: '#wrapwrap',
    events: {
        'click .close-cart': '_onCloseCart',
        'click .zenith-side-cart-overlay': '_onCloseCart',
        'click .js_add_cart': '_onAddToCart',
        'click .qty-btn': '_onUpdateQty',
    },

    start() {
        this.$overlay = this.$('.zenith-side-cart-overlay');
        this.$panel = this.$('.zenith-side-cart');
        return this._super.apply(this, arguments);
    },

    _onCloseCart() {
        this.$panel.removeClass('open');
        this.$overlay.removeClass('open');
    },

    _onAddToCart(ev) {
        // Wait for Odoo's default action to complete (Add to Cart)
        // Then refresh and open
        setTimeout(() => {
            this._refreshCart().then(() => {
                this.$panel.addClass('open');
                this.$overlay.addClass('open');
            });
        }, 800);
    },

    async _refreshCart() {
        this.$('.cart-content').css('opacity', '0.5');
        const data = await this.rpc('/website_tecnosoft/get_cart_data');
        this._renderCart(data);
        this.$('.cart-content').css('opacity', '1');
    },

    _renderCart(data) {
        const $content = this.$('.cart-content');
        const $total = this.$('.total-amount');
        
        if (data.lines.length === 0) {
            $content.html(`
                <div class="text-center py-5">
                    <i class="fa fa-shopping-basket fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Tu carrito está vacío</p>
                </div>
            `);
            $total.text('$ 0.00');
            return;
        }

        let html = '';
        data.lines.forEach(line => {
            html += `
                <div class="cart-item" data-line-id="${line.id}">
                    <img src="${line.image_url}" alt="${line.name}"/>
                    <div class="item-info">
                        <h6>${line.name}</h6>
                        <span class="item-price">${line.price}</span>
                    </div>
                    <div class="item-qty">
                        <span class="qty-btn minus fa fa-minus" data-id="${line.id}"></span>
                        <input type="text" value="${parseInt(line.qty)}" readonly/>
                        <span class="qty-btn plus fa fa-plus" data-id="${line.id}"></span>
                    </div>
                </div>
            `;
        });

        $content.html(html);
        $total.text(data.amount_total);

        // Update main cart badge too
        const $badge = $('.o_wsale_cart_quantity, .badge.bg-danger');
        $badge.text(data.cart_quantity);
    },

    async _onUpdateQty(ev) {
        const $btn = $(ev.currentTarget);
        const lineId = $btn.data('id');
        const isPlus = $btn.hasClass('plus');
        
        const $item = $btn.closest('.cart-item');
        const $input = $item.find('input');
        let currentQty = parseInt($input.val());
        let newQty = isPlus ? currentQty + 1 : currentQty - 1;

        if (newQty < 0) return;

        // Call Odoo's standard update_json (indirectly via rpc)
        // Note: we might need a custom route if standard one requires CSRF token in a specific way for non-form
        await this.rpc('/shop/cart/update_json', {
            line_id: lineId,
            set_qty: newQty
        });

        this._refreshCart();
    }
});

export default publicWidget.registry.ZenithSideCart;
