import soundManager from './soundManager';

// Background Music Manager
class BackgroundMusicManager {
    constructor() {
        this.audio = null;
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) return;

        this.audio = new Audio('/background-music.mp3');
        this.audio.loop = true;

        // Register with sound manager
        soundManager.register('backgroundMusic', this.audio, 'music');

        this.isInitialized = true;
    }

    play() {
        if (!this.audio) this.initialize();
        soundManager.play('backgroundMusic');
    }

    pause() {
        if (this.audio) {
            soundManager.pause('backgroundMusic');
        }
    }

    stop() {
        if (this.audio) {
            soundManager.stop('backgroundMusic');
        }
    }

    setVolume(volume) {
        if (this.audio) {
            this.audio.volume = Math.max(0, Math.min(1, volume));
        }
    }

    toggle(enabled) {
        if (!this.audio) this.initialize();

        if (enabled) {
            this.play();
        } else {
            this.pause();
        }
    }

    updateSettings(settings) {
        if (!this.audio) this.initialize();

        if (settings.musicEnabled) {
            if (this.audio.paused) {
                this.play();
            }
        } else {
            this.pause();
        }
    }
}

// Create singleton instance
const backgroundMusic = new BackgroundMusicManager();

export default backgroundMusic;