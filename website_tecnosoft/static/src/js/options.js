/** @odoo-module **/

import options from "@web_editor/js/editor/snippets.options";

options.registry.TecnosoftDynamicOptions = options.Class.extend({
    start() {
        this._super.apply(this, arguments);
        this.uiConfig = this._getUIConfig();
    },

    setLimit(value) {
        this.uiConfig.limit = parseInt(value);
        this._updateUIConfig();
    },

    setMode(value) {
        this.uiConfig.mode = value;
        this._updateUIConfig();
    },

    setAutoplay(value) {
        this.uiConfig.autoplay = value;
        this._updateUIConfig();
    },

    setArrows(value) {
        this.uiConfig.arrows = value;
        this._updateUIConfig();
    },

    setTabCategoryIds(value) {
        this.uiConfig.tab_category_ids = value;
        this._updateUIConfig();
    },

    _getUIConfig() {
        const configStr = this.$target[0].dataset.uiConfig || '{}';
        try {
            return JSON.parse(configStr);
        } catch (e) {
            return { limit: 4, mode: 'grid' };
        }
    },

    _updateUIConfig() {
        this.$target[0].dataset.uiConfig = JSON.stringify(this.uiConfig);
        this.$target.trigger('content_changed');
    },

    _computeWidgetState(methodName, params) {
        const config = this._getUIConfig();
        switch (methodName) {
            case 'setLimit': return config.limit || 4;
            case 'setMode': return config.mode || 'grid';
            case 'setAutoplay': return !!config.autoplay;
            case 'setArrows': return !!config.arrows;
            case 'setTabCategoryIds': return config.tab_category_ids || '';
        }
        return this._super(...arguments);
    },
});

options.registry.TecnosoftTimelineOptions = options.Class.extend({
    addItem() {
        const wrapper = this.$target[0].querySelector('.timeline-wrapper');
        const items = wrapper.querySelectorAll('.tecnosoft-timeline-item');
        if (items.length > 0) {
            const lastItem = items[items.length - 1];
            const newItem = lastItem.cloneNode(true);
            
            const firstCol = newItem.querySelector('.col-md-5:first-child');
            const lastCol = newItem.querySelector('.col-md-5:last-child');
            const isRightAligned = firstCol.innerHTML.includes('<!-- Empty side');
            
            if (isRightAligned) {
                firstCol.innerHTML = '<h4 class="fw-bold">Nuevo Hito</h4><p class="text-muted">Descripción del evento.</p>';
                firstCol.className = 'col-md-5 text-end pe-md-5';
                lastCol.innerHTML = '<!-- Empty side to keep line centered -->';
                lastCol.className = 'col-md-5 ps-md-5';
            } else {
                firstCol.innerHTML = '<!-- Empty side to keep line centered -->';
                firstCol.className = 'col-md-5 text-end pe-md-5';
                lastCol.innerHTML = '<h4 class="fw-bold">Nuevo Hito</h4><p class="text-muted">Descripción del evento.</p>';
                lastCol.className = 'col-md-5 ps-md-5';
            }
            wrapper.appendChild(newItem);
        }
    },
});

options.registry.TecnosoftTimelineItemOptions = options.Class.extend({
    removeItem() {
        this.$target[0].remove();
    },
});

options.registry.TecnosoftPricingOptions = options.Class.extend({
    addCard() {
        const container = this.$target[0].querySelector('.pricing-container');
        const cards = container.querySelectorAll('.tecnosoft-pricing-card');
        if (cards.length > 0) {
            const newCard = cards[0].cloneNode(true);
            const pricingCard = newCard.querySelector('.pricing-card');
            pricingCard.classList.remove('bg-primary', 'text-white', 'transform-scale-110');
            pricingCard.classList.add('bg-white', 'shadow-sm');
            
            const h2 = pricingCard.querySelector('.h2');
            if (h2) h2.classList.remove('text-white');
            pricingCard.querySelectorAll('.text-white').forEach(el => el.classList.remove('text-white'));
            
            const badge = pricingCard.querySelector('.badge');
            if (badge) badge.remove();
            
            container.appendChild(newCard);
        }
    },
});

options.registry.TecnosoftPricingCardOptions = options.Class.extend({
    togglePopular(previewMode, value) {
        const card = this.$target[0].querySelector('.pricing-card');
        if (value) {
            card.classList.add('bg-primary', 'text-white', 'transform-scale-110');
            card.classList.remove('bg-white', 'shadow-sm');
            const h2 = card.querySelector('.h2');
            if (h2) h2.classList.add('text-white');
            const displays = card.querySelectorAll('.display-4');
            displays.forEach(d => d.classList.add('text-white'));

            if (!card.querySelector('.badge')) {
                const badge = document.createElement('div');
                badge.className = 'position-absolute top-0 start-50 translate-middle badge rounded-pill bg-warning text-dark px-3 py-2';
                badge.style.marginTop = '-10px';
                badge.innerText = 'Más Popular';
                card.appendChild(badge);
            }
        } else {
            card.classList.remove('bg-primary', 'text-white', 'transform-scale-110');
            card.classList.add('bg-white', 'shadow-sm');
            const h2 = card.querySelector('.h2');
            if (h2) h2.classList.remove('text-white');
            const displays = card.querySelectorAll('.display-4');
            displays.forEach(d => d.classList.remove('text-white'));
            const badge = card.querySelector('.badge');
            if (badge) badge.remove();
        }
    },
});
