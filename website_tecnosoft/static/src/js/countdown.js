/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.TecnosoftCountdown = publicWidget.Widget.extend({
    selector: '.tecnosoft-countdown',
    
    /**
     * @override
     */
    start() {
        this.endTime = new Date(this.$el.data('end-date')).getTime();
        if (this.endTime) {
            this._updateTimer();
            this.timer = setInterval(() => this._updateTimer(), 1000);
        }
        return this._super.apply(this, arguments);
    },

    /**
     * @private
     */
    _updateTimer() {
        const now = new Date().getTime();
        const distance = this.endTime - now;

        if (distance < 0) {
            clearInterval(this.timer);
            this.$el.html('<div class="alert alert-warning py-1 px-3 mb-0 small fw-bold">OFERTA TERMINADA</div>');
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.$el.html(`
            <div class="d-flex gap-2 justify-content-center">
                ${days > 0 ? this._getHtmlPart(days, 'DÍAS') : ''}
                ${this._getHtmlPart(hours, 'HORAS')}
                ${this._getHtmlPart(minutes, 'MIN')}
                ${this._getHtmlPart(seconds, 'SEG')}
            </div>
        `);
    },

    /**
     * @private
     */
    _getHtmlPart(value, label) {
        return `
            <div class="countdown-part bg-dark text-white rounded p-2 text-center shadow-sm" style="min-width: 50px;">
                <div class="h5 fw-bold mb-0">${value.toString().padStart(2, '0')}</div>
                <div style="font-size: 0.55rem; opacity: 0.7;">${label}</div>
            </div>
        `;
    },
    
    /**
     * @override
     */
    destroy() {
        clearInterval(this.timer);
        this._super.apply(this, arguments);
    }
});

export default publicWidget.registry.TecnosoftCountdown;
