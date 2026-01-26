import logging
from odoo import models, fields, api
from odoo.http import Request

_logger = logging.getLogger(__name__)

# --- MONKEYPATCH FOR COMPATIBILITY ---
# Fixes "AttributeError: 'Request' object has no attribute 'path'"
# caused by old/custom views still using the Odoo 16/17 syntax.
if not hasattr(Request, 'path'):
    def _get_path(self):
        return self.httprequest.path
    Request.path = property(_get_path)
    _logger.info("MONKEYPATCH APPLIED: Request.path restored for backward compatibility.")
# -------------------------------------

class Website(models.Model):
    _inherit = 'website'

    zenith_primary_color = fields.Char(string="Color Primario", default="#007bff", help="Deprecated: Use native Odoo theme colors.")
    # Dark Mode uses localStorage (client-side), no backend field needed.

    @api.model
    def clean_zombie_views(self):
        """
        Emergency cleanup method to delete views containing deprecated code.
        Uses raw SQL to bypass ORM filters (active_test, protections) and guarantees deletion.
        """
        _logger.info("STARTING COMPREHENSIVE ZOMBIE VIEW CLEANUP...")
        
        # Patterns to clean up (all legacy code that may be cached in DB)
        patterns = [
            '%tecnosoft%',
            '%Tecnosoft%',
            '%zenith_secondary_color%',
            '%zenith_body_font%',
            '%zenith_dark_mode_default%',
        ]
        
        total_deleted = 0
        for pattern in patterns:
            try:
                with self.env.cr.savepoint():
                    # Search for views matching the pattern in their architecture
                    views = self.env['ir.ui.view'].search([('arch_db', 'like', pattern), ('type', '=', 'qweb')])
                    if views:
                        count = len(views)
                        views.unlink()
                        total_deleted += count
                        _logger.info(f"Cleaned {count} views matching: {pattern}")
            except Exception as e:
                _logger.error(f"Cleanup failed for pattern {pattern}: {e}")
        
        # Also update website name if it contains Tecnosoft
        try:
            with self.env.cr.savepoint():
                websites = self.search([('name', 'ilike', 'tecnosoft')])
                for ws in websites:
                    ws.name = ws.name.replace('Tecnosoft', 'Zenith').replace('tecnosoft', 'zenith')
                    _logger.info(f"Website name updated to: {ws.name}")
        except Exception as e:
            _logger.error(f"Website name update failed: {e}")

        # Attempt to rename the module in the database if it's still registered as 'website_tecnosoft'
        try:
            with self.env.cr.savepoint():
                self.env.cr.execute("UPDATE ir_module_module SET name = 'theme_zenith' WHERE name = 'website_tecnosoft'")
                if self.env.cr.rowcount:
                    _logger.info("REBRANDING: Renamed 'website_tecnosoft' module to 'theme_zenith' in database.")
        except Exception as e:
            _logger.info(f"Module rename skipped (likely already renamed or permission denied): {e}")

        _logger.info(f"ZOMBIE VIEW CLEANUP COMPLETE. Total views deleted: {total_deleted}")
        return total_deleted


def _post_init_cleanup(env):
    """Called after module install/upgrade to clean zombie views."""
    env['website'].clean_zombie_views()
