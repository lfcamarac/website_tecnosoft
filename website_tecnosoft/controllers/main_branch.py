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
        for branch in branches:
            total_qty = 0
            # If the product has variants, we should probably look at the selected variant.
            # However, _prepare_product_values runs before variant selection on the client side.
            # Odoo usually passes 'product' as the product.template.
            
            # We will calculate for the product template (sum of variants) or specific logic.
            # For simplicity in this iteration: Sum of stock in associated warehouses.
            
            # Optimization: Use with_context(warehouse=...)
            # But warehouse context usually takes a single ID or list?
            # Let's manually iterate or use domain.
            
            if branch.warehouse_ids:
                # Get quants for this product in these warehouses
                # This is "On Hand" (qty_available). For "Available" (virtual_available), 
                # we need to consider reservations.
                
                # Using context is the standard Odoo way for virtual_available
                # But we have multiple warehouses per branch.
                
                # A robust way:
                # qty = product.with_context(warehouse=branch.warehouse_ids.ids).virtual_available
                # Note: 'warehouse' context key in stock usually filters availability.
                
                qty = product.with_context(warehouse=branch.warehouse_ids.ids).qty_available
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

        # Ensure product exists
        product = request.env['product.product'].browse(int(product_id))
        if not product.exists():
            return []

        branches = request.env['tecnosoft.branch'].sudo().search([])
        branch_stock = []

        for branch in branches:
            if branch.warehouse_ids:
                # Get available qty for this SPECIFIC variant in the branch's warehouses
                qty = product.with_context(warehouse=branch.warehouse_ids.ids).qty_available
                # Start showing even if 0? Or only if > 0? Let's match initial load logic (>0).
                # User might want to see 'Out of stock' at specific branch too?
                # For now stick to > 0 to be cleaner.
                if qty > 0:
                    branch_stock.append({
                        'name': branch.name,
                        'qty': qty,
                        'desc': branch.description or ''
                    })
        
        return branch_stock
