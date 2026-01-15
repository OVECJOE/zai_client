/**
 * Audio Manager for game sound effects and music
 */

type SoundEffect = 
  | 'stone_place'
  | 'stone_capture'
  | 'invalid_move'
  | 'game_start'
  | 'game_end'
  | 'match_found'
  | 'turn_change'
  | 'timer_warning';

class AudioManager {
  private context: AudioContext | null = null;
  private sounds: Map<SoundEffect, AudioBuffer> = new Map();
  private musicElement: HTMLAudioElement | null = null;
  private volume = 0.7;
  private musicVolume = 0.3;
  private enabled = true;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create AudioContext (requires user interaction)
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if suspended (iOS requirement)
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      // Load sound effects
      await this.loadSounds();
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  private async loadSounds(): Promise<void> {
    const soundFiles: Record<SoundEffect, string> = {
      stone_place: '/sounds/stone-place.mp3',
      stone_capture: '/sounds/stone-capture.mp3',
      invalid_move: '/sounds/invalid.mp3',
      game_start: '/sounds/game-start.mp3',
      game_end: '/sounds/game-end.mp3',
      match_found: '/sounds/match-found.mp3',
      turn_change: '/sounds/turn-change.mp3',
      timer_warning: '/sounds/timer-warning.mp3',
    };

    // For now, generate simple tones as placeholders
    // In production, replace with actual audio files
    for (const [sound, _url] of Object.entries(soundFiles)) {
      try {
        const buffer = this.generateTone(sound as SoundEffect);
        this.sounds.set(sound as SoundEffect, buffer);
      } catch (error) {
        console.error(`Failed to load sound: ${sound}`, error);
      }
    }
  }

  private generateTone(type: SoundEffect): AudioBuffer {
    if (!this.context) throw new Error('AudioContext not initialized');

    const sampleRate = this.context.sampleRate;
    const duration = 0.2;
    const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate different frequencies for different sounds
    const frequencies: Record<SoundEffect, number> = {
      stone_place: 440,
      stone_capture: 330,
      invalid_move: 200,
      game_start: 523,
      game_end: 392,
      match_found: 587,
      turn_change: 466,
      timer_warning: 880,
    };

    const frequency = frequencies[type];
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Sine wave with envelope
      const envelope = Math.exp(-t * 5);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  play(sound: SoundEffect): void {
    if (!this.enabled || !this.context || !this.initialized) return;

    const buffer = this.sounds.get(sound);
    if (!buffer) return;

    try {
      const source = this.context.createBufferSource();
      const gainNode = this.context.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = this.volume;
      
      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      source.start(0);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }

  playMusic(url: string): void {
    if (!this.enabled) return;

    try {
      if (this.musicElement) {
        this.musicElement.pause();
        this.musicElement = null;
      }

      this.musicElement = new Audio(url);
      this.musicElement.volume = this.musicVolume;
      this.musicElement.loop = true;
      this.musicElement.play().catch((error) => {
        console.error('Failed to play music:', error);
      });
    } catch (error) {
      console.error('Failed to play music:', error);
    }
  }

  stopMusic(): void {
    if (this.musicElement) {
      this.musicElement.pause();
      this.musicElement = null;
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicElement) {
      this.musicElement.volume = this.musicVolume;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Initialize on user interaction
  initOnUserInteraction(): void {
    const handler = () => {
      this.init();
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
    };

    document.addEventListener('click', handler, { once: true });
    document.addEventListener('touchstart', handler, { once: true });
  }
}

export const audioManager = new AudioManager();
