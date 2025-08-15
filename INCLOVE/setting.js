
const { createApp } = Vue;

createApp({
    data() {
        return {
            announcement: '',
            showAccessibilityMenu: false,
            showSuccessPopup: false,
            showToast: false,
            toastMessage: '',
            toastType: 'success',
            newBlockedUser: '',
            // Delete account states
            showDeleteConfirmation: false,
            deleteConfirmText1: '',
            deleteConfirmText2: '',
            // Speech synthesis
            speechSynthesis: null,
            settings: {
                discoveryMode: 'active',
                maxDistance: 50,
                showOnline: true,
                showRecentlyActive: true,
                location: '',
                globalDiscovery: false,
                shareLocation: true,
                primaryLanguage: 'en',
                additionalLanguages: [],
                interestedIn: {
                    men: false,
                    women: false,
                    nonBinary: false,
                    everyone: true
                },
                relationshipType: {
                    casual: false,
                    serious: true,
                    friendship: false,
                    marriage: false
                },
                ageRange: {
                    min: 18,
                    max: 65
                },
                blockedUsers: [],
                hideLastSeen: false,
                requireMutualMatch: true,
                hideProfile: false,
                reportSafetyIssues: true,
                notifications: {
                    matches: true,
                    messages: true,
                    likes: false,
                    email: true
                }
            },
            accessibility: {
                screenReader: false,
                highContrast: false,
                colorBlindFriendly: false,
                zoomLevel: 100
            },
            availableLanguages: [
                { code: 'es', name: 'Spanish' },
                { code: 'fr', name: 'French' },
                { code: 'de', name: 'German' },
                { code: 'it', name: 'Italian' },
                { code: 'pt', name: 'Portuguese' },
                { code: 'zh', name: 'Chinese' },
                { code: 'ja', name: 'Japanese' },
                { code: 'ar', name: 'Arabic' },
                { code: 'hi', name: 'Hindi' }
            ]
        };
    },
    mounted() {
        // Initialize speech synthesis
        this.speechSynthesis = window.speechSynthesis;

        // Auto-save when settings change
        this.$watch('settings', () => {
            this.autoSave();
        }, { deep: true });

        // Add input listeners for screen reader
        document.addEventListener('input', this.handleInput);
    },
    computed: {
        deleteStep1Complete() {
            return this.deleteConfirmText1.toLowerCase().trim() === 'i want to delete my account';
        },
        deleteStep2Complete() {
            return this.deleteConfirmText2.toUpperCase().trim() === 'GOODBYE INCLOVE';
        }
    },
    methods: {
        // Save Settings
        saveSettings() {
            try {
                // Simulate saving to server
                console.log('Saving settings:', this.settings);

                // Show success popup
                this.showSuccessPopup = true;
                this.showToast('Settings saved successfully!', 'success');
                this.announce('Settings saved successfully');

                // Auto-hide popup after 3 seconds
                setTimeout(() => {
                    this.hideSuccessPopup();
                }, 3000);

            } catch (error) {
                this.showToast('Failed to save settings. Please try again.', 'error');
                this.announce('Failed to save settings');
            }
        },

        autoSave() {
            // Debounced auto-save
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(() => {
                this.showToast('Settings auto-saved', 'success');
            }, 1000);
        },

        hideSuccessPopup() {
            this.showSuccessPopup = false;
        },

        showToast(message, type = 'success') {
            this.toastMessage = message;
            this.toastType = type;
            this.showToast = true;

            // Auto-hide toast after 3 seconds
            setTimeout(() => {
                this.showToast = false;
            }, 3000);
        },

        // Block/Unblock Users
        blockUser() {
            if (this.newBlockedUser.trim()) {
                if (!this.settings.blockedUsers.includes(this.newBlockedUser.trim())) {
                    this.settings.blockedUsers.push(this.newBlockedUser.trim());
                    this.showToast(`User ${this.newBlockedUser} blocked successfully`, 'success');
                    this.announce(`User ${this.newBlockedUser} has been blocked`);
                } else {
                    this.showToast('User is already blocked', 'error');
                }
                this.newBlockedUser = '';
            }
        },

        unblockUser(username) {
            const index = this.settings.blockedUsers.indexOf(username);
            if (index > -1) {
                this.settings.blockedUsers.splice(index, 1);
                this.showToast(`User ${username} unblocked successfully`, 'success');
                this.announce(`User ${username} has been unblocked`);
            }
        },

        // Accessibility Functions
        toggleAccessibilityMenu() {
            this.showAccessibilityMenu = !this.showAccessibilityMenu;
            this.announce(this.showAccessibilityMenu ? 'Accessibility menu opened' : 'Accessibility menu closed');
        },

        toggleScreenReader() {
            this.accessibility.screenReader = !this.accessibility.screenReader;
            this.announce(`Screen reader ${this.accessibility.screenReader ? 'enabled' : 'disabled'}`);

            if (this.accessibility.screenReader) {
                this.enableScreenReader();
            } else {
                this.disableScreenReader();
            }
        },

        enableScreenReader() {
            document.addEventListener('mouseover', this.handleMouseOver);
            document.addEventListener('focus', this.handleFocus, true);
            document.addEventListener('input', this.handleInput);
            document.addEventListener('change', this.handleChange);
            this.showToast('Screen reader mode enabled', 'success');
            this.speak('Screen reader mode enabled. I will now read everything you interact with.');
        },

        disableScreenReader() {
            document.removeEventListener('mouseover', this.handleMouseOver);
            document.removeEventListener('focus', this.handleFocus, true);
            document.removeEventListener('input', this.handleInput);
            document.removeEventListener('change', this.handleChange);
            this.showToast('Screen reader mode disabled', 'success');
            this.speak('Screen reader mode disabled.');
        },

        handleMouseOver(event) {
            if (this.accessibility.screenReader) {
                const element = event.target;
                const text = this.getElementText(element);
                if (text && text.length > 0 && text.length < 200) {
                    this.speak(text);
                }
            }
        },

        handleFocus(event) {
            if (this.accessibility.screenReader) {
                const element = event.target;
                const text = this.getElementText(element);
                if (text) {
                    this.speak(`Focused on: ${text}`);
                }
            }
        },

        handleInput(event) {
            if (this.accessibility.screenReader) {
                const element = event.target;
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    const label = this.getElementLabel(element);
                    const value = element.value;
                    if (value.length === 1) {
                        this.speak(`Typing in ${label}: ${value}`);
                    }
                }
            }
        },

        handleChange(event) {
            if (this.accessibility.screenReader) {
                const element = event.target;
                const text = this.getElementText(element);
                if (element.tagName === 'SELECT') {
                    this.speak(`Selection changed to: ${element.value}`);
                } else if (element.type === 'checkbox') {
                    const label = this.getElementLabel(element);
                    this.speak(`${label} ${element.checked ? 'checked' : 'unchecked'}`);
                } else if (element.type === 'range') {
                    const label = this.getElementLabel(element);
                    this.speak(`${label} set to ${element.value}`);
                }
            }
        },

        getElementText(element) {
            // Get meaningful text from element
            if (element.getAttribute('aria-label')) {
                return element.getAttribute('aria-label');
            }

            if (element.tagName === 'INPUT') {
                const label = this.getElementLabel(element);
                if (element.type === 'checkbox') {
                    return `${label} checkbox, ${element.checked ? 'checked' : 'not checked'}`;
                } else if (element.type === 'range') {
                    return `${label} slider, value ${element.value}`;
                } else {
                    return label || element.placeholder || 'Input field';
                }
            }

            if (element.tagName === 'BUTTON') {
                return element.textContent?.trim() || 'Button';
            }

            if (element.tagName === 'SELECT') {
                const label = this.getElementLabel(element);
                return `${label}, selected: ${element.options[element.selectedIndex]?.text || element.value}`;
            }

            if (element.tagName === 'LABEL') {
                return element.textContent?.trim();
            }

            if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3') {
                return `Heading: ${element.textContent?.trim()}`;
            }

            const text = element.textContent?.trim();
            return text && text.length > 2 ? text : '';
        },

        getElementLabel(element) {
            // Try to find label for input element
            if (element.id) {
                const label = document.querySelector(`label[for="${element.id}"]`);
                if (label) return label.textContent?.trim();
            }

            // Check if element is inside a label
            const parentLabel = element.closest('label');
            if (parentLabel) return parentLabel.textContent?.trim();

            // Check for aria-label
            if (element.getAttribute('aria-label')) {
                return element.getAttribute('aria-label');
            }

            return 'Input field';
        },

        speak(text) {
            if (this.speechSynthesis && text) {
                // Cancel any ongoing speech
                this.speechSynthesis.cancel();

                // Create new utterance
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.2;
                utterance.pitch = 1;
                utterance.volume = 0.8;

                // Speak the text
                this.speechSynthesis.speak(utterance);
            }
        },

        toggleHighContrast() {
            this.accessibility.highContrast = !this.accessibility.highContrast;

            if (this.accessibility.highContrast) {
                document.body.classList.add('high-contrast');
                this.showToast('High contrast mode enabled', 'success');
                this.announce('High contrast mode enabled');
            } else {
                document.body.classList.remove('high-contrast');
                this.showToast('High contrast mode disabled', 'success');
                this.announce('High contrast mode disabled');
            }
        },

        toggleColorBlindFriendly() {
            this.accessibility.colorBlindFriendly = !this.accessibility.colorBlindFriendly;

            if (this.accessibility.colorBlindFriendly) {
                document.body.classList.add('color-blind-friendly');
                this.showToast('Color blind friendly mode enabled', 'success');
                this.announce('Color blind friendly mode enabled');
            } else {
                document.body.classList.remove('color-blind-friendly');
                this.showToast('Color blind friendly mode disabled', 'success');
                this.announce('Color blind friendly mode disabled');
            }
        },

        zoomIn() {
            if (this.accessibility.zoomLevel < 200) {
                this.accessibility.zoomLevel += 10;
                this.applyZoom();
                this.announce(`Zoom level increased to ${this.accessibility.zoomLevel}%`);
            }
        },

        zoomOut() {
            if (this.accessibility.zoomLevel > 50) {
                this.accessibility.zoomLevel -= 10;
                this.applyZoom();
                this.announce(`Zoom level decreased to ${this.accessibility.zoomLevel}%`);
            }
        },

        applyZoom() {
            document.body.style.zoom = `${this.accessibility.zoomLevel}%`;
            this.showToast(`Zoom level set to ${this.accessibility.zoomLevel}%`, 'success');
        },

        announce(message) {
            this.announcement = message;
            // Also speak if screen reader is enabled
            if (this.accessibility.screenReader) {
                this.speak(message);
            }
            // Clear announcement after a brief moment so it can be announced again if needed
            setTimeout(() => {
                this.announcement = '';
            }, 100);
        },

        // Delete Account Functions
        startDeleteProcess() {
            this.showDeleteConfirmation = true;
            this.deleteConfirmText1 = '';
            this.deleteConfirmText2 = '';
            this.speak('Starting account deletion process. Please complete the confirmation steps.');
            this.announce('Account deletion process started');
        },

        cancelDelete() {
            this.showDeleteConfirmation = false;
            this.deleteConfirmText1 = '';
            this.deleteConfirmText2 = '';
            this.showToast('Account deletion cancelled! We\'re so happy you\'re staying! 🎉', 'success');
            this.speak('Account deletion cancelled. We are so happy you are staying with us!');
        },

        finalDeleteAccount() {
            // In a real app, this would call an API to delete the account
            this.showToast('Account deletion initiated. You will be redirected shortly...', 'error');
            this.speak('Account deletion initiated. Goodbye from IncLove!');

            // Simulate redirect after showing message
            setTimeout(() => {
                // In real app: window.location.href = '/account-deleted';
                alert('👋 Goodbye from IncLove! Your account has been deleted. We\'ll miss you!');
            }, 3000);
        }
    }
}).mount('#app');
