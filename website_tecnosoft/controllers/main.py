# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request

class TecnosoftController(http.Controller):
    @http.route('/website_tecnosoft/get_dynamic_products', type='json', auth='public', website=True)
    def get_dynamic_products(self, limit=4, **kwargs):
        """ Fetch top products for the dynamic snippets. """
        products = request.env['product.template'].sudo().search([
            ('website_published', '=', True),
            ('sale_ok', '=', True)
        ], limit=limit, order='website_sequence asc')
        
        return [{
            'id': p.id,
            'name': p.name,
            'price': p.list_price,
            'image_url': f'/web/image/product.template/{p.id}/image_512',
            'url': p.website_url,
        } for p in products]

    @http.route('/website_tecnosoft/subscribe_price_tracker', type='json', auth='user', website=True)
    def subscribe_price_tracker(self, product_id, **kwargs):
        """ Subscribe user to price drop notifications. """
        tracker = request.env['website.price.tracker'].sudo().create({
            'partner_id': request.env.user.partner_id.id,
            'product_id': int(product_id),
            'last_notified_price': request.env['product.template'].sudo().browse(int(product_id)).list_price,
        })
        return {'status': 'success', 'id': tracker.id}
