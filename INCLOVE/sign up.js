
const { createApp } = Vue;

createApp({
    data() {
        return {
            showAccessibilityPanel: false,
            screenReaderActive: false,
            screenReaderMessage: '',
            currentTheme: 'normal',
            currentZoom: 'zoom-normal',
            zoomLevel: 100,
            speechSynthesis: null,
            currentUtterance: null,
            isSubmitting: false,
            formData: {
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                age: '',
                gender: '',
                location: '',
                interests: 'friendship',
                terms: false,
                newsletter: false
            }
        };
    },
    mounted() {
        // Initialize speech synthesis
        this.speechSynthesis = window.speechSynthesis;

        // Apply initial settings
        this.applyZoom();
        this.applyTheme();

        // Load saved preferences
        this.loadPreferences();
    },
    beforeUnmount() {
        // Cleanup event listeners
        document.removeEventListener('focus', this.handleFocusEvent, true);
        document.removeEventListener('click', this.handleClickEvent, true);
    },
    methods: {
        toggleAccessibilityPanel() {
            this.showAccessibilityPanel = !this.showAccessibilityPanel;
            this.announceElement(this.showAccessibilityPanel ? 'Accessibility panel opened' : 'Accessibility panel closed');
        },

        toggleScreenReader() {
            this.screenReaderActive = !this.screenReaderActive;

            if (this.screenReaderActive) {
                // Add event listeners when screen reader is enabled
                document.addEventListener('focus', this.handleFocusEvent, true);
                document.addEventListener('click', this.handleClickEvent, true);

                // Welcome message
                this.announceElement('Screen reader mode enabled. Welcome to Inclove signup page.');
            } else {
                // Remove event listeners when screen reader is disabled
                document.removeEventListener('focus', this.handleFocusEvent, true);
                document.removeEventListener('click', this.handleClickEvent, true);

                // Stop any current speech
                if (this.speechSynthesis) {
                    this.speechSynthesis.cancel();
                }

                this.announceElement('Screen reader mode disabled.');
            }

            this.savePreferences();
        },

        toggleHighContrast() {
            if (this.currentTheme === 'high-contrast') {
                this.currentTheme = 'normal';
            } else {
                this.currentTheme = 'high-contrast';
            }
            this.applyTheme();
            this.announceElement(this.currentTheme === 'high-contrast' ? 'High contrast mode enabled' : 'High contrast mode disabled');
        },

        applyTheme() {
            // Remove all theme classes
            document.body.classList.remove('high-contrast', 'protanopia', 'deuteranopia', 'tritanopia', 'monochrome');

            // Apply selected theme
            if (this.currentTheme !== 'normal') {
                document.body.classList.add(this.currentTheme);
            }

            this.savePreferences();
        },

        zoomIn() {
            const levels = ['zoom-small', 'zoom-normal', 'zoom-large', 'zoom-xlarge'];
            const percentages = [80, 100, 120, 140];
            const currentIndex = levels.indexOf(this.currentZoom);

            if (currentIndex < levels.length - 1) {
                this.currentZoom = levels[currentIndex + 1];
                this.zoomLevel = percentages[currentIndex + 1];
                this.applyZoom();
                this.announceElement(`Text size increased to ${this.zoomLevel}%`);
            }
        },

        zoomOut() {
            const levels = ['zoom-small', 'zoom-normal', 'zoom-large', 'zoom-xlarge'];
            const percentages = [80, 100, 120, 140];
            const currentIndex = levels.indexOf(this.currentZoom);

            if (currentIndex > 0) {
                this.currentZoom = levels[currentIndex - 1];
                this.zoomLevel = percentages[currentIndex - 1];
                this.applyZoom();
                this.announceElement(`Text size decreased to ${this.zoomLevel}%`);
            }
        },

        applyZoom() {
            document.body.className = document.body.className.replace(/zoom-\w+/g, '');
            document.body.classList.add(this.currentZoom);
            this.savePreferences();
        },

        announceElement(message) {
            if (this.screenReaderActive && this.speechSynthesis) {
                // Stop current speech
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

            // Also update screen reader message for assistive technologies
            this.screenReaderMessage = message;
        },

        announceTyping(fieldName) {
            if (this.screenReaderActive) {
                const value = this.formData[fieldName];
                if (value && value.length > 0) {
                    // Announce every few characters to avoid spam
                    if (value.length % 5 === 0) {
                        this.announceElement(`${this.getFieldLabel(fieldName)} field has ${value.length} characters`);
                    }
                }
            }
        },

        handleFocusEvent(event) {
            if (this.screenReaderActive) {
                const element = event.target;
                let announcement = '';

                if (element.tagName === 'INPUT') {
                    announcement = `${element.type} input, ${element.getAttribute('aria-label') || element.name || 'field'}`;
                    if (element.required) announcement += ', required';
                } else if (element.tagName === 'BUTTON') {
                    announcement = `Button: ${element.textContent || element.getAttribute('aria-label')}`;
                } else if (element.tagName === 'SELECT') {
                    announcement = `Dropdown: ${element.getAttribute('aria-label') || element.name}`;
                } else if (element.tagName === 'A') {
                    announcement = `Link: ${element.textContent}`;
                }

                if (announcement) {
                    this.announceElement(announcement);
                }
            }
        },

        handleClickEvent(event) {
            if (this.screenReaderActive) {
                const element = event.target;
                if (element.classList.contains('toggle-switch')) {
                    // Handle toggle switches specially
                    return;
                }
            }
        },

        getFieldLabel(fieldName) {
            const labels = {
                'firstName': 'First Name',
                'lastName': 'Last Name',
                'email': 'Email',
                'password': 'Password',
                'age': 'Age',
                'location': 'Location'
            };
            return labels[fieldName] || fieldName;
        },

        getInterestLabel(value) {
            const labels = {
                'friendship': 'Friendship',
                'dating': 'Dating',
                'relationship': 'Long-term relationship',
                'community': 'Community connection',
                'all': 'Open to all connections'
            };
            return labels[value] || value;
        },

        validateForm() {
            const errors = [];

            if (!this.formData.firstName.trim()) {
                errors.push('First name is required');
            }

            if (!this.formData.lastName.trim()) {
                errors.push('Last name is required');
            }

            if (!this.formData.email.trim()) {
                errors.push('Email address is required');
            } else if (!/\S+@\S+\.\S+/.test(this.formData.email)) {
                errors.push('Please enter a valid email address');
            }

            if (!this.formData.password) {
                errors.push('Password is required');
            } else if (this.formData.password.length < 8) {
                errors.push('Password must be at least 8 characters long');
            }

            if (!this.formData.age) {
                errors.push('Age is required');
            } else if (this.formData.age < 18 || this.formData.age > 100) {
                errors.push('Age must be between 18 and 100');
            }

            if (!this.formData.terms) {
                errors.push('You must agree to the Terms of Service and Privacy Policy');
            }

            return errors;
        },

        async submitForm() {
            // Validate form
            const errors = this.validateForm();
            if (errors.length > 0) {
                if (this.screenReaderActive) {
                    this.announceElement(`Form validation failed: ${errors.join('. ')}`);
                }
                return;
            }

            this.isSubmitting = true;
            if (this.screenReaderActive) {
                this.announceElement('Submitting form, please wait...');
            }

            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Simulate success
                if (this.screenReaderActive) {
                    this.announceElement('Form submitted successfully! Welcome to Inclove! Your profile has been created.');
                }

                // Reset form
                this.resetForm();

            } catch (error) {
                if (this.screenReaderActive) {
                    this.announceElement('Form submission failed. Please try again.');
                }
            } finally {
                this.isSubmitting = false;
            }
        },

        resetForm() {
            this.formData = {
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                age: '',
                gender: '',
                location: '',
                interests: 'friendship',
                terms: false,
                newsletter: false
            };
        },

        savePreferences() {
            const preferences = {
                screenReaderActive: this.screenReaderActive,
                currentTheme: this.currentTheme,
                currentZoom: this.currentZoom,
                zoomLevel: this.zoomLevel
            };
            // In a real app, this would save to localStorage or server
            // For demo purposes, we'll skip actual persistence
        },

        loadPreferences() {
            // In a real app, this would load from localStorage or server
            // For demo purposes, we'll use defaults
            if (this.screenReaderActive) {
                this.announceElement('Accessibility preferences loaded');
            }
        }
    }
}).mount('#app');
