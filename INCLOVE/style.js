const { createApp } = Vue;

createApp({
    data() {
        return {
            accessibilityOpen: false,
            donationModalOpen: false,
            zoom: 100,
            accessibility: {
                screenReader: false,
                highContrast: false,
                colorVision: 'normal'
            }
        };
    },
    mounted() {
        this.createHearts();
        this.setupAccessibility();
        this.playWelcomeMessage();
    },
    methods: {
        playWelcomeMessage() {
            const audioEl = this.$refs.welcomeAudio;
            if (!audioEl) return;

            // Ensure mobile-friendly inline playback
            audioEl.setAttribute('playsinline', '');
            audioEl.autoplay = true;

            const tryPlay = () => {
                // Reload in case the browser deferred it
                if (audioEl.readyState === 0) {
                    try { audioEl.load(); } catch (e) { /* ignore */ }
                }
                const playPromise = audioEl.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.catch(() => {
                        // Autoplay blocked: wait for a first user interaction
                        const unlock = () => {
                            audioEl.play().finally(() => {
                                window.removeEventListener('click', unlock);
                                window.removeEventListener('touchstart', unlock);
                                window.removeEventListener('keydown', unlock);
                            });
                        };
                        window.addEventListener('click', unlock, { once: true });
                        window.addEventListener('touchstart', unlock, { once: true });
                        window.addEventListener('keydown', unlock, { once: true });
                    });
                }
            };

            // Attempt immediate playback (or on next tick)
            setTimeout(tryPlay, 0);

            // Announce accessibility button location
            setTimeout(() => {
                this.announceToScreenReader('Welcome to Inclove! Accessibility options are available by clicking the wheelchair icon at the bottom right corner of your screen.');
            }, 1500);
        },
        toggleAccessibilityPanel() {
            this.accessibilityOpen = !this.accessibilityOpen;
            if (this.accessibilityOpen) {
                this.announceToScreenReader('Accessibility panel opened. Use Tab to navigate through options.');
            } else {
                this.announceToScreenReader('Accessibility panel closed.');
            }
        },
        toggleAccessibility(feature) {
            this.accessibility[feature] = !this.accessibility[feature];
            this.applyAccessibilitySettings();
        },
        applyAccessibilitySettings() {
            const body = document.body;

            // Screen Reader Mode
            if (this.accessibility.screenReader) {
                body.classList.add('screen-reader-mode');
                this.announceToScreenReader('Screen reader mode enabled. Text is now optimized for screen readers.');
            } else {
                body.classList.remove('screen-reader-mode');
            }

            // High contrast
            if (this.accessibility.highContrast) {
                body.classList.add('high-contrast');
                this.announceToScreenReader('High contrast mode enabled. Colors are now optimized for better visibility.');
            } else {
                body.classList.remove('high-contrast');
            }
        },
        changeColorVision() {
            const value = this.accessibility.colorVision;

            // Remove all color vision classes
            document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia', 'monochrome');

            // Apply the selected filter
            if (value !== 'normal') {
                document.body.classList.add(value);
                this.announceToScreenReader(`Color vision filter changed to ${value.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            } else {
                this.announceToScreenReader('Color vision filter set to normal');
            }
        },
        announceToScreenReader(message) {
            // Create or update screen reader announcement
            let announcer = document.getElementById('screen-reader-announcer');
            if (!announcer) {
                announcer = document.createElement('div');
                announcer.id = 'screen-reader-announcer';
                announcer.setAttribute('aria-live', 'polite');
                announcer.setAttribute('aria-atomic', 'true');
                announcer.className = 'sr-only';
                document.body.appendChild(announcer);
            }

            // Clear and set new message
            announcer.textContent = '';
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        },
        setupAccessibility() {
            // Create initial screen reader announcer
            this.announceToScreenReader('');

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                // ESC to close accessibility panel
                if (e.key === 'Escape' && this.accessibilityOpen) {
                    this.accessibilityOpen = false;
                    this.announceToScreenReader('Accessibility panel closed');
                }

                // Alt + A to open accessibility panel
                if (e.altKey && e.key === 'a') {
                    e.preventDefault();
                    this.toggleAccessibilityPanel();
                }

                // Alt + C for high contrast
                if (e.altKey && e.key === 'c') {
                    e.preventDefault();
                    this.toggleAccessibility('highContrast');
                }

                // Alt + S for screen reader mode
                if (e.altKey && e.key === 's') {
                    e.preventDefault();
                    this.toggleAccessibility('screenReader');
                }
            });

            // Respect user's system preferences
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.body.classList.add('reduced-motion');
                this.announceToScreenReader('Reduced motion enabled based on system preferences');
            }

            if (window.matchMedia('(prefers-contrast: high)').matches) {
                this.accessibility.highContrast = true;
                this.applyAccessibilitySettings();
            }

            // Add proper ARIA labels
            this.$nextTick(() => {
                const interactiveElements = document.querySelectorAll('button, a, input, select');
                interactiveElements.forEach(element => {
                    if (!element.getAttribute('aria-label') && !element.textContent.trim() && !element.getAttribute('aria-labelledby')) {
                        element.setAttribute('aria-label', 'Interactive element');
                    }
                });
            });
        },
        zoomIn() {
            if (this.zoom < 200) {
                this.zoom += 25;
                this.applyZoom();
                this.announceToScreenReader(`Zoomed in to ${this.zoom} percent`);
            }
        },
        zoomOut() {
            if (this.zoom > 50) {
                this.zoom -= 25;
                this.applyZoom();
                this.announceToScreenReader(`Zoomed out to ${this.zoom} percent`);
            }
        },
        applyZoom() {
            const scale = this.zoom / 100;
            document.body.style.transform = `scale(${scale})`;
            document.body.style.transformOrigin = 'top left';
            document.body.style.width = `${100 / scale}%`;
            document.body.style.height = `${100 / scale}%`;

            if (scale !== 1) {
                document.body.classList.add('zoomed');
            } else {
                document.body.classList.remove('zoomed');
                document.body.style.transform = '';
                document.body.style.width = '';
                document.body.style.height = '';
            }
        },
        openDonationModal() {
            this.donationModalOpen = true;
            document.body.style.overflow = 'hidden';
            this.announceToScreenReader('Donation modal opened');
            // Focus the modal for accessibility
            this.$nextTick(() => {
                const modal = document.querySelector('.modal-content');
                if (modal) modal.focus();
            });
        },
        closeDonationModal() {
            this.donationModalOpen = false;
            document.body.style.overflow = 'auto';
            this.announceToScreenReader('Donation modal closed');
        },
        scrollToSection(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                this.announceToScreenReader(`Navigated to ${sectionId} section`);
            }
        },
        createHearts() {
            const container = this.$refs.heartsContainer;
            const heartSymbols = ['💖', '💝', '💕', '💗', '💘', '💞'];

            // Reduce hearts for better performance and less distraction
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const heart = document.createElement('div');
                    heart.className = 'heart';
                    heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
                    heart.style.left = Math.random() * 100 + '%';
                    heart.style.top = Math.random() * 100 + '%';
                    heart.style.animationDelay = Math.random() * 6 + 's';
                    heart.style.animationDuration = (4 + Math.random() * 4) + 's';
                    heart.setAttribute('aria-hidden', 'true');

                    container.appendChild(heart);

                    setTimeout(() => {
                        if (heart.parentNode) {
                            heart.parentNode.removeChild(heart);
                        }
                    }, 12000);
                }, i * 800);
            }

            // Continuously create new hearts
            setTimeout(() => this.createHearts(), 15000);
        }
    }
}).mount('#app');