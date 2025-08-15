
const { createApp } = Vue;

createApp({
    data() {
        return {
            profile: {
                name: "Sarah Chen",
                dateOfBirth: "1995-06-15",
                location: "San Francisco, CA",
                condition: "Living with visual impairment - seeing the world through different perspectives",
                bio: "I'm a passionate artist and teacher who believes that our differences make us beautiful. I love painting, reading audiobooks, and exploring the city with my guide dog, Luna. Looking for someone who values authentic connections and understands that love sees beyond the surface.",
                interests: ["Art & Painting", "Audiobooks", "Cooking", "Travel", "Music", "Advocacy"],
                photo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Ccircle cx='75' cy='75' r='75' fill='%23e91e63'/%3E%3Ctext x='75' y='85' text-anchor='middle' fill='white' font-size='60' font-family='Arial'%3ES%3C/text%3E%3C/svg%3E",
                isPremium: false
            },
            editProfile: {},
            newInterest: '',
            showEditModal: false,
            showNotificationModal: false,
            showAccessibilityPanel: false,
            showNotification: false,
            notificationMessage: '',
            notifications: {
                newMatches: true,
                messages: true,
                profileViews: false,
                emailNotifications: true
            },
            // Accessibility settings
            zoomLevel: 1,
            screenReaderEnabled: false,
            highContrastEnabled: false,
            colorBlindMode: 'none',
            speechSynthesis: null,
            typingTimeout: null
        }
    },
    computed: {
        calculatedAge() {
            if (!this.profile.dateOfBirth) return 0;
            const today = new Date();
            const birthDate = new Date(this.profile.dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }
    },
    methods: {
        speak(text) {
            if (this.screenReaderEnabled && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.8;
                utterance.pitch = 1;
                window.speechSynthesis.speak(utterance);
            }
        },

        speakTyping(field, value) {
            if (!this.screenReaderEnabled) return;

            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                if (value.trim()) {
                    this.speak(`${field} field contains: ${value}`);
                } else {
                    this.speak(`${field} field is empty`);
                }
            }, 1000);
        },

        // Modal methods
        openEditModal() {
            this.editProfile = { ...this.profile };
            this.showEditModal = true;
            this.speak('Opened edit profile dialog');
        },

        closeEditModal() {
            this.showEditModal = false;
            this.speak('Closed edit profile dialog');
        },

        openNotificationModal() {
            this.showNotificationModal = true;
            this.speak('Opened notification settings dialog');
        },

        closeNotificationModal() {
            this.showNotificationModal = false;
            this.speak('Closed notification settings dialog');
        },

        // Profile management
        saveProfile() {
            this.profile = { ...this.editProfile };
            this.showEditModal = false;
            this.showNotification('Profile updated successfully!');
            this.speak('Profile saved successfully');
        },

        addInterest() {
            if (this.newInterest.trim() && !this.editProfile.interests.includes(this.newInterest.trim())) {
                this.editProfile.interests.push(this.newInterest.trim());
                this.speak(`Added interest: ${this.newInterest.trim()}`);
                this.newInterest = '';
            }
        },

        removeInterest(index) {
            const removedInterest = this.editProfile.interests[index];
            this.editProfile.interests.splice(index, 1);
            this.speak(`Removed interest: ${removedInterest}`);
        },

        // File upload
        triggerFileUpload() {
            this.$refs.fileInput.click();
        },

        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.profile.photo = e.target.result;
                    this.showNotification('Profile picture updated!');
                    this.speak('Profile picture updated successfully');
                };
                reader.readAsDataURL(file);
            } else {
                this.showNotification('Please select a valid image file', 'error');
                this.speak('Error: Please select a valid image file');
            }
        },

        // Account actions
        hibernateAccount() {
            if (confirm('Are you sure you want to hibernate your account? Your profile will be hidden from other users.')) {
                this.showNotification('Account hibernated. You can reactivate anytime!');
                this.speak('Account has been hibernated');
            }
        },

        logout() {
            if (confirm('Are you sure you want to log out?')) {
                this.speak('Logging out');
                // In a real app, this would redirect to login page
                alert('Thank you for using Inclove! You have been logged out.');
            }
        },

        upgradeToPremium() {
            // Simulate payment process
            if (confirm('Upgrade to Premium for $3 lifetime? You will get priority matching, verified badge, unlimited messages, and advanced privacy controls.')) {
                this.profile.isPremium = true;
                this.showNotification('Welcome to Premium! 🎉');
                this.speak('Congratulations! You are now a premium member');
            }
        },

        // Notification system
        saveNotifications() {
            this.showNotificationModal = false;
            this.showNotification('Notification preferences saved!');
            this.speak('Notification settings saved');
        },

        showNotification(message, type = 'success') {
            this.notificationMessage = message;
            this.showNotification = true;

            setTimeout(() => {
                this.showNotification = false;
            }, 3000);
        },

        // Accessibility methods
        toggleAccessibilityPanel() {
            this.showAccessibilityPanel = !this.showAccessibilityPanel;
            this.speak(this.showAccessibilityPanel ? 'Opened accessibility panel' : 'Closed accessibility panel');
        },

        updateZoom() {
            document.body.className = document.body.className.replace(/zoom-\d+/, '') + ` zoom-${this.zoomLevel}`;
            this.speak(`Zoom level changed to ${this.zoomLevel === '1' ? 'normal' : this.zoomLevel === '2' ? 'large' : 'extra large'}`);
        },

        toggleScreenReader() {
            this.speak(this.screenReaderEnabled ? 'Screen reader enabled' : 'Screen reader disabled');
        },

        toggleHighContrast() {
            if (this.highContrastEnabled) {
                document.body.classList.add('high-contrast');
                this.speak('High contrast mode enabled');
            } else {
                document.body.classList.remove('high-contrast');
                this.speak('High contrast mode disabled');
            }
        },

        updateColorBlindMode() {
            // Remove existing colorblind classes
            document.body.classList.remove('colorblind-deuteranopia', 'colorblind-protanopia', 'colorblind-tritanopia');

            if (this.colorBlindMode !== 'none') {
                document.body.classList.add(`colorblind-${this.colorBlindMode}`);
                this.speak(`Color blindness support enabled for ${this.colorBlindMode}`);
            } else {
                this.speak('Color blindness support disabled');
            }
        }
    },

    mounted() {
        // Initialize accessibility settings
        this.updateZoom();

        // Add keyboard navigation support
        document.addEventListener('keydown', (e) => {
            // ESC key to close modals
            if (e.key === 'Escape') {
                if (this.showEditModal) {
                    this.closeEditModal();
                } else if (this.showNotificationModal) {
                    this.closeNotificationModal();
                } else if (this.showAccessibilityPanel) {
                    this.toggleAccessibilityPanel();
                }
            }

            // Alt + A for accessibility panel
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.toggleAccessibilityPanel();
            }
        });

        // Initialize speech synthesis
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
        }

        // Welcome message
        setTimeout(() => {
            this.speak('Welcome to your Inclove profile page. Use Alt+A to open accessibility options.');
        }, 1000);
    },

    beforeUnmount() {
        // Clean up speech synthesis
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        clearTimeout(this.typingTimeout);
    }
}).mount('#app');
