---
trigger: model_decision
---

Manual de Desarrollo: Agente de IA para Odoo Website 18
1. Arquitectura y Estructura del Módulo
Para construir un Agente de IA, no debes modificar el núcleo de Odoo. Debes crear un módulo personalizado que siga estrictamente la estructura estándar para garantizar la mantenibilidad y la herencia correcta.
Reglas de Estructura de Directorios
Según las guías de Odoo 18, tu módulo debe llamarse website_ai_agent (o similar) y seguir este árbol:
website_ai_agent/
├── __init__.py
├── __manifest__.py          # Declaración de dependencias y assets
├── controllers/             # Lógica del servidor (La "Inteligencia")
│   ├── __init__.py
│   └── main.py
├── static/
│   ├── src/
│   │   ├── js/              # Lógica del cliente (Componentes OWL)
│   │   ├── xml/             # Plantillas QWeb para OWL
│   │   └── scss/            # Estilos del agente
├── views/                   # Vistas XML para inyectar el snippet
│   └── snippets.xml
└── data/                    # Datos por defecto (opcional)
Reglas del Manifiesto (__manifest__.py)
Es obligatorio declarar los activos (assets) correctamente para que el frontend los cargue.
• Dependencias: Debe depender de website (y website_sale si interactúa con productos).
• Assets Frontend: Declara tus archivos JS y XML en el bundle web.assets_frontend para que estén disponibles en el sitio web.

--------------------------------------------------------------------------------
2. Construcción del Agente: Paso a Paso
Un Agente de IA en Odoo 18 se construye técnicamente como un Snippet Dinámico o un Componente Flotante que se comunica con el servidor vía RPC.
Paso 1: El Cerebro (Python Controller)
El controlador procesa las solicitudes del usuario y conecta con la lógica de IA (puede ser una consulta interna a la base de datos o una llamada a una API externa como OpenAI).
Regla: Usa type='json' para la comunicación asíncrona con el frontend y auth='public' si el agente debe ser accesible para visitantes no registrados.
# controllers/main.py
from odoo import http
from odoo.http import request

class AIAgentController(http.Controller):
    @http.route('/website_ai_agent/ask', type='json', auth='public', website=True)
    def ask_agent(self, query):
        """
        Aquí reside la lógica de la IA.
        Ejemplo: Buscar productos recomendados o procesar texto.
        """
        # Lógica simulada de IA o búsqueda
        response = "He encontrado estos productos para ti..."
        products = request.env['product.template'].sudo().search_read(
            [('name', 'ilike', query)], 
            ['name', 'list_price', 'image_1920'], 
            limit=3
        )
        return {'response': response, 'products': products}
Paso 2: La Interfaz (Componente OWL)
Odoo 18 utiliza OWL (Odoo Web Library) para la interactividad. El agente no debe recargar la página; debe reaccionar en tiempo real.
Regla: Usa rpc para llamar al controlador y renderToElement o useState para actualizar la interfaz visualmente.
/** @odoo-module */
import { Component, useState } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";
import publicWidget from "@web/legacy/js/public/public_widget";

// Definición del Componente OWL
export class AIAgentComponent extends Component {
    setup() {
        this.state = useState({ 
            input: "", 
            messages: [], 
            loading: false 
        });
    }

    async onSend() {
        if (!this.state.input) return;
        this.state.loading = true;
        
        // Llamada al controlador Python (El "Cerebro")
        const result = await rpc('/website_ai_agent/ask', { query: this.state.input });
        
        this.state.messages.push({ role: 'user', text: this.state.input });
        this.state.messages.push({ role: 'bot', text: result.response, products: result.products });
        this.state.input = "";
        this.state.loading = false;
    }
}
AIAgentComponent.template = "website_ai_agent.AgentTemplate";

