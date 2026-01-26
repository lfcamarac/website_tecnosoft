import logging
from odoo import models, fields
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

    def _clean_zombie_views(self):
        """
        Emergency cleanup method to delete views containing deprecated code.
        Uses raw SQL to bypass ORM filters (active_test, protections) and guarantees deletion.
        """
        _logger.info("STARTING COMPREHENSIVE ZOMBIE VIEW CLEANUP...")
        
        # Patterns to clean up (all legacy code that may be cached in DB)
        patterns = [
            '%request.path.startswith%',
            '%zenith_secondary_color%',
            '%zenith_body_font%',
            '%zenith_dark_mode_default%',
            '%tecnosoft%',
            '%Tecnosoft%',
        ]
        
        total_deleted = 0
        for pattern in patterns:
            try:
                query = f"DELETE FROM ir_ui_view WHERE arch_db LIKE %s AND type = 'qweb'"
                self.env.cr.execute(query, (pattern,))
                deleted = self.env.cr.rowcount
                total_deleted += deleted
                if deleted:
                    _logger.info(f"Cleaned {deleted} views matching: {pattern}")
            except Exception as e:
                _logger.error(f"Cleanup failed for pattern {pattern}: {e}")
        
        _logger.info(f"ZOMBIE VIEW CLEANUP COMPLETE. Total views deleted: {total_deleted}")
        
        # Also update website name if it contains Tecnosoft
        websites = self.search([('name', 'ilike', 'tecnosoft')])
        for ws in websites:
            ws.name = ws.name.replace('Tecnosoft', 'Zenith').replace('tecnosoft', 'zenith')
            _logger.info(f"Website name updated to: {ws.name}")
        
        return total_deleted


def _post_init_cleanup(env):
    """Called after module install/upgrade to clean zombie views."""
    env['website']._clean_zombie_views()
