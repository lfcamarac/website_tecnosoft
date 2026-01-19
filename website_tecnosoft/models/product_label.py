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
    ], string='Position', default='top-left')

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    label_ids = fields.Many2many('tecnosoft.product.label', string='Labels')
