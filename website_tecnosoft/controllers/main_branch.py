# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale

class WebsiteSaleBranch(WebsiteSale):

    def _prepare_product_values(self, product, category, search, **kwargs):
        values = super(WebsiteSaleBranch, self)._prepare_product_values(product, category, search, **kwargs)
        
        # 1. Fetch active branches
        branches = request.env['tecnosoft.branch'].sudo().search([])
        branch_stock = []

        # 2. Calculate stock per branch
        # Use simple sudo() which is standard and safe
        sudo_product = product.sudo()
        
        for branch in branches:
            if branch.warehouse_ids:
                # We use the sudo product to access the computed field 'qty_available'
                # The context 'warehouse' expects IDs.
                qty = sudo_product.with_context(warehouse=branch.warehouse_ids.ids).qty_available
                if qty > 0:
                    branch_stock.append({
                        'name': branch.name,
                        'qty': qty,
                        'desc': branch.description
                    })

        values['branch_stock'] = branch_stock
        return values

    @http.route(['/shop/get_branch_stock'], type='json', auth="public", methods=['POST'], website=True)
    def get_branch_stock(self, product_id, **kwargs):
        """ Fetch stock for a specific variant (product_id) per branch """
        if not product_id:
            return []

        # Access registry with sudo to bypass ACLs for public users
        Product = request.env['product.product'].sudo()
        product = Product.browse(int(product_id))
        
        if not product.exists():
            return []

        # Fetch branches with sudo
        branches = request.env['tecnosoft.branch'].sudo().search([])
        branch_stock = []

        for branch in branches:
            if branch.warehouse_ids:
                # Use sudo product to access quantities in restricted warehouses
                qty = product.with_context(warehouse=branch.warehouse_ids.ids).qty_available
                if qty > 0:
                    branch_stock.append({
                        'name': branch.name,
                        'qty': qty,
                        'desc': branch.description or ''
                    })
        
        return branch_stock
        
        return branch_stock
