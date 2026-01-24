/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

const StickyCart = publicWidget.Widget.extend({
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
                } else {
                    this.$stickyBar.removeClass('is-visible');
                }
            });
        }, options);

        this.observer.observe(this.$mainBtn[0]);
    },
    
    _onCombinationUpdate(ev, data) {
         if (this.$stickyBar.length) {
             // Update Product ID input
             this.$stickyBar.find('input[name="product_id"]').val(data.product_id);
             
             // Update Price if possible (simplified)
             const $price = this.$stickyBar.find('.text-primary'); // Using our new class
             if ($price.length && data.price) {
                  // If we wanted to be perfect we'd format it, but updating the raw number is risky without currency symbol
                  // For now, let's assume the user sees the main price update. 
                  // Or better: don't touch the text if we can't format it perfectly.
                  // Just updating the ID is the critical part for functionality.
             }
         }
    },

    _onQtyChange(ev) {
        // Optional: Sync quantities. 
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

publicWidget.registry.TecnosoftStickyCart = StickyCart;

export default StickyCart;
