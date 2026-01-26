from odoo import models, fields

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    is_quote_request = fields.Boolean(string='Solicitud de Presupuesto', default=False, 
                                      help="Marcado si el cliente solicitó una revisión de precios desde el sitio web.")
