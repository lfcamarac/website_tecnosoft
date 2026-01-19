# -*- coding: utf-8 -*-
from odoo import models, fields

class ProductLabel(models.Model):
    _name = 'tecnosoft.product.label'
    _description = 'Product Label'

    name = fields.Char('Label Text', required=True, translate=True)
    bg_color = fields.Char('Background Color', default='#e74c3c', help="Hex color code")
    text_color = fields.Char('Text Color', default='#ffffff', help="Hex color code")
    position = fields.Selection([
        ('top-left', 'Top Left'),
        ('top-right', 'Top Right'),
        ('bottom-left', 'Bottom Left'),
        ('bottom-right', 'Bottom Right'),
    ], string='Position', default='top-left')
    style = fields.Selection([
        ('badge', 'Badge (Rounded)'),
        ('ribbon', 'Ribbon (Corner)'),
        ('tag', 'Tag (Pill)'),
    ], string='Style', default='badge')
    preview_html = fields.Html('Preview', compute='_compute_preview_html')

    def _compute_preview_html(self):
        for record in self:
            record.preview_html = f"""
                <div class="mt-4 p-4 border rounded text-center" 
                     style="background-color: {record.bg_color or '#e74c3c'}; color: {record.text_color or '#ffffff'}; width: 100px; margin: 0 auto;">
                    {record.name or ''}
                </div>
            """

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    label_ids = fields.Many2many('tecnosoft.product.label', string='Labels')
