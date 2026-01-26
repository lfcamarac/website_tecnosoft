# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class PriceTracker(models.Model):
    _name = 'website.price.tracker'
    _description = 'Website Price Drop Tracker'

    partner_id = fields.Many2one('res.partner', string='Customer', required=True, ondelete='cascade')
    product_id = fields.Many2one('product.template', string='Product', required=True, ondelete='cascade')
    target_price = fields.Float(string='Target Price', help="Price at which the customer wants to be notified")
    last_notified_price = fields.Float(string='Last Notified Price')
    active = fields.Boolean(default=True)

    _sql_constraints = [
        ('unique_subscription', 'unique(partner_id, product_id)', 'Ya estás suscrito a las alertas de este producto.')
    ]

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    def write(self, vals):
        res = super(ProductTemplate, self).write(vals)
        if 'list_price' in vals:
            self._check_price_drop(vals['list_price'])
        return res

    def _check_price_drop(self, new_price):
        for product in self:
            trackers = self.env['website.price.tracker'].search([
                ('product_id', '=', product.id),
                ('active', '=', True),
            ])
            for tracker in trackers:
                if new_price < (tracker.last_notified_price or 9999999):
                    tracker._notify_price_drop(new_price)
                    tracker.last_notified_price = new_price

class PriceTrackerSubscription(models.Model):
    _inherit = 'website.price.tracker'

    def _notify_price_drop(self, new_price):
        self.ensure_one()
        # In a real scenario, we would send an email here using a template
        # For this theme demo, we log it or prepare a notification
        template = self.env.ref('theme_zenith.email_template_price_drop', raise_if_not_found=False)
        if template:
            template.send_mail(self.id, force_send=True)
