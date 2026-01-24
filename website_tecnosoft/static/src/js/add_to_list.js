/** @odoo-module **/
/**
 * Shopping List - Add to List Button Functionality
 * Allows users to add products to their shopping lists from product cards
 */

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.AddToListButton = publicWidget.Widget.extend({
    selector: '.o_wsale_product_grid_wrapper, #product_detail',
    events: {
        'click .js_add_to_list_btn': '_onAddToListClick',
        'click .js_add_to_list_item': '_onListItemClick',
    },

    /**
     * Fetch user's lists and populate dropdown
     */
    _onAddToListClick: async function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        
        const $btn = $(ev.currentTarget);
        const $dropdown = $btn.siblings('.js_list_dropdown');
        const $listContainer = $dropdown.find('.js_list_items');
        
        // Show loading
        $listContainer.html('<div class="text-center p-3"><i class="fa fa-spinner fa-spin"></i></div>');
        
        try {
            const lists = await rpc('/my/lists/get-user-lists', {});
            
            if (lists.length === 0) {
                $listContainer.html(`
                    <div class="text-center p-3">
                        <p class="text-muted mb-2 small">No tienes listas</p>
                        <a href="/my/lists" class="btn btn-sm btn-primary rounded-pill">Crear Lista</a>
                    </div>
                `);
            } else {
                let html = '';
                lists.forEach(list => {
                    html += `
                        <a href="#" class="dropdown-item py-2 js_add_to_list_item" 
                           data-list-id="${list.id}">
                            <i class="fa ${list.icon} me-2 text-primary"></i>
                            ${list.name}
                            <span class="badge bg-light text-dark ms-auto">${list.product_count}</span>
                        </a>
                    `;
                });
                html += '<div class="dropdown-divider"></div>';
                html += '<a href="/my/lists" class="dropdown-item py-2 text-primary"><i class="fa fa-plus me-2"></i>Nueva Lista</a>';
                $listContainer.html(html);
            }
        } catch (error) {
            $listContainer.html(`
                <div class="text-center p-3">
                    <p class="text-muted small">Inicia sesión para usar listas</p>
                    <a href="/web/login" class="btn btn-sm btn-primary rounded-pill">Iniciar Sesión</a>
                </div>
            `);
        }
    },

    /**
     * Add product to selected list
     */
    _onListItemClick: async function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        
        const $item = $(ev.currentTarget);
        const listId = $item.data('list-id');
        
        if (!listId) return;
        
        // Get product ID from the card/page
        const $card = $item.closest('form, .o_wsale_product_grid_wrapper');
        let productId = $card.find('input[name="product_id"]').val() 
                       || $card.find('[data-product-id]').data('product-id')
                       || $card.find('.a-submit').data('product-id');
        
        if (!productId) {
            // Try to get from product detail page
            productId = $('input[name="product_id"]').val();
        }
        
        if (!productId) {
            console.error('No product ID found');
            return;
        }
        
        // Show adding indicator
        const originalHtml = $item.html();
        $item.html('<i class="fa fa-spinner fa-spin me-2"></i> Agregando...');
        
        try {
            const result = await rpc(`/my/lists/${listId}/add-product`, {
                product_id: parseInt(productId),
                quantity: 1,
            });
            
            if (result.success) {
                $item.html('<i class="fa fa-check text-success me-2"></i> ¡Agregado!');
                setTimeout(() => {
                    $item.html(originalHtml);
                    // Update badge count
                    const $badge = $item.find('.badge');
                    if ($badge.length) {
                        $badge.text(parseInt($badge.text()) + 1);
                    }
                    // Close dropdown
                    $item.closest('.dropdown').find('[data-bs-toggle="dropdown"]').dropdown('hide');
                }, 1000);
            } else {
                $item.html(`<i class="fa fa-times text-danger me-2"></i> ${result.error || 'Error'}`);
                setTimeout(() => $item.html(originalHtml), 2000);
            }
        } catch (error) {
            $item.html('<i class="fa fa-times text-danger me-2"></i> Error');
            setTimeout(() => $item.html(originalHtml), 2000);
        }
    },
});

export default publicWidget.registry.AddToListButton;
