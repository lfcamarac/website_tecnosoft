/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.TecnosoftQuickView = publicWidget.Widget.extend({
    selector: '.tecnosoft-product-card',
    events: {
        'click .o_quick_view': '_onQuickViewClick',
    },

    /**
     * @private
     * @param {Event} ev
     */
    async _onQuickViewClick(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        const btn = $(ev.currentTarget);
        const productId = btn.data('product-id');
        
        if (!productId) return;

        // Show loading state
        btn.addClass('disabled').find('i').removeClass('fa-eye').addClass('fa-spinner fa-spin');

        try {
            // Fetch modal content
            // We use jQuery ajax because the route returns HTML, not JSON
            const modalContent = await $.get('/website_tecnosoft/quick_view', {
                product_id: productId
            });

            // Remove existing modal if any
            $('#tecnosoft_quick_view_modal').remove();

            // Append new modal to body
            const $modal = $(`<div class="modal fade" id="tecnosoft_quick_view_modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content border-0 bg-transparent shadow-none">
                        ${modalContent}
                    </div>
                </div>
            </div>`);

            $('body').append($modal);

            // Initialize bootstrap modal
            const modalInstance = new window.bootstrap.Modal(document.getElementById('tecnosoft_quick_view_modal'));
            modalInstance.show();
            
            // Re-bind Odoo events (like add to cart) inside the modal
            // We trigger 'content_changed' so other widgets (like wSaleUtils) can attach to the new content
            this.trigger_up('widgets_start_request', {
                $target: $modal.find('.modal-content'),
            });

        } catch (e) {
            console.error("Quick View Error:", e);
        } finally {
            // Reset button state
            btn.removeClass('disabled').find('i').removeClass('fa-spinner fa-spin').addClass('fa-eye');
        }
    },
});
