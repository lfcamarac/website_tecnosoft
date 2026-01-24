/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";
import Widget from "@web/legacy/js/core/widget";
import { renderToElement } from "@web/core/utils/render";

publicWidget.registry.TecnosoftDynamicSnippet = Widget.extend({
    selector: '.s_tecnosoft_dynamic',

    /**
     * @override
     */
    async start() {
        this._syncZenithStyle();
        const container = this.el.querySelector('.tecnosoft_dynamic_container');
        if (!container) return;

        // Theme Prime pattern: Read JSON config
        let uiConfig = {};
        if (this.el.dataset.uiConfig) {
            try {
                uiConfig = JSON.parse(this.el.dataset.uiConfig);
            } catch (e) {
                console.error("Tecnosoft: Invalid UI Config JSON", e);
            }
        }

        uiConfig.limit = uiConfig.limit || 4; // Ensure limit is set in uiConfig

        if (this.$target.hasClass('s_tecnosoft_tabs')) {
            await this._initTabs(container, uiConfig);
        } else {
            await this._renderProducts(container, uiConfig);
        }

        return this._super.apply(this, arguments);
    },

    /**
     * Render products based on current config
     */
    async _renderProducts(container, config, domain = []) {
        try {
            const data = await rpc('/website_tecnosoft/get_products_data', {
                limit: config.limit || 4,
                domain: domain,
                options: config
            });
            const products = data.products;

            if (products && products.length > 0) {
                const element = renderToElement('website_tecnosoft.DynamicProductList', {
                    products: products,
                    mode: config.mode || 'grid',
                });
                container.innerHTML = '';
                container.appendChild(element);

                if (config.mode === 'slider') {
                    this._initSlider(container, config);
                }
            } else {
                container.innerHTML = '<div class="col-12 text-muted p-4">No se encontraron productos en esta categoría.</div>';
            }
        } catch (error) {
            console.error("Tecnosoft Snippet Error:", error);
            container.innerHTML = '<div class="col-12 text-danger">Error al cargar productos.</div>';
        }
    },

    /**
     * Initialize Category Tabs
     */
    async _initTabs(container, config) {
        const header = this.$target[0].querySelector('.tecnosoft_tabs_header');
        const ids = config.tab_category_ids ? config.tab_category_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
        
        if (ids.length === 0) {
            if (header) {
                header.innerHTML = '<div class="alert alert-info">Configura los IDs de las categorías en las opciones del snippet.</div>';
            }
            container.innerHTML = '<div class="col-12 text-muted p-4">No se encontraron categorías configuradas.</div>';
            return;
        }

        try {
            const categories = await rpc('/website_tecnosoft/get_categories_info', { category_ids: ids });
            if (categories.length > 0) {
                // Render tabs
                if (header) {
                    header.innerHTML = `
                        <ul class="nav nav-pills justify-content-center gap-2 mb-4">
                            ${categories.map((cat, idx) => `
                                <li class="nav-item">
                                    <a class="nav-link rounded-pill px-4 fw-bold ${idx === 0 ? 'active' : ''}" 
                                       href="#" data-category-id="${cat.id}">
                                        ${cat.name}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                }

                // Handle clicks
                const links = header ? header.querySelectorAll('.nav-link') : [];
                links.forEach(link => {
                    link.addEventListener('click', async (ev) => {
                        ev.preventDefault();
                        links.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                        
                        const catId = parseInt(link.dataset.categoryId);
                        const dynamicContainer = this.$target[0].querySelector('.tecnosoft_dynamic_container');
                        if (dynamicContainer) {
                            dynamicContainer.innerHTML = '<div class="col-12 text-center p-5"><div class="spinner-border text-primary"></div></div>';
                            await this._renderProducts(dynamicContainer, config, [['public_categ_ids', 'child_of', catId]]);
                        }
                    });
                });

                // Initial render for first category
                const firstCatId = categories[0].id;
                await this._renderProducts(container, config, [['public_categ_ids', 'child_of', firstCatId]]);
            } else {
                if (header) {
                    header.innerHTML = '<div class="alert alert-warning">No se encontraron categorías con los IDs proporcionados.</div>';
                }
                container.innerHTML = '<div class="col-12 text-muted p-4">No se encontraron productos en esta categoría.</div>';
            }
        } catch (error) {
            console.error("Tabs Init Error:", error);
            if (header) {
                header.innerHTML = '<div class="col-12 text-danger">Error al cargar las categorías.</div>';
            }
            container.innerHTML = '<div class="col-12 text-danger">Error al cargar productos.</div>';
        }
    },

    /**
     * Initialize simple scroll-snap slider
     */
    _initSlider(container, config) {
        const wrapper = container.querySelector('.tecnosoft-slider-wrapper');
        if (!wrapper) return;

        // Autoplay logic
        if (config.autoplay) {
            let direction = 1;
            const scrollInterval = setInterval(() => {
                if (!document.contains(wrapper)) {
                    clearInterval(scrollInterval);
                    return;
                }
                const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
                if (wrapper.scrollLeft >= maxScroll - 10) {
                    wrapper.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    wrapper.scrollBy({ left: 300, behavior: 'smooth' });
                }
            }, 5000);
        }

        // Arrows logic
        if (config.arrows) {
            // We expect buttons to be rendered in the template
            const btnPrev = container.querySelector('.slider-prev');
            const btnNext = container.querySelector('.slider-next');
            if (btnPrev && btnNext) {
                btnPrev.addEventListener('click', () => wrapper.scrollBy({ left: -300, behavior: 'smooth' }));
                btnNext.addEventListener('click', () => wrapper.scrollBy({ left: 300, behavior: 'smooth' }));
            }
        }
    },

    /**
     * @private
     */
    _syncZenithStyle() {
        // Find if a configurator snippet exists
        const $configurator = $('.s_tecnosoft_configurator');
        if ($configurator.length) {
            const style = $configurator.data('zenithStyle') || 'moderno';
            const primaryColor = $configurator.data('zenithPrimaryColor');
            
            this._applyZenithStyle(style);
            if (primaryColor) {
                this._applyZenithColor(primaryColor);
            }
        }
    },

    /**
     * @private
     */
    _applyZenithStyle(style) {
        const bodyClasses = document.body.className.split(' ').filter(c => !c.startsWith('zenith-style-'));
        document.body.className = bodyClasses.join(' ') + ' zenith-style-' + style;
    },

    /**
     * @private
     */
    _applyZenithColor(color) {
        document.documentElement.style.setProperty('--zenith-primary', color);
    },

    /**
     * @private
     */
    _onZenithStyleChanged(ev, style) {
        this._applyZenithStyle(style);
    },

    /**
     * @private
     */
    _onZenithColorChanged(ev, color) {
        this._applyZenithColor(color);
    },
});

