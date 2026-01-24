/** @odoo-module **/

import { publicWidget } from "@web/legacy/js/public/public_widget";
import { registry } from "@web/core/registry";

export const TecnosoftPriceSlider = publicWidget.Widget.extend({
    selector: '.tecnosoft-price-filter-wrapper',

    start() {
        this._initSlider();
        return this._super.apply(this, arguments);
    },

    _initSlider() {
        const sliderEl = this.el.querySelector('#tecnosoft_price_slider');
        if (!sliderEl) return;

        const minInput = this.el.querySelector('input[name="min_price"]');
        const maxInput = this.el.querySelector('input[name="max_price"]');
        const minDisplay = this.el.querySelector('#price_min_display');
        const maxDisplay = this.el.querySelector('#price_max_display');

        // Data attributes
        const min = parseFloat(sliderEl.dataset.min);
        const max = parseFloat(sliderEl.dataset.max);
        const currentMin = parseFloat(sliderEl.dataset.currentMin) || min;
        const currentMax = parseFloat(sliderEl.dataset.currentMax) || max;
        const symbol = sliderEl.dataset.currencySymbol || '$';

        if (typeof noUiSlider === 'undefined') {
            console.warn("noUiSlider not loaded");
            return;
        }

        noUiSlider.create(sliderEl, {
            start: [currentMin, currentMax],
            connect: true,
            range: {
                'min': min,
                'max': max
            },
            step: 1,
            tooltips: false,
        });

        sliderEl.noUiSlider.on('update', (values, handle) => {
            const value = Math.round(values[handle]);
            if (handle === 0) {
                minDisplay.innerText = symbol + " " + value;
                minInput.value = value;
            } else {
                maxDisplay.innerText = symbol + " " + value;
                maxInput.value = value;
            }
        });

        sliderEl.noUiSlider.on('change', () => {
            // Trigger form submission by triggering change on input
            // The standard Odoo filter form listens for change events on inputs within .js_attributes
            $(minInput).trigger('change');
        });
    },
});

registry.category("public_widgets").add("TecnosoftPriceSlider", TecnosoftPriceSlider);

export default TecnosoftPriceSlider;
