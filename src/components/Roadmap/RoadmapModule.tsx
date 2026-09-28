'use client';

import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  ExternalLink,
  BookOpen,
  Award,
  Sparkles,
  HelpCircle,
  Plus,
  Edit2,
  Calendar,
} from 'lucide-react';
import { CareerRoadmap, RoadmapPhase, RoadmapMilestone, MentorVoice } from '@/lib/types';
import { INITIAL_ROADMAPS } from '@/lib/sampleData';
import { soundManager } from '@/lib/audio';
import { useToast } from '@/components/Notification/ToastContext';

interface RoadmapProps {
  preferredMentor: MentorVoice;
}

export default function RoadmapModule({ preferredMentor }: RoadmapProps) {
  const { showToast } = useToast();

  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>(INITIAL_ROADMAPS);
  const [activeRoadmapId, setActiveRoadmapId] = useState<string>(INITIAL_ROADMAPS[0].id);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const activeRoadmap = roadmaps.find((r) => r.id === activeRoadmapId) || roadmaps[0];

  // Toggle milestone completion
  const handleToggleMilestone = (phaseId: string, milestoneId: string) => {
    setRoadmaps((prev) =>
      prev.map((rm) => {
        if (rm.id !== activeRoadmapId) return rm;

        let totalMilestones = 0;
        let completedCount = 0;

        const updatedPhases = rm.phases.map((ph) => {
          const updatedMilestones = ph.milestones.map((m) => {
            const isTarget = ph.id === phaseId && m.id === milestoneId;
            const completed = isTarget ? !m.completed : m.completed;
            if (completed) completedCount++;
            totalMilestones++;
            if (isTarget && completed) {
              soundManager.playAchievementChime();
              showToast(`Milestone completed: "${m.title}"! Progress updated.`, 'success');
            }
            return isTarget ? { ...m, completed } : m;
          });
          return { ...ph, milestones: updatedMilestones };
        });

        const newPercent = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;
        return { ...rm, phases: updatedPhases, progressPercent: newPercent };
      })
    );
  };

  // Generate new custom role roadmap
  const handleCreateCustomRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoleInput.trim()) return;

    setIsGenerating(true);
    showToast(`Generating custom curriculum for "${customRoleInput.trim()}"...`, 'info');

    setTimeout(() => {
      const newRoadmap: CareerRoadmap = {
        id: `rm_${Date.now()}`,
        careerRole: customRoleInput.trim(),
        targetDate: '2026-12-31',
        progressPercent: 0,
        updatedAt: new Date().toISOString(),
        phases: [
          {
            id: 'p_custom_1',
            name: 'Phase 1: Core Fundamentals & Systems Primitives',
            description: `Essential theory, tools, and paradigms required for ${customRoleInput.trim()}.`,
            milestones: [
              {
                id: 'm_c_1',
                title: `Master ${customRoleInput.trim()} Foundations & Best Practices`,
                description: 'Build working command of core terminology, lifecycles, and architecture.',
                completed: false,
                resources: [
                  { name: 'Comprehensive Architecture Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'doc' },
                ],
                interviewQuestions: [
                  `What are the most common performance bottlenecks in modern ${customRoleInput.trim()} environments?`,
                ],
              },
            ],
          },
          {
            id: 'p_custom_2',
            name: 'Phase 2: Production Scale & Enterprise Delivery',
            description: 'Scalability, reliability, security policies, and performance tuning.',
            milestones: [
              {
                id: 'm_c_2',
                title: 'Deploy an End-to-End Capstone with Automated CI/CD',
                description: 'Implement automated integration testing, monitoring telemetry, and containerization.',
                completed: false,
                resources: [{ name: 'Production Checklist Guide', url: 'https://12factor.net/', type: 'doc' }],
                interviewQuestions: [
                  'How do you handle zero-downtime blue/green rollbacks under high traffic spikes?',
                ],
              },
            ],
          },
        ],
      };

      setRoadmaps([newRoadmap, ...roadmaps]);
      setActiveRoadmapId(newRoadmap.id);
      setCustomRoleInput('');
      setIsGenerating(false);
      showToast('Personalized Career Roadmap generated!', 'success');
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '24px' }}>Personalized Career Roadmap</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Structured, milestone-driven technical path from junior foundations to Staff / Principal engineering.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {roadmaps.map((rm) => (
            <button
              key={rm.id}
              onClick={() => setActiveRoadmapId(rm.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeRoadmapId === rm.id ? 700 : 500,
                background: activeRoadmapId === rm.id ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: activeRoadmapId === rm.id ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                color: activeRoadmapId === rm.id ? '#00f2fe' : '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              {rm.careerRole}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Progress Card */}
      <div className="glass-panel" style={{
        padding: '28px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08), rgba(121, 40, 202, 0.05))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="badge-pill badge-purple" style={{ marginBottom: '6px' }}>
              TARGET CAREER DIRECTIVE
            </span>
            <h3 style={{ fontSize: '22px', marginTop: '4px' }}>{activeRoadmap.careerRole}</h3>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#00f2fe' }}>
              {activeRoadmap.progressPercent}%
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Overall Milestone Completion</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          borderRadius: '4px',
          background: 'rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${activeRoadmap.progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #00f2fe, #9d4edd)',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Roadmap Phased Milestones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activeRoadmap.phases.map((phase, pIdx) => (
          <div key={phase.id} className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(0, 242, 254, 0.15)',
                color: '#00f2fe',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {pIdx + 1}
              </div>
              <h3 style={{ fontSize: '18px' }}>{phase.name}</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', marginBottom: '20px', marginLeft: '38px' }}>
              {phase.description}
            </p>

            {/* Milestones list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginLeft: '38px' }}>
              {phase.milestones.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    background: m.completed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: m.completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <button
                      onClick={() => handleToggleMilestone(phase.id, m.id)}
                      style={{
                        color: m.completed ? '#10b981' : '#64748b',
                        cursor: 'pointer',
                        marginTop: '2px',
                      }}
                    >
                      {m.completed ? <CheckCircle2 size={20} color="#10b981" /> : <Circle size={20} />}
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: m.completed ? '#cbd5e1' : '#f8fafc',
                        textDecoration: m.completed ? 'line-through' : 'none',
                      }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                        {m.description}
                      </div>

                      {/* Curated Resources */}
                      {m.resources && m.resources.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                          {m.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                background: 'rgba(0, 242, 254, 0.08)',
                                color: '#00f2fe',
                                border: '1px solid rgba(0, 242, 254, 0.2)',
                              }}
                            >
                              <BookOpen size={12} />
                              <span>{res.name}</span>
                              <ExternalLink size={10} />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Interview Questions */}
                      {m.interviewQuestions && m.interviewQuestions.length > 0 && (
                        <div style={{
                          marginTop: '12px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.25)',
                          fontSize: '12.5px',
                          color: '#e2e8f0',
                        }}>
                          <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <HelpCircle size={14} />
                            <span>Staff / Senior Interview Questions:</span>
                          </div>
                          <ul style={{ marginLeft: '18px', color: '#94a3b8' }}>
                            {m.interviewQuestions.map((iq, iIdx) => (
                              <li key={iIdx}>{iq}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Career Role Generator Form */}
      <form onSubmit={handleCreateCustomRoadmap} className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Build Custom Career Roadmap</h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '14px' }}>
          Targeting a specific niche like Web3 Cryptography, Quantum Algorithms, or Bioinformatics? Generate a personalized track.
        </p>

        <div style={{ display: 'flex', gap: '12px', maxWidth: '600px' }}>
          <input
            type="text"
            placeholder="e.g. Distributed Database Engineer, AI Security Auditor"
            value={customRoleInput}
            onChange={(e) => setCustomRoleInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="gradient-btn-primary"
            style={{ padding: '10px 20px', fontSize: '13px' }}
          >
            <Sparkles size={16} />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate Roadmap'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
