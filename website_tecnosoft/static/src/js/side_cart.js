/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import { renderToElement } from "@web/core/utils/render";

publicWidget.registry.ZenithSideCart = publicWidget.Widget.extend({
    selector: "#wrapwrap",
    events: {
        "click .close-cart": "_onCloseCart",
        "click .zenith-side-cart-overlay": "_onCloseCart",
        "click .js_add_cart": "_onAddToCart",
        "click .qty-btn": "_onUpdateQty",
    },

    async start() {
        this.$overlay = this.$(".zenith-side-cart-overlay");
        this.$panel = this.$(".zenith-side-cart");
        setTimeout(() => {
            this._refreshCart();
        }, 1000);
        return this._super.apply(this, arguments);
    },

    _onCloseCart() {
        this.$panel.removeClass("open");
        this.$overlay.removeClass("open");
    },

    _onAddToCart(ev) {
        setTimeout(() => {
            this._showUpsellModal();
        }, 800);
    },

    async _showUpsellModal() {
        try {
            const data = await rpc("/website_tecnosoft/get_products_data", {
                limit: 4,
            });

            const element = renderToElement("website_tecnosoft.CartUpsellModal", {
                related_products: data.products,
            });

            $("#tecnosoft_cart_upsell").remove();
            $("body").append(element);

            const modal = new bootstrap.Modal(
                document.getElementById("tecnosoft_cart_upsell"),
            );
            modal.show();

            this._refreshCart();
        } catch (e) {
            console.error("SideCart: Error showing upsell modal", e);
        }
    },

    async _refreshCart() {
        try {
            this.$(".cart-content").css("opacity", "0.5");
            const data = await rpc("/website_tecnosoft/get_cart_data");
            this._renderCart(data);
            this.$(".cart-content").css("opacity", "1");
        } catch (e) {
             console.error("SideCart: Error refreshing cart", e);
        }
    },

    _renderCart(data) {
        const $content = this.$(".cart-content");
        const $total = this.$(".total-amount");
        const $shippingBar = this.$(".progress-bar");
        const $shippingText = this.$(".js_shipping_text");
        const threshold = 100;

        if (data.lines.length === 0) {
            $content.html(`
                <div class="text-center py-5">
                    <i class="fa fa-shopping-basket fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Tu carrito está vacío</p>
                </div>
            `);
            $total.text("$ 0.00");
            $shippingBar.css("width", "0%").attr("aria-valuenow", 0);
            $shippingText.text("Añade productos para envío GRATIS");
            return;
        }

        let html = "";
        data.lines.forEach((line) => {
            html += `
                <div class="cart-item" data-line-id="${line.id}">
                    <img src="${line.img}" alt="${line.product_name}"/>
                    <div class="item-info">
                        <h6>${line.product_name}</h6>
                        <span class="item-price">${data.currency} ${parseFloat(line.price).toFixed(2)}</span>
                    </div>
                    <div class="item-qty">
                        <span class="qty-btn minus fa fa-minus" data-id="${line.id}"></span>
                        <input type="text" value="${parseInt(line.quantity)}" readonly/>
                        <span class="qty-btn plus fa fa-plus" data-id="${line.id}"></span>
                    </div>
                </div>
            `;
        });

        $content.html(html);
        $total.text(`${data.currency} ${parseFloat(data.total).toFixed(2)}`);

        const percent = Math.min((data.total / threshold) * 100, 100);
        $shippingBar.css("width", `${percent}%`).attr("aria-valuenow", percent);

        if (percent >= 100) {
            $shippingText.html(
                '<span class="text-success">¡Genial! Tienes ENVÍO GRATIS <i class="fa fa-check-circle"></i></span>',
            );
            $shippingBar.addClass("bg-success").removeClass("bg-primary");
        } else {
            const remaining = threshold - data.total;
            $shippingText.text(
                `¡Solo te faltan ${data.currency} ${remaining.toFixed(2)} para envío GRATIS!`,
            );
            $shippingBar.addClass("bg-primary").removeClass("bg-success");
        }

        const $badge = $(".o_wsale_cart_quantity, .badge.bg-danger");
        $badge.text(data.cart_quantity);
    },

    async _onUpdateQty(ev) {
        const $btn = $(ev.currentTarget);
        const lineId = $btn.data("id");
        const isPlus = $btn.hasClass("plus");

        const $item = $btn.closest(".cart-item");
        const $input = $item.find("input");
        let currentQty = parseInt($input.val());
        let newQty = isPlus ? currentQty + 1 : currentQty - 1;

        if (newQty < 0) return;

        try {
            await rpc("/shop/cart/update_json", {
                line_id: lineId,
                set_qty: newQty,
            });

            this._refreshCart();
        } catch (e) {
            console.error("SideCart: Error updating qty", e);
        }
    },
});

export default publicWidget.registry.ZenithSideCart;
