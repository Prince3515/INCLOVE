
const { createApp } = Vue;

createApp({
    data() {
        return {
            accessibilityPanelOpen: false,
            screenReaderEnabled: false,
            highContrastEnabled: false,
            colorBlindEnabled: false,
            reduceMotionEnabled: false,
            zoomLevel: 2, // 0: small, 1: normal, 2: medium, 3: large, 4: extra-large
            zoomClasses: ['zoom-small', 'zoom-normal', 'zoom-medium', 'zoom-large', 'zoom-extra-large'],
            hearts: [],
            heartId: 0,
            screenReaderActive: false
        }
    },
    mounted() {
        this.initializeHearts();
        this.startHeartAnimation();

        // Check for saved preferences
        this.loadAccessibilityPreferences();

        // Set initial zoom
        document.body.className = this.zoomClasses[this.zoomLevel];

        // Add click outside listener for accessibility panel
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        if (this.heartInterval) {
            clearInterval(this.heartInterval);
        }
        if (this.screenReaderInterval) {
            clearInterval(this.screenReaderInterval);
        }
    },
    methods: {
        toggleAccessibilityPanel() {
            this.accessibilityPanelOpen = !this.accessibilityPanelOpen;
        },

        handleClickOutside(event) {
            if (!event.target.closest('.accessibility-menu')) {
                this.accessibilityPanelOpen = false;
            }
        },

        toggleScreenReader() {
            if (this.screenReaderEnabled) {
                this.startScreenReader();
            } else {
                this.stopScreenReader();
            }
            this.saveAccessibilityPreferences();
        },

        startScreenReader() {
            if ('speechSynthesis' in window) {
                this.screenReaderActive = true;
                const textContent = this.getPageText();
                const utterance = new SpeechSynthesisUtterance(textContent);
                utterance.rate = 0.8;
                utterance.pitch = 1;
                utterance.volume = 1;

                utterance.onend = () => {
                    this.screenReaderActive = false;
                };

                speechSynthesis.speak(utterance);
            } else {
                alert('Screen reader is not supported in this browser.');
            }
        },

        stopScreenReader() {
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
                this.screenReaderActive = false;
            }
        },

        getPageText() {
            const mainContent = document.querySelector('#main-content');
            const textNodes = [];

            function extractText(element) {
                for (let child of element.childNodes) {
                    if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
                        textNodes.push(child.textContent.trim());
                    } else if (child.nodeType === Node.ELEMENT_NODE &&
                        !child.classList.contains('hearts-container') &&
                        !child.classList.contains('accessibility-menu')) {
                        extractText(child);
                    }
                }
            }

            extractText(mainContent);
            return textNodes.join(' ').replace(/\s+/g, ' ');
        },

        increaseZoom() {
            if (this.zoomLevel < this.zoomClasses.length - 1) {
                this.zoomLevel++;
                document.body.className = this.zoomClasses[this.zoomLevel];
                this.saveAccessibilityPreferences();
            }
        },

        decreaseZoom() {
            if (this.zoomLevel > 0) {
                this.zoomLevel--;
                document.body.className = this.zoomClasses[this.zoomLevel];
                this.saveAccessibilityPreferences();
            }
        },

        resetZoom() {
            this.zoomLevel = 1; // normal size
            document.body.className = this.zoomClasses[this.zoomLevel];
            this.saveAccessibilityPreferences();
        },

        toggleHighContrast() {
            if (this.highContrastEnabled) {
                document.body.classList.add('high-contrast');
                document.body.classList.remove('color-blind');
                this.colorBlindEnabled = false;
            } else {
                document.body.classList.remove('high-contrast');
            }
            this.saveAccessibilityPreferences();
        },

        toggleColorBlind() {
            if (this.colorBlindEnabled) {
                document.body.classList.add('color-blind');
                document.body.classList.remove('high-contrast');
                this.highContrastEnabled = false;
            } else {
                document.body.classList.remove('color-blind');
            }
            this.saveAccessibilityPreferences();
        },

        toggleReduceMotion() {
            if (this.reduceMotionEnabled) {
                document.body.style.setProperty('--transition', 'none');
                this.hearts = [];
            } else {
                document.body.style.setProperty('--transition', 'all 0.3s ease');
                this.initializeHearts
                this.initializeHearts();
                this.startHeartAnimation();
            }
            this.saveAccessibilityPreferences();
        },

        initializeHearts() {
            this.hearts = [];
            for (let i = 0; i < 20; i++) {
                this.addHeart();
            }
        },

        startHeartAnimation() {
            if (this.reduceMotionEnabled) return;
            this.heartInterval = setInterval(() => {
                this.addHeart();
                if (this.hearts.length > 50) {
                    this.hearts.shift(); // remove old hearts
                }
            }, 1000);
        },

        addHeart() {
            const size = Math.floor(Math.random() * 24) + 12;
            const left = Math.random() * 100;
            const duration = Math.random() * 10 + 5;
            const delay = Math.random() * 5;
            const emoji = Math.random() > 0.5 ? '❤️' : '💖';

            this.hearts.push({
                id: this.heartId++,
                emoji: emoji,
                style: `
                            left: ${left}%;
                            font-size: ${size}px;
                            animation: float ${duration}s ease-in-out ${delay}s infinite;
                        `
            });
        },

        saveAccessibilityPreferences() {
            const preferences = {
                screenReaderEnabled: this.screenReaderEnabled,
                highContrastEnabled: this.highContrastEnabled,
                colorBlindEnabled: this.colorBlindEnabled,
                reduceMotionEnabled: this.reduceMotionEnabled,
                zoomLevel: this.zoomLevel
            };
            localStorage.setItem('incloveAccessibility', JSON.stringify(preferences));
        },

        loadAccessibilityPreferences() {
            const saved = localStorage.getItem('incloveAccessibility');
            if (saved) {
                const prefs = JSON.parse(saved);
                this.screenReaderEnabled = prefs.screenReaderEnabled || false;
                this.highContrastEnabled = prefs.highContrastEnabled || false;
                this.colorBlindEnabled = prefs.colorBlindEnabled || false;
                this.reduceMotionEnabled = prefs.reduceMotionEnabled || false;
                this.zoomLevel = prefs.zoomLevel || 1;

                if (this.highContrastEnabled) {
                    document.body.classList.add('high-contrast');
                }
                if (this.colorBlindEnabled) {
                    document.body.classList.add('color-blind');
                }
                document.body.className = this.zoomClasses[this.zoomLevel];
            }
        }
    }
}).mount('#app');