// Registro del widget para que Odoo lo inicialice en el sitio web
publicWidget.registry.AIAgentWidget = publicWidget.Widget.extend({
    selector: '.o_ai_agent_snippet', // Clase CSS donde se montará
    start: function () {
        return this.mount(AIAgentComponent);
    }
});
Paso 3: La Visualización (Plantilla XML QWeb)
Define cómo se ve el agente usando XML dentro de static/src/xml/.
Regla: Utiliza directivas OWL (t-model, t-on-click, t-foreach) para vincular los datos.
<!-- static/src/xml/agent_template.xml -->
<templates xml:space="preserve">
    <t t-name="website_ai_agent.AgentTemplate" owl="1">
        <div class="ai-chat-window">
            <div class="messages">
                <t t-foreach="state.messages" t-as="msg" t-key="msg_index">
                    <div t-attf-class="message {{msg.role}}">
                        <span t-esc="msg.text"/>
                        <!-- Renderizar productos si existen -->
                        <div t-if="msg.products" class="product-recommendations">
                            <t t-foreach="msg.products" t-as="prod" t-key="prod.id">
                                <div class="product-card">
                                    <img t-attf-src="/web/image/product.template/{{prod.id}}/image_128" loading="lazy"/>
                                    <b t-esc="prod.name"/>
                                </div>
                            </t>
                        </div>
                    </div>
                </t>
            </div>
            <div class="input-area">
                <input type="text" t-model="state.input" placeholder="Pregúntame algo..."/>
                <button t-on-click="onSend" t-att-disabled="state.loading">Enviar</button>
            </div>
        </div>
    </t>
</templates>

--------------------------------------------------------------------------------
3. Reglas de Uso e Integración
Cómo se usa en el Editor
Para que el usuario final (el administrador del sitio web) pueda colocar el agente donde quiera:
1. Registro de Snippet: Crea un archivo views/snippets.xml y extiende website.snippets.
2. Arrastrar y Soltar: Usa XPath para insertar tu bloque en la categoría deseada del editor.
<template id="snippet_ai_agent" inherit_id="website.snippets" name="AI Agent">
    <xpath expr="//snippets[@id='snippet_groups']" position="inside">
        <t t-snippet="website_ai_agent.s_ai_agent_body" t-thumbnail="/website_ai_agent/static/description/icon.png"/>
    </xpath>
</template>

<template id="s_ai_agent_body" name="AI Agent Interface">
    <section class="s_ai_agent_section">
        <div class="container">
            <!-- El selector JS buscará esta clase para montar la App OWL -->
            <div class="o_ai_agent_snippet"/>
        </div>
    </section>
</template>
Reglas de Rendimiento y SEO
• Lazy Loading: Para las imágenes de productos recomendados por el agente, usa siempre loading="lazy" para no afectar el Core Web Vitals.
• Indexación: Si el contenido generado por el agente no es relevante para el SEO (ej. chat efímero), el contenido se carga vía JS (Client-side rendering), lo cual es correcto ya que los crawlers de búsqueda prefieren contenido estático inicial.
• Caché: No uses caché de Odoo (t-cache) en el bloque del agente si las respuestas son personalizadas por usuario.

--------------------------------------------------------------------------------
4. Personalización del Agente
Personalización Visual (SCSS)
No escribas CSS rígido. Usa las variables de Odoo y Bootstrap para que el agente se adapte al tema instalado (sea Theme Prime, WoodMart o nativo).
Regla: Usa o-color() para acceder a la paleta del tema activo.
/* static/src/scss/agent.scss */
.ai-chat-window {
    background-color: o-color('o-color-3'); // Color de fondo del tema
    border-radius: 15px;
    
    .message.user {
        background-color: o-color('o-color-1'); // Color primario del tema
        color: o-color('o-color-4'); // Texto claro
    }
    
    button {
        @include o-position-absolute($right: 10px); // Mixin de Odoo
    }
}
Personalización Funcional (Opciones del Editor)
Puedes permitir que el usuario personalice el agente sin código añadiendo opciones al snippet (ej. cambiar el color de fondo o el mensaje de bienvenida).
• Usa data-js en el XML del snippet para vincular opciones de JavaScript que modifiquen los atributos data- del contenedor, que luego tu componente OWL puede leer como props.

