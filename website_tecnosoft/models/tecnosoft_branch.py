from odoo import models, fields

class TecnosoftBranch(models.Model):
    _name = 'tecnosoft.branch'
    _description = 'Tecnosoft Branch (Sede)'
    _order = 'sequence, name'

    name = fields.Char(string='Nombre de la Sede', required=True, translate=True)
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    warehouse_ids = fields.Many2many(
        'stock.warehouse', 
        string='Almacenes Asociados',
        help="El stock disponible en estos almacenes se sumará para mostrarse como disponibilidad de esta sede."
    )
    description = fields.Text(string="Descripción / Dirección", help="Información extra para mostrar en el sitio web (ej. Dirección)")
