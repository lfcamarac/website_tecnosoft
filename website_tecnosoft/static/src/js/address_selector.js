/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import { renderToElement } from "@web/core/utils/render";

publicWidget.registry.TecnosoftAddressSelector = publicWidget.Widget.extend({
    selector: '.zenith-address-selector-widget',
    events: {
        'click .js_address_selector_toggle': '_onToggleClick',
        'click .js_select_address': '_onAddressSelect',
    },

    /**
     * @override
     */
    async start() {
        // this.$el.removeClass('d-none'); // REMOVED: Let XML classes control visibility
        this.$dropdown = this.$('.zenith-address-dropdown');
        this.$label = this.$('.js_current_address_label');
        this.$city = this.$('.js_current_city');
        
        await this._fetchAddresses();
        return this._super.apply(this, arguments);
    },

    /**
     * Fetch addresses from backend
     * @private
     */
    async _fetchAddresses() {
        try {
            const data = await rpc('/website_tecnosoft/get_user_addresses', {});
            this.addressData = data;
            this._renderDropdown();
            this._updateCurrentLabel();
        } catch (e) {
            console.error("Error fetching addresses:", e);
        }
    },

    /**
     * Render the dropdown content
     * @private
     */
    _renderDropdown() {
        if (!this.addressData || this.addressData.public) {
            // Public user: Show login prompt or generic message
            // Ideally we render a template, but for speed we construct small HTML or simple template
            // We can reuse a qweb template if we defined one, strictly JS for now.
             this.$dropdown.html(`
                <div class="p-3 text-center">
                    <p class="small text-muted mb-2">Inicia sesión para ver tus direcciones guardadas.</p>
                    <a href="/web/login" class="btn btn-primary btn-sm rounded-pill w-100">Iniciar Sesión</a>
                </div>
            `);
            return;
        }

        if (this.addressData.addresses.length === 0) {
             this.$dropdown.html(`
                <div class="p-3 text-center">
                    <p class="small text-muted mb-2">No tienes direcciones guardadas.</p>
                    <a href="/my/address" class="btn btn-outline-primary btn-sm rounded-pill w-100">Agregar Dirección</a>
                </div>
            `);
            return;
        }

        // Render list
        let html = '<ul class="list-group list-group-flush">';
        this.addressData.addresses.forEach(addr => {
            const isActive = addr.id === this.addressData.current_id;
            const icon = addr.type === 'delivery' ? 'fa-truck' : 'fa-home';
            html += `
                <li class="list-group-item list-group-item-action cursor-pointer js_select_address ${isActive ? 'active-address bg-light' : ''}" data-id="${addr.id}">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fa ${icon} ${isActive ? 'text-primary' : 'text-muted'}"></i>
                        <div class="lh-1">
                            <span class="d-block fw-bold text-dark" style="font-size: 0.85rem;">${addr.name}</span>
                            <span class="d-block text-muted small" style="font-size: 0.75rem;">${addr.full_address}</span>
                        </div>
                        ${isActive ? '<i class="fa fa-check text-primary ms-auto"></i>' : ''}
                    </div>
                </li>
            `;
        });
        html += '</ul>';
        html += `
            <div class="p-2 border-top bg-light">
                <a href="/my/address" class="btn btn-link btn-sm text-decoration-none w-100 text-primary fw-bold">
                    <i class="fa fa-plus-circle me-1"></i> Nueva Dirección
                </a>
            </div>
        `;
        
        this.$dropdown.html(html);
    },

    /**
     * Update the visible label in the header
     * @private
     */
    _updateCurrentLabel() {
        if (!this.addressData) return;

        if (this.addressData.public) {
            this.$city.text("Enviar a");
            return;
        }

        const current = this.addressData.addresses.find(a => a.id === this.addressData.current_id);
        if (current) {
            // Show City if available, else name
            this.$city.text("Enviar a:");
            this.$label.html(`${current.name} <i class="fa fa-chevron-down ms-1" style="font-size: 0.6rem;"></i>`);
        } else {
            this.$city.text("Enviar a");
            this.$label.html(`Seleccionar ubicación <i class="fa fa-chevron-down ms-1" style="font-size: 0.6rem;"></i>`);
        }
    },

    /**
     * Toggle dropdown visibility
     * @private
     */
    _onToggleClick(ev) {
        ev.stopPropagation();
        this.$dropdown.toggleClass('show');
        
        // Close on clicking outside
        $(document).one('click', () => {
             this.$dropdown.removeClass('show');
        });
        
        // Prevent closing when clicking inside dropdown
        this.$dropdown.on('click', (e) => e.stopPropagation());
    },

    /**
     * Handle address selection
     * @private
     */
    async _onAddressSelect(ev) {
        ev.preventDefault();
        const addrId = $(ev.currentTarget).data('id');
        
        try {
            await rpc('/website_tecnosoft/set_delivery_address', {
                address_id: addrId
            });
            // Update local state without reload if possible, but reload ensures Cart/Pricelist re-computation
            window.location.reload(); 
        } catch (e) {
            console.error("Error setting address", e);
        }
    }
});
