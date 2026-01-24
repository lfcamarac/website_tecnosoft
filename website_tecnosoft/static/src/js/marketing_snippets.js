/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc_service";
import Widget from "@web/legacy/js/core/widget";

publicWidget.registry.TecnosoftCountdown = Widget.extend({
    selector: '.s_tecnosoft_countdown, .s_tecnosoft_shop_offer',
    
    /**
     * @override
     */
    start() {
        this.date = this.$el.data('date');
        if (this.date) {
            this._startTimer();
        }
        return this._super.apply(this, arguments);
    },

    _startTimer() {
        this.countDownDate = new Date(this.date).getTime();
        
        // Update the count down every 1 second
        this.timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = this.countDownDate - now;

            if (distance < 0) {
                clearInterval(this.timerInterval);
                this.$el.find('.countdown-timer').html("EXPIRED");
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            this.$el.find('.days').text(this._format(days));
            this.$el.find('.hours').text(this._format(hours));
            this.$el.find('.minutes').text(this._format(minutes));
            this.$el.find('.seconds').text(this._format(seconds));

        }, 1000);
    },
    
    _format(num) {
        return num < 10 ? "0" + num : num;
    },

    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this._super(...arguments);
    }
});