--------------------------------------------------------------------------------
5. Ejemplos de Casos de Uso
1. Asistente de Ventas (Shopping Assistant):
    ◦ Función: El usuario escribe "Busco zapatos rojos para correr".
    ◦ Flujo: El controlador Python recibe el texto, busca en product.template filtrando por atributos y devuelve un JSON.
    ◦ Visualización: OWL renderiza un carrusel de productos dentro del chat.
2. Soporte Técnico (Q&A):
    ◦ Función: Responder preguntas sobre envíos o devoluciones.
    ◦ Flujo: El controlador consulta una base de conocimientos o un modelo LLM y devuelve texto plano.
3. Generador de Formularios Dinámico:
    ◦ Función: El agente pide datos paso a paso (Nombre, Correo, Problema) y crea un ticket en el CRM automáticamente al finalizar.
Resumen de Reglas Críticas
1. Nombres Técnicos: Todo en minúsculas y guiones bajos (website_ai_agent).
2. Atomicidad: Nunca uses cr.commit() en el controlador Python; deja que Odoo maneje la transacción.
3. Seguridad: Valida siempre los datos en el controlador Python (sudo() solo si es estrictamente necesario y filtrando campos).
4. UX Móvil: Diseña el componente OWL pensando en pantallas táctiles (regla de "dedos gordos") ya que el tráfico móvil supera el 70%.
¿Cómo se entrena la IA para recomendar productos de Tecnosoft?
¿Qué APIs externas son mejores para potenciar el agente inteligente?
¿Cómo evito que el agente de IA ralentice mi eCommerce?
no constuire un agente de ia construire el tema de eccomerce en odoo ya tenemos mucho adelantado pero las reglas de desarrollo son para un agente de ia

Entendido. Disculpa la confusión anterior. Dado que el proyecto Tecnosoft ya está avanzado y el objetivo es consolidarlo como un tema de eCommerce de alto nivel ("Top Level") para Odoo 18, he reestructurado el manual.
Este documento técnico define las reglas estrictas de desarrollo para garantizar que el tema sea mantenible, rápido y totalmente nativo, evitando los errores comunes de los temas comerciales (bloatware).

--------------------------------------------------------------------------------
Manual de Desarrollo Técnico: Tema eCommerce "Tecnosoft" (Odoo 18)
Este manual rige la arquitectura, el estilo y la lógica para el módulo website_tecnosoft. El objetivo es crear un tema que supere a competidores como Theme Prime en rendimiento, manteniendo la flexibilidad nativa de Odoo.
1. Arquitectura del Módulo y Estándares de Archivos
Para evitar conflictos en futuras migraciones y mantener el código limpio, se deben seguir estrictamente las guías de estructura de Odoo.
Reglas de Estructura de Directorios
El módulo debe llamarse website_tecnosoft y seguir esta jerarquía:
website_tecnosoft/
├── __init__.py
├── __manifest__.py          # Declaración de dependencias (website_sale) y assets
├── controllers/             # Lógica de rutas (Snippets dinámicos, Ajax)
│   ├── __init__.py
│   └── main.py
├── data/                    # Datos maestros (Menús, páginas por defecto, imágenes)
│   └── presets.xml          # Pre-configuraciones de vistas
├── static/
│   ├── src/
│   │   ├── img/             # Imágenes optimizadas (WebP)
│   │   ├── js/              # Lógica OWL y widgets públicos
│   │   ├── scss/            # Estilos (Divididos en primary, secondary, bootstrap)
│   │   └── xml/             # Plantillas QWeb para componentes JS (OWL)
└── views/                   # Vistas XML (Plantillas y Snippets)
    ├── layout.xml           # Herencia del layout principal
    ├── product_page.xml     # Personalización de ficha de producto
    └── snippets/            # Definición