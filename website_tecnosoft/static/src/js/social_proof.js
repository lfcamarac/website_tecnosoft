/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.TecnosoftSocialProof = publicWidget.Widget.extend({
    selector: '#wrapwrap',
    
    /**
     * @override
     */
    start: function () {
        this.orders = [];
        this.currentIndex = 0;
        this._fetchOrders();
        return this._super.apply(this, arguments);
    },

    _fetchOrders: async function () {
        try {
            const res = await rpc('/website_tecnosoft/get_recent_orders');
            if (res && res.length > 0) {
                this.orders = res;
                this._startCycle();
            }
        } catch (e) {
            console.error("Social Proof Fetch Error", e);
        }
    },

    _startCycle: function () {
        // Show first notification after 10 seconds
        setTimeout(() => this._showNextNotification(), 10000);
    },

    _showNextNotification: function () {
        if (!this.orders.length) return;

        const order = this.orders[this.currentIndex];
        this._renderToast(order);

        this.currentIndex = (this.currentIndex + 1) % this.orders.length;
        
        // Schedule next one (between 25 and 45 seconds)
        const nextDelay = Math.floor(Math.random() * (45000 - 25000 + 1)) + 25000;
        setTimeout(() => this._showNextNotification(), nextDelay);
    },

    _renderToast: function (order) {
        // Remove existing if any
        $('.tecnosoft-social-proof').remove();

        const $toast = $(`
            <div class="tecnosoft-social-proof animate__animated animate__fadeInLeft">
                <button class="close-social-proof"><i class="fa fa-times"></i></button>
                <div class="d-flex align-items-center gap-3">
                    <div class="order-img">
                        <img src="${order.product_image}" alt="${order.product_name}"/>
                    </div>
                    <div class="order-info">
                        <p class="mb-0 text-muted small">Alguien en <strong>${order.location}</strong></p>
                        <p class="mb-0 fw-bold product-name-toast">${order.product_name}</p>
                        <p class="mb-0 text-primary x-small">${order.time_ago}</p>
                    </div>
                </div>
            </div>
        `);

        $('body').append($toast);

        $toast.on('click', '.close-social-proof', function() {
            $toast.removeClass('animate__fadeInLeft').addClass('animate__fadeOutLeft');
            setTimeout(() => $toast.remove(), 500);
        });

        // Auto remove after 8 seconds
        setTimeout(() => {
            if ($toast.parent().length) {
                $toast.removeClass('animate__fadeInLeft').addClass('animate__fadeOutLeft');
                setTimeout(() => $toast.remove(), 500);
            }
        }, 8000);
    }
});

export default publicWidget.registry.TecnosoftSocialProof;
