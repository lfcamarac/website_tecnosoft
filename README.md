# Tecnosoft eCommerce Theme for Odoo 18.0

Este repositorio contiene el tema **Tecnosoft**, una solución de eCommerce de nivel "top" diseñada específicamente para Odoo 18.0. El tema está optimizado para ofrecer una experiencia visual premium, interactividad moderna con OWL y un rendimiento superior para entornos B2C y B2B.

## 📁 Estructura del Proyecto

```text
.
├── website_tecnosoft/      # Módulo principal de Odoo
│   ├── controllers/        # Controladores Python para datos dinámicos
│   ├── data/               # Datos maestros y configuración inicial
│   ├── doc/                # Documentación técnica y guías de tuning
│   ├── static/             # Recursos web (JS/OWL, SCSS, XML, Imágenes)
│   └── views/              # Plantillas QWeb y vistas del sitio
└── README.md               # Este archivo
```

## 🚀 Características Principales

- **Diseño Premium**: Interfaz moderna basada en Bootstrap 5 con tipografía cuidada (Inter & Outfit).
- **Snippets Dinámicos**: Bloques de construcción inteligentes que utilizan **OWL (Odoo Web Library)** para renderizado en tiempo real.
- **Optimización SEO**: Integración nativa de datos estructurados de **Schema.org** y configuración avanzada de `robots.txt`.
- **Modo B2B**: Soporte para ocultación de precios a visitantes públicos y portales corporativos.
- **Rendimiento**: Carga diferida (Lazy Loading) y soporte automático para formato WebP.

## 🛠️ Instalación

1. Clona este repositorio en tu carpeta de `addons` personalizada.
2. Actualiza la lista de aplicaciones en tu instancia de Odoo 18.
3. Busca el módulo `Tecnosoft Theme` (website_tecnosoft) e instálalo.
4. Selecciona el tema desde el editor del Sitio Web.

## ⚙️ Configuración del Servidor

Para maximizar el rendimiento del tema, se recomienda configurar el archivo `odoo.conf` siguiendo nuestra [Guía de Tuning](website_tecnosoft/doc/server_tuning.md).

---
Desarrollado para la integración con **Antigravity**.
