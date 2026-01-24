# -*- coding: utf-8 -*-
from odoo import models, fields

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    tecnosoft_dark_mode_default = fields.Boolean(related='website_id.tecnosoft_dark_mode_default', readonly=False)
