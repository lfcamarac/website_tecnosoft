from odoo import models, fields, api

class ProductSizeGuide(models.Model):
    _name = 'product.size.guide'
    _description = 'Product Size Guide Builder'

    name = fields.Char(string='Nombre de la Guía', required=True)
    content = fields.Html(string='Contenido de la Guía', help="Tabla o imagen con las medidas.")
    
class ProductCategory(models.Model):
    _inherit = 'product.public.category'
    
    size_guide_id = fields.Many2one('product.size.guide', string='Guía de Tallas Predeterminada')

class ProductTemplate(models.Model):
    _inherit = 'product.template'
    
    size_guide_id = fields.Many2one('product.size.guide', string='Guía de Tallas Específica')

    def get_size_guide(self):
        """ Returns the guide for the product or its category. """
        self.ensure_one()
        if self.size_guide_id:
            return self.size_guide_id
        if self.public_categ_ids and self.public_categ_ids[0].size_guide_id:
            return self.public_categ_ids[0].size_guide_id
        return False

    def get_frequently_bought_together(self):
        """ Returns products often bought with this one. 
            For now, we'll return products in the same category or manual accessories if empty.
        """
        self.ensure_one()
        # Custom logic could go here (analyzing pos.order or sale.order)
        # For the demo/v1, we use accessory_product_ids or same category top sellers
        products = self.accessory_product_ids[:3]
        if not products:
            products = self.env['product.template'].search([
                ('public_categ_ids', 'in', self.public_categ_ids.ids),
                ('id', '!=', self.id),
                ('website_published', '=', True)
            ], limit=3)
        return products
