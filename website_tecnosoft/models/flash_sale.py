# -*- coding: utf-8 -*-
from odoo import models, fields, api

class FlashSale(models.Model):
    _name = 'tecnosoft.flash.sale'
    _description = 'Flash Sale Campaign'
    _order = 'end_date asc'

    name = fields.Char(string='Campaign Name', required=True)
    start_date = fields.Datetime(string='Start Date', required=True, default=fields.Datetime.now)
    end_date = fields.Datetime(string='End Date', required=True)
    active = fields.Boolean(default=True)
    
    product_ids = fields.Many2many(
        'product.template', 
        string='Discounted Products',
        help='Products included in this flash sale.'
    )
    
    background_image = fields.Image(string="Background Image", max_width=1920, max_height=1080)
    
    @api.model
    def get_current_sale(self):
        """ Returns the single most relevant active flash sale. """
        now = fields.Datetime.now()
        domain = [
            ('active', '=', True),
            ('start_date', '<=', now),
            ('end_date', '>', now)
        ]
        # Return the one ending soonest
        return self.search(domain, limit=1, order='end_date asc')
