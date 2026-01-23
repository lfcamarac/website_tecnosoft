/** @odoo-module **/

import publicWidget from 'web.public.widget';

publicWidget.registry.PwaInstall = publicWidget.Widget.extend({
    selector: '#wrapwrap',
    events: {
        'click .js_pwa_install': '_onInstallClick',
    },

    /**
     * @override
     */
    start: function () {
        this.deferredPrompt = null;
        this._initInstallPrompt();
        return this._super.apply(this, arguments);
    },

    _initInstallPrompt: function () {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            this.deferredPrompt = e;
            // Update UI notify the user they can install the PWA
            this.$('.js_pwa_install').removeClass('d-none');
            console.log("PWA Install Prompt ready");
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.$('.js_pwa_install').addClass('d-none');
            console.log('PWA was installed');
        });
    },

    _onInstallClick: async function (ev) {
        ev.preventDefault();
        if (!this.deferredPrompt) {
            return;
        }
        // Show the install prompt
        this.deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        this.deferredPrompt = null;
        // Hide button
        this.$('.js_pwa_install').addClass('d-none');
    },
});
