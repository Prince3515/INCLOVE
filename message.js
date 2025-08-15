
const { createApp } = Vue;

createApp({
    data() {
        return {
            messageText: '',
            showAttachmentMenu: false,
            showAccessibilityPanel: false,
            isRecording: false,
            isTyping: false,
            zoomLevel: 1,
            announcement: '',
            speechSynthesis: window.speechSynthesis,
            typingTimeout: null,

            currentUser: {
                name: 'Sarah Chen',
                status: 'Active 5 minutes ago'
            },

            profilePic: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjgiIGZpbGw9IiNmM2Y0ZjYiIHN0cm9rZT0iIzZiNzI4MCIgc3Ryb2tlLXdpZHRoPSI0Ii8+CjxjaXJjbGUgY3g9IjIyIiBjeT0iMjIiIHI9IjMiIGZpbGw9IiM2MzY2ZjEiLz4KPGNpcmNsZSBjeD0iMzgiIGN5PSIyMiIgcj0iMyIgZmlsbD0iIzYzNjZmMSIvPgo8cGF0aCBkPSJNMjAgMzhjMC04IDQtMTIgMTAtMTJzMTAgNCAxMCAxMiIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPC9zdmc+",

            messages: [
                {
                    id: 1,
                    text: "Hi! I saw your profile and loved your photography work! The sunset shots are absolutely beautiful 📸",
                    sender: "Sarah",
                    type: "received",
                    timestamp: new Date(Date.now() - 300000)
                },
                {
                    id: 2,
                    text: "Thank you so much! Photography has been my passion for years. I love capturing moments that tell stories. What about you? What brings you joy?",
                    sender: "You",
                    type: "sent",
                    timestamp: new Date(Date.now() - 240000)
                },
                {
                    id: 3,
                    text: "I'm really into adaptive gardening! I've created a whole system for growing herbs and vegetables that works with my mobility needs. Here's my latest harvest:",
                    sender: "Sarah",
                    type: "received",
                    timestamp: new Date(Date.now() - 180000),
                    media: {
                        type: 'image',
                        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxyZWN0IHg9IjIwIiB5PSI2MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMTBiOTgxIi8+CjxyZWN0IHg9IjEwMCIgeT0iNDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmNTllMGIiLz4KPHJlY3QgeD0iMTgwIiB5PSI1MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjZWY0NDQ0Ii8+CjxyZWN0IHg9IjI2MCIgeT0iNzAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzgzMzNlYSIvPgo8dGV4dCB4PSIxNTAiIHk9IjE4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzM3NDE1MSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPkFkYXB0aXZlIEdhcmRlbiBIYXJ2ZXN0PC90ZXh0Pgo8L3N2Zz4=",
                        alt: "Adaptive garden harvest showing various vegetables"
                    }
                }
            ],

            emotions: [
                { emoji: '💙', label: 'Supportive' },
                { emoji: '🌟', label: 'Encouraging' },
                { emoji: '🤝', label: 'Understanding' },
                { emoji: '😊', label: 'Cheerful' }
            ],

            settings: {
                screenReader: false,
                highContrast: false,
                darkMode: false,
                colorBlindFilter: 'none'
            }
        }
    },

    computed: {
        canSend() {
            return this.messageText.trim().length > 0;
        },

        zoomDisplay() {
            return Math.round(this.zoomLevel * 100);
        }
    },

    methods: {
        goToProfile() {
            this.announce("Navigating to Sarah's profile");
            alert("Would navigate to Sarah's profile page");
        },

        sendMessage() {
            if (!this.canSend) return;

            const newMessage = {
                id: Date.now(),
                text: this.messageText,
                sender: 'You',
                type: 'sent',
                timestamp: new Date()
            };

            this.messages.push(newMessage);
            this.announce(`Message sent: ${this.messageText}`);
            this.messageText = '';

            this.$nextTick(() => {
                this.scrollToBottom();
            });

            // Simulate response
            this.simulateResponse();
        },

        simulateResponse() {
            setTimeout(() => {
                const responses = [
                    "That sounds wonderful! I'd love to learn more about that.",
                    "Thank you for sharing! Your perspective is really interesting.",
                    "I completely understand. Thanks for being so open with me."
                ];

                const randomResponse = responses[Math.floor(Math.random() * responses.length)];

                const responseMessage = {
                    id: Date.now(),
                    text: randomResponse,
                    sender: 'Sarah',
                    type: 'received',
                    timestamp: new Date()
                };

                this.messages.push(responseMessage);

                if (this.settings.screenReader) {
                    this.speak(`New message from Sarah: ${randomResponse}`);
                }

                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            }, 1500);
        },

        handleKeyDown(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.sendMessage();
            }
        },

        handleInput() {
            this.autoResizeTextarea();
            this.hideAttachmentMenu();
            this.handleTyping();
        },

        autoResizeTextarea() {
            const textarea = this.$refs.messageInput;
            if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
            }
        },

        handleTyping() {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                // Hide typing indicator logic would go here
            }, 1000);
        },

        toggleAttachmentMenu() {
            this.showAttachmentMenu = !this.showAttachmentMenu;

            if (this.showAttachmentMenu) {
                this.announce("Attachment menu opened");
                setTimeout(() => {
                    document.addEventListener('click', this.closeAttachmentMenuOutside);
                }, 100);
            } else {
                this.announce("Attachment menu closed");
                document.removeEventListener('click', this.closeAttachmentMenuOutside);
            }
        },

        hideAttachmentMenu() {
            this.showAttachmentMenu = false;
            document.removeEventListener('click', this.closeAttachmentMenuOutside);
        },

        closeAttachmentMenuOutside(event) {
            const attachmentMenu = document.querySelector('.attachment-menu');
            const plusButton = document.querySelector('.plus-button');

            if (attachmentMenu && plusButton &&
                !attachmentMenu.contains(event.target) &&
                !plusButton.contains(event.target)) {
                this.hideAttachmentMenu();
            }
        },

        triggerFileInput(type) {
            this.$refs[type + 'Input'].click();
            this.hideAttachmentMenu();
        },

        handleFileUpload(event, type) {
            const file = event.target.files[0];
            if (file) {
                const fileType = type === 'photo' ? 'Photo' : 'Video';
                const message = {
                    id: Date.now(),
                    text: `📎 ${fileType} attached: ${file.name}`,
                    sender: 'You',
                    type: 'sent',
                    timestamp: new Date()
                };

                this.messages.push(message);
                this.announce(`${fileType} attached and sent`);

                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            }
        },

        toggleVoiceNote() {
            if (!this.isRecording) {
                this.startRecording();
            } else {
                this.stopRecording();
            }

            this.isRecording = !this.isRecording;
            this.hideAttachmentMenu();
        },

        startRecording() {
            this.announce("Voice recording started");
            console.log("Voice recording started");
        },

        stopRecording() {
            const message = {
                id: Date.now(),
                text: "🎤 Voice note (0:15)",
                sender: 'You',
                type: 'sent',
                timestamp: new Date()
            };

            this.messages.push(message);
            this.announce("Voice recording stopped and sent");

            this.$nextTick(() => {
                this.scrollToBottom();
            });
        },

        addEmotion(emoji) {
            this.messageText += ` ${emoji}`;
            this.$refs.messageInput.focus();
            this.announce(`Added ${emoji} emotion to message`);
            this.autoResizeTextarea();
        },

        openMediaViewer(media) {
            this.announce("Opening image viewer");
            alert("Would open full-screen image viewer");
        },

        toggleAccessibilityPanel() {
            this.showAccessibilityPanel = !this.showAccessibilityPanel;

            if (this.showAccessibilityPanel) {
                this.announce("Accessibility panel opened");
            } else {
                this.announce("Accessibility panel closed");
            }
        },

        toggleScreenReader() {
            if (this.settings.screenReader) {
                this.announce("Screen reader enabled");
            } else {
                this.announce("Screen reader disabled");
            }
        },

        adjustZoom(delta) {
            this.zoomLevel = Math.max(0.5, Math.min(2, this.zoomLevel + delta));
            document.body.style.setProperty('--zoom-level', this.zoomLevel);
            this.announce(`Zoom level changed to ${this.zoomDisplay}%`);
        },

        announce(message) {
            this.announcement = message;
            setTimeout(() => {
                this.announcement = '';
            }, 1000);
        },

        speak(text) {
            if (this.speechSynthesis && this.settings.screenReader) {
                const utterance = new SpeechSynthesisUtterance(text);
                this.speechSynthesis.speak(utterance);
            }
        },

        formatTime(timestamp) {
            return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },

        scrollToBottom() {
            const container = this.$refs.messagesContainer;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }
    },

    watch: {
        'settings.colorBlindFilter'(newValue) {
            document.body.className = newValue !== 'none' ? newValue : '';
        }
    },

    mounted() {
        this.scrollToBottom();

        // Auto-focus message input
        this.$refs.messageInput.focus();

        // Apply initial zoom
        document.body.style.setProperty('--zoom-level', this.zoomLevel);
    }
}).mount('#app');
