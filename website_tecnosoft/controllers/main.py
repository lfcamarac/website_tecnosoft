# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from odoo.osv import expression
import collections

class TecnosoftController(http.Controller):

    @http.route('/brands', type='http', auth='public', website=True)
    def brands_directory(self, **kwargs):
        """ Render the alphabetized brands directory. """
        brands = request.env['tecnosoft.product.brand'].sudo().search([])
        
        # Group brands by first letter
        grouped_brands = collections.defaultdict(list)
        for brand in brands:
            first_letter = brand.name[0].upper() if brand.name else '#'
            if not first_letter.isalpha():
                first_letter = '#'
            grouped_brands[first_letter].append(brand)
            
        values = {
            'grouped_brands': collections.OrderedDict(sorted(grouped_brands.items())),
            'alphabet': "ABCDEFGHIJKLMNOPQRSTUVWXYZ#",
        }
        return request.render('website_tecnosoft.brands_directory_page', values)

    @http.route('/website_tecnosoft/get_dynamic_products', type='json', auth='public', website=True)
    def get_dynamic_products(self, limit=4, **kwargs):
        """ Deprecated: Use get_products_data instead. """
        return self.get_products_data(limit=limit).get('products', [])

    @http.route('/website_tecnosoft/get_products_data', type='json', auth='public', website=True)
    def get_products_data(self, domain=None, limit=4, order='website_sequence asc', options={}, search=None, **kwargs):
        """ Fetch products based on flexible criteria. """
        domain = domain or []
        base_domain = [('website_published', '=', True), ('sale_ok', '=', True)]
        
        if search:
            domain = expression.AND([domain, [('name', 'ilike', search)]])
        
        final_domain = expression.AND([base_domain, domain])
        
        products = request.env['product.template'].sudo().search(final_domain, limit=limit, order=order)
        
        pricelist = request.website.get_current_pricelist()
        currency = pricelist.currency_id
        
        product_list = []
        for p in products:
            # Get price from pricelist
            price = pricelist._get_product_price(p, 1.0)
            price_formatted = currency.format(price)
            
            product_list.append({
                'id': p.id,
                'name': p.name,
                'price': price,
                'price_formatted': price_formatted,
                'image_url': f'/web/image/product.template/{p.id}/image_512',
                'url': p.website_url,
                'description_sale': p.description_sale,
            })

        return {'products': product_list}

    @http.route('/website_tecnosoft/get_categories_info', type='json', auth='public', website=True)
    def get_categories_info(self, category_ids, **kwargs):
        """ Fetch names and info for a list of category IDs. """
        if not category_ids:
            return []
        categories = request.env['product.public.category'].sudo().browse(category_ids).exists()
        return [{'id': c.id, 'name': c.name} for c in categories]

    @http.route('/website_tecnosoft/subscribe_price_tracker', type='json', auth='user', website=True)
    def subscribe_price_tracker(self, product_id, **kwargs):
        """ Subscribe user to price drop notifications. """
        tracker = request.env['website.price.tracker'].sudo().create({
            'partner_id': request.env.user.partner_id.id,
            'product_id': int(product_id),
            'last_notified_price': request.env['product.template'].sudo().browse(int(product_id)).list_price,
        })
        return {'status': 'success', 'id': tracker.id}

    @http.route('/website_tecnosoft/quick_view', type='http', auth='public', website=True)
    def quick_view(self, product_id, **kwargs):
        """ Render the Quick View modal content. """
        product = request.env['product.template'].browse(int(product_id))
        return request.render("website_tecnosoft.quick_view_modal", {
            'product': product,
        })

    @http.route('/llms.txt', type='http', auth='public', website=True, sitemap=False)
    def llms_txt(self, **kwargs):
        """ Serve a markdown summary of the website for AI agents (GEO). """
        website = request.website
        
        # Fetch Top Categories
        categories = request.env['product.public.category'].search([('parent_id', '=', False)], limit=10)
        
        # Fetch Top Brands (if available)
        brands = []
        if hasattr(request.env['product.template'], 'brand_id'):
             brands = request.env['tecnosoft.product.brand'].search([], limit=10, order='product_count desc')

        # Build Markdown Content
        content = [
            f"# {website.name} - AI Summary",
            f"\n## Mission",
            f"{website.company_id.report_header or 'Leading provider of technology solutions.'}",
            f"\n## Main Navigation",
        ]
        
        for menu in website.menu_id.child_id:
            content.append(f"- [{menu.name}]({menu.url})")

        content.append("\n## Top Categories")
        for cat in categories:
            content.append(f"- {cat.name} (/shop/category/{cat.id})")
            
        if brands:
            content.append("\n## Top Brands")
            for brand in brands:
                content.append(f"- {brand.name}")

        return request.make_response(
            "\n".join(content),
            headers=[('Content-Type', 'text/plain')]
        )
    
    @http.route('/website_tecnosoft/get_cart_data', type='json', auth='public', website=True)
    def get_cart_data(self):
        """ Return cart data for the Side Cart panel. """
        order = request.website.sale_get_order()
        if not order or not order.order_line:
            return {'lines': [], 'total': 0, 'cart_quantity': 0}
        
        lines = []
        for line in order.order_line:
            lines.append({
                'id': line.id,
                'product_name': line.product_id.name,
                'quantity': line.product_uom_qty,
                'price': line.price_total,
                'img': f'/web/image/product.product/{line.product_id.id}/image_128',
            })
            
        return {
            'lines': lines,
            'total': order.amount_total,
            'cart_quantity': order.cart_quantity,
            'currency': order.currency_id.symbol,
        }
