export class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext | null = null;
    private bgmNode: AudioBufferSourceNode | null = null;
    private buffers: Map<string, AudioBuffer> = new Map();
    private isMuted: boolean = false;
    private initialized: boolean = false;

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
            // Preload sounds here if we had files
            // await this.loadSound('bgm', '/assets/audio/bgm_cheerful.mp3');
            // await this.loadSound('pop', '/assets/audio/pop.mp3');
            // await this.loadSound('win', '/assets/audio/win.mp3');
            // await this.loadSound('crash', '/assets/audio/crash.mp3');
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

    public playSFX(name: string) {
        if (this.isMuted || !this.ctx) return;

        // Fallback to synthetic sounds if file not found (for prototype)
        if (!this.buffers.has(name)) {
            this.playSyntheticSFX(name);
            return;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers.get(name)!;
        source.connect(this.ctx.destination);
        source.start();
    }

    public playBGM(name: string) {
        if (this.isMuted || !this.ctx) return;

        // Stop existing BGM
        if (this.bgmNode) {
            this.bgmNode.stop();
            this.bgmNode = null;
        }

        if (this.buffers.has(name)) {
            this.bgmNode = this.ctx.createBufferSource();
            this.bgmNode.buffer = this.buffers.get(name)!;
            this.bgmNode.loop = true;
            this.bgmNode.connect(this.ctx.destination);
            this.bgmNode.start();
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

    // --- Synthetic Sounds for Prototype ---
    private playSyntheticSFX(type: string) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        switch (type) {
            case 'pop': // High pitch short beep
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'crash': // Low noise/sawtooth
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'win': // Major arpeggio
                this.playNote(523.25, now, 0.1); // C
                this.playNote(659.25, now + 0.1, 0.1); // E
                this.playNote(783.99, now + 0.2, 0.4); // G
                break;
        }
    }

    private playNote(freq: number, time: number, duration: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.linearRampToValueAtTime(0, time + duration);

        osc.start(time);
        osc.stop(time + duration);
    }
}
