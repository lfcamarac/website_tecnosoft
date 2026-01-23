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
