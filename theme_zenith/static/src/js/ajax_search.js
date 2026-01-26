/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import { renderToElement } from "@web/core/utils/render";

publicWidget.registry.ZenithAjaxSearch = publicWidget.Widget.extend({
    selector: '.zenith-ajax-search',
    events: {
        'input #zenith_search_input': '_onInput',
        'focusout #zenith_search_input': '_onFocusOut',
        'focusin #zenith_search_input': '_onFocusIn',
        'click .zenith-history-item': '_onSuggestionClick',
        'click .zenith-trending-item': '_onSuggestionClick',
        'click .zenith-remove-history': '_onRemoveHistory',
    },

    /**
     * @override
     */
    start() {
        this.$input = this.$('#zenith_search_input');
        this.$results = this.$('#zenith_search_results');
        this.searchTimeout = null;
        this.history = JSON.parse(localStorage.getItem('zenith_search_history') || '[]');
        this.trending = ['iPhone 13', 'Laptop Gamer', 'Ofertas', 'Auriculares', 'Smartwatch']; // Mock data
        return this._super ? this._super(...arguments) : Promise.resolve();
    },

    /**
     * @private
     */
    _onInput(ev) {
        const value = ev.target.value.trim();
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (value.length === 0) {
            this._renderSuggestions(); // Show suggestions when clear
            return;
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
            // Show Skeleton
            const skeleton = renderToElement('theme_zenith.SearchSkeleton', {});
            this.$results.empty().append(skeleton).show();

            const data = await rpc('/theme_zenith/get_products_data', {
                search: searchTerm,
                limit: 5,
            });

            const element = renderToElement('theme_zenith.AjaxSearchResults', {
                products: data.products,
                categories: data.categories || [], // Handle new category data
                searchTerm: searchTerm,
            });

            this.$results.empty().append(element).show();
            
            // Save to history if we have results
            if (data.products.length > 0) {
                this._addToHistory(searchTerm);
            }

        } catch (error) {
            console.error("Zenith Search Error:", error);
        }
    },

    /**
     * @private
     */
    _renderSuggestions() {
        if (this.$input.val().trim().length > 0) return;

        const element = renderToElement('theme_zenith.SearchSuggestions', {
            history: this.history,
            trending: this.trending,
        });
        this.$results.empty().append(element).show();
    },

    _addToHistory(term) {
        if (!term) return;
        // Remove existing to push to top
        this.history = this.history.filter(h => h.toLowerCase() !== term.toLowerCase());
        this.history.unshift(term);
        // Limit to 5
        this.history = this.history.slice(0, 5);
        localStorage.setItem('zenith_search_history', JSON.stringify(this.history));
    },

    _onRemoveHistory(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        const term = $(ev.currentTarget).closest('.zenith-history-item').data('term');
        this.history = this.history.filter(h => h !== term);
        localStorage.setItem('zenith_search_history', JSON.stringify(this.history));
        this._renderSuggestions(); // Re-render
    },

    _onSuggestionClick(ev) {
        ev.preventDefault();
        const term = $(ev.currentTarget).data('term');
        this.$input.val(term);
        this._doSearch(term);
    },

    /**
     * @private
     */
    _onFocusOut(ev) {
        // Small delay to allow clicking on results/suggestions
        setTimeout(() => {
            this.$results.hide();
        }, 300);
    },

    /**
     * @private
     */
    _onFocusIn(ev) {
        const value = this.$input.val().trim();
        if (value.length === 0) {
            this._renderSuggestions();
        } else if (value.length >= 2) {
            this.$results.show();
        }
    },
});

export default publicWidget.registry.ZenithAjaxSearch;
