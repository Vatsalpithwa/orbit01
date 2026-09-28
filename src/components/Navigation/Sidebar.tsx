'use client';

import React from 'react';
import {
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
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '@/lib/types';

export type NavTab = 
  | 'chat'
  | 'tasks'
  | 'dashboard'
  | 'quiz'
  | 'voice'
  | 'codelab'
  | 'exams'
  | 'roadmap'
  | 'news'
  | 'globe'
  | 'profile';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  user: UserProfile | null;
}

export default function Sidebar({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  user,
}: SidebarProps) {
  const navItems = [
    { id: 'chat' as NavTab, label: 'AI Chatbot', icon: <MessageSquare size={19} />, badge: 'Stream' },
    { id: 'tasks' as NavTab, label: 'Tasks & Focus', icon: <CheckSquare size={19} /> },
    { id: 'dashboard' as NavTab, label: 'Scoreboard', icon: <LayoutDashboard size={19} /> },
    { id: 'quiz' as NavTab, label: 'Quiz Generator', icon: <BrainCircuit size={19} /> },
    { id: 'voice' as NavTab, label: 'Voice Mentors', icon: <Mic size={19} />, badge: 'Audio' },
    { id: 'codelab' as NavTab, label: 'Code Lab', icon: <Code2 size={19} /> },
    { id: 'exams' as NavTab, label: 'Timed Exams', icon: <GraduationCap size={19} /> },
    { id: 'roadmap' as NavTab, label: 'Career Roadmap', icon: <Compass size={19} /> },
    { id: 'news' as NavTab, label: 'Tech News', icon: <Newspaper size={19} /> },
    { id: 'globe' as NavTab, label: '3D Tech Globe', icon: <Globe2 size={19} />, badge: '3D' },
    { id: 'profile' as NavTab, label: 'Profile & Settings', icon: <Settings size={19} /> },
  ];

  return (
    <aside style={{
      width: collapsed ? '76px' : '260px',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'rgba(10, 15, 28, 0.95)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'relative',
      zIndex: 40,
      flexShrink: 0,
      backdropFilter: 'blur(20px)',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f2fe, #7928ca)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)',
            flexShrink: 0,
          }}>
            <Sparkles size={20} color="#060911" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '17px', color: '#fff', letterSpacing: '-0.02em' }}>
                Orbit Mentor <span style={{ color: '#00f2fe' }}>AI</span>
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.04em' }}>
                v3.0 ENTERPRISE
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        style={{
          position: 'absolute',
          right: '-13px',
          top: '26px',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: '#111a2e',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          zIndex: 50,
          cursor: 'pointer',
        }}
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px 0' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '10px',
                background: isActive 
                  ? 'linear-gradient(90deg, rgba(0, 242, 254, 0.15), rgba(121, 40, 202, 0.08))' 
                  : 'transparent',
                border: isActive ? '1px solid rgba(0, 242, 254, 0.35)' : '1px solid transparent',
                color: isActive ? '#00f2fe' : '#94a3b8',
                fontWeight: isActive ? 600 : 400,
                fontSize: '13.5px',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              title={collapsed ? item.label : undefined}
            >
              <div style={{ color: isActive ? '#00f2fe' : '#94a3b8' }}>
                {item.icon}
              </div>

              {!collapsed && (
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge && (
                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'rgba(0, 242, 254, 0.15)',
                  color: '#00f2fe',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div style={{
        padding: collapsed ? '14px 0' : '14px 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: '10px',
        background: 'rgba(6, 9, 17, 0.6)',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#1e293b',
          border: '1.5px solid #00f2fe',
          flexShrink: 0,
        }}>
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2fe', fontWeight: 'bold', fontSize: '13px' }}>
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          )}
        </div>

        {!collapsed && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName || 'Active Learner'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span>Mentor: {user?.preferredMentor === 'orion' ? 'Orion (Male)' : 'Astra (Female)'}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
