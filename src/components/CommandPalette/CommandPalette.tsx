'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MessageSquare,
  CheckSquare,
  LayoutDashboard,
  BrainCircuit,
  Mic,
  Code2,
  GraduationCap,
  Compass,
  Newspaper,
  Globe2,
  Sparkles,
  Bot,
  Play,
  X,
} from 'lucide-react';
import { NavTab } from '../Navigation/Sidebar';
import { MentorVoice } from '@/lib/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onSelectMentor: (mentor: MentorVoice) => void;
  onStartTimer?: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onSelectMentor,
  onStartTimer,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent will toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'nav-chat', label: 'Go to AI Chatbot', icon: <MessageSquare size={17} color="#00f2fe" />, action: () => onNavigate('chat') },
    { id: 'nav-tasks', label: 'Go to Tasks & Focus Timer', icon: <CheckSquare size={17} color="#f59e0b" />, action: () => onNavigate('tasks') },
    { id: 'nav-dash', label: 'Go to Scoreboard & Metrics', icon: <LayoutDashboard size={17} color="#10b981" />, action: () => onNavigate('dashboard') },
    { id: 'nav-quiz', label: 'Generate New AI Quiz', icon: <BrainCircuit size={17} color="#9d4edd" />, action: () => onNavigate('quiz') },
    { id: 'nav-voice', label: 'Open Voice Mentor Stage', icon: <Mic size={17} color="#00f2fe" />, action: () => onNavigate('voice') },
    { id: 'nav-codelab', label: 'Open Multi-Language Code Lab', icon: <Code2 size={17} color="#10b981" />, action: () => onNavigate('codelab') },
    { id: 'nav-exams', label: 'Start Timed Certification Exam', icon: <GraduationCap size={17} color="#38bdf8" />, action: () => onNavigate('exams') },
    { id: 'nav-roadmap', label: 'View Career Roadmap', icon: <Compass size={17} color="#c77dff" />, action: () => onNavigate('roadmap') },
    { id: 'nav-news', label: 'Read Fresh Tech News', icon: <Newspaper size={17} color="#f59e0b" />, action: () => onNavigate('news') },
    { id: 'nav-globe', label: 'Explore 3D Innovation Globe', icon: <Globe2 size={17} color="#00f2fe" />, action: () => onNavigate('globe') },
    { id: 'act-timer', label: 'Quick Action: Start 25-Min Pomodoro Sprint', icon: <Play size={17} color="#10b981" />, action: () => { onNavigate('tasks'); if (onStartTimer) onStartTimer(); } },
    { id: 'act-astra', label: 'Switch Active Mentor to Astra (Female)', icon: <Sparkles size={17} color="#00f2fe" />, action: () => onSelectMentor('astra') },
    { id: 'act-orion', label: 'Switch Active Mentor to Orion (Male)', icon: <Bot size={17} color="#9d4edd" />, action: () => onSelectMentor('orion') },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '620px',
          background: '#0d1322',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0, 242, 254, 0.15)',
          overflow: 'hidden',
          animation: 'scaleIn 0.18s ease-out',
        }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <Search size={20} color="#00f2fe" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page name, or quick action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '16px',
              padding: 0,
              boxShadow: 'none',
            }}
          />
          <button
            onClick={onClose}
            style={{ color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div style={{
          maxHeight: '380px',
          overflowY: 'auto',
          padding: '10px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
              No matching commands found.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  textAlign: 'left',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  cursor: 'pointer',
                  background: 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 242, 254, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div>{item.icon}</div>
                <span style={{ flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>Jump</span>
              </button>
            ))
          )}
        </div>

        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#64748b',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div>Press <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: '4px' }}>Esc</kbd> to exit</div>
          <div>Orbit Command Engine</div>
        </div>
      </div>
    </div>
  );
}
