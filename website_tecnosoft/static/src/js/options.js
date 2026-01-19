/** @odoo-module **/

import options from "@web_editor/js/editor/snippets.options";

const tecnosoft_dynamic_options = options.Class.extend({
    /**
     * @override
     */
    start() {
        this._super.apply(this, arguments);
        this.uiConfig = this._getUIConfig();
    },

    //--------------------------------------------------------------------------
    // Options
    //--------------------------------------------------------------------------

    /**
     * @param {string} value
     */
    setLimit(value) {
        this.uiConfig.limit = parseInt(value);
        this._updateUIConfig();
    },

    /**
     * @param {string} value
     */
    setMode(value) {
        this.uiConfig.mode = value;
        this._updateUIConfig();
    },

    setAutoplay(value) {
        this.uiConfig.autoplay = value;
        this._updateUIConfig();
    },

    setArrows(value) {
        this.uiConfig.arrows = value;
        this._updateUIConfig();
    },

    setTabCategoryIds(value) {
        this.uiConfig.tab_category_ids = value;
        this._updateUIConfig();
    },

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * @private
     */
    _getUIConfig() {
        const configStr = this.$target[0].dataset.uiConfig || '{}';
        try {
            return JSON.parse(configStr);
        } catch (e) {
            return { limit: 4, mode: 'grid' };
        }
    },

    /**
     * @private
     */
    _updateUIConfig() {
        this.$target[0].dataset.uiConfig = JSON.stringify(this.uiConfig);
        // Trigger re-render of the public widget if needed
        this.$target.trigger('content_changed');
    },

    /**
     * @override
     */
    _computeWidgetState(methodName, params) {
        const config = this._getUIConfig();
        if (methodName === 'setLimit') {
            return config.limit || 4;
        }
        if (methodName === 'setMode') {
            return config.mode || 'grid';
        }
        if (methodName === 'setAutoplay') {
            return !!config.autoplay;
        }
        if (methodName === 'setArrows') {
            return !!config.arrows;
        }
        if (methodName === 'setTabCategoryIds') {
            return config.tab_category_ids || '';
        }
        return this._super(...arguments);
    },
});
