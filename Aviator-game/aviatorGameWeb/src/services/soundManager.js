// Sound Manager - Centralized sound control for the entire game
class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            soundVolume: 70,
            musicVolume: 50,
        };
        this.loadSettings();
        this.setupEventListeners();
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('gameSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.error('Error loading sound settings:', error);
        }
    }

    setupEventListeners() {
        // Listen for settings changes from anywhere in the app
        window.addEventListener('settingsChanged', (event) => {
            this.updateSettings(event.detail);
        });
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };

        // Update all registered sounds
        this.sounds.forEach((audioData, key) => {
            const { audio, type } = audioData;

            if (type === 'sound') {
                if (this.settings.soundEnabled) {
                    audio.volume = (this.settings.soundVolume || 70) / 100;
                } else {
                    audio.volume = 0;
                    audio.pause();
                }
            } else if (type === 'music') {
                if (this.settings.musicEnabled) {
                    audio.volume = (this.settings.musicVolume || 50) / 100;
                } else {
                    audio.volume = 0;
                    audio.pause();
                }
            }
        });
    }

    // Register a sound/music element
    register(key, audio, type = 'sound') {
        this.sounds.set(key, { audio, type });

        // Apply current settings
        if (type === 'sound') {
            audio.volume = this.settings.soundEnabled ? (this.settings.soundVolume || 70) / 100 : 0;
        } else if (type === 'music') {
            audio.volume = this.settings.musicEnabled ? (this.settings.musicVolume || 50) / 100 : 0;
        }

        return audio;
    }

    // Unregister a sound
    unregister(key) {
        const audioData = this.sounds.get(key);
        if (audioData) {
            audioData.audio.pause();
            audioData.audio.src = '';
            this.sounds.delete(key);
        }
    }

    // Play a sound (respects settings)
    play(key) {
        const audioData = this.sounds.get(key);
        if (!audioData) {
            return;
        }

        const { audio, type } = audioData;

        if (type === 'sound' && !this.settings.soundEnabled) {
            return;
        }
        if (type === 'music' && !this.settings.musicEnabled) {
            return;
        }

        audio.play().catch(() => { });
    }

    // Pause a sound
    pause(key) {
        const audioData = this.sounds.get(key);
        if (audioData) {
            audioData.audio.pause();
        }
    }

    // Stop a sound (pause and reset)
    stop(key) {
        const audioData = this.sounds.get(key);
        if (audioData) {
            audioData.audio.pause();
            audioData.audio.currentTime = 0;
        }
    }

    // Stop all sounds
    stopAll() {
        this.sounds.forEach((audioData) => {
            audioData.audio.pause();
            audioData.audio.currentTime = 0;
        });
    }

    // Pause all sounds
    pauseAll() {
        this.sounds.forEach((audioData) => {
            audioData.audio.pause();
        });
    }

    // Resume all sounds (respects settings)
    resumeAll() {
        this.sounds.forEach((audioData) => {
            const { audio, type } = audioData;

            if (type === 'sound' && this.settings.soundEnabled) {
                audio.play().catch(() => { });
            } else if (type === 'music' && this.settings.musicEnabled) {
                audio.play().catch(() => { });
            }
        });
    }

    // Get current settings
    getSettings() {
        return { ...this.settings };
    }

    // Check if sound is enabled
    isSoundEnabled() {
        return this.settings.soundEnabled;
    }

    // Check if music is enabled
    isMusicEnabled() {
        return this.settings.musicEnabled;
    }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;
