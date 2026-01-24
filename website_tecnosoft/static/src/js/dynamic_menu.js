/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import { renderToElement } from "@web/core/utils/render";

publicWidget.registry.DynamicMegaMenu = publicWidget.Widget.extend({
    selector: '.s_tecnosoft_mega_menu_dynamic',
    
    /**
     * @override
     */
    start: async function () {
        this.$content = this.$('.dynamic_menu_content');
        if (this.$content.length) {
            await this._fetchAndRender();
        }
        return this._super.apply(this, arguments);
    },

    /**
     * @private
     */
    _fetchAndRender: async function () {
        try {
            // Fetch top-level categories and their children
            const data = await rpc('/website_tecnosoft/get_category_tree', {
                limit: 6 // Limit top level cols
            });

            if (data && data.categories) {
                const $rendered = $(renderToElement('website_tecnosoft.DynamicMegaMenuTemplate', {
                    categories: data.categories
                }));
                this.$content.empty().append($rendered);
            } else {
                this.$content.html('<p class="text-white">No categories found.</p>');
            }
        } catch (e) {
            console.error("Mega Menu Fetch Error", e);
            this.$content.html('<p class="text-white small">Menu currently unavailable.</p>');
        }
    },
});
