/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.ZenithQuickView = publicWidget.Widget.extend({
    selector: '.zenith-product-card',
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
            const modalContent = await $.get('/theme_zenith/quick_view', {
                product_id: productId
            });

            // Remove existing modal if any
            $('#zenith_quick_view_modal').remove();

            // Append new modal to body
            const $modal = $(`<div class="modal fade" id="zenith_quick_view_modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content border-0 bg-transparent shadow-none">
                        ${modalContent}
                    </div>
                </div>
            </div>`);

            $('body').append($modal);

            // 2025: Fix for Odoo 17/18 where bootstrap global might be different
            let Modal = window.bootstrap ? window.bootstrap.Modal : undefined;
            if (!Modal && $.fn.modal && $.fn.modal.Constructor) {
                 Modal = $.fn.modal.Constructor;
            }

            if (Modal) {
                 const modalInstance = new Modal(document.getElementById('zenith_quick_view_modal'));
                 modalInstance.show();
            } else {
                 // Fallback for older Odoo versions or missing assets
                 $('#zenith_quick_view_modal').modal('show');
            }
            
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
