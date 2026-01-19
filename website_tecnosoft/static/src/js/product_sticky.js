/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.TecnosoftStickyCart = publicWidget.Widget.extend({
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
                    this.$stickyBar.removeClass('transform-translate-y-100').addClass('visible');
                    $('body').addClass('has-sticky-cart');
                } else {
                    this.$stickyBar.addClass('transform-translate-y-100').removeClass('visible');
                    $('body').removeClass('has-sticky-cart');
                }
            });
        }, options);

        this.observer.observe(this.$mainBtn[0]);
    },
    
    /**
     * Sync quantity from main form to sticky form and vice-versa if needed.
     * For now, simpler to just let them be independent or sync sticky -> main.
     */
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
