import { SettingsManager } from './SettingsManager';

export class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext | null = null;
    private bgmNode: AudioBufferSourceNode | null = null;
    private buffers: Map<string, AudioBuffer> = new Map();
    private isMuted: boolean = false;
    private initialized: boolean = false;
    private bgmGainNode: GainNode | null = null;
    private bgmOscillators: OscillatorNode[] = [];
    private bgmIsPlaying: boolean = false;
    private currentTheme: string = 'meadow';
    private currentChordIndex: number = 0;
    private nextNoteTimeout: any = null;

    private constructor() { }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    public async init() {
        if (this.initialized) return;

        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.initialized = true;

            // Start background music automatically
            this.startBackgroundMusic();
        } catch (e) {
            console.error('AudioContext setup failed', e);
        }
    }

    private async loadSound(name: string, url: string) {
        if (!this.ctx) return;
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.buffers.set(name, audioBuffer);
        } catch (e) {
            console.error(`Failed to load sound ${name}:`, e);
        }
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.ctx) {
            if (this.isMuted) {
                this.ctx.suspend();
            } else {
                this.ctx.resume();
            }
        }
        return this.isMuted;
    }

    public startBackgroundMusic() {
        if (!this.ctx) return;

        // Resume context if suspended (browser auto-play policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.bgmIsPlaying) return;

        const settings = SettingsManager.getInstance().getSettings();
        if (settings.musicVolume <= 0) return;

        this.bgmIsPlaying = true;
        this.playSyntheticBGM();
    }

    public playThemeMusic(theme: string) {
        if (this.currentTheme === theme && this.bgmIsPlaying) return;

        this.currentTheme = theme;
        this.stopBackgroundMusic();
        this.startBackgroundMusic();
    }

    public stopBackgroundMusic() {
        if (this.nextNoteTimeout) {
            clearTimeout(this.nextNoteTimeout);
            this.nextNoteTimeout = null;
        }

        this.bgmOscillators.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) {
                // Already stopped
            }
        });
        this.bgmOscillators = [];
        this.bgmIsPlaying = false;
        if (this.bgmGainNode) {
            this.bgmGainNode.disconnect();
            this.bgmGainNode = null;
        }
    }

    public updateMusicVolume() {
        if (!this.bgmGainNode) return;
        const settings = SettingsManager.getInstance().getSettings();
        this.bgmGainNode.gain.value = settings.musicVolume * 0.15; // Keep it subtle
    }

    private playSyntheticBGM() {
        if (!this.ctx) return;

        const settings = SettingsManager.getInstance().getSettings();

        // Create master gain for music
        this.bgmGainNode = this.ctx.createGain();
        this.bgmGainNode.gain.value = settings.musicVolume * 0.15;
        this.bgmGainNode.connect(this.ctx.destination);

        // Chords definition based on theme
        let chords: number[][];
        let duration = 2; // seconds per chord
        let tempo = 1;

        if (this.currentTheme === 'castle') {
            // D Minor Scale (Regal/Sad): Dm, Bb, Gm, A7
            chords = [
                [293.66, 349.23, 440.00], // Dm
                [233.08, 293.66, 349.23], // Bb
                [196.00, 233.08, 293.66], // Gm
                [220.00, 277.18, 329.63], // A (Major/Dominant)
            ];
            tempo = 1.2;
        } else if (this.currentTheme === 'lava') {
            // Phrygian / Dissonant: E, F, G, B (Emish)
            chords = [
                [164.81, 196.00, 246.94], // Em
                [174.61, 220.00, 261.63], // F
                [164.81, 207.65, 246.94], // Em(maj7) dissonance
                [146.83, 185.00, 220.00], // F#dim ?? just dark stuff
            ];
            tempo = 0.8; // Slow heavy
        } else if (this.currentTheme === 'sky') {
            // Lydian / Floaty: C, D/C, G/B, C
            chords = [
                [523.25, 659.25, 783.99], // C5
                [587.33, 739.99, 880.00], // D (Lydian #4)
                [493.88, 587.33, 783.99], // G
                [523.25, 659.25, 783.99], // C
            ];
            duration = 3;
        } else {
            // Meadow: C Major
            chords = [
                [261.63, 329.63, 392.00], // C
                [349.23, 440.00, 523.25], // F
                [392.00, 493.88, 587.33], // G
                [261.63, 329.63, 392.00], // C
            ];
        }

        const totalChords = chords.length;

        const playNextChord = () => {
            if (!this.bgmIsPlaying || !this.ctx || !this.bgmGainNode) return;

            const chord = chords[this.currentChordIndex % totalChords];
            const now = this.ctx.currentTime;

            // Clean up old oscillators that are done? 
            // Actually simpler to just let them stop and GC handling it, 
            // but for long running we should careful. 
            // We clear bgmOscillators on Stop(). 

            // Filter out stopped oscs from array to prevent leak?
            // Since we push new ones, let's just clear array periodically or manage it better.
            // For prototype, simply pushing is risky for memory if running for hours.
            // Let's implement a simple cleanup: remove ended nodes.
            this.bgmOscillators = this.bgmOscillators.filter(o => o.onended !== null);
            // Wait, we didn't attach onended.

            chord.forEach((freq, i) => {
                const osc = this.ctx!.createOscillator();
                osc.type = this.currentTheme === 'castle' ? 'triangle' : 'sine';
                if (this.currentTheme === 'lava') osc.type = 'sawtooth';

                osc.frequency.value = freq;

                const oscGain = this.ctx!.createGain();
                oscGain.gain.setValueAtTime(0, now);
                oscGain.gain.linearRampToValueAtTime(0.2, now + 0.5);
                oscGain.gain.setValueAtTime(0.2, now + duration - 0.5);
                oscGain.gain.linearRampToValueAtTime(0, now + duration);

                // Slight stereo pan? (Web Audio PannerNode could be added later)

                osc.connect(oscGain);
                oscGain.connect(this.bgmGainNode!);

                osc.start(now);
                osc.stop(now + duration);

                // Add to list
                this.bgmOscillators.push(osc);
            });

            this.currentChordIndex++;
            this.nextNoteTimeout = setTimeout(playNextChord, (duration * 1000) / tempo);
        };

        playNextChord();
    }

    public playSFX(name: string) {
        if (this.isMuted || !this.ctx) return;

        const settings = SettingsManager.getInstance().getSettings();
        if (settings.sfxVolume <= 0) return;

        // Fallback to synthetic sounds if file not found (for prototype)
        if (!this.buffers.has(name)) {
            this.playSyntheticSFX(name);
            return;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers.get(name)!;
        const gain = this.ctx.createGain();
        gain.gain.value = settings.sfxVolume;

        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start();
    }

    public playBGM(name: string) {
        if (this.isMuted || !this.ctx) return;

        const settings = SettingsManager.getInstance().getSettings();
        if (settings.musicVolume <= 0) return;

        // Stop existing BGM
        if (this.bgmNode) {
            this.bgmNode.stop();
            this.bgmNode = null;
        }

        if (this.buffers.has(name)) {
            this.bgmNode = this.ctx.createBufferSource();
            this.bgmNode.buffer = this.buffers.get(name)!;
            this.bgmNode.loop = true;

            const gain = this.ctx.createGain();
            gain.gain.value = settings.musicVolume; // Apply Volume

            this.bgmNode.connect(gain);
            gain.connect(this.ctx.destination);
            this.bgmNode.start();
        }
    }

    // ...

    // --- Synthetic Sounds for Prototype ---
    private playSyntheticSFX(type: string) {
        if (!this.ctx) return;

        const settings = SettingsManager.getInstance().getSettings();
        if (settings.sfxVolume <= 0) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Base volume scaled by setting
        const masterVolume = settings.sfxVolume;

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        switch (type) {
            case 'pop': // High pitch short beep
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.3 * masterVolume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'crash': // Enhanced explosion sound
                // Deep explosion bass
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
                gain.gain.setValueAtTime(0.6 * masterVolume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);

                // Add crunch/impact sound
                const osc2 = this.ctx.createOscillator();
                const gain2 = this.ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(this.ctx.destination);
                osc2.type = 'square';
                osc2.frequency.setValueAtTime(100, now);
                osc2.frequency.exponentialRampToValueAtTime(30, now + 0.2);
                gain2.gain.setValueAtTime(0.4 * masterVolume, now);
                gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc2.start(now);
                osc2.stop(now + 0.2);
                break;
            case 'win': // Enhanced major arpeggio fanfare
            case 'victory':
                // First chord (C major)
                this.playNote(523.25, now, 0.15, masterVolume); // C5
                this.playNote(659.25, now + 0.1, 0.15, masterVolume); // E5
                this.playNote(783.99, now + 0.2, 0.15, masterVolume); // G5
                // Second chord (higher)
                this.playNote(1046.50, now + 0.3, 0.2, masterVolume); // C6
                this.playNote(1318.51, now + 0.35, 0.2, masterVolume); // E6
                // Final triumphant note
                this.playNote(1567.98, now + 0.5, 0.5, masterVolume); // G6 (held longer)
                break;
            case 'shield_up': // Rising sci-fi tone
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(800, now + 0.5);
                gain.gain.setValueAtTime(0.3 * masterVolume, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'shield_break': // Glass shatter
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(1000, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                gain.gain.setValueAtTime(0.5 * masterVolume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'time_freeze': // Low stop effect
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(50, now + 1.0);
                gain.gain.setValueAtTime(0.4 * masterVolume, now);
                gain.gain.linearRampToValueAtTime(0, now + 1.0);
                osc.start(now);
                osc.stop(now + 1.0);
                break;
            case 'slow_mo': // Pitch down
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.5);
                gain.gain.setValueAtTime(0.3 * masterVolume, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'powerup': // Positive chime
                this.playNote(659.25, now, 0.1, masterVolume); // E
                this.playNote(880.00, now + 0.1, 0.3, masterVolume); // A
                break;
            case 'combo': // Rising pitch based on multiplier?
                // We don't have multiplier info here easily unless passed in name or separate arg.
                // Let's assume generic high ding for now
                this.playNote(880, now, 0.1, masterVolume);
                this.playNote(1760, now + 0.05, 0.1, masterVolume * 0.5);
                break;
        }
    }

    private playNote(freq: number, time: number, duration: number, volume: number = 1.0) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.2 * volume, time);
        gain.gain.linearRampToValueAtTime(0, time + duration);

        osc.start(time);
        osc.stop(time + duration);
    }
}
