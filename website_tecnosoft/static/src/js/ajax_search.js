/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import { renderToElement } from "@web/core/utils/render";

publicWidget.registry.TecnosoftAjaxSearch = publicWidget.Widget.extend({
    selector: '.tecnosoft-ajax-search',
    events: {
        'input #tecnosoft_search_input': '_onInput',
        'focusout #tecnosoft_search_input': '_onFocusOut',
        'focusin #tecnosoft_search_input': '_onFocusIn',
    },

    /**
     * @override
     */
    start() {
        this.$input = this.$('#tecnosoft_search_input');
        this.$results = this.$('#tecnosoft_search_results');
        this.searchTimeout = null;
        return this._super.apply(this, arguments);
    },

    /**
     * @private
     */
    _onInput(ev) {
        const value = ev.target.value.trim();
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (value.length < 2) {
            this.$results.hide();
            return;
        }

        this.searchTimeout = setTimeout(() => {
            this._doSearch(value);
        }, 300);
    },

    /**
     * @private
     */
    async _doSearch(searchTerm) {
        try {
            const data = await rpc('/website_tecnosoft/get_products_data', {
                search: searchTerm,
                limit: 5,
            });

            const element = renderToElement('website_tecnosoft.AjaxSearchResults', {
                products: data.products,
                searchTerm: searchTerm,
            });

            this.$results.empty().append(element).show();
        } catch (error) {
            console.error("Tecnosoft Search Error:", error);
        }
    },

    /**
     * @private
     */
    _onFocusOut(ev) {
        // Small delay to allow clicking on results
        setTimeout(() => {
            this.$results.hide();
        }, 200);
    },

    /**
     * @private
     */
    _onFocusIn(ev) {
        if (this.$input.val().trim().length >= 2) {
            this.$results.show();
        }
    },
});

export default publicWidget.registry.TecnosoftAjaxSearch;
