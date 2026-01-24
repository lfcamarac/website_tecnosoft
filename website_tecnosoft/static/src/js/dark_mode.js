/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { session } from "@web/session";

publicWidget.registry.TecnosoftDarkMode = publicWidget.Widget.extend({
    selector: 'body', // Bind to body to find toggle anywhere (toggle is outside #wrapwrap)
    events: {
        'click .tecnosoft-dark-mode-toggle': '_onToggleClick',
    },

    /**
     * @override
     */
    start: function () {
        this._super.apply(this, arguments);
        this._applyTheme();
    },

    /**
     * Toggles dark mode state and saves to localStorage
     * @private
     */
    _onToggleClick: function (ev) {
        ev.preventDefault();
        const isDark = document.body.classList.contains('o_dark_mode');
        this._setDarkMode(!isDark);
    },

    /**
     * Applies the class and saves preference
     * @param {Boolean} enable
     * @private
     */
    _setDarkMode: function (enable) {
        if (enable) {
            document.body.classList.add('o_dark_mode');
            localStorage.setItem('tecnosoft_dark_mode', 'true');
        } else {
            document.body.classList.remove('o_dark_mode');
            localStorage.setItem('tecnosoft_dark_mode', 'false');
        }
        this._updateIcons(enable);
    },

    /**
     * Initial check on widget start
     * @private
     */
    _applyTheme: function () {
        // Check localStorage first, then system preference
        const stored = localStorage.getItem('tecnosoft_dark_mode');
        if (stored === 'true') {
            this._setDarkMode(true);
        } else if (stored === 'false') {
            this._setDarkMode(false);
        } else {
            // Optional: Check system preference
            // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            //    this._setDarkMode(true);
            // }
        }
    },

    /**
     * Updates toggle button icons
     * @param {Boolean} isDark
     */
    _updateIcons: function (isDark) {
        const $icons = $('.tecnosoft-dark-mode-toggle i');
        if (isDark) {
            $icons.removeClass('fa-moon-o').addClass('fa-sun-o');
        } else {
            $icons.removeClass('fa-sun-o').addClass('fa-moon-o');
        }
    }
});
