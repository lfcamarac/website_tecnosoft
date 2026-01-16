# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from datetime import timedelta

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    review_reminder_sent = fields.Boolean(default=False)

    def _cron_send_review_reminders(self):
        """ Send review reminders 7 days after delivery (simplified for theme demo). """
        seven_days_ago = fields.Date.today() - timedelta(days=7)
        orders = self.search([
            ('state', '=', 'sale'),
            ('date_order', '&lt;=', seven_days_ago),
            ('review_reminder_sent', '=', False),
            ('website_id', '!=', False)
        ])
        
        template = self.env.ref('website_tecnosoft.email_template_review_reminder', raise_if_not_found=False)
        if template:
            for order in orders:
                template.send_mail(order.id, force_send=True)
                order.review_reminder_sent = True
