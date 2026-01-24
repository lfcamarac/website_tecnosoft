# Manual de Desarrollo Técnico: Tema eCommerce "Tecnosoft" (Odoo 18)

Este manual rige la arquitectura, el estilo y la lógica para el módulo `website_tecnosoft`. El objetivo es crear un tema que supere a competidores como Theme Prime en rendimiento, manteniendo la flexibilidad nativa de Odoo.

## 1. Arquitectura del Módulo y Estándares de Archivos

Para evitar conflictos en futuras migraciones y mantener el código limpio, se deben seguir estrictamente las guías de estructura de Odoo.

### Reglas de Estructura de Directorios

El módulo debe llamarse `website_tecnosoft` y seguir esta jerarquía:
- `website_tecnosoft/`
    - `__init__.py`
    - `__manifest__.py`          # Declaración de dependencias (website_sale) y assets
    - `controllers/`             # Lógica de rutas (Snippets dinámicos, Ajax)
    - `data/`                    # Datos maestros (Menús, páginas por defecto, imágenes)
        - `presets.xml`          # Pre-configuraciones de vistas
    - `static/`
        - `src/`
            - `img/`             # Imágenes optimizadas (WebP)
            - `js/`              # Lógica OWL y widgets públicos
            - `scss/`            # Estilos (Divididos en primary, secondary, bootstrap)
            - `xml/`             # Plantillas QWeb para componentes JS (OWL)
    - `views/`                   # Vistas XML (Plantillas y Snippets)
        - `layout.xml`           # Herencia del layout principal
        - `product_page.xml`     # Personalización de ficha de producto
        - `snippets/`            # Definición de bloques arrastrables
            - `dynamic_snippets.xml`

### Reglas del Manifiesto (__manifest__.py)

- **Dependencias**: Es obligatorio declarar `website` y `website_sale`. Si se usa funcionalidad de blog o foro, agregar `website_blog` o `website_forum`.
- **Assets Bundle**: Los recursos JS y SCSS deben inyectarse en el bundle `web.assets_frontend` para que carguen solo en el sitio web, no en el backend.

---

## 2. Reglas de Estilo y Diseño (SCSS & Bootstrap)

En Odoo 18, no se debe escribir CSS rígido. Se debe aprovechar el sistema de variables SCSS para que el usuario final pueda personalizar colores y fuentes desde el editor visual sin tocar código.

### Reglas de Variables y Paletas

- **Primary Variables**: Usa `primary_variables.scss` para redefinir las paletas de colores de Odoo (`$o-color-palettes`) y las fuentes. Esto conecta tu código con el selector de colores del editor visual.
- **Bootstrap Overrides**: Para modificar el espaciado de rejillas, bordes de botones o tipografía base, usa `bootstrap_overridden.scss`. Nunca modifiques Bootstrap directamente; usa sus variables (ej. `$h1-font-size`, `$btn-border-radius`).
- **Orden de Propiedades**: En los archivos SCSS, ordena las propiedades desde el exterior hacia el interior (Posición -> Modelo de caja -> Tipografía -> Decoración) para mantener la legibilidad.

### Reglas de Diseño Responsivo

- **Mobile-First**: Utiliza las clases de utilidad de Bootstrap 5. Diseña primero para móviles y usa breakpoints (md, lg) para pantallas grandes.
- **Fat Fingers**: Asegura que los botones y enlaces en la vista móvil tengan un área táctil mínima de 44x44px para mejorar la usabilidad.

---

## 3. Desarrollo de Snippets y Componentes (OWL)

Para que Tecnosoft sea un tema "Top", necesita componentes dinámicos (ej. carruseles de productos, filtros en tiempo real) construidos con OWL, el framework JS de Odoo.

### Reglas para Snippets Dinámicos

1. **Estructura XML**: Define el contenedor del snippet en `views/snippets/` y regístralo extendiendo `website.snippets`. Usa una miniatura clara (`t-thumbnail`).
2. **Controlador Python**: Crea un controlador con `type='json'` y `auth='public'` para extraer datos (productos, categorías) usando `search_read`. Nunca devuelvas objetos de registro completos, solo los campos necesarios (ID, nombre, precio, imagen) para minimizar el tráfico de red.
3. **Componente OWL (JS)**:
    - Usa `publicWidget.registry` para vincular el JS al selector CSS del snippet.
    - Usa `rpc` para llamar al controlador en el método `willStart` (asíncrono).
    - Renderiza la plantilla usando `renderToElement` para evitar recargas de página.

---

## 4. Reglas de eCommerce y Backend

El backend es el motor de Tecnosoft. El código debe ser seguro, atómico y eficiente.

### Reglas de Python y ORM

- **Atomicidad**: Prohibido usar `cr.commit()` manual. Deja que Odoo maneje la transacción. Si hay un error, el sistema debe hacer rollback automáticamente.
- **Seguridad**: No uses `sudo()` indiscriminadamente en los controladores. Si necesitas acceder a datos protegidos, asegúrate de que la lógica de negocio lo justifique y filtra los campos sensibles.
- **Nomenclatura**: Usa nombres descriptivos para los modelos y campos. Evita abreviaciones crípticas. Las clases deben usar PascalCase (`ProductTemplate`) y las variables snake_case (`product_ids`).

### Reglas de Herencia (Vistas)

- **XPath**: Para modificar vistas existentes (como la ficha del producto o el carrito), usa siempre xpath con `position="before"`, `after` o `inside`. Evita `replace` a menos que sea estrictamente necesario, ya que rompe la compatibilidad con otros módulos.
- **ID de Herencia**: Usa un ID único y descriptivo para tus vistas heredadas, por ejemplo: `view_product_public_category_form_inherit_tecnosoft`.

---

## 5. Reglas de Optimización y Rendimiento (Core Web Vitals)

Para competir con temas rápidos, Tecnosoft debe priorizar la velocidad de carga.

### Reglas de Imágenes y Recursos

- **Lazy Loading**: Todas las imágenes que no estén en la ventana gráfica inicial (above the fold) deben tener el atributo `loading="lazy"`. Esto es crítico para imágenes de productos en carruseles y grids.
- **Formatos Modernos**: Asegura que las imágenes subidas se sirvan en formato WebP. Odoo lo hace nativamente, pero verifica que tus snippets personalizados no rompan esta funcionalidad.
- **Precarga LCP**: Para la imagen principal (LCP - Largest Contentful Paint), como el banner principal, usa técnicas de precarga o fetch priority para mejorar el puntaje de PageSpeed.

### Reglas de Caché

- **Controladores**: Si un snippet dinámico muestra datos que no cambian frecuentemente (ej. categorías), implementa caché en el método del controlador Python o usa `t-cache` en la plantilla QWeb para reducir consultas a la base de datos.
