/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.TecnosoftStoreLocator = publicWidget.Widget.extend({
    selector: '.s_tecnosoft_store_locator',
    
    /**
     * @override
     */
    async start() {
        this.$mapContainer = this.$('#tecnosoft_osm_map');
        this.$listContainer = this.$('#tecnosoft_store_list');
        
        if (this.$mapContainer.length) {
            await this._initLocator();
        }
        return this._super ? this._super(...arguments) : Promise.resolve();
    },

    /**
     * @private
     */
    async _initLocator() {
        try {
            const data = await rpc('/website_tecnosoft/get_branches_locations');
            if (data && data.branches && data.branches.length > 0) {
                this.branches = data.branches;
                this._renderMap();
                this._renderList();
            } else {
                this.$listContainer.html('<div class="p-4 text-center text-muted">No hay sedes disponibles.</div>');
            }
        } catch (e) {
            console.error("Error loading branches", e);
        }
    },

    /**
     * @private
     */
    _renderMap() {
        // Initial view centered on the first branch or a default location
        const first = this.branches[0];
        this.map = L.map('tecnosoft_osm_map').setView([first.lat || 10.4806, first.lng || -66.9036], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        this.markers = [];
        this.branches.forEach(branch => {
            if (branch.lat && branch.lng) {
                const marker = L.marker([branch.lat, branch.lng]).addTo(this.map);
                marker.bindPopup(`<b>${branch.name}</b><br>${branch.desc}`);
                this.markers.push({ id: branch.id, marker: marker });
            }
        });
    },

    /**
     * @private
     */
    _renderList() {
        this.$listContainer.empty();
        this.branches.forEach(branch => {
            const $item = $(`
                <button class="list-group-item list-group-item-action p-4 border-bottom-0" data-id="${branch.id}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="fw-bold mb-1">${branch.name}</h6>
                            <p class="small text-muted mb-0">${branch.street || 'Ver dirección'}</p>
                        </div>
                        <i class="fa fa-chevron-right text-light"></i>
                    </div>
                </button>
            `);
            
            $item.on('click', () => this._focusBranch(branch));
            this.$listContainer.append($item);
        });
    },

    /**
     * @private
     */
    _focusBranch(branch) {
        if (branch.lat && branch.lng) {
            this.map.flyTo([branch.lat, branch.lng], 15);
            const entry = this.markers.find(m => m.id === branch.id);
            if (entry) {
                entry.marker.openPopup();
            }
            
            // UI Feedback
            this.$listContainer.find('.list-group-item').removeClass('active bg-light border-primary');
            this.$listContainer.find(`[data-id="${branch.id}"]`).addClass('active bg-light border-primary');
        }
    },
});

export default publicWidget.registry.TecnosoftStoreLocator;
