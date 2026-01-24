/** @odoo-module **/

import publicWidget from 'web.public.widget';

publicWidget.registry.TecnosoftVariantPreview = Widget.extend({
    selector: '.product_detail_main',
    events: {
        'mouseenter .o_variant_pills_input_value': '_onHoverVariant',
        'mouseleave .o_variant_pills_input_value': '_onLeaveVariant',
    },

    start: function () {
        this.$mainImage = this.$('#o-carousel-product .carousel-item.active img');
        if (!this.$mainImage.length) {
            // Fallback for non-carousel layouts
            this.$mainImage = this.$('img[itemprop="image"]');
        }
        return this._super.apply(this, arguments);
    },

    _onHoverVariant: function (ev) {
        const $target = $(ev.currentTarget);
        const imageUrl = $target.data('preview-image');

        if (imageUrl) {
            // Store original source if not already stored
            if (!this.$mainImage.data('original-src')) {
                this.$mainImage.data('original-src', this.$mainImage.attr('src'));
            }
            // Swap image
            this.$mainImage.attr('src', imageUrl);
            this.$mainImage.attr('srcset', imageUrl); // Update srcset as well to prevent high-res overrides
        }
    },

    _onLeaveVariant: function (ev) {
        const originalSrc = this.$mainImage.data('original-src');
        if (originalSrc) {
            this.$mainImage.attr('src', originalSrc);
            this.$mainImage.removeAttr('srcset'); // Remove forced srcset to let browser decide or restore original
        }
    },
});
