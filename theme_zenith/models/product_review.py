# -*- coding: utf-8 -*-
from odoo import models, fields

class ProductReview(models.Model):
    _inherit = 'rating.rating'

    review_image_ids = fields.Many2many(
        'ir.attachment', 
        string="Review Images",
        help="Images uploaded by the customer for this review."
    )
