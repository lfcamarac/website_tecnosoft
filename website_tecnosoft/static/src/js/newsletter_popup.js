/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import Widget from "@web/legacy/js/core/widget";

publicWidget.registry.TecnosoftExitPopup = Widget.extend({
    selector: '#wrapwrap',
    events: {
        'click .close-exit-popup': '_onClose',
        'click .exit-popup-overlay': '_onOverlayClick',
    },

    /**
     * @override
     */
    start: function () {
        this.$popup = $('#tecnosoft_exit_popup');
        
        if (this.$popup.length && !sessionStorage.getItem('tecnosoft_exit_popup_shown')) {
            $(document).on('mouseleave', (e) => {
                if (e.clientY < 10) {
                    this._showPopup();
                }
            });
        }
        
        return this._super.apply(this, arguments);
    },

    _showPopup: function () {
        if (sessionStorage.getItem('tecnosoft_exit_popup_shown')) return;
        
        this.$popup.removeClass('d-none');
        sessionStorage.setItem('tecnosoft_exit_popup_shown', 'true');
    },

    _onClose: function (ev) {
        this.$popup.addClass('d-none');
    },

    _onOverlayClick: function (ev) {
        if ($(ev.target).hasClass('exit-popup-overlay')) {
            this._onClose();
        }
    }
});

export default publicWidget.registry.TecnosoftExitPopup;
