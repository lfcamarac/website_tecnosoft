# -*- coding: utf-8 -*-
from odoo import models, fields

class ProductBrand(models.Model):
    _name = 'zenith.product.brand'
    _description = 'Product Brand'
    _order = 'name'

    name = fields.Char('Brand Name', required=True)
    image = fields.Image('Logo', max_width=512, max_height=512)
    website_id = fields.Many2one('website', string='Website')
    product_ids = fields.One2many('product.template', 'brand_id', string='Products')
    product_count = fields.Integer(compute='_compute_product_count', string='Product Count')

    def _compute_product_count(self):
        for brand in self:
            brand.product_count = len(brand.product_ids)

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    brand_id = fields.Many2one('zenith.product.brand', string='Brand')
