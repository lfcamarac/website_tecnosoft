---
trigger: always_on
---

3. Desarrollo de Snippets y Componentes (OWL)
Para que Tecnosoft sea un tema "Top", necesita componentes dinámicos (ej. carruseles de productos, filtros en tiempo real) construidos con OWL, el framework JS de Odoo.
Reglas para Snippets Dinámicos
1. Estructura XML: Define el contenedor del snippet en views/snippets/ y regístralo extendiendo website.snippets. Usa una miniatura clara (t-thumbnail).
2. Controlador Python: Crea un controlador con type='json' y auth='public' para extraer datos (productos, categorías) usando search_read. Nunca devuelvas objetos de registro completos, solo los campos necesarios (ID, nombre, precio, imagen) para minimizar el tráfico de red.
3. Componente OWL (JS):
    ◦ Usa publicWidget.registry para vincular el JS al selector CSS del snippet.
    ◦ Usa rpc para llamar al controlador en el método willStart (asíncrono).
    ◦ Renderiza la plantilla usando renderToElement para evitar recargas de página.
Ejemplo de Implementación (Snippet de Categorías)
/** @odoo-module */
import { renderToElement } from "@web/core/utils/render";
import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.TecnosoftCategory = publicWidget.Widget.extend({
    selector: '.tecnosoft_dynamic_category',
    async willStart() {
        // Llamada eficiente al backend
        this.data = await rpc('/tecnosoft/get_categories', {});
    },
    start() {
        // Renderizado reactivo con OWL
        this.$el.html(renderToElement('website_tecnosoft.category_template', {
            categories: this.data
        }));
    }
});

--------------------------------------------------------------------------------
4. Reglas de eCommerce y Backend
El backend es el motor de Tecnosoft. El código debe ser seguro, atómico y eficiente.
Reglas de Python y ORM
• Atomicidad: Prohibido usar cr.commit() manual. Deja que Odoo maneje la transacción. Si hay un error, el sistema debe hacer rollback automáticamente.
• Seguridad: No uses sudo() indiscriminadamente en los controladores. Si necesitas acceder a datos protegidos, asegúrate de que la lógica de negocio lo justifique y filtra los campos sensibles.
• Nomenclatura: Usa nombres descriptivos para los modelos y campos. Evita abreviaciones crípticas. Las clases deben usar PascalCase (ProductTemplate) y las variables snake_case (product_ids).
Reglas de Herencia (Vistas)
• XPath: Para modificar vistas existentes (como la ficha del producto o el carrito), usa siempre xpath con position="before", after o inside. Evita replace a menos que sea estrictamente necesario, ya que rompe la compatibilidad con otros módulos.
• ID de Herencia: Usa un ID único y descriptivo para tus vistas heredadas, por ejemplo: view_product_public_category_form_inherit_tecnosoft.

--------------------------------------------------------------------------------
5. Reglas de Optimización y Rendimiento (Core Web Vitals)
Para competir con temas rápidos, Tecnosoft debe priorizar la velocidad de carga.
Reglas de Imágenes y Recursos
• Lazy Loading: Todas las imágenes que no estén en la ventana gráfica inicial (above the fold) deben tener el atributo loading="lazy". Esto es crítico para imágenes de productos en carruseles y grids.
• Formatos Modernos: Asegura que las imágenes subidas se sirvan en formato WebP. Odoo lo hace nativamente, pero verifica que tus snippets personalizados no rompan esta funcionalidad.
• Precarga LCP: Para la imagen principal (LCP - Largest Contentful Paint), como el banner principal, usa técnicas de precarga o fetch priority para mejorar el puntaje de PageSpeed.
Reglas de Caché
• Controladores: Si un snippet dinámico muestra datos que no cambian frecuentemente (ej. categorías), implementa caché en el método del controlador Python o usa t-cache en la plantilla QWeb para reducir consultas a la base de datos.

--------------------------------------------------------------------------------
Resumen del Checklist para el Desarrollador
Antes de desplegar cualquier cambio en Tecnosoft, verifica:
1. ¿El módulo depende correctamente de website_sale en el manifiesto?
2. ¿Se están utilizando variables SCSS de Odoo (o-color) en lugar de colores hardcodeados?
3. ¿Los snippets dinámicos usan OWL y controladores JSON ligeros?
4. ¿Se está respetando la herencia XPath sin reemplazar bloques enteros innecesariamente?
5. ¿Las imágenes tienen atributos alt y loading="lazy"?
Siguiendo este manual, Tecnosoft será un tema robusto, rápido y fácil de mantener, alineado con la filosofía de desarrollo de Odoo 18.