'use client';

import React from 'react';
import {
  Search,
  Flame,
  Volume2,
  VolumeX,
  Bell,
  Command,
  Sparkles,
  Bot,
  User,
} from 'lucide-react';
import { UserProfile, MentorVoice, ExplanationLevel } from '@/lib/types';
import { useToast } from '@/components/Notification/ToastContext';
import { neuralVoice } from '@/lib/neuralVoice';

interface TopBarProps {
  currentTabTitle: string;
  user: UserProfile | null;
  preferredMentor: MentorVoice;
  onSelectMentor: (mentor: MentorVoice) => void;
  explanationLevel: ExplanationLevel;
  onSelectLevel: (level: ExplanationLevel) => void;
  onOpenCommandPalette: () => void;
  onOpenProfile: () => void;
  audioMuted: boolean;
  onToggleAudioMute: () => void;
}

export default function TopBar({
  currentTabTitle,
  user,
  preferredMentor,
  onSelectMentor,
  explanationLevel,
  onSelectLevel,
  onOpenCommandPalette,
  onOpenProfile,
  audioMuted,
  onToggleAudioMute,
}: TopBarProps) {
  const { showToast } = useToast();

  return (
    <header style={{
      height: 'var(--header-height)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(10, 15, 28, 0.8)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      flexShrink: 0,
    }}>
      {/* Left: Tab Title & Command Search Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
          {currentTabTitle}
        </h2>

        {/* Global Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: '8px',
            padding: '7px 14px',
            color: '#94a3b8',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          title="Search commands, switch tabs, or start actions"
        >
          <Search size={14} color="#00f2fe" />
          <span>Quick actions & search...</span>
          <span style={{
            fontSize: '11px',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: '#cbd5e1',
            fontFamily: 'var(--font-mono)',
          }}>
            Ctrl+K
          </span>
        </button>
      </div>

      {/* Right Controls: Mentor Switcher, Level Selector, Streak, Audio, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Mentor Voice Persona Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(17, 26, 46, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: '8px',
          padding: '3px',
        }}>
          <button
            onClick={() => {
              onSelectMentor('astra');
              showToast('Active Mentor: Astra (Female, Inspiring & Structured)', 'info');
            }}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: preferredMentor === 'astra' ? 700 : 500,
              background: preferredMentor === 'astra' ? 'linear-gradient(135deg, #00f2fe, #4facfe)' : 'transparent',
              color: preferredMentor === 'astra' ? '#060911' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Sparkles size={13} />
            <span>Astra</span>
          </button>
          <button
            onClick={() => {
              onSelectMentor('orion');
              showToast('Active Mentor: Orion (Male, Systems & Pragmatic)', 'info');
            }}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: preferredMentor === 'orion' ? 700 : 500,
              background: preferredMentor === 'orion' ? 'linear-gradient(135deg, #9d4edd, #7928ca)' : 'transparent',
              color: preferredMentor === 'orion' ? '#fff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Bot size={13} />
            <span>Orion</span>
          </button>

          {/* Voice Preview Button */}
          <button
            onClick={() => neuralVoice.previewVoice(preferredMentor)}
            style={{
              padding: '4px 6px',
              background: 'transparent',
              border: 'none',
              color: '#00f2fe',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title={`Preview ${preferredMentor === 'astra' ? "Astra's" : "Orion's"} Neural Voice`}
          >
            <Volume2 size={13} />
          </button>
        </div>

        {/* Explanation Level Selector */}
        <select
          value={explanationLevel}
          onChange={(e) => {
            const lvl = e.target.value as ExplanationLevel;
            onSelectLevel(lvl);
            showToast(`Explanation Level set to: ${lvl.toUpperCase()}`, 'info');
          }}
          style={{
            background: 'rgba(17, 26, 46, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '12px',
            color: '#cbd5e1',
            cursor: 'pointer',
          }}
        >
          <option value="beginner">Beginner Depth</option>
          <option value="intermediate">Intermediate Depth</option>
          <option value="expert">Expert / Architectural Depth</option>
        </select>

        {/* Learning Streak Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          padding: '6px 12px',
          color: '#f59e0b',
          fontSize: '12.5px',
          fontWeight: 700,
        }}>
          <Flame size={15} />
          <span>8 Days Streak</span>
        </div>

        {/* Audio Chime Mute Toggle */}
        <button
          onClick={onToggleAudioMute}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: audioMuted ? '#f43f5e' : '#00f2fe',
            cursor: 'pointer',
          }}
          title={audioMuted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
        >
          {audioMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        {/* Profile Avatar Button */}
        <button
          onClick={onOpenProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            borderRadius: '8px',
            padding: '4px 10px 4px 6px',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#1e293b',
          }}>
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={16} color="#00f2fe" style={{ margin: '6px auto' }} />
            )}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
            {user?.fullName?.split(' ')[0] || 'Profile'}
          </span>
        </button>
      </div>
    </header>
  );
}
