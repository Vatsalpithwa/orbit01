'use client';

import React, { useState } from 'react';
import {
  Flame,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  BrainCircuit,
  Code2,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Target,
  BarChart2,
} from 'lucide-react';
import { INITIAL_USER_STATS, INITIAL_BADGES } from '@/lib/sampleData';
import { MentorVoice } from '@/lib/types';
import { soundManager } from '@/lib/audio';
import { useToast } from '@/components/Notification/ToastContext';

interface ScoreboardProps {
  preferredMentor: MentorVoice;
  onNavigateToQuiz?: () => void;
  onNavigateToCodeLab?: () => void;
}

export default function ScoreboardModule({
  preferredMentor,
  onNavigateToQuiz,
  onNavigateToCodeLab,
}: ScoreboardProps) {
  const { showToast } = useToast();
  const [stats, setStats] = useState(INITIAL_USER_STATS);
  const [badges, setBadges] = useState(INITIAL_BADGES);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('daily');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header with Time Horizon Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '24px' }}>Productivity & Learning Scoreboard</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Comprehensive telemetry, cognitive streaks, and AI-driven growth analytics.
          </p>
        </div>

        {/* Horizon Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '4px',
        }}>
          {(['daily', 'weekly', 'monthly', 'all_time'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: timeframe === tf ? 700 : 500,
                background: timeframe === tf ? 'linear-gradient(135deg, #00f2fe, #4facfe)' : 'transparent',
                color: timeframe === tf ? '#060911' : '#94a3b8',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tf.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px',
      }}>
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Total Study Minutes</span>
            <Clock size={18} color="#00f2fe" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff' }}>
            {timeframe === 'daily' ? `${stats.focusMinutesToday}m` : `${stats.totalStudyMinutes}m`}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} />
            <span>+18% from last cycle</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Active Learning Streak</span>
            <Flame size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#f59e0b' }}>
            {stats.streakDays} Days
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            Daily goal: 60 mins/day
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Quiz & Exam Accuracy</span>
            <BrainCircuit size={18} color="#9d4edd" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#9d4edd' }}>
            {stats.averageQuizScore}%
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            Across {stats.quizzesTakenCount} tested assessments
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Sandboxed Code Runs</span>
            <Code2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981' }}>
            {stats.codeRunsCount}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            Python, JS, SQL & C++
          </div>
        </div>
      </div>

      {/* AI Daily Commentary & Personalized Recommendations */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderLeft: '4px solid #00f2fe',
        background: 'linear-gradient(90deg, rgba(0, 242, 254, 0.06), rgba(121, 40, 202, 0.03))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Sparkles size={20} color="#00f2fe" />
          <h3 style={{ fontSize: '17px' }}>
            {preferredMentor === 'astra' ? "Astra's" : "Orion's"} Personalized Daily Analysis & Directive
          </h3>
        </div>
        <p style={{ color: '#cbd5e1', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '16px' }}>
          {preferredMentor === 'astra'
            ? '“You have maintained extraordinary momentum with 8 consecutive days of practice! Your mastery of TypeScript type generics and system design is shining. Today, I recommend dedicating 20 minutes to solidify SQL window functions and B-Tree index scan patterns.”'
            : '“Solid engineering consistency observed across worker queues and container configurations. Your p99 quiz score is 92.4%. Primary area of vulnerability: SQL query planner joins under high concurrency. Tackle 1 practice set today before advancing.”'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => {
              if (onNavigateToQuiz) onNavigateToQuiz();
              showToast('Launching recommended SQL practice quiz...', 'info');
            }}
            className="gradient-btn-primary"
            style={{ fontSize: '13px', padding: '8px 18px' }}
          >
            <BrainCircuit size={15} />
            <span>Practice Recommended Quiz (SQL & Indexing)</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateToCodeLab) onNavigateToCodeLab();
              showToast('Opening Code Lab workspace...', 'info');
            }}
            className="gradient-btn-secondary"
            style={{ fontSize: '13px', padding: '8px 18px' }}
          >
            <Code2 size={15} />
            <span>Run Python Vector Cosine Lab</span>
          </button>
        </div>
      </div>

      {/* Two Column Grid: Strengths vs Weaknesses & Weekly Activity Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Strengths & Weak Areas Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '18px' }}>Cognitive Skill Profile</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Strongest */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                <CheckCircle2 size={16} />
                <span>TOP STRENGTH (98% MASTERY)</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>
                {stats.strongestTopic}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                Exceptional understanding of asynchronous state channels, conditional types, and scalable architecture.
              </div>
            </div>

            {/* Area to improve */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                <AlertTriangle size={16} />
                <span>AREA NEEDING FOCUS (74% ACCURACY)</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>
                {stats.areaToImprove}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                Review OVER (PARTITION BY) constructs and composite B-tree leftmost prefix rules.
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Productivity Velocity Bar Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px' }}>Weekly Focus Velocity</h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Minutes per Day</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: '180px',
            paddingTop: '20px',
            paddingBottom: '10px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            {stats.weeklyActivity.map((day) => {
              const heightPercent = Math.min((day.minutes / 140) * 100, 100);
              return (
                <div
                  key={day.day}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    flex: 1,
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#00f2fe', fontWeight: 700 }}>
                    {day.minutes}m
                  </span>
                  <div
                    style={{
                      width: '28px',
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(180deg, #00f2fe 0%, #7928ca 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease',
                    }}
                    title={`${day.day}: ${day.minutes} minutes`}
                  />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GitHub-style 365-Day Activity Heatmap */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px' }}>Study & Practice Heatmap (Past 120 Days)</h3>
            <p style={{ color: '#94a3b8', fontSize: '12.5px' }}>
              Every active coding session, quiz submission, and focused Pomodoro sprint logged.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
            <span>Less</span>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(0, 242, 254, 0.3)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(0, 242, 254, 0.65)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#00f2fe' }} />
            <span>More</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateRows: 'repeat(7, 14px)',
          gap: '4px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}>
          {stats.heatMapData.map((d, idx) => {
            const bg =
              d.count === 0 ? 'rgba(255,255,255,0.05)' :
              d.count <= 2 ? 'rgba(0, 242, 254, 0.3)' :
              d.count <= 5 ? 'rgba(0, 242, 254, 0.65)' : '#00f2fe';

            return (
              <div
                key={idx}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  background: bg,
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                }}
                title={`${d.date}: ${d.count} productive actions`}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            );
          })}
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Mastery Badges & Milestones</h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          {badges.map((b) => {
            const isUnlocked = b.progress >= 100;
            return (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: isUnlocked ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: isUnlocked ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                  opacity: isUnlocked ? 1 : 0.7,
                }}
              >
                <div style={{
                  fontSize: '28px',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: isUnlocked ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {b.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: isUnlocked ? '#fff' : '#94a3b8' }}>
                      {b.title}
                    </span>
                    {isUnlocked && <CheckCircle2 size={15} color="#10b981" />}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {b.description}
                  </div>
                  {!isUnlocked && (
                    <div style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      marginTop: '8px',
                      overflow: 'hidden',
                    }}>
                      <div style={{ width: `${b.progress}%`, height: '100%', background: '#00f2fe' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
