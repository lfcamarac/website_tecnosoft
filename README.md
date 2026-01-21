# Tecnosoft eCommerce Theme for Odoo 18.0

Tema **Premium All-in-One** para Odoo 18.0 con características empresariales avanzadas: Multi-Sede, Búsqueda Inteligente, Filtros AJAX y más.

## 📁 Estructura del Proyecto

```text
.
├── website_tecnosoft/      # Módulo principal de Odoo
│   ├── controllers/        # main.py, main_branch.py (stock dinámico)
│   ├── models/             # product_brand, product_label, tecnosoft_branch
│   ├── static/             # JS (AJAX), SCSS (Premium), XML (Templates)
│   └── views/              # Headers, Snippets, Templates
└── README.md
```

## 🚀 Características Principales

### Navegación & Diseño
- **Header Zenith V1**: Compatible con editor de Odoo
- **Mega Menús Premium**: 3 tipos (Links, Categorías, Promo)
- **Footer Moderno**: Newsletter y redes sociales

### Multi-Sede & Stock Inteligente (Phase 4)
- **Sistema de Sedes**: Agrupa almacenes para mostrar disponibilidad
- **Stock Dinámico AJAX**: Actualización en tiempo real al cambiar variantes
- **Selector de Moneda Premium**: Diseño glassmorphism

### Búsqueda & Conversión (Phase 5)
- **Búsqueda Instantánea**: Con marca, categoría y precio
- **Sticky Add to Cart**: Sincronizado con variantes
- **Smart Product Cards**: Imagen hover, action bar premium

### Performance & UX (Phase 6)
- **Filtros AJAX**: Sin recarga, smooth scroll
- **Optimización**: Preconnect, lazy loading
- **URL State Management**: Navegación con pushState

## 🛠️ Instalación

1. Clonar en carpeta `addons` de Odoo
2. Actualizar lista de aplicaciones
3. Instalar `Tecnosoft Theme`
4. Configurar Sedes en Website > Configuración > Sedes

## ⚙️ Configuración

**Activar Header Zenith**: Editor > Personalizar > Seleccionar "Zenith Header V1"

**Configurar Multi-Sede**:
1. Website > Configuración > Sedes
2. Crear sede y asignar almacenes
3. Stock se muestra automáticamente

---
Desarrollado con **Antigravity** | Odoo 18.0
