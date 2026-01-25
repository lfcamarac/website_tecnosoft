/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.TecnosoftBranchStock = publicWidget.Widget.extend({
    selector: '.tecnosoft-product-page', // We need to add this class to the product page wrapper if not present, or target generic
    // Actually, 'website_sale' triggers events on the window or specific containers.
    // Let's target the wrap that contains the variant selector.
    selector: '#product_details',
    events: {
        'change_variant .js_product': '_onVariantChange', // Standard Odoo hook
        // Odoo 16+ might use a custom event 'website_sale:product_variant_changed'
    },

    /**
     * @override
     */
    start: function () {
        // Bind to custom event for newer Odoo versions if standard selector doesn't catch it
        // The standard 'WebsiteSale' widget triggers 'change_variant' on itself, but bubbles up? 
        // Odoo 16/17/18: "website_sale:product_variant_changed" on document or window.
        /* 
           Usually handled via inheriting 'website_sale.WebsiteSale' snippet, 
           but here we want a lightweight listener.
        */
        
        // Listen to the custom event triggered by Odoo's core website_sale mechanism
        $(this.el).on('website_sale:update_combination_info', this._onCombinationUpdate.bind(this));
        
        return this._super ? this._super(...arguments) : Promise.resolve();
    },

    /**
     * Called when Odoo updates product info (price, combination) after variant change.
     */
    _onCombinationUpdate: async function (ev, data) {
         if (data.product_id) {
             this._fetchBranchStock(data.product_id);
         }
    },

    _fetchBranchStock: async function (productId) {
        const $container = this.$('#tecnosoft_branch_stock_container');
        if (!$container.length) return;

        // Add loading state
        $container.addClass('opacity-50');

        try {
            const result = await rpc('/shop/get_branch_stock', {
                product_id: parseInt(productId)
            });
            this._renderStockTable(result);
        } catch (e) {
            console.error("Tecnosoft: Error fetching branch stock", e);
        } finally {
            $container.removeClass('opacity-50');
        }
    },

    _renderStockTable: function (stockData) {
        const $container = this.$('#tecnosoft_branch_stock_container');
        
        if (!stockData || stockData.length === 0) {
            $container.addClass('d-none');
            return;
        }

        $container.removeClass('d-none');
        const $tbody = $container.find('tbody');
        $tbody.empty();

        stockData.forEach(branch => {
            const row = `
                <tr>
                    <td class="align-middle py-2">
                        <i class="fa fa-map-marker text-primary me-2"></i>
                        <span class="fw-bold text-dark">${branch.name}</span>
                        ${branch.desc ? `<small class="d-block text-muted ps-4">${branch.desc}</small>` : ''}
                    </td>
                    <td class="text-end align-middle py-2">
                        <span class="badge bg-success rounded-pill px-3 py-2 shadow-sm">
                            ${branch.qty} Disponibles
                        </span>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });
    }
});
