
const { createApp } = Vue;

createApp({
    data() {
        return {
            formData: {
                email: '',
                password: '',
                remember: false
            },
            showPassword: false,
            showAccessibilityPanel: false,
            accessibilitySettings: {
                screenReader: false,
                pinkTheme: false,
                highContrast: false
            },
            announcement: '',
            speechSynthesis: window.speechSynthesis,
            currentUtterance: null
        };
    },
    mounted() {
        // Load accessibility settings from localStorage (simulated)
        const savedSettings = this.getStoredSettings();
        if (savedSettings) {
            this.accessibilitySettings = { ...this.accessibilitySettings, ...savedSettings };
            this.applyAccessibilitySettings();
        }

        // Add global click listener to close accessibility panel
        document.addEventListener('click', this.handleGlobalClick);

        // Add keyboard navigation
        document.addEventListener('keydown', this.handleGlobalKeydown);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleGlobalClick);
        document.removeEventListener('keydown', this.handleGlobalKeydown);
    },
    methods: {
        handleSubmit() {
            this.announce('Signing in to your Inclove account. Please wait.');
            // Handle form submission logic here
            console.log('Form submitted:', this.formData);
        },
        togglePassword() {
            this.showPassword = !this.showPassword;
            const message = this.showPassword ? 'Password is now visible' : 'Password is now hidden';
            this.announce(message);
        },
        handleInput(event) {
            if (this.accessibilitySettings.screenReader) {
                const element = event.target;
                const fieldName = element.id;
                const value = element.value;

                if (value) {
                    this.announce(`Typing in ${fieldName} field`);
                }
            }
        },
        handleFocus(event) {
            if (this.accessibilitySettings.screenReader && event.target) {
                const element = event.target;
                let message = '';

                if (element.tagName === 'INPUT') {
                    if (element.type === 'email') {
                        message = 'Email address field. Enter your email address.';
                    } else if (element.type === 'password') {
                        message = 'Password field. Enter your password.';
                    } else if (element.type === 'checkbox') {
                        message = `Checkbox ${element.checked ? 'checked' : 'unchecked'}. ${element.nextElementSibling?.textContent || ''}`;
                    }
                } else if (element.tagName === 'BUTTON') {
                    message = `Button. ${element.textContent || element.getAttribute('aria-label') || ''}`;
                } else if (element.tagName === 'A') {
                    message = `Link. ${element.textContent}`;
                }

                if (message) {
                    this.announce(message);
                }
            }
        },
        toggleAccessibilityPanel() {
            this.showAccessibilityPanel = !this.showAccessibilityPanel;
            const message = this.showAccessibilityPanel ?
                'Accessibility settings panel opened' :
                'Accessibility settings panel closed';
            this.announce(message);
        },
        toggleScreenReader() {
            this.accessibilitySettings.screenReader = !this.accessibilitySettings.screenReader;
            const message = this.accessibilitySettings.screenReader ?
                'Screen reader enabled. I will now read content and describe your interactions.' :
                'Screen reader disabled.';
            this.announce(message);
            this.saveSettings();
        },
        togglePinkTheme() {
            this.accessibilitySettings.pinkTheme = !this.accessibilitySettings.pinkTheme;
            document.body.classList.toggle('pink-theme', this.accessibilitySettings.pinkTheme);
            const message = this.accessibilitySettings.pinkTheme ?
                'Pink theme enabled. Background changed to baby pink.' :
                'Pink theme disabled. Background restored to default.';
            this.announce(message);
            this.saveSettings();
        },
        toggleHighContrast() {
            this.accessibilitySettings.highContrast = !this.accessibilitySettings.highContrast;
            document.body.style.filter = this.accessibilitySettings.highContrast ? 'contrast(150%)' : '';
            const message = this.accessibilitySettings.highContrast ?
                'High contrast mode enabled.' :
                'High contrast mode disabled.';
            this.announce(message);
            this.saveSettings();
        },
        handleKeypress(event, setting) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (setting === 'screenReader') {
                    this.toggleScreenReader();
                } else if (setting === 'pinkTheme') {
                    this.togglePinkTheme();
                } else if (setting === 'highContrast') {
                    this.toggleHighContrast();
                }
            }
        },
        handleGlobalClick(event) {
            if (!event.target.closest('.accessibility-panel') &&
                !event.target.closest('.accessibility-button')) {
                this.showAccessibilityPanel = false;
            }
        },
        handleGlobalKeydown(event) {
            // Close accessibility panel with Escape key
            if (event.key === 'Escape' && this.showAccessibilityPanel) {
                this.showAccessibilityPanel = false;
                this.announce('Accessibility panel closed');
            }
        },
        announce(message) {
            if (this.accessibilitySettings.screenReader && this.speechSynthesis) {
                // Stop any current speech
                if (this.currentUtterance) {
                    this.speechSynthesis.cancel();
                }

                // Create new utterance
                this.currentUtterance = new SpeechSynthesisUtterance(message);
                this.currentUtterance.rate = 0.9;
                this.currentUtterance.pitch = 1;
                this.currentUtterance.volume = 0.8;

                // Speak the message
                this.speechSynthesis.speak(this.currentUtterance);
            }

            // Also update the screen reader announcement div
            this.announcement = message;
        },
        applyAccessibilitySettings() {
            if (this.accessibilitySettings.pinkTheme) {
                document.body.classList.add('pink-theme');
            }
            if (this.accessibilitySettings.highContrast) {
                document.body.style.filter = 'contrast(150%)';
            }
        },
        saveSettings() {
            // In a real application, you would save to localStorage or a backend
            // For demo purposes, we'll simulate this
            console.log('Accessibility settings saved:', this.accessibilitySettings);
        },
        getStoredSettings() {
            // In a real application, you would load from localStorage or a backend
            // For demo purposes, return null
            return null;
        }
    }
}).mount('#app');
