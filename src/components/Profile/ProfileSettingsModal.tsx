'use client';

import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Bot,
  ShieldCheck,
  LogOut,
  Save,
  Volume2,
  Bell,
  Clock,
  Target,
  Database,
  X,
} from 'lucide-react';
import { UserProfile, MentorVoice, ExplanationLevel } from '@/lib/types';
import { updateUserProfile, signOutUser, isSupabaseConfigured } from '@/lib/supabase';
import { soundManager } from '@/lib/audio';
import { useToast } from '@/components/Notification/ToastContext';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUserUpdated: (user: UserProfile) => void;
  onSignOut: () => void;
}

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  onSignOut,
}: ProfileSettingsModalProps) {
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || 'Alex Chen');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [preferredMentor, setPreferredMentor] = useState<MentorVoice>(user?.preferredMentor || 'astra');
  const [careerGoal, setCareerGoal] = useState(user?.careerGoal || 'Principal AI Systems Architect');
  const [skillLevel, setSkillLevel] = useState<ExplanationLevel>(user?.skillLevel || 'intermediate');
  const [dailyFocusTarget, setDailyFocusTarget] = useState(user?.dailyFocusTargetMinutes || 60);
  const [audioChimes, setAudioChimes] = useState(user?.studyPreferences.audioChimes ?? true);
  const [dailyReminder, setDailyReminder] = useState(user?.studyPreferences.dailyReminder ?? true);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updated = await updateUserProfile({
        fullName,
        avatarUrl,
        preferredMentor,
        careerGoal,
        skillLevel,
        dailyFocusTargetMinutes: Number(dailyFocusTarget),
        studyPreferences: {
          audioChimes,
          dailyReminder,
          darkTheme: true,
        },
      });

      onUserUpdated(updated);
      soundManager.playAchievementChime();
      showToast('Profile and study preferences updated successfully!', 'success');
      onClose();
    } catch (err: any) {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOutClick = async () => {
    await signOutUser();
    showToast('Signed out successfully', 'info');
    onSignOut();
    onClose();
  };

  const hasSupabase = isSupabaseConfigured();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '20px',
        padding: '28px',
        position: 'relative',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '22px', marginBottom: '6px' }}>Learner Profile & Preferences</h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>
          Configured with Google OAuth security. Your data is isolated with PostgreSQL Row-Level Security.
        </p>

        {/* Database Connection Status Banner */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: hasSupabase ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 242, 254, 0.08)',
          border: `1px solid ${hasSupabase ? '#10b981' : '#00f2fe'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          fontSize: '13px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color={hasSupabase ? '#10b981' : '#00f2fe'} />
            <span>
              {hasSupabase
                ? 'Connected to Live Supabase Cloud Database'
                : 'Running in Local Encrypted Session Mode (100% Functional)'}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            {hasSupabase ? 'Cloud Sync: Active' : 'Offline Ready'}
          </span>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Name & Avatar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12.5px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12.5px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Career Goal */}
          <div>
            <label style={{ fontSize: '12.5px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Target Career Role / Learning Goal
            </label>
            <input
              type="text"
              required
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Preferred Mentor & Skill Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12.5px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Preferred AI Voice Mentor
              </label>
              <select
                value={preferredMentor}
                onChange={(e) => setPreferredMentor(e.target.value as MentorVoice)}
                style={{ width: '100%' }}
              >
                <option value="astra">Astra (Female Voice • Inspiring & Structured)</option>
                <option value="orion">Orion (Male Voice • Systems Architect & Pragmatic)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Current Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as ExplanationLevel)}
                style={{ width: '100%' }}
              >
                <option value="beginner">Beginner (Analogies & Foundations)</option>
                <option value="intermediate">Intermediate (Production Patterns)</option>
                <option value="expert">Expert (Low-Level Systems & Internals)</option>
              </select>
            </div>
          </div>

          {/* Daily Focus Target */}
          <div>
            <label style={{ fontSize: '12.5px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Daily Study & Focus Target (Minutes)
            </label>
            <input
              type="number"
              min="15"
              max="360"
              value={dailyFocusTarget}
              onChange={(e) => setDailyFocusTarget(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Toggle Switches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="audio_chimes"
                checked={audioChimes}
                onChange={(e) => setAudioChimes(e.target.checked)}
              />
              <label htmlFor="audio_chimes" style={{ fontSize: '13px', color: '#cbd5e1' }}>
                Enable Web Audio Synthesized Chimes on Timer & Achievements
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="daily_reminders"
                checked={dailyReminder}
                onChange={(e) => setDailyReminder(e.target.checked)}
              />
              <label htmlFor="daily_reminders" style={{ fontSize: '13px', color: '#cbd5e1' }}>
                Enable In-App Daily Goal Notifications & Streak Alerts
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '20px',
            marginTop: '10px',
          }}>
            <button
              type="button"
              onClick={handleSignOutClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#f43f5e',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
              <span>Sign Out Session</span>
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                className="gradient-btn-secondary"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="gradient-btn-primary"
                style={{ padding: '8px 22px', fontSize: '13px' }}
              >
                <Save size={15} />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
