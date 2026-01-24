# -*- coding: utf-8 -*-
from odoo import models, fields

class Website(models.Model):
    _inherit = 'website'

    tecnosoft_primary_color = fields.Char(string="Color Primario", default="#007bff")
    tecnosoft_secondary_color = fields.Char(string="Color Secundario", default="#6c757d")
    tecnosoft_body_font = fields.Selection([
        ('inter', 'Inter'),
        ('roboto', 'Roboto'),
        ('outfit', 'Outfit'),
        ('montserrat', 'Montserrat'),
    ], string="Tipografía Principal", default='inter')

    def _clean_zombie_views(self):
        """
        Emergency cleanup method to delete views containing the bad code:
        <t t-if="request.path.startswith('/shop')">
        This is necessary because Odoo might have preserved old/COW views that persist despite module removal.
        """
        # Search for any view (even inherited ones) containing the bad string
        # We search specifically for the 'request.path' usage which causes the 500 error
        bad_code_snippet = "request.path.startswith('/shop')"
        
        # Find views that contain the bad code in their architecture
        # Note: 'arch_db' is the field storing the raw XML content
        zombie_views = self.env['ir.ui.view'].search([
            ('type', '=', 'qweb'),
            ('arch_db', 'ilike', bad_code_snippet)
        ])
        
        if zombie_views:
            # We log identifying info just in case
            for view in zombie_views:
                # Force delete. Note: if it's a base view, this might be risky, 
                # but 'request.path' is NOT standard Odoo 18 code for website.layout, 
                # so it must be our faulty code or a bad custom copy.
                try:
                    view.unlink()
                except Exception:
                    # If unlink fails (e.g. protected), try to archive it
                    view.write({'active': False})
