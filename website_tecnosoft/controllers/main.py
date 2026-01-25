# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from odoo.osv import expression
import collections
import base64

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
                'brand_name': p.brand_id.name if p.brand_id else None,
                'category_name': p.public_categ_ids[0].name if p.public_categ_ids else None,
            })

        # Search Categories
        categories = []
        if search:
            category_domain = [('name', 'ilike', search)]
            found_categories = request.env['product.public.category'].sudo().search(category_domain, limit=3)
            for c in found_categories:
                product_count = request.env['product.template'].sudo().search_count([
                    ('public_categ_ids', 'child_of', c.id), 
                    ('website_published', '=', True)
                ])
                if product_count > 0:
                    categories.append({
                        'id': c.id,
                        'name': c.name,
                        'url': f'/shop/category/{c.id}',
                        'count': product_count
                    })

        return {'products': product_list, 'categories': categories}

    @http.route('/website_tecnosoft/get_branches_locations', type='json', auth='public', website=True)
    def get_branches_locations(self):
        """ Fetch all active branches with their coordinates for the map. """
        branches = request.env['tecnosoft.branch'].sudo().search([('active', '=', True)])
        data = []
        for b in branches:
            data.append({
                'id': b.id,
                'name': b.name,
                'lat': b.latitude,
                'lng': b.longitude,
                'desc': b.description or '',
                'street': b.description.split('\n')[0] if b.description else '',
            })
        return {'branches': data}

    @http.route('/shop/quick-order', type='http', auth='public', website=True)
    def quick_order_page(self, **kwargs):
        """ Render the dedicated Quick Order page. """
        return request.render('website_tecnosoft.tecnosoft_quick_order')

    @http.route('/website_tecnosoft/bulk_add_cart', type='json', auth='public', website=True)
    def bulk_add_cart(self, products, **kwargs):
        """ Add multiple products and quantities to cart at once.
            'products' should be a list of {'product_id': id, 'qty': qty}
        """
        sale_order = request.website.sale_get_order(force_create=True)
        if not sale_order:
            return {'error': 'Order not found'}

        for prod_info in products:
            prod_id = int(prod_info.get('product_id'))
            qty = float(prod_info.get('qty', 1))
            if prod_id and qty > 0:
                sale_order._cart_update(
                    product_id=prod_id,
                    add_qty=qty
                )
        return {'success': True}

    @http.route('/shop/reorder/<int:order_id>', type='http', auth='public', website=True)
    def shop_reorder(self, order_id, **kwargs):
        """ Re-add all products from a previous order to the current cart. """
        order = request.env['sale.order'].sudo().browse(order_id)
        if not order or order.partner_id != request.env.user.partner_id:
            return request.redirect('/my/orders')

        sale_order = request.website.sale_get_order(force_create=True)
        for line in order.order_line:
            if line.product_id.website_published:
                sale_order._cart_update(
                    product_id=line.product_id.id,
                    add_qty=line.product_uom_qty
                )
        return request.redirect('/shop/cart')

    @http.route('/shop/request_quote', type='http', auth='public', website=True)
    def shop_request_quote(self, **kwargs):
        """ Convert current cart into a 'sent' quotation for admin review. """
        sale_order = request.website.sale_get_order()
        if not sale_order or not sale_order.order_line:
            return request.redirect('/shop/cart')
        
        # Mark as quotation and potentially add a note
        sale_order.sudo().write({
            'state': 'draft',
            'is_quote_request': True,
        })
        # Optional: Send notification or log a message
        sale_order.message_post(body="El cliente ha solicitado un presupuesto personalizado desde el sitio web.")
        
        # Odoo usually expects 'sent' state for quotations that the salesman has seen
        # but for 'review request', keeping it as draft with a specific flag or just notifying is safer.
        # We'll redirect to a thank you / confirmation page
        return request.render('website_tecnosoft.tecnosoft_quote_request_thanks', {
            'order': sale_order
        })

    @http.route('/website_tecnosoft/get_categories_info', type='json', auth='public', website=True)
    def get_categories_info(self, category_ids, **kwargs):
        """ Fetch names and info for a list of category IDs. """
        if not category_ids:
            return []
        categories = request.env['product.public.category'].sudo().browse(category_ids).exists()
        return [{'id': c.id, 'name': c.name} for c in categories]

    @http.route('/website_tecnosoft/get_category_tree', type='json', auth='public', website=True)
    def get_category_tree(self, parent_id=None, limit=None, **kwargs):
        """ Fetch category tree for Mega Menu (Parent -> Child -> Grandchild). """
        domain = [('parent_id', '=', int(parent_id) if parent_id else False)]
        categories = request.env['product.public.category'].sudo().search(domain, limit=limit)
        
        tree = []
        for c in categories:
            children = []
            # Fetch one level of subcategories
            for child in c.child_id[:6]: # Limit subcategories for UI
                children.append({
                    'id': child.id,
                    'name': child.name,
                    'url': f'/shop/category/{child.id}',
                })
                
            tree.append({
                'id': c.id,
                'name': c.name,
                'url': f'/shop/category/{c.id}',
                'children': children
            })
        return {'categories': tree}

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

    @http.route('/website_tecnosoft/get_upsell_products', type='json', auth='public', website=True)
    def get_upsell_products(self, product_id, **kwargs):
        """ Fetch suggested products for Upsell Modal. """
        if not product_id:
            return {'products': []}
        
        # We assume product_id passed from frontend is product.template (from hidden input)
        # But usually in cart forms it's product_product (product_id input name). 
        # Let's handle both or assume template if that's what we send.
        # Actually standard input name="product_id" sends variant ID.
        
        # If we receive variant ID, get template
        variant = request.env['product.product'].sudo().browse(int(product_id))
        if not variant.exists():
            return {'products': []}
        
        tmpl = variant.product_tmpl_id
        suggested_tmpls = tmpl.get_frequently_bought_together()
        
        results = []
        pricelist = request.website.get_current_pricelist()
        currency = pricelist.currency_id

        for t in suggested_tmpls:
            # Use first variant for simple add
            target_variant = t.product_variant_id
            if not target_variant:
                continue

            price = pricelist._get_product_price(t, 1.0)
            
            results.append({
                'id': t.id,
                'name': t.name,
                'price': currency.format(price),
                'image_url': f'/web/image/product.template/{t.id}/image_512',
                'variant_id': target_variant.id,
                'url': t.website_url,
            })
            
        return {'products': results}

    @http.route('/website_tecnosoft/submit_review', type='http', auth='public', website=True, methods=['POST'])
    def submit_review(self, **post):
        """ Handle Review Submission with Images. """
        product_id = int(post.get('product_id', 0))
        rating_val = float(post.get('rating', 0))
        comment = post.get('comment', '')
        # File handling
        files = request.httprequest.files.getlist('review_images')
        
        if not product_id or not rating_val:
            return request.redirect(request.httprequest.referrer + "?review_error=missing_data")

        product = request.env['product.template'].browse(product_id)
        if not product.exists():
            return request.redirect(request.httprequest.referrer + "?review_error=product_not_found")

        # Create Rating
        # We use standard 'rating.rating' creation flow or manual create
        # For public user, we might need a partner_id or default to Public User.
        # Ideally user should be logged in or we capture name/email.
        
        partner = request.env.user.partner_id
        if request.env.user._is_public():
            # In a real scenario we'd ask for name/email in form and maybe find/create partner
            pass

        Rating = request.env['rating.rating'].sudo()
        rating = Rating.create({
            'res_model_id': request.env['ir.model'].sudo().search([('model', '=', 'product.template')], limit=1).id,
            'res_id': product.id,
            'rating': rating_val,
            'feedback': comment,
            'partner_id': partner.id,
            'consumed': True, # Mark as processed
        })

        # Process Images
        if files:
            attachment_ids = []
            for file in files:
                if file.filename:
                    attachment = request.env['ir.attachment'].sudo().create({
                        'name': file.filename,
                        'type': 'binary',
                        'datas': base64.b64encode(file.read()),
                        'res_model': 'rating.rating',
                        'res_id': rating.id,
                        'mimetype': file.content_type,
                    })
                    attachment_ids.append(attachment.id)
            
            if attachment_ids:
                rating.review_image_ids = [(6, 0, attachment_ids)]

        return request.redirect(request.httprequest.referrer + "?review_success=true")

    @http.route('/shop/compare_data', type='json', auth='public', website=True)
    def get_compare_data(self, **kwargs):
        """ Fetch data for the comparison drawer. """
        # Odoo stores comparison in session 'compare_product_ids' (list of IDs)
        # Assuming website_sale_comparison is installed and used.
        product_ids = request.session.get('compare_product_ids')
        if not product_ids:
             return {'products': []}
        
        products = request.env['product.product'].sudo().browse(product_ids).exists()
        res = []
        for p in products:
            res.append({
                'id': p.id,
                'name': p.name,
                 # Comparison widget usually works with product.product IDs
            })
        return {'products': res}

    @http.route('/website_tecnosoft/get_products_by_skus', type='json', auth='public', website=True)
    def get_products_by_skus(self, skus):
        """ Fetch products by a list of Internal References (default_code). """
        if not skus:
            return {'products': [], 'not_found': []}
        
        # Clean SKUs
        clean_skus = [s.strip() for s in skus if s.strip()]
        
        # Search products
        products = request.env['product.product'].sudo().search([
            ('default_code', 'in', clean_skus),
            ('sale_ok', '=', True),
            ('website_published', '=', True)
        ])
        
        found_skus = set(products.mapped('default_code'))
        not_found = list(set(clean_skus) - found_skus)
        
        results = []
        pricelist = request.website.get_current_pricelist()
        currency = pricelist.currency_id

        for p in products:
            price = pricelist._get_product_price(p.product_tmpl_id, 1.0)
            results.append({
                'id': p.id,
                'name': p.name,
                'default_code': p.default_code,
                'price': price,
                'price_formatted': currency.format(price),
                'stock_msg': 'En Stock' if p.qty_available > 0 else 'Agotado', # Simplified stock check
                'currency': currency.symbol,
            })
            
    @http.route('/website_tecnosoft/get_recent_orders', type='json', auth='public', website=True)
    def get_recent_orders(self):
        """ Fetch recent sold products for Social Proof notifications. """
        # We'll fetch the last 10 confirmed orders to keep it realistic
        # but filter for products that are published.
        recent_orders = request.env['sale.order.line'].sudo().search([
            ('order_id.state', 'in', ['sale', 'done']),
            ('product_id.website_published', '=', True),
        ], limit=10, order='create_date desc')

        results = []
        # Fallback if no real orders yet
        if not recent_orders:
            # Fetch some random products to simulate activity for a new store
            products = request.env['product.template'].sudo().search([('website_published', '=', True)], limit=5)
            locations = ['Maturín', 'Lechería', 'Caracas', 'Puerto Ordaz', 'Valencia']
            for i, p in enumerate(products):
                results.append({
                    'product_name': p.name,
                    'product_image': f'/web/image/product.template/{p.id}/image_128',
                    'location': locations[i % len(locations)],
                    'time_ago': 'hace poco',
                })
            return results

        for line in recent_orders:
            # Mock or use partner city if available
            city = line.order_id.partner_id.city or 'Venezuela'
            results.append({
                'product_name': line.product_id.name,
                'product_image': f'/web/image/product.product/{line.product_id.id}/image_128',
                'location': city,
                'time_ago': 'hace poco',
            })
        
        # Deduplicate by product to avoid multiple notifications for same item
        unique_results = {res['product_name']: res for res in results}.values()
        return list(unique_results)

    # -------------------------------------------------------------------------
    # ADDRESS SELECTOR ROUTES
    # -------------------------------------------------------------------------

    @http.route('/website_tecnosoft/get_user_addresses', type='json', auth='public', website=True)
    def get_user_addresses(self, **kwargs):
        """ Fetch user addresses for the header selector. """
        order = request.website.sale_get_order()
        partner = request.env.user.partner_id

        # If public user, return empty or maybe geo-located city
        if request.env.user._is_public():
            return {
                'public': True,
                'addresses': [],
                'current_id': None
            }

        # Get shipping addresses (including parent contact if type=delivery is missing, but usually child_ids)
        # We follow standard Odoo logic: partner + children of type 'delivery' or 'other'
        addresses = request.env['res.partner'].sudo().search([
            ('id', 'child_of', partner.commercial_partner_id.ids),
            '|', ('type', 'in', ['delivery', 'other']), ('id', '=', partner.id)
        ])
        
        # Format for frontend
        addr_list = []
        for addr in addresses:
            name = addr.name or partner.name
            street = addr.street or ''
            city = addr.city or ''
            state = addr.state_id.name or ''
            
            # Simple one-line description
            full_addr = f"{street}, {city}" if street and city else (street or city or name)
            
            addr_list.append({
                'id': addr.id,
                'name': name,
                'type': addr.type,
                'full_address': full_addr,
                'city': city,
            })

        current_shipping_id = order.partner_shipping_id.id if order else partner.id

        return {
            'public': False,
            'addresses': addr_list,
            'current_id': current_shipping_id,
            'user_name': partner.name
        }

    @http.route('/website_tecnosoft/set_delivery_address', type='json', auth='public', website=True)
    def set_delivery_address(self, address_id, **kwargs):
        """ Update the current order's shipping address. """
        order = request.website.sale_get_order(force_create=True)
        if not order:
            return {'error': 'No active order'}
            
        addr_id = int(address_id)
        # verify access
        addr = request.env['res.partner'].sudo().browse(addr_id)
        if not addr.exists():
             return {'error': 'Address not found'}
             
        # Basic security check: address must belong to user (or be the user)
        # Public users can't set arbitrary IDs unless we are lenient (but we should check partner)
        if not request.env.user._is_public():
             user_partner = request.env.user.partner_id
             if addr_id != user_partner.id and addr.parent_id.id != user_partner.id:
                 # Depending on record rules, perform a search count
                 # This is a loose check, usually we rely on record rules but sudo() bypasses them.
                 # Let's verify ownership:
                 if addr.commercial_partner_id.id != user_partner.commercial_partner_id.id:
                      return {'error': 'Access Denied'}

        # Update order
        order.sudo().write({'partner_shipping_id': addr_id})
        
        if order.partner_id.id == request.env.ref('base.public_partner').id:
             # Case: Public user setting address (maybe not pertinent unless they just filled a form)
             pass

        return {'success': True, 'new_address_id': addr_id}
