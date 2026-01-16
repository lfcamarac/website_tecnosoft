{
    'name': 'Tecnosoft Theme',
    'description': 'Advanced eCommerce theme for Tecnosoft.',
    'category': 'Theme/eCommerce',
    'version': '1.0',
    'depends': ['website', 'website_sale'],
    'data': [
        'views/theme_templates.xml',
        'views/snippets.xml',
        'views/website_views.xml',
        'views/sales_triggers.xml',
        'views/popups.xml',
        'views/price_tracker.xml',
        'views/portal_templates.xml',
        'views/marketing_automation.xml',
        'views/performance_seo.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'website_tecnosoft/static/src/scss/primary_variables.scss',
            'website_tecnosoft/static/src/scss/bootstrap_overridden.scss',
            'website_tecnosoft/static/src/scss/ecommerce.scss',
            'website_tecnosoft/static/src/js/dynamic_snippets.js',
            'website_tecnosoft/static/src/js/sales_triggers.js',
            'website_tecnosoft/static/src/js/popups.js',
            'website_tecnosoft/static/src/js/price_tracker.js',
        ],
        'web.assets_qweb': [
            'website_tecnosoft/static/src/xml/dynamic_snippets.xml',
        ],
    },
    'images': [
        'static/description/tecnosoft_screenshot.png',
    ],
    'license': 'LGPL-3',
}
