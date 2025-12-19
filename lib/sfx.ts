'use client';

class AudioSynthesizer {
    ctx: AudioContext | null = null;
    enabled: boolean = true;

    constructor() {
        if (typeof window !== 'undefined') {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
    }

    private init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playHover() {
        if (!this.enabled || !this.ctx) {
            this.init();
            if (!this.ctx) return;
        }
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // High tech blip
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        } catch (e) {
            // Ignore auto-play errors
        }
    }

    playClick() {
        if (!this.enabled || !this.ctx) {
            this.init();
            if (!this.ctx) return;
        }
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Heavy mechanical click
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);
        } catch (e) {
            // Ignore
        }
    }

    playSuccess() {
        if (!this.enabled || !this.ctx) {
            this.init();
            if (!this.ctx) return;
        }
        try {
            const now = this.ctx.currentTime;

            // Arpeggio
            [440, 554, 659, 880].forEach((freq, i) => {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.value = freq;

                const start = now + (i * 0.05);
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.1, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(start);
                osc.stop(start + 0.3);
            });
        } catch (e) {
            // Ignore
        }
    }

    playError() {
        if (!this.enabled || !this.ctx) {
            this.init();
            if (!this.ctx) return;
        }
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Low pitch sawtooth
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.2);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        } catch (e) {
            // Ignore
        }
    }

    playArchitectTone() {
        if (!this.enabled || !this.ctx) {
            this.init();
            if (!this.ctx) return;
        }
        try {
            const now = this.ctx.currentTime;

            // Clean sine blip with rapid pitch drop
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(now + 0.1);
        } catch (e) {
            // Ignore
        }
    }
}

export const sfx = new AudioSynthesizer();
