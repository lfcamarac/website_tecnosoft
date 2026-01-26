# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from odoo.addons.portal.controllers.portal import CustomerPortal


class ShoppingListController(http.Controller):
    """Controller for Shopping Lists feature."""
    
    @http.route('/my/lists', type='http', auth='user', website=True)
    def my_shopping_lists(self, **kw):
        """Display all shopping lists for the current user."""
        partner = request.env.user.partner_id
        lists = request.env['website.shopping.list'].sudo().search([
            ('partner_id', '=', partner.id)
        ])
        
        # Available icons for list creation
        icon_options = [
            ('fa-shopping-basket', 'Compra Semanal'),
            ('fa-home', 'Hogar'),
            ('fa-cutlery', 'Cocina'),
            ('fa-heart', 'Favoritos'),
            ('fa-briefcase', 'Oficina'),
            ('fa-medkit', 'Salud'),
            ('fa-paw', 'Mascotas'),
            ('fa-child', 'Bebé'),
            ('fa-gift', 'Regalos'),
            ('fa-star', 'Especial'),
        ]
        
        return request.render('theme_zenith.portal_shopping_lists', {
            'shopping_lists': lists,
            'icon_options': icon_options,
            'page_name': 'shopping_lists',
        })
    
    @http.route('/my/lists/<int:list_id>', type='http', auth='user', website=True)
    def view_shopping_list(self, list_id, **kw):
        """View a single shopping list."""
        partner = request.env.user.partner_id
        shopping_list = request.env['website.shopping.list'].sudo().search([
            ('id', '=', list_id),
            ('partner_id', '=', partner.id)
        ], limit=1)
        
        if not shopping_list:
            return request.redirect('/my/lists')
        
        return request.render('theme_zenith.portal_shopping_list_detail', {
            'shopping_list': shopping_list,
            'page_name': 'shopping_lists',
        })
    
    @http.route('/my/lists/create', type='http', auth='user', website=True, methods=['POST'], csrf=True)
    def create_shopping_list(self, **post):
        """Create a new shopping list."""
        partner = request.env.user.partner_id
        name = post.get('name', 'Mi Lista')
        icon = post.get('icon', 'fa-list')
        
        request.env['website.shopping.list'].sudo().create({
            'name': name,
            'icon': icon,
            'partner_id': partner.id,
        })
        
        return request.redirect('/my/lists')
    
    @http.route('/my/lists/<int:list_id>/delete', type='http', auth='user', website=True, methods=['POST'], csrf=True)
    def delete_shopping_list(self, list_id, **post):
        """Delete a shopping list."""
        partner = request.env.user.partner_id
        shopping_list = request.env['website.shopping.list'].sudo().search([
            ('id', '=', list_id),
            ('partner_id', '=', partner.id)
        ], limit=1)
        
        if shopping_list:
            shopping_list.unlink()
        
        return request.redirect('/my/lists')
    
    @http.route('/my/lists/<int:list_id>/add-to-cart', type='http', auth='user', website=True, methods=['POST'], csrf=True)
    def add_list_to_cart(self, list_id, **post):
        """Add all products from a list to the cart."""
        partner = request.env.user.partner_id
        shopping_list = request.env['website.shopping.list'].sudo().search([
            ('id', '=', list_id),
            ('partner_id', '=', partner.id)
        ], limit=1)
        
        if shopping_list:
            sale_order = request.website.sale_get_order(force_create=True)
            for line in shopping_list.line_ids:
                sale_order._cart_update(
                    product_id=line.product_id.id,
                    add_qty=line.quantity,
                )
        
        return request.redirect('/shop/cart')
    
    @http.route('/my/lists/<int:list_id>/add-product', type='json', auth='user', website=True)
    def add_product_to_list(self, list_id, product_id, quantity=1, **kw):
        """Add a product to a shopping list (AJAX endpoint)."""
        partner = request.env.user.partner_id
        shopping_list = request.env['website.shopping.list'].sudo().search([
            ('id', '=', list_id),
            ('partner_id', '=', partner.id)
        ], limit=1)
        
        if not shopping_list:
            return {'success': False, 'error': 'Lista no encontrada'}
        
        # Check if product already exists in list
        existing_line = request.env['website.shopping.list.line'].sudo().search([
            ('list_id', '=', list_id),
            ('product_id', '=', product_id)
        ], limit=1)
        
        if existing_line:
            existing_line.quantity += quantity
        else:
            request.env['website.shopping.list.line'].sudo().create({
                'list_id': list_id,
                'product_id': product_id,
                'quantity': quantity,
            })
        
        return {'success': True, 'message': 'Producto agregado a la lista'}
    
    @http.route('/my/lists/<int:list_id>/remove-product/<int:line_id>', type='http', auth='user', website=True, methods=['POST'], csrf=True)
    def remove_product_from_list(self, list_id, line_id, **post):
        """Remove a product from a shopping list."""
        partner = request.env.user.partner_id
        shopping_list = request.env['website.shopping.list'].sudo().search([
            ('id', '=', list_id),
            ('partner_id', '=', partner.id)
        ], limit=1)
        
        if shopping_list:
            line = request.env['website.shopping.list.line'].sudo().search([
                ('id', '=', line_id),
                ('list_id', '=', list_id)
            ], limit=1)
            if line:
                line.unlink()
        
        return request.redirect(f'/my/lists/{list_id}')
    
    @http.route('/my/lists/get-user-lists', type='json', auth='user', website=True)
    def get_user_lists(self, **kw):
        """Get all lists for the current user (AJAX endpoint for dropdown)."""
        partner = request.env.user.partner_id
        lists = request.env['website.shopping.list'].sudo().search([
            ('partner_id', '=', partner.id)
        ])
        
        return [{
            'id': lst.id,
            'name': lst.name,
            'icon': lst.icon,
            'product_count': lst.product_count,
        } for lst in lists]
