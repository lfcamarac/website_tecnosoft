/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, useState, onWillStart, onMounted } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { _t } from "@web/core/l10n/translation";

// Dynamic import for WebLLM to avoid build issues if strictly validated
// We will use the CDN version compatible with browser modules
const WEB_LLM_URL = "https://esm.run/@mlc-ai/web-llm";

class AIGeneratorDialog extends Component {
    setup() {
        this.state = useState({
            status: 'idle', // idle, loading, generating, success, error
            progress: 0,
            progressText: '',
            result: '',
            modelId: 'Gemma-2b-it-q4f32_1-1k', // Lightweight model
        });
        
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.engine = null;
        
        onMounted(async () => {
            await this.loadEngine();
        });
    }

    async loadEngine() {
        try {
            this.state.status = 'loading';
            this.state.progressText = _t("Initializing AI Core... (This may take a moment)");
            
            // Dynamically import WebLLM
            const { CreateMLCEngine } = await import(WEB_LLM_URL);
            
            this.engine = await CreateMLCEngine(
                this.state.modelId,
                { 
                    initProgressCallback: (report) => {
                        this.state.progress = report.progress * 100;
                        this.state.progressText = report.text;
                    }
                }
            );
            
            this.state.status = 'idle';
            this.state.progressText = _t("AI Ready. Click Generate to start.");
        } catch (error) {
            console.error("AI Error:", error);
            this.state.status = 'error';
            this.state.progressText = _t("Failed to load AI model. Check your GPU/Browser support.");
        }
    }

    async generate() {
        if (!this.engine) return;
        
        try {
            this.state.status = 'generating';
            this.state.result = '';
            
            const product = this.props.product;
            const prompt = `
                You are an expert SEO copywriter. Write a compelling, SEO-optimized product description for an eCommerce store.
                
                Product Name: ${product.name}
                Category: ${product.categ_id[1]}
                Price: ${product.list_price}
                
                Keep it under 150 words. Focus on benefits and features. Use HTML formatting (<b>, <ul>, <li>) for readability.
                Do not include the product name in the title, just the description body.
            `;

            const chunks = await this.engine.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                stream: true,
            });

            for await (const chunk of chunks) {
                const content = chunk.choices[0]?.delta?.content || "";
                this.state.result += content;
            }

            this.state.status = 'success';
        } catch (error) {
            console.error("Generation Error:", error);
            this.state.status = 'error';
            this.state.progressText = _t("Error generating content.");
        }
    }

    async apply() {
        try {
            await this.orm.write("product.template", [this.props.product.id], {
                description_sale: this.state.result, // Updating the Sales Description
                website_description: this.state.result, // Updating eCommerce Description
            });
            
            this.notification.add(_t("Product description updated successfully!"), {
                type: "success",
            });
            
            this.props.close();
            // detailed reload might be needed for the view to update
            window.location.reload(); 
        } catch (error) {
            this.notification.add(_t("Failed to save description."), {
                type: "danger",
            });
        }
    }
}

AIGeneratorDialog.template = "website_tecnosoft.AIGeneratorDialog";
AIGeneratorDialog.components = { Dialog };

export class AIClientAction extends Component {
    setup() {
        this.action = this.props.action;
        this.dialog = useService("dialog");
        this.orm = useService("orm");
        
        onWillStart(async () => {
            // Fetch product data from the valid context
            const resId = this.action.context.active_id;
            if (resId) {
                const [product] = await this.orm.read("product.template", [resId], ["name", "list_price", "categ_id"]);
                this.openDialog(product);
            }
        });
    }

    openDialog(product) {
        this.dialog.add(AIGeneratorDialog, {
            product: product,
            title: _t("Generate Description with Local AI"),
        });
    }
}

registry.category("actions").add("website_tecnosoft.ai_generator", AIClientAction);
