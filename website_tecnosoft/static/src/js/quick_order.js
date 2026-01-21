/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.TecnosoftQuickOrder = publicWidget.Widget.extend({
    selector: '.tecnosoft-quick-order-page',
    events: {
        'keyup .js_quick_search': '_onQuickSearch',
        'click .js_quick_result': '_onSelectProduct',
        'click #js_add_quick_row': '_onAddRow',
        'click .js_remove_row': '_onRemoveRow',
        'click .js_bulk_add_cart': '_onBulkAddToCart',
        'change .js_quick_qty': '_updateTotal',
    },

    /**
     * @override
     */
    start() {
        this.$rowsContainer = this.$('#quick_order_rows');
        this.$totalDisplay = this.$('#quick_order_total_display');
        return this._super.apply(this, arguments);
    },

    /**
     * @private
     */
    async _onQuickSearch(ev) {
        const $input = $(ev.currentTarget);
        const query = $input.val().trim();
        const $results = $input.siblings('.quick-search-results');

        if (query.length < 2) {
            $results.addClass('d-none');
            return;
        }

        try {
            // Reusing existing search logic but for dropdown
            const data = await this.rpc('/website_tecnosoft/get_products_data', {
                search: query,
                limit: 5
            });

            if (data && data.products && data.products.length > 0) {
                let html = '';
                data.products.forEach(p => {
                    html += `
                        <div class="js_quick_result p-3 border-bottom d-flex align-items-center gap-3 cursor-pointer" 
                             data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-currency="${p.currency_symbol || '€'}" 
                             data-stock="${p.stock || 'En Stock'}">
                            <img src="${p.image_url}" style="width: 40px; height: 40px; object-fit: contain;"/>
                            <div>
                                <div class="fw-bold small">${p.name}</div>
                                <div class="text-primary small">${p.price_formatted}</div>
                            </div>
                        </div>
                    `;
                });
                $results.html(html).removeClass('d-none');
            } else {
                $results.html('<div class="p-3 text-muted small text-center">No se encontraron productos.</div>').removeClass('d-none');
            }
        } catch (e) {
            console.error(e);
        }
    },

    /**
     * @private
     */
    _onSelectProduct(ev) {
        const $res = $(ev.currentTarget);
        const $row = $res.closest('.quick-order-row');
        const data = $res.data();

        $row.find('.js_quick_search').val(data.name);
        $row.find('td:nth-child(2)').text(data.stock).removeClass('text-muted').addClass('text-success');
        $row.find('td:nth-child(3)').html(`<span class="quick-unit-price" data-val="${data.price}">${data.price_formatted || (data.price + ' ' + data.currency)}</span>`);
        $row.data('product-id', data.id);
        
        $res.parent().addClass('d-none');
        this._updateTotal();
    },

    /**
     * @private
     */
    _onAddRow() {
        const $newRow = this.$rowsContainer.find('.quick-order-row:first').clone();
        $newRow.find('input').val('');
        $newRow.find('.js_quick_qty').val(1);
        $newRow.find('td:nth-child(2)').text('--').addClass('text-muted');
        $newRow.find('td:nth-child(3)').text('--');
        $newRow.find('.js_remove_row').removeClass('disabled');
        $newRow.find('.quick-search-results').addClass('d-none');
        $newRow.removeData('product-id');
        this.$rowsContainer.append($newRow);
    },

    /**
     * @private
     */
    _onRemoveRow(ev) {
        $(ev.currentTarget).closest('.quick-order-row').remove();
        this._updateTotal();
    },

    /**
     * @private
     */
    _updateTotal() {
        let total = 0;
        this.$('.quick-order-row').each(function() {
            const price = $(this).find('.quick-unit-price').data('val') || 0;
            const qty = $(this).find('.js_quick_qty').val() || 0;
            total += (price * qty);
        });
        // Simple formatting (ideally use Odoo's monetary widgets)
        this.$totalDisplay.text(new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(total) + ' €');
    },

    /**
     * @private
     */
    async _onBulkAddToCart(ev) {
        const $btn = $(ev.currentTarget);
        const products = [];
        
        this.$('.quick-order-row').each(function() {
            const prodId = $(this).data('product-id');
            const qty = $(this).find('.js_quick_qty').val();
            if (prodId && qty > 0) {
                products.push({ 'product_id': prodId, 'qty': qty });
            }
        });

        if (products.length === 0) {
            alert("No has seleccionado ningún producto válido.");
            return;
        }

        $btn.html('<i class="fa fa-circle-o-notch fa-spin me-2"></i> AÑADIENDO...');
        
        try {
            const res = await this.rpc('/website_tecnosoft/bulk_add_cart', { products: products });
            if (res.success) {
                window.location.href = '/shop/cart';
            }
        } catch (e) {
            console.error(e);
            $btn.html('<i class="fa fa-shopping-cart me-2"></i> ERROR');
        }
    }
});

export default publicWidget.registry.TecnosoftQuickOrder;
