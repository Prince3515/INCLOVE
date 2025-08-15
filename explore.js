
const { createApp } = Vue;

createApp({
  data() {
    return {
      currentProfileIndex: 0,
      isTransitioning: false,
      cardTransition: '',
      accessibilityMenuOpen: false,
      screenReaderEnabled: false,
      zoomLevel: 100,
      highContrastEnabled: false,
      colorblindFriendlyEnabled: false,
      voiceCommandsEnabled: false,
      isListening: false,
      voiceStatus: 'Listening for commands...',
      recognition: null,
      speechSynthesis: null,
      profiles: [
        {
          name: 'Emma',
          age: 24,
          bio: 'Adventure seeker who loves painting sunsets, hiking mountain trails, and having deep conversations over coffee. Always up for trying new cuisines! ✨',
          image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          interests: ['🎨 Art', '🏔️ Hiking', '☕ Coffee', '📸 Photography', '🌅 Travel'],
          rating: 4.2
        },
        {
          name: 'Alex',
          age: 27,
          bio: 'Tech enthusiast and weekend warrior. Love coding by day and rock climbing by night. Always down for a good movie marathon! 🚀',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          interests: ['💻 Tech', '🧗 Climbing', '🎬 Movies', '🎮 Gaming', '🍕 Food'],
          rating: 3.8
        },
        {
          name: 'Maya',
          age: 25,
          bio: 'Yoga instructor and mindfulness advocate. Passionate about sustainable living and exploring hidden gems around the city. 🧘‍♀️',
          image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          interests: ['🧘 Yoga', '🌱 Sustainability', '🏙️ Exploring', '📚 Reading', '🥗 Health'],
          rating: 4.6
        }
      ]
    }
  },
  computed: {
    currentProfile() {
      return this.profiles[this.currentProfileIndex];
    }
  },
  mounted() {
    this.initializeAccessibility();
    this.setupKeyboardNavigation();
  },
  methods: {
    initializeAccessibility() {
      // Initialize Speech Recognition
      if ('webkitSpeechRecognition' in window) {
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
          const result = event.results[event.results.length - 1];
          if (result.isFinal) {
            this.processVoiceCommand(result[0].transcript.toLowerCase());
          }
        };

        this.recognition.onerror = () => {
          this.voiceStatus = 'Voice recognition error. Please try again.';
        };

        this.recognition.onend = () => {
          if (this.voiceCommandsEnabled && this.isListening) {
            this.recognition.start();
          }
        };
      }

      // Initialize Speech Synthesis
      this.speechSynthesis = window.speechSynthesis;
    },

    setupKeyboardNavigation() {
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            this.dislikeProfile();
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.likeProfile();
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.messageProfile();
            break;
          case ' ':
            if (e.target === document.body) {
              e.preventDefault();
              this.readProfileAloud();
            }
            break;
        }
      });
    },

    toggleAccessibilityMenu() {
      this.accessibilityMenuOpen = !this.accessibilityMenuOpen;
      const toggle = document.querySelector('.accessibility-toggle');
      toggle.setAttribute('aria-expanded', this.accessibilityMenuOpen.toString());
    },

    toggleScreenReader() {
      this.screenReaderEnabled = !this.screenReaderEnabled;
      if (this.screenReaderEnabled) {
        this.readProfileAloud();
      }
    },

    readProfileAloud() {
      if (!this.speechSynthesis) return;

      this.speechSynthesis.cancel();
      const profile = this.currentProfile;

      const text = `Profile of ${profile.name}, age ${profile.age}. 
                                  Biography: ${profile.bio}. 
                                  Interests include: ${profile.interests.join(', ')}. 
                                  Community rating: ${this.getRatingText(profile.rating)}.
                                  Use arrow keys or voice commands to interact.`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      this.speechSynthesis.speak(utterance);
    },

    zoomIn() {
      if (this.zoomLevel < 200) {
        this.zoomLevel += 25;
        this.announceZoomChange();
      }
    },

    zoomOut() {
      if (this.zoomLevel > 50) {
        this.zoomLevel -= 25;
        this.announceZoomChange();
      }
    },

    announceZoomChange() {
      if (this.screenReaderEnabled && this.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(`Zoom level ${this.zoomLevel} percent`);
        utterance.volume = 0.5;
        this.speechSynthesis.speak(utterance);
      }
    },

    toggleHighContrast() {
      this.highContrastEnabled = !this.highContrastEnabled;
      document.body.classList.toggle('high-contrast', this.highContrastEnabled);
      this.announceAccessibilityChange('High contrast', this.highContrastEnabled);
    },

    toggleColorblindFriendly() {
      this.colorblindFriendlyEnabled = !this.colorblindFriendlyEnabled;
      document.body.classList.toggle('colorblind-friendly', this.colorblindFriendlyEnabled);
      this.announceAccessibilityChange('Colorblind friendly mode', this.colorblindFriendlyEnabled);
    },

    toggleVoiceCommands() {
      this.voiceCommandsEnabled = !this.voiceCommandsEnabled;

      if (this.voiceCommandsEnabled && this.recognition) {
        this.startListening();
      } else {
        this.stopListening();
      }

      this.announceAccessibilityChange('Voice commands', this.voiceCommandsEnabled);
    },

    startListening() {
      if (!this.recognition) return;

      this.isListening = true;
      this.voiceStatus = 'Listening for commands...';
      try {
        this.recognition.start();
      } catch (e) {
        console.log('Recognition already started');
      }
    },

    stopListening() {
      if (!this.recognition) return;

      this.isListening = false;
      this.recognition.stop();
    },

    processVoiceCommand(command) {
      console.log('Voice command:', command);

      if (command.includes('like') || command.includes('yes') || command.includes('interested')) {
        this.voiceStatus = 'Command recognized: Like';
        setTimeout(() => this.likeProfile(), 500);
      } else if (command.includes('pass') || command.includes('no') || command.includes('next') || command.includes('dislike')) {
        this.voiceStatus = 'Command recognized: Pass';
        setTimeout(() => this.dislikeProfile(), 500);
      } else if (command.includes('message') || command.includes('chat')) {
        this.voiceStatus = 'Command recognized: Message';
        setTimeout(() => this.messageProfile(), 500);
      } else if (command.includes('read') || command.includes('profile')) {
        this.voiceStatus = 'Reading profile...';
        setTimeout(() => this.readProfileAloud(), 500);
      } else {
        this.voiceStatus = 'Command not recognized. Try "like", "pass", or "message"';
        setTimeout(() => {
          this.voiceStatus = 'Listening for commands...';
        }, 2000);
      }
    },

    announceAccessibilityChange(feature, enabled) {
      if (this.speechSynthesis) {
        const status = enabled ? 'enabled' : 'disabled';
        const utterance = new SpeechSynthesisUtterance(`${feature} ${status}`);
        utterance.volume = 0.7;
        this.speechSynthesis.speak(utterance);
      }
    },

    likeProfile() {
      if (this.isTransitioning) return;

      this.isTransitioning = true;
      this.cardTransition = 'card-transition-like';

      if (this.screenReaderEnabled) {
        this.speak(`You liked ${this.currentProfile.name}`);
      }

      this.createHeartEffect();

      setTimeout(() => {
        this.nextProfile();
      }, 500);
    },

    dislikeProfile() {
      if (this.isTransitioning) return;

      this.isTransitioning = true;
      this.cardTransition = 'card-transition-dislike';

      if (this.screenReaderEnabled) {
        this.speak(`You passed on ${this.currentProfile.name}`);
      }

      setTimeout(() => {
        this.nextProfile();
      }, 500);
    },

    messageProfile() {
      if (this.screenReaderEnabled) {
        this.speak(`Opening chat with ${this.currentProfile.name}`);
      }

      // Create bounce effect
      const card = document.getElementById('profileCard');
      card.style.animation = 'bounce 0.6s ease-in-out';

      setTimeout(() => {
        card.style.animation = '';
        alert(`Opening chat with ${this.currentProfile.name}... 💬`);
      }, 600);
    },

    nextProfile() {
      setTimeout(() => {
        this.currentProfileIndex = (this.currentProfileIndex + 1) % this.profiles.length;
        this.cardTransition = '';
        this.isTransitioning = false;

        if (this.screenReaderEnabled) {
          setTimeout(() => {
            this.readProfileAloud();
          }, 300);
        }
      }, 100);
    },

    createHeartEffect() {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          const heart = document.createElement('div');
          heart.innerHTML = '❤️';
          heart.style.position = 'fixed';
          heart.style.left = (Math.random() * window.innerWidth) + 'px';
          heart.style.top = '50%';
          heart.style.fontSize = '2rem';
          heart.style.pointerEvents = 'none';
          heart.style.zIndex = '1000';
          heart.style.animation = 'heartFloat 2s ease-out forwards';
          document.body.appendChild(heart);

          setTimeout(() => {
            heart.remove();
          }, 2000);
        }, i * 100);
      }
    },

    speak(text) {
      if (this.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = 0.8;
        this.speechSynthesis.speak(utterance);
      }
    },

    getRatingText(rating) {
      const roundedRating = Math.round(rating);
      const descriptions = {
        1: 'Getting Started',
        2: 'Building Connections',
        3: 'Well Liked',
        4: 'Highly Rated',
        5: 'Community Favorite'
      };
      return `${rating.toFixed(1)} - ${descriptions[roundedRating]}`;
    },

    navigateTo(page) {
      if (this.screenReaderEnabled) {
        this.speak(`Navigating to ${page}`);
      }
      console.log(`Navigating to ${page}`);
    },

    signOut() {
      if (this.screenReaderEnabled) {
        this.speak('Signing out');
      }
      console.log('Signing out...');
    }
  }
}).mount('#app');

// Add heart float animation
const style = document.createElement('style');
style.textContent = `
            @keyframes heartFloat {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-200px) scale(0.3);
                }
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-20px);
                }
                60% {
                    transform: translateY(-10px);
                }
            }
        `;
document.head.appendChild(style);
