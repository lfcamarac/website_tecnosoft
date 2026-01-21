/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.TecnosoftPriceSlider = publicWidget.Widget.extend({
    selector: '.o_wsale_products_attributes_collapse, #wsale_products_attributes_collapse',
    
    /**
     * @override
     */
    start() {
        this._initSlider();
        return this._super.apply(this, arguments);
    },

    /**
     * @private
     */
    _initSlider() {
        const $slider = this.$('.tecnosoft-price-slider');
        if (!$slider.length) return;

        const $minInput = this.$('input[name="min_price"]');
        const $maxInput = this.$('input[name="max_price"]');
        
        if (!$minInput.length || !$maxInput.length) return;

        const minVal = parseFloat($minInput.val()) || 0;
        const maxVal = parseFloat($maxInput.val()) || 10000;
        
        // Ranges
        const rangeMin = parseFloat($slider.data('range-min')) || 0;
        const rangeMax = parseFloat($slider.data('range-max')) || 10000;

        const slider = noUiSlider.create($slider[0], {
            start: [minVal, maxVal],
            connect: true,
            range: {
                'min': rangeMin,
                'max': rangeMax
            },
            step: 1,
            format: {
                to: (value) => Math.round(value),
                from: (value) => value
            }
        });

        slider.on('update', (values, handle) => {
            const val = values[handle];
            if (handle === 0) {
                $minInput.val(val);
                this.$('.min-price-display').text(val);
            } else {
                $maxInput.val(val);
                this.$('.max-price-display').text(val);
            }
        });

        slider.on('change', () => {
            // Trigger Odoo's filter change
            // Usually Odoo listens for 'change' on the form or inputs.
            $minInput.trigger('change');
        });
    },
});

export default publicWidget.registry.TecnosoftPriceSlider;
