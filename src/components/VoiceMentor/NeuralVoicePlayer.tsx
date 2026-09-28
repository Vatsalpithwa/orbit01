'use client';

import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { neuralVoice, VoicePlaybackState } from '@/lib/neuralVoice';
import { MentorVoice } from '@/lib/types';

interface NeuralVoicePlayerProps {
  activeMessageId?: string;
  onSelectMentor?: (mentor: MentorVoice) => void;
  compact?: boolean;
}

export default function NeuralVoicePlayer({
  activeMessageId,
  onSelectMentor,
  compact = false,
}: NeuralVoicePlayerProps) {
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>(neuralVoice.getState());

  useEffect(() => {
    const unsubscribe = neuralVoice.subscribe((s) => setVoiceState({ ...s }));
    return unsubscribe;
  }, []);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent =
    voiceState.duration > 0
      ? (voiceState.currentTime / voiceState.duration) * 100
      : 0;

  const isCurrentActive = !activeMessageId || voiceState.activeId === activeMessageId;

  if (!isCurrentActive && compact) {
    return null;
  }

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.92)',
        border: '1px solid rgba(0, 242, 254, 0.25)',
        borderRadius: '12px',
        padding: compact ? '8px 14px' : '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: voiceState.isPlaying ? '#00f2fe' : '#64748b',
              boxShadow: voiceState.isPlaying ? '0 0 10px #00f2fe' : 'none',
              animation: voiceState.isPlaying ? 'pulseGlow 1.5s infinite' : 'none',
            }}
          />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
            Neural Voice: {voiceState.currentMentor === 'astra' ? 'Astra (Natural Female)' : 'Orion (Natural Male)'}
          </span>
          <span style={{ fontSize: '11px', color: '#38bdf8', background: 'rgba(0, 242, 254, 0.12)', padding: '2px 6px', borderRadius: '4px' }}>
            {voiceState.isPlaying ? 'Speaking' : voiceState.isPaused ? 'Paused' : 'Ready'}
          </span>
        </div>

        {/* Speed Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', marginRight: '4px' }}>Speed:</span>
          {[0.8, 1.0, 1.25, 1.5].map((speed) => (
            <button
              key={speed}
              onClick={() => neuralVoice.setRate(speed)}
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                background: voiceState.rate === speed ? '#00f2fe' : 'rgba(255, 255, 255, 0.06)',
                color: voiceState.rate === speed ? '#090e17' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar & Seek Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', minWidth: '32px' }}>
          {formatTime(voiceState.currentTime)}
        </span>

        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min="0"
            max={voiceState.duration || 100}
            step="0.1"
            value={voiceState.currentTime}
            onChange={(e) => neuralVoice.seek(parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: `linear-gradient(to right, #00f2fe ${progressPercent}%, rgba(255, 255, 255, 0.1) ${progressPercent}%)`,
              outline: 'none',
              cursor: 'pointer',
              accentColor: '#00f2fe',
            }}
          />
        </div>

        <span style={{ fontSize: '11px', color: '#94a3b8', minWidth: '32px', textAlign: 'right' }}>
          {voiceState.duration > 0 ? formatTime(voiceState.duration) : '--:--'}
        </span>
      </div>

      {/* Control Buttons & Volume Slider */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Play/Pause */}
          <button
            onClick={() => {
              if (voiceState.isPlaying) {
                neuralVoice.pause();
              } else if (voiceState.isPaused) {
                neuralVoice.resume();
              } else {
                neuralVoice.replay();
              }
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
              color: '#090e17',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.15s',
            }}
            title={voiceState.isPlaying ? 'Pause' : 'Play / Resume'}
          >
            {voiceState.isPlaying ? <Pause size={15} fill="#090e17" /> : <Play size={15} fill="#090e17" />}
          </button>

          {/* Replay */}
          <button
            onClick={() => neuralVoice.replay()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Replay from start"
          >
            <RotateCcw size={14} />
          </button>

          {/* Stop */}
          <button
            onClick={() => neuralVoice.stop()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Stop playback"
          >
            <Square size={13} fill="#cbd5e1" />
          </button>
        </div>

        {/* Volume Slider & Mute Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => neuralVoice.toggleMute()}
            style={{
              background: 'transparent',
              border: 'none',
              color: voiceState.isMuted ? '#f43f5e' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            title={voiceState.isMuted ? 'Unmute' : 'Mute'}
          >
            {voiceState.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={voiceState.isMuted ? 0 : voiceState.volume}
            onChange={(e) => neuralVoice.setVolume(parseFloat(e.target.value))}
            style={{
              width: '80px',
              height: '4px',
              accentColor: '#00f2fe',
              cursor: 'pointer',
            }}
            title={`Volume: ${Math.round((voiceState.isMuted ? 0 : voiceState.volume) * 100)}%`}
          />
          <span style={{ fontSize: '11px', color: '#94a3b8', width: '32px' }}>
            {Math.round((voiceState.isMuted ? 0 : voiceState.volume) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
