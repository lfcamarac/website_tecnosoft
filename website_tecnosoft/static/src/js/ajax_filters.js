/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

/**
 * Tecnosoft AJAX Filters
 * Intercepts category and attribute selection to update results without page reload.
 */
publicWidget.registry.TecnosoftAjaxFilters = publicWidget.Widget.extend({
    selector: '.oe_website_sale',
    events: {
        'change .js_attributes input, .js_attributes select': '_onFilterChange',
        'click .js_attributes .nav-link, .js_attributes .js_attribute_value': '_onFilterChange',
        'change select[name="order"]': '_onFilterChange',
        'click .oe_search_button': '_onSearchSubmit',
        'click .tecnosoft-mobile-filter-toggle': '_onMobileToggle',
        'click .tecnosoft-shop-sidebar-overlay': '_onMobileToggle',
    },

    /**
     * @override
     */
    start() {
        this.$grid = this.$('#products_grid');
        this.$sidebar = this.$('.tecnosoft-shop-sidebar');
        this.$overlay = this.$('.tecnosoft-shop-sidebar-overlay');
        return this._super.apply(this, arguments);
    },

    /**
     * @private
     */
    _onMobileToggle(ev) {
        this.$sidebar.toggleClass('open');
        this.$overlay.toggleClass('open');
    },

    /**
     * @private
     */
    _onFilterChange(ev) {
        // Categories links
        if (ev.currentTarget.tagName === 'A' && !ev.currentTarget.classList.contains('js_attribute_value')) {
            // Keep default behavior for now if it's a hard category link, 
            // OR we can AJAX it too.
        }
        
        this._updateResults();
    },

    /**
     * @private
     */
    _onSearchSubmit(ev) {
        ev.preventDefault();
        this._updateResults();
    },

    /**
     * @private
     */
    async _updateResults() {
        const $form = this.$('form.js_attributes');
        if (!$form.length) return;

        const formData = new FormData($form[0]);
        const searchParams = new URLSearchParams(formData);
        
        // Add order if present
        const order = this.$('select[name="order"]').val();
        if (order) searchParams.set('order', order);

        // Add search term if present
        const search = this.$('input[name="search"]').val();
        if (search) searchParams.set('search', search);

        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        
        // Update URL bar
        window.history.pushState({ path: newUrl }, '', newUrl);

        // Visual feedback & Scroll (UX)
        const $gridContainer = this.$('#products_grid');
        $gridContainer.css('opacity', '0.5');
        // Inject loader
        if (!this.$('.ajax-loading-overlay').length) {
             $gridContainer.prepend('<div class="ajax-loading-overlay position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="z-index:10; background: rgba(255,255,255,0.5);"><div class="spinner-border text-primary" role="status"></div></div>');
        }
        
        // Smooth scroll to top of products
        $('html, body').animate({
            scrollTop: $("#products_grid_before").offset().top - 100
        }, 500);

        try {
            const response = await fetch(newUrl);
            const text = await response.text();
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(text, 'text/html');

            const newGrid = htmlDoc.querySelector('#products_grid');
            const newSidebar = htmlDoc.querySelector('#products_grid_before'); // Filters sidebar
            const newPager = htmlDoc.querySelector('.products_pager');

            if (newGrid) {
                this.$('#products_grid').replaceWith(newGrid);
            }
            if (newSidebar) {
                // If sidebar exists (desktop) or mobile drawer content
                const $currSidebar = this.$('#products_grid_before');
                if ($currSidebar.length) {
                     $currSidebar.replaceWith(newSidebar);
                } else {
                    // Mobile drawer content update might be needed if it's separate
                }
            }
            if (newPager) {
                this.$('.products_pager').replaceWith(newPager);
            }

            // Re-initialize widgets (lazy loading images, animations)
            // Odoo public widgets usually re-scan, but explicit trigger helps
            $(window).trigger('resize'); 
            
        } catch (error) {
            console.error("Tecnosoft AJAX Filter Error:", error);
            window.location.href = newUrl; // Fallback to hard reload
        } finally {
            this.$('#products_grid').css('opacity', '1');
            this.$('.ajax-loading-overlay').remove();
        }
    },
});

export default publicWidget.registry.TecnosoftAjaxFilters;
