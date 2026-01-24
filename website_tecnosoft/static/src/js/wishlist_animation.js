/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.TecnosoftWishlistAnimation = publicWidget.Widget.extend({
    selector: '#wrapwrap',
    events: {
        'click .o_add_wishlist': '_onAddWishlist',
    },

    _onAddWishlist: function (ev) {
        const $btn = $(ev.currentTarget);
        const $img = $btn.closest('.oe_product_cart, .oe_website_sale').find('img.product_detail_img, img.o_product_image_primary, img.oe_product_image');
        const $wishlistIcon = $('.o_wsale_my_wish');

        if ($img.length && $wishlistIcon.length) {
            this._flyToElement($img, $wishlistIcon);
        }
    },

    _flyToElement: function ($startEl, $endEl) {
        const $ghost = $startEl.clone()
            .offset({
                top: $startEl.offset().top,
                left: $startEl.offset().left
            })
            .css({
                'opacity': '0.8',
                'position': 'absolute',
                'height': $startEl.height(),
                'width': $startEl.width(),
                'z-index': '9999',
                'border-radius': '50%',
                'object-fit': 'cover'
            })
            .appendTo($('body'))
            .animate({
                'top': $endEl.offset().top + 10,
                'left': $endEl.offset().left + 10,
                'width': 20,
                'height': 20,
                'opacity': 0.1
            }, 1000, 'easeInOutExpo', function () {
                $(this).remove();
                
                // Add a small scale animation to the target icon
                $endEl.addClass('animate__animated animate__heartBeat');
                setTimeout(() => $endEl.removeClass('animate__animated animate__heartBeat'), 1000);
            });
    }
});

// Adding easeInOutExpo if not present (simple version)
$.extend($.easing, {
    easeInOutExpo: function (x, t, b, c, d) {
        if (t==0) return b;
        if (t==d) return b+c;
        if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
        return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    }
});

export default publicWidget.registry.TecnosoftWishlistAnimation;
