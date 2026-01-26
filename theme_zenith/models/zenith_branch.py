from odoo import models, fields

class ZenithBranch(models.Model):
    _name = 'zenith.branch'
    _description = 'Zenith Branch (Sede)'
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
    latitude = fields.Float(string='Latitud', digits=(10, 7))
    longitude = fields.Float(string='Longitud', digits=(10, 7))
