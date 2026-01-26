# -*- coding: utf-8 -*-
from odoo import models, fields

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'
    # All theme settings now rely on Odoo's native Website Editor.
    # Dark Mode uses localStorage (client-side), no backend field needed.
