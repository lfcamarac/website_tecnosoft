# -*- coding: utf-8 -*-
from odoo import models, fields, api


class WebsiteShoppingList(models.Model):
    _name = 'website.shopping.list'
    _description = 'Shopping List for Recurring Purchases'
    _order = 'create_date desc'
    
    name = fields.Char(string='Nombre de la Lista', required=True, default='Mi Lista')
    icon = fields.Char(string='Icono (Font Awesome)', default='fa-list', 
                       help='Clase de Font Awesome sin el prefijo fa, ej: fa-shopping-basket')
    partner_id = fields.Many2one('res.partner', string='Cliente', required=True, 
                                  ondelete='cascade', index=True)
    line_ids = fields.One2many('website.shopping.list.line', 'list_id', string='Productos')
    product_count = fields.Integer(string='Productos', compute='_compute_product_count')
    active = fields.Boolean(default=True)
    
    # Predefined icons for easy selection
    ICON_SELECTION = [
        ('fa-shopping-basket', '🛒 Compra Semanal'),
        ('fa-home', '🏠 Hogar'),
        ('fa-cutlery', '🍴 Cocina'),
        ('fa-heart', '❤️ Favoritos'),
        ('fa-briefcase', '💼 Oficina'),
        ('fa-medkit', '💊 Salud'),
        ('fa-paw', '🐾 Mascotas'),
        ('fa-child', '👶 Bebé'),
        ('fa-gift', '🎁 Regalos'),
        ('fa-star', '⭐ Especial'),
    ]
    
    @api.depends('line_ids')
    def _compute_product_count(self):
        for record in self:
            record.product_count = len(record.line_ids)
    
    def action_add_all_to_cart(self):
        """Add all products in this list to the current cart."""
        self.ensure_one()
        sale_order = self.env['website'].get_current_website().sale_get_order(force_create=True)
        for line in self.line_ids:
            sale_order._cart_update(
                product_id=line.product_id.id,
                add_qty=line.quantity,
            )
        return True


class WebsiteShoppingListLine(models.Model):
    _name = 'website.shopping.list.line'
    _description = 'Shopping List Line'
    
    list_id = fields.Many2one('website.shopping.list', string='Lista', 
                               required=True, ondelete='cascade', index=True)
    product_id = fields.Many2one('product.product', string='Producto', 
                                  required=True, ondelete='cascade')
    quantity = fields.Float(string='Cantidad', default=1.0)
    
    # Related fields for display
    product_name = fields.Char(related='product_id.name', string='Nombre')
    product_image = fields.Binary(related='product_id.image_128', string='Imagen')
    product_price = fields.Float(related='product_id.lst_price', string='Precio')
    
    _sql_constraints = [
        ('product_list_unique', 'UNIQUE(list_id, product_id)', 
         'El producto ya existe en esta lista. Modifica la cantidad en lugar de agregarlo de nuevo.')
    ]
