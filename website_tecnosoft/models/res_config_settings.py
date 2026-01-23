# -*- coding: utf-8 -*-
from odoo import models, fields

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    tecnosoft_primary_color = fields.Char(related='website_id.tecnosoft_primary_color', readonly=False)
    tecnosoft_secondary_color = fields.Char(related='website_id.tecnosoft_secondary_color', readonly=False)
    tecnosoft_body_font = fields.Selection(related='website_id.tecnosoft_body_font', readonly=False)
