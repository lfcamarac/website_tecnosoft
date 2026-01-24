/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc_service";
import Widget from "@web/legacy/js/core/widget";
import { rpc } from "@web/core/network/rpc_service";
import Widget from "@web/legacy/js/core/widget";
import { renderToElement } from "@web/core/utils/render";
// We might need to listen to the website_sale generic events or extend the widget.
// A looser coupling is better for compatibility.

publicWidget.registry.TecnosoftCartUpsell = Widget.extend({
    selector: '#wrapwrap',
    events: {
        // We catch the event triggered by standard Odoo JS
        // Odoo 16/17/18 triggers 'website_sale:cart_updated' or we can listen to the button click if we want to intercept BEFORE.
        // But 'upsell' usually happens AFTER success.
        // 'product_added_to_cart' is a common event name in some themes, but default Odoo uses 'website_sale.cart_quantity'.
    },

    /**
     * @override
     */
    start: function () {
        // We will intercept the custom event dispatched by our own override or Odoo's native 'add_to_cart_animation'.
        // To be safe and non-intrusive, we'll listen to the specific button click if the option is enabled.
        this.$el.on('click', '.a-submit, .js_check_product', this._onAddToCartClick.bind(this));
        return this._super.apply(this, arguments);
    },

    /**
     * Note: This is a simplified approach. 
     * In a full implementation, we would extend 'website_sale.website_sale' and override '_submitForm'.
     * Here we just emulate the "Upsell" trigger for demo purposes or rely on backend config.
     */
    _onAddToCartClick: async function (ev) {
        // We check if this is a product add.
        // To avoid conflict with Odoo's native behavior (which might redirect), 
        // we ideally wait for the successful return of the cart update.
        
        // Use a slight delay to mock the "After Add" behavior for this demo,
        // OR better: Listen to the toast event?
        
        // For this implementation, we will assume the user clicks "Add to Cart" and we show the modal 
        // IF the settings allow it.
        
        // In a real scenario, we'd hook into the JSON response of /shop/cart/update.
        // Let's assume we want to show it.
        
        /* 
           TODO: Connect to real backend "Alternative Products".
           For now, we fetch 'related' products via RPC based on the product ID in the form.
        */
        const $form = $(ev.currentTarget).closest('form');
        const productId = $form.find('input[name="product_id"]').val();
        
        if (productId) {
            // We delay slightly to let Odoo process the cart addition (if async)
            // or we run in parallel.
            this._fetchUpsellProducts(productId);
        }
    },

    _fetchUpsellProducts: async function (productId) {
        try {
            // Fetch related products (Accessories or Alternatives)
            const result = await rpc('/website_tecnosoft/get_upsell_products', {
                product_id: parseInt(productId)
            });

            if (result && result.products && result.products.length > 0) {
                this._openUpsellModal(result.products);
            }
        } catch (e) {
            console.error("Tecnosoft Upsell error:", e);
        }
    },

    _openUpsellModal: function (relatedProducts) {
        // Remove existing modal if any
        $('#tecnosoft_cart_upsell').remove();
        
        // Simple client-side rendering for the modal to avoid extra XML templates if not present
        // In clean architecture, we should use a QWeb template. 
        // For now, we construct the HTML here or use a simplified generic modal structure.
        
        let productsHtml = '';
        relatedProducts.forEach(p => {
             productsHtml += `
             <div class="col-6 col-md-4 mb-3">
                 <div class="card h-100 border-0 shadow-sm">
                     <div class="position-relative overflow-hidden rounded-top">
                        <img src="${p.image_url}" class="card-img-top" style="height: 150px; object-fit: contain;">
                     </div>
                     <div class="card-body p-2 text-center">
                         <h6 class="card-title text-truncate small mb-1" title="${p.name}">${p.name}</h6>
                         <div class="text-primary fw-bold mb-2">${p.price}</div>
                         <form action="/shop/cart/update" method="POST">
                             <input type="hidden" name="csrf_token" value="${odoo.csrf_token}"/>
                             <input type="hidden" name="product_id" value="${p.variant_id}"/>
                             <input type="hidden" name="add_qty" value="1"/>
                             <button type="button" class="btn btn-sm btn-outline-primary w-100 rounded-pill js_add_cart_upsell">
                                <i class="fa fa-plus"></i> Add
                             </button>
                         </form>
                     </div>
                 </div>
             </div>`;
        });

        const modalHtml = `
        <div class="modal fade" id="tecnosoft_cart_upsell" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content rounded-4 border-0 shadow-lg">
              <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold">También te podría interesar...</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body pt-2">
                <div class="row">
                    ${productsHtml}
                </div>
              </div>
              <div class="modal-footer border-0">
                 <button type="button" class="btn btn-light rounded-pill" data-bs-dismiss="modal">No, gracias</button>
                 <a href="/shop/cart" class="btn btn-primary rounded-pill px-4">Ir al Carrito</a>
              </div>
            </div>
          </div>
        </div>`;

        $('body').append(modalHtml);
        const modalEl = document.getElementById('tecnosoft_cart_upsell');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        
        // Bind simplistic add to cart for these items
        $(modalEl).find('.js_add_cart_upsell').on('click', async (ev) => {
            const $form = $(ev.currentTarget).closest('form');
            await rpc('/shop/cart/update', {
                product_id: parseInt($form.find('input[name="product_id"]').val()),
                add_qty: 1
            });
            // Show success or change button state
            $(ev.currentTarget).replaceWith('<span class="text-success small fw-bold"><i class="fa fa-check"></i> Added</span>');
        });
    }
});