publicWidget.registry.TecnosoftHeroHotspots = Widget.extend({
    selector: '.s_tecnosoft_hero',

    /**
     * @override
     */
    async start() {
        const hotspots = this.el.querySelectorAll('.tecnosoft_hotspot');
        hotspots.forEach(hotspot => {
            this._initHotspot(hotspot);
        });
        return this._super.apply(this, arguments);
    },

    /**
     * @private
     */
    _initHotspot(hotspot) {
        const productId = hotspot.dataset.productId;
        if (!productId) return;

        // Use Bootstrap Popover if available
        if (window.bootstrap && window.bootstrap.Popover) {
            new window.bootstrap.Popover(hotspot, {
                container: 'body',
                trigger: 'hover',
                html: true,
                placement: 'top',
                customClass: 'tecnosoft-hotspot-popover',
                content: () => this._fetchHotspotContent(productId)
            });
        }
    },

    /**
     * @private
     */
    async _fetchHotspotContent(productId) {
        try {
            const data = await rpc('/website_tecnosoft/get_products_data', {
                domain: [['id', '=', parseInt(productId)]],
                limit: 1
            });
            const product = data.products[0];
            if (product) {
                return `
                    <div class="hotspot-preview d-flex flex-column">
                        <div class="preview-img">
                            <img src="${product.image_url}" alt="${product.name}"/>
                        </div>
                        <div class="preview-info">
                            <h6>${product.name}</h6>
                            <div class="price">${product.price_formatted}</div>
                            <a href="${product.url}" class="btn btn-primary btn-sm w-100 mt-2">Ver Detalles</a>
                        </div>
                    </div>
                `;
            }
        } catch (e) {
            console.error("Hotspot fetch error", e);
        }
        return '<div class="p-2">Error al cargar producto</div>';
    }
});

export default {
    TecnosoftDynamicSnippet: publicWidget.registry.TecnosoftDynamicSnippet,
    TecnosoftHeroHotspots: publicWidget.registry.TecnosoftHeroHotspots,
};
