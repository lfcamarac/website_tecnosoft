/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.TecnosoftInfiniteScroll = publicWidget.Widget.extend({
    selector: '.tecnosoft-products-grid',
    
    /**
     * @override
     */
    start() {
        this.$pagination = $('.products_pager:first');
        if (this.$pagination.length) {
            this._initInfiniteScroll();
        }
        return this._super ? this._super(...arguments) : Promise.resolve();
    },

    /**
     * @private
     */
    _initInfiniteScroll() {
        // Hide standard pagination
        this.$pagination.addClass('d-none');
        
        // Add "Load More" Button
        this.$loadMoreWrapper = $('<div class="tecnosoft-load-more-wrapper text-center my-5 w-100"></div>');
        this.$loadMoreBtn = $('<button class="btn btn-outline-primary btn-lg rounded-pill px-5 fw-bold btn-load-more">CARGAR MÁS PRODUCTOS</button>');
        this.$loadMoreWrapper.append(this.$loadMoreBtn);
        this.$target.after(this.$loadMoreWrapper);

        this.$loadMoreBtn.on('click', (ev) => this._loadNextPage(ev));
        
        // Optional: Auto-load on scroll for mobile
        $(window).on('scroll.tecnosoft_infinite', () => {
            if (this._isNearBottom() && !this.loading) {
                this.$loadMoreBtn.click();
            }
        });
    },

    /**
     * @private
     */
    _isNearBottom() {
        const threshold = 300;
        return ($(window).scrollTop() + $(window).height() > $(document).height() - threshold);
    },

    /**
     * @private
     */
    async _loadNextPage(ev) {
        if (this.loading) return;
        
        const $nextPageLink = this.$pagination.find('ul.pagination li.active + li a');
        if (!$nextPageLink.length) {
            this.$loadMoreWrapper.fadeOut();
            return;
        }

        const url = $nextPageLink.attr('href');
        this.loading = true;
        this.$loadMoreBtn.html('<i class="fa fa-circle-o-notch fa-spin me-2"></i> CARGANDO...');

        try {
            const response = await $.get(url);
            const $newProducts = $(response).find('.tecnosoft-products-grid .oe_product');
            const $newPagination = $(response).find('.products_pager:first');

            if ($newProducts.length) {
                this.$target.find('#products_grid_before').after($newProducts);
                this.$pagination.html($newPagination.html());
                
                // Re-trigger animations if any
                this.trigger_up('widgets_start_request', {
                    $target: $newProducts,
                });
            }

            if (!this.$pagination.find('ul.pagination li.active + li a').length) {
                this.$loadMoreWrapper.fadeOut();
            }

        } catch (e) {
            console.error("Error loading next page", e);
        } finally {
            this.loading = false;
            this.$loadMoreBtn.html('CARGAR MÁS PRODUCTOS');
        }
    },
});

export default publicWidget.registry.TecnosoftInfiniteScroll;
