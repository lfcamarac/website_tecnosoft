/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import Widget from "@web/legacy/js/core/widget";

publicWidget.registry.ZenithScrollReveal = Widget.extend({
    selector: '#wrapwrap',
    
    start() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('zenith-revealed');
                }
            });
        }, observerOptions);

        this._initReveal();
        return this._super.apply(this, arguments);
    },

    _initReveal() {
        // Automatically add reveal to major sections if not present
        const sections = this.el.querySelectorAll('section, .tecnosoft-timeline-item, .tecnosoft-pricing-card');
        sections.forEach(sec => {
            if (!sec.hasAttribute('data-zenith-reveal')) {
                sec.setAttribute('data-zenith-reveal', '');
            }
            this.observer.observe(sec);
        });
    }
});

export default publicWidget.registry.ZenithScrollReveal;
