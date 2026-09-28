'use client';

import { MentorVoice } from './types';

export interface VoicePlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  rate: number; // 0.8 to 1.5
  isMuted: boolean;
  currentMentor: MentorVoice;
  activeId: string | null;
}

export type PlaybackListener = (state: VoicePlaybackState) => void;

class NeuralVoiceEngine {
  private audio: HTMLAudioElement | null = null;
  private audioUrl: string | null = null;
  private listeners: Set<PlaybackListener> = new Set();
  private state: VoicePlaybackState = {
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    volume: 1.0,
    rate: 1.0,
    isMuted: false,
    currentMentor: 'astra',
    activeId: null,
  };

  private currentText: string = '';
  private currentId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.volume = this.state.volume;
    this.audio.playbackRate = this.state.rate;

    this.audio.ontimeupdate = () => {
      if (this.audio) {
        this.updateState({
          currentTime: this.audio.currentTime,
          duration: this.audio.duration || this.state.duration,
        });
      }
    };

    this.audio.onloadedmetadata = () => {
      if (this.audio) {
        this.updateState({
          duration: this.audio.duration || 0,
        });
      }
    };

    this.audio.onended = () => {
      this.updateState({
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        activeId: null,
      });
    };

    this.audio.onerror = (e) => {
      console.warn('Neural audio playback error, falling back to neural browser speech:', e);
      // Fall back to browser neural voices
      this.speakWithBrowserNeural(this.currentText, this.state.currentMentor);
    };
  }

  public subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private updateState(updates: Partial<VoicePlaybackState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((fn) => fn(this.state));
  }

  public getState(): VoicePlaybackState {
    return this.state;
  }

  /**
   * Speak text using high-fidelity neural audio
   */
  public async speak(id: string, text: string, mentor: MentorVoice = 'astra'): Promise<void> {
    if (typeof window === 'undefined') return;

    // If currently speaking this ID and playing, toggle pause
    if (this.state.activeId === id && this.state.isPlaying) {
      this.pause();
      return;
    }

    // If paused on this ID, resume
    if (this.state.activeId === id && this.state.isPaused) {
      this.resume();
      return;
    }

    // Stop current playback
    this.stop();

    this.currentText = text;
    this.currentId = id;
    this.updateState({
      activeId: id,
      currentMentor: mentor,
      isPlaying: true,
      isPaused: false,
      currentTime: 0,
    });

    try {
      // 1. Request Neural TTS from backend route
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: mentor,
          speed: this.state.rate,
        }),
      });

      if (!res.ok) {
        throw new Error(`TTS server returned status ${res.status}`);
      }

      const blob = await res.blob();
      if (this.audioUrl) {
        URL.revokeObjectURL(this.audioUrl);
      }
      this.audioUrl = URL.createObjectURL(blob);

      if (!this.audio) this.initAudio();
      if (this.audio) {
        this.audio.src = this.audioUrl;
        this.audio.volume = this.state.isMuted ? 0 : this.state.volume;
        this.audio.playbackRate = this.state.rate;
        await this.audio.play();
        this.updateState({ isPlaying: true, isPaused: false });
      }
    } catch (err) {
      console.warn('Server neural TTS unavailable, using enhanced local neural speech:', err);
      this.speakWithBrowserNeural(text, mentor);
    }
  }

  /**
   * Fallback using browser-installed Natural/Neural voices
   */
  private speakWithBrowserNeural(text: string, mentor: MentorVoice) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Clean text for speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_~>\[\]\(\)\|]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    // Split text into safe sentence chunks to avoid browser utterance truncation
    const sentences = cleanText.match(/[^.!?]+[.!?]+|\S+/g) || [cleanText];
    const voices = window.speechSynthesis.getVoices();

    // Find highest quality natural/neural voice available
    let chosenVoice: SpeechSynthesisVoice | undefined;
    if (mentor === 'astra') {
      // Prioritize natural female voices
      chosenVoice = voices.find(
        (v) =>
          v.name.includes('Natural') ||
          v.name.includes('Jenny') ||
          v.name.includes('Aria') ||
          v.name.includes('Google UK English Female') ||
          v.name.includes('Samantha') ||
          v.name.includes('Female')
      );
    } else {
      // Prioritize natural male voices
      chosenVoice = voices.find(
        (v) =>
          v.name.includes('Guy') ||
          v.name.includes('Christopher') ||
          v.name.includes('Google UK English Male') ||
          v.name.includes('Daniel') ||
          v.name.includes('David') ||
          v.name.includes('Male')
      );
    }

    let chunkIndex = 0;
    const playNextChunk = () => {
      if (chunkIndex >= sentences.length || !this.state.isPlaying) {
        this.updateState({ isPlaying: false, isPaused: false, activeId: null });
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentences[chunkIndex]);
      if (chosenVoice) utterance.voice = chosenVoice;
      utterance.rate = this.state.rate;
      utterance.volume = this.state.isMuted ? 0 : this.state.volume;
      utterance.pitch = mentor === 'astra' ? 1.08 : 0.95;

      utterance.onend = () => {
        chunkIndex++;
        playNextChunk();
      };
      utterance.onerror = () => {
        this.updateState({ isPlaying: false, isPaused: false, activeId: null });
      };

      window.speechSynthesis.speak(utterance);
    };

    this.updateState({ isPlaying: true, isPaused: false });
    playNextChunk();
  }

  public pause(): void {
    if (this.audio && this.state.isPlaying) {
      this.audio.pause();
      this.updateState({ isPlaying: false, isPaused: true });
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      this.updateState({ isPlaying: false, isPaused: true });
    }
  }

  public resume(): void {
    if (this.audio && this.state.isPaused) {
      this.audio.play();
      this.updateState({ isPlaying: true, isPaused: false });
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
      this.updateState({ isPlaying: true, isPaused: false });
    }
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.updateState({
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      activeId: null,
    });
  }

  public replay(): void {
    if (this.currentId && this.currentText) {
      this.speak(this.currentId, this.currentText, this.state.currentMentor);
    }
  }

  public seek(timeSeconds: number): void {
    if (this.audio && this.state.duration > 0) {
      const clamped = Math.max(0, Math.min(timeSeconds, this.state.duration));
      this.audio.currentTime = clamped;
      this.updateState({ currentTime: clamped });
    }
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(vol, 1.0));
    this.updateState({ volume: clamped, isMuted: clamped === 0 });
    if (this.audio) {
      this.audio.volume = clamped;
    }
  }

  public toggleMute(): void {
    const nextMuted = !this.state.isMuted;
    this.updateState({ isMuted: nextMuted });
    if (this.audio) {
      this.audio.volume = nextMuted ? 0 : this.state.volume;
    }
  }

  public setRate(speed: number): void {
    this.updateState({ rate: speed });
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
  }

  /**
   * Preview a mentor voice before selecting
   */
  public previewVoice(mentor: MentorVoice): void {
    const previewText =
      mentor === 'astra'
        ? "Hello! I am Astra, your AI mentor. I'm here to inspire, guide, and help you master technical concepts with clarity."
        : "Greetings. I'm Orion, your engineering architect. Let's write resilient code, optimize bottlenecks, and conquer complex systems.";
    this.speak(`preview_${mentor}`, previewText, mentor);
  }
}

export const neuralVoice = new NeuralVoiceEngine();
