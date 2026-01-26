# -*- coding: utf-8 -*-
from odoo import models, fields, api
from datetime import timedelta

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    zenith_delivery_min_days = fields.Integer(
        string="Min Delivery Days", 
        default=2,
        help="Minimum number of days for delivery"
    )
    zenith_delivery_max_days = fields.Integer(
        string="Max Delivery Days", 
        default=5,
        help="Maximum number of days for delivery"
    )
    
    zenith_estimated_delivery = fields.Char(
        string="Estimated Delivery",
        compute='_compute_estimated_delivery',
        help="Computed string for frontend display: 'Get it by [Date Range]'"
    )

    @api.depends('zenith_delivery_min_days', 'zenith_delivery_max_days')
    def _compute_estimated_delivery(self):
        for record in self:
            today = fields.Date.today()
            if record.zenith_delivery_min_days and record.zenith_delivery_max_days:
                min_date = today + timedelta(days=record.zenith_delivery_min_days)
                max_date = today + timedelta(days=record.zenith_delivery_max_days)
                
                # Format: "Mon, Oct 24 - Wed, Oct 26"
                min_str = min_date.strftime("%a, %b %d")
                max_str = max_date.strftime("%a, %b %d")
                
                record.zenith_estimated_delivery = f"{min_str} - {max_str}"
            else:
                record.zenith_estimated_delivery = False

    def get_frequently_bought_together(self):
        """
        Returns a set of products suggested to be bought with the current one.
        Logic:
        1. Accessorios (if configured)
        2. Alternative Products (if configured)
        3. Fallback: 3 products from same category
        """
        self.ensure_one()
        # Get accessory products first
        products = self.accessory_product_ids.mapped('product_tmpl_id')
        
        # If less than 3, add alternative products
        if len(products) < 3:
            alternatives = self.alternative_product_ids.filtered(lambda p: p.id not in products.ids)
            products |= alternatives[:3-len(products)]
            
        # If still less than 1, add from same category
        if not products and self.categ_id:
            fallbacks = self.env['product.template'].sudo().search([
                ('categ_id', '=', self.categ_id.id),
                ('id', '!=', self.id),
                ('website_published', '=', True),
            ], limit=3)
            products |= fallbacks

        return products[:4] # Limit to 4 for UI consistency
    def action_generate_seo_description(self):
        """
        Generate SEO Title and Description using AI (Mock logic for now).
        """
        for record in self:
            # Placeholder for AI logic
            if not record.website_meta_title:
                record.website_meta_title = f"Comprar {record.name} en Zenith"
            if not record.website_meta_description:
                record.website_meta_description = f"Descubre {record.name}. Calidad y rendimiento garantizados en Zenith."
        return True
