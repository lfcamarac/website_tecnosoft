/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import { _t } from "@web/core/l10n/translation";
import { renderToElement } from "@web/core/utils/render";

publicWidget.registry.TecnosoftCompareDrawer = publicWidget.Widget.extend({
    selector: '#wrapwrap',
    events: {
        'click .close-compare-drawer': '_onCloseDrawer',
        'click .remove-compare-item': '_onRemoveItem',
    },

    /**
     * @override
     */
    start: function () {
        this.$drawer = $('#tecnosoft_compare_drawer');
        this.$body = this.$drawer.find('.compare-drawer-body');
        this.$count = this.$drawer.find('.compare-count');
        
        // Listen to Odoo's native comparison events
        this.call('bus', 'subscribe', 'product_comparison_updated', (data) => {
            this._refreshDrawer(data);
        });

        // Initial load
        this._refreshDrawer();
        
        return this._super.apply(this, arguments);
    },

    _refreshDrawer: function (data) {
        // If no data provided, try to fetch from Odoo's comparison widget if available
        const comparisonWidget = publicWidget.registry.ProductComparison && publicWidget.registry.ProductComparison.prototype;
        
        this._rpc({
            route: '/shop/compare_data',
        }).then((res) => {
            if (res && res.products && res.products.length > 0) {
                this._renderItems(res.products);
                this.$drawer.removeClass('d-none').addClass('active');
            } else {
                this.$drawer.removeClass('active').addClass('d-none');
            }
        });
    },

    _renderItems: function (products) {
        this.$body.empty();
        this.$count.text(products.length);
        
        products.forEach(product => {
            const $item = $(`
                <div class="compare-item animate__animated animate__fadeInUp" data-product-id="${product.id}">
                    <div class="remove-compare-item" data-product-id="${product.id}">
                        <i class="fa fa-times"></i>
                    </div>
                    <img src="/web/image/product.product/${product.id}/image_128" alt="${product.name}"/>
                    <span class="item-name">${product.name}</span>
                </div>
            `);
            this.$body.append($item);
        });
    },

    _onCloseDrawer: function (ev) {
        this.$drawer.removeClass('active');
        setTimeout(() => this.$drawer.addClass('d-none'), 500);
    },

    _onRemoveItem: function (ev) {
        const productId = $(ev.currentTarget).data('product-id');
        this._rpc({
            route: '/shop/compare',
            params: {
                product_id: productId,
                action: 'remove',
            }
        }).then(() => {
            // Trigger Odoo's native refresh if possible, or just refresh ourselves
            this._refreshDrawer();
        });
    },
});

export default publicWidget.registry.TecnosoftCompareDrawer;
