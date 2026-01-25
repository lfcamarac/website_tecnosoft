/** @odoo-module **/

/**
 * Tecnosoft Dark Mode Toggle
 * Uses document-level event delegation to work with toggle outside #wrapwrap
 */

(function() {
    'use strict';
    
    const STORAGE_KEY = 'tecnosoft_dark_mode';
    const DARK_CLASS = 'o_dark_mode';
    
    /**
     * Apply dark mode based on saved preference
     */
    function applyTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'true') {
            document.body.classList.add(DARK_CLASS);
            updateIcons(true);
        } else {
            document.body.classList.remove(DARK_CLASS);
            updateIcons(false);
        }
    }
    
    /**
     * Toggle dark mode
     */
    function toggleDarkMode() {
        const isDark = document.body.classList.contains(DARK_CLASS);
        if (isDark) {
            document.body.classList.remove(DARK_CLASS);
            localStorage.setItem(STORAGE_KEY, 'false');
            updateIcons(false);
        } else {
            document.body.classList.add(DARK_CLASS);
            localStorage.setItem(STORAGE_KEY, 'true');
            updateIcons(true);
        }
    }
    
    /**
     * Update toggle button icons
     */
    function updateIcons(isDark) {
        const icons = document.querySelectorAll('.tecnosoft-dark-mode-toggle i');
        icons.forEach(icon => {
            if (isDark) {
                icon.classList.remove('fa-moon-o');
                icon.classList.add('fa-sun-o');
            } else {
                icon.classList.remove('fa-sun-o');
                icon.classList.add('fa-moon-o');
            }
        });
        
        // Also update container background for visual feedback
        const containers = document.querySelectorAll('.tecnosoft-dark-mode-toggle');
        containers.forEach(container => {
            if (isDark) {
                container.style.background = '#333';
                container.querySelector('i').style.color = '#fff';
            } else {
                container.style.background = '#fff';
                container.querySelector('i').style.color = '#333';
            }
        });
    }
    
    // Apply theme immediately on script load (before DOMContentLoaded)
    if (document.body) {
        applyTheme();
    }
    
    // Set up event listener once DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        applyTheme();
        
        // Use event delegation on document for toggle clicks
        document.addEventListener('click', function(ev) {
            const toggle = ev.target.closest('.tecnosoft-dark-mode-toggle');
            if (toggle) {
                ev.preventDefault();
                ev.stopPropagation();
                toggleDarkMode();
            }
        });
    });
    
    // Also apply on body load for SSR pages
    window.addEventListener('load', applyTheme);
    
})();
