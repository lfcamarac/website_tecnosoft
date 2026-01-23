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

        // Show Skeleton before fetch
        const $gridContainer = this.$('#products_grid');
        const $pager = this.$('.products_pager');
        
        $gridContainer.css('opacity', '0.5');
        
        // Define a simple grid skeleton if we don't want to rely on XML for this specific dynamic injection
        const skeletonHtml = `
            <div id="tecnosoft_grid_skeleton" class="row">
                ${Array(8).fill(`
                    <div class="col-6 col-md-4 col-lg-3 mb-4">
                        <div class="tecnosoft-skeleton rounded-3 mb-2" style="height: 250px; width: 100%;"></div>
                        <div class="tecnosoft-skeleton skeleton-text" style="width: 70%;"></div>
                        <div class="tecnosoft-skeleton skeleton-text-sm" style="width: 40%;"></div>
                    </div>
                `).join('')}
            </div>
        `;

        try {
            // Pre-loading state
            $gridContainer.parent().append(skeletonHtml);
            $gridContainer.addClass('d-none');
            $pager.addClass('d-none');

            const response = await fetch(newUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const text = await response.text();
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(text, 'text/html');

            const newGrid = htmlDoc.querySelector('#products_grid');
            const newSidebar = htmlDoc.querySelector('#products_grid_before');
            const newPager = htmlDoc.querySelector('.products_pager');

            if (newGrid) {
                this.$('#products_grid').replaceWith(newGrid);
            }
            if (newSidebar) {
                const $currSidebar = this.$('#products_grid_before');
                if ($currSidebar.length) {
                     $currSidebar.replaceWith(newSidebar);
                }
            }
            if (newPager) {
                this.$('.products_pager').replaceWith(newPager);
            }

            // Smooth scroll to top
            $('html, body').animate({
                scrollTop: $("#products_grid_before").offset().top - 100
            }, 500);

            $(window).trigger('resize'); 
            
        } catch (error) {
            console.error("Tecnosoft AJAX Filter Error:", error);
            window.location.href = newUrl; // Fallback
        } finally {
            $('#tecnosoft_grid_skeleton').remove();
            this.$('#products_grid').removeClass('d-none').css('opacity', '1');
            this.$('.products_pager').removeClass('d-none');
        }
    },
});

export default publicWidget.registry.TecnosoftAjaxFilters;
