/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import { renderToElement } from "@web/core/utils/render";

publicWidget.registry.TecnosoftDynamicSnippet = publicWidget.Widget.extend({
    selector: '.s_tecnosoft_dynamic',

    /**
     * @override
     */
    async start() {
        const container = this.el.querySelector('.tecnosoft_dynamic_container');
        if (!container) return;

        const limit = container.dataset.limit || 4;

        try {
            const products = await rpc('/website_tecnosoft/get_dynamic_products', {
                limit: parseInt(limit),
            });

            if (products && products.length > 0) {
                const element = renderToElement('website_tecnosoft.DynamicProductList', {
                    products: products,
                });
                container.innerHTML = '';
                container.appendChild(element);
            } else {
                container.innerHTML = '<div class="col-12 text-muted">No se encontraron productos.</div>';
            }
        } catch (error) {
            console.error("Tecnosoft Snippet Error:", error);
            container.innerHTML = '<div class="col-12 text-danger">Error al cargar productos.</div>';
        }

        return this._super.apply(this, arguments);
    },
});
