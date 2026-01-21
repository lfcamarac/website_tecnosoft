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
