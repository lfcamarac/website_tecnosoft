/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc_service";
import Widget from "@web/legacy/js/core/widget";

publicWidget.registry.TecnosoftStickyCart = Widget.extend({
    selector: '#product_details',
    events: {
        'change input[name="add_qty"]': '_onQtyChange',
    },

    /**
     * @override
     */
    start() {
        this.$stickyBar = $('#tecnosoft_sticky_cart');
        this.$mainBtn = this.$target.find('.js_check_product'); // Main Add to Cart button
        
        if (this.$stickyBar.length && this.$mainBtn.length) {
            this._setupObserver();
            // Listen for variant updates
            $(this.el).on('website_sale:update_combination_info', this._onCombinationUpdate.bind(this));
        }
        
        return this._super.apply(this, arguments);
    },

    /**
     * @private
     */
    _setupObserver() {
        const options = {
            root: null,
            threshold: 0,
            rootMargin: "-80px 0px 0px 0px" // Offset for header
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // If button is NOT intersecting and is ABOVE the viewport (top < 0)
                if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
                    this.$stickyBar.addClass('is-visible');
                    // Add padding to body to prevent content jump if needed (usually handled by fixed position)
                } else {
                    this.$stickyBar.removeClass('is-visible');
                }
            });
        }, options);

        this.observer.observe(this.$mainBtn[0]);
    },
    
    _onCombinationUpdate(ev, data) {
         if (this.$stickyBar.length) {
             // Update Price
             if (data.price) {
                 // Use Odoo's widget monetary if possible or simple update
                 // data.price is numeric. We might need formatted string or currency.
                 // Often data contains 'currency_id' etc.
                 // For now, let's look for a dedicated price container or use the one from the main page if accessible.
                 
                 // Simpler: Just update the hidden product_id input so the form submits the right variant.
             }
             
             // Update Product ID input
             this.$stickyBar.find('input[name="product_id"]').val(data.product_id);
             
             // Optional: Update displayed price text if we have it formatted
             // The event data usually has 'display_price' (float). Formatting it in JS is hard without session currency info.
             // We can clone the main price element's content if it updated?
             // Or rely on the fact that if the user scrolls down, they saw the price.
             // But let's try to update it if we can find the element.
             const $price = this.$stickyBar.find('[data-oe-type="monetary"] .oe_currency_value');
             if ($price.length && data.diff_price_eos === 0) { // If no extra complexity
                  $price.text(data.price); // This is raw float, might look ugly without formatting.
             }
         }
    },

    _onQtyChange(ev) {
        // Optional: Sync quantities. 
        // Since both forms submit to /shop/cart/update, it works independently.
    },

    /**
     * @override
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this._super(...arguments);
    }
});
