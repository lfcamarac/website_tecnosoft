/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

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
            const data = await rpc('/website_tecnosoft/get_products_data', {
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
            const res = await rpc('/website_tecnosoft/bulk_add_cart', { products: products });
            if (res.success) {
                window.location.href = '/shop/cart';
            }
        } catch (e) {
            console.error(e);
            $btn.html('<i class="fa fa-shopping-cart me-2"></i> ERROR');
        }
    },

    /**
     * CSV Handling
     */
    init: function () {
        this._super.apply(this, arguments);
        // Bind manually if needed
    },

    events: Object.assign({}, publicWidget.registry.TecnosoftQuickOrder.prototype.events, {
        'change #csvUpload': '_onCSVUpload',
    }),

    _onCSVUpload: function (ev) {
        const file = ev.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            this._processCSV(text);
            ev.target.value = ''; // Reset
        };
        reader.readAsText(file);
    },

    async _processCSV(csvText) {
        const lines = csvText.split(/\r\n|\n/);
        const skuMap = {}; // SKU -> Qty

        lines.forEach(line => {
             const parts = line.split(',');
             if (parts.length >= 1) {
                 const sku = parts[0].trim();
                 let qty = 1;
                 if (parts.length >= 2) {
                     qty = parseInt(parts[1].trim()) || 1;
                 }
                 if (sku) {
                     // Aggregate quantity if duplicate SKU in CSV
                     skuMap[sku] = (skuMap[sku] || 0) + qty;
                 }
             }
        });

        const skus = Object.keys(skuMap);
        if (skus.length === 0) {
            alert("No se encontraron SKUs válidos en el archivo.");
            return;
        }

        // Fetch Product Data
        // Show loading state...
        const $btn = this.$('label[for="csvUpload"]');
        const originalText = $btn.html();
        $btn.html('<i class="fa fa-spinner fa-spin"></i> Procesando...');

        try {
            const result = await rpc('/website_tecnosoft/get_products_by_skus', { skus: skus });
            
            if (result.not_found && result.not_found.length > 0) {
                alert(`Advertencia: No se encontraron los siguientes SKUs: ${result.not_found.join(', ')}`);
            }

            if (result.products && result.products.length > 0) {
                // Clear existing empty rows if they are untouched? 
                // Let's just append for now, user can clear manually.
                
                result.products.forEach(p => {
                    const reqQty = skuMap[p.default_code];
                    this._addPopulatedRow(p, reqQty);
                });
                
                this._updateTotal();
                // Scroll to table
                $('html, body').animate({ scrollTop: $('#quick_order_table').offset().top - 100 }, 500);
            }

        } catch (e) {
            console.error("CSV Error:", e);
            alert("Error al verificar los productos. Inténtalo de nuevo.");
        } finally {
            $btn.html(originalText);
        }
    },

    _addPopulatedRow(product, qty) {
        // Find existing empty row to reuse
        let $row = this.$rowsContainer.find('.quick-order-row').filter(function() {
             return !$(this).data('product-id') && $(this).find('.js_quick_search').val() === '';
        }).first();

        if (!$row.length) {
            const $template = this.$rowsContainer.find('.quick-order-row:first').clone();
            $template.find('.js_remove_row').removeClass('disabled');
            this.$rowsContainer.append($template);
            $row = $template;
        }

        $row.find('.js_quick_search').val(product.name);
        $row.find('td:nth-child(2)').text(product.stock_msg).removeClass('text-muted').addClass('text-success');
        $row.find('td:nth-child(3)').html(`<span class="quick-unit-price" data-val="${product.price}">${product.price_formatted}</span>`);
        $row.find('.js_quick_qty').val(qty);
        $row.data('product-id', product.id);
    }
});

export default publicWidget.registry.TecnosoftQuickOrder;
