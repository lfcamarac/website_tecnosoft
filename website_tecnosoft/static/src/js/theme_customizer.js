/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.TecnosoftThemeCustomizer = publicWidget.Widget.extend({
    selector: '#tecnosoft_customizer',
    events: {
        'click .customizer-toggle': '_togglePanel',
        'click .close-customizer': '_closePanel',
        'click .color-btn': '_onColorChange',
        'click .btn-font': '_onFontChange',
        'change #darkModeSwitch': '_onDarkModeChange',
        'click .js_reset_theme': '_onReset',
    },

    start: function () {
        this.$panel = this.$el;
        this._loadPreferences();
        return this._super.apply(this, arguments);
    },

    _togglePanel: function () {
        this.$panel.toggleClass('closed');
    },

    _closePanel: function () {
        this.$panel.addClass('closed');
    },

    _onColorChange: function (ev) {
        const $btn = $(ev.currentTarget);
        const color = $btn.data('color');
        
        // Active State
        this.$('.color-btn').removeClass('active');
        $btn.addClass('active');

        // Apply CSS Variable
        document.documentElement.style.setProperty('--o-color-primary', color);
        // Also simple variant mainly for buttons if they use BS vars directly
        // Note: Odoo uses SCSS compilation for many things, but we can override CSS vars for a "preview"
        // Force critical elements
        const styleId = 'tecnosoft-custom-color-override';
        let $style = $('#' + styleId);
        if (!$style.length) {
            $style = $('<style id="'+styleId+'"></style>');
            $('head').append($style);
        }
        $style.html(`
            :root { --o-color-primary: ${color}; }
            .text-primary { color: ${color} !important; }
            .bg-primary { background-color: ${color} !important; }
            .btn-primary { background-color: ${color} !important; border-color: ${color} !important; }
            .btn-outline-primary { color: ${color} !important; border-color: ${color} !important; }
            .btn-outline-primary:hover { background-color: ${color} !important; color: #fff !important; }
        `);
        
        localStorage.setItem('tecnosoft_primary_color', color);
    },

    _onFontChange: function (ev) {
        const $btn = $(ev.currentTarget);
        const font = $btn.data('font');

        this.$('.btn-font').removeClass('active');
        $btn.addClass('active');

        document.body.style.fontFamily = font;
        localStorage.setItem('tecnosoft_font_family', font);
    },
    
    _onDarkModeChange: function (ev) {
        // Simple dark mode shim for demo
        const isDark = $(ev.currentTarget).is(':checked');
        if (isDark) {
            document.body.classList.add('bg-dark', 'text-white');
             // More comprehensive logic would be needed for a real dark mode
        } else {
             document.body.classList.remove('bg-dark', 'text-white');
        }
         localStorage.setItem('tecnosoft_dark_mode', isDark);
    },

    _onReset: function () {
        localStorage.removeItem('tecnosoft_primary_color');
        localStorage.removeItem('tecnosoft_font_family');
        localStorage.removeItem('tecnosoft_dark_mode');
        window.location.reload();
    },

    _loadPreferences: function () {
        const color = localStorage.getItem('tecnosoft_primary_color');
        if (color) {
            this.$(`.color-btn[data-color="${color}"]`).click();
        }
        
        const font = localStorage.getItem('tecnosoft_font_family');
        if (font) {
            this.$(`.btn-font[data-font="${font}"]`).click();
            // Need to re-trigger to set style immediately
        }
        
         const isDark = localStorage.getItem('tecnosoft_dark_mode') === 'true';
         if(isDark) {
             this.$('#darkModeSwitch').prop('checked', true).trigger('change');
         }
    }
});
