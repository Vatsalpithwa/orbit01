'use client';

import React, { useState, useEffect } from 'react';
import Sidebar, { NavTab } from '@/components/Navigation/Sidebar';
import TopBar from '@/components/Navigation/TopBar';
import CommandPalette from '@/components/CommandPalette/CommandPalette';
import ProfileSettingsModal from '@/components/Profile/ProfileSettingsModal';
import OnboardingModal from '@/components/Profile/OnboardingModal';

// Modules
import ChatModule from '@/components/Chat/ChatModule';
import TaskManager from '@/components/Tasks/TaskManager';
import ScoreboardModule from '@/components/Dashboard/ScoreboardModule';
import QuizModule from '@/components/Quiz/QuizModule';
import VoiceMentorModule from '@/components/VoiceMentor/VoiceMentorModule';
import CodeLabModule from '@/components/CodeLab/CodeLabModule';
import ExamModule from '@/components/Exams/ExamModule';
import RoadmapModule from '@/components/Roadmap/RoadmapModule';
import TechNewsModule from '@/components/News/TechNewsModule';
import Globe3DModule from '@/components/Globe/Globe3DModule';

import { UserProfile, MentorVoice, ExplanationLevel } from '@/lib/types';
import { getCurrentUserProfile, DEFAULT_DEMO_USER } from '@/lib/supabase';
import { useToast } from '@/components/Notification/ToastContext';

export default function DashboardPage() {
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<NavTab>('chat');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_DEMO_USER);
  const [preferredMentor, setPreferredMentor] = useState<MentorVoice>('astra');
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>('intermediate');
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Load user session on mount
  useEffect(() => {
    async function loadUser() {
      const profile = await getCurrentUserProfile();
      if (profile) {
        setCurrentUser(profile);
        setPreferredMentor(profile.preferredMentor || 'astra');
        setExplanationLevel(profile.skillLevel || 'intermediate');
      }

      // Check onboarding state
      if (typeof window !== 'undefined') {
        const completed = localStorage.getItem('orbit_onboarding_completed');
        if (!completed) {
          setIsOnboardingOpen(true);
        }
      }
    }
    loadUser();
  }, []);

  const tabTitles: Record<NavTab, string> = {
    chat: 'AI Chatbot & Vision Assistant',
    tasks: 'Daily Task Manager & Pomodoro Focus Timer',
    dashboard: 'Performance Scoreboard & Telemetry',
    quiz: 'Adaptive Quiz Generator & Practice',
    voice: 'Voice Mentors Stage (Astra & Orion)',
    codelab: 'Multi-Language Sandboxed Code Lab',
    exams: 'Timed Technical Certification Exams',
    roadmap: 'Personalized Career Roadmap & Milestones',
    news: 'Daily Frontier Tech & Research News',
    globe: '3D Interactive Frontier Tech Globe',
    profile: 'Profile & Settings',
  };

  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'profile') {
      setIsProfileModalOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        collapsed={collapsedSidebar}
        onToggleCollapse={() => setCollapsedSidebar(!collapsedSidebar)}
        user={currentUser}
      />

      {/* Main App Canvas */}
      <div className="app-main">
        {/* TopBar */}
        <TopBar
          currentTabTitle={tabTitles[currentTab]}
          user={currentUser}
          preferredMentor={preferredMentor}
          onSelectMentor={setPreferredMentor}
          explanationLevel={explanationLevel}
          onSelectLevel={setExplanationLevel}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          audioMuted={audioMuted}
          onToggleAudioMute={() => {
            const next = !audioMuted;
            setAudioMuted(next);
            showToast(next ? 'Audio Chimes muted' : 'Audio Chimes unmuted', 'info');
          }}
        />

        {/* Dynamic Tab Body */}
        <main className="app-content">
          {currentTab === 'chat' && (
            <ChatModule
              preferredMentor={preferredMentor}
              explanationLevel={explanationLevel}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'tasks' && <TaskManager />}

          {currentTab === 'dashboard' && (
            <ScoreboardModule
              preferredMentor={preferredMentor}
              onNavigateToQuiz={() => setCurrentTab('quiz')}
              onNavigateToCodeLab={() => setCurrentTab('codelab')}
            />
          )}

          {currentTab === 'quiz' && <QuizModule />}

          {currentTab === 'voice' && (
            <VoiceMentorModule
              preferredMentor={preferredMentor}
              onSelectMentor={setPreferredMentor}
            />
          )}

          {currentTab === 'codelab' && (
            <CodeLabModule preferredMentor={preferredMentor} />
          )}

          {currentTab === 'exams' && (
            <ExamModule preferredMentor={preferredMentor} />
          )}

          {currentTab === 'roadmap' && (
            <RoadmapModule preferredMentor={preferredMentor} />
          )}

          {currentTab === 'news' && (
            <TechNewsModule preferredMentor={preferredMentor} />
          )}

          {currentTab === 'globe' && <Globe3DModule />}
        </main>
      </div>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onSelectMentor={setPreferredMentor}
        onStartTimer={() => setCurrentTab('tasks')}
      />

      {/* Profile & Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onUserUpdated={(updated) => {
          setCurrentUser(updated);
          setPreferredMentor(updated.preferredMentor);
          setExplanationLevel(updated.skillLevel);
        }}
        onSignOut={() => {
          setCurrentUser(DEFAULT_DEMO_USER);
        }}
      />

      {/* First-Time Secure Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        currentUser={currentUser}
        onComplete={(updated) => {
          setCurrentUser(updated);
          setPreferredMentor(updated.preferredMentor);
          setExplanationLevel(updated.skillLevel);
          setIsOnboardingOpen(false);
        }}
      />
    </div>
  );
}
