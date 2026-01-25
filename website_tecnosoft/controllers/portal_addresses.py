# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from odoo.addons.portal.controllers.portal import CustomerPortal


class TecnosoftPortalAddresses(CustomerPortal):
    """
    Controller for managing delivery addresses in the user portal.
    Extends the standard Customer Portal to add /my/addresses functionality.
    """

    @http.route(['/my/addresses'], type='http', auth='user', website=True)
    def my_addresses(self, **kwargs):
        """
        Display list of user's delivery addresses.
        """
        partner = request.env.user.partner_id
        
        # Get all addresses (children contacts of type 'delivery' or 'other')
        addresses = request.env['res.partner'].sudo().search([
            '|',
            ('id', '=', partner.id),
            ('parent_id', '=', partner.id),
        ], order='type desc, name asc')
        
        # Get current order's shipping address if exists
        order = request.website.sale_get_order()
        current_shipping_id = order.partner_shipping_id.id if order and order.partner_shipping_id else None
        
        values = {
            'page_name': 'my_addresses',
            'addresses': addresses,
            'current_shipping_id': current_shipping_id,
            'countries': request.env['res.country'].sudo().search([]),
            'states': request.env['res.country.state'].sudo().search([]),
        }
        return request.render('website_tecnosoft.portal_my_addresses', values)

    @http.route(['/my/addresses/add'], type='http', auth='user', website=True, methods=['GET', 'POST'])
    def add_address(self, **kwargs):
        """
        Form to add a new delivery address.
        GET: Show form
        POST: Create address and redirect
        """
        if request.httprequest.method == 'POST':
            return self._create_or_update_address(None, **kwargs)
        
        values = {
            'page_name': 'add_address',
            'address': None,
            'countries': request.env['res.country'].sudo().search([]),
            'states': request.env['res.country.state'].sudo().search([]),
            'mode': 'create',
        }
        return request.render('website_tecnosoft.portal_address_form', values)

    @http.route(['/my/addresses/edit/<int:address_id>'], type='http', auth='user', website=True, methods=['GET', 'POST'])
    def edit_address(self, address_id, **kwargs):
        """
        Form to edit an existing address.
        GET: Show form with existing data
        POST: Update address and redirect
        """
        partner = request.env.user.partner_id
        address = request.env['res.partner'].sudo().browse(address_id)
        
        # Security check: ensure address belongs to user
        if address.id != partner.id and address.parent_id.id != partner.id:
            return request.redirect('/my/addresses')
        
        if request.httprequest.method == 'POST':
            return self._create_or_update_address(address_id, **kwargs)
        
        values = {
            'page_name': 'edit_address',
            'address': address,
            'countries': request.env['res.country'].sudo().search([]),
            'states': request.env['res.country.state'].sudo().search([]),
            'mode': 'edit',
        }
        return request.render('website_tecnosoft.portal_address_form', values)

    @http.route(['/my/addresses/delete/<int:address_id>'], type='http', auth='user', website=True, methods=['POST'])
    def delete_address(self, address_id, **kwargs):
        """
        Delete an address (archive it rather than hard delete).
        """
        partner = request.env.user.partner_id
        address = request.env['res.partner'].sudo().browse(address_id)
        
        # Security check + prevent deleting main partner
        if address.id == partner.id:
            return request.redirect('/my/addresses?error=cannot_delete_main')
        if address.parent_id.id != partner.id:
            return request.redirect('/my/addresses?error=access_denied')
        
        # Archive instead of delete for data integrity
        address.sudo().write({'active': False})
        
        return request.redirect('/my/addresses?success=deleted')

    @http.route(['/my/addresses/set_default/<int:address_id>'], type='http', auth='user', website=True, methods=['POST'])
    def set_default_address(self, address_id, **kwargs):
        """
        Set an address as the default shipping address for the current order.
        """
        order = request.website.sale_get_order()
        if order:
            order.sudo().write({'partner_shipping_id': address_id})
        
        return request.redirect('/my/addresses?success=default_set')

    def _create_or_update_address(self, address_id=None, **kwargs):
        """
        Helper to create or update an address from form data.
        """
        partner = request.env.user.partner_id
        
        address_vals = {
            'name': kwargs.get('name', partner.name),
            'street': kwargs.get('street', ''),
            'street2': kwargs.get('street2', ''),
            'city': kwargs.get('city', ''),
            'state_id': int(kwargs.get('state_id')) if kwargs.get('state_id') else False,
            'zip': kwargs.get('zip', ''),
            'country_id': int(kwargs.get('country_id')) if kwargs.get('country_id') else False,
            'phone': kwargs.get('phone', ''),
            'type': 'delivery',
        }
        
        if address_id:
            # Update existing
            address = request.env['res.partner'].sudo().browse(address_id)
            if address.parent_id.id != partner.id and address.id != partner.id:
                return request.redirect('/my/addresses?error=access_denied')
            address.sudo().write(address_vals)
        else:
            # Create new as child of partner
            address_vals['parent_id'] = partner.id
            request.env['res.partner'].sudo().create(address_vals)
        
        # Set as default if checkbox was checked
        if kwargs.get('set_as_default'):
            order = request.website.sale_get_order()
            if order:
                new_addr = request.env['res.partner'].sudo().search([
                    ('parent_id', '=', partner.id),
                    ('street', '=', address_vals.get('street')),
                    ('city', '=', address_vals.get('city')),
                ], limit=1)
                if new_addr:
                    order.sudo().write({'partner_shipping_id': new_addr.id})
        
        return request.redirect('/my/addresses?success=saved')
