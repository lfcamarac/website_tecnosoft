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

    tecnosoft_primary_color = fields.Char(string="Color Primario", default="#007bff", help="Deprecated: Use native Odoo theme colors.")
    # Dark Mode uses localStorage (client-side), no backend field needed.

    def _clean_zombie_views(self):
        """
        Emergency cleanup method to delete views containing the bad code:
        <t t-if="request.path.startswith('/shop')">
        This uses raw SQL to bypass ORM filters (active_test, protections) and guarantees deletion.
        """
        _logger.info("STARTING ZOMBIE VIEW CLEANUP (SQL NUCLEAR OPTION)...")
        
        # SQL Injection of the fix directly into DB
        # We look for the specific broken string 'request.path.startswith' which implies the incorrect attribute
        query = "DELETE FROM ir_ui_view WHERE arch_db LIKE '%request.path.startswith%' AND type = 'qweb'"
        
        try:
            self.env.cr.execute(query)
            _logger.info(f"SQL DELETE Executed. Rows affected: {self.env.cr.rowcount}")
        except Exception as e:
            _logger.error(f"SQL Cleanup Failed: {e}")
            
        # Verify if anything remains (Paranoia check)
        self.env.cr.execute("SELECT id, name FROM ir_ui_view WHERE arch_db LIKE '%request.path.startswith%'")
        rows = self.env.cr.fetchall()
        if rows:
             _logger.error(f"CRITICAL: Views still exist after delete! IDs: {rows}")
        else:
             _logger.info("VERIFICATION PASS: No faulty views found in database.")
        

