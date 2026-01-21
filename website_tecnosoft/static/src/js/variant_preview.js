/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.TecnosoftVariantPreview = publicWidget.Widget.extend({
    selector: '.oe_product_cart',
    events: {
        'mouseenter .variant-dot': '_onMouseEnterDot',
        'mouseleave .tecnosoft-variant-preview-dots': '_onMouseLeaveDots',
    },

    /**
     * @override
     */
    start() {
        this.$mainImage = this.$('img.oe_product_image_img');
        this.originalSrc = this.$mainImage.attr('src');
        return this._super.apply(this, arguments);
    },

    /**
     * @private
     */
    _onMouseEnterDot(ev) {
        const $dot = $(ev.currentTarget);
        const newSrc = $dot.data('variant-img');
        
        $dot.addClass('active').siblings().removeClass('active');
        
        if (newSrc && this.$mainImage.length) {
            this.$mainImage.attr('src', newSrc);
            this.$mainImage.addClass('animate__animated animate__fadeIn animate__faster');
            setTimeout(() => this.$mainImage.removeClass('animate__animated animate__fadeIn animate__faster'), 500);
        }
    },

    /**
     * @private
     */
    _onMouseLeaveDots() {
        this.$('.variant-dot').removeClass('active');
        if (this.$mainImage.length) {
            this.$mainImage.attr('src', this.originalSrc);
        }
    }
});

export default publicWidget.registry.TecnosoftVariantPreview;
