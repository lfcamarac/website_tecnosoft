/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.TecnosoftCountdown = publicWidget.Widget.extend({
    selector: '.s_tecnosoft_countdown',
    
    /**
     * @override
     */
    start() {
        // Snippet defines data-date="YYYY-MM-DD HH:MM:SS" on the section
        const dateStr = this.$el.data('date');
        // Handle Safari/Cross-browser date parsing
        this.endTime = new Date(dateStr.replace(/-/g, "/")).getTime(); 
        
        if (this.endTime && !isNaN(this.endTime)) {
            this.$days = this.$('.days');
            this.$hours = this.$('.hours');
            this.$minutes = this.$('.minutes');
            this.$seconds = this.$('.seconds');
            
            this._updateTimer();
            this.timer = setInterval(() => this._updateTimer(), 1000);
        }
        return this._super ? this._super(...arguments) : Promise.resolve();
    },

    /**
     * @private
     */
    _updateTimer() {
        const now = new Date().getTime();
        const distance = this.endTime - now;

        if (distance < 0) {
            clearInterval(this.timer);
            this.$el.find('.countdown-wrapper').html('<div class="alert alert-warning py-2 px-4 d-inline-block fw-bold shadow-sm">OFERTA TERMINADA</div>');
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update Text Content Only to preserve styling structure
        if (this.$days.length) this.$days.text(days.toString().padStart(2, '0'));
        if (this.$hours.length) this.$hours.text(hours.toString().padStart(2, '0'));
        if (this.$minutes.length) this.$minutes.text(minutes.toString().padStart(2, '0'));
        if (this.$seconds.length) this.$seconds.text(seconds.toString().padStart(2, '0'));
    },
    
    /**
     * @override
     */
    destroy() {
        if (this.timer) clearInterval(this.timer);
        if (this._super) this._super(...arguments);
    }
});

export default publicWidget.registry.TecnosoftCountdown;
